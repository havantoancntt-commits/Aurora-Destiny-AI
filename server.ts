// ==========================================
// AURORA DESTINY AI — PRODUCTION FULL-STACK SERVER
// Hardened Architecture, Security, Durability & Deterministic Integrity
// ==========================================

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { ZodError } from 'zod';

import { repository } from './src/db/repository';
import {
  authMiddleware,
  requireAuth,
  requireAdmin,
  verifyProfileOwnership,
  registerUser,
  loginUser,
  createGuestSession,
  revokeSession,
  bootstrapAdminIfConfigured
} from './src/server/auth';
import {
  loginRateLimiter,
  registerRateLimiter,
  guestRateLimiter,
  aiChatRateLimiter,
  scenarioRateLimiter,
  calculationRateLimiter,
  adminRateLimiter
} from './src/server/rateLimiter';
import {
  ProfileCreateSchema,
  ProfileUpdateSchema,
  HistoricalEventSchema,
  AiChatSchema,
  ScenarioEvaluateSchema,
  UserPreferencesSchema,
  FeatureFlagToggleSchema,
  RegisterSchema,
  LoginSchema
} from './src/schemas/validationSchemas';

import { runFullDestinyCalculation, CALCULATION_ENGINE_VERSION, ASTROLOGY_RULES_VERSION, ANALYSIS_MODEL_VERSION } from './src/engine/destinyEngine';
import { runBacktestAnalysis } from './src/engine/backtesting';
import { evaluateWhatIfScenario } from './src/engine/scenarios';
import { generateMultiAgentEnsemble, computeDailyDestiny } from './src/services/aiSynthesizer';
import { generateDestinyChatResponse, isCircuitBreakerOpen } from './src/services/geminiService';
import { UserProfile } from './src/types/user';

const app = express();
const PORT = 3000;

// Security: parse JSON with strict size limit
app.use(express.json({ limit: '2mb' }));

// ----------------------------------------------------
// MIDDLEWARE: REQUEST TRACING & SECURITY HEADERS
// ----------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  req.requestId = reqId;
  res.setHeader('X-Request-Id', reqId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Authentication middleware extracts user from bearer token or x-session-token
app.use(authMiddleware);

// Dynamic Bootstrap Admin account if ADMIN_EMAIL & ADMIN_PASSWORD are provided
bootstrapAdminIfConfigured();

// Clean up expired sessions on startup
repository.cleanupExpiredSessions();

// ----------------------------------------------------
// 1. HEALTH & OBSERVABILITY (LIVENESS, READINESS & DIAGNOSTICS)
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  const integrity = repository.verifyDatabaseIntegrity();
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const circuitOpen = isCircuitBreakerOpen();

  const isHealthy = integrity.valid;
  const status = isHealthy ? (hasGeminiKey && !circuitOpen ? 'ok' : 'degraded') : 'error';

  res.status(isHealthy ? 200 : 503).json({
    status,
    app: 'Aurora Destiny AI',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    checks: {
      application: { status: 'pass' },
      database: {
        status: integrity.valid ? 'pass' : 'fail',
        storageMode: 'durable_atomic_file_adapter',
        integrityErrors: integrity.errors
      },
      ai: {
        status: hasGeminiKey ? (circuitOpen ? 'circuit_open_fallback_active' : 'pass') : 'unconfigured_deterministic_fallback_active',
        provider: 'google_genai'
      },
      configuration: { status: 'pass' }
    },
    engine: {
      calculationVersion: CALCULATION_ENGINE_VERSION,
      astrologyRulesVersion: ASTROLOGY_RULES_VERSION,
      analysisModelVersion: ANALYSIS_MODEL_VERSION
    }
  });
});

app.get('/api/health/live', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/health/ready', (req, res) => {
  const integrity = repository.verifyDatabaseIntegrity();
  if (integrity.valid) {
    res.status(200).send('READY');
  } else {
    res.status(503).send('DATABASE_INTEGRITY_FAILED');
  }
});

app.get('/api/metrics', requireAdmin, adminRateLimiter, (req, res) => {
  const metrics = repository.getMetrics();
  res.json({
    ...metrics,
    aiConfigured: !!process.env.GEMINI_API_KEY,
    circuitBreakerOpen: isCircuitBreakerOpen(),
    calculationEngineVersion: CALCULATION_ENGINE_VERSION
  });
});

// ----------------------------------------------------
// 2. AUTHENTICATION & SESSIONS
// ----------------------------------------------------
app.post('/api/auth/register', registerRateLimiter, (req, res, next) => {
  try {
    const validated = RegisterSchema.parse(req.body);
    const result = registerUser(validated.email, validated.password, validated.fullName);
    
    repository.logAudit({
      userId: result.user.id,
      action: 'USER_REGISTERED',
      resource: 'auth',
      status: 'SUCCESS',
      requestId: req.requestId
    });

    res.setHeader('x-session-token', result.token);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', loginRateLimiter, (req, res, next) => {
  try {
    const validated = LoginSchema.parse(req.body);
    const result = loginUser(validated.email, validated.password);

    repository.logAudit({
      userId: result.user.id,
      action: 'USER_LOGIN',
      resource: 'auth',
      status: 'SUCCESS',
      requestId: req.requestId
    });

    res.setHeader('x-session-token', result.token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = req.sessionToken;
  if (token) {
    revokeSession(token);
  }
  repository.logAudit({
    userId: req.user!.id,
    action: 'USER_LOGOUT',
    resource: 'auth',
    status: 'SUCCESS',
    requestId: req.requestId
  });
  res.json({ success: true, message: 'Đăng xuất thành công' });
});

// Auto-provision isolated guest session for first-time visitors
app.post('/api/auth/guest', guestRateLimiter, (req, res) => {
  const result = createGuestSession();
  res.setHeader('x-session-token', result.token);
  res.json(result);
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const prefs = repository.getPreferences(req.user!.id);
  res.json({
    user: req.user,
    preferences: prefs
  });
});

// ----------------------------------------------------
// 3. USER MANAGEMENT & GDPR COMPLIANCE
// ----------------------------------------------------
app.get('/api/user', requireAuth, (req, res) => {
  const prefs = repository.getPreferences(req.user!.id);
  res.json({
    user: req.user,
    preferences: prefs
  });
});

app.post('/api/user/preferences', requireAuth, (req, res, next) => {
  try {
    const validated = UserPreferencesSchema.parse(req.body);
    const updated = repository.updatePreferences(req.user!.id, validated);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// GDPR Data Export: Complete user data portability bundle
app.get('/api/user/export', requireAuth, (req, res) => {
  const data = repository.getAllUserData(req.user!.id);
  if (!data) {
    return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy dữ liệu người dùng' } });
  }

  repository.logAudit({
    userId: req.user!.id,
    action: 'USER_GDPR_DATA_EXPORT',
    resource: 'user',
    resourceId: req.user!.id,
    status: 'SUCCESS',
    requestId: req.requestId
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="aurora_user_data_${req.user!.id}.json"`);
  res.send(JSON.stringify(data, null, 2));
});

// Account Deletion: Complete cascade deletion of all user data
app.delete('/api/user/me', requireAuth, (req, res) => {
  const userId = req.user!.id;
  const success = repository.deleteUser(userId);

  repository.logAudit({
    userId,
    action: 'USER_ACCOUNT_DELETED',
    resource: 'user',
    resourceId: userId,
    status: 'SUCCESS',
    requestId: req.requestId
  });

  res.json({ success, message: 'Tài khoản và toàn bộ dữ liệu liên quan đã được xóa hoàn toàn.' });
});

// ----------------------------------------------------
// 4. PROFILES (STRICT USER ISOLATION & TRANSACTION SAFETY)
// ----------------------------------------------------
app.get('/api/profiles', (req, res) => {
  if (!req.user) {
    return res.json([]);
  }
  const profiles = repository.getProfiles(req.user.id);
  res.json(profiles);
});

app.post('/api/profiles', requireAuth, calculationRateLimiter, (req, res, next) => {
  try {
    const validated = ProfileCreateSchema.parse(req.body);
    const userId = req.user!.id;

    // Atomic transaction for profile, calculation & initial backtest creation
    const { newProfile, calc } = repository.runTransaction((repo) => {
      const createdProfile: UserProfile = {
        id: `prof_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        userId,
        name: validated.name,
        isPrimary: validated.isPrimary || false,
        avatarSeed: validated.name.toLowerCase().replace(/\s+/g, '_'),
        birthData: validated.birthData,
        behavioralContext: validated.behavioralContext || {
          careerField: '',
          employmentStatus: '',
          financialGoal: '',
          relationshipStatus: '',
          topPriority: '',
          personalNotes: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const computedCalc = runFullDestinyCalculation(createdProfile.birthData, createdProfile.id, 0);
      createdProfile.latestCalculationId = computedCalc.id;

      repo.saveCalculation(computedCalc);
      repo.saveProfile(createdProfile);

      const initialBt = runBacktestAnalysis([], computedCalc);
      repo.saveBacktestResult(initialBt);

      return { newProfile: createdProfile, calc: computedCalc };
    });

    repository.logAudit({
      userId,
      action: 'PROFILE_CREATED',
      resource: 'profile',
      resourceId: newProfile.id,
      status: 'SUCCESS',
      requestId: req.requestId
    });

    res.status(201).json({ profile: newProfile, calculation: calc });
  } catch (err) {
    next(err);
  }
});

app.put('/api/profiles/:id', requireAuth, (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = verifyProfileOwnership(req, res, id);
    if (!profile) return;

    const validated = ProfileUpdateSchema.parse(req.body);

    const updated = repository.runTransaction((repo) => {
      const updatedProfile: UserProfile = {
        ...profile,
        ...validated,
        updatedAt: new Date().toISOString()
      };

      if (validated.birthData) {
        const events = repo.getHistoricalEvents(id);
        const calc = runFullDestinyCalculation(validated.birthData, id, events.length);
        updatedProfile.latestCalculationId = calc.id;
        repo.saveCalculation(calc);

        const bt = runBacktestAnalysis(events, calc);
        repo.saveBacktestResult(bt);
      }

      repo.saveProfile(updatedProfile);
      return updatedProfile;
    });

    repository.logAudit({
      userId: req.user!.id,
      action: 'PROFILE_UPDATED',
      resource: 'profile',
      resourceId: id,
      status: 'SUCCESS',
      requestId: req.requestId
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/profiles/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const profile = verifyProfileOwnership(req, res, id);
  if (!profile) return;

  const deleted = repository.deleteProfile(id, req.user!.id);
  if (deleted) {
    repository.logAudit({
      userId: req.user!.id,
      action: 'PROFILE_DELETED_CASCADE',
      resource: 'profile',
      resourceId: id,
      status: 'SUCCESS',
      requestId: req.requestId
    });
    res.json({ success: true, profileId: id });
  } else {
    res.status(500).json({ error: { code: 'DELETE_FAILED', message: 'Không thể xóa hồ sơ' } });
  }
});

// ----------------------------------------------------
// 5. CALCULATIONS (DETERMINISTIC SINGLE SOURCE OF TRUTH)
// ----------------------------------------------------
app.get(['/api/calculations/latest/:profileId', '/api/calculations/:profileId'], requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  let calc = repository.getLatestCalculationForProfile(profileId);
  if (!calc) {
    const events = repository.getHistoricalEvents(profileId);
    calc = runFullDestinyCalculation(profile.birthData, profile.id, events.length);
    repository.saveCalculation(calc);
  }

  let bt = repository.getBacktestResult(profileId);
  if (!bt) {
    const events = repository.getHistoricalEvents(profileId);
    bt = runBacktestAnalysis(events, calc);
    repository.saveBacktestResult(bt);
  }

  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);

  res.json({ calculation: calc, ensemble, backtest: bt });
});

app.post(['/api/calculations/recalculate/:profileId', '/api/calculations/recalculate'], requireAuth, calculationRateLimiter, (req, res) => {
  const profileId = req.params.profileId || req.body?.profileId;
  if (!profileId) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Thiếu profileId' } });
    return;
  }
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const events = repository.getHistoricalEvents(profileId);
  const calc = runFullDestinyCalculation(profile.birthData, profile.id, events.length);
  repository.saveCalculation(calc);

  const bt = runBacktestAnalysis(events, calc);
  repository.saveBacktestResult(bt);

  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);

  repository.logAudit({
    userId: req.user!.id,
    action: 'CALCULATION_RECOMPUTED',
    resource: 'calculation',
    resourceId: calc.id,
    status: 'SUCCESS',
    requestId: req.requestId
  });

  res.json({ calculation: calc, ensemble, backtest: bt });
});

// ----------------------------------------------------
// 6. HISTORICAL EVENTS & EMPIRICAL BACKTESTING
// ----------------------------------------------------
app.get('/api/events/:profileId', requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const events = repository.getHistoricalEvents(profileId);
  res.json(events);
});

app.post(['/api/events', '/api/backtests/event'], requireAuth, (req, res, next) => {
  try {
    const validated = HistoricalEventSchema.parse(req.body);
    const profile = verifyProfileOwnership(req, res, validated.profileId);
    if (!profile) return;

    const event = {
      id: `evt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      ...validated,
      createdAt: new Date().toISOString()
    };

    repository.addHistoricalEvent(event);

    const allEvents = repository.getHistoricalEvents(validated.profileId);
    const calc = repository.getLatestCalculationForProfile(validated.profileId) ||
      runFullDestinyCalculation(profile.birthData, profile.id, allEvents.length);

    const updatedBt = runBacktestAnalysis(allEvents, calc);
    repository.saveBacktestResult(updatedBt);

    res.status(201).json({ event, backtestResult: updatedBt });
  } catch (err) {
    next(err);
  }
});

app.delete(['/api/events/:profileId/:eventId', '/api/backtests/event/:profileId/:eventId'], requireAuth, (req, res) => {
  const { profileId, eventId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const deleted = repository.deleteHistoricalEvent(profileId, eventId);
  if (deleted) {
    const allEvents = repository.getHistoricalEvents(profileId);
    const calc = repository.getLatestCalculationForProfile(profileId) ||
      runFullDestinyCalculation(profile.birthData, profile.id, allEvents.length);
    const updatedBt = runBacktestAnalysis(allEvents, calc);
    repository.saveBacktestResult(updatedBt);

    res.json({ success: true, backtestResult: updatedBt });
  } else {
    res.status(404).json({ error: { code: 'EVENT_NOT_FOUND', message: 'Sự kiện không tồn tại' } });
  }
});

app.get(['/api/backtest/:profileId', '/api/backtests/:profileId'], requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const events = repository.getHistoricalEvents(profileId);
  let bt = repository.getBacktestResult(profileId);
  if (!bt) {
    const calc = repository.getLatestCalculationForProfile(profileId) ||
      runFullDestinyCalculation(profile.birthData, profile.id, events.length);
    bt = runBacktestAnalysis(events, calc);
    repository.saveBacktestResult(bt);
  }

  res.json({ events, result: bt });
});

// ----------------------------------------------------
// 7. MULTI-AGENT ENSEMBLE SYNTHESIS (GROUNDED)
// ----------------------------------------------------
app.get('/api/synthesis/:profileId', requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const calc = repository.getLatestCalculationForProfile(profileId) ||
    runFullDestinyCalculation(profile.birthData, profile.id, 0);

  const bt = repository.getBacktestResult(profileId) ||
    runBacktestAnalysis(repository.getHistoricalEvents(profileId), calc);

  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);
  res.json(ensemble);
});

// ----------------------------------------------------
// 8. SCENARIOS & WHAT-IF SIMULATOR (DETERMINISTIC)
// ----------------------------------------------------
app.post('/api/scenarios/evaluate', requireAuth, scenarioRateLimiter, (req, res, next) => {
  try {
    const validated = ScenarioEvaluateSchema.parse(req.body);
    const profile = verifyProfileOwnership(req, res, validated.profileId);
    if (!profile) return;

    let calc = repository.getLatestCalculationForProfile(validated.profileId);
    if (!calc) {
      calc = runFullDestinyCalculation(profile.birthData, profile.id, 0);
      repository.saveCalculation(calc);
    }

    const result = evaluateWhatIfScenario(validated.question, calc);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// 9. DAILY DESTINY (DETERMINISTIC)
// ----------------------------------------------------
app.get('/api/daily/:profileId', requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  let calc = repository.getLatestCalculationForProfile(profileId);
  if (!calc) {
    calc = runFullDestinyCalculation(profile.birthData, profile.id, 0);
    repository.saveCalculation(calc);
  }

  const daily = computeDailyDestiny(calc);
  res.json(daily);
});

// ----------------------------------------------------
// 10. AI CONVERSATIONAL ASSISTANT (RESILIENT GEMINI + GROUNDED FALLBACK)
// ----------------------------------------------------
app.post('/api/ai/chat', requireAuth, aiChatRateLimiter, async (req, res, next) => {
  try {
    const validated = AiChatSchema.parse(req.body);
    const profile = verifyProfileOwnership(req, res, validated.profileId);
    if (!profile) return;

    let calc = repository.getLatestCalculationForProfile(validated.profileId);
    if (!calc) {
      calc = runFullDestinyCalculation(profile.birthData, profile.id, 0);
      repository.saveCalculation(calc);
    }

    let bt = repository.getBacktestResult(validated.profileId);
    if (!bt) {
      bt = runBacktestAnalysis([], calc);
      repository.saveBacktestResult(bt);
    }

    // Save user message
    const userMsg = {
      id: `msg_u_${Date.now()}`,
      sender: 'user' as const,
      content: validated.message,
      timestamp: new Date().toISOString()
    };
    repository.addChatMessage(validated.profileId, userMsg);

    // Call resilient Gemini service
    const { content, confidenceScore } = await generateDestinyChatResponse(
      validated.message,
      profile,
      calc,
      bt
    );

    const currentYear = new Date().getFullYear();
    const currentTransit = calc.annualTransits.find(t => t.year === currentYear) || calc.annualTransits[0];

    const assistantMsg = {
      id: `msg_a_${Date.now()}`,
      sender: 'assistant' as const,
      content,
      timestamp: new Date().toISOString(),
      confidenceScore,
      suggestedQuestions: [
        'Giai đoạn nào trong năm nay có sóng năng lượng thuận lợi nhất?',
        `Làm thế nào để ứng dụng Dụng Thần ${calc.bazi.favorableElements.join('/')} vào quản trị tài chính?`,
        'Điểm mù lớn nhất cần phòng tránh trong các quyết định lớn là gì?'
      ],
      groundedFacts: [
        `Bát Tự: Nhật Chủ ${calc.bazi.dayMaster} (${calc.bazi.dayMasterStrength}) - Cách Cục: ${calc.bazi.structureType}`,
        `Dụng Thần: ${calc.bazi.favorableElements.join(', ')} | Kỵ Thần: ${calc.bazi.unfavorableElements.join(', ')}`,
        `Tử Vi: Cung Mệnh tại ${calc.ziwei.palaces.life?.branch} - Cục: ${calc.ziwei.elementBureau}`,
        `Lưu Niên ${currentYear}: Sóng cơ hội ${currentTransit?.opportunityWave || 70}% - Sóng thận trọng ${currentTransit?.cautionWave || 40}%`,
        `Chỉ số Tương Hợp Lịch Sử: ${bt.destinyConsistencyScore}/100`
      ]
    };

    repository.addChatMessage(validated.profileId, assistantMsg);
    res.json(assistantMsg);
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// 11. AUDIT LOGS, ADMIN & POSTGRESQL MIGRATION
// ----------------------------------------------------
app.get('/api/audit-logs', requireAdmin, adminRateLimiter, (req, res) => {
  const logs = repository.getAuditLogs(100);
  res.json(logs);
});

app.get('/api/feature-flags', (req, res) => {
  res.json(repository.getFeatureFlags());
});

app.post('/api/feature-flags/toggle', requireAdmin, adminRateLimiter, (req, res, next) => {
  try {
    const validated = FeatureFlagToggleSchema.parse(req.body);
    const updated = repository.toggleFeatureFlag(validated.key, validated.enabled);
    if (!updated) {
      return res.status(404).json({ error: { code: 'FLAG_NOT_FOUND', message: 'Feature flag not found' } });
    }
    res.json(repository.getFeatureFlags());
  } catch (err) {
    next(err);
  }
});

// Admin PostgreSQL Migration Exporter (PHẦN 3)
app.get('/api/admin/export-sql', requireAdmin, adminRateLimiter, (req, res) => {
  const ddl = repository.exportToPostgresSql();
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="aurora_destiny_postgres_migration.sql"');
  res.send(ddl);
});

app.post('/api/admin/cleanup-sessions', requireAdmin, adminRateLimiter, (req, res) => {
  const cleaned = repository.cleanupExpiredSessions();
  res.json({ success: true, cleanedSessionsCount: cleaned });
});

// Privacy Export for Profile
app.get('/api/export/:profileId', requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const calc = repository.getLatestCalculationForProfile(profileId);
  const events = repository.getHistoricalEvents(profileId);
  const bt = repository.getBacktestResult(profileId);
  const messages = repository.getChatMessages(profileId);
  const prefs = repository.getPreferences(req.user!.id);

  const exportBundle = {
    app: 'Aurora Destiny AI',
    exportTimestamp: new Date().toISOString(),
    user: {
      id: req.user!.id,
      email: req.user!.email,
      fullName: req.user!.fullName,
      role: req.user!.role,
      subscriptionTier: req.user!.subscriptionTier
    },
    profile,
    calculation: calc,
    historicalEvents: events,
    backtestResult: bt,
    chatMessages: messages,
    preferences: prefs
  };

  repository.logAudit({
    userId: req.user!.id,
    action: 'USER_DATA_EXPORTED',
    resource: 'profile',
    resourceId: profileId,
    status: 'SUCCESS',
    requestId: req.requestId
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="aurora_destiny_${profileId}.json"`);
  res.send(JSON.stringify(exportBundle, null, 2));
});

// ----------------------------------------------------
// 12. CENTRALIZED ERROR HANDLING MIDDLEWARE
// ----------------------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu đầu vào không hợp lệ',
        details: err.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message
        })),
        requestId: req.requestId
      }
    });
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  console.error(`[Error ${req.requestId}] ${req.method} ${req.originalUrl}:`, err?.message || err);

  res.status(statusCode).json({
    error: {
      code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
      message: err.message || 'Đã xảy ra lỗi trong quá trình xử lý',
      requestId: req.requestId
    }
  });
});

// ----------------------------------------------------
// 13. VITE MIDDLEWARE & STATIC ASSETS
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Aurora Destiny AI Production Server active on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown handling (SIGTERM & SIGINT)
  const shutdown = () => {
    console.log('🛑 [Shutdown] Received termination signal. Closing server cleanly...');
    server.close(() => {
      console.log('✅ [Shutdown] HTTP connections closed. Process terminating cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();

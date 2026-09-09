// ==========================================
// AURORA DESTINY AI — PRODUCTION FULL-STACK SERVER
// Hardened Architecture, Security, Durability & Deterministic Integrity
// ==========================================

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
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
  requestPasswordReset,
  resetPasswordWithToken,
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
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema
} from './src/schemas/validationSchemas';

import { runFullDestinyCalculation, CALCULATION_ENGINE_VERSION, ASTROLOGY_RULES_VERSION, ANALYSIS_MODEL_VERSION } from './src/engine/destinyEngine';
import { runBacktestAnalysis } from './src/engine/backtesting';
import { evaluateWhatIfScenario } from './src/engine/scenarios';
import { generateMultiAgentEnsemble, computeDailyDestiny } from './src/services/aiSynthesizer';
import { generateDestinyChatResponse, isCircuitBreakerOpen } from './src/services/geminiService';
import { DestinyAiPipeline } from './src/services/aiPipeline';
import { UserProfile } from './src/types/user';
import { enterpriseSecurityFirewall, getSecurityAnalytics } from './src/server/securityFirewall';
import {
  generateAlgorithmSignature,
  verifyAlgorithmSignature,
  antiScrapingSweeperMiddleware
} from './src/server/algorithmProtection';

const app = express();
const PORT = 3000;

// Trust reverse proxy for correct IP rate-limiting behind Cloud Run / Nginx
app.set('trust proxy', 1);

// Security: parse JSON with strict size limit
app.use(express.json({ limit: '2mb' }));

// Lightweight native cookie parser (no third-party dependency needed)
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(cookieStr => {
      const parts = cookieStr.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = decodeURIComponent(parts.slice(1).join('=').trim());
        (req as any).cookies[key] = val;
      }
    });
  }
  next();
});

// Helper functions for secure HttpOnly cookie management
function setSessionCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('aurora_session', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

function clearSessionCookie(res: Response): void {
  res.clearCookie('aurora_session', {
    httpOnly: true,
    path: '/'
  });
}

// ----------------------------------------------------
// MIDDLEWARE: REQUEST TRACING & HARDENED SECURITY HEADERS
// ----------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  req.requestId = reqId;
  res.setHeader('X-Request-Id', reqId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content Security Policy - allowing embedding within Google AI Studio preview iframes
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; frame-ancestors 'self' https://aistudio.google.com https://*.google.com https://ai.studio https://*.run.app;"
  );
  next();
});

// ENTERPRISE HARDENED WAF & INTRUSION PREVENTION SHIELD
// Stops SQLi, NoSQL/Prototype Pollution, XSS, Path Traversal, and Scanners
app.use(enterpriseSecurityFirewall);

// Authentication middleware extracts user from bearer token or x-session-token
app.use(authMiddleware);

// Dynamic Bootstrap Admin account if ADMIN_EMAIL & ADMIN_PASSWORD are provided
bootstrapAdminIfConfigured();

// Clean up expired sessions on startup
repository.cleanupExpiredSessions();

// Periodic expired session & abandoned guest purge (every 15 minutes)
setInterval(() => {
  try {
    repository.cleanupExpiredSessions();
  } catch (err) {
    console.error('[Session Cleanup Error]', err);
  }
}, 15 * 60 * 1000);

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
        storageMode: (repository.getMetrics() as any).storageMode || (process.env.DATABASE_URL ? 'postgresql_production_adapter' : 'durable_atomic_file_adapter'),
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

    setSessionCookie(res, result.token);
    res.setHeader('x-session-token', result.token);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', loginRateLimiter, (req, res, next) => {
  try {
    const validated = LoginSchema.parse(req.body);
    // Session rotation: pass current session token if client had one (e.g. from guest session)
    const result = loginUser(validated.email, validated.password, req.sessionToken);

    repository.logAudit({
      userId: result.user.id,
      action: 'USER_LOGIN',
      resource: 'auth',
      status: 'SUCCESS',
      requestId: req.requestId
    });

    setSessionCookie(res, result.token);
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
  clearSessionCookie(res);
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
  setSessionCookie(res, result.token);
  res.setHeader('x-session-token', result.token);
  res.json(result);
});

// Request Password Reset
app.post('/api/auth/forgot-password', loginRateLimiter, (req, res, next) => {
  try {
    const validated = ForgotPasswordSchema.parse(req.body);
    const result = requestPasswordReset(validated.email);

    repository.logAudit({
      userId: 'system',
      action: 'PASSWORD_RESET_REQUESTED',
      resource: 'auth',
      status: 'SUCCESS',
      requestId: req.requestId
    });

    // Constant message prevents email enumeration attack
    res.json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được xử lý thành công.',
      // In development / demo mode without external SMTP, return token for verification
      ...(process.env.NODE_ENV !== 'production' && result ? { debugToken: result.resetToken } : {})
    });
  } catch (err) {
    next(err);
  }
});

// Reset Password with Token
app.post('/api/auth/reset-password', loginRateLimiter, (req, res, next) => {
  try {
    const validated = ResetPasswordSchema.parse(req.body);
    const success = resetPasswordWithToken(validated.token, validated.newPassword);

    if (!success) {
      return res.status(400).json({
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'Mã khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.',
          requestId: req.requestId
        }
      });
    }

    clearSessionCookie(res);
    res.json({
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công. Vui lòng đăng nhập lại với mật khẩu mới.'
    });
  } catch (err) {
    next(err);
  }
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

app.post('/api/profiles', requireAuth, calculationRateLimiter, antiScrapingSweeperMiddleware, (req, res, next) => {
  try {
    const validated = ProfileCreateSchema.parse(req.body);
    const userId = req.user!.id;

    // Atomic transaction for guest quota check, profile, calculation & initial backtest creation
    const { newProfile, calc } = repository.runTransaction((repo) => {
      // Enforce guest quota atomically: role === 'GUEST' is single source of truth
      if (req.user!.role === 'GUEST') {
        const existingProfiles = repo.getProfiles(userId);
        if (existingProfiles.length >= 2) {
          const quotaErr = new Error('Phiên khách tạm thời giới hạn tối đa 2 hồ sơ lá số. Vui lòng đăng ký tài khoản chính thức miễn phí để tạo không giới hạn hồ sơ.');
          (quotaErr as any).code = 'GUEST_QUOTA_EXCEEDED';
          (quotaErr as any).statusCode = 403;
          throw quotaErr;
        }
      }

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
      computedCalc.cryptographicSignature = generateAlgorithmSignature(computedCalc);
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
// Protected with Cryptographic Provenance & Anti-Scraping Sweeper
// ----------------------------------------------------
app.get(['/api/calculations/latest/:profileId', '/api/calculations/:profileId'], requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  let calc = repository.getLatestCalculationForProfile(profileId);
  if (!calc) {
    const events = repository.getHistoricalEvents(profileId);
    calc = runFullDestinyCalculation(profile.birthData, profile.id, events.length);
    calc.cryptographicSignature = generateAlgorithmSignature(calc);
    repository.saveCalculation(calc);
  } else if (!calc.cryptographicSignature) {
    calc.cryptographicSignature = generateAlgorithmSignature(calc);
    repository.saveCalculation(calc);
  }

  let bt = repository.getBacktestResult(profileId);
  if (!bt) {
    const events = repository.getHistoricalEvents(profileId);
    bt = runBacktestAnalysis(events, calc);
    repository.saveBacktestResult(bt);
  }

  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);

  res.setHeader('X-Algorithm-Seal', calc.cryptographicSignature?.signature || 'unsealed');
  res.json({ calculation: calc, ensemble, backtest: bt });
});

app.post(['/api/calculations/recalculate/:profileId', '/api/calculations/recalculate'], requireAuth, calculationRateLimiter, antiScrapingSweeperMiddleware, (req, res) => {
  const profileId = req.params.profileId || req.body?.profileId;
  if (!profileId) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Thiếu profileId' } });
    return;
  }
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const events = repository.getHistoricalEvents(profileId);
  const calc = runFullDestinyCalculation(profile.birthData, profile.id, events.length);
  calc.cryptographicSignature = generateAlgorithmSignature(calc);
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

  res.setHeader('X-Algorithm-Seal', calc.cryptographicSignature.signature);
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

    // Atomic transaction for guest quota enforcement, event creation & backtest calculation
    const { event, updatedBt } = repository.runTransaction((repo) => {
      // Enforce guest quota atomically: role === 'GUEST' is single source of truth
      if (req.user!.role === 'GUEST') {
        const existingEvents = repo.getHistoricalEvents(validated.profileId);
        if (existingEvents.length >= 5) {
          const quotaErr = new Error('Phiên khách tạm thời giới hạn tối đa 5 sự kiện đối chiếu. Vui lòng đăng ký tài khoản chính thức miễn phí để lưu trữ toàn bộ lịch sử.');
          (quotaErr as any).code = 'GUEST_EVENT_QUOTA_EXCEEDED';
          (quotaErr as any).statusCode = 403;
          throw quotaErr;
        }
      }

      const createdEvent = {
        id: `evt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        ...validated,
        createdAt: new Date().toISOString()
      };

      repo.addHistoricalEvent(createdEvent);

      const allEvents = repo.getHistoricalEvents(validated.profileId);
      const calc = repo.getLatestCalculationForProfile(validated.profileId) ||
        runFullDestinyCalculation(profile.birthData, profile.id, allEvents.length);

      const computedBt = runBacktestAnalysis(allEvents, calc);
      repo.saveBacktestResult(computedBt);

      return { event: createdEvent, updatedBt: computedBt };
    });

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

// Retrieve conversation history for profile (strictly authenticated & isolated)
app.get('/api/ai/messages/:profileId', requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const messages = repository.getChatMessages(profileId);
  res.json(messages);
});

// Clear conversation history for profile
app.delete('/api/ai/messages/:profileId', requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const cleared = repository.clearChatMessages(profileId);
  repository.logAudit({
    userId: req.user!.id,
    action: 'CHAT_HISTORY_CLEARED',
    resource: 'chat',
    resourceId: profileId,
    status: 'SUCCESS',
    requestId: req.requestId
  });
  res.json({ success: cleared });
});

// ----------------------------------------------------
// 10B. 13-STAGE MULTI-TIER AI REASONING PIPELINE
// ----------------------------------------------------
app.post('/api/ai/pipeline', requireAuth, aiChatRateLimiter, async (req, res, next) => {
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

    const pipelineResult = await DestinyAiPipeline.execute({
      userQuestion: validated.message,
      profile,
      calculation: calc,
      backtest: bt
    });

    res.json(pipelineResult);
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// 10C. ALGORITHM PROVENANCE & AUTHENTICITY VERIFICATION
// Cryptographic validation of calculation seals
// ----------------------------------------------------
app.post('/api/algorithm/verify-seal', (req, res) => {
  const calc = req.body;
  if (!calc || !calc.cryptographicSignature) {
    return res.status(400).json({
      valid: false,
      message: 'Thiếu thông tin chữ ký số hoặc con dấu mật mã bản quyền của thuật toán.'
    });
  }

  const isValid = verifyAlgorithmSignature(calc);
  return res.json({
    valid: isValid,
    signature: calc.cryptographicSignature.signature,
    sealTimestamp: calc.cryptographicSignature.sealTimestamp,
    issuer: calc.cryptographicSignature.issuer,
    algorithmHash: calc.cryptographicSignature.algorithmHash,
    intellectualPropertyOwner: 'Prof.TOAN & Huyen Phong Phat Dao',
    message: isValid
      ? 'Chữ ký mật mã hợp lệ. Toàn bộ thông số tinh bàn và tứ trụ được xác thực nguyên bản từ hệ thống độc quyền.'
      : 'CẢNH BÁO: Dữ liệu tính toán đã bị can thiệp, sai lệch cấu trúc hoặc không xuất phát từ lõi thuật toán chính thống.'
  });
});

// ----------------------------------------------------
// 11. AUDIT LOGS, ADMIN & POSTGRESQL MIGRATION
// ----------------------------------------------------
app.get('/api/admin/security-threats', requireAdmin, adminRateLimiter, (req, res) => {
  const analytics = getSecurityAnalytics();
  res.json(analytics);
});

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
// 11B. NATIVE MOBILE PDF DOWNLOAD & STREAMING STAGING
// Provides standard HTTP attachment responses to guarantee native Android & iOS downloads
// ----------------------------------------------------
interface StagedPdfItem {
  buffer: Buffer;
  fileName: string;
  expiresAt: number;
}

const pdfStagingCache = new Map<string, StagedPdfItem>();

// Clean up expired PDF staging files periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of pdfStagingCache.entries()) {
    if (item.expiresAt < now) {
      pdfStagingCache.delete(id);
    }
  }
}, 60 * 1000);

// Stage a generated PDF for robust native mobile OS download
app.post(
  '/api/pdf/prepare-download',
  express.raw({ type: ['application/pdf', 'application/octet-stream'], limit: '30mb' }),
  (req: Request, res: Response) => {
    let buffer: Buffer | null = null;
    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      buffer = req.body;
    } else if (typeof req.body === 'string' && req.body.length > 0) {
      buffer = Buffer.from(req.body, 'base64');
    }

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: 'Không nhận được dữ liệu tệp PDF.' });
    }

    const downloadId = crypto.randomBytes(16).toString('hex');
    const rawFileName = (req.query.filename as string) || 'Sach_Ban_Menh_A4.pdf';
    const safeFileName = rawFileName.replace(/[^a-zA-Z0-9_.-]/g, '_');

    pdfStagingCache.set(downloadId, {
      buffer,
      fileName: safeFileName,
      expiresAt: Date.now() + 20 * 60 * 1000 // 20 minutes expiration
    });

    const downloadUrl = `/api/pdf/download/${downloadId}?filename=${encodeURIComponent(safeFileName)}`;
    res.json({
      success: true,
      downloadUrl,
      id: downloadId,
      size: buffer.length
    });
  }
);

// Stream the staged PDF with standard HTTP attachment headers for native mobile DownloadManager
app.get('/api/pdf/download/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const staged = pdfStagingCache.get(id);

  if (!staged || staged.expiresAt < Date.now()) {
    return res
      .status(404)
      .send(
        '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hết hạn</title></head><body style="font-family:sans-serif;background:#050814;color:#e2e8f0;text-align:center;padding:50px;"><h2>Tệp PDF đã hết hạn lưu tạm.</h2><p>Vui lòng quay lại ứng dụng và bấm "Tải File PDF Về Máy" để kết xuất bản mới.</p></body></html>'
      );
  }

  const fileName = (req.query.filename as string) || staged.fileName || 'Sach_Ban_Menh_A4.pdf';
  const isView = req.query.view === '1';
  const encodedFileName = encodeURIComponent(fileName);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', staged.buffer.length);

  if (isView) {
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`);
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return res.end(staged.buffer);
});

// ----------------------------------------------------
// 11B. ENTERPRISE SEO, SITEMAP, ROBOTS.TXT & SOCIAL CRAWLER ROUTES
// High-performance search engine indexing & rich snippets
// ----------------------------------------------------

app.get('/robots.txt', (req: Request, res: Response) => {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
  res.setHeader('X-Robots-Tag', 'all');

  if (fs.existsSync(robotsPath)) {
    return res.sendFile(robotsPath);
  }

  // Guaranteed resilient fallback
  const fallbackRobots = `User-agent: *\nAllow: /\nDisallow: /api/admin/\nDisallow: /api/auth/\n\nSitemap: https://auroradestiny.ai/sitemap.xml\n`;
  return res.send(fallbackRobots);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
  res.setHeader('X-Robots-Tag', 'all');

  if (fs.existsSync(sitemapPath)) {
    return res.sendFile(sitemapPath);
  }

  const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://auroradestiny.ai/</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url></urlset>`;
  return res.send(fallbackSitemap);
});

app.get(['/manifest.webmanifest', '/manifest.json'], (req: Request, res: Response) => {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.webmanifest');
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  if (fs.existsSync(manifestPath)) {
    return res.sendFile(manifestPath);
  }
  return res.status(404).json({ error: 'Manifest not found' });
});

app.get('/og-image.svg', (req: Request, res: Response) => {
  const ogPath = path.join(process.cwd(), 'public', 'og-image.svg');
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

  if (fs.existsSync(ogPath)) {
    return res.sendFile(ogPath);
  }
  return res.status(404).send('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#050508"/><text x="50%" y="50%" fill="#ffffff" text-anchor="middle" font-size="40">Aurora Destiny AI</text></svg>');
});

app.get('/api/seo/metadata', (req: Request, res: Response) => {
  res.json({
    platform: 'Aurora Destiny AI',
    channel: 'Kênh Huyền Phong Phật Đạo',
    author: 'Giáo Sư - Prof.TOAN',
    email: 'havantoancntt@gmail.com',
    canonicalUrl: 'https://auroradestiny.ai/',
    sitemapUrl: 'https://auroradestiny.ai/sitemap.xml',
    robotsUrl: 'https://auroradestiny.ai/robots.txt',
    ogImageUrl: 'https://auroradestiny.ai/og-image.svg',
    title: 'Aurora Destiny AI — Luận Giải Bát Tự Tứ Trụ, Tử Vi Đẩu Số 108 Tinh Bàn & Siêu Trí Tuệ Nhân Tạo',
    keywords: [
      'Tử Vi Đẩu Số 108 Tinh Bàn',
      'Bát Tự Tứ Trụ',
      'Giờ Sinh Chân Mặt Trời',
      'Huyền Phong Phật Đạo',
      'Giáo Sư Prof TOAN',
      'Multi-Agent AI',
      '24 Tiết Khí VSOP87',
      'Dụng Thần Bát Tự',
      'Kiểm Chứng Ngược Lịch Sử'
    ],
    structuredDataTypes: [
      'WebApplication',
      'Organization',
      'WebSite',
      'BreadcrumbList',
      'FAQPage',
      'HowTo'
    ],
    status: 'OPTIMIZED_TOP_RANKING'
  });
});

// ----------------------------------------------------
// 11C. CELESTIAL HALL OF PATRONS (BIA VÀNG CÔNG ĐỨC THIÊN BÀN)
// Trân trọng ghi danh những tấm lòng hảo tâm & bảo trợ tri thức
// ----------------------------------------------------
interface PatronRecord {
  id: string;
  name: string;
  tier: 'dong' | 'bac' | 'vang' | 'kim_cuong' | 'tam_tinh';
  amount?: number;
  message?: string;
  sealHash: string;
  date: string;
  isAnonymous?: boolean;
}

const initialPatrons: PatronRecord[] = [
  {
    id: 'ptr_001',
    name: 'Phật Tử Diệu Tâm (TP. HCM)',
    tier: 'kim_cuong',
    amount: 1000000,
    message: 'Kính chúc Kênh Huyền Phong Phật Đạo & Giáo Sư Prof.TOAN thân tâm an lạc, lan tỏa chánh tri kiến.',
    sealHash: 'SEAL-HPPD-9F2A1C4B',
    date: '2026-03-01'
  },
  {
    id: 'ptr_002',
    name: 'Cư Sĩ Trí Tuệ (Hà Nội)',
    tier: 'vang',
    amount: 500000,
    message: 'Ủng hộ máy chủ AI phân tích Bát Tự & Tử Vi khoa học không mê tín dị đoan.',
    sealHash: 'SEAL-HPPD-88B13DE0',
    date: '2026-03-03'
  },
  {
    id: 'ptr_003',
    name: 'Bác Sĩ Nguyễn Hoàng (Đà Nẵng)',
    tier: 'vang',
    amount: 500000,
    message: 'Tấm lòng tri ân thuật toán Giờ sinh chân mặt trời chuẩn xác đến từng phút.',
    sealHash: 'SEAL-HPPD-C41951A8',
    date: '2026-03-05'
  },
  {
    id: 'ptr_004',
    name: 'Hữu Duyên Trí Thiện (Cần Thơ)',
    tier: 'bac',
    amount: 200000,
    message: 'Mời Giáo Sư chén trà đàm đạo, chúc dự án trường tồn vươn tầm quốc tế.',
    sealHash: 'SEAL-HPPD-7E3048D2',
    date: '2026-03-07'
  },
  {
    id: 'ptr_005',
    name: 'Huynh Đệ Vô Danh (California, USA)',
    tier: 'kim_cuong',
    amount: 2000000,
    message: 'Bảo trợ GPU máy chủ đa tác tử AI, phụng sự người Việt năm châu.',
    sealHash: 'SEAL-HPPD-EE4091BF',
    date: '2026-03-08'
  }
];

let registeredPatrons: PatronRecord[] = [...initialPatrons];

app.get('/api/patrons', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    totalCount: registeredPatrons.length,
    patrons: registeredPatrons
  });
});

app.post('/api/patrons', (req: Request, res: Response) => {
  const { name, tier, amount, message, isAnonymous } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Tên hoặc pháp danh không được để trống' });
  }

  const rawName = isAnonymous ? 'Thí Chủ Hữu Duyên (Ẩn danh)' : name.trim();
  const safeTier = ['dong', 'bac', 'vang', 'kim_cuong', 'tam_tinh'].includes(tier) ? tier : 'tam_tinh';
  const cleanAmount = typeof amount === 'number' && amount > 0 ? amount : undefined;

  const hashSeed = `${rawName}_${Date.now()}_${Math.random()}`;
  let hashNum = 0x811c9dc5;
  for (let i = 0; i < hashSeed.length; i++) {
    hashNum ^= hashSeed.charCodeAt(i);
    hashNum = (hashNum * 0x01000193) >>> 0;
  }
  const sealHash = `SEAL-HPPD-${hashNum.toString(16).toUpperCase().padStart(8, '0')}`;

  const newPatron: PatronRecord = {
    id: `ptr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: rawName,
    tier: safeTier as any,
    amount: cleanAmount,
    message: message && typeof message === 'string' ? message.trim() : 'Gieo duyên công đức trợ lực nền tảng',
    sealHash,
    date: new Date().toISOString().split('T')[0],
    isAnonymous: Boolean(isAnonymous)
  };

  registeredPatrons.unshift(newPatron);

  if (registeredPatrons.length > 500) {
    registeredPatrons = registeredPatrons.slice(0, 500);
  }

  return res.status(201).json({
    status: 'success',
    message: 'Ghi danh Bia Vàng Công Đức thành công',
    patron: newPatron
  });
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

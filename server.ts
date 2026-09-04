// ==========================================
// AURORA DESTINY AI — PRODUCTION FULL-STACK SERVER
// Hardened Architecture, Security & Deterministic Integrity
// ==========================================

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { ZodError } from 'zod';
import { GoogleGenAI } from '@google/genai';

import { repository } from './src/db/repository';
import {
  authMiddleware,
  requireAuth,
  requireAdmin,
  verifyProfileOwnership,
  registerUser,
  loginUser,
  createGuestSession
} from './src/server/auth';
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

import { runFullDestinyCalculation, CALCULATION_ENGINE_VERSION, ASTROLOGY_RULES_VERSION } from './src/engine/destinyEngine';
import { runBacktestAnalysis } from './src/engine/backtesting';
import { evaluateWhatIfScenario } from './src/engine/scenarios';
import { generateMultiAgentEnsemble, computeDailyDestiny } from './src/services/aiSynthesizer';
import { STEMS, BRANCHES } from './src/engine/canchi';
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

// ----------------------------------------------------
// RATE LIMITING (Sliding window in-memory for AI chat)
// ----------------------------------------------------
const chatRateLimits = new Map<string, { count: number; windowStart: number }>();
function checkRateLimit(req: Request, res: Response, limitPerMinute: number = 30): boolean {
  const identifier = req.user?.id || req.ip || 'anonymous';
  const now = Date.now();
  const entry = chatRateLimits.get(identifier);

  if (!entry || now - entry.windowStart > 60000) {
    chatRateLimits.set(identifier, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limitPerMinute) {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng chờ 1 phút trước khi tiếp tục.',
        requestId: req.requestId
      }
    });
    return false;
  }

  entry.count++;
  return true;
}

// ----------------------------------------------------
// GEMINI CLIENT (Lazy initialization with safe model fallback)
// ----------------------------------------------------
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aurora-destiny-ai/2.5.0'
        }
      }
    });
  }
  return geminiClient;
}

// Check Gemini API key existence on startup without leaking secrets
const hasGeminiKey = !!process.env.GEMINI_API_KEY;
if (!hasGeminiKey) {
  console.warn('⚠️ [Aurora Destiny AI] GEMINI_API_KEY is not defined. Server running with deterministic structured fallback interpretation.');
} else {
  console.log('✅ [Aurora Destiny AI] GEMINI_API_KEY verified. AI Multi-Agent Synthesizer enabled.');
}

// ----------------------------------------------------
// 1. HEALTH & METRICS
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Aurora Destiny AI',
    version: '2.5.0',
    serverTimestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    calculationEngine: CALCULATION_ENGINE_VERSION,
    astrologyRules: ASTROLOGY_RULES_VERSION
  });
});

app.get('/api/metrics', requireAdmin, (req, res) => {
  const metrics = repository.getMetrics();
  res.json({
    ...metrics,
    aiConfigured: !!process.env.GEMINI_API_KEY,
    calculationEngineVersion: CALCULATION_ENGINE_VERSION
  });
});

// ----------------------------------------------------
// 2. AUTHENTICATION (MULTI-USER ISOLATION)
// ----------------------------------------------------
app.post('/api/auth/register', (req, res, next) => {
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

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', (req, res, next) => {
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

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Auto-provision guest session for first-time visitors
app.post('/api/auth/guest', (req, res) => {
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
// 3. USER PREFERENCES
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

// ----------------------------------------------------
// 4. PROFILES (STRICT USER ISOLATION)
// ----------------------------------------------------
app.get('/api/profiles', (req, res) => {
  // If no auth token, return empty array cleanly so Onboarding Wizard displays cleanly
  if (!req.user) {
    return res.json([]);
  }
  const profiles = repository.getProfiles(req.user.id);
  res.json(profiles);
});

app.post('/api/profiles', requireAuth, (req, res, next) => {
  try {
    const validated = ProfileCreateSchema.parse(req.body);
    const userId = req.user!.id;

    const newProfile: UserProfile = {
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

    // Run deterministic calculation engine as single source of truth
    const calc = runFullDestinyCalculation(newProfile.birthData, newProfile.id, 0);
    newProfile.latestCalculationId = calc.id;

    repository.saveCalculation(calc);
    repository.saveProfile(newProfile);

    // Initialize clean backtest result
    const initialBt = runBacktestAnalysis([], calc);
    repository.saveBacktestResult(initialBt);

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
    if (!profile) return; // Error handled inside verifyProfileOwnership

    const validated = ProfileUpdateSchema.parse(req.body);

    const updatedProfile: UserProfile = {
      ...profile,
      ...validated,
      updatedAt: new Date().toISOString()
    };

    if (validated.birthData) {
      const events = repository.getHistoricalEvents(id);
      const calc = runFullDestinyCalculation(validated.birthData, id, events.length);
      updatedProfile.latestCalculationId = calc.id;
      repository.saveCalculation(calc);

      const bt = runBacktestAnalysis(events, calc);
      repository.saveBacktestResult(bt);
    }

    repository.saveProfile(updatedProfile);

    repository.logAudit({
      userId: req.user!.id,
      action: 'PROFILE_UPDATED',
      resource: 'profile',
      resourceId: id,
      status: 'SUCCESS',
      requestId: req.requestId
    });

    res.json(updatedProfile);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/profiles/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const profile = verifyProfileOwnership(req, res, id);
  if (!profile) return;

  const success = repository.deleteProfile(id, req.user!.id);

  repository.logAudit({
    userId: req.user!.id,
    action: 'PROFILE_DELETED',
    resource: 'profile',
    resourceId: id,
    status: success ? 'SUCCESS' : 'FAILURE',
    requestId: req.requestId
  });

  res.json({ success });
});

// ----------------------------------------------------
// 5. CALCULATION & ENSEMBLE AI (DETERMINISTIC)
// ----------------------------------------------------
app.get('/api/calculations/:profileId', requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return; // Strict: NEVER fallback to profiles[0]

  let calc = repository.getLatestCalculationForProfile(profile.id);
  if (!calc) {
    const events = repository.getHistoricalEvents(profile.id);
    calc = runFullDestinyCalculation(profile.birthData, profile.id, events.length);
    repository.saveCalculation(calc);
  }

  let bt = repository.getBacktestResult(profile.id);
  if (!bt) {
    const events = repository.getHistoricalEvents(profile.id);
    bt = runBacktestAnalysis(events, calc);
    repository.saveBacktestResult(bt);
  }

  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);
  res.json({ calculation: calc, ensemble, backtest: bt });
});

app.post('/api/calculations/recalculate', requireAuth, (req, res) => {
  const { profileId } = req.body;
  if (!profileId) {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'profileId is required' } });
  }

  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const events = repository.getHistoricalEvents(profileId);
  const calc = runFullDestinyCalculation(profile.birthData, profileId, events.length);
  repository.saveCalculation(calc);

  const bt = runBacktestAnalysis(events, calc);
  repository.saveBacktestResult(bt);

  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);
  res.json({ calculation: calc, ensemble, backtest: bt });
});

// ----------------------------------------------------
// 6. BACKTESTING STUDIO
// ----------------------------------------------------
app.get('/api/backtests/:profileId', requireAuth, (req, res) => {
  const { profileId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const events = repository.getHistoricalEvents(profileId);
  let result = repository.getBacktestResult(profileId);
  if (!result) {
    const calc = repository.getLatestCalculationForProfile(profileId);
    if (calc) {
      result = runBacktestAnalysis(events, calc);
      repository.saveBacktestResult(result);
    }
  }

  res.json({ events, result });
});

app.post('/api/backtests/event', requireAuth, (req, res, next) => {
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
    let calc = repository.getLatestCalculationForProfile(validated.profileId);
    if (!calc) {
      calc = runFullDestinyCalculation(profile.birthData, profile.id, allEvents.length);
      repository.saveCalculation(calc);
    }

    const updatedResult = runBacktestAnalysis(allEvents, calc);
    repository.saveBacktestResult(updatedResult);

    repository.logAudit({
      userId: req.user!.id,
      action: 'HISTORICAL_EVENT_ADDED',
      resource: 'historical_event',
      resourceId: event.id,
      status: 'SUCCESS',
      requestId: req.requestId
    });

    res.status(201).json({ event, backtestResult: updatedResult });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/backtests/event/:profileId/:eventId', requireAuth, (req, res) => {
  const { profileId, eventId } = req.params;
  const profile = verifyProfileOwnership(req, res, profileId);
  if (!profile) return;

  const deleted = repository.deleteHistoricalEvent(profileId, eventId);
  const allEvents = repository.getHistoricalEvents(profileId);
  const calc = repository.getLatestCalculationForProfile(profileId);
  
  let updatedResult = null;
  if (calc) {
    updatedResult = runBacktestAnalysis(allEvents, calc);
    repository.saveBacktestResult(updatedResult);
  }

  repository.logAudit({
    userId: req.user!.id,
    action: 'HISTORICAL_EVENT_DELETED',
    resource: 'historical_event',
    resourceId: eventId,
    status: deleted ? 'SUCCESS' : 'FAILURE',
    requestId: req.requestId
  });

  res.json({ success: deleted, backtestResult: updatedResult });
});

// ----------------------------------------------------
// 7. WHAT-IF SCENARIOS
// ----------------------------------------------------
app.post('/api/scenarios/evaluate', requireAuth, (req, res, next) => {
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
// 8. DAILY DESTINY
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
// 9. AI CONVERSATIONAL ASSISTANT (GEMINI + GROUNDED FALLBACK)
// ----------------------------------------------------
app.post('/api/ai/chat', requireAuth, async (req, res, next) => {
  try {
    if (!checkRateLimit(req, res, 30)) return;

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

    // Extract exact factual values computed by the deterministic calculation engine
    const baziPillars = `Tứ Trụ: Năm [${STEMS[calc.bazi.yearPillar.stem].nameVi} ${BRANCHES[calc.bazi.yearPillar.branch].nameVi} (${calc.bazi.yearPillar.naYin}) - ${calc.bazi.yearPillar.tenGod}], ` +
      `Tháng [${STEMS[calc.bazi.monthPillar.stem].nameVi} ${BRANCHES[calc.bazi.monthPillar.branch].nameVi} (${calc.bazi.monthPillar.naYin}) - ${calc.bazi.monthPillar.tenGod}], ` +
      `Ngày [${STEMS[calc.bazi.dayPillar.stem].nameVi} ${BRANCHES[calc.bazi.dayPillar.branch].nameVi} (${calc.bazi.dayPillar.naYin}) - Nhật Chủ ${STEMS[calc.bazi.dayMaster].nameVi}], ` +
      `Giờ [${STEMS[calc.bazi.hourPillar.stem].nameVi} ${BRANCHES[calc.bazi.hourPillar.branch].nameVi} (${calc.bazi.hourPillar.naYin}) - ${calc.bazi.hourPillar.tenGod}]`;

    const baziBalance = `Nhật Chủ: ${STEMS[calc.bazi.dayMaster].nameVi} (${calc.bazi.dayMasterElement} - ${calc.bazi.dayMasterStrength}). ` +
      `Phân bổ Ngũ hành: Kim ${calc.bazi.elementBalance.Metal}%, Mộc ${calc.bazi.elementBalance.Wood}%, Thủy ${calc.bazi.elementBalance.Water}%, Hỏa ${calc.bazi.elementBalance.Fire}%, Thổ ${calc.bazi.elementBalance.Earth}%. ` +
      `Dụng Thần: [${calc.bazi.favorableElements.join(', ')}], Kỵ Thần: [${calc.bazi.unfavorableElements.join(', ')}], Cách Cục: ${calc.bazi.structureType}`;

    const lifeStars = calc.ziwei.palaces.life?.majorStars?.map(s => `${s.nameVi} (${s.brightness})${s.transformation ? ' ' + s.transformation : ''}`).join(', ') || 'Mệnh Vô Chính Diệu';
    const careerStars = calc.ziwei.palaces.career?.majorStars?.map(s => `${s.nameVi} (${s.brightness})${s.transformation ? ' ' + s.transformation : ''}`).join(', ') || 'Quan Lộc Vô Chính Diệu';
    const wealthStars = calc.ziwei.palaces.wealth?.majorStars?.map(s => `${s.nameVi} (${s.brightness})${s.transformation ? ' ' + s.transformation : ''}`).join(', ') || 'Tài Bạch Vô Chính Diệu';

    const ziweiDetails = `Cục: ${calc.ziwei.elementBureau}, Cung Thân: Cư ${calc.ziwei.palaces[calc.ziwei.bodyPalaceKey]?.nameVi || 'Quan Lộc'}. ` +
      `Mệnh tại ${calc.ziwei.palaces.life?.branch} (${lifeStars} - Điểm: ${calc.ziwei.palaces.life?.score}/100). ` +
      `Quan Lộc tại ${calc.ziwei.palaces.career?.branch} (${careerStars} - Điểm: ${calc.ziwei.palaces.career?.score}/100). ` +
      `Tài Bạch tại ${calc.ziwei.palaces.wealth?.branch} (${wealthStars} - Điểm: ${calc.ziwei.palaces.wealth?.score}/100). ` +
      `Cách Cục Tử Vi: ${calc.ziwei.majorConfigurations.join('; ')}`;

    const currentYear = new Date().getFullYear();
    const currentTransit = calc.annualTransits.find(t => t.year === currentYear) || calc.annualTransits[0];
    const transitDetails = currentTransit ? `Lưu Niên ${currentYear} (${STEMS[currentTransit.stem].nameVi} ${BRANCHES[currentTransit.branch].nameVi} - ${currentTransit.tenGod}): ` +
      `Sóng Cơ Hội: ${currentTransit.opportunityWave}%, Sóng Thận Trọng: ${currentTransit.cautionWave}%, Điểm tổng thể: ${currentTransit.overallScore}/100. ` +
      `Trọng tâm: ${currentTransit.recommendedFocus}` : 'Đang tính toán chu kỳ Lưu Niên';

    const backtestSummary = `Chỉ số Tương Hợp Lịch Sử: ${bt.destinyConsistencyScore}/100 (Chỉ số Bất Định: ${calc.confidence.uncertaintyIndex}/100)`;

    let responseContent = '';
    let confidenceScore = 90;
    const ai = getGemini();

    if (ai) {
      try {
        const prompt = `
Bạn là Master Destiny AI của nền tảng "Aurora Destiny AI" (Khẩu hiệu: "Understand the patterns. Shape your future.").

QUY TẮC BẢO ĐẢM TÍNH XÁC THỰC & ĐẠO ĐỨC NGHỀ NGHIỆP:
1. ĐỘ CHÍNH XÁC TUYỆT ĐỐI THEO LÁ SỐ ĐÃ TÍNH TOÁN:
   - Tất cả dữ liệu Bát Tự (Tứ Trụ, Thập Thần, Ngũ Hành, Dụng Thần, Cách Cục) và Tử Vi (Chính tinh, Phụ tinh, Tứ Hóa, Cung vị, Cục) đã được Bộ Vi Xử Lý Thiên Văn Tính Toán Chính Xác 100% bên dưới.
   - TUYỆT ĐỐI KHÔNG tự ý bịa thêm các sao khác, không tự bịa cách cục không tồn tại trong dữ liệu được cấp.
   - BẮT BUỘC TRÍCH DẪN NGUỒN CỤ THỂ: Khi phân tích bất kỳ khía cạnh nào, BẮT BUỘC phải trích dẫn tên cụ thể của sao (kèm độ sáng Miếu/Vượng/Đắc/Hãm), thập thần, hoặc hành ngũ hành từ dữ liệu dưới đây làm bằng chứng.
2. KHÔNG MÊ TÍN DỊ ĐOAN:
   - Bạn là Chuyên gia Phân tích Dữ liệu Vận trình & Chiến lược gia Quản trị Rủi ro.
   - Không phán xét số phận cố định, không khẳng định tương lai 100%. Luôn nhấn mạnh quyền tự chủ, năng lực thực thi và tư duy chiến lược của con người.
3. KẾT HỢP TOÀN DIỆN:
   - Kết hợp hài hòa giữa Bát Tự (cốt lõi năng lượng bên trong, Dụng Thần), Tử Vi (bố cục cung vị, tinh bàn hành động) và Lưu Niên thời vận hiện tại.

DỮ LIỆU LÁ SỐ ĐÃ XÁC THỰC:
- Họ tên: ${profile.name}
- Giới tính: ${profile.birthData?.gender === 'Male' ? 'Nam mạng' : 'Nữ mạng'}
- Bát Tự Tứ Trụ: ${baziPillars}
- Ngũ Hành & Cấu Trúc: ${baziBalance}
- Tử Vi Đẩu Số: ${ziweiDetails}
- Lưu Niên Hiện Tại: ${transitDetails}
- Bối Cảnh Người Dùng: Mục tiêu hàng đầu: "${profile.behavioralContext?.topPriority || 'Phát triển toàn diện'}", Lĩnh vực: "${profile.behavioralContext?.careerField || 'Tự do'}"
- Đo Lường Đối Sánh Lịch Sử: ${backtestSummary}

CÂU HỎI CỦA NGƯỜI DÙNG:
"${validated.message}"

HƯỚNG DẪN TRẢ LỜI:
- Trả lời bằng tiếng Việt văn phong chuyên nghiệp, tinh tế, trang nhã, sắc sảo (khoảng 3-4 đoạn văn xúc tích, có cấu trúc rõ ràng).
- 1. Phân tích nền tảng dựa trên bằng chứng cụ thể từ lá số (sao, thập thần, ngũ hành).
- 2. Tác động của chu kỳ thời điểm hiện tại và tính khả thi đối với câu hỏi người dùng.
- 3. Ranh giới rủi ro / điểm mù cần lưu tâm.
- 4. Gợi ý hành động chiến lược thiết thực và truyền cảm hứng tự chủ.
`;

        const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        let geminiRes: any;
        try {
          geminiRes = await ai.models.generateContent({
            model: primaryModel,
            contents: prompt
          });
        } catch (primaryErr: any) {
          console.warn(`[Gemini API] Primary model "${primaryModel}" failed, trying fallback:`, primaryErr?.message || primaryErr);
          const fallbackModel = 'gemini-2.0-flash';
          geminiRes = await ai.models.generateContent({
            model: fallbackModel,
            contents: prompt
          });
        }

        responseContent = geminiRes.text?.trim() || '';
        confidenceScore = 95;
      } catch (err: any) {
        console.warn('[Gemini API] Request failed, activating structured deterministic fallback interpretation:', err?.message || err);
      }
    }

    // High-fidelity structured fallback grounded in deterministic calculation engine
    if (!responseContent) {
      const transitDesc = currentTransit
        ? `Năm ${currentYear} (${currentTransit.stem} ${currentTransit.branch}) mang Sóng Cơ Hội đạt ${currentTransit.opportunityWave}%, Sóng Thận Trọng ở mức ${currentTransit.cautionWave}%. Khuyến nghị: ${currentTransit.recommendedFocus}.`
        : `Lưu Niên ${currentYear} đang trong chu kỳ tích lũy năng lượng ổn định.`;

      responseContent = `Dựa trên phân tích xác thực từ Bát Tự và Tử Vi Đẩu Số của bạn:\n\n` +
        `1. **Căn cứ Bản Mệnh & Bát Tự**: Bạn mang Nhật Chủ ${calc.bazi.dayMaster} (${calc.bazi.dayMasterElement} - ${calc.bazi.dayMasterStrength}), đắc Cách Cục **${calc.bazi.structureType}**. Dụng Thần tối ưu là hành **${calc.bazi.favorableElements.join(', ')}**, giúp điều hòa dòng năng lượng và gia tăng sức bật trong lĩnh vực "${profile.behavioralContext?.careerField || 'sự nghiệp'}".\n\n` +
        `2. **Thế Tinh Bàn Tử Vi**: Cung Mệnh tại ${calc.ziwei.palaces.life?.branch} tọa thủ ${lifeStars}, hội tụ cùng Cung Quan Lộc (${careerStars}) và Cung Tài Bạch (${wealthStars}). Thế cờ tinh hoa này (${calc.ziwei.majorConfigurations.join(', ')}) tạo nền móng vững chắc cho khả năng quản trị và hoạch định chiến lược dài hạn.\n\n` +
        `3. **Lưu Niên ${currentYear} & Định Hướng**: ${transitDesc} Hãy duy trì kỷ luật quản trị rủi ro và tận dụng tối đa năng lượng Dụng Thần để bứt phá.`;
      confidenceScore = 90;
    }

    const assistantMsg = {
      id: `msg_a_${Date.now()}`,
      sender: 'assistant' as const,
      content: responseContent,
      timestamp: new Date().toISOString(),
      confidenceScore,
      suggestedQuestions: [
        'Giai đoạn nào trong năm nay có sóng năng lượng thuận lợi nhất?',
        `Làm thế nào để ứng dụng Dụng Thần ${calc.bazi.favorableElements.join('/')} vào quản trị tài chính?`,
        'Điểm mù lớn nhất cần phòng tránh trong các thương vụ hợp tác là gì?'
      ],
      groundedFacts: [
        `Bát Tự: Nhật Chủ ${calc.bazi.dayMaster} (${calc.bazi.dayMasterStrength}) - Cách Cục: ${calc.bazi.structureType}`,
        `Dụng Thần: ${calc.bazi.favorableElements.join(', ')} | Kỵ Thần: ${calc.bazi.unfavorableElements.join(', ')}`,
        `Tử Vi: Cung Mệnh (${lifeStars}) tại ${calc.ziwei.palaces.life?.branch} - Cục: ${calc.ziwei.elementBureau}`,
        `Tam Phương Tứ Chính: Quan Lộc (${careerStars}), Tài Bạch (${wealthStars})`,
        currentTransit ? `Lưu Niên ${currentYear}: Sóng cơ hội ${currentTransit.opportunityWave}% - Sóng thận trọng ${currentTransit.cautionWave}%` : `Lưu Niên ${currentYear}`,
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
// 10. AUDIT LOGS & ADMIN (PRIVACY HARDENED)
// ----------------------------------------------------
app.get('/api/audit-logs', requireAdmin, (req, res) => {
  const logs = repository.getAuditLogs(100);
  res.json(logs);
});

app.get('/api/feature-flags', (req, res) => {
  res.json(repository.getFeatureFlags());
});

app.post('/api/feature-flags/toggle', requireAdmin, (req, res, next) => {
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

// Privacy Export: Strict user ownership check
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
// 11. CENTRALIZED ERROR HANDLING MIDDLEWARE
// ----------------------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Handle Zod validation errors cleanly
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

  // Handle known application errors
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
// 12. VITE MIDDLEWARE & STATIC ASSETS
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Aurora Destiny AI Production Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();

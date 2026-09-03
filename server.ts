// ==========================================
// AURORA DESTINY AI — FULL-STACK SERVER
// ==========================================

import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/services/db';
import { runFullDestinyCalculation } from './src/engine/destinyEngine';
import { runBacktestAnalysis } from './src/engine/backtesting';
import { evaluateWhatIfScenario } from './src/engine/scenarios';
import { generateMultiAgentEnsemble, computeDailyDestiny } from './src/services/aiSynthesizer';
import { runAllEngineTests } from './src/engine/engine.test';
import { BirthData } from './src/types/destiny';
import { UserProfile } from './src/types/user';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy-initialized Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

// ----------------------------------------------------
// 1. HEALTH & SYSTEM METRICS
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Aurora Destiny AI',
    version: '2.4.1',
    serverTimestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    calculationEngine: 'Deterministic v2.4.1'
  });
});

app.get('/api/metrics', (req, res) => {
  const metrics = db.getObservabilityMetrics();
  res.json(metrics);
});

app.get('/api/tests/run', (req, res) => {
  const report = runAllEngineTests();
  res.json(report);
});

// ----------------------------------------------------
// 2. USER & PROFILE MANAGEMENT
// ----------------------------------------------------
app.get('/api/user', (req, res) => {
  res.json({
    user: db.getUser(),
    preferences: db.getPreferences()
  });
});

app.post('/api/user/preferences', (req, res) => {
  const updated = db.updatePreferences(req.body);
  res.json(updated);
});

app.get('/api/profiles', (req, res) => {
  res.json(db.getProfiles());
});

app.post('/api/profiles', (req, res) => {
  const { name, birthData, behavioralContext, isPrimary } = req.body;
  const newProfile: UserProfile = {
    id: `prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: db.getUser().id,
    name: name || 'Hồ Sơ Mới',
    isPrimary: isPrimary || false,
    avatarSeed: `avatar_${Date.now()}`,
    birthData: birthData as BirthData,
    behavioralContext: behavioralContext || {
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

  const calc = runFullDestinyCalculation(newProfile.birthData, newProfile.id, 0);
  newProfile.latestCalculationId = calc.id;
  db.saveCalculation(calc);
  db.saveProfile(newProfile);

  res.json({ profile: newProfile, calculation: calc });
});

app.put('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.getProfile(id);
  if (!existing) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const updatedProfile = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  if (req.body.birthData) {
    const calc = runFullDestinyCalculation(req.body.birthData, id, db.getHistoricalEvents(id).length);
    updatedProfile.latestCalculationId = calc.id;
    db.saveCalculation(calc);
  }

  db.saveProfile(updatedProfile);
  res.json(updatedProfile);
});

app.delete('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const success = db.deleteProfile(id);
  res.json({ success });
});

// ----------------------------------------------------
// 3. CALCULATION & ENSEMBLE AI
// ----------------------------------------------------
app.get('/api/calculations/:profileId', (req, res) => {
  const { profileId } = req.params;
  const profile = db.getProfile(profileId) || db.getProfiles()[0];
  if (!profile) {
    return res.json({ calculation: null, ensemble: null, backtest: null });
  }
  const calc = db.getLatestCalculationForProfile(profile.id);
  if (!calc) {
    return res.json({ calculation: null, ensemble: null, backtest: null });
  }
  const bt = db.getBacktestResult(profile.id);
  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);

  res.json({ calculation: calc, ensemble, backtest: bt });
});

app.post('/api/calculations/recalculate', (req, res) => {
  const { profileId } = req.body;
  const profile = db.getProfile(profileId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const events = db.getHistoricalEvents(profileId);
  const calc = runFullDestinyCalculation(profile.birthData, profileId, events.length);
  db.saveCalculation(calc);

  const bt = runBacktestAnalysis(events, calc);
  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);

  res.json({ calculation: calc, ensemble, backtest: bt });
});

// ----------------------------------------------------
// 4. BACKTESTING STUDIO
// ----------------------------------------------------
app.get('/api/backtests/:profileId', (req, res) => {
  const { profileId } = req.params;
  const events = db.getHistoricalEvents(profileId);
  const result = db.getBacktestResult(profileId);
  res.json({ events, result });
});

app.post('/api/backtests/event', (req, res) => {
  const { profileId, year, month, title, category, impact, intensity, description, userConfidence, evidenceNote } = req.body;
  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    profileId,
    year: Number(year),
    month: month ? Number(month) : undefined,
    title,
    category,
    impact,
    intensity: Number(intensity || 3),
    description: description || '',
    userConfidence: Number(userConfidence || 5),
    evidenceNote: evidenceNote || '',
    createdAt: new Date().toISOString()
  };

  db.addHistoricalEvent(event);
  const updatedResult = db.getBacktestResult(profileId);
  res.json({ event, backtestResult: updatedResult });
});

app.delete('/api/backtests/event/:profileId/:eventId', (req, res) => {
  const { profileId, eventId } = req.params;
  db.deleteHistoricalEvent(profileId, eventId);
  const updatedResult = db.getBacktestResult(profileId);
  res.json({ success: true, backtestResult: updatedResult });
});

// ----------------------------------------------------
// 5. WHAT-IF SCENARIOS
// ----------------------------------------------------
app.post('/api/scenarios/evaluate', (req, res) => {
  const { profileId, question } = req.body;
  const calc = db.getLatestCalculationForProfile(profileId);
  const result = evaluateWhatIfScenario(question || 'Điều gì xảy ra nếu tôi thay đổi định hướng sự nghiệp?', calc);
  res.json(result);
});

// ----------------------------------------------------
// 6. DAILY DESTINY
// ----------------------------------------------------
app.get('/api/daily/:profileId', (req, res) => {
  const { profileId } = req.params;
  const calc = db.getLatestCalculationForProfile(profileId);
  const daily = computeDailyDestiny(calc);
  res.json(daily);
});

// ----------------------------------------------------
// 7. AI CONVERSATIONAL ASSISTANT (GEMINI + FALLBACK)
// ----------------------------------------------------
app.post('/api/ai/chat', async (req, res) => {
  const { profileId, message } = req.body;
  const profile = db.getProfile(profileId) || db.getProfiles()[0];
  const calc = db.getLatestCalculationForProfile(profileId);
  const bt = db.getBacktestResult(profileId);

  // Save user message
  const userMsg = {
    id: `msg_u_${Date.now()}`,
    sender: 'user' as const,
    content: message,
    timestamp: new Date().toISOString()
  };
  db.addChatMessage(profileId, userMsg);

  const baziSummary = `Nhật Chủ: ${calc.bazi.dayMaster} (${calc.bazi.dayMasterElement} - ${calc.bazi.dayMasterStrength}), Dụng Thần: ${calc.bazi.favorableElements.join(', ')}, Cách Cục: ${calc.bazi.structureType}`;
  const ziweiSummary = `Cung Mệnh: ${calc.ziwei.palaces.life?.majorStars.map(s => s.nameVi).join(', ')}, Cục: ${calc.ziwei.elementBureau}`;
  const backtestSummary = `Độ nhất quán Backtest Score: ${bt.destinyConsistencyScore}/100`;

  let responseContent = '';
  let confidenceScore = 90;
  const ai = getGemini();

  if (ai) {
    try {
      const prompt = `
Bạn là Master Destiny AI của nền tảng cao cấp "Aurora Destiny AI" (Khẩu hiệu: "Understand the patterns. Shape your future.").
Quy tắc đạo đức và chuyên môn cốt lõi:
1. Bạn KHÔNG PHẢI thầy bói mê tín. Bạn là Chuyên gia Phân tích Dữ liệu Vận trình & Trực giác Chiến lược cao cấp.
2. NGUỒN CHÂN LÝ: Bát tự và Tử vi đã được Calculation Engine tính toán bất biến. Tuyệt đối không tự bịa lá số khác.
3. Không bao giờ cam kết 100% hay khẳng định tương lai cố định. Sử dụng các khái niệm: Xu hướng năng lượng, Sóng cơ hội, Độ tin cậy mô hình, Ranh giới bất định.
4. Lời khuyên cho người dùng phải mang tính hành động, thực tế, thanh lịch, trang trọng và truyền cảm hứng tự chủ.

DỮ LIỆU LÁ SỐ ĐÃ XÁC THỰC CỦA NGƯỜI DÙNG:
- Tên: ${profile.name}
- Bát Tự: ${baziSummary}
- Tử Vi: ${ziweiSummary}
- Bối cảnh hành vi: Ưu tiên: ${profile.behavioralContext.topPriority}, Nghề nghiệp: ${profile.behavioralContext.careerField}
- Backtest Lịch sử: ${backtestSummary}

CÂU HỎI CỦA NGƯỜI DÙNG:
"${message}"

Hãy trả lời ngắn gọn, sắc sảo (khoảng 3-4 đoạn văn xúc tích), phân tích dựa trên sự kết hợp giữa Bát Tự, Tử Vi và chu kỳ thời điểm hiện tại, nêu rõ rủi ro cần chú ý và gợi ý hành động chiến lược.
`;

      // Sử dụng mô hình Gemini chính thức và ổn định: 'gemini-3.8-flash'
      const geminiRes = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        contents: prompt
      });

      responseContent = geminiRes.text?.trim() || '';
      confidenceScore = 94;
    } catch (err: any) {
      console.warn('Gemini API query error, using structured fallback:', err?.message);
    }
  }

  // Fallback intelligent response if Gemini is not available
  if (!responseContent) {
    const currentYear = new Date().getFullYear();
    const transit = calc.annualTransits.find(t => t.year === currentYear) || calc.annualTransits[0];
    responseContent = `Dựa trên dữ liệu lá số ${calc.bazi.structureType} và Nhật chủ ${calc.bazi.dayMasterElement} (${calc.bazi.dayMasterStrength}):\n\n` +
      `1. **Xu hướng năng lượng**: Năm ${currentYear} (${transit.stem} ${transit.branch}) mang sóng cơ hội đạt ${transit.opportunityWave}%. Hành Dụng Thần (${calc.bazi.favorableElements.join(', ')}) đang trong chu kỳ tương sinh, tạo tiền đề thuận lợi cho mục tiêu "${profile.behavioralContext.topPriority || 'phát triển sự nghiệp'}".\n\n` +
      `2. **Điểm tựa chiến lược**: Cung Quan Lộc và Tài Bạch của bạn hội tụ các trợ tinh vững chắc. Khi bạn tập trung vào chuyên môn hóa và xây dựng đối tác cùng chí hướng, tỷ lệ thành công sẽ được tối ưu hóa.\n\n` +
      `3. **Ranh giới bất định & Lưu ý**: Sóng thận trọng năm nay ở mức ${transit.cautionWave}%. Hãy đảm bảo giữ quỹ dự phòng và tránh đưa ra quyết định tài chính mạo hiểm vào các tháng xung khắc ngũ hành.`;
    confidenceScore = 88;
  }

  const assistantMsg = {
    id: `msg_a_${Date.now()}`,
    sender: 'assistant' as const,
    content: responseContent,
    timestamp: new Date().toISOString(),
    confidenceScore,
    suggestedQuestions: [
      'Giai đoạn nào trong năm nay có sóng năng lượng cao nhất?',
      'Cách khắc phục nhược điểm ngũ hành trong công việc hàng ngày?',
      'Tôi nên ưu tiên mở rộng hay củng cố nội lực lúc này?'
    ],
    groundedFacts: [
      baziSummary,
      ziweiSummary,
      `Chỉ số nhất quán Backtest: ${bt.destinyConsistencyScore}/100`
    ]
  };

  db.addChatMessage(profileId, assistantMsg);
  res.json(assistantMsg);
});

// ----------------------------------------------------
// 8. AUDIT LOGS & PRIVACY EXPORT
// ----------------------------------------------------
app.get('/api/audit-logs', (req, res) => {
  res.json(db.getAuditLogs());
});

app.get('/api/feature-flags', (req, res) => {
  res.json(db.getFeatureFlags());
});

app.post('/api/feature-flags/toggle', (req, res) => {
  const { key, enabled } = req.body;
  res.json(db.toggleFeatureFlag(key, enabled));
});

app.get('/api/export/:profileId', (req, res) => {
  const { profileId } = req.params;
  const jsonStr = db.exportFullUserData(profileId);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="aurora_destiny_${profileId}.json"`);
  res.send(jsonStr);
});

// ----------------------------------------------------
// 9. VITE MIDDLEWARE & STATIC SERVING
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
    console.log(`✨ Aurora Destiny AI Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();

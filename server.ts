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
import { BirthData } from './src/types/destiny';
import { UserProfile } from './src/types/user';
import { STEMS, BRANCHES } from './src/engine/canchi';

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

  // High-precision factual summaries extracted directly from the deterministic calculation engine
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
  const travelStars = calc.ziwei.palaces.travel?.majorStars?.map(s => `${s.nameVi} (${s.brightness})`).join(', ') || 'Thiên Di';

  const ziweiDetails = `Cục: ${calc.ziwei.elementBureau}, Cung Thân: Cư ${calc.ziwei.palaces[calc.ziwei.bodyPalaceKey]?.nameVi || 'Quan Lộc'}. ` +
    `Mệnh tại ${calc.ziwei.palaces.life?.branch} (${lifeStars} - Điểm: ${calc.ziwei.palaces.life?.score}/100). ` +
    `Quan Lộc tại ${calc.ziwei.palaces.career?.branch} (${careerStars} - Điểm: ${calc.ziwei.palaces.career?.score}/100). ` +
    `Tài Bạch tại ${calc.ziwei.palaces.wealth?.branch} (${wealthStars} - Điểm: ${calc.ziwei.palaces.wealth?.score}/100). ` +
    `Thiên Di tại ${calc.ziwei.palaces.travel?.branch} (${travelStars} - Điểm: ${calc.ziwei.palaces.travel?.score}/100). ` +
    `Cách Cục Tử Vi: ${calc.ziwei.majorConfigurations.join('; ')}`;

  const currentYear = new Date().getFullYear();
  const currentTransit = calc.annualTransits.find(t => t.year === currentYear) || calc.annualTransits[0];
  const transitDetails = `Lưu Niên ${currentYear} (${STEMS[currentTransit.stem].nameVi} ${BRANCHES[currentTransit.branch].nameVi} - ${currentTransit.tenGod}): ` +
    `Sóng Cơ Hội: ${currentTransit.opportunityWave}%, Sóng Thận Trọng: ${currentTransit.cautionWave}%, Điểm tổng thể: ${currentTransit.overallScore}/100. ` +
    `Trọng tâm khuyến nghị: ${currentTransit.recommendedFocus}`;

  const backtestSummary = `Chỉ số Nhất quán Backtest: ${bt.destinyConsistencyScore}/100 (Chỉ số Bất định: ${calc.confidence.uncertaintyIndex}/100)`;

  let responseContent = '';
  let confidenceScore = 92;
  const ai = getGemini();

  if (ai) {
    try {
      const prompt = `
Bạn là Master Destiny AI của nền tảng cao cấp "Aurora Destiny AI" (Khẩu hiệu: "Understand the patterns. Shape your future.").

QUY TẮC ĐẠO ĐỨC & CHUYÊN MÔN CAO NHẤT (BẮT BUỘC TUÂN THỦ):
1. ĐỘ CHÍNH XÁC TUYỆT ĐỐI - KHÔNG BỊA ĐẶT THÊM BỚT:
   - Tất cả dữ liệu Bát Tự (Tứ Trụ, Thập Thần, Ngũ Hành, Dụng Thần, Cách Cục) và Tử Vi (Chính tinh, Phụ tinh, Tứ Hóa, Cung vị, Cục) đã được Bộ Vi Xử Lý Thiên Văn Tính Toán Chính Xác 100% bên dưới.
   - TUYỆT ĐỐI KHÔNG tự ý bịa thêm các sao khác, không tự bịa cách cục không tồn tại trong dữ liệu được cấp.
   - BẮT BUỘC TRÍCH DẪN NGUỒN CỤ THỂ: Khi phân tích bất kỳ khía cạnh nào (sự nghiệp, tài lộc, tình cảm, sức khỏe, thời cơ), BẮT BUỘC phải trích dẫn tên cụ thể của sao (kèm độ sáng Miếu/Vượng/Đắc/Hãm), thập thần, hoặc hành ngũ hành từ dữ liệu dưới đây làm bằng chứng xác thực.
2. KHÔNG PHẢI THẦY BÓI MÊ TÍN:
   - Bạn là Chuyên gia Phân tích Dữ liệu Vận trình & Chiến lược gia Quản trị Rủi ro.
   - Không phán xét số phận cố định, không hù dọa, không khẳng định 100%. Luôn nhấn mạnh quyền tự chủ, năng lực thực thi và tư duy chiến lược của con người.
3. PHÂN TÍCH TOÀN DIỆN & CÂN BẰNG:
   - Kết hợp hài hòa giữa Bát Tự (cốt lõi năng lượng bên trong, Dụng Thần), Tử Vi (bố cục cung vị, tinh bàn hành động) và Lưu Niên thời vận hiện tại.
   - Chỉ rõ cả mặt cơ hội lẫn ranh giới rủi ro cần kiểm soát.

DỮ LIỆU LÁ SỐ ĐÃ XÁC THỰC CỦA NGƯỜI DÙNG:
- Họ tên: ${profile.name}
- Giới tính: ${profile.birthData?.gender === 'Male' ? 'Nam mạng' : 'Nữ mạng'}
- Bát Tự Tứ Trụ: ${baziPillars}
- Ngũ Hành & Cấu Trúc: ${baziBalance}
- Tử Vi Đẩu Số: ${ziweiDetails}
- Lưu Niên Hiện Tại: ${transitDetails}
- Bối Cảnh Người Dùng: Mục tiêu hàng đầu: "${profile.behavioralContext.topPriority}", Nghề nghiệp: "${profile.behavioralContext.careerField}"
- Đo Lường Lịch Sử: ${backtestSummary}

CÂU HỎI CỦA NGƯỜI DÙNG:
"${message}"

HƯỚNG DẪN TRẢ LỜI:
- Trả lời bằng tiếng Việt văn phong chuyên nghiệp, tinh tế, trang nhã, sắc sảo (khoảng 3-4 đoạn văn xúc tích, có cấu trúc rõ ràng).
- Nêu rõ:
  1. Phân tích nền tảng dựa trên bằng chứng cụ thể từ lá số (sao, thập thần, ngũ hành).
  2. Tác động của chu kỳ thời điểm hiện tại và tính khả thi đối với câu hỏi người dùng.
  3. Ranh giới rủi ro / điểm mù cần lưu tâm.
  4. Gợi ý hành động chiến lược thiết thực và truyền cảm hứng tự chủ.
`;

      // Ưu tiên model 'gemini-3.7-flash' (hoặc qua biến môi trường GEMINI_MODEL), với fallback an toàn sang 'gemini-2.0-flash' nếu gặp lỗi 404 Model Not Found
      const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
      let geminiRes: any;
      try {
        geminiRes = await ai.models.generateContent({
          model: primaryModel,
          contents: prompt
        });
      } catch (primaryErr: any) {
        console.error(`Gemini API error with primary model "${primaryModel}":`, primaryErr);
        // Fallback model an toàn nếu model chính gặp sự cố (như 404 Not Found)
        const fallbackModel = 'gemini-2.0-flash';
        console.warn(`Attempting safe fallback to "${fallbackModel}"...`);
        geminiRes = await ai.models.generateContent({
          model: fallbackModel,
          contents: prompt
        });
      }

      responseContent = geminiRes.text?.trim() || '';
      confidenceScore = 95;
    } catch (err: any) {
      console.warn('[Gemini API Error] Query failed, using structured fallback. Details:', err?.message || err);
    }
  }

  // Fallback intelligent response strictly grounded in verified calculation data if Gemini is not available
  if (!responseContent) {
    responseContent = `Dựa trên phân tích xác thực từ Bát Tự và Tử Vi Đẩu Số của bạn:\n\n` +
      `1. **Căn cứ Bản Mệnh & Bát Tự**: Bạn mang Nhật Chủ ${calc.bazi.dayMaster} (${calc.bazi.dayMasterElement} - ${calc.bazi.dayMasterStrength}), đắc Cách Cục **${calc.bazi.structureType}**. Dụng Thần tối ưu là hành **${calc.bazi.favorableElements.join(', ')}**, giúp điều hòa dòng năng lượng và gia tăng sức bật trong lĩnh vực "${profile.behavioralContext.careerField}".\n\n` +
      `2. **Thế Tinh Bàn Tử Vi**: Cung Mệnh tại ${calc.ziwei.palaces.life?.branch} tọa thủ ${lifeStars}, hội tụ cùng Cung Quan Lộc (${careerStars}) và Cung Tài Bạch (${wealthStars}). Thế cờ tinh hoa này (${calc.ziwei.majorConfigurations.join(', ')}) tạo nền móng vững chắc cho khả năng quản trị và hoạch định chiến lược dài hạn.\n\n` +
      `3. **Lưu Niên ${currentYear} & Định Hướng**: Năm ${currentYear} (${currentTransit.stem} ${currentTransit.branch}) mang Sóng Cơ Hội đạt ${currentTransit.opportunityWave}%, Sóng Thận Trọng ở mức ${currentTransit.cautionWave}%. Khuyến nghị: ${currentTransit.recommendedFocus}. Hãy duy trì kỷ luật quản trị rủi ro và tận dụng tối đa năng lượng Dụng Thần để bứt phá.`;
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
      `Lưu Niên ${currentYear}: Sóng cơ hội ${currentTransit.opportunityWave}% - Sóng thận trọng ${currentTransit.cautionWave}%`,
      `Chỉ số Nhất Quán Backtest: ${bt.destinyConsistencyScore}/100`
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

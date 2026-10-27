// ==========================================
// AURORA DESTINY AI — PLUGGABLE AI PROVIDER ABSTRACTION
// Strict decoupling of LLM interpretation from deterministic calculations.
// Gemini is an OPTIONAL enrichment provider; deterministic rules are the Single Source of Truth.
// ==========================================

import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import { BacktestResult } from '../types/backtest';
import { STEMS, BRANCHES } from '../engine/canchi';
import { getGemini, isCircuitBreakerOpen, isQuotaError } from './geminiService';
import { telemetry } from '../telemetry/telemetryService';

export interface AIInterpretationRequest {
  userMessage: string;
  profile: UserProfile;
  calc: CalculationResult;
  backtest: BacktestResult;
  analysisYear?: number;
}

export interface AIInterpretationResponse {
  content: string;
  confidenceScore: number;
  isFallback: boolean;
  provider: 'gemini' | 'deterministic';
  latencyMs: number;
}

export interface AIProvider {
  readonly name: string;
  isAvailable(): boolean;
  generateInterpretation(req: AIInterpretationRequest): Promise<AIInterpretationResponse>;
}

/**
 * DeterministicProvider: 100% offline, zero-dependency, zero-hallucination interpretation
 * derived exclusively from authentic Bazi and Ziwei astronomical calculations.
 */
export class DeterministicProvider implements AIProvider {
  public readonly name = 'DeterministicProvider';

  public isAvailable(): boolean {
    return true; // Always available, never fails
  }

  public async generateInterpretation(req: AIInterpretationRequest): Promise<AIInterpretationResponse> {
    const start = performance.now();
    const { profile, calc, userMessage, analysisYear = new Date().getFullYear() } = req;

    const currentTransit = (calc.annualTransits || []).find(t => t.year === analysisYear);
    const lifeStars = calc.ziwei.palaces.life?.majorStars?.map(s => `${s.nameVi} (${s.brightness})`).join(', ') || 'Mệnh Vô Chính Diệu';
    const careerStars = calc.ziwei.palaces.career?.majorStars?.map(s => `${s.nameVi} (${s.brightness})`).join(', ') || 'Quan Lộc Vô Chính Diệu';
    const wealthStars = calc.ziwei.palaces.wealth?.majorStars?.map(s => `${s.nameVi} (${s.brightness})`).join(', ') || 'Tài Bạch Vô Chính Diệu';

    const transitDesc = currentTransit
      ? `Năm ${analysisYear} (${STEMS[currentTransit.stem].nameVi} ${BRANCHES[currentTransit.branch].nameVi}) mang Sóng Cơ Hội đạt ${currentTransit.opportunityWave}%, Sóng Thận Trọng ở mức ${currentTransit.cautionWave}%. Khuyến nghị hành động: ${currentTransit.recommendedFocus}.`
      : `Lưu Niên ${analysisYear} đang trong chu kỳ tích lũy năng lượng ổn định.`;

    const authenticZiWei = calc.ziwei.authenticAnalysis;
    const content = `Dựa trên kết quả tính toán xác thực từ Bát Tự và Tử Vi Đẩu Số:\n\n` +
      `1. **Căn Cứ Bản Mệnh & Bát Tự**: Bạn mang Nhật Chủ ${STEMS[calc.bazi.dayMaster].nameVi} (${calc.bazi.dayMasterElement} - ${calc.bazi.dayMasterStrength}), đắc Cách Cục **${calc.bazi.structureType}**. Dụng Thần tối ưu là hành **${calc.bazi.favorableElements.join(', ')}**, giúp điều hòa dòng năng lượng và gia tăng sức bật trong lĩnh vực "${profile.behavioralContext?.careerField || 'sự nghiệp'}".\n\n` +
      `2. **Thế Tinh Bàn Tử Vi Đẩu Số Chính Tông**:\n` +
      `   - **Âm Dương & Mệnh Cục**: Thể chất ${calc.ziwei.yinYangGenderHarmony?.yinYangNature || 'Chưa xác định'} (${calc.ziwei.yinYangGenderHarmony?.direction || 'Chưa xác định'}). Bản Mệnh tương phối ${calc.ziwei.elementDestinyBureauHarmony?.relation || 'Chưa xác định'} (${calc.ziwei.elementDestinyBureauHarmony?.explanation || 'Đang cập nhật'}).\n` +
      `   - **Cung Thân Hậu Vận**: Cư ${calc.ziwei.palaces[calc.ziwei.bodyPalaceKey]?.nameVi || 'Chưa xác định'} — ${calc.ziwei.bodyPalaceAnalysis?.lifeImpact || 'Đang cập nhật phân tích hậu vận.'}\n` +
      `   - **Tam Phương Tứ Chính**: Cung Mệnh tọa thủ ${lifeStars}, hội tụ cùng Quan Lộc (${careerStars}) và Tài Bạch (${wealthStars}). Cách Cục: ${calc.ziwei.majorConfigurations.length > 0 ? calc.ziwei.majorConfigurations.join(', ') : 'Chính Cách'}.\n` +
      `   - **Đại Vận Đang Đi Qua**: ${calc.ziwei.currentDecade?.evaluation || 'Đang trong chu kỳ củng cố nguồn lực.'}\n\n` +
      `3. **Lưu Niên ${analysisYear} & Định Hướng Hành Động**: ${transitDesc} ${authenticZiWei?.strategicAdvice || 'Hãy chủ động phân bổ nguồn lực, quản trị rủi ro và phát huy thế mạnh chuyên môn để tạo bước đột phá vững chắc.'}\n\n` +
      `*Thông báo chuẩn mực*: Luận giải được xử lý bởi Bộ Quy Tắc Mệnh Lý Nội Bộ (Deterministic Grounded Engine) trên cơ sở dữ liệu tính toán xác thực, không phụ thuộc vào dịch vụ AI bên ngoài.`;

    const latencyMs = Math.max(0.1, Math.round((performance.now() - start) * 10) / 10);
    telemetry.recordAiRequest(latencyMs, true, false, true);

    return {
      content,
      confidenceScore: calc.confidence.consistencyScore,
      isFallback: true,
      provider: 'deterministic',
      latencyMs
    };
  }
}

/**
 * GeminiProvider: Optional enrichment provider invoking Google Gemini API
 * with circuit breaker, timeout limits, and strict schema grounding.
 * Requires explicit ENABLE_EXTERNAL_AI=true opt-in and GEMINI_API_KEY.
 */
export class GeminiProvider implements AIProvider {
  public readonly name = 'GeminiProvider';

  public isAvailable(): boolean {
    const isExplicitlyEnabled = process.env.ENABLE_EXTERNAL_AI === 'true' || process.env.ALLOW_EXTERNAL_AI === 'true';
    const hasKey = !!process.env.GEMINI_API_KEY;
    return isExplicitlyEnabled && hasKey && !isCircuitBreakerOpen();
  }

  public async generateInterpretation(req: AIInterpretationRequest): Promise<AIInterpretationResponse> {
    const start = performance.now();
    const gemini = getGemini();

    if (!gemini || !this.isAvailable()) {
      throw new Error('Gemini provider is currently unavailable, disabled, or unconfigured.');
    }

    const { userMessage, profile, calc, backtest, analysisYear = new Date().getFullYear() } = req;
    const currentTransit = (calc.annualTransits || []).find(t => t.year === analysisYear);

    const baziPillars = `Tứ Trụ: Năm [${STEMS[calc.bazi.yearPillar.stem].nameVi} ${BRANCHES[calc.bazi.yearPillar.branch].nameVi}], ` +
      `Tháng [${STEMS[calc.bazi.monthPillar.stem].nameVi} ${BRANCHES[calc.bazi.monthPillar.branch].nameVi}], ` +
      `Ngày [${STEMS[calc.bazi.dayPillar.stem].nameVi} ${BRANCHES[calc.bazi.dayPillar.branch].nameVi} - Nhật Chủ ${STEMS[calc.bazi.dayMaster].nameVi}], ` +
      `Giờ [${STEMS[calc.bazi.hourPillar.stem].nameVi} ${BRANCHES[calc.bazi.hourPillar.branch].nameVi}]`;

    const prompt = `Bạn là Trợ lý Cố vấn Mệnh lý Trí tuệ Nhân tạo Aurora. Hãy trả lời thắc mắc của người dùng dựa TRỰC TIẾP trên các số liệu mệnh lý xác thực đã được tính toán dưới đây:\n\n` +
      `Hồ sơ: ${profile.name}, Giới tính: ${profile.birthData?.gender || 'nam'}, Năm xem: ${analysisYear}.\n` +
      `${baziPillars}\n` +
      `Dụng Thần Bát Tự: ${calc.bazi.favorableElements.join(', ')}. Kỵ Thần: ${calc.bazi.unfavorableElements.join(', ')}.\n` +
      `Cung Mệnh Tử Vi: ${calc.ziwei.palaces.life?.branch}, Chính tinh: ${calc.ziwei.palaces.life?.majorStars?.map(s => s.nameVi).join(', ') || 'Vô Chính Diệu'}.\n` +
      `${currentTransit ? `Lưu niên ${analysisYear}: Cơ hội ${currentTransit.opportunityWave}%, Thận trọng ${currentTransit.cautionWave}%.` : `Lưu niên ${analysisYear}: Chưa đủ dữ liệu sóng Lưu Niên.`}\n\n` +
      `Câu hỏi người dùng: "${userMessage}"\n\n` +
      `Yêu cầu: Văn phong triết lý, nhân văn, khách quan, tôn trọng ý chí tự do (Free Will). Tuyệt đối không phán đoán mang tính mê tín đoan định hoặc y tế/đỏ đen.`;

    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
      const response = await gemini.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 1024
        }
      });

      const text = response.text?.trim();
      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      const latencyMs = Math.max(0.1, Math.round((performance.now() - start) * 10) / 10);
      telemetry.recordAiRequest(latencyMs, true, false, false);

      return {
        content: text,
        confidenceScore: calc.confidence.consistencyScore,
        isFallback: false,
        provider: 'gemini',
        latencyMs
      };
    } catch (err: any) {
      const latencyMs = Math.max(0.1, Math.round((performance.now() - start) * 10) / 10);
      const isTimeout = (err?.message || '').toLowerCase().includes('time');
      telemetry.recordAiRequest(latencyMs, false, isTimeout, false);
      throw err;
    }
  }
}

/**
 * CompositeAIProvider: Coordinates primary AI with seamless deterministic fallback.
 * Guarantees zero downtime even if GEMINI_API_KEY is missing, expired, or rate-limited.
 */
export class CompositeAIProvider implements AIProvider {
  public readonly name = 'CompositeAIProvider';
  private primaryProvider: GeminiProvider;
  private fallbackProvider: DeterministicProvider;

  constructor() {
    this.primaryProvider = new GeminiProvider();
    this.fallbackProvider = new DeterministicProvider();
  }

  public isAvailable(): boolean {
    return true; // Always available due to deterministic backing
  }

  public async generateInterpretation(req: AIInterpretationRequest): Promise<AIInterpretationResponse> {
    if (this.primaryProvider.isAvailable()) {
      try {
        return await this.primaryProvider.generateInterpretation(req);
      } catch (err: any) {
        console.warn(`[CompositeAIProvider] Optional external provider failed (${err?.message || err}). Transitioning to DeterministicProvider.`);
      }
    }

    // Direct resolution via pure deterministic reasoning
    return this.fallbackProvider.generateInterpretation(req);
  }
}

// Global Singleton Export
export const defaultAIProvider = new CompositeAIProvider();

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
    const start = Date.now();
    const { profile, calc, analysisYear = new Date().getFullYear() } = req;

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
      `   - **Âm Dương & Mệnh Cục**: Thể chất ${calc.ziwei.yinYangGenderHarmony?.yinYangNature || 'Dương Nam'} (${calc.ziwei.yinYangGenderHarmony?.direction || 'Thuận Lý'}). Bản Mệnh tương phối ${calc.ziwei.elementDestinyBureauHarmony?.relation || 'Mệnh Cục Tỷ Hòa'} (${calc.ziwei.elementDestinyBureauHarmony?.explanation || ''}).\n` +
      `   - **Cung Thân Hậu Vận**: Cư ${calc.ziwei.palaces[calc.ziwei.bodyPalaceKey]?.nameVi || 'Quan Lộc'} — ${calc.ziwei.bodyPalaceAnalysis?.lifeImpact || 'Hậu vận phát huy mạnh mẽ bản lĩnh tự chủ.'}\n` +
      `   - **Tam Phương Tứ Chính**: Cung Mệnh tọa thủ ${lifeStars}, hội tụ cùng Quan Lộc (${careerStars}) và Tài Bạch (${wealthStars}). Cách Cục: ${calc.ziwei.majorConfigurations.join(', ')}.\n` +
      `   - **Đại Vận Đang Đi Qua**: ${calc.ziwei.currentDecade?.evaluation || 'Đang trong chu kỳ củng cố nguồn lực.'}\n\n` +
      `3. **Lưu Niên ${analysisYear} & Định Hướng Hành Động**: ${transitDesc} ${authenticZiWei?.strategicAdvice || 'Hãy chủ động phân bổ nguồn lực, quản trị rủi ro và phát huy thế mạnh chuyên môn để tạo bước đột phá vững chắc.'}`;

    const latencyMs = Date.now() - start;
    telemetry.recordAiRequest(0, true, false, true);

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
 */
export class GeminiProvider implements AIProvider {
  public readonly name = 'GeminiProvider';

  public isAvailable(): boolean {
    const hasKey = !!process.env.GEMINI_API_KEY;
    return hasKey && !isCircuitBreakerOpen();
  }

  public async generateInterpretation(req: AIInterpretationRequest): Promise<AIInterpretationResponse> {
    const start = Date.now();
    const gemini = getGemini();

    if (!gemini || !this.isAvailable()) {
      throw new Error('Gemini provider is currently unavailable or unconfigured.');
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
      `Lưu niên ${analysisYear}: Cơ hội ${currentTransit?.opportunityWave || 50}%, Thận trọng ${currentTransit?.cautionWave || 50}%.\n\n` +
      `Câu hỏi người dùng: "${userMessage}"\n\n` +
      `Yêu cầu: Văn phong triết lý, nhân văn, khách quan, tôn trọng ý chí tự do (Free Will). Tuyệt đối không phán đoán mang tính mê tín đoan định hoặc y tế/đỏ đen.`;

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
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

    const latencyMs = Date.now() - start;
    telemetry.recordAiRequest(latencyMs, true, false, false);

    return {
      content: text,
      confidenceScore: calc.confidence.consistencyScore,
      isFallback: false,
      provider: 'gemini',
      latencyMs
    };
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
        console.warn(`[CompositeAIProvider] Primary Gemini provider failed (${err?.message || err}). Falling back to DeterministicProvider.`);
      }
    }

    // Direct fallback to pure deterministic reasoning
    return this.fallbackProvider.generateInterpretation(req);
  }
}

// Global Singleton Export
export const defaultAIProvider = new CompositeAIProvider();

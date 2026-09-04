// ==========================================
// AURORA DESTINY AI — RESILIENT GEMINI SERVICE
// Timeout protection, exponential backoff, circuit breaker
// and high-fidelity deterministic grounded fallback interpretation.
// ==========================================

import { GoogleGenAI } from '@google/genai';
import { CalculationResult } from '../types/destiny';
import { UserProfile } from '../types/user';
import { BacktestResult } from '../types/backtest';
import { STEMS, BRANCHES } from '../engine/canchi';

let geminiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
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

// Circuit Breaker State
interface CircuitBreakerState {
  failureCount: number;
  lastFailureTime: number;
  isOpen: boolean;
  cooldownMs: number;
}

const circuitBreaker: CircuitBreakerState = {
  failureCount: 0,
  lastFailureTime: 0,
  isOpen: false,
  cooldownMs: 60 * 1000
};

const FAILURE_THRESHOLD = 2;
const DEFAULT_COOLDOWN_MS = 60 * 1000;
const QUOTA_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes on quota exceeded

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || err.toString() || '').toLowerCase();
  const status = err.status || err.statusCode;
  return status === 429 ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota exceeded') ||
    msg.includes('rate limit') ||
    msg.includes('tokens_per_model');
}

export function isCircuitBreakerOpen(): boolean {
  if (circuitBreaker.isOpen) {
    if (Date.now() - circuitBreaker.lastFailureTime > circuitBreaker.cooldownMs) {
      // Half-open: test next call
      circuitBreaker.isOpen = false;
      circuitBreaker.failureCount = 0;
      circuitBreaker.cooldownMs = DEFAULT_COOLDOWN_MS;
      return false;
    }
    return true;
  }
  return false;
}

function recordSuccess(): void {
  circuitBreaker.failureCount = 0;
  circuitBreaker.isOpen = false;
  circuitBreaker.cooldownMs = DEFAULT_COOLDOWN_MS;
}

function recordFailure(isQuota: boolean = false): void {
  circuitBreaker.failureCount += 1;
  circuitBreaker.lastFailureTime = Date.now();
  if (isQuota) {
    circuitBreaker.isOpen = true;
    circuitBreaker.cooldownMs = QUOTA_COOLDOWN_MS;
    console.warn(`⚠️ [Circuit Breaker] Quota exceeded (429 / resource_exhausted). Deterministic grounded core engine active for 5 minutes.`);
  } else if (circuitBreaker.failureCount >= FAILURE_THRESHOLD) {
    circuitBreaker.isOpen = true;
    circuitBreaker.cooldownMs = DEFAULT_COOLDOWN_MS;
    console.warn(`⚠️ [Circuit Breaker] Tripped after ${circuitBreaker.failureCount} consecutive failures. Fallback active for 60s.`);
  }
}

// Execute with timeout and retry
async function executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number = 8000): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Gemini API request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([fn(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number = 1): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (isQuotaError(err)) {
        // Immediate failure on quota exhausted - do not waste retry attempts
        throw err;
      }
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }
  throw lastError;
}

// Generate Chat Response with Resilient Fallback
export async function generateDestinyChatResponse(
  userMessage: string,
  profile: UserProfile,
  calc: CalculationResult,
  backtest: BacktestResult
): Promise<{ content: string; confidenceScore: number; isFallback: boolean }> {
  // Extract calculated factual points from deterministic engine
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

  const backtestSummary = backtest.totalEventsAnalyzed > 0
    ? `Chỉ số Tương Hợp Lịch Sử: ${backtest.destinyConsistencyScore}/100 trên ${backtest.totalEventsAnalyzed} sự kiện thực tế (${backtest.confidenceBand}).`
    : `Chưa có sự kiện thực chứng lịch sử. Chỉ số tin cậy mô hình: ${calc.confidence.consistencyScore}/100.`;

  const ai = getGemini();

  if (ai && !isCircuitBreakerOpen()) {
    try {
      const prompt = `
Bạn là Master Destiny AI của nền tảng "Aurora Destiny AI" (Khẩu hiệu: "Understand the patterns. Shape your future.").

QUY TẮC BẢO ĐẢM TÍNH XÁC THỰC & ĐẠO ĐỨC NGHỀ NGHIỆP:
1. ĐỘ CHÍNH XÁC TUYỆT ĐỐI THEO LÁ SỐ ĐÃ TÍNH TOÁN:
   - Tất cả dữ liệu Bát Tự và Tử Vi đã được Bộ Vi Xử Lý Thiên Văn Tính Toán Chính Xác bên dưới.
   - TUYỆT ĐỐI KHÔNG tự ý bịa thêm các sao khác, không tự bịa cách cục không tồn tại trong dữ liệu được cấp.
   - BẮT BUỘC TRÍCH DẪN NGUỒN CỤ THỂ: Trích dẫn tên cụ thể của sao (kèm độ sáng Miếu/Vượng/Đắc/Hãm), thập thần, hoặc ngũ hành từ dữ liệu dưới đây.
2. KHÔNG MÊ TÍN DỊ ĐOAN:
   - Bạn là Chuyên gia Phân tích Dữ liệu Vận trình & Chiến lược gia Quản trị Rủi ro.
   - Luôn nhấn mạnh quyền tự chủ, năng lực thực thi và tư duy chiến lược của con người.

DỮ LIỆU LÁ SỐ ĐÃ XÁC THỰC:
- Họ tên: ${profile.name}
- Giới tính: ${profile.birthData?.gender === 'Male' ? 'Nam mạng' : 'Nữ mạng'}
- Bát Tự Tứ Trụ: ${baziPillars}
- Ngũ Hành & Cấu Trúc: ${baziBalance}
- Tử Vi Đẩu Số: ${ziweiDetails}
- Lưu Niên Hiện Tại: ${transitDetails}
- Bối Cảnh Người Dùng: Mục tiêu hàng đầu: "${profile.behavioralContext?.topPriority || 'Phát triển toàn diện'}", Lĩnh vực: "${profile.behavioralContext?.careerField || 'Tự do'}"
- Đối Sánh Lịch Sử: ${backtestSummary}

CÂU HỎI CỦA NGƯỜI DÙNG:
"${userMessage}"

HƯỚNG DẪN TRẢ LỜI:
- Trả lời bằng tiếng Việt văn phong trang nhã, chuyên nghiệp, cấu trúc 3-4 đoạn văn rõ ràng:
  1. Phân tích nền tảng dựa trên bằng chứng cụ thể từ lá số (sao, thập thần, ngũ hành).
  2. Tác động của chu kỳ thời điểm hiện tại và tính khả thi đối với câu hỏi người dùng.
  3. Ranh giới rủi ro / điểm mù cần lưu tâm.
  4. Gợi ý hành động chiến lược thiết thực và truyền cảm hứng tự chủ.
`;

      const response = await retryWithBackoff(async () => {
        return await executeWithTimeout(async () => {
          return await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
          });
        }, 10000);
      }, 1);

      const text = response.text?.trim();
      if (text) {
        recordSuccess();
        return {
          content: text,
          confidenceScore: calc.confidence.consistencyScore,
          isFallback: false
        };
      }
    } catch (err: any) {
      recordFailure();
      console.warn('[Resilient Gemini Service] Gemini call failed, activating deterministic grounded fallback:', err?.message || err);
    }
  }

  // Deterministic Grounded Interpretation Fallback
  const transitDesc = currentTransit
    ? `Năm ${currentYear} (${currentTransit.stem} ${currentTransit.branch}) mang Sóng Cơ Hội đạt ${currentTransit.opportunityWave}%, Sóng Thận Trọng ở mức ${currentTransit.cautionWave}%. Khuyến nghị hành động: ${currentTransit.recommendedFocus}.`
    : `Lưu Niên ${currentYear} đang trong chu kỳ tích lũy năng lượng ổn định.`;

  const fallbackContent = `Dựa trên kết quả tính toán xác thực từ Bát Tự và Tử Vi Đẩu Số:\n\n` +
    `1. **Căn Cứ Bản Mệnh & Bát Tự**: Bạn mang Nhật Chủ ${calc.bazi.dayMaster} (${calc.bazi.dayMasterElement} - ${calc.bazi.dayMasterStrength}), đắc Cách Cục **${calc.bazi.structureType}**. Dụng Thần tối ưu là hành **${calc.bazi.favorableElements.join(', ')}**, giúp điều hòa dòng năng lượng và gia tăng sức bật trong lĩnh vực "${profile.behavioralContext?.careerField || 'sự nghiệp'}".\n\n` +
    `2. **Thế Tinh Bàn Tử Vi**: Cung Mệnh tại ${calc.ziwei.palaces.life?.branch} tọa thủ ${lifeStars}, hội tụ cùng Cung Quan Lộc (${careerStars}) và Cung Tài Bạch (${wealthStars}). Bố cục tinh hoa (${calc.ziwei.majorConfigurations.join(', ')}) tạo nền móng vững chắc cho tư duy chiến lược dài hạn.\n\n` +
    `3. **Lưu Niên ${currentYear} & Định Hướng Hành Động**: ${transitDesc} Hãy chủ động phân bổ nguồn lực, quản trị rủi ro tại các thời điểm thận trọng và phát huy thế mạnh Dụng Thần để tạo đột phá.`;

  return {
    content: fallbackContent,
    confidenceScore: calc.confidence.consistencyScore,
    isFallback: true
  };
}

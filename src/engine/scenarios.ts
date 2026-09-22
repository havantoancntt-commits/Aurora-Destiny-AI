// ==========================================
// WHAT-IF SCENARIO SIMULATION ENGINE
// Deterministic Multi-Scenario Simulation with Strict Provenance
// ==========================================

import { ScenarioAnalysisResult, ScenarioOption } from '../types/ai';
import { CalculationResult } from '../types/destiny';
import { getDefaultAnalysisYear } from './canonicalInput';
import { calculateSingleAnnualTransit } from './temporal';

export function evaluateWhatIfScenario(
  question: string,
  calculation: CalculationResult,
  targetYear?: number
): ScenarioAnalysisResult {
  const currentYear = targetYear || calculation?.analysisYear || getDefaultAnalysisYear(calculation?.canonicalInput?.timezoneOffset || 7);

  // Check data completeness - return INSUFFICIENT_DATA instead of generating fake scenarios
  if (!calculation || !calculation.bazi || !calculation.ziwei) {
    return {
      id: `scn_${Date.now()}`,
      userQuestion: question,
      evaluatedAt: new Date().toISOString(),
      contextSummary: 'Không đủ dữ liệu lá số gốc để thực hiện mô phỏng kịch bản What-If.',
      status: 'INSUFFICIENT_DATA',
      missingReason: 'Thiếu cấu trúc dữ liệu Bát Tự hoặc Tử Vi hoàn chỉnh từ pipeline tính toán.',
      scenarios: [],
      synthesisAdvice: 'Hệ thống từ chối tạo kịch bản suy diễn khi thiếu dữ liệu nền tảng nhằm bảo đảm tính trung thực.',
      riskNotice: 'Cần hoàn thành tính toán lá số bản mệnh trước khi chạy mô phỏng kịch bản chiến lược.'
    };
  }

  // Resolve authentic transit for the target year
  let currentTransit = calculation.annualTransits?.find((t) => t.year === currentYear);
  if (!currentTransit && calculation.inputSnapshot) {
    currentTransit = calculateSingleAnnualTransit(calculation.inputSnapshot, currentYear);
  }

  if (!currentTransit) {
    return {
      id: `scn_${Date.now()}`,
      userQuestion: question,
      evaluatedAt: new Date().toISOString(),
      contextSummary: `Không tìm thấy dữ liệu lưu niên năm ${currentYear} trong hệ thống.`,
      status: 'INSUFFICIENT_DATA',
      missingReason: `Không thể xác định chu kỳ lưu niên năm ${currentYear}.`,
      scenarios: [],
      synthesisAdvice: 'Không thể phân tích kịch bản khi thiếu tham số lưu niên thực tế.',
      riskNotice: 'Hệ thống không tạo kịch bản giả lập khi thiếu chu kỳ năng lượng thời gian thực.'
    };
  }

  let nextTransit = calculation.annualTransits?.find((t) => t.year === currentYear + 1);
  if (!nextTransit && calculation.inputSnapshot) {
    nextTransit = calculateSingleAnnualTransit(calculation.inputSnapshot, currentYear + 1);
  }
  const nextOppWave = nextTransit?.opportunityWave ?? currentTransit.opportunityWave;

  // Section III: Day Master & Strength must be authentic calculations; no 'Mộc' or 'Thân Cân Bằng' fake defaults
  if (!calculation.bazi?.dayMasterElement || !calculation.bazi?.dayMasterStrength) {
    return {
      id: `scn_${Date.now()}`,
      userQuestion: question,
      evaluatedAt: new Date().toISOString(),
      contextSummary: 'Không đủ thông số bản mệnh Bát tự (Nhật Chủ / Vượng suy) để lập mô phỏng kịch bản.',
      status: 'INSUFFICIENT_DATA',
      missingReason: 'Thiếu dữ liệu Nhật Chủ (dayMasterElement) hoặc độ vượng suy (dayMasterStrength) trong kết quả tính toán.',
      scenarios: [],
      synthesisAdvice: 'Cần hoàn tất tính toán Bát tự đầy đủ trước khi chạy mô phỏng kịch bản.',
      riskNotice: 'Hệ thống từ chối sử dụng giá trị mặc định cho Nhật Chủ hoặc độ vượng suy bản mệnh.'
    };
  }

  const dmStrength = calculation.bazi.dayMasterStrength;
  const dmElement = calculation.bazi.dayMasterElement;
  const favorableList = calculation.bazi.favorableElements;
  const favorableEl = (favorableList && favorableList.length > 0) ? favorableList.join(' & ') : 'Chưa xác định';

  // Deterministic scores grounded in authentic astrological calculations
  const rawCareer = calculation.ziwei.palaces?.career?.score ?? calculation.ziwei.palaces?.life?.score;
  const rawIntegrity = calculation.confidence?.calculationIntegrityScore;
  const rawUncertainty = calculation.confidence?.uncertaintyIndex;

  if (typeof rawCareer !== 'number' || typeof rawIntegrity !== 'number') {
    return {
      id: `scn_${Date.now()}`,
      userQuestion: question,
      evaluatedAt: new Date().toISOString(),
      contextSummary: 'Không đủ chỉ số cung chức Tử Vi hoặc độ tin cậy để lập mô phỏng kịch bản.',
      status: 'INSUFFICIENT_DATA',
      missingReason: 'Thiếu điểm số cung sự nghiệp (Quan Lộc/Mệnh) hoặc chỉ số tin cậy tính toán.',
      scenarios: [],
      synthesisAdvice: 'Cần hoàn tất tính toán lá số Tử Vi đầy đủ trước khi chạy kịch bản What-If.',
      riskNotice: 'Hệ thống từ chối gán điểm mặc định khi thiếu dữ liệu nguồn.'
    };
  }

  const careerScore = rawCareer;
  const travelScore = calculation.ziwei.palaces?.travel?.score ?? careerScore;
  const integrityScore = rawIntegrity;
  const uncertaintyBase = typeof rawUncertainty === 'number' ? rawUncertainty : Math.max(0, 100 - integrityScore);

  // Scenario A (Continue / Optimize current path):
  // Rewards high career palace score and low caution wave (stability)
  const stabilityIndex = 100 - currentTransit.cautionWave;
  const energyAlignmentScoreA = Math.min(95, Math.max(25, Math.round(careerScore * 0.45 + stabilityIndex * 0.45 + integrityScore * 0.1)));
  const uncertaintyScoreA = Math.min(85, Math.max(15, Math.round(currentTransit.cautionWave * 0.6 + uncertaintyBase * 0.4)));

  // Scenario B (Pivot / Breakthrough):
  // Driven by opportunity waves of current and next year plus travel/expansion palace
  const energyAlignmentScoreB = Math.min(95, Math.max(25, Math.round(currentTransit.opportunityWave * 0.40 + nextOppWave * 0.35 + travelScore * 0.25)));
  const uncertaintyScoreB = Math.min(90, Math.max(20, Math.round(currentTransit.cautionWave * 0.70 + uncertaintyBase * 0.30)));

  // Scenario C (Hybrid / Staged pivot):
  // Blended average of stability and exploration
  const energyAlignmentScoreC = Math.round((energyAlignmentScoreA + energyAlignmentScoreB) / 2);
  const uncertaintyScoreC = Math.round((uncertaintyScoreA + uncertaintyScoreB) / 2);

  const scenarios: ScenarioOption[] = [
    {
      scenarioId: 'A',
      title: 'Kịch bản A — Duy trì & Tối ưu lộ trình hiện tại',
      type: 'Continue',
      description: 'Giữ nguyên vị trí hoặc mô hình hiện có, tập trung tích lũy nguồn lực, chuyên môn hóa và củng cố liên minh nội bộ.',
      potentialAdvantages: [
        'Giảm thiểu biên độ rủi ro biến động dòng tiền trong ngắn hạn',
        'Tận dụng triệt để nền tảng tích lũy sẵn có của cung Quan Lộc',
        'Bảo toàn năng lượng để chuẩn bị cho chu kỳ bứt phá tiếp theo'
      ],
      keyChallenges: [
        'Có thể bỏ lỡ các cửa sổ cơ hội đột phá mang tính thời điểm',
        'Cảm giác trì trệ nếu môi trường bên ngoài chuyển đổi quá nhanh'
      ],
      optimalTiming: `Quý 1 - Quý 3 năm ${currentYear} (Giai đoạn tích tụ năng lượng)`,
      energyAlignmentScore: energyAlignmentScoreA,
      uncertaintyScore: uncertaintyScoreA,
      requiredConditions: [
        'Môi trường công việc/tài chính hiện tại vẫn đảm bảo dòng tiền ổn định',
        'Tâm lý cá nhân hướng tới sự an toàn và củng cố năng lực'
      ]
    },
    {
      scenarioId: 'B',
      title: 'Kịch bản B — Quyết định Chuyển dịch / Đột phá mới',
      type: 'Change',
      description: 'Chủ động khởi xướng bước ngoặt: đổi việc, khởi nghiệp, mở rộng quy mô kinh doanh hoặc chuyển đổi địa bàn hoạt động.',
      potentialAdvantages: [
        'Kích hoạt năng lượng Thiên Di và Quan Lộc mở rộng biên độ danh tiếng',
        `Cơ hội đón đầu sóng cơ hội năm ${currentYear + 1} (${nextOppWave}%)`,
        'Tạo đòn bẩy thu nhập và nâng cấp mạng lưới đối tác chiến lược'
      ],
      keyChallenges: [
        'Áp lực thích nghi với môi trường mới và rủi ro thời gian hòa vốn ban đầu',
        `Đòi hỏi kiểm soát chặt chẽ các chỉ số sóng thận trọng (${currentTransit.cautionWave}%)`
      ],
      optimalTiming: `Cuối năm ${currentYear} đến đầu năm ${currentYear + 1}`,
      energyAlignmentScore: energyAlignmentScoreB,
      uncertaintyScore: uncertaintyScoreB,
      requiredConditions: [
        'Chuẩn bị quỹ dự phòng tài chính tối thiểu 6-9 tháng chi phí',
        `Lựa chọn lĩnh vực bổ trợ hành ${favorableEl} (hành tương sinh với Nhật Chủ)`
      ]
    },
    {
      scenarioId: 'C',
      title: 'Kịch bản C — Phương án Lai ghép (Hybrid / Phép thử kép)',
      type: 'Alternative',
      description: 'Duy trì công việc cốt lõi đồng thời khởi động dự án mới theo mô hình bán thời gian hoặc đầu tư hợp tác liên doanh.',
      potentialAdvantages: [
        'Cân bằng hoàn hảo giữa an toàn tài chính và khát vọng thử thách mới',
        'Kiểm nghiệm phản hồi thị trường thực tế mà không cần chịu rủi ro sụp đổ',
        `Phù hợp với đặc tính ${dmStrength} của bản mệnh`
      ],
      keyChallenges: [
        'Đòi hỏi kỷ luật quản lý thời gian cao để tránh quá tải thể lực',
        'Phân tán sự tập trung nếu không phân định rõ ranh giới ưu tiên'
      ],
      optimalTiming: 'Triển khai thử nghiệm theo giai đoạn trong vòng 60-90 ngày tới',
      energyAlignmentScore: energyAlignmentScoreC,
      uncertaintyScore: uncertaintyScoreC,
      requiredConditions: [
        'Có đối tác tin cậy cùng gánh vác phần vận hành vi mô',
        'Thiết lập mốc đánh giá hiệu quả định kỳ sau mỗi 90 ngày'
      ]
    }
  ];

  // Section III: Null-safe comparator: real numeric scores first (descending), null/unknown handled separately without converting null to 0
  const sorted = [...scenarios].sort((a, b) => {
    const aScore = a.energyAlignmentScore;
    const bScore = b.energyAlignmentScore;
    const aValid = typeof aScore === 'number' && !isNaN(aScore);
    const bValid = typeof bScore === 'number' && !isNaN(bScore);
    if (aValid && bValid) {
      return (bScore as number) - (aScore as number);
    }
    if (aValid) return -1;
    if (bValid) return 1;
    return 0;
  });
  const best = sorted[0];
  const bestScoreText = typeof best.energyAlignmentScore === 'number' ? `${best.energyAlignmentScore}/100 điểm` : 'Chưa xác định';
  const bestUncertaintyText = typeof best.uncertaintyScore === 'number' ? `độ bất định ${best.uncertaintyScore}/100` : 'độ bất định chưa xác định';

  return {
    id: `scn_${Date.now()}`,
    userQuestion: question,
    evaluatedAt: new Date().toISOString(),
    contextSummary: `Phân tích đối sánh dựa trên lá số Bát tự (Nhật chủ ${dmElement} - ${dmStrength}), hành Dụng Thần (${favorableEl}) và chu kỳ lưu niên ${currentYear}-${currentYear + 1}.`,
    status: 'AVAILABLE',
    scenarios,
    synthesisAdvice: `Dữ liệu chu kỳ cho thấy ${best.title} đạt độ tương thích năng lượng cao nhất (${bestScoreText}, ${bestUncertaintyText}). Đề xuất xây dựng kịch bản dự phòng trước khi ra quyết định dứt điểm.`,
    riskNotice: 'Mọi kịch bản phân tích nhằm mục đích mở rộng góc nhìn tư duy chiến lược và tham khảo, không đại diện cho lời khuyên đầu tư hay cam kết chắc chắn.',
    provenance: {
      formulaVersion: 'v2.0.0-deterministic',
      generatedAt: new Date().toISOString(),
      sourceCalculationId: calculation.id,
      formulaDescription: 'Điểm tương thích năng lượng kịch bản được tính từ trọng số điểm cung Tử Vi (Quan Lộc/Thiên Di), sóng Cơ hội (opportunityWave) và sóng Thận trọng (cautionWave) của lưu niên.',
      weights: {
        scenarioA_career: 0.45,
        scenarioA_stability: 0.45,
        scenarioB_opportunity: 0.40,
        scenarioB_nextOpportunity: 0.35,
        scenarioB_palace: 0.25
      },
      inputMetrics: {
        analysisYear: currentYear,
        careerPalaceScore: careerScore,
        travelPalaceScore: travelScore,
        opportunityWave: currentTransit.opportunityWave,
        cautionWave: currentTransit.cautionWave,
        dayMasterElement: dmElement,
        favorableElements: calculation.bazi.favorableElements
      },
      assumptions: [
        `Phân tích căn cứ trên chu kỳ lưu niên ${currentTransit.year} (${currentTransit.tenGod}).`,
        'Các kịch bản giả định người dùng duy trì nỗ lực hành động nhất quán.'
      ],
      limitations: [
        'Điểm tương hợp không phải là cam kết thành công tuyệt đối mà là chỉ số định hướng năng lượng.',
        'Người dùng cần cân nhắc các yếu tố thực tế về vốn, pháp lý và sức khỏe trước khi quyết định.'
      ]
    }
  };
}

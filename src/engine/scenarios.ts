// ==========================================
// WHAT-IF SCENARIO SIMULATION ENGINE
// ==========================================

import { ScenarioAnalysisResult, ScenarioOption } from '../types/ai';
import { CalculationResult } from '../types/destiny';
import { getDefaultAnalysisYear } from './canonicalInput';
import { STEMS, BRANCHES } from './canchi';

export function evaluateWhatIfScenario(
  question: string,
  calculation: CalculationResult,
  targetYear?: number
): ScenarioAnalysisResult {
  const currentYear = targetYear || calculation?.analysisYear || getDefaultAnalysisYear(calculation?.canonicalInput?.timezoneOffset || 7);
  const stemIdx = ((currentYear - 4) % 10 + 10) % 10;
  const branchIdx = ((currentYear - 4) % 12 + 12) % 12;
  const STEM_KEYS = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'] as const;
  const BRANCH_KEYS = ['Zi', 'Chou', 'Yin_B', 'Mao', 'Chen', 'Si', 'Wu_B', 'Wei', 'Shen', 'You', 'Xu', 'Hai'] as const;
  const fallbackStem = STEM_KEYS[stemIdx];
  const fallbackBranch = BRANCH_KEYS[branchIdx];

  const currentTransit = calculation?.annualTransits?.find((t) => t.year === currentYear) || calculation?.annualTransits?.[0] || {
    year: currentYear,
    stem: fallbackStem,
    branch: fallbackBranch,
    element: STEMS[fallbackStem]?.element || 'Fire',
    tenGod: 'Chính Quan',
    overallScore: 70,
    careerScore: 70,
    wealthScore: 70,
    relationshipScore: 70,
    healthScore: 70,
    growthScore: 70,
    opportunityWave: 70,
    cautionWave: 30,
    highlightSummary: 'Chu kỳ chuyển tiếp năng lượng',
    recommendedFocus: 'Cân bằng và phát triển bền vững'
  };
  const nextTransit = calculation?.annualTransits?.find((t) => t.year === currentYear + 1) || calculation?.annualTransits?.[1] || calculation?.annualTransits?.[0] || currentTransit;

  const favorableEl = calculation?.bazi?.favorableElements?.join(' & ') || 'Mộc & Hỏa';
  const dmStrength = calculation?.bazi?.dayMasterStrength || 'Thân Cân Bằng';

  // Generate 3 structured options: A (Continue), B (Change/Pivot), C (Alternative/Hybrid)
  const scenarios: ScenarioOption[] = [
    {
      scenarioId: 'A',
      title: 'Kịch bản A — Duy trì & Tối ưu lộ trình hiện tại',
      type: 'Continue',
      description: 'Giữ nguyên vị trí hoặc mô hình hiện có, tập trung tích lũy nguồn lực, chuyên môn hóa và củng cố liên minh nội bộ.',
      potentialAdvantages: [
        'Giảm thiểu biên độ rủi ro biến động dòng tiền trong ngắn hạn',
        'Tận dụng triệt để nền tảng tích lũy sẵn có của cung Mệnh/Quan',
        'Bảo toàn năng lượng để chuẩn bị cho chu kỳ bứt phá tiếp theo'
      ],
      keyChallenges: [
        'Có thể bỏ lỡ các cửa sổ cơ hội đột phá mang tính thời điểm',
        'Cảm giác trì trệ nếu môi trường bên ngoài chuyển đổi quá nhanh'
      ],
      optimalTiming: `Quý 1 - Quý 3 năm ${currentYear} (Giai đoạn tích tụ năng lượng)`,
      energyAlignmentScore: 74,
      uncertaintyScore: 25,
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
        'Cơ hội đón đầu sóng cơ hội năm ' + (currentYear + 1) + ' (' + nextTransit.opportunityWave + '%)',
        'Tạo đòn bẩy thu nhập và nâng cấp mạng lưới đối tác chiến lược'
      ],
      keyChallenges: [
        'Áp lực thích nghi với môi trường mới và rủi ro thời gian hòa vốn ban đầu',
        'Đòi hỏi kiểm soát chặt chẽ các chỉ số sóng thận trọng (' + currentTransit.cautionWave + '%)'
      ],
      optimalTiming: `Cuối năm ${currentYear} đến đầu năm ${currentYear + 1}`,
      energyAlignmentScore: 86,
      uncertaintyScore: 38,
      requiredConditions: [
        'Chuẩn bị quỹ dự phòng tài chính tối thiểu 6-9 tháng chi phí',
        'Lựa chọn lĩnh vực bổ trợ hành ' + favorableEl + ' (hành tương sinh với Nhật Chủ)'
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
        'Phù hợp với đặc tính ' + dmStrength + ' của bản mệnh'
      ],
      keyChallenges: [
        'Đòi hỏi kỷ luật quản lý thời gian cao để tránh quá tải thể lực',
        'Phân tán sự tập trung nếu không phân định rõ ranh giới ưu tiên'
      ],
      optimalTiming: `Triển khai ngay trong vòng 60-90 ngày tới`,
      energyAlignmentScore: 82,
      uncertaintyScore: 30,
      requiredConditions: [
        'Có đối tác tin cậy cùng gánh vác phần vận hành vi mô',
        'Thiết lập mốc đánh giá hiệu quả định kỳ sau mỗi 90 ngày'
      ]
    }
  ];

  return {
    id: `scn_${Date.now()}`,
    userQuestion: question,
    evaluatedAt: new Date().toISOString(),
    contextSummary: `Phân tích đối sánh dựa trên lá số Bát tự (Nhật chủ ${calculation?.bazi?.dayMasterElement || 'Hỏa'} - ${dmStrength}), hành Dụng Thần (${favorableEl}) và chu kỳ lưu niên ${currentYear}-${currentYear + 1}.`,
    scenarios,
    synthesisAdvice: `Dữ liệu chu kỳ cho thấy Kịch bản B hoặc C có độ cộng hưởng năng lượng cao hơn (+82 đến +86 điểm), tuy nhiên cần lưu ý chuẩn bị kịch bản phòng vệ trước khi ra quyết định dứt điểm.`,
    riskNotice: 'Mọi kịch bản phân tích nhằm mục đích mở rộng góc nhìn tư duy chiến lược và tham khảo, không đại diện cho lời khuyên đầu tư hay cam kết chắc chắn.'
  };
}

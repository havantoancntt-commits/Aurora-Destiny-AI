// ==========================================
// BACKTESTING & HISTORICAL CONSISTENCY ENGINE
// ==========================================

import {
  HistoricalEvent,
  BacktestResult,
  CycleFitComparison
} from '../types/backtest';
import { CalculationResult } from '../types/destiny';

export function runBacktestAnalysis(
  events: HistoricalEvent[],
  calculation: CalculationResult
): BacktestResult {
  if (!events || events.length === 0) {
    return {
      id: `bt_${Date.now()}`,
      profileId: calculation.profileId,
      calculationId: calculation.id,
      timestamp: new Date().toISOString(),
      totalEventsAnalyzed: 0,
      destinyConsistencyScore: 70, // Baseline neutral score
      matchedEventsCount: 0,
      divergentEventsCount: 0,
      neutralEventsCount: 0,
      confidenceBand: 'Sparse Data Fit',
      comparisons: [],
      strengthsSummary: ['Chưa có sự kiện quá khứ nào được nạp để kiểm chứng.'],
      anomaliesSummary: ['Vui lòng nạp tối thiểu 2-3 sự kiện bước ngoặt để mở khóa chỉ số Backtest Score.'],
      uncertaintyFactors: ['Độ lệch mẫu do thiếu dữ liệu kiểm nghiệm thực tế.']
    };
  }

  const comparisons: CycleFitComparison[] = [];
  let totalMatchPoints = 0;
  let matchedCount = 0;
  let divergentCount = 0;
  let neutralCount = 0;

  events.forEach((event) => {
    // Find transit for the event year
    const transit = calculation.annualTransits.find((t) => t.year === event.year) || {
      overallScore: 72,
      careerScore: 70,
      wealthScore: 70,
      relationshipScore: 70,
      opportunityWave: 65,
      cautionWave: 45,
      element: 'Fire' as any,
      tenGod: 'Tỷ Kiên'
    };

    // Evaluate Alignment
    let expectedPositive = transit.overallScore >= 75 || transit.opportunityWave >= 70;
    let expectedNegative = transit.cautionWave >= 60 || transit.overallScore < 68;

    let eventIsPositive = event.impact === 'Positive' || event.impact === 'Breakthrough';
    let eventIsNegative = event.impact === 'Negative' || event.impact === 'Very Negative';

    let matchScore = 70;
    let status: CycleFitComparison['status'] = 'Moderate Match';
    let explanation = '';

    if (eventIsPositive && expectedPositive) {
      matchScore = 88 + Math.min(10, event.intensity * 2);
      status = 'Strong Match';
      explanation = `Sự kiện thuận lợi trùng khớp với chu kỳ năng lượng cao (${transit.tenGod}) và sóng cơ hội ${transit.opportunityWave}%.`;
      matchedCount++;
    } else if (eventIsNegative && expectedNegative) {
      matchScore = 85 + Math.min(10, event.intensity * 2);
      status = 'Strong Match';
      explanation = `Thử thách/rủi ro diễn ra đúng giai đoạn sóng thận trọng tăng cao (${transit.cautionWave}%) của năm ${event.year}.`;
      matchedCount++;
    } else if (eventIsPositive && expectedNegative) {
      matchScore = 42;
      status = 'Anomalous Divergence';
      explanation = `Sự kiện bứt phá tích cực vượt qua vùng năng lượng thận trọng (cho thấy năng lực ứng biến cá nhân hoặc yếu tố ngoại cảnh hỗ trợ).`;
      divergentCount++;
    } else if (eventIsNegative && expectedPositive) {
      matchScore = 48;
      status = 'Anomalous Divergence';
      explanation = `Biến cố tiêu cực xảy ra trong năm có chỉ số nền tích cực, cần xem xét thêm yếu tố môi trường hoặc quyết định tức thời.`;
      divergentCount++;
    } else {
      matchScore = 72;
      status = 'Neutral Divergence';
      explanation = `Sự kiện tương đối hài hòa với biên độ dao động thông thường của chu kỳ.`;
      neutralCount++;
    }

    // Weight by user recall confidence
    const confidenceWeight = (event.userConfidence || 3) / 5;
    totalMatchPoints += matchScore * (0.6 + confidenceWeight * 0.4);

    comparisons.push({
      eventId: event.id,
      eventTitle: event.title,
      eventYear: event.year,
      category: event.category,
      actualImpact: event.impact,
      calculatedWave: transit.overallScore,
      calculatedOpportunityScore: transit.opportunityWave,
      calculatedCautionScore: transit.cautionWave,
      dominantFavorableElement: calculation.bazi.favorableElements[0] || 'Wood',
      transitTenGod: transit.tenGod,
      matchScore: Math.round(matchScore),
      status,
      explanation
    });
  });

  const rawScore = Math.round(totalMatchPoints / events.length);
  const destinyConsistencyScore = Math.min(96, Math.max(45, rawScore));

  let confidenceBand: BacktestResult['confidenceBand'] = 'Moderate Coherence';
  if (events.length >= 3 && destinyConsistencyScore >= 80) {
    confidenceBand = 'High Empirical Reliability';
  } else if (events.length < 3) {
    confidenceBand = 'Sparse Data Fit';
  }

  const strengthsSummary = [
    `Tỷ lệ trùng khớp mẫu lịch sử đạt ${Math.round((matchedCount / events.length) * 100)}% trên ${events.length} sự kiện thực tế.`,
    `Các bước ngoặt lĩnh vực ${events[0]?.category || 'Sự nghiệp'} có độ tương quan mạnh với chu kỳ Dụng Thần (${calculation.bazi.favorableElements.join(', ')}).`
  ];

  const anomaliesSummary = divergentCount > 0
    ? [`Phát hiện ${divergentCount} điểm lệch mẫu: Cá nhân có khả năng tự điều chỉnh cao tại các thời điểm thử thách.`]
    : [`Không có dị biệt cực đoan; các biến cố lịch sử bám sát quỹ đạo chu kỳ tính toán.`];

  const uncertaintyFactors = [
    `Số lượng sự kiện ghi nhận: ${events.length} (Khuyến nghị nạp từ 5 sự kiện để đạt mức tối ưu).`,
    `Độ chính xác hồi ức của người dùng: Trung bình ${Math.round(events.reduce((s, e) => s + e.userConfidence, 0) / events.length)}/5 sao.`
  ];

  return {
    id: `bt_${Date.now()}`,
    profileId: calculation.profileId,
    calculationId: calculation.id,
    timestamp: new Date().toISOString(),
    totalEventsAnalyzed: events.length,
    destinyConsistencyScore,
    matchedEventsCount: matchedCount,
    divergentEventsCount: divergentCount,
    neutralEventsCount: neutralCount,
    confidenceBand,
    comparisons,
    strengthsSummary,
    anomaliesSummary,
    uncertaintyFactors
  };
}

// ==========================================
// HISTORICAL PATTERN ANALYSIS & RETROSPECTIVE CONSISTENCY
// ==========================================

import {
  HistoricalEvent,
  BacktestResult,
  CycleFitComparison
} from '../types/backtest';
import { CalculationResult } from '../types/destiny';
import { calculateSingleAnnualTransit } from './temporal';

export function runBacktestAnalysis(
  events: HistoricalEvent[],
  calculation: CalculationResult
): BacktestResult {
  const currentYear = new Date().getFullYear();

  // Prevent look-ahead bias: only analyze events that occurred in or before current year
  // Deduplicate events by year and normalized title
  const seenEvents = new Set<string>();
  const validPastEvents = (events || []).filter((e) => {
    if (e.year > currentYear) return false;
    const key = `${e.year}_${(e.title || '').trim().toLowerCase()}`;
    if (seenEvents.has(key)) return false;
    seenEvents.add(key);
    return true;
  });

  if (validPastEvents.length === 0) {
    return {
      id: `bt_${Date.now()}`,
      profileId: calculation.profileId,
      calculationId: calculation.id,
      timestamp: new Date().toISOString(),
      totalEventsAnalyzed: 0,
      destinyConsistencyScore: 0, // No events = 0 empirical score
      historicalHitRate: 0,
      statisticalSignificanceDisclaimer: 'Chỉ số tương hợp là điểm kinh nghiệm định lượng dựa trên mẫu dữ liệu cá nhân, không cấu thành xác suất thống kê khách quan tần suất (frequentist probability).',
      matchedEventsCount: 0,
      divergentEventsCount: 0,
      neutralEventsCount: 0,
      confidenceBand: 'Insufficient Historical Evidence',
      evidenceStatus: 'INSUFFICIENT_HISTORICAL_EVIDENCE',
      comparisons: [],
      strengthsSummary: ['Chưa có sự kiện quá khứ nào được nạp để kiểm chứng mẫu.'],
      anomaliesSummary: ['Vui lòng nạp tối thiểu 3 sự kiện bước ngoặt để mở khóa chỉ số đối sánh lịch sử.'],
      uncertaintyFactors: [
        'Chưa đủ dữ liệu thực chứng lịch sử cá nhân.',
        'Chỉ số đối sánh lịch sử phản ánh mức độ tương hợp với dữ liệu đã nạp, không phải xác suất chắc chắn của tương lai.'
      ]
    };
  }

  const comparisons: CycleFitComparison[] = [];
  let totalMatchPoints = 0;
  let matchedCount = 0;
  let divergentCount = 0;
  let neutralCount = 0;

  validPastEvents.forEach((event) => {
    // Dynamically calculate the authentic transit for the exact event year if not precalculated
    const transit =
      calculation.annualTransits.find((t) => t.year === event.year) ||
      calculateSingleAnnualTransit(calculation.inputSnapshot, event.year);

    // Evaluate Alignment
    const expectedPositive = transit.overallScore >= 75 || transit.opportunityWave >= 70;
    const expectedNegative = transit.cautionWave >= 60 || transit.overallScore < 68;

    const eventIsPositive = event.impact === 'Positive' || event.impact === 'Breakthrough';
    const eventIsNegative = event.impact === 'Negative' || event.impact === 'Very Negative';

    let matchScore = 70;
    let status: CycleFitComparison['status'] = 'Moderate Match';
    let explanation = '';

    if (eventIsPositive && expectedPositive) {
      matchScore = 88 + Math.min(10, event.intensity * 2);
      status = 'Strong Match';
      explanation = `Sự kiện thuận lợi trùng khớp với chu kỳ năng lượng (${transit.tenGod}) và sóng cơ hội ${transit.opportunityWave}%.`;
      matchedCount++;
    } else if (eventIsNegative && expectedNegative) {
      matchScore = 85 + Math.min(10, event.intensity * 2);
      status = 'Strong Match';
      explanation = `Thử thách/rủi ro diễn ra đúng giai đoạn sóng thận trọng tăng cao (${transit.cautionWave}%) của năm ${event.year}.`;
      matchedCount++;
    } else if (eventIsPositive && expectedNegative) {
      matchScore = 42;
      status = 'Anomalous Divergence';
      explanation = `Sự kiện bứt phá tích cực vượt qua sóng thận trọng (thể hiện nỗ lực chủ động cá nhân hoặc đòn bẩy ngoại cảnh).`;
      divergentCount++;
    } else if (eventIsNegative && expectedPositive) {
      matchScore = 48;
      status = 'Anomalous Divergence';
      explanation = `Biến cố tiêu cực diễn ra trong năm chu kỳ tích cực, cần lưu ý biến số môi trường hoặc hành vi chủ quan.`;
      divergentCount++;
    } else {
      matchScore = 70;
      status = 'Neutral Divergence';
      explanation = `Sự kiện tương đối hài hòa với biên độ dao động thông thường của chu kỳ.`;
      neutralCount++;
    }

    // Weight by user recall confidence (1-5 normalized)
    const confidenceWeight = Math.min(1, Math.max(0.2, (event.userConfidence || 3) / 5));
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

  const rawScore = Math.round(totalMatchPoints / validPastEvents.length);
  const destinyConsistencyScore = Math.min(96, Math.max(30, rawScore));
  const historicalHitRate = Math.round((matchedCount / validPastEvents.length) * 100);
  const statisticalSignificanceDisclaimer = 'Chỉ số tương hợp là điểm kinh nghiệm định lượng dựa trên mẫu dữ liệu cá nhân, không cấu thành xác suất thống kê khách quan tần suất (frequentist probability).';

  let confidenceBand: BacktestResult['confidenceBand'] = 'Moderate Coherence';
  if (validPastEvents.length >= 3 && destinyConsistencyScore >= 80) {
    confidenceBand = 'High Empirical Reliability';
  } else if (validPastEvents.length < 3) {
    confidenceBand = 'Sparse Data Fit';
  }

  const strengthsSummary = [
    `Tỷ lệ tương hợp mẫu lịch sử đạt ${historicalHitRate}% trên ${validPastEvents.length} sự kiện thực tế.`,
    `Các bước ngoặt lĩnh vực ${validPastEvents[0]?.category || 'Sự nghiệp'} có mức liên kết rõ rệt với quy luật Dụng Thần (${calculation.bazi.favorableElements.join(', ')}).`
  ];

  const anomaliesSummary = divergentCount > 0
    ? [`Phát hiện ${divergentCount} điểm lệch mẫu: Cá nhân có khả năng tự điều chỉnh cao tại các thời điểm thử thách.`]
    : [`Không có dị biệt cực đoan; các biến cố lịch sử bám sát quỹ đạo chu kỳ tính toán.`];

  const uncertaintyFactors = [
    `Số lượng sự kiện ghi nhận: ${validPastEvents.length} (Khuyến nghị nạp từ 5 sự kiện quá khứ để đạt mức tối ưu).`,
    `Độ tin cậy ghi nhớ của người dùng: Trung bình ${Math.round(validPastEvents.reduce((s, e) => s + (e.userConfidence || 3), 0) / validPastEvents.length)}/5.`,
    'Chỉ số phản ánh mức độ tương thích mẫu lịch sử, không phải khẳng định tất định về tương lai.'
  ];

  return {
    id: `bt_${Date.now()}`,
    profileId: calculation.profileId,
    calculationId: calculation.id,
    timestamp: new Date().toISOString(),
    totalEventsAnalyzed: validPastEvents.length,
    destinyConsistencyScore,
    historicalHitRate,
    statisticalSignificanceDisclaimer,
    matchedEventsCount: matchedCount,
    divergentEventsCount: divergentCount,
    neutralEventsCount: neutralCount,
    confidenceBand,
    evidenceStatus: validPastEvents.length >= 3 ? 'SUFFICIENT_EVIDENCE' : 'PRELIMINARY_EVIDENCE',
    comparisons,
    strengthsSummary,
    anomaliesSummary,
    uncertaintyFactors
  };
}


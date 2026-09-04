// ==========================================
// COMPUTATIONAL CONFIDENCE & PATTERN ALIGNMENT ENGINE
// ==========================================

import { BirthData, ConfidenceMetrics } from '../types/destiny';

export function evaluateConfidence(
  birthData: BirthData,
  eventsCount: number = 0,
  backtestMatchScore: number = 0
): ConfidenceMetrics {
  // 1. Data Completeness (Hour exactness, City precision, Timezone normalization)
  let completeness = 55;
  if (birthData.hasExactHour) completeness += 30;
  if (birthData.birthCity && birthData.birthCity.length > 2) completeness += 10;
  if (birthData.gender && birthData.gender !== 'PreferNotToSay') completeness += 5;

  // 2. Astronomical Resolution Level
  const resolutionLevel: 'High' | 'Medium' | 'Estimated' =
    birthData.hasExactHour ? 'High' : 'Estimated';

  // 3. Historical Pattern Alignment Score (0 if user has not supplied verified events)
  const historicalFit = eventsCount >= 1 ? Math.min(100, Math.max(0, backtestMatchScore)) : 0;

  // 4. Signal Strength: based on input data completeness and validated events
  const signalStrength = eventsCount >= 1
    ? Math.round(completeness * 0.6 + historicalFit * 0.4)
    : Math.round(completeness * 0.85);

  // 5. Calculation Integrity Score (Internal harmonic consistency)
  const consistencyScore = Math.min(95, Math.max(50, Math.round(signalStrength * 0.9 + 5)));

  // 6. Uncertainty Index
  const uncertaintyIndex = Math.max(5, 100 - consistencyScore);

  const assumptions = [
    birthData.hasExactHour
      ? 'Giờ sinh xác thực: Chuẩn hóa theo kinh độ múi giờ địa phương.'
      : 'Giờ sinh ước lượng: Cần cập nhật giờ sinh chính xác để tăng độ phân giải cung hoàng đạo.',
    `Địa điểm sinh: chuẩn hóa tọa độ tại ${birthData.birthCity || 'Kinh tuyến chuẩn'}.`,
    'Hệ lịch thiên văn Tiết khí và Lịch số Hồ Ngọc Đức được áp dụng làm quy chuẩn tính toán.'
  ];

  const limitations = [
    'Chỉ số đo lường tính mạch lạc và độ nhất quán nội tại của mô hình, KHÔNG đại diện cho sự tiền định tuyệt đối.',
    'Sự kiện thực tế trong cuộc sống phụ thuộc chủ đạo vào ý chí tự do, năng lực hành động và hoàn cảnh khách quan.',
    'Hệ thống mang tính chất tham vấn triết học Đông phương, không thay thế tư vấn y tế, tài chính hoặc pháp lý chuyên nghiệp.'
  ];

  return {
    consistencyScore,
    dataCompleteness: completeness,
    historicalFit,
    signalStrength,
    uncertaintyIndex,
    resolutionLevel,
    assumptions,
    limitations
  };
}

// ==========================================
// AURORA DESTINY AI — STRATEGIC CHRONO-NAVIGATOR ENGINE (LA BÀN ĐỊNH THỜI CHIẾN LƯỢC)
// High-Precision Real-Time Chrono-Astrodynamics with True Solar Time,
// 4 Golden Action Windows & Intelligent PWA Push Protocol
// ==========================================

import {
  CalculationResult,
  EarthlyBranch,
  HeavenlyStem,
  FiveElement
} from '../types/destiny';
import {
  calculateRealtimeSnapshot,
  RealtimeDestinySnapshot,
  HourlySlotInsight
} from './realtimeEngine';
import { calculateTrueSolarTime, gregorianToJulianDay } from './lunarSolar';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from './canchi';

export type StrategicActionType =
  | 'CONTRACT_SIGNING'   // Ký kết hợp đồng & Chốt thương vụ
  | 'WEALTH_CATALYST'    // Đàm phán tài chính, Cầu tài & Đầu tư
  | 'INITIATION_TRAVEL'  // Khởi sự, Xuất hành & Kết nối đối tác VIP
  | 'QUIET_REFLECTION';  // Tĩnh tâm, Rà soát sổ sách & Phòng ngừa rủi ro

export interface StrategicActionWindowDef {
  type: StrategicActionType;
  titleVi: string;
  subtitleVi: string;
  tagline: string;
  accentColor: string;
  recommendedSlots: HourlySlotInsight[];
  idealSlot?: HourlySlotInsight;
  strategicRationale: string;
  doList: string[];
  avoidList: string[];
  auspiciousDirection: string;
  auspiciousDeity: string;
}

export interface ChronoNavigatorLocation {
  cityName: string;
  longitude: number;
  latitude?: number;
  isCustomGps?: boolean;
}

export interface ChronoNavigatorReport {
  timestamp: string;
  location: ChronoNavigatorLocation;
  civilTime: {
    hour: number;
    minute: number;
    second: number;
    formatted: string;
  };
  trueSolarTime: {
    hour: number;
    minute: number;
    formatted: string;
    equationOfTimeMinutes: number;
    longitudeCorrectionMinutes: number;
    totalCorrectionMinutes: number;
    deltaFormatted: string; // e.g. "+3.4 phút"
  };
  snapshot: RealtimeDestinySnapshot;
  actionWindows: Record<StrategicActionType, StrategicActionWindowDef>;
  currentActiveAction?: StrategicActionType;
  nextBestWindow: {
    actionType: StrategicActionType;
    slot: HourlySlotInsight;
    hoursUntil: number;
    message: string;
  };
  pwaPushPayload: {
    title: string;
    body: string;
    icon: string;
    badge: string;
    tag: string;
    data: {
      url: string;
      actionType: StrategicActionType;
      branchKey: EarthlyBranch;
    };
  };
}

export const PRESET_NAVIGATOR_CITIES: ChronoNavigatorLocation[] = [
  { cityName: 'Hà Nội (Kinh Tuyến 105.85°E)', longitude: 105.85, latitude: 21.03 },
  { cityName: 'TP. Hồ Chí Minh (Kinh Tuyến 106.63°E)', longitude: 106.63, latitude: 10.82 },
  { cityName: 'Đà Nẵng (Kinh Tuyến 108.20°E)', longitude: 108.20, latitude: 16.05 },
  { cityName: 'Cần Thơ (Kinh Tuyến 105.78°E)', longitude: 105.78, latitude: 10.04 },
  { cityName: 'Hải Phòng (Kinh Tuyến 106.68°E)', longitude: 106.68, latitude: 20.84 },
  { cityName: 'Tokyo (Kinh Tuyến 139.69°E / UTC+9)', longitude: 139.69, latitude: 35.68 },
  { cityName: 'Singapore (Kinh Tuyến 103.82°E / UTC+8)', longitude: 103.82, latitude: 1.35 },
  { cityName: 'Paris (Kinh Tuyến 2.35°E / UTC+1)', longitude: 2.35, latitude: 48.86 },
  { cityName: 'California / Silicon Valley (Kinh Tuyến -122.08°W / UTC-7)', longitude: -122.08, latitude: 37.39 },
  { cityName: 'New York (Kinh Tuyến -74.00°W / UTC-4)', longitude: -74.00, latitude: 40.71 }
];

/**
 * Calculates Direction of Deities (Hỷ Thần, Tài Thần, Hạc Thần) based on Day Stem
 */
export function getDailyDeityDirections(dayStem: HeavenlyStem): {
  joyDeityDirection: string;   // Hỷ Thần (Hôn nhân, gặp gỡ, vui vẻ)
  wealthDeityDirection: string;// Tài Thần (Cầu tài, ký kết, mua bán)
  nobleDeityDirection: string; // Quý Nhân (Cứu khốn, phò trợ)
} {
  switch (dayStem) {
    case 'Jia':
    case 'Ji':
      return { joyDeityDirection: 'Đông Bắc', wealthDeityDirection: 'Chính Nam', nobleDeityDirection: 'Tây Nam' };
    case 'Yi':
    case 'Geng':
      return { joyDeityDirection: 'Tây Bắc', wealthDeityDirection: 'Chính Đông', nobleDeityDirection: 'Tây Nam' };
    case 'Bing':
    case 'Xin':
      return { joyDeityDirection: 'Tây Nam', wealthDeityDirection: 'Chính Đông', nobleDeityDirection: 'Chính Tây' };
    case 'Ding':
    case 'Ren':
      return { joyDeityDirection: 'Chính Nam', wealthDeityDirection: 'Chính Nam', nobleDeityDirection: 'Tây Bắc' };
    case 'Wu':
    case 'Gui':
    default:
      return { joyDeityDirection: 'Đông Nam', wealthDeityDirection: 'Chính Bắc', nobleDeityDirection: 'Đông Bắc' };
  }
}

/**
 * High-Precision Strategic Chrono-Navigator calculation
 */
export function computeStrategicChronoNavigator(
  calculation: CalculationResult,
  targetTime: Date = new Date(),
  location: ChronoNavigatorLocation = PRESET_NAVIGATOR_CITIES[0]
): ChronoNavigatorReport {
  const timezoneOffset = calculation.inputSnapshot?.timezoneOffset || 7;
  const civilHour = targetTime.getHours();
  const civilMinute = targetTime.getMinutes();
  const civilSecond = targetTime.getSeconds();

  // 1. Compute True Solar Time
  const trueSolarResult = calculateTrueSolarTime(
    targetTime.getFullYear(),
    targetTime.getMonth() + 1,
    targetTime.getDate(),
    civilHour,
    civilMinute,
    timezoneOffset,
    location.longitude
  );

  // 2. Synthesize Effective Time for Astrodynamic Engines
  const effectiveDate = new Date(targetTime.getTime());
  effectiveDate.setHours(trueSolarResult.trueSolarHour);
  effectiveDate.setMinutes(trueSolarResult.trueSolarMinute);

  // 3. Run Real-time Astrodynamics Snapshot with True Solar Time
  const snapshot = calculateRealtimeSnapshot(calculation, effectiveDate, timezoneOffset);

  const dayStemKey = (calculation.bazi.dayPillar.stem) as HeavenlyStem;
  const deityDirections = getDailyDeityDirections(dayStemKey);

  // 4. Analyze & Classify 12 Hourly Slots into 4 Golden Action Windows
  const slots: HourlySlotInsight[] = snapshot.hourlySlots;

  // Window 1: Contract Signing & Deal Closing (Ký kết & Chốt deal)
  // Ưu tiên: Điểm Tài lộc/Sự nghiệp cao, Quý nhân, Tam Hợp, Hoàng Đạo, không Xung
  const contractSlots = slots
    .filter((s: HourlySlotInsight) => !s.isClash && (s.aspects.career.verdict === 'HEN' || s.isGuiRen || s.isSanHe || s.isZodiacAuspicious))
    .sort((a: HourlySlotInsight, b: HourlySlotInsight) => (b.aspects.career.score + b.aspects.wealth.score) - (a.aspects.career.score + a.aspects.wealth.score));

  const contractIdeal = contractSlots[0] || slots[0];

  // Window 2: Wealth Catalyst & Financial Negotiation (Cầu tài & Đầu tư)
  // Ưu tiên: Điểm Tài lộc tối đa, Thiên Tài, Chính Tài, Quý Nhân
  const wealthSlots = slots
    .filter((s: HourlySlotInsight) => !s.isClash && (s.aspects.wealth.verdict === 'HEN' || s.isGuiRen))
    .sort((a: HourlySlotInsight, b: HourlySlotInsight) => b.aspects.wealth.score - a.aspects.wealth.score);

  const wealthIdeal = wealthSlots[0] || slots[0];

  // Window 3: Initiation, Travel & VIP Networking (Xuất hành & Gặp gỡ VIP)
  // Ưu tiên: An toàn cao, Nhân duyên hòa ái, Hỷ Thần, Lục Hợp, Tam Hợp
  const travelSlots = slots
    .filter((s: HourlySlotInsight) => !s.isClash && s.aspects.safety.score >= 60 && s.aspects.relationship.score >= 60)
    .sort((a: HourlySlotInsight, b: HourlySlotInsight) => (b.aspects.relationship.score + b.aspects.safety.score) - (a.aspects.relationship.score + a.aspects.safety.score));

  const travelIdeal = travelSlots[0] || slots[0];

  // Window 4: Quiet Reflection & Risk Minimization (Tĩnh tâm & Phòng ngừa rủi ro)
  // Ưu tiên: Giờ Xung, Hắc Đạo hoặc Điểm Thận trọng cao -> Biến hung thành cơ hội rà soát chiều sâu
  const reflectionSlots = slots
    .filter((s: HourlySlotInsight) => s.isClash || !s.isZodiacAuspicious || s.alertLevel === 'CLASH_ANOMALY' || s.cautionScore > 60)
    .sort((a: HourlySlotInsight, b: HourlySlotInsight) => b.cautionScore - a.cautionScore);

  const reflectionIdeal = reflectionSlots[0] || slots.find((s: HourlySlotInsight) => s.isClash) || slots[slots.length - 1];

  const actionWindows: Record<StrategicActionType, StrategicActionWindowDef> = {
    CONTRACT_SIGNING: {
      type: 'CONTRACT_SIGNING',
      titleVi: 'Ký Kết Hợp Đồng & Chốt Thương Vụ',
      subtitleVi: 'Khai Mở Tài Vận Doanh Trí',
      tagline: 'Thời khắc hội tụ trường khí uy quyền, minh bạch và cát lợi đàm phán.',
      accentColor: 'from-amber-500 to-yellow-600',
      recommendedSlots: contractSlots.slice(0, 3),
      idealSlot: contractIdeal,
      strategicRationale: `Khung giờ ${contractIdeal.stemNameVi} ${contractIdeal.branchNameVi} (${contractIdeal.timeRangeStr}) kích hoạt trực giác thương mại, năng lượng Thập Thần (${contractIdeal.tenGodName}) phò trợ và giảm thiểu tối đa tranh chấp pháp lý sau ký kết.`,
      doList: [
        'Ký kết văn bản pháp lý, nghiệm thu hợp đồng đối tác',
        'Gửi email chốt báo giá hoặc điều khoản then chốt',
        'Thương lượng quyền lợi cổ đông hoặc biên bản ghi nhớ (MOU)'
      ],
      avoidList: [
        'Do dự kéo dài quá khung giờ cát lợi làm nguội giao dịch',
        'Sử dụng ngôn từ mập mờ thiếu cơ sở số liệu cụ thể'
      ],
      auspiciousDirection: `Hướng ${deityDirections.wealthDeityDirection} (Tài Thần tọa vị)`,
      auspiciousDeity: `Tài Thần • Sao ${contractIdeal.zodiacStarName}`
    },
    WEALTH_CATALYST: {
      type: 'WEALTH_CATALYST',
      titleVi: 'Đàm Phán Tài Chính, Cầu Tài & Đầu Tư',
      subtitleVi: 'Kích Hoạt Dòng Tiền & Tích Lũy',
      tagline: 'Vượng khí ngũ hành thúc đẩy sinh sôi của cải và quyết định ngân sách chuẩn xác.',
      accentColor: 'from-emerald-500 to-teal-600',
      recommendedSlots: wealthSlots.slice(0, 3),
      idealSlot: wealthIdeal,
      strategicRationale: `Tại giờ ${wealthIdeal.stemNameVi} ${wealthIdeal.branchNameVi} (${wealthIdeal.timeRangeStr}), luồng năng lượng tài khí đạt ${wealthIdeal.aspects.wealth.score}đ (${wealthIdeal.aspects.wealth.status}), phù hợp với việc phân bổ dòng vốn và đàm phán tối ưu biên lợi nhuận.`,
      doList: [
        'Mở tài khoản đầu tư, chuyển khoản góp vốn chiến lược',
        'Thương lượng điều chỉnh ngân sách, đề xuất tăng lương/thưởng',
        'Rà soát danh mục tài sản sinh lời và dòng tiền dự phòng'
      ],
      avoidList: [
        'Đầu cơ rủi ro cao dựa trên tin đồn không được kiểm chứng',
        'Chi tiêu cảm tính cho các vật dụng không thiết yếu'
      ],
      auspiciousDirection: `Hướng ${deityDirections.wealthDeityDirection} (Tiếp dẫn Tài Khí)`,
      auspiciousDeity: 'Tài Thần • Kim Quỹ Hoàng Đạo'
    },
    INITIATION_TRAVEL: {
      type: 'INITIATION_TRAVEL',
      titleVi: 'Khởi Sự, Xuất Hành & Kết Nối VIP',
      subtitleVi: 'Mở Rộng Bang Giao & Quý Nhân Tương Trợ',
      tagline: 'Năng lượng bình an, trường khí rộng mở tiếp dẫn nhân duyên quý báu.',
      accentColor: 'from-blue-500 to-cyan-600',
      recommendedSlots: travelSlots.slice(0, 3),
      idealSlot: travelIdeal,
      strategicRationale: `Giờ ${travelIdeal.stemNameVi} ${travelIdeal.branchNameVi} (${travelIdeal.timeRangeStr}) mang chỉ số an toàn ${travelIdeal.aspects.safety.score}đ và tương hòa nhân duyên ${travelIdeal.aspects.relationship.score}đ, hóa giải chướng ngại trên lộ trình và kích hoạt trợ lực quý nhân.`,
      doList: [
        'Khởi hành chuyến công tác xa, lên máy bay hoặc xuất hành đầu ngày',
        'Gặp gỡ cố vấn, bậc tiền bối hoặc đối tác chiến lược lần đầu',
        'Khai trương chi nhánh, công bố sản phẩm mới ra thị trường'
      ],
      avoidList: [
        'Xuất phát muộn làm lỡ khung giờ xuất hành cát tinh',
        'Mang tâm trạng căng thẳng khi bước vào cuộc gặp đầu tiên'
      ],
      auspiciousDirection: `Hướng ${deityDirections.joyDeityDirection} (Hỷ Thần nghênh tiếp) & Hướng ${deityDirections.nobleDeityDirection} (Quý Nhân)`,
      auspiciousDeity: 'Hỷ Thần • Thiên Hỷ Cát Tinh'
    },
    QUIET_REFLECTION: {
      type: 'QUIET_REFLECTION',
      titleVi: 'Tĩnh Tâm, Rà Soát & Quản Trị Rủi Ro',
      subtitleVi: 'Thủ Thế Vững Vàng • Tránh Mọi Va Chạm',
      tagline: 'Khoảng lặng chiến lược giúp tâm trí lắng dịu, nhìn thấu điểm mù và bảo toàn nguyên khí.',
      accentColor: 'from-purple-500 to-indigo-600',
      recommendedSlots: reflectionSlots.slice(0, 3),
      idealSlot: reflectionIdeal,
      strategicRationale: `Khung giờ ${reflectionIdeal.stemNameVi} ${reflectionIdeal.branchNameVi} (${reflectionIdeal.timeRangeStr}) mang dao động trường khí thận trọng (Chỉ số rủi ro ${reflectionIdeal.riskPercentage}%). Đây là thời gian hoàn hảo để thu hồi năng lượng vào bên trong, rà soát chi tiết văn bản và tuyệt đối không phát ngôn bốc đồng.`,
      doList: [
        'Thiền định 15-20 phút, tập thở sâu, thanh lọc tâm trí',
        'Kiểm tra lại toàn bộ số liệu, hợp đồng, điều khoản tài chính',
        'Lập kế hoạch kín đáo, làm việc độc lập trong không gian yên tĩnh'
      ],
      avoidList: [
        'Tranh cãi đối kháng với cấp trên, đồng nghiệp hoặc bạn đời',
        'Ký tá bất kỳ tài liệu nào khi chưa đọc kỹ từng câu chữ',
        'Đưa ra quyết định trọng đại trong trạng thái cảm xúc kích động'
      ],
      auspiciousDirection: 'Hướng Tĩnh Tâm • Ngồi quay lưng về phía vách tường vững chãi',
      auspiciousDeity: 'Huyền Vũ • Thanh Tịnh Chi Thần'
    }
  };

  // Determine current active action based on current slot
  const currentSlot = snapshot.currentSlot;
  let currentActiveAction: StrategicActionType | undefined;
  if (currentSlot.isClash || currentSlot.cautionScore > 65) {
    currentActiveAction = 'QUIET_REFLECTION';
  } else if (currentSlot.aspects.wealth.score >= 78) {
    currentActiveAction = 'WEALTH_CATALYST';
  } else if (currentSlot.aspects.career.score >= 78) {
    currentActiveAction = 'CONTRACT_SIGNING';
  } else if (currentSlot.aspects.relationship.score >= 75) {
    currentActiveAction = 'INITIATION_TRAVEL';
  }

  // Determine next upcoming best window
  const currentSlotIdx = slots.findIndex((s: HourlySlotInsight) => s.isCurrent);
  const futureSlots = slots.slice(currentSlotIdx + 1).concat(slots.slice(0, currentSlotIdx));
  const nextGolden = futureSlots.find((s: HourlySlotInsight) => s.alertLevel === 'GOLDEN_WINDOW' && !s.isClash) || futureSlots[0];
  const nextSlotIdx = slots.findIndex((s: HourlySlotInsight) => s.branchKey === nextGolden.branchKey);
  const hoursUntil = (nextSlotIdx - currentSlotIdx + 12) % 12 * 2;

  let nextActionType: StrategicActionType = 'CONTRACT_SIGNING';
  if (nextGolden.aspects.wealth.score > nextGolden.aspects.career.score) {
    nextActionType = 'WEALTH_CATALYST';
  } else if (nextGolden.aspects.relationship.score > 80) {
    nextActionType = 'INITIATION_TRAVEL';
  }

  const nextBestWindow = {
    actionType: nextActionType,
    slot: nextGolden,
    hoursUntil,
    message: `Khung giờ vàng kế tiếp: Giờ ${nextGolden.stemNameVi} ${nextGolden.branchNameVi} (${nextGolden.timeRangeStr}) — Lý tưởng cho ${actionWindows[nextActionType].titleVi}.`
  };

  // PWA Push Notification Payload Format
  const pwaPushPayload = {
    title: `🧭 Aurora La Bàn Định Thời: Giờ ${currentSlot.stemNameVi} ${currentSlot.branchNameVi}`,
    body: `${currentSlot.tacticalAdvice.slice(0, 100)}... Giờ vàng tiếp theo: ${nextGolden.branchNameVi} (${nextGolden.timeRangeStr}).`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `chrono-alert-${currentSlot.branchKey}`,
    data: {
      url: '/?tab=daily',
      actionType: currentActiveAction || 'CONTRACT_SIGNING',
      branchKey: currentSlot.branchKey
    }
  };

  const deltaMin = trueSolarResult.totalCorrectionMinutes;
  const deltaFormatted = `${deltaMin >= 0 ? '+' : ''}${deltaMin.toFixed(1)} phút`;

  return {
    timestamp: targetTime.toISOString(),
    location,
    civilTime: {
      hour: civilHour,
      minute: civilMinute,
      second: civilSecond,
      formatted: `${civilHour < 10 ? '0' : ''}${civilHour}:${civilMinute < 10 ? '0' : ''}${civilMinute}:${civilSecond < 10 ? '0' : ''}${civilSecond}`
    },
    trueSolarTime: {
      hour: trueSolarResult.trueSolarHour,
      minute: trueSolarResult.trueSolarMinute,
      formatted: `${trueSolarResult.trueSolarHour < 10 ? '0' : ''}${trueSolarResult.trueSolarHour}:${trueSolarResult.trueSolarMinute < 10 ? '0' : ''}${trueSolarResult.trueSolarMinute}`,
      equationOfTimeMinutes: trueSolarResult.equationOfTimeMinutes,
      longitudeCorrectionMinutes: trueSolarResult.longitudeCorrectionMinutes,
      totalCorrectionMinutes: trueSolarResult.totalCorrectionMinutes,
      deltaFormatted
    },
    snapshot,
    actionWindows,
    currentActiveAction,
    nextBestWindow,
    pwaPushPayload
  };
}

// ==========================================
// REAL-TIME CELESTIAL DESTINY RADAR ENGINE
// Ultra-precision astronomical hour pillar, zodiac status, and quantum resonance calculation
// ==========================================

import {
  HeavenlyStem,
  EarthlyBranch,
  FiveElement,
  CalculationResult
} from '../types/destiny';
import {
  STEMS,
  BRANCHES,
  STEM_KEYS,
  BRANCH_KEYS,
  ELEMENT_RELATIONS,
  getTenGod
} from './canchi';
import { gregorianToJulianDay, getSolarTerm } from './lunarSolar';

export type AlertLevel = 'GOLDEN_WINDOW' | 'BALANCED_FLOW' | 'CLASH_ANOMALY';

export interface HourlySlotInsight {
  branchKey: EarthlyBranch;
  branchNameVi: string;
  stemKey: HeavenlyStem;
  stemNameVi: string;
  timeRangeStr: string;
  startHour: number;
  endHour: number;
  isCurrent: boolean;
  isZodiacAuspicious: boolean; // Hoàng Đạo vs Hắc Đạo
  zodiacStarName: string; // Tên Thần Sát (Thanh Long, Minh Đường, v.v.)
  element: FiveElement;
  resonanceScore: number; // 0 - 100
  alertLevel: AlertLevel;
  tenGodName: string;
  isGuiRen: boolean; // Thiên Ất Quý Nhân
  isSanHe: boolean; // Tam Hợp
  isLiuHe: boolean; // Lục Hợp
  isClash: boolean; // Lục Xung
  tacticalAdvice: string;
  bestForActivities: string[];
  avoidActivities: string[];
}

export interface RealtimeDestinySnapshot {
  timestamp: string;
  currentDateStr: string;
  solarTerm: string;
  hourStr: string;
  secondsRemainingInCurrentHour: number;
  timeRemainingFormatted: string;
  
  // Current Pillars
  currentYearPillar: { stem: string; branch: string };
  currentMonthPillar: { stem: string; branch: string };
  currentDayPillar: { stem: string; branch: string; stemElement: FiveElement };
  currentHourPillar: { stem: string; branch: string; element: FiveElement; naYin: string };

  // Current Moment Analysis
  currentSlot: HourlySlotInsight;
  resonanceScore: number;
  alertLevel: AlertLevel;
  headlineMessage: string;
  actionGuidance: string;
  mitigationProtocol: string;
  auspiciousDirection: string;
  luckyColorHex: string;
  luckyColorName: string;

  // 12-Hour Daily Horizon
  hourlySlots: HourlySlotInsight[];
}

// 12 Earthly Branches start hour in 24h format
// Zi (23-01), Chou (01-03), Yin (03-05), Mao (05-07), Chen (07-09), Si (09-11),
// Wu (11-13), Wei (13-15), Shen (15-17), You (17-19), Xu (19-21), Hai (21-23)
const BRANCH_HOUR_RANGES: { branch: EarthlyBranch; start: number; end: number; rangeStr: string }[] = [
  { branch: 'Zi', start: 23, end: 1, rangeStr: '23:00 - 00:59' },
  { branch: 'Chou', start: 1, end: 3, rangeStr: '01:00 - 02:59' },
  { branch: 'Yin_B', start: 3, end: 5, rangeStr: '03:00 - 04:59' },
  { branch: 'Mao', start: 5, end: 7, rangeStr: '05:00 - 06:59' },
  { branch: 'Chen', start: 7, end: 9, rangeStr: '07:00 - 08:59' },
  { branch: 'Si', start: 9, end: 11, rangeStr: '09:00 - 10:59' },
  { branch: 'Wu_B', start: 11, end: 13, rangeStr: '11:00 - 12:59' },
  { branch: 'Wei', start: 13, end: 15, rangeStr: '13:00 - 14:59' },
  { branch: 'Shen', start: 15, end: 17, rangeStr: '15:00 - 16:59' },
  { branch: 'You', start: 17, end: 19, rangeStr: '17:00 - 18:59' },
  { branch: 'Xu', start: 19, end: 21, rangeStr: '19:00 - 20:59' },
  { branch: 'Hai', start: 21, end: 23, rangeStr: '21:00 - 22:59' }
];

// Determine current Branch index from given date
export function getBranchForTime(date: Date): { branch: EarthlyBranch; index: number; rangeStr: string } {
  const hours = date.getHours();
  if (hours >= 23 || hours < 1) return { branch: 'Zi', index: 0, rangeStr: '23:00 - 00:59' };
  if (hours >= 1 && hours < 3) return { branch: 'Chou', index: 1, rangeStr: '01:00 - 02:59' };
  if (hours >= 3 && hours < 5) return { branch: 'Yin_B', index: 2, rangeStr: '03:00 - 04:59' };
  if (hours >= 5 && hours < 7) return { branch: 'Mao', index: 3, rangeStr: '05:00 - 06:59' };
  if (hours >= 7 && hours < 9) return { branch: 'Chen', index: 4, rangeStr: '07:00 - 08:59' };
  if (hours >= 9 && hours < 11) return { branch: 'Si', index: 5, rangeStr: '09:00 - 10:59' };
  if (hours >= 11 && hours < 13) return { branch: 'Wu_B', index: 6, rangeStr: '11:00 - 12:59' };
  if (hours >= 13 && hours < 15) return { branch: 'Wei', index: 7, rangeStr: '13:00 - 14:59' };
  if (hours >= 15 && hours < 17) return { branch: 'Shen', index: 8, rangeStr: '15:00 - 16:59' };
  if (hours >= 17 && hours < 19) return { branch: 'You', index: 9, rangeStr: '17:00 - 18:59' };
  if (hours >= 19 && hours < 21) return { branch: 'Xu', index: 10, rangeStr: '19:00 - 20:59' };
  return { branch: 'Hai', index: 11, rangeStr: '21:00 - 22:59' };
}

// Compute Stem for a given hour branch based on Day Stem ("Ngũ Thử Độn Nhật Khởi Thời Quyết")
export function getHourStemForDay(dayStem: HeavenlyStem, branchIndex: number): HeavenlyStem {
  // Giáp/Kỷ khởi Giáp Tý (0)
  // Ất/Canh khởi Bính Tý (2)
  // Bính/Tân khởi Mậu Tý (4)
  // Đinh/Nhâm khởi Canh Tý (6)
  // Mậu/Quý khởi Nhâm Tý (8)
  const dayStemIdx = STEM_KEYS.indexOf(dayStem);
  const baseStart = ((dayStemIdx % 5) * 2) % 10;
  const stemIdx = (baseStart + branchIndex) % 10;
  return STEM_KEYS[stemIdx];
}

// Six Clashes (Lục Xung) map
const SIX_CLASHES: Record<EarthlyBranch, EarthlyBranch> = {
  Zi: 'Wu_B', Wu_B: 'Zi',
  Chou: 'Wei', Wei: 'Chou',
  Yin_B: 'Shen', Shen: 'Yin_B',
  Mao: 'You', You: 'Mao',
  Chen: 'Xu', Xu: 'Chen',
  Si: 'Hai', Hai: 'Si'
};

// Six Harmonies (Lục Hợp) map
const SIX_HARMONIES: Record<EarthlyBranch, EarthlyBranch> = {
  Zi: 'Chou', Chou: 'Zi',
  Yin_B: 'Hai', Hai: 'Yin_B',
  Mao: 'Xu', Xu: 'Mao',
  Chen: 'You', You: 'Chen',
  Si: 'Shen', Shen: 'Si',
  Wu_B: 'Wei', Wei: 'Wu_B'
};

// Three Harmonies (Tam Hợp) sets
const THREE_HARMONIES: Record<EarthlyBranch, EarthlyBranch[]> = {
  Shen: ['Zi', 'Chen'], Zi: ['Shen', 'Chen'], Chen: ['Shen', 'Zi'],
  Hai: ['Mao', 'Wei'], Mao: ['Hai', 'Wei'], Wei: ['Hai', 'Mao'],
  Yin_B: ['Wu_B', 'Xu'], Wu_B: ['Yin_B', 'Xu'], Xu: ['Yin_B', 'Wu_B'],
  Si: ['You', 'Chou'], You: ['Si', 'Chou'], Chou: ['Si', 'You']
};

// Heavenly Noble (Thiên Ất Quý Nhân) according to Day Stem
const NOBLE_STARS: Record<HeavenlyStem, EarthlyBranch[]> = {
  Jia: ['Chou', 'Wei'],
  Wu: ['Chou', 'Wei'],
  Geng: ['Chou', 'Wei'],
  Yi: ['Zi', 'Shen'],
  Ji: ['Zi', 'Shen'],
  Bing: ['Hai', 'You'],
  Ding: ['Hai', 'You'],
  Ren: ['Si', 'Mao'],
  Gui: ['Si', 'Mao'],
  Xin: ['Wu_B', 'Yin_B']
};

// 12 Zodiac Spirits (Hoàng Đạo & Hắc Đạo) calculation according to Day Branch
// 6 Hoàng Đạo: Thanh Long (HĐ), Minh Đường (HĐ), Kim Quỹ (HĐ), Thiên Đức (HĐ), Ngọc Đường (HĐ), Tư Mệnh (HĐ)
// 6 Hắc Đạo: Thiên Hình (HĐo), Chu Tước (HĐo), Bạch Hổ (HĐo), Thiên Lao (HĐo), Huyền Vũ (HĐo), Câu Trận (HĐo)
const ZODIAC_CYCLE = [
  { name: 'Thanh Long', isAuspicious: true },
  { name: 'Minh Đường', isAuspicious: true },
  { name: 'Thiên Hình', isAuspicious: false },
  { name: 'Chu Tước', isAuspicious: false },
  { name: 'Kim Quỹ', isAuspicious: true },
  { name: 'Thiên Đức', isAuspicious: true },
  { name: 'Bạch Hổ', isAuspicious: false },
  { name: 'Ngọc Đường', isAuspicious: true },
  { name: 'Thiên Lao', isAuspicious: false },
  { name: 'Huyền Vũ', isAuspicious: false },
  { name: 'Tư Mệnh', isAuspicious: true },
  { name: 'Câu Trận', isAuspicious: false }
];

// Determine starting offset for Zodiac cycle based on day branch
function getZodiacOffset(dayBranch: EarthlyBranch): number {
  switch (dayBranch) {
    case 'Zi': case 'Wu_B': return 8; // Thân khởi Thanh Long
    case 'Chou': case 'Wei': return 10; // Tuất khởi Thanh Long
    case 'Yin_B': case 'Shen': return 0; // Tý khởi Thanh Long
    case 'Mao': case 'You': return 2; // Dần khởi Thanh Long
    case 'Chen': case 'Xu': return 4; // Thìn khởi Thanh Long
    case 'Si': case 'Hai': return 6; // Ngọ khởi Thanh Long
    default: return 0;
  }
}

/**
 * Calculates real-time high-precision celestial destiny snapshot and alert metrics
 */
export function calculateRealtimeSnapshot(
  calculation: CalculationResult | null,
  now: Date = new Date()
): RealtimeDestinySnapshot {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // 1. Compute Day Stem & Branch from Julian Day
  const jd = gregorianToJulianDay(year, month, day);
  // Gregorian epoch offset for stem & branch of day
  const dayStemIdx = Math.abs((jd + 9) % 10);
  const dayBranchIdx = Math.abs((jd + 1) % 12);
  const dayStem = STEM_KEYS[dayStemIdx];
  const dayBranch = BRANCH_KEYS[dayBranchIdx];
  const dayStemInfo = STEMS[dayStem];
  const dayBranchInfo = BRANCHES[dayBranch];

  // 2. Solar Term (24 Tiết Khí)
  const solarTerm = getSolarTerm(year, month, day);

  // 3. Current Hour Branch and Stem
  const currentBranchData = getBranchForTime(now);
  const currentHourStem = getHourStemForDay(dayStem, currentBranchData.index);
  const currentHourStemInfo = STEMS[currentHourStem];
  const currentHourBranchInfo = BRANCHES[currentBranchData.branch];

  // 4. Calculate Seconds remaining in current 2-hour bracket
  let endHour = (Math.floor(hours / 2) * 2 + 1) % 24;
  if (hours % 2 === 0) endHour = (hours + 1) % 24;
  else endHour = (hours) % 24; // When odd hour, ends at end of next hour
  
  // Clean countdown calculation for 2-hour window:
  // Canh giờ bắt đầu vào giờ lẻ (1h, 3h, 5h, 7h, 9h, 11h, 13h, 15h, 17h, 19h, 21h, 23h)
  // Canh giờ kéo dài 120 phút.
  let minutesIntoWindow = (hours % 2 === 1 ? 0 : 60) + minutes;
  let secondsRemaining = (120 - minutesIntoWindow) * 60 - seconds;
  if (secondsRemaining < 0) secondsRemaining = 7200 + secondsRemaining;
  const remMin = Math.floor(secondsRemaining / 60);
  const remSec = secondsRemaining % 60;
  const timeRemainingFormatted = `${remMin}m ${remSec < 10 ? '0' : ''}${remSec}s`;

  // 5. User Baseline anchors
  const userDayMasterStem = calculation?.bazi?.dayMaster || 'Jia';
  const userDayMasterElement = calculation?.bazi?.dayMasterElement || 'Wood';
  const userFavorable = calculation?.bazi?.favorableElements || ['Water', 'Fire'];
  const userUnfavorable = calculation?.bazi?.unfavorableElements || ['Metal'];
  const userDayBranch = calculation?.bazi?.dayPillar?.branch || 'Chen';

  // 6. Generate 12 hourly slots for today
  const zodiacOffset = getZodiacOffset(dayBranch);
  const hourlySlots: HourlySlotInsight[] = BRANCH_HOUR_RANGES.map((slot, idx) => {
    const slotStem = getHourStemForDay(dayStem, idx);
    const slotStemInfo = STEMS[slotStem];
    const slotBranchInfo = BRANCHES[slot.branch];
    const isCurrent = slot.branch === currentBranchData.branch;

    // Zodiac Spirit
    const spiritIdx = (idx - zodiacOffset + 12) % 12;
    const zodiacSpirit = ZODIAC_CYCLE[spiritIdx];

    // Interactions with user chart
    const isClash = SIX_CLASHES[userDayBranch] === slot.branch;
    const isLiuHe = SIX_HARMONIES[userDayBranch] === slot.branch;
    const isSanHe = (THREE_HARMONIES[userDayBranch] || []).includes(slot.branch);
    const isGuiRen = (NOBLE_STARS[userDayMasterStem] || []).includes(slot.branch);
    const tenGod = getTenGod(userDayMasterStem, slotStem);

    // Calculate dynamic resonance score (0 - 100)
    let score = 70;
    if (zodiacSpirit.isAuspicious) score += 8;
    else score -= 8;

    if (userFavorable.includes(slotStemInfo.element)) score += 12;
    if (userFavorable.includes(slotBranchInfo.element)) score += 8;
    if (userUnfavorable.includes(slotStemInfo.element)) score -= 12;

    if (isGuiRen) score += 15;
    if (isSanHe) score += 12;
    if (isLiuHe) score += 8;
    if (isClash) score -= 28;

    // Clamp score
    score = Math.max(30, Math.min(99, score));

    // Alert Level determination
    let alertLevel: AlertLevel = 'BALANCED_FLOW';
    if (score >= 82) alertLevel = 'GOLDEN_WINDOW';
    else if (score < 62 || isClash) alertLevel = 'CLASH_ANOMALY';

    // Activity recommendations
    const bestFor: string[] = [];
    const avoid: string[] = [];

    if (alertLevel === 'GOLDEN_WINDOW') {
      bestFor.push('Ký kết hợp đồng & đàm phán thương vụ lớn');
      bestFor.push('Ra mắt sản phẩm, công bố thông điệp quan trọng');
      bestFor.push('Gặp gỡ đối tác quý nhân và mở rộng kết nối');
      avoid.push('Trì hoãn hoặc bỏ lỡ cơ hội hành động');
    } else if (alertLevel === 'CLASH_ANOMALY') {
      bestFor.push('Tập trung làm việc độc lập & nghiên cứu chuyên sâu');
      bestFor.push('Thiền định, cân bằng tâm trí và uống nhiều nước');
      bestFor.push('Rà soát lỗ hổng chi phí và bảo mật dữ liệu');
      avoid.push('Tranh cãi bộc phát hoặc quyết định đầu tư mạo hiểm');
      avoid.push('Ký kết văn bản pháp lý thiếu sự kiểm chứng kỹ');
    } else {
      bestFor.push('Vận hành công việc hàng ngày ổn định');
      bestFor.push('Hoàn thiện các đầu mục nhiệm vụ còn tồn đọng');
      bestFor.push('Trao đổi nhóm và chăm sóc khách hàng thân thiết');
      avoid.push('Hành động vội vã vượt ngoài kế hoạch chuẩn bị');
    }

    let tacticalAdvice = '';
    if (isClash) {
      tacticalAdvice = `⚠️ Địa chi giờ ${slotBranchInfo.nameVi} xung trực tiếp với Chi ngày sinh (${BRANCHES[userDayBranch]?.nameVi}). Tần số năng lượng biến động mạnh, cần phòng ngự và thận trọng tối đa.`;
    } else if (isGuiRen) {
      tacticalAdvice = `🌟 Giờ Thiên Ất Quý Nhân chiếu rọi: Dễ gặp được sự đồng thuận từ cấp trên hoặc đối tác chiến lược.`;
    } else if (isSanHe || isLiuHe) {
      tacticalAdvice = `✨ Giờ Tam Hợp / Lục Hợp mang lại từ trường hòa nhã, năng suất tương tác đội ngũ đạt mức tối ưu.`;
    } else if (zodiacSpirit.isAuspicious) {
      tacticalAdvice = `Giờ Hoàng Đạo (${zodiacSpirit.name}) hỗ trợ khí sắc tích cực và sự minh mẫn trong tư duy logic.`;
    } else {
      tacticalAdvice = `Giờ Hắc Đạo (${zodiacSpirit.name}): Thích hợp làm việc tĩnh, giữ vững kỷ luật nội tại.`;
    }

    return {
      branchKey: slot.branch,
      branchNameVi: slotBranchInfo.nameVi,
      stemKey: slotStem,
      stemNameVi: slotStemInfo.nameVi,
      timeRangeStr: slot.rangeStr,
      startHour: slot.start,
      endHour: slot.end,
      isCurrent,
      isZodiacAuspicious: zodiacSpirit.isAuspicious,
      zodiacStarName: zodiacSpirit.name,
      element: slotStemInfo.element,
      resonanceScore: score,
      alertLevel,
      tenGodName: tenGod.nameVi,
      isGuiRen,
      isSanHe,
      isLiuHe,
      isClash,
      tacticalAdvice,
      bestForActivities: bestFor,
      avoidActivities: avoid
    };
  });

  const currentSlot = hourlySlots.find(s => s.isCurrent) || hourlySlots[0];
  const resonanceScore = currentSlot.resonanceScore;
  const alertLevel = currentSlot.alertLevel;

  // Auspicious directions & colors based on current hour element & favorable element
  const primaryEl = currentSlot.element;
  let luckyColorHex = '#10b981';
  let luckyColorName = 'Xanh lục phỉ thúy (Mộc)';
  let auspiciousDirection = 'Đông & Đông Nam';

  if (primaryEl === 'Fire') {
    luckyColorHex = '#ef4444';
    luckyColorName = 'Đỏ Ruby / Tím Hoàng Gia (Hỏa)';
    auspiciousDirection = 'Chính Nam';
  } else if (primaryEl === 'Earth') {
    luckyColorHex = '#f59e0b';
    luckyColorName = 'Vàng hổ phách / Nâu đất ấm (Thổ)';
    auspiciousDirection = 'Tây Nam & Đông Bắc';
  } else if (primaryEl === 'Metal') {
    luckyColorHex = '#e2e8f0';
    luckyColorName = 'Bạch kim / Ánh bạc tinh khiết (Kim)';
    auspiciousDirection = 'Tây & Tây Bắc';
  } else if (primaryEl === 'Water') {
    luckyColorHex = '#38bdf8';
    luckyColorName = 'Xanh lam ngọc / Đen huyền bí (Thủy)';
    auspiciousDirection = 'Chính Bắc';
  }

  let headlineMessage = '';
  let actionGuidance = '';
  let mitigationProtocol = '';

  if (alertLevel === 'GOLDEN_WINDOW') {
    headlineMessage = `CỬA SỔ HOÀNG KIM: Giờ ${currentSlot.stemNameVi} ${currentSlot.branchNameVi} (${currentSlot.zodiacStarName})`;
    actionGuidance = `Trường năng lượng đạt độ cộng hưởng cao nhất (${resonanceScore}/100). Hãy chốt các thỏa thuận then chốt, gửi email quan trọng hoặc đưa ra các quyết định bước ngoặt ngay trong canh giờ này.`;
    mitigationProtocol = 'Tự tin đẩy mạnh tốc độ thực thi; từ trường cá nhân đang được bảo hộ bởi sao cát tinh.';
  } else if (alertLevel === 'CLASH_ANOMALY') {
    headlineMessage = `CẢNH BÁO XUNG KHẮC: Giờ ${currentSlot.stemNameVi} ${currentSlot.branchNameVi} (${currentSlot.zodiacStarName})`;
    actionGuidance = `Phát hiện xung khắc vi mô (${currentSlot.isClash ? 'Địa Chi Tương Xung' : 'Xung Khắc Ngũ Hành'}). Khuyến nghị kích hoạt chế độ phòng vệ: hoãn ký kết các điều khoản mạo hiểm và giữ bình tĩnh tuyệt đối.`;
    mitigationProtocol = `Tránh hành động bốc đồng; duy trì không gian yên tĩnh và kiểm tra kỹ lưỡng số liệu trước khi phê duyệt.`;
  } else {
    headlineMessage = `DÒNG CHẢY ỔN ĐỊNH: Giờ ${currentSlot.stemNameVi} ${currentSlot.branchNameVi} (${currentSlot.zodiacStarName})`;
    actionGuidance = `Năng lượng trung tính và cân bằng (${resonanceScore}/100). Phù hợp tối ưu cho việc nghiên cứu, sắp xếp công việc, xây dựng kế hoạch và hội thảo nội bộ.`;
    mitigationProtocol = 'Duy trì nhịp làm việc có kế hoạch; không cần can thiệp điều chỉnh đột ngột.';
  }

  return {
    timestamp: now.toISOString(),
    currentDateStr: now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    solarTerm,
    hourStr: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    secondsRemainingInCurrentHour: secondsRemaining,
    timeRemainingFormatted,
    currentYearPillar: { stem: 'Bính', branch: 'Ngọ' }, // Deterministic context
    currentMonthPillar: { stem: 'Bính', branch: 'Thân' },
    currentDayPillar: { stem: dayStemInfo.nameVi, branch: dayBranchInfo.nameVi, stemElement: dayStemInfo.element },
    currentHourPillar: {
      stem: currentHourStemInfo.nameVi,
      branch: currentHourBranchInfo.nameVi,
      element: currentHourStemInfo.element,
      naYin: 'Thiên hà thuỷ'
    },
    currentSlot,
    resonanceScore,
    alertLevel,
    headlineMessage,
    actionGuidance,
    mitigationProtocol,
    auspiciousDirection,
    luckyColorHex,
    luckyColorName,
    hourlySlots
  };
}

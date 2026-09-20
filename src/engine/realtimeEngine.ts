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
  getTenGod,
  getNaYin
} from './canchi';
import { gregorianToJulianDay, getSolarTerm } from './lunarSolar';
import { calculateYearPillar, calculateMonthPillar, calculateDayPillar, calculateHourPillar } from './bazi';

export type AlertLevel = 'GOLDEN_WINDOW' | 'BALANCED_FLOW' | 'CLASH_ANOMALY';

export type LuckCategory = 'DAI_CAT' | 'TIEU_CAT' | 'BINH_HOA' | 'TIEU_HUNG' | 'DAI_HUNG';

export interface LuckAspectDetail {
  score: number; // 0 - 100
  status: 'Cát Lợi (Hên)' | 'Thuận Lợi' | 'Bình Hòa' | 'Thận Trọng' | 'Nguy Cơ (Xui)';
  verdict: 'HEN' | 'BINH' | 'XUI';
  advice: string;
}

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
  luckCategory: LuckCategory;
  luckPercentage: number; // 0 - 100% (Tỷ lệ Hên thực tế)
  riskPercentage: number; // 100 - luckPercentage (Tỷ lệ Xui/Rủi ro)
  tenGodName: string;
  isGuiRen: boolean; // Thiên Ất Quý Nhân
  isSanHe: boolean; // Tam Hợp
  isLiuHe: boolean; // Lục Hợp
  isClash: boolean; // Lục Xung
  isLucHai?: boolean; // Lục Hại
  tacticalAdvice: string;
  bestForActivities: string[];
  avoidActivities: string[];
  
  // Chi tiết 4 phương diện hên xui
  aspects: {
    wealth: LuckAspectDetail;      // Tài lộc, tiền bạc, mua bán
    career: LuckAspectDetail;      // Công việc, đàm phán, quyết định
    relationship: LuckAspectDetail;// Giao tiếp, nhân duyên, quý nhân
    safety: LuckAspectDetail;      // Bình an, di chuyển, sức khỏe
  };
}

export interface RealtimeDestinySnapshot {
  timestamp: string;
  currentDateStr: string;
  solarTerm: string;
  hourStr: string;
  secondsRemainingInCurrentHour: number;
  timeRemainingFormatted: string;
  
  // Canh giờ vi mô (Sơ khắc, Chính khắc, Mạt khắc)
  microPhase: {
    phaseName: 'Sơ Khắc' | 'Chính Khắc' | 'Mạt Khắc';
    phaseDescription: string;
    progressPercentage: number; // 0 - 100% trong 2h
  };

  // Current Pillars
  currentYearPillar: { stem: string; branch: string };
  currentMonthPillar: { stem: string; branch: string };
  currentDayPillar: { stem: string; branch: string; stemElement: FiveElement };
  currentHourPillar: { stem: string; branch: string; element: FiveElement; naYin: string };

  // Current Moment Analysis
  currentSlot: HourlySlotInsight;
  resonanceScore: number;
  luckCategory: LuckCategory;
  luckPercentage: number; // % Hên
  riskPercentage: number; // % Xui
  alertLevel: AlertLevel;
  headlineMessage: string;
  actionGuidance: string;
  mitigationProtocol: string;
  quickRemedy: string; // Lời khuyên hóa giải tức thì
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
  now: Date = new Date(),
  timezoneOffset?: number
): RealtimeDestinySnapshot {
  const tzOffset = timezoneOffset !== undefined 
    ? timezoneOffset 
    : (calculation?.inputSnapshot?.timezoneOffset ?? 7);

  // Derive target local time accounting for timezone offset
  const targetUtcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localTargetDate = new Date(targetUtcMs + (tzOffset * 3600000));

  const year = localTargetDate.getFullYear();
  const month = localTargetDate.getMonth() + 1;
  const day = localTargetDate.getDate();
  const hours = localTargetDate.getHours();
  const minutes = localTargetDate.getMinutes();
  const seconds = localTargetDate.getSeconds();

  // 1. Compute Astronomical Year & Month Pillars from Solar Terms & Sun Longitude
  const yearPillarData = calculateYearPillar(year, month, day, tzOffset, hours, minutes);
  const monthPillarData = calculateMonthPillar(yearPillarData.stem, year, month, day, tzOffset, hours, minutes);

  const currentYearPillar = {
    stem: STEMS[yearPillarData.stem].nameVi,
    branch: BRANCHES[yearPillarData.branch].nameVi
  };

  const currentMonthPillar = {
    stem: STEMS[monthPillarData.stem].nameVi,
    branch: BRANCHES[monthPillarData.branch].nameVi
  };

  // 2. Compute Day Stem & Branch from Canonical Bazi Engine
  const isLateRat = Boolean(calculation?.inputSnapshot?.isLateRat);
  const dayPillarData = calculateDayPillar(year, month, day, hours, isLateRat);
  const dayStem = dayPillarData.stem;
  const dayBranch = dayPillarData.branch;
  const dayStemInfo = STEMS[dayStem];
  const dayBranchInfo = BRANCHES[dayBranch];

  // 3. Solar Term (24 Tiết Khí)
  const solarTerm = getSolarTerm(year, month, day);

  // 4. Current Hour Branch and Stem from Canonical Bazi Engine
  const hourPillarData = calculateHourPillar(dayStem, hours, minutes, isLateRat);
  const currentBranchData = getBranchForTime(localTargetDate);
  const currentHourStem = hourPillarData.stem;
  const currentHourBranch = hourPillarData.branch;
  const currentHourStemInfo = STEMS[currentHourStem];
  const currentHourBranchInfo = BRANCHES[currentHourBranch];
  const hourNaYin = getNaYin(currentHourStem, currentHourBranch);

  // 5. Calculate Seconds remaining in current 2-hour bracket
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
    score = Math.max(25, Math.min(99, score));

    // Alert Level determination
    let alertLevel: AlertLevel = 'BALANCED_FLOW';
    if (score >= 82) alertLevel = 'GOLDEN_WINDOW';
    else if (score < 62 || isClash) alertLevel = 'CLASH_ANOMALY';

    // Precision Luck Category (5 Phân Cấp Hên - Xui Chuẩn Xác)
    let luckCategory: LuckCategory = 'BINH_HOA';
    if (score >= 85) luckCategory = 'DAI_CAT';
    else if (score >= 72) luckCategory = 'TIEU_CAT';
    else if (score >= 58) luckCategory = 'BINH_HOA';
    else if (score >= 45 && !isClash) luckCategory = 'TIEU_HUNG';
    else luckCategory = 'DAI_HUNG';

    const luckPercentage = score;
    const riskPercentage = Math.max(1, 100 - score);

    // 4 Detailed Life Fortune Aspects
    const wealthScore = Math.max(20, Math.min(99, score + (isGuiRen ? 8 : 0) + (['Chính Tài', 'Thiên Tài', 'Thực Thần'].includes(tenGod.nameVi) ? 10 : -5)));
    const careerScore = Math.max(20, Math.min(99, score + (zodiacSpirit.isAuspicious ? 6 : -6) + (['Chính Quan', 'Chính Ấn'].includes(tenGod.nameVi) ? 8 : -4)));
    const relScore = Math.max(20, Math.min(99, score + (isSanHe || isLiuHe ? 14 : isClash ? -18 : 0)));
    const safetyScore = Math.max(20, Math.min(99, score - (isClash ? 25 : 0) - (!zodiacSpirit.isAuspicious ? 8 : 0)));

    const getAspectVerdict = (s: number): { status: 'Cát Lợi (Hên)' | 'Thuận Lợi' | 'Bình Hòa' | 'Thận Trọng' | 'Nguy Cơ (Xui)'; verdict: 'HEN' | 'BINH' | 'XUI' } => {
      if (s >= 80) return { status: 'Cát Lợi (Hên)', verdict: 'HEN' };
      if (s >= 68) return { status: 'Thuận Lợi', verdict: 'HEN' };
      if (s >= 55) return { status: 'Bình Hòa', verdict: 'BINH' };
      if (s >= 42) return { status: 'Thận Trọng', verdict: 'XUI' };
      return { status: 'Nguy Cơ (Xui)', verdict: 'XUI' };
    };

    const wealthVerdict = getAspectVerdict(wealthScore);
    const careerVerdict = getAspectVerdict(careerScore);
    const relVerdict = getAspectVerdict(relScore);
    const safetyVerdict = getAspectVerdict(safetyScore);

    // Activity recommendations
    const bestFor: string[] = [];
    const avoid: string[] = [];

    if (luckCategory === 'DAI_CAT') {
      bestFor.push('Ký kết hợp đồng tài chính & chốt giao dịch lớn');
      bestFor.push('Ra mắt dự án, xuất hành khởi sự, gặp đối tác VIP');
      bestFor.push('Cầu tài lộc, mở tài khoản, quyết định đầu tư then chốt');
      avoid.push('Trì hoãn, chần chừ làm lỡ vận may trời ban');
    } else if (luckCategory === 'TIEU_CAT') {
      bestFor.push('Đàm phán công việc, trao đổi công khai, gửi báo cáo');
      bestFor.push('Mở rộng quan hệ, giao lưu đối tác, kết bạn mới');
      bestFor.push('Hoàn thành các mục tiêu quan trọng trong ngày');
      avoid.push('Nghi ngờ bản thân, bỏ qua các ý tưởng sáng tạo');
    } else if (luckCategory === 'DAI_HUNG') {
      bestFor.push('Làm việc độc lập, thiền định tịnh tâm, đọc sách');
      bestFor.push('Bảo toàn tài chính, rà soát sổ sách kế toán cẩn mật');
      bestFor.push('Tạm dừng các chuyến đi xa hoặc lái xe tốc độ cao');
      avoid.push('Ký kết giấy tờ pháp lý, xuất tiền đầu tư rủi ro');
      avoid.push('Tranh cãi gay gắt với sếp, đồng nghiệp hay người thân');
      avoid.push('Quyết định bộc phát trong lúc cảm xúc dao động');
    } else if (luckCategory === 'TIEU_HUNG') {
      bestFor.push('Xử lý việc tồn đọng nội bộ, rà soát chi phí');
      bestFor.push('Kiểm tra kỹ lưỡng hợp đồng trước khi xác nhận');
      bestFor.push('Nghỉ ngơi dưỡng sức, uống đủ nước thanh lọc cơ thể');
      avoid.push('Vội vã chuyển tiền mà chưa đối chiếu tài khoản');
      avoid.push('Bình luận nhạy cảm trên mạng xã hội hoặc nhóm chat');
    } else {
      bestFor.push('Vận hành công việc theo quy trình định sẵn');
      bestFor.push('Học hỏi nâng cao kỹ năng, trao đổi chuyên môn');
      bestFor.push('Chăm sóc khách hàng hiện hữu và đối tác quen thuộc');
      avoid.push('Hành động vượt ngoài kế hoạch đã chuẩn bị');
    }

    let tacticalAdvice = '';
    if (isClash) {
      tacticalAdvice = `⚠️ [ĐẠI HUNG - CỰC XUI] Địa chi giờ ${slotBranchInfo.nameVi} xung trực tiếp với Chi ngày sinh (${BRANCHES[userDayBranch]?.nameVi}). Tần số năng lượng dao động cực mạnh, hãy hoãn quyết định lớn.`;
    } else if (isGuiRen) {
      tacticalAdvice = `🌟 [ĐẠI CÁT - CỰC HÊN] Giờ Thiên Ất Quý Nhân chiếu rọi: Dễ gặp quý nhân tương trợ, hóa giải mọi trở ngại, đàm phán đại lợi.`;
    } else if (isSanHe || isLiuHe) {
      tacticalAdvice = `✨ [CÁT LÀNH] Giờ Tam Hợp / Lục Hợp hội tụ: Trường khí hòa hợp, làm việc nhóm và chốt hợp tác thuận buồm xuôi gió.`;
    } else if (zodiacSpirit.isAuspicious) {
      tacticalAdvice = `[HOÀNG ĐẠO] Sao ${zodiacSpirit.name} hộ mệnh: Tư duy sáng suốt, khí vận tích cực, phù hợp tiến hành việc quan trọng.`;
    } else {
      tacticalAdvice = `[HẮC ĐẠO] Sao ${zodiacSpirit.name}: Khí vận có phần trầm lắng, thích hợp giữ vững kỷ luật nội tại, tránh xung đột.`;
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
      luckCategory,
      luckPercentage,
      riskPercentage,
      tenGodName: tenGod.nameVi,
      isGuiRen,
      isSanHe,
      isLiuHe,
      isClash,
      tacticalAdvice,
      bestForActivities: bestFor,
      avoidActivities: avoid,
      aspects: {
        wealth: {
          score: wealthScore,
          status: wealthVerdict.status,
          verdict: wealthVerdict.verdict,
          advice: wealthVerdict.verdict === 'HEN' 
            ? 'Cát vận tài chính vượng phát, thích hợp xuất tiền, chốt hợp đồng hoặc mua sắm tài sản giá trị.'
            : wealthVerdict.verdict === 'XUI'
            ? 'Nguy cơ hao hụt hoặc tranh chấp tài sản. Tuyệt đối không cho mượn tiền hay đầu tư mạo hiểm.'
            : 'Tài chính bình ổn, chỉ nên thu chi theo định mức hàng ngày.'
        },
        career: {
          score: careerScore,
          status: careerVerdict.status,
          verdict: careerVerdict.verdict,
          advice: careerVerdict.verdict === 'HEN'
            ? 'Quan vận hanh thông, lời nói có trọng lượng, thích hợp thuyết trình và ra quyết định chỉ huy.'
            : careerVerdict.verdict === 'XUI'
            ? 'Dễ gặp bất đồng ý kiến hoặc trục trặc giấy tờ. Cần kiểm tra kỹ từng câu chữ trước khi gửi.'
            : 'Tiến độ công việc đều đặn, tập trung xử lý các đầu mục kế hoạch sẵn có.'
        },
        relationship: {
          score: relScore,
          status: relVerdict.status,
          verdict: relVerdict.verdict,
          advice: relVerdict.verdict === 'HEN'
            ? 'Nhân duyên hòa nhã, gặp gỡ kết nối bạn bè đối tác rất dễ tạo thiện cảm và tìm thấy tiếng nói chung.'
            : relVerdict.verdict === 'XUI'
            ? 'Khí trường dễ gây hiểu lầm hoặc nóng nảy. Khuyến nghị lắng nghe nhiều hơn phản bác.'
            : 'Giao tiếp bình thường, đối nhân xử thế theo phép lịch thiệp.'
        },
        safety: {
          score: safetyScore,
          status: safetyVerdict.status,
          verdict: safetyVerdict.verdict,
          advice: safetyVerdict.verdict === 'HEN'
            ? 'Thân tâm an lạc, sinh lực tràn trề, di chuyển xa gần đều được cát tinh nâng đỡ thuận lợi.'
            : safetyVerdict.verdict === 'XUI'
            ? 'Chú ý an toàn khi tham gia giao thông, tránh nâng vật nặng hoặc thức khuya làm tổn hao chân khí.'
            : 'Sức khỏe ổn định, nên uống nước ấm và đi dạo thư giãn nhẹ nhàng.'
        }
      }
    };
  });

  const currentSlot = hourlySlots.find(s => s.isCurrent) || hourlySlots[0];
  const resonanceScore = currentSlot.resonanceScore;
  const alertLevel = currentSlot.alertLevel;
  const luckCategory = currentSlot.luckCategory;
  const luckPercentage = currentSlot.luckPercentage;
  const riskPercentage = currentSlot.riskPercentage;

  // Compute Micro-phase within current 2-hour window
  let phaseName: 'Sơ Khắc' | 'Chính Khắc' | 'Mạt Khắc' = 'Chính Khắc';
  let phaseDescription = '';
  const progressPct = Math.round((minutesIntoWindow / 120) * 100);

  if (minutesIntoWindow < 30) {
    phaseName = 'Sơ Khắc';
    phaseDescription = 'Giai đoạn khí trường canh giờ mới đang bắt đầu khai mở, năng lượng đang dần tích tụ.';
  } else if (minutesIntoWindow <= 90) {
    phaseName = 'Chính Khắc';
    phaseDescription = 'Thời khắc chính vị - Khí trường đạt đỉnh cao vượng thịnh nhất của canh giờ hiện tại.';
  } else {
    phaseName = 'Mạt Khắc';
    phaseDescription = 'Giai đoạn chuyển giao giao thoa, khí trường chuẩn bị chuyển dịch sang canh giờ kế tiếp.';
  }

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
  let quickRemedy = '';

  if (luckCategory === 'DAI_CAT') {
    headlineMessage = `⚡ ĐẠI CÁT HOÀNG KIM (${luckPercentage}% ĐIỀU KIỆN THUẬN LỢI): Giờ ${currentSlot.stemNameVi} ${currentSlot.branchNameVi} (${currentSlot.zodiacStarName})`;
    actionGuidance = `Khí trường thời điểm và mệnh bàn đồng pha tương trợ tích cực. Hoạt động trao đổi, ký kết, đàm phán có cơ sở hỗ trợ năng lượng thuận lợi.`;
    mitigationProtocol = 'Nắm bắt thời cơ hành động với kế hoạch rõ ràng; phát huy sự tự chủ và tập trung.';
    quickRemedy = 'Quay mặt về hướng ' + auspiciousDirection + ', mang theo vật phẩm màu ' + luckyColorName + ' để kích hoạt đỉnh cao tài lộc.';
  } else if (luckCategory === 'TIEU_CAT') {
    headlineMessage = `✨ TIỂU CÁT HANH THÔNG (${luckPercentage}% ĐIỀU KIỆN THUẬN LỢI): Giờ ${currentSlot.stemNameVi} ${currentSlot.branchNameVi} (${currentSlot.zodiacStarName})`;
    actionGuidance = `Thời điểm thuận lợi, nhân hòa, thích hợp gặp gỡ đối tác, xử lý việc trọng đại và đẩy nhanh tiến độ công việc.`;
    mitigationProtocol = 'Duy trì phong độ tích cực, chủ động trao đổi và chia sẻ cơ hội với đồng đội.';
    quickRemedy = 'Uống một ngụm trà ấm, hướng bàn làm việc về ' + auspiciousDirection + ' để duy trì dòng năng lượng hanh thông.';
  } else if (luckCategory === 'DAI_HUNG') {
    headlineMessage = `🚨 CẢNH BÁO THẬN TRỌNG CAO (${riskPercentage}% RỦI RO): Giờ ${currentSlot.stemNameVi} ${currentSlot.branchNameVi} (${currentSlot.zodiacStarName})`;
    actionGuidance = `Phát hiện xung khắc giữa thời khắc hiện tại và bản mệnh (${currentSlot.isClash ? 'Địa Chi Lục Xung' : 'Tương Khắc Ngũ Hành'}). Cần cẩn trọng trong các quyết định quan trọng.`;
    mitigationProtocol = 'Kích hoạt chế độ thận trọng: Rà soát kỹ điều khoản, không vội vàng giải ngân, giữ tâm thế bình tĩnh.';
    quickRemedy = 'Hóa giải tức thì: Tránh ra quyết định vội vàng trước ' + currentSlot.endHour + ':00. Uống nước lọc, hít sâu 3 hơi để ổn định từ trường.';
  } else if (luckCategory === 'TIEU_HUNG') {
    headlineMessage = `⚠️ CẢNH BÁO THẬN TRỌNG (${riskPercentage}% RỦI RO): Giờ ${currentSlot.stemNameVi} ${currentSlot.branchNameVi} (${currentSlot.zodiacStarName})`;
    actionGuidance = `Năng lượng có phần nhiễu loạn do Hắc Đạo hoặc ngũ hành không tương dung. Dễ xảy ra chậm trễ hoặc phát sinh chi phí ngoài dự kiến.`;
    mitigationProtocol = 'Kiểm tra kỹ lưỡng giấy tờ và số liệu, tránh phán đoán chủ quan.';
    quickRemedy = 'Dành 5 phút nghỉ ngơi, điều chỉnh tâm thế điềm đạm trước khi phản hồi email hay điện thoại.';
  } else {
    headlineMessage = `⚖️ BÌNH HÒA TRUNG TÍNH (Cân Bằng): Giờ ${currentSlot.stemNameVi} ${currentSlot.branchNameVi} (${currentSlot.zodiacStarName})`;
    actionGuidance = `Năng lượng điều hòa, thích hợp làm việc định kỳ, tích lũy kiến thức, lên kế hoạch cho các bước đi tiếp theo.`;
    mitigationProtocol = 'Tiến hành mọi sự theo lịch trình bài bản, giữ nhịp thở ổn định.';
    quickRemedy = 'Giữ không gian làm việc thoáng đãng và ngăn nắp để duy trì sự sáng suốt.';
  }

  return {
    timestamp: now.toISOString(),
    currentDateStr: now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    solarTerm,
    hourStr: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    secondsRemainingInCurrentHour: secondsRemaining,
    timeRemainingFormatted,
    currentYearPillar,
    currentMonthPillar,
    currentDayPillar: { stem: dayStemInfo.nameVi, branch: dayBranchInfo.nameVi, stemElement: dayStemInfo.element },
    currentHourPillar: {
      stem: currentHourStemInfo.nameVi,
      branch: currentHourBranchInfo.nameVi,
      element: currentHourStemInfo.element,
      naYin: hourNaYin
    },
    currentSlot,
    resonanceScore,
    luckCategory,
    luckPercentage,
    riskPercentage,
    alertLevel,
    microPhase: {
      phaseName,
      phaseDescription,
      progressPercentage: progressPct
    },
    headlineMessage,
    actionGuidance,
    mitigationProtocol,
    quickRemedy,
    auspiciousDirection,
    luckyColorHex,
    luckyColorName,
    hourlySlots
  };
}

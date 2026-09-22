// ==========================================
// TEMPORAL TRANSIT & LIFETIME CYCLES ENGINE
// Deterministic Da Yun (Đại Vận) and Annual Transit (Lưu Niên) Calculation
// Conforms strictly to Canonical Bát Tự Solar Terms & Astronomical Ephemeris
// ==========================================

import {
  DecadeCycle,
  AnnualTransit,
  BirthData,
  HeavenlyStem,
  EarthlyBranch,
  FiveElement,
  PalaceKey
} from '../types/destiny';
import {
  STEM_KEYS,
  BRANCH_KEYS,
  STEMS,
  BRANCHES,
  ELEMENT_RELATIONS,
  getTenGod
} from './canchi';
import { calculateYearPillar, calculateMonthPillar, calculateDayPillar, calculateHourPillar } from './bazi';
import {
  gregorianToContinuousJD,
  getSunLongitudeAtInstant
} from './lunarSolar';

// ==========================================
// 1. CANONICAL SOLAR TERMS FOR BAZI MONTHS (12 TIẾT)
// Each BaZi month is defined by a Major Solar Term (Tiết) every 30 degrees starting from Lập Xuân (315°)
// ==========================================
export const MAJOR_SOLAR_TERMS_JIE: { nameVi: string; degree: number; order: number; branch: EarthlyBranch }[] = [
  { nameVi: 'Lập Xuân', degree: 315, order: 0, branch: 'Yin_B' }, // Dần
  { nameVi: 'Kinh Trập', degree: 345, order: 1, branch: 'Mao' },   // Mão
  { nameVi: 'Thanh Minh', degree: 15, order: 2, branch: 'Chen' },  // Thìn
  { nameVi: 'Lập Hạ', degree: 45, order: 3, branch: 'Si' },       // Tỵ
  { nameVi: 'Mang Chủng', degree: 75, order: 4, branch: 'Wu_B' },  // Ngọ
  { nameVi: 'Tiểu Thử', degree: 105, order: 5, branch: 'Wei' },    // Mùi
  { nameVi: 'Lập Thu', degree: 135, order: 6, branch: 'Shen' },   // Thân
  { nameVi: 'Bạch Lộ', degree: 165, order: 7, branch: 'You' },    // Dậu
  { nameVi: 'Hàn Lộ', degree: 195, order: 8, branch: 'Xu' },      // Tuất
  { nameVi: 'Lập Đông', degree: 225, order: 9, branch: 'Hai' },   // Hợi
  { nameVi: 'Đại Tuyết', degree: 255, order: 10, branch: 'Zi' },   // Tý
  { nameVi: 'Tiểu Hàn', degree: 285, order: 11, branch: 'Chou' }  // Sửu
];

// Traditional Tử Bình Time Conversion Rule: 3 solar days = 1 year of age
export const DA_YUN_TIME_CONVERSION_RULE = {
  id: 'TRADITIONAL_3_DAYS_EQUALS_1_YEAR' as const,
  name: 'Truyền thống Bát Tự Tử Bình: 3 ngày = 1 năm tuổi',
  daysPerYear: 3.0,
  daysPerMonth: 0.25, // 1 ngày = 4 tháng = 120 ngày tuổi
  hoursPerDayOfAge: 2.4, // 1 canh giờ (2h) = 10 ngày tuổi
  referenceSource: 'Tam Mệnh Thông Hội (三命通會), Uyên Hải Tử Bình (淵海子平), Bát Tự Dự Đoán Học'
};

export interface DaYunStartAgeDetail {
  direction: 'forward' | 'reverse';
  relevantSolarTerm: string;
  relevantTermDegree: number;
  crossingJD: number;
  birthJD: number;
  elapsedDays: number;
  startAgeExact: number;
  startAgeRounded: number;
  conversionRule: string;
}

/**
 * Finds the exact continuous Julian Date where the true sun longitude reaches targetDeg
 * using bisection search with sub-second astronomical precision.
 */
export function findSolarTermCrossingJD(targetDeg: number, searchLowJD: number, searchHighJD: number): number {
  function angleDifference(deg: number, target: number): number {
    return ((deg - target + 540) % 360) - 180;
  }
  let low = searchLowJD;
  let high = searchHighJD;
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const diff = angleDifference(getSunLongitudeAtInstant(mid), targetDeg);
    if (diff < 0) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

/**
 * Calculates start age for Đại Vận (Decade Cycles) dynamically based on:
 * - Astronomical continuous Julian date of birth
 * - Gender and Yin/Yang nature of the Year stem (determines Forward vs Reverse)
 * - Exact elapsed time to relevant Major Solar Term (Tiết)
 * - Canonical 3 days = 1 year conversion
 */
export function calculateDaYunStartAgeDetail(birthData: BirthData): DaYunStartAgeDetail {
  const { solarYear, solarMonth, solarDay, gender } = birthData;
  const hour = typeof birthData.solarHour === 'number' ? birthData.solarHour : 12;
  const minute = typeof birthData.solarMinute === 'number' ? birthData.solarMinute : 0;
  const tz = typeof birthData.timezoneOffset === 'number' ? birthData.timezoneOffset : 7;

  const birthJD = gregorianToContinuousJD(solarYear, solarMonth, solarDay, hour, minute, tz);
  const sunDeg = getSunLongitudeAtInstant(birthJD);

  // Year pillar determines Yang/Yin polarity of Year stem
  const yearPB = calculateYearPillar(solarYear, solarMonth, solarDay, tz, hour, minute);
  const isYangYear = STEMS[yearPB.stem].yinYang === 'Yang';
  const isMale = gender === 'Male';
  const isForward = (isYangYear && isMale) || (!isYangYear && !isMale);
  const direction: 'forward' | 'reverse' = isForward ? 'forward' : 'reverse';

  // Find the major solar term bracket (12 Jie)
  const normDeg = ((sunDeg - 315) % 360 + 360) % 360;
  const currentOrder = Math.floor(normDeg / 30);
  const prevTerm = MAJOR_SOLAR_TERMS_JIE[currentOrder];
  const nextOrder = (currentOrder + 1) % 12;
  const nextTerm = MAJOR_SOLAR_TERMS_JIE[nextOrder];

  let relevantTerm = isForward ? nextTerm : prevTerm;
  let crossingJD: number;
  let elapsedDays: number;

  if (isForward) {
    const dist = ((nextTerm.degree - sunDeg) % 360 + 360) % 360;
    const estDays = dist < 0.001 ? 30 : dist / 0.9856;
    const searchLow = birthJD - 0.05;
    const searchHigh = birthJD + estDays + 3.0;
    crossingJD = findSolarTermCrossingJD(nextTerm.degree, searchLow, searchHigh);
    elapsedDays = Math.max(0.0001, crossingJD - birthJD);
  } else {
    const dist = ((sunDeg - prevTerm.degree) % 360 + 360) % 360;
    const estDays = dist < 0.001 ? 30 : dist / 0.9856;
    const searchLow = birthJD - estDays - 3.0;
    const searchHigh = birthJD + 0.05;
    crossingJD = findSolarTermCrossingJD(prevTerm.degree, searchLow, searchHigh);
    elapsedDays = Math.max(0.0001, birthJD - crossingJD);
  }

  const startAgeExact = elapsedDays / DA_YUN_TIME_CONVERSION_RULE.daysPerYear;
  const startAgeRounded = Math.max(1, Math.round(startAgeExact));

  return {
    direction,
    relevantSolarTerm: relevantTerm.nameVi,
    relevantTermDegree: relevantTerm.degree,
    crossingJD,
    birthJD,
    elapsedDays: Number(elapsedDays.toFixed(4)),
    startAgeExact: Number(startAgeExact.toFixed(2)),
    startAgeRounded,
    conversionRule: DA_YUN_TIME_CONVERSION_RULE.name
  };
}

// Calculate 8 Decade Cycles (Đại Vận)
export function calculateDecadeCycles(birthData: BirthData): DecadeCycle[] {
  const { solarYear, solarMonth, solarDay, gender } = birthData;
  const hour = typeof birthData.solarHour === 'number' ? birthData.solarHour : 12;
  const minute = typeof birthData.solarMinute === 'number' ? birthData.solarMinute : 0;
  const tz = typeof birthData.timezoneOffset === 'number' ? birthData.timezoneOffset : 7;

  const yearPB = calculateYearPillar(solarYear, solarMonth, solarDay, tz, hour, minute);
  const monthPB = calculateMonthPillar(yearPB.stem, solarYear, solarMonth, solarDay, tz, hour, minute);
  const dayPB = calculateDayPillar(solarYear, solarMonth, solarDay, tz);

  const daYunDetail = calculateDaYunStartAgeDetail(birthData);
  const isForward = daYunDetail.direction === 'forward';
  const baseStartAge = daYunDetail.startAgeExact;

  const monthStemIdx = STEM_KEYS.indexOf(monthPB.stem);
  const monthBranchIdx = BRANCH_KEYS.indexOf(monthPB.branch);

  const palacesOrder: PalaceKey[] = [
    'life', 'siblings', 'spouse', 'children', 'wealth', 'health',
    'travel', 'friends', 'career', 'property', 'karma', 'parents'
  ];

  const cycles: DecadeCycle[] = [];

  for (let i = 1; i <= 8; i++) {
    const step = isForward ? i : -i;
    const stemIdx = (monthStemIdx + step + 100) % 10;
    const branchIdx = (monthBranchIdx + step + 120) % 12;

    const stem = STEM_KEYS[stemIdx];
    const branch = BRANCH_KEYS[branchIdx];
    const element = STEMS[stem].element;
    const tenGod = getTenGod(dayPB.stem, stem).nameVi;

    const startAge = Number((baseStartAge + (i - 1) * 10).toFixed(1));
    const endAge = Number((startAge + 9.9).toFixed(1));
    const startYear = Math.round(solarYear + startAge);
    const endYear = startYear + 9;

    const focalPalace = palacesOrder[(i - 1) % palacesOrder.length];

    // Compute cycle harmony based on element relation to Day Master (Section VI: rule-based heuristic with provenance)
    const dayMasterElement = STEMS[dayPB.stem].element;
    let ruleBasedScore = 70; // Baseline neutral interaction
    if (element === dayMasterElement) ruleBasedScore = 80; // Tỷ Kiếp: Đồng hành trợ lực
    else if (ELEMENT_RELATIONS[dayMasterElement].generates === element) ruleBasedScore = 86; // Thực Thương: Tiết khí xuất lực sáng tạo
    else if (ELEMENT_RELATIONS[dayMasterElement].generatedBy === element) ruleBasedScore = 90; // Chính/Thiên Ấn: Sinh phù nuôi dưỡng
    else if (ELEMENT_RELATIONS[dayMasterElement].overcomes === element) ruleBasedScore = 75; // Tài Tinh: Nhật Chủ khắc chế hoạch định
    else if (ELEMENT_RELATIONS[element].overcomes === dayMasterElement) ruleBasedScore = 65; // Quan Sát: Khắc chế kỷ luật & áp lực

    const harmonyScore = ruleBasedScore;

    cycles.push({
      index: i,
      startAge,
      endAge,
      startYear,
      endYear,
      stem,
      branch,
      element,
      tenGod,
      focalPalace,
      harmonyScore,
      ruleBasedScore,
      scoreType: 'RULE_BASED_HEURISTIC',
      algorithmVersion: 'temporal-heuristic-v2',
      startAgeExact: daYunDetail.startAgeExact,
      direction: daYunDetail.direction,
      daYunCalculation: {
        conversionRule: daYunDetail.conversionRule,
        relevantSolarTerm: daYunDetail.relevantSolarTerm,
        elapsedDays: daYunDetail.elapsedDays,
        startAgeExact: daYunDetail.startAgeExact
      },
      keyThemes: [
        `Giai đoạn ${startAge}-${endAge} tuổi: Khởi động vận trình ${STEMS[stem].nameVi} ${BRANCHES[branch].nameVi}`,
        `Cung trọng điểm: ${focalPalace.toUpperCase()} gắn liền với chuyển biến ${tenGod}`
      ],
      opportunitySignals: [
        `Tương tác năng lượng ${ELEMENT_RELATIONS[element]?.vi || element} gia tăng sức bền`,
        `Cơ hội mở rộng tầm ảnh hưởng xã hội và sự nghiệp`
      ],
      cautionSignals: [
        `Tránh mở rộng quy mô vốn vượt quá quản trị kiểm soát`,
        `Cân bằng giữa tốc độ phát triển và sức khỏe tái tạo`
      ]
    });
  }

  return cycles;
}

// ==========================================
// 2. ASTROLOGICAL INTERACTION HELPERS (LỤC XUNG, TAM HỢP, TƯƠNG HÌNH, TƯƠNG HẠI)
// ==========================================
const CLASH_MAP: Record<EarthlyBranch, EarthlyBranch> = {
  Zi: 'Wu_B', Wu_B: 'Zi',
  Chou: 'Wei', Wei: 'Chou',
  Yin_B: 'Shen', Shen: 'Yin_B',
  Mao: 'You', You: 'Mao',
  Chen: 'Xu', Xu: 'Chen',
  Si: 'Hai', Hai: 'Si'
};

const SIX_COMBINES: Record<EarthlyBranch, EarthlyBranch> = {
  Zi: 'Chou', Chou: 'Zi',
  Yin_B: 'Hai', Hai: 'Yin_B',
  Mao: 'Xu', Xu: 'Mao',
  Chen: 'You', You: 'Chen',
  Si: 'Shen', Shen: 'Si',
  Wu_B: 'Wei', Wei: 'Wu_B'
};

const SIX_HARMS: Record<EarthlyBranch, EarthlyBranch> = {
  Zi: 'Wei', Wei: 'Zi',
  Chou: 'Wu_B', Wu_B: 'Chou',
  Yin_B: 'Si', Si: 'Yin_B',
  Mao: 'Chen', Chen: 'Mao',
  Shen: 'Hai', Hai: 'Shen',
  You: 'Xu', Xu: 'You'
};

// Calculate Single Annual Transit (Lưu Niên) with structural astrological interactions
export function calculateSingleAnnualTransit(birthData: BirthData, yr: number): AnnualTransit {
  const tz = typeof birthData.timezoneOffset === 'number' ? birthData.timezoneOffset : 7;
  const hour = typeof birthData.solarHour === 'number' ? birthData.solarHour : 12;
  const minute = typeof birthData.solarMinute === 'number' ? birthData.solarMinute : 0;

  const yearPB = calculateYearPillar(birthData.solarYear, birthData.solarMonth, birthData.solarDay, tz, hour, minute);
  const monthPB = calculateMonthPillar(yearPB.stem, birthData.solarYear, birthData.solarMonth, birthData.solarDay, tz, hour, minute);
  const dayPB = calculateDayPillar(birthData.solarYear, birthData.solarMonth, birthData.solarDay, tz);
  const hourPB = calculateHourPillar(dayPB.stem, hour);
  const dayMasterElement = STEMS[dayPB.stem].element;

  const stemIdx = (yr - 4) % 10;
  const branchIdx = (yr - 4) % 12;
  const stem = STEM_KEYS[(stemIdx + 10) % 10];
  const branch = BRANCH_KEYS[(branchIdx + 12) % 12];
  const element = STEMS[stem].element;
  const tenGod = getTenGod(dayPB.stem, stem).nameVi;

  // 1. Evaluate interactions between transit branch and birth chart branches
  const birthBranches: { role: string; branch: EarthlyBranch }[] = [
    { role: 'Trụ Năm', branch: yearPB.branch },
    { role: 'Trụ Tháng', branch: monthPB.branch },
    { role: 'Trụ Ngày', branch: dayPB.branch },
    { role: 'Trụ Giờ', branch: hourPB.branch }
  ];

  const clashes: string[] = [];
  const combinations: string[] = [];
  const harms: string[] = [];
  const punishments: string[] = [];

  let clashPenalty = 0;
  let combinationBonus = 0;
  let harmPenalty = 0;

  for (const pb of birthBranches) {
    if (CLASH_MAP[branch] === pb.branch) {
      clashes.push(`Lưu Niên ${BRANCHES[branch].nameVi} xung ${pb.role} (${BRANCHES[pb.branch].nameVi})`);
      clashPenalty += (pb.role === 'Trụ Ngày' ? 14 : pb.role === 'Trụ Tháng' ? 10 : 8);
    }
    if (SIX_COMBINES[branch] === pb.branch) {
      combinations.push(`Lưu Niên ${BRANCHES[branch].nameVi} lục hợp ${pb.role} (${BRANCHES[pb.branch].nameVi})`);
      combinationBonus += (pb.role === 'Trụ Ngày' ? 12 : pb.role === 'Trụ Tháng' ? 10 : 8);
    }
    if (SIX_HARMS[branch] === pb.branch) {
      harms.push(`Lưu Niên ${BRANCHES[branch].nameVi} tương hại ${pb.role} (${BRANCHES[pb.branch].nameVi})`);
      harmPenalty += 6;
    }
  }

  // 2. Baseline harmony from Day Master element relation (Section VI: rule-based heuristic with provenance)
  let baseHarmony = 70; // Baseline neutral interaction
  if (element === dayMasterElement) baseHarmony = 78; // Tỷ Kiếp
  else if (ELEMENT_RELATIONS[dayMasterElement].generates === element) baseHarmony = 84; // Thực Thương
  else if (ELEMENT_RELATIONS[dayMasterElement].generatedBy === element) baseHarmony = 88; // Chính/Thiên Ấn
  else if (ELEMENT_RELATIONS[dayMasterElement].overcomes === element) baseHarmony = 76; // Tài Tinh
  else if (ELEMENT_RELATIONS[element].overcomes === dayMasterElement) baseHarmony = 64; // Quan Sát

  // Apply interaction modulations deterministically (replaces arbitrary modulo operations)
  const adjustedHarmony = Math.min(95, Math.max(45, baseHarmony + combinationBonus - clashPenalty - harmPenalty));

  // 3. Domain Scores derived from specific pillar and Ten God resonances
  const isMonthClashed = clashes.some(c => c.includes('Trụ Tháng'));
  const isDayClashed = clashes.some(c => c.includes('Trụ Ngày'));
  const isDayCombined = combinations.some(c => c.includes('Trụ Ngày'));
  const isMonthCombined = combinations.some(c => c.includes('Trụ Tháng'));

  // Career: Focuses on Month Pillar (Career Palace) and Resource/Officer Ten Gods
  const careerMod = isMonthCombined ? 10 : isMonthClashed ? -12 : (tenGod.includes('Quan') || tenGod.includes('Ấn')) ? 6 : 0;
  const careerScore = Math.min(96, Math.max(50, adjustedHarmony + careerMod));

  // Wealth: Focuses on Wealth Ten Gods (Tài Tinh) and general harmony
  const wealthMod = (tenGod.includes('Tài')) ? 10 : (tenGod.includes('Kiếp') || isDayClashed) ? -8 : 0;
  const wealthScore = Math.min(95, Math.max(48, adjustedHarmony + wealthMod));

  // Relationship: Focuses on Day Branch (Spouse Palace)
  const relationshipMod = isDayCombined ? 12 : isDayClashed ? -14 : 0;
  const relationshipScore = Math.min(94, Math.max(50, adjustedHarmony + relationshipMod));

  // Health: Impacted primarily by clash penalties and element disharmony
  const healthScore = Math.min(92, Math.max(55, Math.round(82 - clashPenalty * 0.8 - harmPenalty)));

  // Growth: Resource and Output orientations
  const growthMod = (ELEMENT_RELATIONS[dayMasterElement].generates === element || ELEMENT_RELATIONS[dayMasterElement].generatedBy === element) ? 8 : 2;
  const growthScore = Math.min(98, Math.max(58, adjustedHarmony + growthMod));

  const opportunityWave = Math.min(95, Math.max(25, Math.round((careerScore * 0.5 + wealthScore * 0.5))));
  const cautionWave = Math.min(90, Math.max(15, Math.round(100 - adjustedHarmony * 0.8 + (clashPenalty > 0 ? 12 : 0) + (healthScore < 65 ? 10 : 0))));

  const structuralSummary = clashes.length > 0
    ? `Có tương tác xung khắc: ${clashes.join(', ')}.`
    : combinations.length > 0
      ? `Có tương tác tương hợp: ${combinations.join(', ')}.`
      : `Trạng thái cân bằng bình hòa, không gặp xung phá lớn.`;

  return {
    year: yr,
    stem,
    branch,
    element,
    tenGod,
    overallScore: adjustedHarmony,
    ruleBasedScore: adjustedHarmony,
    scoreType: 'RULE_BASED_HEURISTIC',
    algorithmVersion: 'temporal-heuristic-v2',
    careerScore,
    wealthScore,
    relationshipScore,
    healthScore,
    growthScore,
    opportunityWave,
    cautionWave,
    heuristicHarmonyIndex: adjustedHarmony,
    heuristicOpportunityIndex: opportunityWave,
    heuristicCautionIndex: cautionWave,
    interactions: {
      clashes,
      combinations,
      punishments,
      harms,
      destructions: [],
      structuralSummary
    },
    highlightSummary: `Năm ${yr} (${STEMS[stem].nameVi} ${BRANCHES[branch].nameVi} - ${tenGod}): Thiên can mang hành ${ELEMENT_RELATIONS[element]?.vi || element}. ${structuralSummary}`,
    recommendedFocus: adjustedHarmony >= 80 ? 'Giai đoạn đẩy mạnh quy mô, khai phá dự án mới và liên kết đồng minh' : 'Giai đoạn củng cố nội lực, kiện toàn hệ thống và phòng ngừa rủi ro'
  };
}

// Calculate Annual Transits (Lưu Niên) from current baseline
export function calculateAnnualTransits(birthData: BirthData, startYear: number = 2020, endYear: number = 2036): AnnualTransit[] {
  const transits: AnnualTransit[] = [];
  for (let yr = startYear; yr <= endYear; yr++) {
    transits.push(calculateSingleAnnualTransit(birthData, yr));
  }
  return transits;
}

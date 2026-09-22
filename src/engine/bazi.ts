// ==========================================
// FOUR PILLARS / BAZI CALCULATION ENGINE
// ==========================================

import {
  HeavenlyStem,
  EarthlyBranch,
  FiveElement,
  BaZiChart,
  PillarData,
  BirthData,
  BaZiInteraction,
  BaZiStructureDetails
} from '../types/destiny';
import {
  STEM_KEYS,
  BRANCH_KEYS,
  STEMS,
  BRANCHES,
  ELEMENT_RELATIONS,
  getTenGod,
  getNaYin
} from './canchi';
import { gregorianToJulianDay, convertSolarToLunar, getSunLongitudeDegrees, getSunLongitudeAtTime } from './lunarSolar';

/**
 * ============================================================================
 * DOMAIN CONSTANTS & HEURISTIC SCORING MODEL (TỬ BÌNH / ZIPING METHODOLOGY)
 * ============================================================================
 * TAXONOMY & AUDIT CLASSIFICATION:
 * - DOMAIN CONSTANTS: Canonical metaphysical principles (10 Stems, 12 Branches, 60 Jiazi cycle).
 * - HEURISTIC CONSTANTS: Numerical weights and thresholds for elemental balance and Day Master strength.
 *   In traditional Chinese metaphysics (Tử Bình / Bát Tự), there is NO single empirical physical constant.
 *   These numerical weights represent an orthodox quantitative heuristic model (Lệnh Tháng, Thông Căn,
 *   Đắc Địa, Tỷ Lệ Sinh Khắc) calibrated for consistent, transparent computational assessment.
 */

// HEURISTIC CONSTANTS: ELEMENTAL BALANCE SCORING
export const STEM_ELEMENT_WEIGHT = 1.0; // Standard heavenly stem unit weight
export const BRANCH_PRIMARY_WEIGHT = 1.5; // Standard earthly branch base weight
export const MONTH_COMMANDER_SEASON_WEIGHT = 2.5; // Lệnh Tháng (Commander of the Season) weight heuristic

// HEURISTIC CONSTANTS: PILLAR ROOT STRENGTH (THÔNG CĂN / ĐẮC ĐỊA / TÀNG CAN)
export const ROOT_STRENGTH_BASE = 60;
export const ROOT_STRENGTH_MAIN_ROOT_BONUS = 28; // Tọa Bản Khí (Chính căn vững chắc)
export const ROOT_STRENGTH_HIDDEN_ROOT_BONUS = 18; // Dư khí hoặc Trung khí
export const ROOT_STRENGTH_GENERATING_ROOT_BONUS = 12; // Được Địa chi sinh dưỡng
export const ROOT_STRENGTH_CLASHING_ROOT_PENALTY = 16; // Bị Địa chi khắc chế
export const ROOT_STRENGTH_MAX_BOUND = 99;
export const ROOT_STRENGTH_MIN_BOUND = 35;

// HEURISTIC THRESHOLDS: DAY MASTER STRENGTH RATIO (SUPPORTING / DRAINING)
export const DAY_MASTER_VERY_STRONG_THRESHOLD = 1.6; // Ratio > 1.6
export const DAY_MASTER_STRONG_THRESHOLD = 1.15;     // Ratio > 1.15
export const DAY_MASTER_WEAK_THRESHOLD = 0.85;       // Ratio < 0.85
export const DAY_MASTER_VERY_WEAK_THRESHOLD = 0.6;   // Ratio < 0.6

// Calculate Year Stem & Branch using exact Solar Term boundary (Lập Xuân = 315° Sun Longitude)
export function calculateYearPillar(
  year: number,
  month: number,
  day: number,
  timezoneOffset: number = 7,
  hour: number = 12,
  minute: number = 0
): { stem: HeavenlyStem; branch: EarthlyBranch } {
  const sunDeg = getSunLongitudeAtTime(year, month, day, hour, minute, timezoneOffset);

  let baziYear = year;
  // If in Jan or early Feb and Sun hasn't reached Lập Xuân (315°), belongs to previous astronomical year
  if (month === 1) {
    baziYear = year - 1;
  } else if (month === 2 && sunDeg < 315) {
    baziYear = year - 1;
  }

  // Formula: Year Stem = (baziYear - 4) % 10
  const stemIdx = ((baziYear - 4) % 10 + 10) % 10;
  const stem = STEM_KEYS[stemIdx];

  // Formula: Year Branch = (baziYear - 4) % 12
  const branchIdx = ((baziYear - 4) % 12 + 12) % 12;
  const branch = BRANCH_KEYS[branchIdx];

  return { stem, branch };
}

// Calculate Month Stem & Branch based on Exact Solar Terms (12 Tiết Khí) & Ngũ Hổ Độn
export function calculateMonthPillar(
  yearStem: HeavenlyStem,
  year: number,
  month: number,
  day: number,
  timezoneOffset: number = 7,
  hour: number = 12,
  minute: number = 0
): { stem: HeavenlyStem; branch: EarthlyBranch } {
  const sunDeg = getSunLongitudeAtTime(year, month, day, hour, minute, timezoneOffset);

  // Offset from Lập Xuân (315°). Each month covers exactly 30° of solar longitude
  // 0 -> Dần (315°), 1 -> Mão (345°), 2 -> Thìn (15°), ..., 11 -> Sửu (285°)
  const solarMonthOrder = Math.floor(((sunDeg - 315 + 360) % 360) / 30);

  // Month Branch mapping: order 0 is Dần, 1 is Mão, etc.
  const branchOrder: EarthlyBranch[] = [
    'Yin_B', // Tháng 1 Bát Tự (Dần - Tiết Lập Xuân)
    'Mao',   // Tháng 2 (Mão - Tiết Kinh Trập)
    'Chen',  // Tháng 3 (Thìn - Tiết Thanh Minh)
    'Si',    // Tháng 4 (Tỵ - Tiết Lập Hạ)
    'Wu_B',  // Tháng 5 (Ngọ - Tiết Mang Chủng)
    'Wei',   // Tháng 6 (Mùi - Tiết Tiểu Thử)
    'Shen',  // Tháng 7 (Thân - Tiết Lập Thu)
    'You',   // Tháng 8 (Dậu - Tiết Bạch Lộ)
    'Xu',    // Tháng 9 (Tuất - Tiết Hàn Lộ)
    'Hai',   // Tháng 10 (Hợi - Tiết Lập Đông)
    'Zi',    // Tháng 11 (Tý - Tiết Đại Tuyết)
    'Chou'   // Tháng 12 (Sửu - Tiết Tiểu Hàn)
  ];

  const branch = branchOrder[solarMonthOrder] || 'Yin_B';

  // Five Tigers seeking Month Stem (Ngũ Hổ Độn Quy Luật)
  // Giáp/Kỷ khởi Bính Dần (2); Ất/Canh khởi Mậu Dần (4); Bính/Tân khởi Canh Dần (6); Đinh/Nhâm khởi Nhâm Dần (8); Mậu/Quý khởi Giáp Dần (0)
  const yearStemIdx = STEM_KEYS.indexOf(yearStem);
  const startStemIdx = ((yearStemIdx % 5) * 2 + 2) % 10;
  const stem = STEM_KEYS[(startStemIdx + solarMonthOrder) % 10];

  return { stem, branch };
}

// Calculate Day Pillar using Julian Day Number with Late Rat (Dạ Tý) support
export function calculateDayPillar(
  year: number,
  month: number,
  day: number,
  _timezoneOffset: number = 7,
  isLateRat: boolean = false,
  hour: number = 12
): { stem: HeavenlyStem; branch: EarthlyBranch } {
  let effectiveYear = year;
  let effectiveMonth = month;
  let effectiveDay = day;

  // Under Late Rat (Dạ Tý) convention, 23:00 - 23:59 belongs to the next calendar day's Day Pillar
  if (isLateRat && hour === 23) {
    const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
    effectiveYear = nextDate.getUTCFullYear();
    effectiveMonth = nextDate.getUTCMonth() + 1;
    effectiveDay = nextDate.getUTCDate();
  }

  const jd = gregorianToJulianDay(effectiveYear, effectiveMonth, effectiveDay);
  // Reference epoch: JD 2451545 (Jan 1, 2000) was Mậu Ngọ (Wu, Wu_B)
  // Day Stem index: (jd + 9) % 10
  // Day Branch index: (jd + 1) % 12
  const stemIdx = ((jd + 9) % 10 + 10) % 10;
  const branchIdx = ((jd + 1) % 12 + 12) % 12;

  return {
    stem: STEM_KEYS[stemIdx],
    branch: BRANCH_KEYS[branchIdx]
  };
}

// Calculate Hour Pillar based on Day Stem & Hour (Ngũ Thử Độn)
export function calculateHourPillar(
  dayStem: HeavenlyStem,
  hour: number,
  _minute: number = 0,
  _isLateRat: boolean = false
): { stem: HeavenlyStem; branch: EarthlyBranch } {
  // Determine Hour Branch (Tý: 23:00-00:59, Sửu: 01:00-02:59, etc.)
  let branchIdx = Math.floor((hour + 1) / 2) % 12;
  const branch = BRANCH_KEYS[branchIdx];

  // Five Rats seeking Hour Stem (Ngũ Thử Độn Quy Luật)
  // Giáp/Kỷ khởi Giáp Tý (0); Ất/Canh khởi Bính Tý (2); Bính/Tân khởi Mậu Tý (4); Đinh/Nhâm khởi Canh Tý (6); Mậu/Quý khởi Nhâm Tý (8)
  let startStemIdx = 0;
  if (dayStem === 'Jia' || dayStem === 'Ji') startStemIdx = 0; // Giáp
  else if (dayStem === 'Yi' || dayStem === 'Geng') startStemIdx = 2; // Bính
  else if (dayStem === 'Bing' || dayStem === 'Xin') startStemIdx = 4; // Mậu
  else if (dayStem === 'Ding' || dayStem === 'Ren') startStemIdx = 6; // Canh
  else if (dayStem === 'Wu' || dayStem === 'Gui') startStemIdx = 8; // Nhâm

  const stem = STEM_KEYS[(startStemIdx + branchIdx) % 10];

  return { stem, branch };
}

// Build a Pillar object with Hidden Stems, Na Yin, Ten Gods
export function buildPillar(
  stem: HeavenlyStem,
  branch: EarthlyBranch,
  dayMaster: HeavenlyStem
): PillarData {
  const stemInfo = STEMS[stem];
  const branchInfo = BRANCHES[branch];
  const naYin = getNaYin(stem, branch);
  const tenGod = getTenGod(dayMaster, stem).nameVi;

  const hiddenStems = branchInfo.hiddenStems.map((hs) => ({
    stem: hs,
    element: STEMS[hs].element,
    tenGod: getTenGod(dayMaster, hs).nameVi
  }));

  // Dynamic Root Strength (Thông Căn / Đắc Địa / Tàng Can)
  const branchElement = branchInfo.element;
  const stemElement = stemInfo.element;
  const isMainRoot = branchElement === stemElement;
  const hasHiddenRoot = branchInfo.hiddenStems.some(hs => STEMS[hs].element === stemElement);
  const isGeneratingRoot = ELEMENT_RELATIONS[branchElement].generates === stemElement;
  const isClashingRoot = ELEMENT_RELATIONS[branchElement].overcomes === stemElement;

  let calculatedStrength = ROOT_STRENGTH_BASE;
  if (isMainRoot) calculatedStrength += ROOT_STRENGTH_MAIN_ROOT_BONUS; // Tọa Bản Khí (Chính căn vững chắc)
  else if (hasHiddenRoot) calculatedStrength += ROOT_STRENGTH_HIDDEN_ROOT_BONUS; // Dư khí hoặc Trung khí
  else if (isGeneratingRoot) calculatedStrength += ROOT_STRENGTH_GENERATING_ROOT_BONUS; // Được Địa chi sinh dưỡng
  else if (isClashingRoot) calculatedStrength -= ROOT_STRENGTH_CLASHING_ROOT_PENALTY; // Bị Địa chi khắc chế
  const strength = Math.min(ROOT_STRENGTH_MAX_BOUND, Math.max(ROOT_STRENGTH_MIN_BOUND, calculatedStrength));

  return {
    stem,
    branch,
    stemElement: stemInfo.element,
    branchElement: branchInfo.element,
    hiddenStems,
    naYin,
    tenGod,
    strength
  };
}

// Complete BaZi Chart Computation
export function calculateBaZiChart(birthData: BirthData): BaZiChart {
  const {
    solarYear,
    solarMonth,
    solarDay,
    solarHour,
    solarMinute = 0,
    timezoneOffset = 7,
    isLateRat = false
  } = birthData;

  const yearPB = calculateYearPillar(solarYear, solarMonth, solarDay, timezoneOffset, solarHour, solarMinute);
  const monthPB = calculateMonthPillar(yearPB.stem, solarYear, solarMonth, solarDay, timezoneOffset, solarHour, solarMinute);
  const dayPB = calculateDayPillar(solarYear, solarMonth, solarDay, timezoneOffset, isLateRat, solarHour);
  const hourPB = calculateHourPillar(dayPB.stem, solarHour, solarMinute, isLateRat);

  const dayMaster = dayPB.stem;
  const dayMasterElement = STEMS[dayMaster].element;

  const yearPillar = buildPillar(yearPB.stem, yearPB.branch, dayMaster);
  const monthPillar = buildPillar(monthPB.stem, monthPB.branch, dayMaster);
  const dayPillar = buildPillar(dayPB.stem, dayPB.branch, dayMaster);
  const hourPillar = buildPillar(hourPB.stem, hourPB.branch, dayMaster);

  // Calculate Element Distribution
  const rawElements: Record<FiveElement, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  
  // Stems weight (Heavenly stem base weight)
  [yearPillar.stemElement, monthPillar.stemElement, dayPillar.stemElement, hourPillar.stemElement].forEach((el) => {
    rawElements[el] += STEM_ELEMENT_WEIGHT;
  });

  // Branch primary element weight (Month branch is Commander of the Season / Lệnh Tháng)
  rawElements[yearPillar.branchElement] += BRANCH_PRIMARY_WEIGHT;
  rawElements[monthPillar.branchElement] += MONTH_COMMANDER_SEASON_WEIGHT;
  rawElements[dayPillar.branchElement] += BRANCH_PRIMARY_WEIGHT;
  rawElements[hourPillar.branchElement] += BRANCH_PRIMARY_WEIGHT;

  const totalPoints = Object.values(rawElements).reduce((a, b) => a + b, 0);
  const safeTotalPoints = totalPoints > 0 ? totalPoints : 1;

  // Hamilton / Largest Remainder Method: ensures exact 100% sum, non-negative, and no arbitrary Earth dumping
  const elements: FiveElement[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const rawPercentages = elements.map((el) => {
    const exact = (rawElements[el] / safeTotalPoints) * 100;
    const floor = Math.floor(exact);
    const remainder = exact - floor;
    return { element: el, exact, floor, remainder };
  });

  const initialSum = rawPercentages.reduce((sum, item) => sum + item.floor, 0);
  const remainderToDistribute = Math.max(0, Math.min(5, 100 - initialSum));

  // Sort descending by remainder, break ties deterministically by canonical element index
  const sortedByRemainder = [...rawPercentages].sort((a, b) => {
    if (Math.abs(b.remainder - a.remainder) > 0.000001) {
      return b.remainder - a.remainder;
    }
    return elements.indexOf(a.element) - elements.indexOf(b.element);
  });

  const bonusElements = new Set(sortedByRemainder.slice(0, remainderToDistribute).map((i) => i.element));
  const elementBalance: Record<FiveElement, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  rawPercentages.forEach((item) => {
    elementBalance[item.element] = item.floor + (bonusElements.has(item.element) ? 1 : 0);
  });

  // Calculate Day Master Strength (Vượng / Suy)
  // Generator + Same Element vs Overcomer + Drainer + Wealth
  const supportingWeight =
    rawElements[dayMasterElement] +
    rawElements[ELEMENT_RELATIONS[dayMasterElement].generatedBy];

  const drainingWeight =
    rawElements[ELEMENT_RELATIONS[dayMasterElement].generates] +
    rawElements[ELEMENT_RELATIONS[dayMasterElement].overcomes] +
    rawElements[ELEMENT_RELATIONS[dayMasterElement].overcomeBy];

  let dayMasterStrength: BaZiChart['dayMasterStrength'] = 'Balanced';
  const ratio = supportingWeight / Math.max(1, drainingWeight);
  if (ratio > DAY_MASTER_VERY_STRONG_THRESHOLD) dayMasterStrength = 'Very Strong';
  else if (ratio > DAY_MASTER_STRONG_THRESHOLD) dayMasterStrength = 'Strong';
  else if (ratio < DAY_MASTER_VERY_WEAK_THRESHOLD) dayMasterStrength = 'Very Weak';
  else if (ratio < DAY_MASTER_WEAK_THRESHOLD) dayMasterStrength = 'Weak';

  // Favorable Elements (Dụng Thần & Hỷ Thần)
  const favorableElements: FiveElement[] = [];
  const unfavorableElements: FiveElement[] = [];

  if (dayMasterStrength === 'Strong' || dayMasterStrength === 'Very Strong') {
    // Needs draining, wealth, or control
    favorableElements.push(ELEMENT_RELATIONS[dayMasterElement].generates); // Output (Thực Thương)
    favorableElements.push(ELEMENT_RELATIONS[dayMasterElement].overcomes); // Wealth (Tài)
    unfavorableElements.push(dayMasterElement);
    unfavorableElements.push(ELEMENT_RELATIONS[dayMasterElement].generatedBy); // Resource (Ấn)
  } else {
    // Weak: Needs resource (Ấn) and companion (Tỷ Kiếp)
    favorableElements.push(ELEMENT_RELATIONS[dayMasterElement].generatedBy); // Resource
    favorableElements.push(dayMasterElement); // Same element
    unfavorableElements.push(ELEMENT_RELATIONS[dayMasterElement].overcomes); // Wealth
    unfavorableElements.push(ELEMENT_RELATIONS[dayMasterElement].overcomeBy); // Officer
  }

  // Flag hour pillar as estimated if exact birth hour is not confirmed
  hourPillar.isEstimated = !birthData.hasExactHour;

  // Multi-tier Orthodox Ziping Structure Engine (Tử Bình Chân Thuyên)
  const structureDetails = determineZipingStructure({
    dayMaster,
    dayMasterStrength,
    monthPillar,
    yearPillar,
    hourPillar,
    elementBalance,
    tenGodDistribution: {}
  });
  const structureType = structureDetails.primaryPattern;

  // Inter-Pillar Interactions (Thiên Can Hợp/Xung, Địa Chi Lục Hợp/Xung/Tam Hợp/Tam Hội/Hình/Hại/Phá)
  const interactions = calculateBaZiInteractions({
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster
  });

  // Ten Gods Distribution
  const tenGodDistribution: Record<string, number> = {};
  [yearPillar, monthPillar, dayPillar, hourPillar].forEach(p => {
    tenGodDistribution[p.tenGod] = (tenGodDistribution[p.tenGod] || 0) + 1;
    p.hiddenStems.forEach(hs => {
      tenGodDistribution[hs.tenGod] = (tenGodDistribution[hs.tenGod] || 0) + 0.5;
    });
  });

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    dayMasterElement,
    dayMasterStrength,
    elementBalance,
    favorableElements,
    unfavorableElements,
    structureType,
    structureDetails,
    interactions,
    tenGodDistribution
  };
}

/**
 * ============================================================================
 * ORTHODOX MULTI-TIER ZIPING STRUCTURE ENGINE (TỬ BÌNH CHÂN THUYÊN)
 * ============================================================================
 */
export function determineZipingStructure(params: {
  dayMaster: HeavenlyStem;
  dayMasterStrength: BaZiChart['dayMasterStrength'];
  monthPillar: PillarData;
  yearPillar: PillarData;
  hourPillar: PillarData;
  elementBalance: Record<FiveElement, number>;
  tenGodDistribution: Record<string, number>;
}): BaZiStructureDetails {
  const { dayMaster, dayMasterStrength, monthPillar, yearPillar, hourPillar, elementBalance } = params;
  const monthBranch = monthPillar.branch;
  const monthBranchInfo = BRANCHES[monthBranch];
  const hiddenStems = monthBranchInfo.hiddenStems;
  const primaryHiddenStem = hiddenStems[0];
  const dmElement = STEMS[dayMaster].element;

  // Check special transformed / following structures first (Ngoại Cách / Biến Cách)
  if (dayMasterStrength === 'Very Weak') {
    const resourceEl = ELEMENT_RELATIONS[dmElement].generatedBy;
    const sameEl = dmElement;
    const selfWeight = (elementBalance[resourceEl] || 0) + (elementBalance[sameEl] || 0);

    if (selfWeight <= 15) {
      const wealthEl = ELEMENT_RELATIONS[dmElement].overcomes;
      const officerEl = ELEMENT_RELATIONS[dmElement].overcomeBy;
      const outputEl = ELEMENT_RELATIONS[dmElement].generates;

      if ((elementBalance[officerEl] || 0) >= 42) {
        return {
          primaryPattern: 'Tòng Sát Cách',
          patternSource: 'Biến Cách Tòng Cách',
          monthCommanderBranch: monthBranch,
          monthCommanderStem: primaryHiddenStem,
          school: 'Tử Bình Ngoại Cách (Follow Officer/Killings Pattern)',
          explanation: 'Nhật Chủ cực nhược, không có tỷ kiếp ấn thụ trợ lực, Quan Sát khí thế hùng hậu áp đảo. Quy về Tòng Sát Cách, lấy Quan Sát và Tài làm hỷ thần.'
        };
      }
      if ((elementBalance[wealthEl] || 0) >= 42) {
        return {
          primaryPattern: 'Tòng Tài Cách',
          patternSource: 'Biến Cách Tòng Cách',
          monthCommanderBranch: monthBranch,
          monthCommanderStem: primaryHiddenStem,
          school: 'Tử Bình Ngoại Cách (Follow Wealth Pattern)',
          explanation: 'Nhật Chủ suy nhược không căn khí, Tài tinh chiếm ưu thế tuyệt đối trong tứ trụ. Quy về Tòng Tài Cách, thuận thế dụng Tài Thương.'
        };
      }
      if ((elementBalance[outputEl] || 0) >= 42) {
        return {
          primaryPattern: 'Tòng Nhi Cách',
          patternSource: 'Biến Cách Tòng Cách',
          monthCommanderBranch: monthBranch,
          monthCommanderStem: primaryHiddenStem,
          school: 'Tử Bình Ngoại Cách (Follow Output/Child Pattern)',
          explanation: 'Nhật Chủ quy thuận dòng khí Thực Thần Thương Quan tiết tú thuần túy. Quy về Tòng Nhi Cách, kỵ Ấn thụ xung khắc dòng tiết tú.'
        };
      }
    }
  } else if (dayMasterStrength === 'Very Strong') {
    const sameElWeight = elementBalance[dmElement] || 0;
    const resourceElWeight = elementBalance[ELEMENT_RELATIONS[dmElement].generatedBy] || 0;
    if (sameElWeight + resourceElWeight >= 78) {
      const specialChuyenVuongNames: Record<FiveElement, string> = {
        Wood: 'Khúc Trực Cách (Mộc Chuyên Vượng)',
        Fire: 'Viêm Thượng Cách (Hỏa Chuyên Vượng)',
        Earth: 'Giá Sắc Cách (Thổ Chuyên Vượng)',
        Metal: 'Tòng Cách (Kim Chuyên Vượng)',
        Water: 'Nhuận Hạ Cách (Thủy Chuyên Vượng)'
      };
      return {
        primaryPattern: specialChuyenVuongNames[dmElement] || 'Chuyên Vượng Cách',
        patternSource: 'Chuyên Vượng Cách',
        monthCommanderBranch: monthBranch,
        monthCommanderStem: primaryHiddenStem,
        school: 'Tử Bình Chuyên Vượng (Dominant Element Pattern)',
        explanation: 'Khí thế một hành thuần khiết, Nhật Chủ đắc lệnh đắc địa cực vượng, nghi thuận khí thế tiết tú bằng Thực Thương hoặc Tỷ Kiếp.'
      };
    }
  }

  // Orthodox Ziping Multi-tier Evaluation:
  // Step 1: Check if Month Branch hidden stems penetrate to Year, Month, or Hour Heavenly Stems
  const exposedStems = [yearPillar.stem, monthPillar.stem, hourPillar.stem];
  
  // Priority A: Month Branch Primary Hidden Stem (Bản Khí) penetrates
  if (exposedStems.includes(primaryHiddenStem)) {
    const tenGodName = getTenGod(dayMaster, primaryHiddenStem).nameVi;
    let patternName = `${tenGodName} Cách`;
    if (tenGodName === 'Tỷ Kiên') patternName = 'Kiến Lộc Cách';
    else if (tenGodName === 'Kiếp Tài') patternName = STEMS[dayMaster].yinYang === 'Yang' ? 'Dương Nhận Cách' : 'Nguyệt Kiếp Cách';

    return {
      primaryPattern: patternName,
      patternSource: 'Bản Khí Thấu Can',
      penetratingStem: primaryHiddenStem,
      monthCommanderBranch: monthBranch,
      monthCommanderStem: primaryHiddenStem,
      school: 'Tử Bình Chân Thuyên (Orthodox Ziping - Primary Root Penetration)',
      explanation: `Bản khí ${STEMS[primaryHiddenStem].nameVi} của Nguyệt Lệnh ${BRANCHES[monthBranch].nameVi} thấu xuất lên Thiên Can làm chủ quản khí, xác lập chính cách ${patternName}.`
    };
  }

  // Priority B: Secondary Hidden Stems (Trung Khí / Dư Khí) penetrate
  for (let i = 1; i < hiddenStems.length; i++) {
    const secondaryStem = hiddenStems[i];
    if (exposedStems.includes(secondaryStem)) {
      const tenGodName = getTenGod(dayMaster, secondaryStem).nameVi;
      let patternName = `${tenGodName} Cách`;
      if (tenGodName === 'Tỷ Kiên') patternName = 'Kiến Lộc Quy Cách';
      else if (tenGodName === 'Kiếp Tài') patternName = 'Dương Nhận Quy Cách';

      return {
        primaryPattern: patternName,
        patternSource: i === 1 ? 'Trung Khí Thấu Can' : 'Dư Khí Thấu Can',
        penetratingStem: secondaryStem,
        monthCommanderBranch: monthBranch,
        monthCommanderStem: primaryHiddenStem,
        school: 'Tử Bình Chân Thuyên (Orthodox Ziping - Secondary Stem Penetration)',
        explanation: `Khí ${STEMS[secondaryStem].nameVi} tàng ẩn trong Nguyệt Lệnh thấu lên Thiên Can, dẫn xuất năng lượng thành ${patternName}.`
      };
    }
  }

  // Priority C: No hidden stem penetrates. Month Branch Primary Stem governs by position
  const primaryTenGod = getTenGod(dayMaster, primaryHiddenStem).nameVi;
  if (primaryTenGod === 'Tỷ Kiên') {
    return {
      primaryPattern: 'Kiến Lộc Cách',
      patternSource: 'Kiến Lộc Quy Cách',
      monthCommanderBranch: monthBranch,
      monthCommanderStem: primaryHiddenStem,
      school: 'Tử Bình Chân Thuyên (Orthodox Ziping - Month Friend Branch)',
      explanation: `Nguyệt Lệnh tọa Lộc Thần (${STEMS[primaryHiddenStem].nameVi}), không thấu can nhưng đắc lệnh chuyên vượng, quy về Kiến Lộc Cách. Cần Quan Sát hoặc Tài tinh khai hoa.`
    };
  }
  if (primaryTenGod === 'Kiếp Tài') {
    const isYang = STEMS[dayMaster].yinYang === 'Yang';
    const patternName = isYang ? 'Dương Nhận Cách' : 'Nguyệt Kiếp Cách';
    return {
      primaryPattern: patternName,
      patternSource: 'Dương Nhận Quy Cách',
      monthCommanderBranch: monthBranch,
      monthCommanderStem: primaryHiddenStem,
      school: 'Tử Bình Chân Thuyên (Orthodox Ziping - Blade/Rob Wealth Branch)',
      explanation: `Nguyệt Lệnh tọa ${isYang ? 'Dương Nhận' : 'Nguyệt Kiếp'}, khí lực dũng mãnh, cần Thất Sát chế ngự hoặc Thực Thương tiết tú.`
    };
  }

  return {
    primaryPattern: `${primaryTenGod} Cách`,
    patternSource: 'Nguyệt Lệnh Đắc Khí',
    monthCommanderBranch: monthBranch,
    monthCommanderStem: primaryHiddenStem,
    school: 'Tử Bình Chân Thuyên (Orthodox Ziping - Direct Month Commander)',
    explanation: `Các can tàng ẩn không thấu xuất, lấy Bản Khí Nguyệt Lệnh (${STEMS[primaryHiddenStem].nameVi} - ${primaryTenGod}) làm trụ cột xác lập quy cách.`
  };
}

/**
 * ============================================================================
 * INTER-PILLAR INTERACTIONS ENGINE (HỢP, XUNG, HÌNH, HẠI, PHÁ, TAM HỢP, TAM HỘI)
 * ============================================================================
 */
export function calculateBaZiInteractions(pillars: {
  yearPillar: PillarData;
  monthPillar: PillarData;
  dayPillar: PillarData;
  hourPillar: PillarData;
  dayMaster: HeavenlyStem;
}): BaZiInteraction[] {
  const interactions: BaZiInteraction[] = [];
  const { yearPillar, monthPillar, dayPillar, hourPillar } = pillars;

  const pillarList: { name: 'Năm' | 'Tháng' | 'Ngày' | 'Giờ'; stem: HeavenlyStem; branch: EarthlyBranch }[] = [
    { name: 'Năm', stem: yearPillar.stem, branch: yearPillar.branch },
    { name: 'Tháng', stem: monthPillar.stem, branch: monthPillar.branch },
    { name: 'Ngày', stem: dayPillar.stem, branch: dayPillar.branch },
    { name: 'Giờ', stem: hourPillar.stem, branch: hourPillar.branch }
  ];

  // 1. THIÊN CAN TƯƠNG HỢP (Ngũ Hợp)
  const CAN_HOP_MAP: Record<string, { partner: HeavenlyStem; transformedEl: FiveElement; desc: string }> = {
    Jia: { partner: 'Ji', transformedEl: 'Earth', desc: 'Giáp - Kỷ hợp Hóa Thổ (Trung Chính Chi Hợp, chủ về đức độ, tín nghĩa)' },
    Ji: { partner: 'Jia', transformedEl: 'Earth', desc: 'Giáp - Kỷ hợp Hóa Thổ (Trung Chính Chi Hợp, chủ về đức độ, tín nghĩa)' },
    Yi: { partner: 'Geng', transformedEl: 'Metal', desc: 'Ất - Canh hợp Hóa Kim (Nhân Nghĩa Chi Hợp, chủ về quyết đoán, kỷ cương)' },
    Geng: { partner: 'Yi', transformedEl: 'Metal', desc: 'Ất - Canh hợp Hóa Kim (Nhân Nghĩa Chi Hợp, chủ về quyết đoán, kỷ cương)' },
    Bing: { partner: 'Xin', transformedEl: 'Water', desc: 'Bính - Tân hợp Hóa Thủy (Uy Chế Chi Hợp, chủ về quyền uy, tài hoa biến hóa)' },
    Xin: { partner: 'Bing', transformedEl: 'Water', desc: 'Bính - Tân hợp Hóa Thủy (Uy Chế Chi Hợp, chủ về quyền uy, tài hoa biến hóa)' },
    Ding: { partner: 'Ren', transformedEl: 'Wood', desc: 'Đinh - Nhâm hợp Hóa Mộc (Nhân Thọ Chi Hợp, chủ về từ tâm, tình cảm sâu sắc)' },
    Ren: { partner: 'Ding', transformedEl: 'Wood', desc: 'Đinh - Nhâm hợp Hóa Mộc (Nhân Thọ Chi Hợp, chủ về từ tâm, tình cảm sâu sắc)' },
    Wu: { partner: 'Gui', transformedEl: 'Fire', desc: 'Mậu - Quý hợp Hóa Hỏa (Vô Tình Chi Hợp, chủ về sắc sảo, thông tuệ)' },
    Gui: { partner: 'Wu', transformedEl: 'Fire', desc: 'Mậu - Quý hợp Hóa Hỏa (Vô Tình Chi Hợp, chủ về sắc sảo, thông tuệ)' }
  };

  // 2. THIÊN CAN TƯƠNG XUNG
  const CAN_XUNG_MAP: Record<string, HeavenlyStem> = {
    Jia: 'Geng', Geng: 'Jia',
    Yi: 'Xin', Xin: 'Yi',
    Bing: 'Ren', Ren: 'Bing',
    Ding: 'Gui', Gui: 'Ding'
  };

  // Check pairwise Stems
  for (let i = 0; i < pillarList.length; i++) {
    for (let j = i + 1; j < pillarList.length; j++) {
      const p1 = pillarList[i];
      const p2 = pillarList[j];

      // Check Can Hợp
      const hopInfo = CAN_HOP_MAP[p1.stem];
      if (hopInfo && hopInfo.partner === p2.stem) {
        interactions.push({
          type: 'Can_Hop',
          nameVi: `Thiên Can Tương Hợp (${STEMS[p1.stem].nameVi} - ${STEMS[p2.stem].nameVi})`,
          involvedPillars: [p1.name, p2.name],
          branchesOrStems: [p1.stem, p2.stem],
          description: hopInfo.desc,
          nature: 'Cát'
        });
      }

      // Check Can Xung
      if (CAN_XUNG_MAP[p1.stem] === p2.stem) {
        interactions.push({
          type: 'Can_Xung',
          nameVi: `Thiên Can Tương Xung (${STEMS[p1.stem].nameVi} - ${STEMS[p2.stem].nameVi})`,
          involvedPillars: [p1.name, p2.name],
          branchesOrStems: [p1.stem, p2.stem],
          description: `Trụ ${p1.name} (${STEMS[p1.stem].nameVi}) tương xung với Trụ ${p2.name} (${STEMS[p2.stem].nameVi}), tạo ra biến động và đối kháng năng lượng trực diện.`,
          nature: 'Hung'
        });
      }
    }
  }

  // 3. ĐỊA CHI LỤC HỢP
  const LUC_HOP_MAP: Record<string, { partner: EarthlyBranch; element: FiveElement; desc: string }> = {
    Zi: { partner: 'Chou', element: 'Earth', desc: 'Tý - Sửu hợp Hóa Thổ' },
    Chou: { partner: 'Zi', element: 'Earth', desc: 'Tý - Sửu hợp Hóa Thổ' },
    Yin_B: { partner: 'Hai', element: 'Wood', desc: 'Dần - Hợi hợp Hóa Mộc' },
    Hai: { partner: 'Yin_B', element: 'Wood', desc: 'Dần - Hợi hợp Hóa Mộc' },
    Mao: { partner: 'Xu', element: 'Fire', desc: 'Mão - Tuất hợp Hóa Hỏa' },
    Xu: { partner: 'Mao', element: 'Fire', desc: 'Mão - Tuất hợp Hóa Hỏa' },
    Chen: { partner: 'You', element: 'Metal', desc: 'Thìn - Dậu hợp Hóa Kim' },
    You: { partner: 'Chen', element: 'Metal', desc: 'Thìn - Dậu hợp Hóa Kim' },
    Si: { partner: 'Shen', element: 'Water', desc: 'Tỵ - Thân hợp Hóa Thủy' },
    Shen: { partner: 'Si', element: 'Water', desc: 'Tỵ - Thân hợp Hóa Thủy' },
    Wu_B: { partner: 'Wei', element: 'Fire', desc: 'Ngọ - Mùi hợp Hóa Nhật Nguyệt (Thái Dương / Thái Âm)' },
    Wei: { partner: 'Wu_B', element: 'Fire', desc: 'Ngọ - Mùi hợp Hóa Nhật Nguyệt (Thái Dương / Thái Âm)' }
  };

  // 4. ĐỊA CHI LỤC XUNG
  const LUC_XUNG_MAP: Record<string, { partner: EarthlyBranch; desc: string }> = {
    Zi: { partner: 'Wu_B', desc: 'Tý - Ngọ tương xung (Thủy Hỏa tương kích, dao động bất định)' },
    Wu_B: { partner: 'Zi', desc: 'Tý - Ngọ tương xung (Thủy Hỏa tương kích, dao động bất định)' },
    Chou: { partner: 'Wei', desc: 'Sửu - Mùi tương xung (Thổ khí tương xung, khai mở xung khố)' },
    Wei: { partner: 'Chou', desc: 'Sửu - Mùi tương xung (Thổ khí tương xung, khai mở xung khố)' },
    Yin_B: { partner: 'Shen', desc: 'Dần - Thân tương xung (Kim Mộc giao chiến, dịch mã động chuyển)' },
    Shen: { partner: 'Yin_B', desc: 'Dần - Thân tương xung (Kim Mộc giao chiến, dịch mã động chuyển)' },
    Mao: { partner: 'You', desc: 'Mão - Dậu tương xung (Kim Mộc tương khắc, biến chuyển tình cảm và môi trường)' },
    You: { partner: 'Mao', desc: 'Mão - Dậu tương xung (Kim Mộc tương khắc, biến chuyển tình cảm và môi trường)' },
    Chen: { partner: 'Xu', desc: 'Thìn - Tuất tương xung (Khố địa tương xung, biến động sản nghiệp)' },
    Xu: { partner: 'Chen', desc: 'Thìn - Tuất tương xung (Khố địa tương xung, biến động sản nghiệp)' },
    Si: { partner: 'Hai', desc: 'Tỵ - Hợi tương xung (Thủy Hỏa tương xung, dịch chuyển ngoại cảnh)' },
    Hai: { partner: 'Si', desc: 'Tỵ - Hợi tương xung (Thủy Hỏa tương xung, dịch chuyển ngoại cảnh)' }
  };

  // 5. ĐỊA CHI LỤC HẠI
  const LUC_HAI_MAP: Record<string, { partner: EarthlyBranch; desc: string }> = {
    Zi: { partner: 'Wei', desc: 'Tý - Mùi tương hại' },
    Wei: { partner: 'Zi', desc: 'Tý - Mùi tương hại' },
    Chou: { partner: 'Wu_B', desc: 'Sửu - Ngọ tương hại' },
    Wu_B: { partner: 'Chou', desc: 'Sửu - Ngọ tương hại' },
    Yin_B: { partner: 'Si', desc: 'Dần - Tỵ tương hại' },
    Si: { partner: 'Yin_B', desc: 'Dần - Tỵ tương hại' },
    Mao: { partner: 'Chen', desc: 'Mão - Thìn tương hại' },
    Chen: { partner: 'Mao', desc: 'Mão - Thìn tương hại' },
    Shen: { partner: 'Hai', desc: 'Thân - Hợi tương hại' },
    Hai: { partner: 'Shen', desc: 'Thân - Hợi tương hại' },
    You: { partner: 'Xu', desc: 'Dậu - Tuất tương hại' },
    Xu: { partner: 'You', desc: 'Dậu - Tuất tương hại' }
  };

  // 6. ĐỊA CHI TƯƠNG PHÁ
  const TUONG_PHA_MAP: Record<string, { partner: EarthlyBranch; desc: string }> = {
    Zi: { partner: 'You', desc: 'Tý - Dậu tương phá' },
    You: { partner: 'Zi', desc: 'Tý - Dậu tương phá' },
    Mao: { partner: 'Wu_B', desc: 'Mão - Ngọ tương phá' },
    Wu_B: { partner: 'Mao', desc: 'Mão - Ngọ tương phá' },
    Chen: { partner: 'Chou', desc: 'Thìn - Sửu tương phá' },
    Chou: { partner: 'Chen', desc: 'Thìn - Sửu tương phá' },
    Si: { partner: 'Shen', desc: 'Tỵ - Thân tương phá' },
    Shen: { partner: 'Si', desc: 'Tỵ - Thân tương phá' },
    Yin_B: { partner: 'Hai', desc: 'Dần - Hợi tương phá' },
    Hai: { partner: 'Yin_B', desc: 'Dần - Hợi tương phá' },
    Xu: { partner: 'Wei', desc: 'Tuất - Mùi tương phá' },
    Wei: { partner: 'Xu', desc: 'Tuất - Mùi tương phá' }
  };

  // Check pairwise Branches
  for (let i = 0; i < pillarList.length; i++) {
    for (let j = i + 1; j < pillarList.length; j++) {
      const p1 = pillarList[i];
      const p2 = pillarList[j];

      // Lục Hợp
      const lucHop = LUC_HOP_MAP[p1.branch];
      if (lucHop && lucHop.partner === p2.branch) {
        interactions.push({
          type: 'Chi_Luc_Hop',
          nameVi: `Địa Chi Lục Hợp (${BRANCHES[p1.branch].nameVi} - ${BRANCHES[p2.branch].nameVi})`,
          involvedPillars: [p1.name, p2.name],
          branchesOrStems: [p1.branch, p2.branch],
          description: `${lucHop.desc} giữa Trụ ${p1.name} và Trụ ${p2.name}, tạo sự hòa hợp kết nối vững chắc.`,
          nature: 'Cát'
        });
      }

      // Lục Xung
      const lucXung = LUC_XUNG_MAP[p1.branch];
      if (lucXung && lucXung.partner === p2.branch) {
        interactions.push({
          type: 'Chi_Luc_Xung',
          nameVi: `Địa Chi Lục Xung (${BRANCHES[p1.branch].nameVi} - ${BRANCHES[p2.branch].nameVi})`,
          involvedPillars: [p1.name, p2.name],
          branchesOrStems: [p1.branch, p2.branch],
          description: `${lucXung.desc} giữa Trụ ${p1.name} và Trụ ${p2.name}, chủ về biến động môi trường hoặc xung đột quan điểm.`,
          nature: 'Hung'
        });
      }

      // Lục Hại
      const lucHai = LUC_HAI_MAP[p1.branch];
      if (lucHai && lucHai.partner === p2.branch) {
        interactions.push({
          type: 'Chi_Tuong_Hai',
          nameVi: `Địa Chi Tương Hại (${BRANCHES[p1.branch].nameVi} - ${BRANCHES[p2.branch].nameVi})`,
          involvedPillars: [p1.name, p2.name],
          branchesOrStems: [p1.branch, p2.branch],
          description: `${lucHai.desc} giữa Trụ ${p1.name} và Trụ ${p2.name}, cảnh báo bất đồng ngầm hoặc trở lực bất ngờ.`,
          nature: 'Hung'
        });
      }

      // Tương Phá
      const tuongPha = TUONG_PHA_MAP[p1.branch];
      if (tuongPha && tuongPha.partner === p2.branch) {
        interactions.push({
          type: 'Chi_Tuong_Pha',
          nameVi: `Địa Chi Tương Phá (${BRANCHES[p1.branch].nameVi} - ${BRANCHES[p2.branch].nameVi})`,
          involvedPillars: [p1.name, p2.name],
          branchesOrStems: [p1.branch, p2.branch],
          description: `${tuongPha.desc} giữa Trụ ${p1.name} và Trụ ${p2.name}.`,
          nature: 'Hung'
        });
      }

      // Tự Hình (Thìn-Thìn, Ngọ-Ngọ, Dậu-Dậu, Hợi-Hợi)
      if (p1.branch === p2.branch && ['Chen', 'Wu_B', 'You', 'Hai'].includes(p1.branch)) {
        interactions.push({
          type: 'Chi_Tuong_Hinh',
          nameVi: `Địa Chi Tự Hình (${BRANCHES[p1.branch].nameVi} - ${BRANCHES[p2.branch].nameVi})`,
          involvedPillars: [p1.name, p2.name],
          branchesOrStems: [p1.branch, p2.branch],
          description: `Trụ ${p1.name} và Trụ ${p2.name} đồng tọa ${BRANCHES[p1.branch].nameVi} phạm Tự Hình, chủ về nội tâm tự dằn vặt hoặc tự tạo áp lực quá tải.`,
          nature: 'Hung'
        });
      }

      // Tý - Mão Vô Lễ Hình
      if ((p1.branch === 'Zi' && p2.branch === 'Mao') || (p1.branch === 'Mao' && p2.branch === 'Zi')) {
        interactions.push({
          type: 'Chi_Tuong_Hinh',
          nameVi: 'Địa Chi Tương Hình (Tý - Mão Vô Lễ Hình)',
          involvedPillars: [p1.name, p2.name],
          branchesOrStems: [p1.branch, p2.branch],
          description: 'Tý - Mão tương hình (Vô Lễ Chi Hình), cần thận trọng trong giao tiếp ứng xử, tuân thủ phép tắc lễ nghĩa.',
          nature: 'Hung'
        });
      }
    }
  }

  // 7. TAM HỢP CỤC & TAM HỘI CỤC (Multi-branch check)
  const allBranches = pillarList.map(p => p.branch);
  const TAM_HOP_CONFIGS = [
    { branches: ['Shen', 'Zi', 'Chen'] as EarthlyBranch[], element: 'Water', name: 'Thân - Tý - Thìn Tam Hợp Thủy Cục' },
    { branches: ['Hai', 'Mao', 'Wei'] as EarthlyBranch[], element: 'Wood', name: 'Hợi - Mão - Mùi Tam Hợp Mộc Cục' },
    { branches: ['Yin_B', 'Wu_B', 'Xu'] as EarthlyBranch[], element: 'Fire', name: 'Dần - Ngọ - Tuất Tam Hợp Hỏa Cục' },
    { branches: ['Si', 'You', 'Chou'] as EarthlyBranch[], element: 'Metal', name: 'Tỵ - Dậu - Sửu Tam Hợp Kim Cục' }
  ];

  TAM_HOP_CONFIGS.forEach(th => {
    const matchedPillars = pillarList.filter(p => th.branches.includes(p.branch));
    const uniqueMatchedBranches = new Set(matchedPillars.map(p => p.branch));
    if (uniqueMatchedBranches.size === 3) {
      interactions.push({
        type: 'Chi_Tam_Hop',
        nameVi: th.name,
        involvedPillars: matchedPillars.map(p => p.name),
        branchesOrStems: Array.from(uniqueMatchedBranches),
        description: `Tứ trụ hội đủ tam hợp cục ${th.name}, hóa khí ${th.element} cực vượng, định hình xu thế năng lượng chủ đạo.`,
        nature: 'Biến hóa'
      });
    } else if (uniqueMatchedBranches.size === 2) {
      // Check if cardinal branch (Tý, Mão, Ngọ, Dậu) is present for Ban Hop
      const cardinal = th.branches[1];
      if (uniqueMatchedBranches.has(cardinal)) {
        interactions.push({
          type: 'Chi_Tam_Hop',
          nameVi: `Bán Tam Hợp (${th.name.split(' ')[0]} hướng ${th.element})`,
          involvedPillars: matchedPillars.map(p => p.name),
          branchesOrStems: Array.from(uniqueMatchedBranches),
          description: `Đắc bán tam hợp tụ khí về hành ${th.element}, gia tăng sinh lực hòa hợp.`,
          nature: 'Cát'
        });
      }
    }
  });

  const TAM_HOI_CONFIGS = [
    { branches: ['Yin_B', 'Mao', 'Chen'] as EarthlyBranch[], element: 'Wood', name: 'Dần - Mão - Thìn Tam Hội Đông Phương Mộc' },
    { branches: ['Si', 'Wu_B', 'Wei'] as EarthlyBranch[], element: 'Fire', name: 'Tỵ - Ngọ - Mùi Tam Hội Nam Phương Hỏa' },
    { branches: ['Shen', 'You', 'Xu'] as EarthlyBranch[], element: 'Metal', name: 'Thân - Dậu - Tuất Tam Hội Tây Phương Kim' },
    { branches: ['Hai', 'Zi', 'Chou'] as EarthlyBranch[], element: 'Water', name: 'Hợi - Tý - Sửu Tam Hội Bắc Phương Thủy' }
  ];

  TAM_HOI_CONFIGS.forEach(hoi => {
    const matchedPillars = pillarList.filter(p => hoi.branches.includes(p.branch));
    const uniqueMatchedBranches = new Set(matchedPillars.map(p => p.branch));
    if (uniqueMatchedBranches.size === 3) {
      interactions.push({
        type: 'Chi_Tam_Hoi',
        nameVi: hoi.name,
        involvedPillars: matchedPillars.map(p => p.name),
        branchesOrStems: Array.from(uniqueMatchedBranches),
        description: `Hội tụ trọn vẹn tam hội toàn phương ${hoi.name}, khí thế phương vị cực kỳ hùng hậu.`,
        nature: 'Biến hóa'
      });
    }
  });

  return interactions;
}

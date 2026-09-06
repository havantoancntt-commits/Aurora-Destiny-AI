// ==========================================
// FOUR PILLARS / BAZI CALCULATION ENGINE
// ==========================================

import {
  HeavenlyStem,
  EarthlyBranch,
  FiveElement,
  BaZiChart,
  PillarData,
  BirthData
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

  let calculatedStrength = 60;
  if (isMainRoot) calculatedStrength += 28; // Tọa Bản Khí (Chính căn vững chắc)
  else if (hasHiddenRoot) calculatedStrength += 18; // Dư khí hoặc Trung khí
  else if (isGeneratingRoot) calculatedStrength += 12; // Được Địa chi sinh dưỡng
  else if (isClashingRoot) calculatedStrength -= 16; // Bị Địa chi khắc chế
  const strength = Math.min(99, Math.max(35, calculatedStrength));

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
  
  // Stems weight: 1.0 each
  [yearPillar.stemElement, monthPillar.stemElement, dayPillar.stemElement, hourPillar.stemElement].forEach((el) => {
    rawElements[el] += 1.0;
  });

  // Branch primary element weight: 1.5 each (Month branch is Commander of the Season, weight 2.5)
  rawElements[yearPillar.branchElement] += 1.5;
  rawElements[monthPillar.branchElement] += 2.5;
  rawElements[dayPillar.branchElement] += 1.5;
  rawElements[hourPillar.branchElement] += 1.5;

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
  if (ratio > 1.6) dayMasterStrength = 'Very Strong';
  else if (ratio > 1.15) dayMasterStrength = 'Strong';
  else if (ratio < 0.6) dayMasterStrength = 'Very Weak';
  else if (ratio < 0.85) dayMasterStrength = 'Weak';

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

  // Structure Type (Cách Cục) based on Month Branch's primary hidden stem
  const monthHiddenGod = monthPillar.hiddenStems[0]?.tenGod || 'Chính Quan';
  const structureType = `${monthHiddenGod} Cách`;

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
    tenGodDistribution
  };
}

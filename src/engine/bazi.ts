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
import { gregorianToJulianDay, convertSolarToLunar } from './lunarSolar';

// Calculate Year Stem & Branch
export function calculateYearPillar(year: number, month: number, day: number): { stem: HeavenlyStem; branch: EarthlyBranch } {
  // Lập Xuân is the boundary for BaZi year (Feb 4)
  let baziYear = year;
  if (month < 2 || (month === 2 && day < 4)) {
    baziYear = year - 1;
  }
  // Formula: Year Stem = (baziYear - 4) % 10
  const stemIdx = (baziYear - 4) % 10;
  const stem = STEM_KEYS[(stemIdx + 10) % 10];

  // Formula: Year Branch = (baziYear - 4) % 12
  const branchIdx = (baziYear - 4) % 12;
  const branch = BRANCH_KEYS[(branchIdx + 12) % 12];

  return { stem, branch };
}

// Calculate Month Stem & Branch based on Solar Month & Year Stem (Ngũ Hổ Độn)
export function calculateMonthPillar(
  yearStem: HeavenlyStem,
  month: number,
  day: number
): { stem: HeavenlyStem; branch: EarthlyBranch } {
  // Month Branch: Feb is Dần (Yin_B, index 2), Mar is Mão (Mao, index 3)... Jan is Sửu (Chou, index 1)
  // Solar terms determine solar month (approx 4th-7th of each month)
  let solarMonthIndex = month; // 1 to 12
  if (day < 5) {
    solarMonthIndex = month === 1 ? 12 : month - 1;
  }

  // Branch index map: Feb -> Yin_B (2), Mar -> Mao (3)... Dec -> Zi (0), Jan -> Chou (1)
  const branchMapping: Record<number, EarthlyBranch> = {
    1: 'Chou',
    2: 'Yin_B',
    3: 'Mao',
    4: 'Chen',
    5: 'Si',
    6: 'Wu_B',
    7: 'Wei',
    8: 'Shen',
    9: 'You',
    10: 'Xu',
    11: 'Hai',
    12: 'Zi',
  };

  const branch = branchMapping[solarMonthIndex] || 'Yin_B';

  // Five Tigers seeking Month Stem (Ngũ Hổ Độn Quy Luật)
  // Giáp/Kỷ khởi Bính Dần; Ất/Canh khởi Mậu Dần; Bính/Tân khởi Canh Dần; Đinh/Nhâm khởi Nhâm Dần; Mậu/Quý khởi Giáp Dần
  let startStemIdx = 2; // Bính
  if (yearStem === 'Jia' || yearStem === 'Ji') startStemIdx = 2; // Bính
  else if (yearStem === 'Yi' || yearStem === 'Geng') startStemIdx = 4; // Mậu
  else if (yearStem === 'Bing' || yearStem === 'Xin') startStemIdx = 6; // Canh
  else if (yearStem === 'Ding' || yearStem === 'Ren') startStemIdx = 8; // Nhâm
  else if (yearStem === 'Wu' || yearStem === 'Gui') startStemIdx = 0; // Giáp

  // Offset from Dần (Feb = 2)
  const offset = (BRANCH_KEYS.indexOf(branch) - BRANCH_KEYS.indexOf('Yin_B') + 12) % 12;
  const stem = STEM_KEYS[(startStemIdx + offset) % 10];

  return { stem, branch };
}

// Calculate Day Pillar using Julian Day Number
export function calculateDayPillar(year: number, month: number, day: number): { stem: HeavenlyStem; branch: EarthlyBranch } {
  const jd = gregorianToJulianDay(year, month, day);
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
export function calculateHourPillar(dayStem: HeavenlyStem, hour: number): { stem: HeavenlyStem; branch: EarthlyBranch } {
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

  return {
    stem,
    branch,
    stemElement: stemInfo.element,
    branchElement: branchInfo.element,
    hiddenStems,
    naYin,
    tenGod,
    strength: 75
  };
}

// Complete BaZi Chart Computation
export function calculateBaZiChart(birthData: BirthData): BaZiChart {
  const { solarYear, solarMonth, solarDay, solarHour } = birthData;

  const yearPB = calculateYearPillar(solarYear, solarMonth, solarDay);
  const monthPB = calculateMonthPillar(yearPB.stem, solarMonth, solarDay);
  const dayPB = calculateDayPillar(solarYear, solarMonth, solarDay);
  const hourPB = calculateHourPillar(dayPB.stem, solarHour);

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
  const elementBalance: Record<FiveElement, number> = {
    Wood: Math.round((rawElements.Wood / totalPoints) * 100),
    Fire: Math.round((rawElements.Fire / totalPoints) * 100),
    Earth: Math.round((rawElements.Earth / totalPoints) * 100),
    Metal: Math.round((rawElements.Metal / totalPoints) * 100),
    Water: Math.round((rawElements.Water / totalPoints) * 100),
  };

  // Adjust rounding differences
  const sumPct = Object.values(elementBalance).reduce((a, b) => a + b, 0);
  if (sumPct !== 100) {
    elementBalance.Earth += (100 - sumPct);
  }

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

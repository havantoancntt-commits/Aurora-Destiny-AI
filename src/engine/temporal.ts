// ==========================================
// TEMPORAL TRANSIT & LIFETIME CYCLES ENGINE
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
import { calculateYearPillar, calculateMonthPillar, calculateDayPillar } from './bazi';

// Calculate 8 Decade Cycles (Đại Vận)
export function calculateDecadeCycles(birthData: BirthData): DecadeCycle[] {
  const { solarYear, solarMonth, solarDay, gender } = birthData;
  const yearPB = calculateYearPillar(solarYear, solarMonth, solarDay);
  const monthPB = calculateMonthPillar(yearPB.stem, solarMonth, solarDay);
  const dayPB = calculateDayPillar(solarYear, solarMonth, solarDay);

  // Direction: Yang Male or Yin Female moves clockwise (forward); Yin Male or Yang Female moves counter-clockwise
  const isYangYear = STEMS[yearPB.stem].yinYang === 'Yang';
  const isMale = gender === 'Male';
  const isForward = (isYangYear && isMale) || (!isYangYear && !isMale);

  // Start age typically 3 to 7
  const startBaseAge = 4;
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

    const startAge = startBaseAge + (i - 1) * 10;
    const endAge = startAge + 9;
    const startYear = solarYear + startAge;
    const endYear = startYear + 9;

    const focalPalace = palacesOrder[(i - 1) % palacesOrder.length];

    // Compute cycle harmony based on element relation to Day Master
    const dayMasterElement = STEMS[dayPB.stem].element;
    let harmonyScore = 72;
    if (element === dayMasterElement) harmonyScore = 80;
    else if (ELEMENT_RELATIONS[dayMasterElement].generates === element) harmonyScore = 86; // Creative output
    else if (ELEMENT_RELATIONS[dayMasterElement].generatedBy === element) harmonyScore = 90; // Nourishing resource
    else if (ELEMENT_RELATIONS[element].overcomes === dayMasterElement) harmonyScore = 65; // Pressure & Discipline

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

// Calculate Annual Transits (Lưu Niên) from current baseline
export function calculateAnnualTransits(birthData: BirthData, startYear: number = 2020, endYear: number = 2036): AnnualTransit[] {
  const dayPB = calculateDayPillar(birthData.solarYear, birthData.solarMonth, birthData.solarDay);
  const dayMasterElement = STEMS[dayPB.stem].element;

  const transits: AnnualTransit[] = [];

  for (let yr = startYear; yr <= endYear; yr++) {
    const stemIdx = (yr - 4) % 10;
    const branchIdx = (yr - 4) % 12;
    const stem = STEM_KEYS[(stemIdx + 10) % 10];
    const branch = BRANCH_KEYS[(branchIdx + 12) % 12];
    const element = STEMS[stem].element;
    const tenGod = getTenGod(dayPB.stem, stem).nameVi;

    // Harmonic scores based on astrological synergy
    let baseScore = 70;
    if (element === dayMasterElement) baseScore = 78;
    else if (ELEMENT_RELATIONS[dayMasterElement].generates === element) baseScore = 84;
    else if (ELEMENT_RELATIONS[dayMasterElement].generatedBy === element) baseScore = 88;
    else if (ELEMENT_RELATIONS[element].overcomes === dayMasterElement) baseScore = 64;

    // Modulate domain scores
    const careerScore = Math.min(96, Math.max(50, Math.round(baseScore + ((yr % 3) - 1) * 6)));
    const wealthScore = Math.min(95, Math.max(48, Math.round(baseScore + ((yr % 4) - 1.5) * 5)));
    const relationshipScore = Math.min(94, Math.max(52, Math.round(baseScore - ((yr % 3) - 1) * 4)));
    const healthScore = Math.min(92, Math.max(55, Math.round(75 - Math.abs(baseScore - 75) * 0.4)));
    const growthScore = Math.min(98, Math.max(58, Math.round(baseScore + 6)));

    const opportunityWave = Math.min(95, Math.max(25, Math.round((careerScore + wealthScore) / 2)));
    const cautionWave = Math.min(85, Math.max(15, Math.round(100 - (baseScore * 0.8) + (healthScore < 65 ? 15 : 0))));

    transits.push({
      year: yr,
      stem,
      branch,
      element,
      tenGod,
      overallScore: baseScore,
      careerScore,
      wealthScore,
      relationshipScore,
      healthScore,
      growthScore,
      opportunityWave,
      cautionWave,
      highlightSummary: `Năm ${yr} (${STEMS[stem].nameVi} ${BRANCHES[branch].nameVi} - ${tenGod}): Thiên can mang hành ${ELEMENT_RELATIONS[element]?.vi || element}, chu kỳ chuyển dịch chiến lược.`,
      recommendedFocus: baseScore >= 80 ? 'Giai đoạn đẩy mạnh quy mô, khai phá dự án mới và liên kết đồng minh' : 'Giai đoạn củng cố nội lực, kiện toàn hệ thống và phòng ngừa rủi ro'
    });
  }

  return transits;
}

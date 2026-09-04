// ==========================================
// COMPATIBILITY & SYNASTRY CALCULATION ENGINE
// Deterministic Can-Chi, Na-Yin, Bat-Trach & BaZi Synergy
// ==========================================

import {
  HeavenlyStem,
  EarthlyBranch,
  FiveElement,
  Gender,
  CalculationResult
} from '../types/destiny';
import { UserProfile } from '../types/user';
import { STEMS, BRANCHES, getNaYin, ELEMENT_RELATIONS } from './canchi';
import { calculateYearPillar, calculateDayPillar } from './bazi';
import { convertSolarToLunar } from './lunarSolar';

export interface CompatibilityPartnerInput {
  name: string;
  gender: Gender;
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  solarHour: number;
  relationType: 'Spouse' | 'Business' | 'Friend' | 'Family';
}

export interface CompatibilityFactor {
  title: string;
  category: 'Can Chi' | 'Ngũ Hành' | 'Cung Phi' | 'Dụng Thần' | 'Chiến Lược';
  score: number; // 0 - 100
  grade: 'Cát' | 'Đại Cát' | 'Bình Hòa' | 'Hung' | 'Đại Hung';
  personAVal: string;
  personBVal: string;
  description: string;
  remedy?: string;
}

export interface CompatibilityAnalysis {
  overallScore: number; // 0 - 100
  ratingBand: 'Đại Cát Tương Hợp' | 'Cát Lợi Hòa Hợp' | 'Bình Hòa Cần Bổ Trợ' | 'Nhiều Khác Biệt Cần Hóa Giải';
  dimensions: {
    emotional: number; // Tình cảm, thấu hiểu
    business: number;  // Tài chính, hợp tác làm ăn
    communication: number; // Giao tiếp, giải quyết xung đột
    longevity: number; // Bền vững, gắn kết lâu dài
  };
  factors: CompatibilityFactor[];
  bridgingElement?: {
    element: FiveElement;
    nameVi: string;
    color: string;
    explanation: string;
    recommendations: string[];
  };
  synthesisAdvice: string;
  partnershipTips: string[];
}

// 1. Calculate Kua (Cung Phi Bát Trạch) based on Lunar Year & Gender
export function calculateKua(lunarYear: number, gender: Gender): {
  number: number;
  palace: string;
  element: FiveElement;
  group: 'Đông Tứ Mệnh' | 'Tây Tứ Mệnh';
} {
  // Sum digits of lunar year until single digit
  let sum = lunarYear
    .toString()
    .split('')
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  while (sum > 9) {
    sum = sum
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }

  let kuaNum = 0;
  if (lunarYear < 2000) {
    kuaNum = gender === 'Male' ? (10 - sum) : (sum + 5);
  } else {
    kuaNum = gender === 'Male' ? (9 - sum) : (sum + 6);
  }

  // Reduce to 1-9
  while (kuaNum <= 0) kuaNum += 9;
  while (kuaNum > 9) kuaNum -= 9;

  // Male 5 -> Kua 2 (Khôn), Female 5 -> Kua 8 (Cấn)
  if (kuaNum === 5) {
    kuaNum = gender === 'Male' ? 2 : 8;
  }

  const kuaMap: Record<number, { palace: string; element: FiveElement; group: 'Đông Tứ Mệnh' | 'Tây Tứ Mệnh' }> = {
    1: { palace: 'Khảm', element: 'Water', group: 'Đông Tứ Mệnh' },
    2: { palace: 'Khôn', element: 'Earth', group: 'Tây Tứ Mệnh' },
    3: { palace: 'Chấn', element: 'Wood', group: 'Đông Tứ Mệnh' },
    4: { palace: 'Tốn', element: 'Wood', group: 'Đông Tứ Mệnh' },
    6: { palace: 'Càn', element: 'Metal', group: 'Tây Tứ Mệnh' },
    7: { palace: 'Đoài', element: 'Metal', group: 'Tây Tứ Mệnh' },
    8: { palace: 'Cấn', element: 'Earth', group: 'Tây Tứ Mệnh' },
    9: { palace: 'Ly', element: 'Fire', group: 'Đông Tứ Mệnh' },
  };

  const res = kuaMap[kuaNum] || { palace: 'Khảm', element: 'Water', group: 'Đông Tứ Mệnh' };
  return { number: kuaNum, ...res };
}

// Pairwise Bat Trach Harmony Lookup
const BAT_TRACH_PAIRS: Record<string, { name: string; score: number; isGood: boolean; meaning: string }> = {
  // Sinh Khí (Tốt nhất: +30)
  'Khảm-Tốn': { name: 'Sinh Khí', score: 98, isGood: true, meaning: 'Đại Cát — Phúc lộc vẹn toàn, gia đạo hưng thịnh, tài chính hanh thông.' },
  'Tốn-Khảm': { name: 'Sinh Khí', score: 98, isGood: true, meaning: 'Đại Cát — Phúc lộc vẹn toàn, gia đạo hưng thịnh, tài chính hanh thông.' },
  'Chấn-Ly': { name: 'Sinh Khí', score: 96, isGood: true, meaning: 'Đại Cát — Thăng tiến công danh, tài trí rộng mở.' },
  'Ly-Chấn': { name: 'Sinh Khí', score: 96, isGood: true, meaning: 'Đại Cát — Thăng tiến công danh, tài trí rộng mở.' },
  'Càn-Đoài': { name: 'Sinh Khí', score: 95, isGood: true, meaning: 'Đại Cát — Vợ chồng hòa thuận, làm ăn phát đạt, con cháu hiếu thảo.' },
  'Đoài-Càn': { name: 'Sinh Khí', score: 95, isGood: true, meaning: 'Đại Cát — Vợ chồng hòa thuận, làm ăn phát đạt, con cháu hiếu thảo.' },
  'Cấn-Khôn': { name: 'Sinh Khí', score: 95, isGood: true, meaning: 'Đại Cát — Điền sản dồi dào, hậu vận viên mãn an khang.' },
  'Khôn-Cấn': { name: 'Sinh Khí', score: 95, isGood: true, meaning: 'Đại Cát — Điền sản dồi dào, hậu vận viên mãn an khang.' },

  // Diên Niên / Phúc Đức (+25)
  'Khảm-Ly': { name: 'Diên Niên', score: 92, isGood: true, meaning: 'Cát Lợi — Tình cảm bền chặt, thủy chung, mọi sự ổn định dài lâu.' },
  'Ly-Khảm': { name: 'Diên Niên', score: 92, isGood: true, meaning: 'Cát Lợi — Tình cảm bền chặt, thủy chung, mọi sự ổn định dài lâu.' },
  'Chấn-Tốn': { name: 'Diên Niên', score: 90, isGood: true, meaning: 'Cát Lợi — Gia đình hòa khí, sự nghiệp vững chắc.' },
  'Tốn-Chấn': { name: 'Diên Niên', score: 90, isGood: true, meaning: 'Cát Lợi — Gia đình hòa khí, sự nghiệp vững chắc.' },
  'Càn-Khôn': { name: 'Diên Niên', score: 92, isGood: true, meaning: 'Cát Lợi — Trời đất giao hòa, âm dương tương phối tuyệt mỹ.' },
  'Khôn-Càn': { name: 'Diên Niên', score: 92, isGood: true, meaning: 'Cát Lợi — Trời đất giao hòa, âm dương tương phối tuyệt mỹ.' },
  'Cấn-Đoài': { name: 'Diên Niên', score: 88, isGood: true, meaning: 'Cát Lợi — Đồng lòng tát biển Đông, tài lộc tích tụ.' },
  'Đoài-Cấn': { name: 'Diên Niên', score: 88, isGood: true, meaning: 'Cát Lợi — Đồng lòng tát biển Đông, tài lộc tích tụ.' },

  // Thiên Y (+22)
  'Khảm-Chấn': { name: 'Thiên Y', score: 88, isGood: true, meaning: 'Cát Lợi — Sức khỏe dồi dào, quý nhân phù trợ, tiêu trừ bệnh tật.' },
  'Chấn-Khảm': { name: 'Thiên Y', score: 88, isGood: true, meaning: 'Cát Lợi — Sức khỏe dồi dào, quý nhân phù trợ, tiêu trừ bệnh tật.' },
  'Ly-Tốn': { name: 'Thiên Y', score: 86, isGood: true, meaning: 'Cát Lợi — Cuộc sống thanh nhàn, nhiều cơ duyên may mắn.' },
  'Tốn-Ly': { name: 'Thiên Y', score: 86, isGood: true, meaning: 'Cát Lợi — Cuộc sống thanh nhàn, nhiều cơ duyên may mắn.' },
  'Càn-Cấn': { name: 'Thiên Y', score: 86, isGood: true, meaning: 'Cát Lợi — Tâm tính an hòa, con đường kinh doanh vững vàng.' },
  'Cấn-Càn': { name: 'Thiên Y', score: 86, isGood: true, meaning: 'Cát Lợi — Tâm tính an hòa, con đường kinh doanh vững vàng.' },
  'Khôn-Đoài': { name: 'Thiên Y', score: 85, isGood: true, meaning: 'Cát Lợi — Bình an, ít gặp tai ương, có tài lộc tự nhiên.' },
  'Đoài-Khôn': { name: 'Thiên Y', score: 85, isGood: true, meaning: 'Cát Lợi — Bình an, ít gặp tai ương, có tài lộc tự nhiên.' },

  // Phục Vị (+18)
  'Khảm-Khảm': { name: 'Phục Vị', score: 80, isGood: true, meaning: 'Thứ Cát — Bình ổn, củng cố sức mạnh nội tại, giữ được hòa khí.' },
  'Ly-Ly': { name: 'Phục Vị', score: 80, isGood: true, meaning: 'Thứ Cát — Bình ổn, tâm ý tương thông, cùng san sẻ gánh nặng.' },
  'Chấn-Chấn': { name: 'Phục Vị', score: 78, isGood: true, meaning: 'Thứ Cát — Mạnh mẽ đồng hành, cần chú ý nhường nhịn khi nóng nảy.' },
  'Tốn-Tốn': { name: 'Phục Vị', score: 80, isGood: true, meaning: 'Thứ Cát — Nhẹ nhàng gắn bó, phù hợp công việc học thuật và nghệ thuật.' },
  'Càn-Càn': { name: 'Phục Vị', score: 78, isGood: true, meaning: 'Thứ Cát — Cùng cương trực, cần người lùi một bước để giữ hòa khí.' },
  'Khôn-Khôn': { name: 'Phục Vị', score: 80, isGood: true, meaning: 'Thứ Cát — Nhẫn nại bao dung, tích lũy điền sản lâu dài.' },
  'Cấn-Cấn': { name: 'Phục Vị', score: 78, isGood: true, meaning: 'Thứ Cát — Vững chãi như núi, ít khi thay đổi quyết định.' },
  'Đoài-Đoài': { name: 'Phục Vị', score: 80, isGood: true, meaning: 'Thứ Cát — Vui vẻ, dễ chia sẻ cảm xúc đời thường.' },
};

// Calculate Synastry between Person A (user) and Person B
export function analyzeCompatibility(
  personA: {
    name: string;
    gender: Gender;
    profile?: UserProfile;
    calculation?: CalculationResult;
    birthData: {
      solarYear: number;
      solarMonth: number;
      solarDay: number;
      solarHour: number;
    };
  },
  personB: CompatibilityPartnerInput
): CompatibilityAnalysis {
  const factors: CompatibilityFactor[] = [];

  // 1. Year Pillars & Can Chi
  const yearA = calculateYearPillar(personA.birthData.solarYear, personA.birthData.solarMonth, personA.birthData.solarDay);
  const yearB = calculateYearPillar(personB.solarYear, personB.solarMonth, personB.solarDay);

  // Day Master Pillars
  const dayA = calculateDayPillar(personA.birthData.solarYear, personA.birthData.solarMonth, personA.birthData.solarDay);
  const dayB = calculateDayPillar(personB.solarYear, personB.solarMonth, personB.solarDay);

  // Na Yin Elements
  const naYinA = getNaYin(yearA.stem, yearA.branch);
  const naYinB = getNaYin(yearB.stem, yearB.branch);

  const getNaYinElement = (str: string): FiveElement => {
    if (str.endsWith('Kim')) return 'Metal';
    if (str.endsWith('Mộc')) return 'Wood';
    if (str.endsWith('Thủy')) return 'Water';
    if (str.endsWith('Hỏa')) return 'Fire';
    return 'Earth';
  };

  const naYinElementA = getNaYinElement(naYinA);
  const naYinElementB = getNaYinElement(naYinB);

  const stemElementA = STEMS[yearA.stem].element;
  const stemElementB = STEMS[yearB.stem].element;

  // 2. Factor: Thiên Can Năm Sinh (Year Stems)
  const STEM_COMBINES: Record<string, string> = {
    'Jia-Ji': 'Thổ', 'Ji-Jia': 'Thổ',
    'Yi-Geng': 'Kim', 'Geng-Yi': 'Kim',
    'Bing-Xin': 'Thủy', 'Xin-Bing': 'Thủy',
    'Ding-Ren': 'Mộc', 'Ren-Ding': 'Mộc',
    'Wu-Gui': 'Hỏa', 'Gui-Wu': 'Hỏa'
  };

  const stemKey = `${yearA.stem}-${yearB.stem}`;
  const isStemCombined = Boolean(STEM_COMBINES[stemKey]);
  const stemRel = ELEMENT_RELATIONS[stemElementA];
  const isStemGenerates = stemRel.generates === stemElementB || stemRel.generatedBy === stemElementB;
  const isStemOvercomes = stemRel.overcomes === stemElementB || stemRel.overcomeBy === stemElementB;

  let stemScore = 70;
  let stemGrade: CompatibilityFactor['grade'] = 'Bình Hòa';
  let stemDesc = `Thiên Can ${STEMS[yearA.stem].nameVi} và ${STEMS[yearB.stem].nameVi} bình hòa, không tương xung.`;

  if (isStemCombined) {
    stemScore = 95;
    stemGrade = 'Đại Cát';
    stemDesc = `Thiên Can thuộc cách "Ngũ Hợp" (${STEMS[yearA.stem].nameVi} hợp ${STEMS[yearB.stem].nameVi} hóa ${STEM_COMBINES[stemKey]}). Tự nhiên thu hút, bù trừ tính cách tuyệt vời.`;
  } else if (isStemGenerates) {
    stemScore = 86;
    stemGrade = 'Cát';
    stemDesc = `Thiên Can tương sinh (${STEMS[yearA.stem].nameVi} và ${STEMS[yearB.stem].nameVi} sinh trợ lẫn nhau). Dễ hỗ trợ công việc và chia sẻ tinh thần.`;
  } else if (isStemOvercomes) {
    stemScore = 52;
    stemGrade = 'Hung';
    stemDesc = `Thiên Can có yếu tố tương khắc giữa ${STEMS[yearA.stem].nameVi} và ${STEMS[yearB.stem].nameVi}. Đôi khi có bất đồng quan điểm cá nhân, cần kiên nhẫn lắng nghe.`;
  }

  factors.push({
    title: 'Thiên Can Năm Sinh (Chí Hướng & Lý Tưởng)',
    category: 'Can Chi',
    score: stemScore,
    grade: stemGrade,
    personAVal: `${STEMS[yearA.stem].nameVi} (${yearA.stem})`,
    personBVal: `${STEMS[yearB.stem].nameVi} (${yearB.stem})`,
    description: stemDesc,
    remedy: isStemOvercomes ? 'Học cách lắng nghe trọn vẹn ý kiến đối phương trước khi phản hồi, tránh bảo thủ áp đặt quan điểm.' : undefined
  });

  // 3. Factor: Địa Chi Con Giáp (Year Branches)
  const branchA = BRANCHES[yearA.branch];
  const branchB = BRANCHES[yearB.branch];

  // Tam Hợp Groups
  const TAM_HOP = [
    ['Shen', 'Zi', 'Chen'],   // Thân - Tý - Thìn (Thủy)
    ['Yin_B', 'Wu_B', 'Xu'],  // Dần - Ngọ - Tuất (Hỏa)
    ['Si', 'You', 'Chou'],    // Tỵ - Dậu - Sửu (Kim)
    ['Hai', 'Mao', 'Wei']     // Hợi - Mão - Mùi (Mộc)
  ];

  // Lục Hợp Pairs
  const LUC_HOP: Record<string, boolean> = {
    'Zi-Chou': true, 'Chou-Zi': true,
    'Yin_B-Hai': true, 'Hai-Yin_B': true,
    'Mao-Xu': true, 'Xu-Mao': true,
    'Chen-You': true, 'You-Chen': true,
    'Si-Shen': true, 'Shen-Si': true,
    'Wu_B-Wei': true, 'Wei-Wu_B': true
  };

  // Lục Xung Pairs
  const LUC_XUNG: Record<string, boolean> = {
    'Zi-Wu_B': true, 'Wu_B-Zi': true,
    'Chou-Wei': true, 'Wei-Chou': true,
    'Yin_B-Shen': true, 'Shen-Yin_B': true,
    'Mao-You': true, 'You-Mao': true,
    'Chen-Xu': true, 'Xu-Chen': true,
    'Si-Hai': true, 'Hai-Si': true
  };

  const branchPairKey = `${yearA.branch}-${yearB.branch}`;
  const isLucHop = Boolean(LUC_HOP[branchPairKey]);
  const isTamHop = TAM_HOP.some(group => group.includes(yearA.branch) && group.includes(yearB.branch));
  const isLucXung = Boolean(LUC_XUNG[branchPairKey]);

  let branchScore = 72;
  let branchGrade: CompatibilityFactor['grade'] = 'Bình Hòa';
  let branchDesc = `Địa Chi ${branchA.nameVi} (${branchA.zodiacVi}) và ${branchB.nameVi} (${branchB.zodiacVi}) bình hòa, không xung hại.`;

  if (isLucHop) {
    branchScore = 96;
    branchGrade = 'Đại Cát';
    branchDesc = `Thuộc cách Lục Hợp (${branchA.nameVi} hợp ${branchB.nameVi}). Cực kỳ ăn ý trong sinh hoạt, tình cảm gắn kết sâu đậm.`;
  } else if (isTamHop) {
    branchScore = 92;
    branchGrade = 'Đại Cát';
    branchDesc = `Thuộc cách Tam Hợp (${branchA.zodiacVi} và ${branchB.zodiacVi} cùng chung cục). Dễ đồng thuận mục tiêu lớn, cùng xây dựng cơ đồ bền vững.`;
  } else if (isLucXung) {
    branchScore = 48;
    branchGrade = 'Hung';
    branchDesc = `Thuộc cặp Lục Xung (${branchA.nameVi} xung ${branchB.nameVi}). Thói quen sinh hoạt và phong cách hành động có sự đối lập tự nhiên.`;
  }

  factors.push({
    title: 'Địa Chi Con Giáp (Tính Cách & Sinh Hoạt)',
    category: 'Can Chi',
    score: branchScore,
    grade: branchGrade,
    personAVal: `${branchA.nameVi} (${branchA.zodiacVi})`,
    personBVal: `${branchB.nameVi} (${branchB.zodiacVi})`,
    description: branchDesc,
    remedy: isLucXung ? `Hóa giải Lục Xung bằng không gian độc lập: mỗi người nên có góc làm việc riêng và tránh can thiệp sâu vào sở thích cá nhân của nhau.` : undefined
  });

  // 4. Factor: Ngũ Hành Nạp Âm
  const relNaYin = ELEMENT_RELATIONS[naYinElementA];
  let naYinScore = 75;
  let naYinGrade: CompatibilityFactor['grade'] = 'Bình Hòa';
  let naYinDesc = `Nạp Âm ${naYinA} và ${naYinB} bình ổn, không tạo áp lực ngũ hành.`;

  if (relNaYin.generates === naYinElementB || relNaYin.generatedBy === naYinElementB) {
    naYinScore = 92;
    naYinGrade = 'Đại Cát';
    naYinDesc = `Ngũ Hành Nạp Âm tương sinh (${naYinA} sinh dưỡng hoặc được ${naYinB} tương sinh). Năng lượng bồi hoàn tự nhiên, mang lại may mắn và bình an.`;
  } else if (naYinElementA === naYinElementB) {
    naYinScore = 82;
    naYinGrade = 'Cát';
    naYinDesc = `Đồng hành tương trợ (${naYinA} và ${naYinB} cùng chung hành). Hiểu được tâm tư của nhau, phong cách tư duy tương đồng.`;
  } else if (relNaYin.overcomes === naYinElementB || relNaYin.overcomeBy === naYinElementB) {
    naYinScore = 55;
    naYinGrade = 'Hung';
    naYinDesc = `Nạp Âm có quan hệ tương khắc (${naYinA} và ${naYinB}). Có thể một bên phải nhường nhịn nhiều hơn, cần năng lượng trung gian điều hòa.`;
  }

  factors.push({
    title: 'Ngũ Hành Nạp Âm (Bản Mệnh Sức Khỏe & Vận May)',
    category: 'Ngũ Hành',
    score: naYinScore,
    grade: naYinGrade,
    personAVal: naYinA,
    personBVal: naYinB,
    description: naYinDesc
  });

  // 5. Factor: Cung Phi Bát Trạch (Kua Synastry)
  const lunarA = convertSolarToLunar(personA.birthData.solarYear, personA.birthData.solarMonth, personA.birthData.solarDay);
  const lunarB = convertSolarToLunar(personB.solarYear, personB.solarMonth, personB.solarDay);

  const kuaA = calculateKua(lunarA.lunarYear, personA.gender);
  const kuaB = calculateKua(lunarB.lunarYear, personB.gender);

  const kuaPairKey = `${kuaA.palace}-${kuaB.palace}`;
  const batTrachMatch = BAT_TRACH_PAIRS[kuaPairKey] || {
    name: (kuaA.group === kuaB.group ? 'Bình Hòa' : 'Biến Cách'),
    score: (kuaA.group === kuaB.group ? 76 : 58),
    isGood: kuaA.group === kuaB.group,
    meaning: kuaA.group === kuaB.group
      ? 'Cùng nhóm Đông Tứ Mệnh hoặc Tây Tứ Mệnh, phương hướng phong thủy tương thích.'
      : 'Khác nhóm Đông/Tây Mệnh, cần bố trí phong thủy nhà ở linh hoạt để hợp cả hai.'
  };

  factors.push({
    title: 'Cung Phi Bát Trạch (Hôn Nhân, Nhà Cửa & Vượng Khí)',
    category: 'Cung Phi',
    score: batTrachMatch.score,
    grade: batTrachMatch.score >= 88 ? 'Đại Cát' : batTrachMatch.score >= 75 ? 'Cát' : 'Bình Hòa',
    personAVal: `${kuaA.palace} (${kuaA.group})`,
    personBVal: `${kuaB.palace} (${kuaB.group})`,
    description: `Cung Phối: 【${batTrachMatch.name}】(${batTrachMatch.score} điểm). ${batTrachMatch.meaning}`,
    remedy: !batTrachMatch.isGood ? 'Hóa giải bằng cách chọn hướng bếp hoặc hướng phòng ngủ hợp với người trụ cột tài chính trong gia đình.' : undefined
  });

  // 6. Factor: Bát Tự Dụng Thần Bổ Khuyết
  let dungThanScore = 78;
  let dungThanDesc = 'Hai bên có thể chia sẻ các nguồn lực tự nhiên cho nhau.';
  const favElementsA = personA.calculation?.bazi?.favorableElements || ['Wood', 'Water'];
  const stemDayB = STEMS[dayB.stem].element;

  if (favElementsA.includes(stemDayB)) {
    dungThanScore = 95;
    dungThanDesc = `Người đồng hành mang ngũ hành ${ELEMENT_RELATIONS[stemDayB].vi}, chính là Dụng Thần cát tường của bạn! Đối phương đóng vai trò Quý Nhân nâng đỡ và mang lại vận may tài lộc.`;
  }

  factors.push({
    title: 'Bát Tự Dụng Thần Bổ Trợ (Quý Nhân Hóa Cát)',
    category: 'Dụng Thần',
    score: dungThanScore,
    grade: dungThanScore >= 90 ? 'Đại Cát' : 'Cát',
    personAVal: `Cần Dụng Thần: ${favElementsA.map(e => ELEMENT_RELATIONS[e].vi).join(', ')}`,
    personBVal: `Nhật Chủ: ${STEMS[dayB.stem].nameVi} (${ELEMENT_RELATIONS[stemDayB].vi})`,
    description: dungThanDesc
  });

  // 7. Overall Weighted Calculation
  const totalWeight = factors.reduce((sum, f) => sum + f.score, 0);
  const overallScore = Math.min(96, Math.max(52, Math.round(totalWeight / factors.length)));

  let ratingBand: CompatibilityAnalysis['ratingBand'] = 'Bình Hòa Cần Bổ Trợ';
  if (overallScore >= 88) ratingBand = 'Đại Cát Tương Hợp';
  else if (overallScore >= 78) ratingBand = 'Cát Lợi Hòa Hợp';
  else if (overallScore < 65) ratingBand = 'Nhiều Khác Biệt Cần Hóa Giải';

  // Sub-dimensions
  const emotional = Math.min(98, Math.max(45, Math.round((stemScore * 0.5 + branchScore * 0.5))));
  const business = Math.min(98, Math.max(50, Math.round((batTrachMatch.score * 0.4 + dungThanScore * 0.6))));
  const communication = Math.min(96, Math.max(45, Math.round((stemScore * 0.6 + branchScore * 0.4))));
  const longevity = Math.min(98, Math.max(48, Math.round((naYinScore * 0.5 + batTrachMatch.score * 0.5))));

  // 8. Bridging Element (Cầu nối Ngũ Hành)
  let bridgingElement: CompatibilityAnalysis['bridgingElement'];
  if (relNaYin.overcomes === naYinElementB) {
    // A khắc B: Cần hành trung gian để A sinh X, X sinh B
    const bridge = relNaYin.generates;
    bridgingElement = {
      element: bridge,
      nameVi: ELEMENT_RELATIONS[bridge].vi,
      color: ELEMENT_RELATIONS[bridge].color,
      explanation: `Bản mệnh A (${naYinA}) có xu hướng áp chế B (${naYinB}). Cần hành ${ELEMENT_RELATIONS[bridge].vi} làm cầu nối trung gian chuyển áp chế thành tương sinh tuần hoàn.`,
      recommendations: [
        `Trang trí không gian sống hoặc phòng làm việc chung với gam màu ${ELEMENT_RELATIONS[bridge].vi}.`,
        `Thống nhất nguyên tắc tài chính minh bạch và dành thời gian chia sẻ định kỳ vào cuối tuần.`,
        `Nếu là vợ chồng, có thể cân nhắc sinh con hoặc chọn năm khởi sự kinh doanh mang ngũ hành ${ELEMENT_RELATIONS[bridge].vi}.`
      ]
    };
  }

  // 9. Synthesis & Partnership Tips
  const tips: string[] = [
    `Tôn trọng nhịp điệu sinh hoạt cá nhân: người thuộc mệnh ${branchA.zodiacVi} và ${branchB.zodiacVi} có thế mạnh hành động riêng, tránh so sánh hơn thua.`,
    `Tận dụng điểm vượng: Điểm mạnh nhất của hai bạn nằm ở 【${factors.reduce((max, f) => f.score > max.score ? f : max, factors[0]).title}】(${Math.max(...factors.map(f => f.score))} điểm).`,
    `Đức năng thắng số: Mọi bản mệnh phối ngẫu đều có thể đạt tới hạnh phúc và thành tựu vượt bậc khi cả hai lấy sự thấu hiểu và chân thành làm gốc.`
  ];

  return {
    overallScore,
    ratingBand,
    dimensions: {
      emotional,
      business,
      communication,
      longevity
    },
    factors,
    bridgingElement,
    synthesisAdvice: `Mối quan hệ giữa ${personA.name} và ${personB.name} đạt mức ${overallScore}/100 (${ratingBand}). Năng lượng ngũ hành bổ trợ nhiều mặt, chỉ cần duy trì sự minh bạch và thông cảm sẽ tạo nên sự nghiệp và gia đạo bền vững.`,
    partnershipTips: tips
  };
}

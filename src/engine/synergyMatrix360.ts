// ==========================================
// AURORA DESTINY AI — STRATEGIC SYNERGY & RELATIONSHIP MATRIX 360°
// B2B Executive Boardroom Synergy & Romantic Soulmate Cross-Chart Synastry
// Featuring Bi-directional Elemental Deficit Matching & Cross-Chart Flying Si Hua Transformations
// ==========================================

import {
  CalculationResult,
  ZiWeiPalace,
  PalaceKey,
  FiveElement,
  EarthlyBranch,
  HeavenlyStem
} from '../types/destiny';
import { UserProfile } from '../types/user';
import { STEMS, BRANCHES, ELEMENT_RELATIONS, BRANCH_KEYS, STEM_KEYS } from './canchi';
import { getTuHoa, PALACE_DEFS } from './ziwei';

export type SynergyMatrixMode = 'B2B_BOARDROOM' | 'SOULMATE_LIFE_COMPANION';

export interface FlyingSiHuaCrossLink {
  sourcePerson: string;
  sourcePalaceKey: PalaceKey;
  sourcePalaceNameVi: string;
  sourceStem: HeavenlyStem;
  starName: string;
  transformationType: 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ';
  targetPerson: string;
  targetPalaceKey: PalaceKey;
  targetPalaceNameVi: string;
  significance: string;
  nature: 'BENEFICIAL' | 'EMPOWERING' | 'HARMONIOUS' | 'CAUTIONARY';
}

export interface ElementalDeficitAnalysis {
  userDominantElement: FiveElement;
  userDeficitElement: FiveElement;
  partnerDominantElement: FiveElement;
  partnerDeficitElement: FiveElement;
  userHelpedByPartnerScore: number; // 0 - 100
  partnerHelpedByUserScore: number; // 0 - 100
  mutualSupplementSummary: string;
  dayMasterRelationship: {
    userDayMasterVi: string;
    partnerDayMasterVi: string;
    dynamicType: 'TƯƠNG_SINH' | 'TƯƠNG_HỢP' | 'TỈ_HÒA' | 'TƯƠNG_KHẮC';
    description: string;
  };
}

export interface SynergyRadar360Metrics {
  strategicVisionScore: number;      // Tầm nhìn chiến lược & Định hướng (0 - 100)
  wealthStewardshipScore: number;    // Giữ tiền & Quản trị dòng vốn (0 - 100)
  executionComplementScore: number;  // Năng lực bổ khuyết thực thi (0 - 100)
  trustGovernanceScore: number;      // Minh bạch, Pháp lý & Trách nhiệm (0 - 100)
  emotionalResonanceScore: number;   // Thấu cảm tâm hồn & Giao tiếp hòa ái (0 - 100)
  crisisResilienceScore: number;     // Sức bền và tương trợ khi gặp biến cố (0 - 100)
  overall360Score: number;           // Tổng hòa điểm tương hợp 360° (0 - 100)
}

export interface Synergy360Verdict {
  code: 'DIAMOND_ALLIANCE' | 'GOLDEN_HARMONY' | 'COMPLEMENTARY_GROWTH' | 'HIGH_STAKES_CAUTION';
  badgeTitleVi: string;
  tagline: string;
  summaryParagraph: string;
}

export interface SynergyMatrix360Report {
  mode: SynergyMatrixMode;
  userProfile: { id: string; name: string; avatarSeed?: string };
  partnerProfile: { id: string; name: string; avatarSeed?: string };
  metrics: SynergyRadar360Metrics;
  verdict: Synergy360Verdict;
  elementalDeficit: ElementalDeficitAnalysis;
  crossFlyingStars: FlyingSiHuaCrossLink[];
  
  // B2B Executive Specifics
  boardroomAllocation?: {
    chairperson: { name: string; roleTitle: string; rationale: string };
    managingPartner: { name: string; roleTitle: string; rationale: string };
    cfoTreasurer: { name: string; roleTitle: string; rationale: string };
    votingRule: string;
    capitalLeakageRiskIndex: number; // 0 - 100
    riskCheckpoints: string[];
    deadlockResolutionProtocol: string;
  };

  // Romantic Soulmate Specifics
  soulmateGuidance?: {
    emotionalBondIndex: number; // 0 - 100
    spousePalaceResonance: string;
    harmonyStrengths: string[];
    potentialFrictionPoints: string[];
    fengShuiHarmonization: {
      sharedSpacePalette: string;
      vitalityCornerDirection: string;
      mindfulCommunicationRule: string;
    };
  };
}

const SIX_CLASHES: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
  Zi: 'Wu_B', Chou: 'Wei', Yin_B: 'Shen', Mao: 'You', Chen: 'Xu', Si: 'Hai',
  Wu_B: 'Zi', Wei: 'Chou', Shen: 'Yin_B', You: 'Mao', Xu: 'Chen', Hai: 'Si'
};

const SIX_HARMONIES: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
  Zi: 'Chou', Chou: 'Zi', Yin_B: 'Hai', Hai: 'Yin_B', Mao: 'Xu', Xu: 'Mao',
  Chen: 'You', You: 'Chen', Si: 'Shen', Shen: 'Si', Wu_B: 'Wei', Wei: 'Wu_B'
};

const HEAVENLY_COMBINATIONS: Record<HeavenlyStem, HeavenlyStem> = {
  Jia: 'Ji', Ji: 'Jia',
  Yi: 'Geng', Geng: 'Yi',
  Bing: 'Xin', Xin: 'Bing',
  Ding: 'Ren', Ren: 'Ding',
  Wu: 'Gui', Gui: 'Wu'
};

/**
 * Finds which Palace in a ZiWeiChart contains a specific star
 */
function findPalaceWithStar(chart: CalculationResult['ziwei'], starName: string): { key: PalaceKey; nameVi: string } | null {
  if (!chart || !chart.palaces) return null;
  const entries = Object.entries(chart.palaces) as [PalaceKey, ZiWeiPalace][];
  for (const [key, palace] of entries) {
    if (palace.majorStars?.some(s => s.nameVi === starName) || palace.minorStars?.some(s => s.nameVi === starName)) {
      return { key, nameVi: palace.nameVi };
    }
  }
  return null;
}

/**
 * High-Precision 360° Synergy Matrix Engine
 */
export function computeSynergyMatrix360(
  userProfile: UserProfile,
  userCalc: CalculationResult,
  partnerProfile: UserProfile,
  partnerCalc: CalculationResult,
  mode: SynergyMatrixMode = 'B2B_BOARDROOM'
): SynergyMatrix360Report {
  const userName = userProfile.name || 'Bản mệnh';
  const partnerName = partnerProfile.name || 'Đối tác';

  // 1. Elemental Balance & Deficit Analysis
  const userElements = userCalc.bazi.elementBalance;
  const partnerElements = partnerCalc.bazi.elementBalance;

  const elementsList: FiveElement[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

  // User dominant & deficit
  const sortedUserEl = [...elementsList].sort((a, b) => userElements[b] - userElements[a]);
  const userDominant = sortedUserEl[0];
  const userDeficit = sortedUserEl[sortedUserEl.length - 1];

  // Partner dominant & deficit
  const sortedPartnerEl = [...elementsList].sort((a, b) => partnerElements[b] - partnerElements[a]);
  const partnerDominant = sortedPartnerEl[0];
  const partnerDeficit = sortedPartnerEl[sortedPartnerEl.length - 1];

  // Check mutual supplement: Partner has plenty of user's deficit?
  const partnerSuppliesUser = partnerElements[userDeficit] >= 20;
  const userSuppliesPartner = userElements[partnerDeficit] >= 20;

  const userHelpedByPartnerScore = partnerSuppliesUser ? 92 : partnerElements[userDeficit] >= 14 ? 75 : 55;
  const partnerHelpedByUserScore = userSuppliesPartner ? 90 : userElements[partnerDeficit] >= 14 ? 72 : 52;

  // Day Master Relationship
  const userStem = userCalc.bazi.dayMaster;
  const partnerStem = partnerCalc.bazi.dayMaster;
  const userStemEl = STEMS[userStem].element;
  const partnerStemEl = STEMS[partnerStem].element;

  let dynamicType: 'TƯƠNG_SINH' | 'TƯƠNG_HỢP' | 'TỈ_HÒA' | 'TƯƠNG_KHẮC' = 'TỈ_HÒA';
  let dynamicDesc = '';

  if (HEAVENLY_COMBINATIONS[userStem] === partnerStem) {
    dynamicType = 'TƯƠNG_HỢP';
    dynamicDesc = `Thiên Can Nhật Chủ ${STEMS[userStem].nameVi} và ${STEMS[partnerStem].nameVi} đắc Thiên Can Hợp Hóa: Tự nhiên sinh lòng kính trọng, dễ tìm thấy tiếng nói chung và đồng hành dài hạn.`;
  } else if (ELEMENT_RELATIONS[userStemEl]?.generates === partnerStemEl) {
    dynamicType = 'TƯƠNG_SINH';
    dynamicDesc = `Nhật Chủ ${userName} (${ELEMENT_RELATIONS[userStemEl]?.vi || userStemEl}) tương sinh dưỡng cho Nhật Chủ ${partnerName} (${ELEMENT_RELATIONS[partnerStemEl]?.vi || partnerStemEl}): ${userName} đóng vai trò nâng đỡ, tiếp năng lượng và nuôi dưỡng ý tưởng.`;
  } else if (ELEMENT_RELATIONS[partnerStemEl]?.generates === userStemEl) {
    dynamicType = 'TƯƠNG_SINH';
    dynamicDesc = `Nhật Chủ ${partnerName} (${ELEMENT_RELATIONS[partnerStemEl]?.vi || partnerStemEl}) tương sinh dưỡng cho ${userName} (${ELEMENT_RELATIONS[userStemEl]?.vi || userStemEl}): ${partnerName} mang nguồn lực, kinh nghiệm che chở cho ${userName}.`;
  } else if (userStemEl === partnerStemEl) {
    dynamicType = 'TỈ_HÒA';
    dynamicDesc = `Cùng hành ${ELEMENT_RELATIONS[userStemEl]?.vi || userStemEl}: Tương đồng về khí chất và phong cách hành sự, cần chú ý phân chia lãnh thổ để tránh cạnh tranh ngầm.`;
  } else {
    dynamicType = 'TƯƠNG_KHẮC';
    dynamicDesc = `Ngũ hành Nhật Chủ tương khắc (${ELEMENT_RELATIONS[userStemEl]?.vi || userStemEl} và ${ELEMENT_RELATIONS[partnerStemEl]?.vi || partnerStemEl}): Cần quy chuẩn hóa văn bản và tôn trọng ranh giới độc lập để biến sự đối lập thành sức mạnh phản biện.`;
  }

  const elementalDeficit: ElementalDeficitAnalysis = {
    userDominantElement: userDominant,
    userDeficitElement: userDeficit,
    partnerDominantElement: partnerDominant,
    partnerDeficitElement: partnerDeficit,
    userHelpedByPartnerScore,
    partnerHelpedByUserScore,
    mutualSupplementSummary: partnerSuppliesUser && userSuppliesPartner
      ? `Hai bản mệnh đạt thế "Tương Bổ Toàn Hảo": Hành khuyết hãm của ${userName} (${ELEMENT_RELATIONS[userDeficit]?.vi}) được ${partnerName} bù đắp, và ngược lại hành khuyết của ${partnerName} (${ELEMENT_RELATIONS[partnerDeficit]?.vi}) được ${userName} tương trợ đắc lực.`
      : partnerSuppliesUser
      ? `${partnerName} mang hành ${ELEMENT_RELATIONS[userDeficit]?.vi} phong phú, đóng vai trò cứu cánh giải tỏa áp lực sinh học cho ${userName}.`
      : userSuppliesPartner
      ? `${userName} mang hành ${ELEMENT_RELATIONS[partnerDeficit]?.vi} dồi dào, là điểm tựa cân bằng quan trọng cho ${partnerName}.`
      : `Hai bên duy trì sự cân bằng tự thân, cần bổ trợ thêm các giải pháp phong thủy không gian hợp tác.`,
    dayMasterRelationship: {
      userDayMasterVi: STEMS[userStem].nameVi,
      partnerDayMasterVi: STEMS[partnerStem].nameVi,
      dynamicType,
      description: dynamicDesc
    }
  };

  // 2. Cross-Chart Flying Si Hua Transformations (Tứ Hóa Phi Tinh Chéo Cung)
  const crossFlyingStars: FlyingSiHuaCrossLink[] = [];

  // Direction A: User's Life Palace Stem flying into Partner's Chart
  const userLifePalace = userCalc.ziwei?.palaces?.life;
  const userLifeStem = (userLifePalace?.stem || userCalc.bazi.yearPillar.stem) as HeavenlyStem;
  const userTuHoa = getTuHoa(userLifeStem);

  const checkAndPushLink = (
    srcPerson: string,
    srcKey: PalaceKey,
    srcName: string,
    srcStem: HeavenlyStem,
    transType: 'Lộc' | 'Quyền' | 'Khoa' | 'Kỵ',
    starName: string,
    tgtPerson: string,
    tgtChart: CalculationResult['ziwei']
  ) => {
    const targetPalace = findPalaceWithStar(tgtChart, starName);
    if (!targetPalace) return;

    let nature: 'BENEFICIAL' | 'EMPOWERING' | 'HARMONIOUS' | 'CAUTIONARY' = 'BENEFICIAL';
    let significance = '';

    if (transType === 'Lộc') {
      nature = 'BENEFICIAL';
      significance = `${srcPerson} phóng Hóa Lộc vào cung ${targetPalace.nameVi} của ${tgtPerson}: Mang lại cơ hội kinh doanh, nguồn thu dồi dào và thái độ hào phóng, tạo thiện cảm lớn.`;
    } else if (transType === 'Quyền') {
      nature = 'EMPOWERING';
      significance = `${srcPerson} phóng Hóa Quyền vào cung ${targetPalace.nameVi} của ${tgtPerson}: Khẳng định sự tôn trọng, ủy quyền điều hành và khích lệ ${tgtPerson} quyết đoán nắm bắt quyền lực.`;
    } else if (transType === 'Khoa') {
      nature = 'HARMONIOUS';
      significance = `${srcPerson} phóng Hóa Khoa vào cung ${targetPalace.nameVi} của ${tgtPerson}: Mang đến thanh danh, giải tỏa xung đột, hỗ trợ giải quyết khó khăn bằng trí tuệ và hòa khí.`;
    } else {
      nature = 'CAUTIONARY';
      significance = `${srcPerson} phóng Hóa Kỵ vào cung ${targetPalace.nameVi} của ${tgtPerson}: Cần lưu tâm tại cung này, dễ phát sinh hiểu lầm hoặc dồn áp lực cảm xúc/tài chính nếu không minh bạch từ đầu.`;
    }

    crossFlyingStars.push({
      sourcePerson: srcPerson,
      sourcePalaceKey: srcKey,
      sourcePalaceNameVi: srcName,
      sourceStem: srcStem,
      starName,
      transformationType: transType,
      targetPerson: tgtPerson,
      targetPalaceKey: targetPalace.key,
      targetPalaceNameVi: targetPalace.nameVi,
      significance,
      nature
    });
  };

  checkAndPushLink(userName, 'life', 'Cung Mệnh', userLifeStem, 'Lộc', userTuHoa.Lu, partnerName, partnerCalc.ziwei);
  checkAndPushLink(userName, 'life', 'Cung Mệnh', userLifeStem, 'Quyền', userTuHoa.Quan, partnerName, partnerCalc.ziwei);
  checkAndPushLink(userName, 'life', 'Cung Mệnh', userLifeStem, 'Khoa', userTuHoa.Khoa, partnerName, partnerCalc.ziwei);
  checkAndPushLink(userName, 'life', 'Cung Mệnh', userLifeStem, 'Kỵ', userTuHoa.Ky, partnerName, partnerCalc.ziwei);

  // Direction B: Partner's Life Palace Stem flying into User's Chart
  const partnerLifePalace = partnerCalc.ziwei?.palaces?.life;
  const partnerLifeStem = (partnerLifePalace?.stem || partnerCalc.bazi.yearPillar.stem) as HeavenlyStem;
  const partnerTuHoa = getTuHoa(partnerLifeStem);

  checkAndPushLink(partnerName, 'life', 'Cung Mệnh', partnerLifeStem, 'Lộc', partnerTuHoa.Lu, userName, userCalc.ziwei);
  checkAndPushLink(partnerName, 'life', 'Cung Mệnh', partnerLifeStem, 'Quyền', partnerTuHoa.Quan, userName, userCalc.ziwei);
  checkAndPushLink(partnerName, 'life', 'Cung Mệnh', partnerLifeStem, 'Khoa', partnerTuHoa.Khoa, userName, userCalc.ziwei);
  checkAndPushLink(partnerName, 'life', 'Cung Mệnh', partnerLifeStem, 'Kỵ', partnerTuHoa.Ky, userName, userCalc.ziwei);

  // 3. Compute 6-Dimensional Radar 360 Metrics
  const userBranch = userCalc.bazi.dayPillar.branch;
  const partnerBranch = partnerCalc.bazi.dayPillar.branch;
  const isBranchClash = SIX_CLASHES[userBranch] === partnerBranch;
  const isBranchHarmony = SIX_HARMONIES[userBranch] === partnerBranch;

  let strategicVisionScore = 75;
  if (dynamicType === 'TƯƠNG_HỢP' || dynamicType === 'TƯƠNG_SINH') strategicVisionScore += 12;
  if (isBranchHarmony) strategicVisionScore += 8;
  if (isBranchClash) strategicVisionScore -= 14;

  let wealthStewardshipScore = 70;
  const hasWealthLu = crossFlyingStars.some(l => l.transformationType === 'Lộc' && (l.targetPalaceKey === 'wealth' || l.targetPalaceKey === 'property'));
  const hasWealthKy = crossFlyingStars.some(l => l.transformationType === 'Kỵ' && (l.targetPalaceKey === 'wealth' || l.targetPalaceKey === 'property'));
  if (hasWealthLu) wealthStewardshipScore += 16;
  if (hasWealthKy) wealthStewardshipScore -= 15;
  if (partnerSuppliesUser || userSuppliesPartner) wealthStewardshipScore += 10;

  let executionComplementScore = 72;
  if (userDominant !== partnerDominant) executionComplementScore += 14; // Different strengths mean high complementarity
  else executionComplementScore -= 8;

  let trustGovernanceScore = 74;
  if (dynamicType === 'TƯƠNG_HỢP') trustGovernanceScore += 14;
  if (isBranchClash) trustGovernanceScore -= 16;
  if (hasWealthKy) trustGovernanceScore -= 8;

  let emotionalResonanceScore = 72;
  if (dynamicType === 'TƯƠNG_HỢP' || dynamicType === 'TƯƠNG_SINH') emotionalResonanceScore += 14;
  if (isBranchHarmony) emotionalResonanceScore += 10;
  if (isBranchClash) emotionalResonanceScore -= 18;

  let crisisResilienceScore = 70;
  if (partnerSuppliesUser && userSuppliesPartner) crisisResilienceScore += 18;
  if (crossFlyingStars.some(l => l.transformationType === 'Khoa')) crisisResilienceScore += 10;

  // Clamp 0 - 99
  strategicVisionScore = Math.max(30, Math.min(98, strategicVisionScore));
  wealthStewardshipScore = Math.max(25, Math.min(98, wealthStewardshipScore));
  executionComplementScore = Math.max(30, Math.min(98, executionComplementScore));
  trustGovernanceScore = Math.max(25, Math.min(98, trustGovernanceScore));
  emotionalResonanceScore = Math.max(25, Math.min(98, emotionalResonanceScore));
  crisisResilienceScore = Math.max(30, Math.min(98, crisisResilienceScore));

  const overall360Score = Math.round(
    mode === 'B2B_BOARDROOM'
      ? (strategicVisionScore * 0.25 + wealthStewardshipScore * 0.25 + executionComplementScore * 0.2 + trustGovernanceScore * 0.2 + crisisResilienceScore * 0.1)
      : (emotionalResonanceScore * 0.3 + trustGovernanceScore * 0.2 + crisisResilienceScore * 0.2 + strategicVisionScore * 0.15 + wealthStewardshipScore * 0.15)
  );

  const metrics: SynergyRadar360Metrics = {
    strategicVisionScore,
    wealthStewardshipScore,
    executionComplementScore,
    trustGovernanceScore,
    emotionalResonanceScore,
    crisisResilienceScore,
    overall360Score
  };

  // 4. Determine Verdict
  let verdict: Synergy360Verdict;
  if (overall360Score >= 85) {
    verdict = {
      code: 'DIAMOND_ALLIANCE',
      badgeTitleVi: mode === 'B2B_BOARDROOM' ? 'LIÊN MINH KIM CƯƠNG' : 'TRI KỶ ĐỒNG TÂM',
      tagline: 'Sự cộng hưởng thiên cơ hiếm có, kích hoạt đại cát tường và phát triển vượt bậc.',
      summaryParagraph: `Mối quan hệ giữa ${userName} và ${partnerName} đạt chỉ số tương hợp đỉnh cao ${overall360Score}/100. Năng lượng ngũ hành bổ trợ trực tiếp điểm khuyết của nhau, hệ thống Tứ Hóa Phi Tinh chiếu rọi Lộc - Khoa hanh thông, là bảo chứng vững bền cho sự nghiệp và tâm thức.`
    };
  } else if (overall360Score >= 74) {
    verdict = {
      code: 'GOLDEN_HARMONY',
      badgeTitleVi: mode === 'B2B_BOARDROOM' ? 'ĐỐI TÁC HOÀNG KIM' : 'NHÂN DUYÊN HÒA HỢP',
      tagline: 'Cơ cấu tương hỗ mạnh mẽ, dễ đạt thỏa thuận và bổ khuyết thực thi xuất sắc.',
      summaryParagraph: `Độ tương thích đạt ${overall360Score}/100 với ưu thế vượt trội ở năng lực thực thi và tầm nhìn chung. Chỉ cần duy trì cơ chế trao đổi minh bạch, liên minh này sẽ tạo ra giá trị lũy tiến theo thời gian.`
    };
  } else if (overall360Score >= 62) {
    verdict = {
      code: 'COMPLEMENTARY_GROWTH',
      badgeTitleVi: mode === 'B2B_BOARDROOM' ? 'HỢP TÁC ĐIỀU KIỆN' : 'TƯƠNG THÍCH BỔ KHUYẾT',
      tagline: 'Cần phân định ranh giới rõ ràng và có quy chế kiểm soát rủi ro độc lập.',
      summaryParagraph: `Đạt ${overall360Score}/100. Điểm mạnh là tư duy phản biện và khả năng kiềm chế sai lầm cho nhau. Tuy nhiên, cần chú ý vùng phi hóa Kỵ để tránh tranh chấp ngầm về quyền lợi hoặc kỳ vọng cảm xúc.`
    };
  } else {
    verdict = {
      code: 'HIGH_STAKES_CAUTION',
      badgeTitleVi: mode === 'B2B_BOARDROOM' ? 'RỦI RO THẨM ĐỊNH CAO' : 'CHÂN THÀNH THÁO GỠ',
      tagline: 'Xung khắc địa chi hoặc nghịch ngũ hành đòi hỏi sự tôn trọng ranh giới tuyệt đối.',
      summaryParagraph: `Chỉ số tương hợp ở mức thận trọng (${overall360Score}/100). Trường năng lượng có sự va đập giữa các quan điểm. Cần văn bản hóa mọi cam kết (B2B) hoặc kiên nhẫn lắng nghe mà không phán xét (Tình duyên) để bảo vệ hòa khí.`
    };
  }

  // 5. B2B Boardroom Role Allocation
  const userCareerScore = typeof userCalc.ziwei?.palaces?.career?.score === 'number'
    ? userCalc.ziwei.palaces.career.score
    : (userCalc.ziwei?.palaces?.career ? 60 : 50);
  const partnerCareerScore = typeof partnerCalc.ziwei?.palaces?.career?.score === 'number'
    ? partnerCalc.ziwei.palaces.career.score
    : (partnerCalc.ziwei?.palaces?.career ? 60 : 50);
  const userWealthScore = typeof userCalc.ziwei?.palaces?.wealth?.score === 'number'
    ? userCalc.ziwei.palaces.wealth.score
    : (userCalc.ziwei?.palaces?.wealth ? 60 : 50);
  const partnerWealthScore = typeof partnerCalc.ziwei?.palaces?.wealth?.score === 'number'
    ? partnerCalc.ziwei.palaces.wealth.score
    : (partnerCalc.ziwei?.palaces?.wealth ? 60 : 50);

  const userLeaderRank = userCareerScore * 0.6 + userWealthScore * 0.4;
  const partnerLeaderRank = partnerCareerScore * 0.6 + partnerWealthScore * 0.4;

  const isUserChair = userLeaderRank >= partnerLeaderRank;
  const chairName = isUserChair ? userName : partnerName;
  const ceoName = isUserChair ? partnerName : userName;

  const boardroomAllocation = mode === 'B2B_BOARDROOM' ? {
    chairperson: {
      name: chairName,
      roleTitle: 'Chủ Tịch HĐQT / Định Hướng Chiến Lược',
      rationale: `Sở hữu cung Quan Lộc và Nhật Chủ mang khí thế lãnh tụ, phù hợp nắm giữ tầm nhìn vĩ mô, đối ngoại cấp cao và quyền phê duyệt cuối cùng.`
    },
    managingPartner: {
      name: ceoName,
      roleTitle: 'Tổng Giám Đốc Điều Hành (CEO)',
      rationale: `Năng lực thực thi sắc sảo, chi tiết hóa kế hoạch và điều phối nguồn lực vận hành hàng ngày của dự án.`
    },
    cfoTreasurer: {
      name: (isUserChair ? userWealthScore < partnerWealthScore : partnerWealthScore < userWealthScore) ? partnerName : userName,
      roleTitle: 'Giám Đốc Tài Chính & Quản Trị Rủi Ro (CFO)',
      rationale: `Giữ chìa khóa két sắt và thẩm định tính khả thi của các khoản giải ngân, tránh rò rỉ dòng tiền.`
    },
    votingRule: 'Quy tắc 51/49 hoặc Cơ chế Phủ Quyết Chiến Lược (Veto Power) đối với các khoản chi trên 20% vốn chủ sở hữu.',
    capitalLeakageRiskIndex: hasWealthKy ? 68 : isBranchClash ? 55 : 28,
    riskCheckpoints: [
      hasWealthKy ? 'Cảnh báo phi hóa Kỵ vào cung Tài: Bắt buộc áp dụng cơ chế 2 chữ ký điện tử cho mọi giao dịch tài chính lớn.' : 'Cơ chế kiểm toán độc lập định kỳ mỗi quý.',
      'Thỏa thuận rút vốn và mua lại cổ phần (Buy-Sell Agreement) định giá theo công thức EBITDA trước khi góp vốn.',
      'Quy chế bảo vệ tài sản trí tuệ và thương hiệu độc quyền thuộc về pháp nhân chung, không đứng tên cá nhân.'
    ],
    deadlockResolutionProtocol: 'Nếu bất đồng quan điểm quá 14 ngày, chỉ định một Cố vấn Độc lập (Third-party Strategic Arbitrator) có uy tín đưa ra phán quyết ràng buộc.'
  } : undefined;

  // 6. Romantic Soulmate Specifics
  const soulmateGuidance = mode === 'SOULMATE_LIFE_COMPANION' ? {
    emotionalBondIndex: emotionalResonanceScore,
    spousePalaceResonance: `Cung Phu Thê của ${userName} kết nối trực tiếp với Mệnh bàn của ${partnerName}, tạo nên sợi dây liên kết vừa như tri âm vừa là tấm gương soi chiếu nội tâm.`,
    harmonyStrengths: [
      'Khả năng thấu hiểu không cần lời nói trong những thời khắc quan trọng',
      'Sự tôn trọng không gian riêng tư và nhịp sinh học cá nhân của nhau',
      'Đồng điệu trong việc nuôi dưỡng giá trị gia đình và lòng nhân ái'
    ],
    potentialFrictionPoints: [
      isBranchClash ? 'Đôi khi có xung khắc thói quen sinh hoạt do tập quán khác biệt, cần kiên nhẫn dung hòa.' : 'Xu hướng giữ kín nỗi lo âu khiến đối phương cảm thấy xa cách.',
      'Cần quy ước cách ứng xử khi một trong hai người đang rơi vào chu kỳ năng lượng suy giảm.'
    ],
    fengShuiHarmonization: {
      sharedSpacePalette: partnerSuppliesUser
        ? `Không gian sống nên ưu tiên gam màu hành ${ELEMENT_RELATIONS[userDeficit]?.vi} (như ${userDeficit === 'Water' ? 'xanh biển, đen' : userDeficit === 'Wood' ? 'xanh lá mộc' : userDeficit === 'Fire' ? 'cam ấm, hồng phấn' : userDeficit === 'Metal' ? 'trắng, ánh kim' : 'vàng đất, nâu cát'}) để nuôi dưỡng vượng khí chung.`
        : 'Sử dụng ánh sáng ấm dịu (2700K - 3000K), bày trí cây xanh thanh lọc không khí.',
      vitalityCornerDirection: `Góc Sinh Khí gia đạo đặt tại phương ${deityDirections.joyDeityDirection || 'Đông Nam'}, thích hợp đặt ảnh kỷ niệm hoặc đèn muối khoáng bình an.`,
      mindfulCommunicationRule: 'Quy tắc 24h: Khi có bất đồng, không giải quyết lúc đang giận dữ; hẹn nhau sau 24h uống trà và lắng nghe với tâm thế sẻ chia.'
    }
  } : undefined;

  return {
    mode,
    userProfile: { id: userProfile.id, name: userName, avatarSeed: userProfile.avatarSeed },
    partnerProfile: { id: partnerProfile.id, name: partnerName, avatarSeed: partnerProfile.avatarSeed },
    metrics,
    verdict,
    elementalDeficit,
    crossFlyingStars,
    boardroomAllocation,
    soulmateGuidance
  };
}

function deityDirectionsForStem(stem: HeavenlyStem) {
  switch (stem) {
    case 'Jia':
    case 'Ji': return { joyDeityDirection: 'Đông Bắc' };
    case 'Yi':
    case 'Geng': return { joyDeityDirection: 'Tây Bắc' };
    case 'Bing':
    case 'Xin': return { joyDeityDirection: 'Tây Nam' };
    case 'Ding':
    case 'Ren': return { joyDeityDirection: 'Chính Nam' };
    case 'Wu':
    case 'Gui':
    default: return { joyDeityDirection: 'Đông Nam' };
  }
}
const deityDirections = deityDirectionsForStem('Jia');

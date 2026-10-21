// ==============================================================================
// AURORA DESTINY AI — CELESTIAL KARMIC NETWORK & RESONANCE GRAPH ENGINE
// Multi-Profile Interpersonal Synastry, Energy Exchange, Benefactor (Quý Nhân)
// Mapping & Conflict Resolution (Dung Hòa Xung Khắc)
// ==============================================================================

import {
  HeavenlyStem,
  EarthlyBranch,
  FiveElement,
  CalculationResult
} from '../types/destiny';
import { UserProfile } from '../types/user';
import {
  STEMS,
  BRANCHES,
  ELEMENT_RELATIONS,
  getTenGod,
  getNaYin
} from './canchi';
import { runFullDestinyCalculation } from './destinyEngine';

export type KarmicRoleType =
  | 'QUY_NHAN_CUU_GIAI'     // Đại Quý Nhân Phù Trợ
  | 'TAI_TINH_KHOI_NGHIEP'   // Tài Tinh Kích Hoạt Dòng Tiền
  | 'TRI_KY_HOA_KHI'         // Tri Kỷ Bình An Định Tâm
  | 'DONG_LUC_THU_THACH'     // Động Lực Thử Thách Bứt Phá
  | 'XUNG_KHAC_CAN_DUNG_HOA'; // Xung Khắc Cần Cầu Nối Hóa Giải

export interface KarmicConnectionEdge {
  targetProfileId: string;
  targetProfileName: string;
  targetRelationshipTag: string;
  targetAvatarSeed: string;
  targetColorHex?: string;
  roleType: KarmicRoleType;
  roleTitleVi: string;
  resonanceScore: number; // 0 - 100
  giveEnergyScore: number; // 0 - 100
  receiveEnergyScore: number; // 0 - 100
  dominantInteraction: string;
  colorGrade: 'emerald' | 'amber' | 'purple' | 'cyan' | 'rose';
  
  // Chi tiết luận giải hai chiều
  whatTheyBringToYou: string;
  whatYouBringToThem: string;
  synergyLevel: 'Viên Mãn Đắc Lợi' | 'Tương Sinh Tốt Lành' | 'Bình Hòa Thấu Hiểu' | 'Cần Hòa Giải Bổ Khuyết';
  
  // Ngũ hành & Dụng thần tương hỗ
  elementalGift: {
    element: FiveElement;
    nameVi: string;
    isUsefulGodToYou: boolean;
    explanation: string;
  };
  
  // Cầu nối hóa giải nếu có xung khắc
  bridgingRemedy?: {
    requiredElement: FiveElement;
    nameVi: string;
    colorHex: string;
    tacticalAdvice: string;
    actionableFengShui: string;
  };

  tags: string[];
}

export interface KarmicNetworkAnalysis {
  coreProfileId: string;
  coreProfileName: string;
  totalMembers: number;
  networkHealthScore: number; // 0 - 100
  energyEquilibrium: 'Hưng Vượng Đắc Khí' | 'Cân Bằng Hài Hòa' | 'Thiên Lệch Năng Lượng' | 'Cần Bổ Khuyết';
  topBenefactors: KarmicConnectionEdge[];
  frictionAlerts: KarmicConnectionEdge[];
  connections: KarmicConnectionEdge[];
  strategicNetworkAdvice: string;
  collectiveStrengths: string[];
  collectiveVulnerabilities: string[];
}

// 1. Classical Noble (Thiên Ất Quý Nhân) lookup table
const NOBLE_BRANCHES: Record<HeavenlyStem, EarthlyBranch[]> = {
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

// 2. Classical Six Clashes (Lục Xung)
const BRANCH_CLASHES: Record<EarthlyBranch, EarthlyBranch> = {
  Zi: 'Wu_B', Wu_B: 'Zi',
  Chou: 'Wei', Wei: 'Chou',
  Yin_B: 'Shen', Shen: 'Yin_B',
  Mao: 'You', You: 'Mao',
  Chen: 'Xu', Xu: 'Chen',
  Si: 'Hai', Hai: 'Si'
};

// 3. Classical Six Harms (Lục Hại)
const BRANCH_HARMS: Record<EarthlyBranch, EarthlyBranch> = {
  Zi: 'Wei', Wei: 'Zi',
  Chou: 'Wu_B', Wu_B: 'Chou',
  Yin_B: 'Si', Si: 'Yin_B',
  Mao: 'Chen', Chen: 'Mao',
  Shen: 'Hai', Hai: 'Shen',
  You: 'Xu', Xu: 'You'
};

// 4. Classical Three Harmonies (Tam Hợp)
const THREE_HARMONIES: Record<EarthlyBranch, EarthlyBranch[]> = {
  Shen: ['Zi', 'Chen'], Zi: ['Shen', 'Chen'], Chen: ['Shen', 'Zi'],
  Hai: ['Mao', 'Wei'], Mao: ['Hai', 'Wei'], Wei: ['Hai', 'Mao'],
  Yin_B: ['Wu_B', 'Xu'], Wu_B: ['Yin_B', 'Xu'], Xu: ['Yin_B', 'Wu_B'],
  Si: ['You', 'Chou'], You: ['Si', 'Chou'], Chou: ['Si', 'You']
};

// 5. Six Combinations (Lục Hợp)
const SIX_COMBINATIONS: Record<EarthlyBranch, EarthlyBranch> = {
  Zi: 'Chou', Chou: 'Zi',
  Yin_B: 'Hai', Hai: 'Yin_B',
  Mao: 'Xu', Xu: 'Mao',
  Chen: 'You', You: 'Chen',
  Si: 'Shen', Shen: 'Si',
  Wu_B: 'Wei', Wei: 'Wu_B'
};

// 6. Classical Clash Bridging Elements
const CLASH_BRIDGING_MAP: Record<string, { element: FiveElement; nameVi: string; advice: string }> = {
  'Zi-Wu_B': { element: 'Wood', nameVi: 'Mộc', advice: 'Thủy sinh Mộc, Mộc sinh Hỏa. Dùng cây xanh, tinh thần học vấn và sự hòa ái làm cầu nối chuyển xung thành sinh.' },
  'Wu_B-Zi': { element: 'Wood', nameVi: 'Mộc', advice: 'Thủy sinh Mộc, Mộc sinh Hỏa. Dùng Mộc làm cầu nối trung gian dung hòa.' },
  'Chou-Wei': { element: 'Metal', nameVi: 'Kim', advice: 'Thổ vượng sinh Kim. Dùng sự minh bạch, văn bản rõ ràng và tác phong kỷ luật để tránh xung đột quyền lợi.' },
  'Wei-Chou': { element: 'Metal', nameVi: 'Kim', advice: 'Thổ vượng sinh Kim. Dùng kỷ luật và sự thẳng thắn để dung hòa.' },
  'Yin_B-Shen': { element: 'Water', nameVi: 'Thủy', advice: 'Kim sinh Thủy, Thủy sinh Mộc. Dùng sự nhu mì, thấu cảm và nhường nhịn lắng nghe để giải tỏa căng thẳng.' },
  'Shen-Yin_B': { element: 'Water', nameVi: 'Thủy', advice: 'Kim sinh Thủy, Thủy sinh Mộc. Dùng sự linh hoạt, mềm mỏng hóa giải xung đột.' },
  'Mao-You': { element: 'Water', nameVi: 'Thủy', advice: 'Kim sinh Thủy, Thủy dưỡng Mộc. Giải quyết khúc mắc bằng tình thương và sự bao dung thay vì lý lẽ khô cứng.' },
  'You-Mao': { element: 'Water', nameVi: 'Thủy', advice: 'Kim sinh Thủy, Thủy dưỡng Mộc. Hòa giải êm thấm qua đối thoại chân thành.' },
  'Chen-Xu': { element: 'Metal', nameVi: 'Kim', advice: 'Thổ sinh Kim. Thiết lập nguyên tắc công bằng, rõ ràng trong trách nhiệm và tài chính.' },
  'Xu-Chen': { element: 'Metal', nameVi: 'Kim', advice: 'Thổ sinh Kim. Thượng tôn sự minh bạch và công bằng.' },
  'Si-Hai': { element: 'Wood', nameVi: 'Mộc', advice: 'Thủy dưỡng Mộc, Mộc sinh Hỏa. Dùng không gian cây xanh, sách vở và định hướng dài hạn để gắn kết.' },
  'Hai-Si': { element: 'Wood', nameVi: 'Mộc', advice: 'Thủy dưỡng Mộc, Mộc sinh Hỏa. Dùng tri thức và sự phát triển chung làm mẫu số chung.' }
};

/**
 * Computes deep bilateral karmic resonance between the core profile and a member profile.
 */
export function calculateBilateralKarmicEdge(
  coreProfile: UserProfile,
  coreCalc: CalculationResult,
  memberProfile: UserProfile,
  memberCalc: CalculationResult
): KarmicConnectionEdge {
  const coreDM = coreCalc.bazi.dayMaster;
  const memberDM = memberCalc.bazi.dayMaster;

  const coreYearBranch = coreCalc.bazi.yearPillar.branch;
  const coreDayBranch = coreCalc.bazi.dayPillar.branch;
  const memberYearBranch = memberCalc.bazi.yearPillar.branch;
  const memberDayBranch = memberCalc.bazi.dayPillar.branch;

  const coreFavorable = coreCalc.bazi.favorableElements || [];
  const memberFavorable = memberCalc.bazi.favorableElements || [];

  const coreElement = STEMS[coreDM].element;
  const memberElement = STEMS[memberDM].element;

  // 1. Quý Nhân Check (Thiên Ất Quý Nhân)
  const isMemberNobleForCore = (NOBLE_BRANCHES[coreDM] || []).includes(memberDayBranch) || (NOBLE_BRANCHES[coreDM] || []).includes(memberYearBranch);
  const isCoreNobleForMember = (NOBLE_BRANCHES[memberDM] || []).includes(coreDayBranch) || (NOBLE_BRANCHES[memberDM] || []).includes(coreYearBranch);

  // 2. Tam Hợp / Lục Hợp Check
  const isSanHe = (THREE_HARMONIES[coreYearBranch] || []).includes(memberYearBranch) || (THREE_HARMONIES[coreDayBranch] || []).includes(memberDayBranch);
  const isLiuHe = SIX_COMBINATIONS[coreYearBranch] === memberYearBranch || SIX_COMBINATIONS[coreDayBranch] === memberDayBranch;

  // 3. Lục Xung / Lục Hại Check
  const isClashYear = BRANCH_CLASHES[coreYearBranch] === memberYearBranch;
  const isClashDay = BRANCH_CLASHES[coreDayBranch] === memberDayBranch;
  const isClash = isClashYear || isClashDay;
  const isHarm = BRANCH_HARMS[coreYearBranch] === memberYearBranch || BRANCH_HARMS[coreDayBranch] === memberDayBranch;

  // 4. Ngũ Hành Tương Sinh & Dụng Thần Bù Khuyết
  const memberGivesCoreUseful = coreFavorable.includes(memberElement);
  const coreGivesMemberUseful = memberFavorable.includes(coreElement);

  // 5. Ten God Relations (Thập Thần)
  const tenGodOfMemberToCore = getTenGod(coreDM, memberDM);
  const tenGodOfCoreToMember = getTenGod(memberDM, coreDM);

  // Calculate resonance score (0-100)
  let resonanceScore = 65;
  let giveEnergyScore = 60;
  let receiveEnergyScore = 60;
  const tags: string[] = [];

  if (isMemberNobleForCore) {
    resonanceScore += 18;
    receiveEnergyScore += 25;
    tags.push('Thiên Ất Quý Nhân');
  }
  if (isCoreNobleForMember) {
    resonanceScore += 10;
    giveEnergyScore += 25;
    tags.push('Quý Nhân Của Đối Phương');
  }
  if (isSanHe) {
    resonanceScore += 14;
    giveEnergyScore += 10;
    receiveEnergyScore += 10;
    tags.push('Tam Hợp Cát Khánh');
  }
  if (isLiuHe) {
    resonanceScore += 12;
    giveEnergyScore += 10;
    receiveEnergyScore += 10;
    tags.push('Lục Hợp Tương Sinh');
  }
  if (memberGivesCoreUseful) {
    resonanceScore += 12;
    receiveEnergyScore += 20;
    tags.push(`Tiếp Ứng Dụng Thần (${STEMS[memberDM].nameVi})`);
  }
  if (coreGivesMemberUseful) {
    giveEnergyScore += 20;
    tags.push(`Bạn Dưỡng Mệnh Đối Phương`);
  }
  if (isClash) {
    resonanceScore -= 18;
    tags.push(isClashDay ? 'Xung Chi Ngày' : 'Xung Chi Năm');
  }
  if (isHarm) {
    resonanceScore -= 10;
    tags.push('Lục Hại Năng Lượng');
  }

  // Bounds
  resonanceScore = Math.max(25, Math.min(98, Math.round(resonanceScore)));
  giveEnergyScore = Math.max(20, Math.min(98, Math.round(giveEnergyScore)));
  receiveEnergyScore = Math.max(20, Math.min(98, Math.round(receiveEnergyScore)));

  // Determine Role Archetype
  let roleType: KarmicRoleType = 'TRI_KY_HOA_KHI';
  let roleTitleVi = 'Tri Kỷ Bình An Định Tâm';
  let colorGrade: 'emerald' | 'amber' | 'purple' | 'cyan' | 'rose' = 'cyan';
  let synergyLevel: 'Viên Mãn Đắc Lợi' | 'Tương Sinh Tốt Lành' | 'Bình Hòa Thấu Hiểu' | 'Cần Hòa Giải Bổ Khuyết' = 'Bình Hòa Thấu Hiểu';

  if (isMemberNobleForCore || (resonanceScore >= 88 && memberGivesCoreUseful)) {
    roleType = 'QUY_NHAN_CUU_GIAI';
    roleTitleVi = '👑 Đại Quý Nhân Tương Trợ';
    colorGrade = 'amber';
    synergyLevel = 'Viên Mãn Đắc Lợi';
  } else if (tenGodOfMemberToCore.nameVi.includes('Tài') || tenGodOfMemberToCore.nameVi.includes('Thực') || (isSanHe && resonanceScore >= 80)) {
    roleType = 'TAI_TINH_KHOI_NGHIEP';
    roleTitleVi = '💰 Tài Tinh & Hưng Vượng Doanh Khí';
    colorGrade = 'emerald';
    synergyLevel = 'Viên Mãn Đắc Lợi';
  } else if (isClash || isHarm || resonanceScore < 55) {
    roleType = 'XUNG_KHAC_CAN_DUNG_HOA';
    roleTitleVi = '⚡ Ma Sát Cần Cầu Nối Hòa Giải';
    colorGrade = 'rose';
    synergyLevel = 'Cần Hòa Giải Bổ Khuyết';
  } else if (tenGodOfMemberToCore.nameVi.includes('Sát') || tenGodOfMemberToCore.nameVi.includes('Quan')) {
    roleType = 'DONG_LUC_THU_THACH';
    roleTitleVi = '🛡️ Động Lực Thử Thách & Tôi Luyện';
    colorGrade = 'purple';
    synergyLevel = 'Tương Sinh Tốt Lành';
  } else {
    roleType = 'TRI_KY_HOA_KHI';
    roleTitleVi = '🤝 Đồng Khí Tương Cầu';
    colorGrade = 'cyan';
    synergyLevel = 'Tương Sinh Tốt Lành';
  }

  // Bridging Remedy if Clash
  let bridgingRemedy;
  if (isClash) {
    const clashKey = `${coreYearBranch}-${memberYearBranch}`;
    const reverseKey = `${memberYearBranch}-${coreYearBranch}`;
    const info = CLASH_BRIDGING_MAP[clashKey] || CLASH_BRIDGING_MAP[reverseKey] || {
      element: 'Wood',
      nameVi: 'Mộc',
      advice: 'Dùng ngũ hành trung gian dung hòa giữa hai thái cực năng lượng.'
    };

    bridgingRemedy = {
      requiredElement: info.element,
      nameVi: info.nameVi,
      colorHex: info.element === 'Wood' ? '#10b981' : info.element === 'Water' ? '#0ea5e9' : info.element === 'Metal' ? '#f59e0b' : info.element === 'Fire' ? '#ef4444' : '#d97706',
      tacticalAdvice: info.advice,
      actionableFengShui: `Khi làm việc hoặc bàn chuyện đại sự, khuyên dùng thêm yếu tố hành ${info.nameVi} (vật phẩm, trang phục, hoặc thành viên trung gian hành ${info.nameVi}) để chuyển hóa xung sát.`
    };
  }

  const whatTheyBringToYou = isMemberNobleForCore
    ? `Mang lại quý khí Thiên Ất Quý Nhân cho bạn, khai thông bế tắc và nâng đỡ uy tín công danh.`
    : memberGivesCoreUseful
    ? `Bổ khuyết hành ${ELEMENT_RELATIONS[memberElement].vi} vốn là Dụng Thần bạn đang cần, giúp bạn tĩnh trí và quyết đoán hơn.`
    : isClash
    ? `Tạo phản xạ kích thích tư duy phản biện, giúp bạn nhìn ra những lỗ hổng trong kế hoạch mà người khác không dám nói.`
    : `Tạo môi trường thảo luận cởi mở, thấu hiểu và tôn trọng ranh giới cá nhân của bạn.`;

  const whatYouBringToThem = coreGivesMemberUseful
    ? `Tỏa ra trường khí ${ELEMENT_RELATIONS[coreElement].vi} dưỡng mệnh cho họ, mang lại cảm giác bình yên và tin cậy khi ở cạnh bạn.`
    : isCoreNobleForMember
    ? `Bạn chính là điểm tựa may mắn và người mở khóa cơ hội phát triển cho họ.`
    : `Mang đến góc nhìn thực tế, sự kiên định và định hướng logic cho các dự định chung.`;

  const relTag = memberProfile.tag
    ? (memberProfile.tag === 'family' ? 'Gia đình' : memberProfile.tag === 'partner' ? 'Đối tác' : memberProfile.tag === 'friend' ? 'Bạn bè' : memberProfile.tag)
    : 'Thành viên';

  return {
    targetProfileId: memberProfile.id,
    targetProfileName: memberProfile.name,
    targetRelationshipTag: relTag,
    targetAvatarSeed: memberProfile.avatarSeed || 'member',
    targetColorHex: memberProfile.colorHex,
    roleType,
    roleTitleVi,
    resonanceScore,
    giveEnergyScore,
    receiveEnergyScore,
    dominantInteraction: tenGodOfMemberToCore.nameVi,
    colorGrade,
    whatTheyBringToYou,
    whatYouBringToThem,
    synergyLevel,
    elementalGift: {
      element: memberElement,
      nameVi: ELEMENT_RELATIONS[memberElement].vi,
      isUsefulGodToYou: memberGivesCoreUseful,
      explanation: memberGivesCoreUseful
        ? `Lá số đối phương chủ khí hành ${ELEMENT_RELATIONS[memberElement].vi} — trúng Dụng Thần tương sinh của bạn.`
        : `Lá số đối phương mang hành ${ELEMENT_RELATIONS[memberElement].vi}.`
    },
    bridgingRemedy,
    tags
  };
}

/**
 * Synthesizes the full Karmic Resonance Network across all members.
 */
export function buildKarmicNetworkAnalysis(
  coreProfile: UserProfile,
  coreCalc: CalculationResult,
  memberProfiles: UserProfile[],
  cachedCalculations: Record<string, CalculationResult | null> = {}
): KarmicNetworkAnalysis {
  const otherProfiles = memberProfiles.filter((p) => p.id !== coreProfile.id && p.birthData);

  if (otherProfiles.length === 0) {
    return {
      coreProfileId: coreProfile.id,
      coreProfileName: coreProfile.name,
      totalMembers: 1,
      networkHealthScore: 100,
      energyEquilibrium: 'Hưng Vượng Đắc Khí',
      topBenefactors: [],
      frictionAlerts: [],
      connections: [],
      strategicNetworkAdvice: 'Bạn hiện là hạt nhân trung tâm. Hãy lưu thêm hồ sơ người thân, vợ chồng, con cái hoặc đối tác để kích hoạt Bản Đồ Mạng Lưới Quý Nhân.',
      collectiveStrengths: ['Tự chủ năng lượng bản thân', 'Sẵn sàng mở rộng mạng lưới quý nhân'],
      collectiveVulnerabilities: ['Chưa thiết lập ma trận đối chiếu tập thể']
    };
  }

  const connections: KarmicConnectionEdge[] = [];

  for (const member of otherProfiles) {
    let mCalc = cachedCalculations[member.id];
    if (!mCalc) {
      try {
        mCalc = runFullDestinyCalculation(member.birthData, member.id, 0);
      } catch (err) {
        console.warn(`[KarmicNetwork] Could not calculate for member ${member.name}:`, err);
        continue;
      }
    }

    if (mCalc && mCalc.bazi) {
      const edge = calculateBilateralKarmicEdge(coreProfile, coreCalc, member, mCalc);
      connections.push(edge);
    }
  }

  // Sort connections by resonance score descending
  connections.sort((a, b) => b.resonanceScore - a.resonanceScore);

  const topBenefactors = connections.filter(
    (c) => c.roleType === 'QUY_NHAN_CUU_GIAI' || c.roleType === 'TAI_TINH_KHOI_NGHIEP' || c.resonanceScore >= 80
  );

  const frictionAlerts = connections.filter(
    (c) => c.roleType === 'XUNG_KHAC_CAN_DUNG_HOA' || c.bridgingRemedy !== undefined
  );

  // Calculate average network health
  const totalScore = connections.reduce((sum, c) => sum + c.resonanceScore, 0);
  const avgScore = connections.length > 0 ? Math.round(totalScore / connections.length) : 75;

  let energyEquilibrium: 'Hưng Vượng Đắc Khí' | 'Cân Bằng Hài Hòa' | 'Thiên Lệch Năng Lượng' | 'Cần Bổ Khuyết' = 'Cân Bằng Hài Hòa';
  if (avgScore >= 82) energyEquilibrium = 'Hưng Vượng Đắc Khí';
  else if (avgScore >= 70) energyEquilibrium = 'Cân Bằng Hài Hòa';
  else if (avgScore >= 55) energyEquilibrium = 'Thiên Lệch Năng Lượng';
  else energyEquilibrium = 'Cần Bổ Khuyết';

  const collectiveStrengths: string[] = [];
  const collectiveVulnerabilities: string[] = [];

  if (topBenefactors.length > 0) {
    collectiveStrengths.push(`Có ${topBenefactors.length} Quý Nhân nâng đỡ công danh và kích hoạt dòng tài lộc`);
  }
  if (connections.some((c) => c.elementalGift.isUsefulGodToYou)) {
    collectiveStrengths.push('Hệ thống có thành viên bổ khuyết Dụng Thần ngũ hành đắc lực');
  }
  if (frictionAlerts.length > 0) {
    collectiveVulnerabilities.push(`Xuất hiện ${frictionAlerts.length} nút thắt xung khắc chi cần phương pháp dung hòa ngũ hành`);
  } else {
    collectiveStrengths.push('Không có xung sát cực đoan trong mạng lưới theo dõi');
  }

  let strategicNetworkAdvice = '';
  if (topBenefactors.length > 0 && frictionAlerts.length === 0) {
    strategicNetworkAdvice = `Vòng tròn quan hệ của ${coreProfile.name} đang trong thế 'Thiên thời Địa lợi Nhân hòa'. Hãy chủ động hợp tác sâu với các Quý Nhân để nhân đôi thành quả sự nghiệp.`;
  } else if (frictionAlerts.length > 0) {
    strategicNetworkAdvice = `Mạng lưới có cả Quý Nhân lẫn điểm ma sát. Chiến lược vàng: Tận dụng thế mạnh của Quý Nhân (${topBenefactors.map(b => b.targetProfileName).join(', ') || 'các thành viên cát lợi'}) làm cầu nối hòa giải cho những mối quan hệ có điểm xung khắc.`;
  } else {
    strategicNetworkAdvice = `Mạng lưới duy trì nhịp độ ổn định. Hãy chủ động chia sẻ và thiết lập các mục tiêu chung để chuyển hóa thành liên minh bền vững.`;
  }

  return {
    coreProfileId: coreProfile.id,
    coreProfileName: coreProfile.name,
    totalMembers: otherProfiles.length + 1,
    networkHealthScore: avgScore,
    energyEquilibrium,
    topBenefactors,
    frictionAlerts,
    connections,
    strategicNetworkAdvice,
    collectiveStrengths,
    collectiveVulnerabilities
  };
}

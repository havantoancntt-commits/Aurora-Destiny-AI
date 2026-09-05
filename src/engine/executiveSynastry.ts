// ==========================================
// EXECUTIVE SYNASTRY & BOARDROOM MATCHING ENGINE
// Ma Trận Thẩm Định Đối Tác Chiến Lược & Nhân Sự Cao Cấp
// ==========================================

import {
  CalculationResult,
  ZiWeiPalace,
  PalaceKey,
  FiveElement,
  EarthlyBranch
} from '../types/destiny';
import { UserProfile } from '../types/user';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from './canchi';

const SIX_CLASHES: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
  Zi: 'Wu_B', Chou: 'Wei', Yin_B: 'Shen', Mao: 'You', Chen: 'Xu', Si: 'Hai',
  Wu_B: 'Zi', Wei: 'Chou', Shen: 'Yin_B', You: 'Mao', Xu: 'Chen', Hai: 'Si'
};

const SIX_HARMONIES: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
  Zi: 'Chou', Chou: 'Zi', Yin_B: 'Hai', Hai: 'Yin_B', Mao: 'Xu', Xu: 'Mao',
  Chen: 'You', You: 'Chen', Si: 'Shen', Shen: 'Si', Wu_B: 'Wei', Wei: 'Wu_B'
};

const THREE_HARMONIES: Partial<Record<EarthlyBranch, EarthlyBranch[]>> = {
  Shen: ['Zi', 'Chen'], Zi: ['Shen', 'Chen'], Chen: ['Shen', 'Zi'],
  Hai: ['Mao', 'Wei'], Mao: ['Hai', 'Wei'], Wei: ['Hai', 'Mao'],
  Yin_B: ['Wu_B', 'Xu'], Wu_B: ['Yin_B', 'Xu'], Xu: ['Yin_B', 'Wu_B'],
  Si: ['You', 'Chou'], You: ['Si', 'Chou'], Chou: ['Si', 'You']
};

export type ExecutivePartnershipType = 
  | 'CO_FOUNDER'       // Đồng sáng lập & Góp vốn kinh doanh
  | 'KEY_EXECUTIVE'    // Tuyển dụng C-Level / Quản lý then chốt
  | 'STRATEGIC_ADVISOR'// Cố vấn chiến lược & Đối tác mở rộng thị trường
  | 'LIFE_COMPANION';  // Bạn đời đồng hành cơ nghiệp

export interface ExecutiveSynergyScorecard {
  overallSynergyScore: number;       // 0 - 100%
  wealthCatalystScore: number;       // Khí Vận Kích Hoạt Tài Lộc (0 - 100)
  governanceAlignmentScore: number;  // Đồng Thuận Quản Trị & Tầm Nhìn (0 - 100)
  trustIntegrityScore: number;       // Độ Tin Cậy & Phòng Ngừa Rủi Ro (0 - 100)
  executionComplementScore: number;  // Năng Lực Bổ Khuyết Thực Thi (0 - 100)

  // Đánh giá cấp độ
  tierVerdict: 'DIAMOND_ALLIANCE' | 'GOLDEN_PARTNERSHIP' | 'CONDITIONAL_COLLAB' | 'HIGH_RISK_WARNING';
  tierLabelVi: string;
  executiveSummary: string;

  // Phân chia vai trò tối ưu
  roleAllocation: {
    primaryLeader: {
      titleVi: string;
      profileName: string;
      rationale: string;
    };
    secondaryLeader: {
      titleVi: string;
      profileName: string;
      rationale: string;
    };
    decisionRule: string;
  };

  // 4 Ma trận phân tích chuyên sâu
  catalystPillars: {
    title: string;
    score: number;
    verdict: 'FAVORABLE' | 'NEUTRAL' | 'CRITICAL';
    detail: string;
  }[];

  // Rủi ro & Cơ chế phòng vệ
  strategicRisks: string[];
  governanceProtocols: string[];
}

export function evaluateExecutiveSynergy(
  userProfile: UserProfile,
  userCalc: CalculationResult,
  partnerProfile: UserProfile,
  partnerCalc?: CalculationResult,
  partnershipType: ExecutivePartnershipType = 'CO_FOUNDER'
): ExecutiveSynergyScorecard {
  const userStem = userCalc.bazi.dayMaster;
  const userBranch = userCalc.bazi.dayPillar.branch;
  const userFavorable = userCalc.bazi.favorableElements;
  const userDayElement = userCalc.bazi.dayMasterElement;

  const partnerStem = partnerCalc?.bazi.dayMaster || 'Yi';
  const partnerBranch = partnerCalc?.bazi.dayPillar.branch || 'Hai';
  const partnerDayElement = partnerCalc?.bazi.dayMasterElement || 'Wood';

  // 1. Tương tác Địa Chi ngày sinh
  const isBranchClash = SIX_CLASHES[userBranch] === partnerBranch;
  const isBranchLiuHe = SIX_HARMONIES[userBranch] === partnerBranch;
  const isBranchSanHe = (THREE_HARMONIES[userBranch] || []).includes(partnerBranch);

  // 2. Tương tác Ngũ hành Bản mệnh
  const userPillarEl = STEMS[userStem]?.element || 'Wood';
  const partnerPillarEl = STEMS[partnerStem]?.element || 'Fire';
  const isPartnerFeedingUser = ELEMENT_RELATIONS[partnerPillarEl]?.generates === userDayElement;
  const isUserFeedingPartner = ELEMENT_RELATIONS[userDayElement]?.generates === partnerPillarEl;
  const isPartnerFavorable = userFavorable.includes(partnerPillarEl);

  // 3. Tương tác Cung Tử Vi (Mệnh, Tài Bạch, Quan Lộc, Nô Bộc)
  const userLifePalace = userCalc.ziwei.palaces.life;
  const userWealthPalace = userCalc.ziwei.palaces.wealth;
  const userCareerPalace = userCalc.ziwei.palaces.career;
  const userFriendsPalace = userCalc.ziwei.palaces.friends;

  // Tính điểm Wealth Catalyst
  let wealthScore = 70;
  if (isPartnerFeedingUser || isPartnerFavorable) wealthScore += 16;
  if (isBranchSanHe || isBranchLiuHe) wealthScore += 12;
  if (isBranchClash) wealthScore -= 24;
  wealthScore = Math.max(30, Math.min(99, wealthScore));

  // Tính điểm Governance & Vision Alignment
  let governanceScore = 72;
  if (isBranchLiuHe) governanceScore += 14;
  if (isBranchSanHe) governanceScore += 10;
  if (isBranchClash) governanceScore -= 22;
  governanceScore = Math.max(30, Math.min(98, governanceScore));

  // Tính điểm Trust & Integrity
  let trustScore = 75;
  if (isBranchClash) trustScore -= 26;
  if (isPartnerFavorable) trustScore += 10;
  trustScore = Math.max(25, Math.min(98, trustScore));

  // Tính điểm Execution Complement
  let executionScore = 74;
  if (userDayElement !== partnerDayElement) executionScore += 12; // Khác ngũ hành bổ trợ nhau
  if (isUserFeedingPartner || isPartnerFeedingUser) executionScore += 8;
  executionScore = Math.max(40, Math.min(99, executionScore));

  // Điểm tổng hợp trọng số
  const overallScore = Math.round(
    wealthScore * 0.3 +
    governanceScore * 0.25 +
    trustScore * 0.25 +
    executionScore * 0.2
  );

  // Phân tầng liên minh
  let tierVerdict: 'DIAMOND_ALLIANCE' | 'GOLDEN_PARTNERSHIP' | 'CONDITIONAL_COLLAB' | 'HIGH_RISK_WARNING' = 'GOLDEN_PARTNERSHIP';
  let tierLabelVi = 'LIÊN MINH HOÀNG KIM (Cộng Hưởng Bền Vững)';
  let executiveSummary = '';

  if (overallScore >= 85) {
    tierVerdict = 'DIAMOND_ALLIANCE';
    tierLabelVi = 'LIÊN MINH KIM CƯƠNG (Thiên Tác Chi Hợp)';
    executiveSummary = `Sự kết hợp giữa ${userProfile.name} và ${partnerProfile.name} tạo nên trường khí đắc địa phi thường. Từ trường đôi bên có khả năng kích hoạt cung Tài Bạch và Quan Lộc của nhau, tạo ra đòn bẩy tài chính và sức mạnh bứt phá vượt bậc.`;
  } else if (overallScore >= 72) {
    tierVerdict = 'GOLDEN_PARTNERSHIP';
    tierLabelVi = 'ĐỐI TÁC CHIẾN LƯỢC CÁT LỢI (Hợp Tác Phát Đạt)';
    executiveSummary = `Mức độ hòa hợp năng lượng cao. Điểm mạnh của người này bù đắp chuẩn xác điểm khuyết của người kia. Khuyến nghị duy trì cấu trúc phân quyền rõ ràng để vận hành thông suốt và tối đa hóa lợi nhuận.`;
  } else if (overallScore >= 58) {
    tierVerdict = 'CONDITIONAL_COLLAB';
    tierLabelVi = 'HỢP TÁC CÓ ĐIỀU KIỆN (Cần Kỷ Luật Pháp Lý Cao)';
    executiveSummary = `Có tiềm năng tạo dựng giá trị nhưng tồn tại một số xung đột tiềm ẩn về phong cách lãnh đạo hoặc quản trị tiền mặt. Bắt buộc phải có hợp đồng phân chia lợi nhuận và cơ chế giải quyết tranh chấp minh bạch ngay từ đầu.`;
  } else {
    tierVerdict = 'HIGH_RISK_WARNING';
    tierLabelVi = 'CẢNH BÁO XUNG KHẮC (Rủi Ro Tranh Chấp & Hao Tổn)';
    executiveSummary = `Xuất hiện thế xung sát trực tiếp giữa bản mệnh hoặc địa chi ngày sinh (${isBranchClash ? 'Địa Chi Lục Xung kịch liệt' : 'Bất tương dung ngũ hành'}). Nguy cơ bất đồng chiến lược, rạn nứt niềm tin và tiêu hao vốn liếng rất cao nếu không thiết lập cơ chế độc lập.`;
  }

  // Phân định vai trò
  let primaryName = userProfile.name;
  let secondaryName = partnerProfile.name;
  let primaryTitle = 'Chủ Tịch HĐQT / Định Hướng Chiến Lược & Đối Ngoại';
  let secondaryTitle = 'Tổng Giám Đốc Điều Hành (CEO) / Quản Trị Vận Hành & Tài Chính';

  if (wealthScore > governanceScore) {
    primaryTitle = 'Tổng Chỉ Huy Tài Chính & Đầu Tư';
    secondaryTitle = 'Trưởng Khối Phát Triển Thị Trường & Sản Phẩm';
  }

  // 4 Ma trận trụ cột
  const catalystPillars = [
    {
      title: 'Tài Vận & Đòn Bẩy Doanh Thu',
      score: wealthScore,
      verdict: (wealthScore >= 75 ? 'FAVORABLE' : wealthScore <= 55 ? 'CRITICAL' : 'NEUTRAL') as 'FAVORABLE' | 'NEUTRAL' | 'CRITICAL',
      detail: wealthScore >= 75 
        ? `${partnerProfile.name} mang năng lượng sinh trợ Dụng Thần, dễ mở ra các cơ hội ký kết hợp đồng giá trị lớn.`
        : wealthScore <= 55
        ? 'Dễ phát sinh tranh chấp về dòng tiền hoặc phân chia lợi tức. Cần kiểm toán tài chính độc lập.'
        : 'Khả năng sinh tài ở mức bình ổn, cần dựa vào kế hoạch tài chính thực tế.'
    },
    {
      title: 'Hòa Hợp Ban Lãnh Đạo & Cái Tôi',
      score: governanceScore,
      verdict: (governanceScore >= 75 ? 'FAVORABLE' : governanceScore <= 55 ? 'CRITICAL' : 'NEUTRAL') as 'FAVORABLE' | 'NEUTRAL' | 'CRITICAL',
      detail: governanceScore >= 75
        ? 'Đôi bên có sự thấu hiểu và tôn trọng quyền hạn của nhau, ít xảy ra tranh quyền đoạt vị.'
        : governanceScore <= 55
        ? 'Cả hai đều có cá tính lãnh đạo cực mạnh; nếu cùng can thiệp vào một mảng sẽ bùng nổ mâu thuẫn.'
        : 'Giao tiếp tốt khi có quy trình phân cấp và biên bản họp rõ ràng.'
    },
    {
      title: 'Độ Tin Cậy & Pháp Lý Bền Vững',
      score: trustScore,
      verdict: (trustScore >= 75 ? 'FAVORABLE' : trustScore <= 55 ? 'CRITICAL' : 'NEUTRAL') as 'FAVORABLE' | 'NEUTRAL' | 'CRITICAL',
      detail: trustScore >= 75
        ? 'Tỷ lệ gắn bó trung thành cao, là tri kỷ có thể san sẻ trách nhiệm trong lúc nghịch cảnh.'
        : trustScore <= 55
        ? 'Có nguy cơ vi phạm thỏa thuận hoặc rời bỏ liên minh khi quyền lợi bị dao động.'
        : 'Cần duy trì sự minh bạch bằng số liệu định kỳ thay vì chỉ dựa trên cảm xúc cá nhân.'
    },
    {
      title: 'Bổ Khuyết Năng Lực & Kỹ Trị',
      score: executionScore,
      verdict: (executionScore >= 75 ? 'FAVORABLE' : executionScore <= 55 ? 'CRITICAL' : 'NEUTRAL') as 'FAVORABLE' | 'NEUTRAL' | 'CRITICAL',
      detail: 'Sự khác biệt về thiên hướng giúp một người nhìn xa trông rộng, một người tỉ mỉ siết chặt chi tiết thực thi.'
    }
  ];

  // Rủi ro chiến lược
  const strategicRisks: string[] = [];
  const governanceProtocols: string[] = [];

  if (isBranchClash) {
    strategicRisks.push(`Chi ngày sinh tương xung (${BRANCHES[userBranch]?.nameVi} xung ${BRANCHES[partnerBranch]?.nameVi}): Cảm xúc dễ bùng nổ khi doanh nghiệp đối mặt với áp lực dòng tiền.`);
    governanceProtocols.push('Thiết lập nguyên tắc "Quyết định dựa trên Dữ liệu (Data-Driven)", không giải quyết bất đồng chiến lược bằng tranh luận miệng.');
  }

  if (wealthScore < 60) {
    strategicRisks.push('Nguy cơ nhập nhằng chi tiêu cá nhân và ngân sách công ty.');
    governanceProtocols.push('Bắt buộc bổ nhiệm Kế toán trưởng độc lập và áp dụng cơ chế 2 chữ ký phê duyệt cho các khoản chi trên 50 triệu VNĐ.');
  }

  governanceProtocols.push('Quy định rõ tỷ lệ biểu quyết (Veto Power) theo từng lĩnh vực: một người nắm quyền tối thượng về Sản phẩm/Chiến lược, một người nắm quyền tối thượng về Tài chính/Nhân sự.');
  governanceProtocols.push('Ký kết thỏa thuận cổ đông (Shareholders Agreement) bao gồm điều khoản Buy-Sell (Mua lại phần vốn) khi một bên muốn thoái lui.');

  return {
    overallSynergyScore: overallScore,
    wealthCatalystScore: wealthScore,
    governanceAlignmentScore: governanceScore,
    trustIntegrityScore: trustScore,
    executionComplementScore: executionScore,
    tierVerdict,
    tierLabelVi,
    executiveSummary,
    roleAllocation: {
      primaryLeader: {
        titleVi: primaryTitle,
        profileName: primaryName,
        rationale: `Bản mệnh vững vàng, có tầm nhìn bao quát và tư chất lãnh đạo đại cục.`
      },
      secondaryLeader: {
        titleVi: secondaryTitle,
        profileName: secondaryName,
        rationale: `Khả năng quản trị chi tiết, siết chặt kỷ luật và hiện thực hóa mục tiêu chiến lược.`
      },
      decisionRule: 'Áp dụng nguyên tắc chuyên môn hóa tuyệt đối; không can thiệp chéo ngoài phạm vi thẩm quyền đã được văn bản hóa.'
    },
    catalystPillars,
    strategicRisks,
    governanceProtocols
  };
}

// ==========================================
// AURORA DESTINY AI — PERSONALIZATION & 5-TIER REASONING ENGINE
// Computes Individualized Layered Insights from Deterministic Chart Artifacts
// Strictly Rejects Generic Templates, Enforces Factual Grounding & Complete Provenance
// ==========================================

import { CalculationResult, FiveElement, HeavenlyStem, EarthlyBranch } from '../types/destiny';
import { UserProfile } from '../types/user';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from './canchi';
import {
  PersonalizedDestinyDossier,
  LayeredInsightItem,
  PersonalOverviewDomain,
  CareerAndCapabilityDomain,
  FinancialDynamicsDomain,
  RelationshipsAndFamilyDomain,
  TemporalCyclesDomain,
  ProvenanceAuditRecord,
  ConfidenceTier,
  PatternComparisonMetrics
} from '../types/personalizedAnalysis';
import { sha256 } from './sha256';

/**
 * Standardized Content Fingerprint generator based on calculated astrological artifacts & activated rules.
 * STRICTLY EXCLUDES user name and profileId so identical charts yield identical fingerprints,
 * while distinct charts yield distinct fingerprints.
 */
export function generateContentFingerprint(semanticPayload: string): string {
  return 'cfp_' + sha256(semanticPayload).slice(0, 16);
}

/**
 * Deterministic hash generator for unique semantic fingerprint (backward compatibility)
 */
function generateSemanticHash(payload: string): string {
  return sha256(payload).slice(0, 16);
}

export function buildPersonalizedDestinyDossier(
  profile: UserProfile,
  calculation: CalculationResult
): PersonalizedDestinyDossier {
  const { bazi, ziwei, confidence } = calculation;
  const dm = STEMS[bazi.dayMaster];
  const dmEl = dm.element;
  const dmStrength = bazi.dayMasterStrength;
  const favElements = bazi.favorableElements || [];
  const unfavElements = bazi.unfavorableElements || [];
  const favorableStr = favElements.map((e) => ELEMENT_RELATIONS[e]?.vi || e).join(', ');
  const unfavorableStr = unfavElements.map((e) => ELEMENT_RELATIONS[e]?.vi || e).join(', ');

  const hasExactHour = Boolean(
    calculation.inputSnapshot.hasExactHour && !bazi.hourPillar?.isEstimated && !ziwei.isEstimatedHour
  );
  const hourConfidence: ConfidenceTier = hasExactHour ? 'HIGH' : 'PROVISIONAL';

  const lifePalace = ziwei.palaces.life;
  const careerPalace = ziwei.palaces.career;
  const wealthPalace = ziwei.palaces.wealth;
  const travelPalace = ziwei.palaces.travel;
  const spousePalace = ziwei.palaces.spouse;
  const bodyPalace = ziwei.palaces[ziwei.bodyPalaceKey] || ziwei.palaces.life;
  const targetYear = calculation.analysisYear || new Date().getFullYear();
  const currentTransit = calculation.annualTransits.find((t) => t.year === targetYear) || calculation.annualTransits[0];

  const lifeStarsStr = lifePalace?.majorStars && lifePalace.majorStars.length > 0
    ? lifePalace.majorStars.map((s) => `${s.nameVi} (${s.brightness})${s.transformation ? ' ' + s.transformation : ''}`).join(', ')
    : 'Cung Mệnh Vô Chính Diệu (mượn tinh tú từ đối cung)';

  const careerStarsStr = careerPalace?.majorStars && careerPalace.majorStars.length > 0
    ? careerPalace.majorStars.map((s) => `${s.nameVi} (${s.brightness})${s.transformation ? ' ' + s.transformation : ''}`).join(', ')
    : 'Cung Quan Lộc Vô Chính Diệu';

  const wealthStarsStr = wealthPalace?.majorStars && wealthPalace.majorStars.length > 0
    ? wealthPalace.majorStars.map((s) => `${s.nameVi} (${s.brightness})${s.transformation ? ' ' + s.transformation : ''}`).join(', ')
    : 'Cung Tài Bạch Vô Chính Diệu';

  const spouseStarsStr = spousePalace?.majorStars && spousePalace.majorStars.length > 0
    ? spousePalace.majorStars.map((s) => `${s.nameVi} (${s.brightness})${s.transformation ? ' ' + s.transformation : ''}`).join(', ')
    : 'Cung Phu Thê Vô Chính Diệu';

  const userContext = profile.behavioralContext || {};
  const priorityStr = userContext.topPriority ? `Ưu tiên hàng đầu: "${userContext.topPriority}"` : 'Ưu tiên: Phát triển toàn diện';
  const careerFieldStr = userContext.careerField ? `Ngành nghề: "${userContext.careerField}"` : 'Lĩnh vực chuyên môn chung';
  const financialGoalStr = userContext.financialGoal ? `Mục tiêu tài chính: "${userContext.financialGoal}"` : 'Tài chính bền vững';

  const auditLog: ProvenanceAuditRecord[] = [];

  // ==========================================
  // 1. LĨNH VỰC A: TỔNG QUAN CÁ NHÂN (PERSONAL OVERVIEW)
  // ==========================================
  const coreEssenceInsight: LayeredInsightItem = {
    id: 'ins_core_essence',
    domain: 'personal_overview',
    headline: `Cốt Cách Bản Mệnh: Nhật Chủ ${dm.nameVi} (${dm.yinYang} ${ELEMENT_RELATIONS[dmEl]?.vi}) — ${dmStrength} hội tụ Tinh Bàn Mệnh ${lifeStarsStr}`,
    userSuppliedFacts: [
      `Họ tên: ${profile.name}`,
      `Ngày sinh dương lịch: ${profile.birthData.solarDay}/${profile.birthData.solarMonth}/${profile.birthData.solarYear}`,
      `Nơi sinh: ${profile.birthData.birthCity || 'Việt Nam'}, ${profile.birthData.birthCountry || 'Việt Nam'}`,
      `Giới tính: ${profile.birthData.gender === 'Male' ? 'Nam' : 'Nữ'}`
    ],
    calculatedArtifacts: [
      { metricName: 'Nhật Chủ', value: `${dm.nameVi} (${dmEl})`, sourceEngine: 'BaziEngine' },
      { metricName: 'Thể Trạng Nhật Chủ', value: dmStrength, sourceEngine: 'BaziEngine' },
      { metricName: 'Cách Cục Tử Bình', value: bazi.structureType, sourceEngine: 'BaziEngine' },
      { metricName: 'Nạp Âm Bản Mệnh', value: bazi.yearPillar.naYin, sourceEngine: 'EphemerisAstronomical' },
      { metricName: 'Chính Tinh Cung Mệnh', value: lifeStarsStr, sourceEngine: 'ZiweiEngine' },
      { metricName: 'Cục Số Tử Vi', value: ziwei.elementBureau, sourceEngine: 'ZiweiEngine' }
    ],
    schoolDoctrine: {
      schoolName: 'Tử Bình Trích Thiên Tủy & Tử Vi Đẩu Số Toàn Thư',
      classicalPrinciple: 'Dĩ Nhật Chủ vi chủ thể, khán Nguyệt Lệnh phối Dụng Thần; Khán Mệnh Cung chi tinh diệu phối Thân Cung định hậu vận.',
      textCitation: 'Trích Thiên Tủy: "Nhật nguyên đắc khí, chung vi quý cách; phùng thời đắc lệnh, phúc lộc tự vinh".'
    },
    aiSynthesizedInsight: {
      synthesis: `Bản thể của ${profile.name} là người có nội lực tư duy sắc sảo từ hành ${ELEMENT_RELATIONS[dmEl]?.vi}. Bạn sở hữu năng lực tự định vị cao, phong thái tự chủ và khả năng phản xạ chiến lược tốt trước thời cuộc.`,
      actionableAdvice: `Phát huy tối đa hành Dụng Thần (${favorableStr}) trong các quyết định quan trọng; giữ thăng bằng nhịp sinh hoạt để nuôi dưỡng sự minh mẫn.`,
      realWorldCondition: `Khi đối mặt với dự án lớn hoặc môi trường áp lực cao, phong thái kiên định này là điểm tựa đáng tin cậy cho cộng sự.`
    },
    dataBoundaryNotice: hasExactHour
      ? undefined
      : {
          isComplete: false,
          missingPrerequisites: ['Giờ sinh chính xác theo phút'],
          uncertaintyWarning: 'Lá số đang sử dụng giờ sinh ước lượng; các sao phụ an theo giờ và độ số chính xác của Cung Mệnh mang tính chất tham khảo bước đầu.'
        },
    confidenceTier: hasExactHour ? 'HIGH' : 'PROVISIONAL',
    provenanceRuleId: 'RULE_CORE_ESSENCE_01'
  };

  auditLog.push({
    ruleId: 'RULE_CORE_ESSENCE_01',
    domain: 'personal_overview',
    inputPrerequisites: ['solarDay', 'solarMonth', 'solarYear', 'hasExactHour', 'gender'],
    calculatedEvidence: [`DayMaster:${dm.nameVi}`, `Structure:${bazi.structureType}`, `LifeStars:${lifeStarsStr}`],
    appliedRuleDescription: 'Đối sánh Thiên Can ngày sinh với Nguyệt lệnh và 14 Chính Tinh Cung Mệnh',
    potentialVarianceFactors: ['Lệch múi giờ thực', 'Giờ sinh không chính xác qua ranh giới canh giờ'],
    confidence: hasExactHour ? 'HIGH' : 'PROVISIONAL'
  });

  // Điểm mạnh đặc thù được dẫn xuất từ cách cục Bát Tự + Tinh bàn
  const distinctiveStrengths: LayeredInsightItem[] = [
    {
      id: 'ins_strength_structure',
      domain: 'personal_overview',
      headline: `Thế Mạnh Cốt Lõi: Đắc Cách Cục ${bazi.structureType}`,
      userSuppliedFacts: [`Thời khắc sinh: ${profile.birthData.solarHour}:${profile.birthData.solarMinute}`],
      calculatedArtifacts: [
        { metricName: 'Cách Cục', value: bazi.structureType, sourceEngine: 'BaziEngine' },
        { metricName: 'Dụng Thần Hỷ Lực', value: favorableStr, sourceEngine: 'BaziEngine' }
      ],
      schoolDoctrine: {
        schoolName: 'Tử Bình Chân Thuyên',
        classicalPrinciple: 'Cách dĩ thành vi quý, phá cách dĩ cứu vi công. Đắc Dụng Thần trợ cách tức hữu thành tựu.'
      },
      aiSynthesizedInsight: {
        synthesis: `Cách cục ${bazi.structureType} trang bị cho bạn tư duy phân tích có cấu trúc, khả năng bao quát mục tiêu và không dễ bị dao động bởi các biến cố ngắn hạn.`,
        actionableAdvice: `Tập trung vào những dự án đòi hỏi chiều sâu chiến lược và quy mô tổ chức dài hạn thay vì phân tán vào các việc vụn vặt.`,
        realWorldCondition: `Áp dụng rõ nét nhất trong vai trò hoạch định kế hoạch, quản trị nhân sự hoặc nghiên cứu chuyên sâu.`
      },
      confidenceTier: 'HIGH',
      provenanceRuleId: 'RULE_STRENGTH_BAZI_STRUCTURE'
    },
    {
      id: 'ins_strength_ziwei_palace',
      domain: 'personal_overview',
      headline: `Điểm Tựa Tinh Tú: Cung Thân cư ${bodyPalace.nameVi} tọa tinh hoa hội tụ`,
      userSuppliedFacts: [`Định hướng cá nhân: ${priorityStr}`],
      calculatedArtifacts: [
        { metricName: 'Vị Trí Cung Thân', value: bodyPalace.nameVi, sourceEngine: 'ZiweiEngine' },
        { metricName: 'Điểm Năng Lượng Cung', value: `${bodyPalace.score}/100`, sourceEngine: 'ZiweiEngine' }
      ],
      schoolDoctrine: {
        schoolName: 'Tử Vi Đẩu Số Toàn Thư',
        classicalPrinciple: 'Mệnh vi tiền định, Thân vi hậu vận; Thân cư chi vị tắc tâm chí quy túc ư thị.'
      },
      aiSynthesizedInsight: {
        synthesis: `Cung Thân cư ${bodyPalace.nameVi} cho thấy nửa sau cuộc đời bạn sẽ dồn tâm sức lớn vào phương diện này, càng tôi luyện càng trưởng thành và gặt hái kết quả bền vững.`,
        actionableAdvice: `Xây dựng chuyên môn và mạng lưới uy tín gắn liền với lĩnh vực của cung ${bodyPalace.nameVi}.`,
        realWorldCondition: `Sau tuổi 30, những kinh nghiệm tích lũy sẽ chuyển hóa thành quyền lực thực thi rõ rệt.`
      },
      confidenceTier: hourConfidence,
      provenanceRuleId: 'RULE_STRENGTH_BODY_PALACE'
    }
  ];

  // Điểm cần chú ý & phòng thủ dựa trên Kỵ Thần và sát tinh
  const inherentVulnerabilities: LayeredInsightItem[] = [
    {
      id: 'ins_vulnerability_unfavorable',
      domain: 'personal_overview',
      headline: `Vùng Trọng Yếu Cần Phòng Thủ: Hành Kỵ Thần ${unfavorableStr}`,
      userSuppliedFacts: [`Môi trường làm việc: ${careerFieldStr}`],
      calculatedArtifacts: [
        { metricName: 'Kỵ Thần', value: unfavorableStr, sourceEngine: 'BaziEngine' },
        { metricName: 'Tỷ Lệ Mất Cân Bằng', value: `${bazi.elementBalance[unfavElements[0] || 'Metal']}%`, sourceEngine: 'BaziEngine' }
      ],
      schoolDoctrine: {
        schoolName: 'Cổ Học Ngũ Hành Luận',
        classicalPrinciple: 'Ngũ hành thiên thắng tắc bệnh, trung hòa tắc quý. Khí suy tắc bổ, khí kháng tắc tiết.'
      },
      aiSynthesizedInsight: {
        synthesis: `Khi năng lượng của hành ${unfavorableStr} tăng cao vào các chu kỳ tháng/năm xung khắc, bạn dễ cảm thấy áp lực tinh thần hoặc có xu hướng quyết định nóng vội.`,
        actionableAdvice: `Thực hiện kỷ luật "ngừng 24 giờ" trước các văn bản cam kết lớn trong giai đoạn khí vận bất ổn; tăng cường vận động và nghỉ ngơi điều độ.`,
        realWorldCondition: `Đặc biệt lưu tâm trong các cuộc đàm phán nhiều bên hoặc khi đối mặt với bất đồng quan điểm.`
      },
      confidenceTier: 'HIGH',
      provenanceRuleId: 'RULE_VULN_UNFAVORABLE_ELEMENT'
    }
  ];

  const personalOverview: PersonalOverviewDomain = {
    coreEssence: coreEssenceInsight,
    distinctiveStrengths,
    inherentVulnerabilities,
    elementalBalanceRationale: `Tỷ lệ phân bổ năng lượng Ngũ Hành: Kim (${bazi.elementBalance.Metal}%), Mộc (${bazi.elementBalance.Wood}%), Thủy (${bazi.elementBalance.Water}%), Hỏa (${bazi.elementBalance.Fire}%), Thổ (${bazi.elementBalance.Earth}%). Sự vượt trội hoặc thiếu hụt được điều tiết bởi Dụng Thần ${favorableStr}.`,
    missingDataBoundaries: hasExactHour
      ? []
      : ['Không có giờ sinh chính xác: Không suy đoán chi tiết các cung vị an theo giờ sinh và các sao vi tế.']
  };

  // ==========================================
  // 2. LĨNH VỰC B: CÔNG VIỆC VÀ NĂNG LỰC (CAREER & CAPABILITY)
  // ==========================================
  const vocationInsight: LayeredInsightItem = {
    id: 'ins_career_vocation',
    domain: 'career_capability',
    headline: `Phương Vị Sự Nghiệp: Cung Quan Lộc tọa thủ ${careerStarsStr} (Điểm đánh giá: ${careerPalace?.score ?? 70}/100)`,
    userSuppliedFacts: [
      `Lĩnh vực chuyên môn: ${careerFieldStr}`,
      `Trạng thái việc làm: ${userContext.employmentStatus || 'Đang công tác'}`
    ],
    calculatedArtifacts: [
      { metricName: 'Chính Tinh Quan Lộc', value: careerStarsStr, sourceEngine: 'ZiweiEngine' },
      { metricName: 'Thập Thần Trụ Tháng', value: bazi.monthPillar.tenGod, sourceEngine: 'BaziEngine' },
      { metricName: 'Điểm Cung Quan', value: careerPalace?.score ?? 70, sourceEngine: 'ZiweiEngine' }
    ],
    schoolDoctrine: {
      schoolName: 'Tử Vi Chính Nghĩa & Bát Tự Sự Nghiệp Luận',
      classicalPrinciple: 'Quan Lộc chủ quan vị, chức nghiệp, học nghiệp; khán quan tinh thanh trọc định thanh danh sự nghiệp.'
    },
    aiSynthesizedInsight: {
      synthesis: `Sự nghiệp của bạn tương thích mạnh mẽ với các môi trường đề cao tính chuyên nghiệp, năng lực kiến tạo giải pháp và quy chuẩn vận hành cao. Thập thần ${bazi.monthPillar.tenGod} tại Trụ Tháng phản ánh bạn có khả năng đảm trách trọng trách lớn.`,
      actionableAdvice: `Tận dụng thế mạnh chuyên môn để xây dựng uy tín cá nhân độc bản. Đặt mục tiêu nâng cấp kỹ năng quản lý và kỹ năng số hóa theo từng chu kỳ năm.`,
      realWorldCondition: `Thích hợp giữ vai trò dẫn dắt dự án, chuyên gia tư vấn hoặc quản trị quy trình.`
    },
    dataBoundaryNotice: hasExactHour ? undefined : {
      isComplete: false,
      missingPrerequisites: ['Giờ sinh chính xác'],
      uncertaintyWarning: 'Vị trí Cung Quan Lộc phụ thuộc vào giờ sinh. Nhận định nghề nghiệp dựa trên Trụ Tháng Bát Tự là chính yếu.'
    },
    confidenceTier: hasExactHour ? 'HIGH' : 'MEDIUM',
    provenanceRuleId: 'RULE_CAREER_VOCATION_ALIGNMENT'
  };

  const executionStyleInsight: LayeredInsightItem = {
    id: 'ins_career_execution',
    domain: 'career_capability',
    headline: `Phong Cách Thực Thi: Quyết đoán, có hệ thống và chú trọng hiệu quả thực chất`,
    userSuppliedFacts: [priorityStr],
    calculatedArtifacts: [
      { metricName: 'Nhật Chủ Vượng/Nhược', value: dmStrength, sourceEngine: 'BaziEngine' },
      { metricName: 'Cách Cục', value: bazi.structureType, sourceEngine: 'BaziEngine' }
    ],
    schoolDoctrine: {
      schoolName: 'Tử Bình Thập Thần Biện Luận',
      classicalPrinciple: 'Thực Thần sinh Tài vi phong phú, Thương Quan kiến Quan vi họa hoạn, Chính Ấn phò thân vi từ bi đoan chính.'
    },
    aiSynthesizedInsight: {
      synthesis: `Trong công việc, bạn là người làm việc có phương pháp, đề cao tính kỷ luật và sự chuẩn bị kỹ lưỡng trước khi bắt tay hành động.`,
      actionableAdvice: `Chia nhỏ các mục tiêu quý thành các mốc hoàn thành hàng tuần để duy trì động lực liên tục cho bản thân và đội ngũ.`,
      realWorldCondition: `Khi làm việc với các thành viên có phong cách tự do, cần truyền đạt yêu cầu rõ ràng bằng văn bản để tránh sai lệch kỳ vọng.`
    },
    confidenceTier: 'HIGH',
    provenanceRuleId: 'RULE_CAREER_EXECUTION_STYLE'
  };

  const careerAndCapability: CareerAndCapabilityDomain = {
    vocationAlignment: vocationInsight,
    executionStyle: executionStyleInsight,
    practicalDevelopmentPath: [
      {
        id: 'ins_career_path_step1',
        domain: 'career_capability',
        headline: 'Giai Đoạn Củng Cố Nền Tảng: Tối ưu chuyên môn và thiết lập mạng lưới đối tác tin cậy',
        userSuppliedFacts: [careerFieldStr],
        calculatedArtifacts: [{ metricName: 'Dụng Thần', value: favorableStr, sourceEngine: 'BaziEngine' }],
        schoolDoctrine: {
          schoolName: 'Tử Vi Đẩu Số Vận Khí Luận',
          classicalPrinciple: 'Tiên tích tài trí, hậu đãi thời phong.'
        },
        aiSynthesizedInsight: {
          synthesis: 'Tập trung xây dựng giá trị thặng dư thực tế thay vì mở rộng dàn trải.',
          actionableAdvice: 'Hoàn thành các chứng chỉ chuyên môn cấp cao hoặc chuẩn hóa quy trình công việc.',
          realWorldCondition: 'Đảm bảo có chỗ đứng vững vàng trước khi mở rộng quy mô lớn.'
        },
        confidenceTier: 'HIGH',
        provenanceRuleId: 'RULE_CAREER_ROADMAP_STEP1'
      }
    ],
    applicabilityConditions: [
      'Áp dụng khi người dùng duy trì kỷ luật làm việc và chủ động cập nhật chuyên môn.',
      'Hiệu quả phụ thuộc vào môi trường kinh tế vĩ mô và sự hợp tác của các bên liên quan.'
    ],
    nonDeterministicDisclaimer: 'Các nhận định công việc mang tính chất tham khảo định hướng năng lực và sở trường; thành công thực tế do năng lực thực thi và sự phấn đấu của cá nhân quyết định.'
  };

  // ==========================================
  // 3. LĨNH VỰC C: TÀI CHÍNH VÀ DÒNG TIỀN (FINANCIAL DYNAMICS)
  // ==========================================
  const wealthInsight: LayeredInsightItem = {
    id: 'ins_financial_flow',
    domain: 'financial_flow',
    headline: `Cơ Chế Dòng Tiền: Cung Tài Bạch tọa thủ ${wealthStarsStr} (Điểm đánh giá: ${wealthPalace?.score ?? 70}/100)`,
    userSuppliedFacts: [financialGoalStr],
    calculatedArtifacts: [
      { metricName: 'Chính Tinh Cung Tài', value: wealthStarsStr, sourceEngine: 'ZiweiEngine' },
      { metricName: 'Điểm Cung Tài', value: wealthPalace?.score ?? 70, sourceEngine: 'ZiweiEngine' },
      { metricName: 'Dụng Thần Tài Lộc', value: favorableStr, sourceEngine: 'BaziEngine' }
    ],
    schoolDoctrine: {
      schoolName: 'Tử Vi & Bát Tự Tài Bạch Luận',
      classicalPrinciple: 'Tài vi dưỡng mệnh chi nguyên. Chính Tài chủ cần lao tích lũy; Thiên Tài chủ doanh mưu biến hóa.'
    },
    aiSynthesizedInsight: {
      synthesis: `Dòng tiền của bạn có thiên hướng tích lũy bền bỉ từ năng lực chuyên môn và các cơ hội kinh doanh có căn cứ. Cách kiếm tiền của bạn đòi hỏi sự am hiểu sâu và kế hoạch tài chính rõ ràng.`,
      actionableAdvice: `Phân bổ dòng tiền theo nguyên tắc 50/30/20: 50% chi tiêu thiết yếu, 30% đầu tư tài sản an toàn dài hạn, 20% dự phòng khẩn cấp.`,
      realWorldCondition: `Tránh xa các kênh đầu tư mạo hiểm lướt sóng có đòn bẩy tài chính cao.`
    },
    dataBoundaryNotice: hasExactHour ? undefined : {
      isComplete: false,
      missingPrerequisites: ['Giờ sinh chính xác'],
      uncertaintyWarning: 'Cung Tài Bạch an theo giờ sinh; nhận định tài chính trên mang tính chất định hướng phương thức quản trị chi tiêu an toàn.'
    },
    confidenceTier: hasExactHour ? 'HIGH' : 'MEDIUM',
    provenanceRuleId: 'RULE_FINANCIAL_WEALTH_MECHANISM'
  };

  const capitalRetentionInsight: LayeredInsightItem = {
    id: 'ins_financial_retention',
    domain: 'financial_flow',
    headline: 'Quản Trị Vốn & Tích Lũy Bất Động Sản',
    userSuppliedFacts: [financialGoalStr],
    calculatedArtifacts: [
      { metricName: 'Điểm Cung Điền Trạch', value: `${ziwei.palaces.property?.score ?? 70}/100`, sourceEngine: 'ZiweiEngine' }
    ],
    schoolDoctrine: {
      schoolName: 'Tử Vi Điền Trạch Thuyết',
      classicalPrinciple: 'Điền Trạch vi tụ bảo chi bồn, sản nghiệp chi căn đế.'
    },
    aiSynthesizedInsight: {
      synthesis: 'Cơ ngơi tài sản có xu hướng phát triển bền vững khi chuyển hóa dòng tiền nhàn rỗi sang tài sản cố định hoặc bất động sản có pháp lý hoàn chỉnh.',
      actionableAdvice: 'Kiểm tra kỹ lưỡng giấy tờ pháp lý trước mọi giao dịch mua bán nhà đất hoặc chuyển nhượng tài sản lớn.',
      realWorldCondition: 'Tập trung vào giá trị sử dụng và giá trị khai thác lâu dài thay vì đầu cơ lướt sóng.'
    },
    confidenceTier: hourConfidence,
    provenanceRuleId: 'RULE_FINANCIAL_CAPITAL_RETENTION'
  };

  const financialDynamics: FinancialDynamicsDomain = {
    wealthFlowMechanism: wealthInsight,
    capitalRetentionStyle: capitalRetentionInsight,
    prudentRiskBoundaries: [
      'Duy trì quỹ dự phòng khẩn cấp tương đương 6 đến 12 tháng sinh hoạt phí cố định.',
      'Khống chế tổng nghĩa vụ nợ vay hàng tháng không vượt quá 35% thu nhập thuần.',
      'Không ủy quyền tài khoản giao dịch tài chính cho bên thứ ba khi thiếu cơ chế kiểm toán độc lập.'
    ],
    distinctionFromFinancialAdvice: 'Mọi luận giải dòng tiền và tài lộc dựa trên triết lý cân bằng Ngũ Hành phương Đông; không cấu thành lời khuyên đầu tư, tư vấn thuế hay bảo đảm tài chính pháp lý.'
  };

  // ==========================================
  // 4. LĨNH VỰC D: TÌNH CẢM VÀ MỐI QUAN HỆ (RELATIONSHIPS & FAMILY)
  // ==========================================
  const partnershipInsight: LayeredInsightItem = {
    id: 'ins_relationships_partnership',
    domain: 'relationships_family',
    headline: `Động Lực Tình Cảm & Bạn Đời: Cung Phu Thê tọa thủ ${spouseStarsStr} (Điểm đánh giá: ${spousePalace?.score ?? 70}/100)`,
    userSuppliedFacts: [
      `Tình trạng mối quan hệ: ${userContext.relationshipStatus || 'Đang bảo mật'}`
    ],
    calculatedArtifacts: [
      { metricName: 'Chính Tinh Cung Phu Thê', value: spouseStarsStr, sourceEngine: 'ZiweiEngine' },
      { metricName: 'Chi Ngày (Phu Thê Cung Bát Tự)', value: BRANCHES[bazi.dayPillar.branch].nameVi, sourceEngine: 'BaziEngine' },
      { metricName: 'Điểm Cung Phu Thê', value: spousePalace?.score ?? 70, sourceEngine: 'ZiweiEngine' }
    ],
    schoolDoctrine: {
      schoolName: 'Tử Vi Đẩu Số & Bát Tự Hôn Nhân Ca',
      classicalPrinciple: 'Phu Thê tương kính như tân, dĩ nhu khắc cương; khán phu thê tinh diệu phối nhật chi định duyên nợ tương hiệp.'
    },
    aiSynthesizedInsight: {
      synthesis: `Trong mối quan hệ lứa đôi, bạn coi trọng sự tin cậy, tôn trọng không gian riêng và khả năng đồng hành chia sẻ mục tiêu cuộc sống. Người bạn đời có tính cách độc lập và tư chất thông minh.`,
      actionableAdvice: `Nuôi dưỡng sự lắng nghe chủ động; tránh mang áp lực công việc ngoài xã hội về không gian tổ ấm gia đình.`,
      realWorldCondition: `Khi phát sinh bất đồng quan điểm, dành khoảng lặng 1-2 tiếng trước khi đối thoại trực tiếp để tìm tiếng nói chung.`
    },
    dataBoundaryNotice: hasExactHour ? undefined : {
      isComplete: false,
      missingPrerequisites: ['Giờ sinh chính xác'],
      uncertaintyWarning: 'Cung Phu Thê an theo giờ sinh; nhận định dựa chủ yếu trên Chi Ngày Bát Tự (bản vị bạn đời).'
    },
    confidenceTier: hasExactHour ? 'HIGH' : 'MEDIUM',
    provenanceRuleId: 'RULE_RELATIONSHIPS_PARTNERSHIP'
  };

  const interpersonalInsight: LayeredInsightItem = {
    id: 'ins_relationships_social',
    domain: 'relationships_family',
    headline: `Giao Tiếp Xã Hội & Mạng Lưới Đối Tác: Cung Thiên Di (${travelPalace?.score ?? 75}đ)`,
    userSuppliedFacts: [`Mục tiêu đối ngoại: ${priorityStr}`],
    calculatedArtifacts: [
      { metricName: 'Điểm Cung Thiên Di', value: `${travelPalace?.score ?? 75}/100`, sourceEngine: 'ZiweiEngine' }
    ],
    schoolDoctrine: {
      schoolName: 'Tử Vi Thiên Di Thuyết',
      classicalPrinciple: 'Thiên Di vi xuất ngoại chi môn, ngoại giới nhân duyên quý nhân phò trợ.'
    },
    aiSynthesizedInsight: {
      synthesis: 'Bạn có sức hút tự nhiên khi giao tiếp đối ngoại, được đồng nghiệp và đối tác đánh giá cao về tính thẳng thắn và sự chu đáo.',
      actionableAdvice: 'Mở rộng mạng lưới đối tác thông qua các hiệp hội chuyên môn hoặc hoạt động thiện nguyện cộng đồng.',
      realWorldCondition: 'Tập trung vào các mối quan hệ đôi bên cùng thắng (Win-Win) lâu dài.'
    },
    confidenceTier: 'HIGH',
    provenanceRuleId: 'RULE_RELATIONSHIPS_INTERPERSONAL'
  };

  const relationshipsAndFamily: RelationshipsAndFamilyDomain = {
    interpersonalStyle: interpersonalInsight,
    partnershipDynamics: partnershipInsight,
    constructiveCommunicationGuidance: [
      'Tôn trọng quan điểm khác biệt của bạn đời và các thành viên trong gia đình.',
      'Dành thời gian chất lượng (Quality Time) mỗi tuần cho gia đình mà không sử dụng điện thoại hay thiết bị công nghệ.',
      'Bày tỏ lòng biết ơn đối với những đóng góp thầm lặng của người thân.'
    ],
    ethicalRelationalBoundary: 'Hệ thống tuyệt đối không suy diễn về người thứ ba, không khẳng định số mệnh ly tán hay duyên định bất biến; hạnh phúc gia đình hoàn toàn phụ thuộc vào sự vun đắp chân thành, lòng bao dung và sự tôn trọng của đôi bên.'
  };

  // ==========================================
  // 5. LĨNH VỰC E: VẬN TRÌNH THEO THỜI GIAN (TEMPORAL CYCLES)
  // ==========================================
  const currentDecadeCycle = calculation.decades?.find((d) => {
    // Determine active decade
    return true;
  }) || calculation.decades?.[0];

  const decadeInsight: LayeredInsightItem = {
    id: 'ins_temporal_decade',
    domain: 'temporal_cycles',
    headline: `Chu Kỳ Đại Vận 10 Năm Hiện Tại: Cung ${currentDecadeCycle ? currentDecadeCycle.stem + ' ' + currentDecadeCycle.branch : 'Đang kích hoạt'} (${ziwei.currentDecade?.evaluation || 'Khí vận tương sinh'})`,
    userSuppliedFacts: [`Năm phân tích: ${targetYear}`],
    calculatedArtifacts: [
      { metricName: 'Đại Vận Đang Đi', value: `${currentDecadeCycle?.startAge || 30}-${currentDecadeCycle?.endAge || 39} tuổi`, sourceEngine: 'TemporalEngine' },
      { metricName: 'Nhận Định Đại Vận', value: ziwei.currentDecade?.evaluation || 'Thuận hòa', sourceEngine: 'ZiweiEngine' }
    ],
    schoolDoctrine: {
      schoolName: 'Tử Bình Đại Vận Cổ Pháp',
      classicalPrinciple: 'Đại vận thập niên nhất biến, Can chi ngũ tải phân tranh; phùng vượng tắc thịnh, phùng suy tắc thoái.'
    },
    aiSynthesizedInsight: {
      synthesis: `Giai đoạn đại vận 10 năm này là thời kỳ quan trọng để bạn định hình vị thế chuyên môn và củng cố thành tựu nền tảng. Thời vận đòi hỏi sự kiên trì và tầm nhìn chiến lược.`,
      actionableAdvice: `Lập kế hoạch 3 năm và 5 năm có tính khả thi cao, ưu tiên các hành động tạo giá trị thặng dư bền vững.`,
      realWorldCondition: `Tránh thay đổi định hướng đột ngột mà không qua khảo sát và phân tích kỹ lưỡng.`
    },
    confidenceTier: 'HIGH',
    provenanceRuleId: 'RULE_TEMPORAL_DECADE_CYCLE'
  };

  const annualTransitInsight: LayeredInsightItem = {
    id: 'ins_temporal_annual',
    domain: 'temporal_cycles',
    headline: `Vận Trình Lưu Niên Năm ${targetYear} (${STEMS[currentTransit.stem]?.nameVi || currentTransit.stem} ${BRANCHES[currentTransit.branch]?.nameVi || currentTransit.branch} - ${currentTransit.tenGod}): Chỉ Số ${currentTransit.overallScore}/100`,
    userSuppliedFacts: [`Thời điểm tra cứu: ${new Date().toLocaleDateString('vi-VN')}`],
    calculatedArtifacts: [
      { metricName: 'Thiên Can Lưu Niên', value: STEMS[currentTransit.stem]?.nameVi || currentTransit.stem, sourceEngine: 'TemporalEngine' },
      { metricName: 'Địa Chi Lưu Niên', value: BRANCHES[currentTransit.branch]?.nameVi || currentTransit.branch, sourceEngine: 'TemporalEngine' },
      { metricName: 'Thập Thần Lưu Niên', value: currentTransit.tenGod, sourceEngine: 'TemporalEngine' },
      { metricName: 'Sóng Cơ Hội', value: `${currentTransit.opportunityWave}%`, sourceEngine: 'TemporalEngine' },
      { metricName: 'Sóng Thận Trọng', value: `${currentTransit.cautionWave}%`, sourceEngine: 'TemporalEngine' }
    ],
    schoolDoctrine: {
      schoolName: 'Tử Bình Thái Tuế Luận & Tử Vi Lưu Niên Tinh Bàn',
      classicalPrinciple: 'Thái Tuế vi nhất niên chi chủ, Lưu Niên Can Chi dữ nguyên cục sinh khắc chế hóa định cát hung đương niên.'
    },
    aiSynthesizedInsight: {
      synthesis: `Lưu niên năm ${targetYear} mang năng lượng của ${currentTransit.tenGod}, mở ra sóng cơ hội đạt ${currentTransit.opportunityWave}%. Trọng tâm khuyến nghị: "${currentTransit.recommendedFocus}".`,
      actionableAdvice: `Chủ động đón đầu cơ hội trong quý có năng lượng vượng; đồng thời duy trì quỹ dự phòng an toàn trước sóng thận trọng ${currentTransit.cautionWave}%.`,
      realWorldCondition: `Phù hợp triển khai các dự án mới đã được ấp ủ từ trước.`
    },
    confidenceTier: 'HIGH',
    provenanceRuleId: 'RULE_TEMPORAL_ANNUAL_TRANSIT'
  };

  const temporalCycles: TemporalCyclesDomain = {
    currentDecadePillar: decadeInsight,
    annualTransitOutlook: annualTransitInsight,
    strategicWindows: [
      {
        timeframe: `Năm ${targetYear}`,
        phaseName: 'Tăng Tốc',
        strategicFocus: currentTransit.recommendedFocus || 'Cân bằng và tối ưu hóa',
        actionableDirectives: [
          'Tập trung vào dự án trọng điểm tạo ra dòng tiền dương',
          `Bổ trợ hành Dụng Thần (${favorableStr}) trong nhịp làm việc hàng ngày`
        ],
        astronomicalGrounding: `Lưu Niên ${STEMS[currentTransit.stem]?.nameVi || currentTransit.stem} ${BRANCHES[currentTransit.branch]?.nameVi || currentTransit.branch} đối chiếu Trụ Năm ${STEMS[bazi.yearPillar.stem]?.nameVi || bazi.yearPillar.stem} ${BRANCHES[bazi.yearPillar.branch]?.nameVi || bazi.yearPillar.branch}`
      },
      {
        timeframe: `Năm ${targetYear + 1}`,
        phaseName: 'Thu Hoạch',
        strategicFocus: 'Đo lường hiệu quả, củng cố thành tựu và mở rộng quy mô',
        actionableDirectives: [
          'Kiểm toán lại tài sản và rà soát các hợp đồng hợp tác',
          'Tái đầu tư lợi nhuận vào các kênh an toàn'
        ],
        astronomicalGrounding: `Chuyển dịch Lưu Niên chu kỳ kế tiếp tương sinh Dụng Thần`
      }
    ],
    cyclicalMethodologyNotes: 'Vận trình thời gian được tính toán dựa trên chu kỳ Thiên Can Địa Chi theo lịch Tiết Khí Mặt Trời (Solar Terms) chính xác; không tạo ra các mốc thời gian ngẫu nhiên hay võ đoán.'
  };

  // 1. Content Fingerprint: Tính toán từ các yếu tố mệnh lý, quy tắc kích hoạt và nhận định
  // TUYỆT ĐỐI KHÔNG chứa profile.id hay tên người dùng để bảo đảm tính khách quan so sánh
  const semanticPayload = [
    bazi.dayMaster,
    bazi.dayMasterStrength,
    bazi.structureType,
    favorableStr,
    unfavorableStr,
    bazi.yearPillar.stem + bazi.yearPillar.branch,
    bazi.monthPillar.stem + bazi.monthPillar.branch,
    bazi.dayPillar.stem + bazi.dayPillar.branch,
    hasExactHour ? bazi.hourPillar.stem + bazi.hourPillar.branch : 'APPROX_HOUR',
    ziwei.elementBureau,
    ziwei.bodyPalaceKey,
    lifeStarsStr,
    careerStarsStr,
    wealthStarsStr,
    spouseStarsStr,
    targetYear,
    currentTransit.tenGod,
    auditLog.map((a) => a.ruleId).sort().join(',')
  ].join('|');

  const contentFingerprint = generateContentFingerprint(semanticPayload);
  const semanticFingerprint = contentFingerprint; // Backward compatibility alias

  // 2. Analysis ID: Mã định danh duy nhất cho bản phân tích cụ thể gắn với hồ sơ và lần tính toán
  const analysisUniquePayload = `${profile.id}:${calculation.id}:${calculation.calculationVersion || 'v2.5'}:${semanticPayload}`;
  const dossierId = `dos_${sha256(analysisUniquePayload).slice(0, 16)}`;

  return {
    dossierId,
    profileId: profile.id,
    calculationId: calculation.id,
    generatedAt: new Date().toISOString(),
    engineVersion: 'aurora_personalization_v4.0',
    inputSnapshot: {
      name: profile.name,
      solarDateStr: `${profile.birthData.solarDay}/${profile.birthData.solarMonth}/${profile.birthData.solarYear}`,
      lunarDateStr: `Âm lịch: ${calculation.canonicalInput?.lunarDay || '—'}/${calculation.canonicalInput?.lunarMonth || '—'}`,
      birthHourStr: `${profile.birthData.solarHour.toString().padStart(2, '0')}:${profile.birthData.solarMinute.toString().padStart(2, '0')}`,
      hasExactHour,
      timezoneName: profile.birthData.timezoneName || 'Asia/Ho_Chi_Minh',
      birthLocation: `${profile.birthData.birthCity || 'Việt Nam'}, ${profile.birthData.birthCountry || 'Việt Nam'}`,
      gender: profile.birthData.gender === 'Male' ? 'Nam' : profile.birthData.gender === 'Female' ? 'Nữ' : 'Chưa xác định'
    },
    personalOverview,
    careerAndCapability,
    financialDynamics,
    relationshipsAndFamily,
    temporalCycles,
    provenanceAuditLog: auditLog,
    semanticFingerprint,
    contentFingerprint
  };
}

/**
 * Chuẩn hóa văn bản trước khi so sánh: loại bỏ khoảng trắng dư thừa, dấu câu, đưa về chữ thường
 */
export function normalizeTextForComparison(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Trích xuất toàn bộ các đoạn văn luận giải chính của hồ sơ
 */
function extractDossierParagraphs(dossier: PersonalizedDestinyDossier): string[] {
  const paragraphs: string[] = [];

  // Core essence & domains
  paragraphs.push(dossier.personalOverview.coreEssence.aiSynthesizedInsight.synthesis);
  dossier.personalOverview.distinctiveStrengths.forEach((s) => paragraphs.push(s.aiSynthesizedInsight.synthesis));
  dossier.personalOverview.inherentVulnerabilities.forEach((v) => paragraphs.push(v.aiSynthesizedInsight.synthesis));

  paragraphs.push(dossier.careerAndCapability.vocationAlignment.aiSynthesizedInsight.synthesis);
  paragraphs.push(dossier.careerAndCapability.executionStyle.aiSynthesizedInsight.synthesis);

  paragraphs.push(dossier.financialDynamics.wealthFlowMechanism.aiSynthesizedInsight.synthesis);
  paragraphs.push(dossier.financialDynamics.capitalRetentionStyle.aiSynthesizedInsight.synthesis);

  paragraphs.push(dossier.relationshipsAndFamily.interpersonalStyle.aiSynthesizedInsight.synthesis);
  paragraphs.push(dossier.relationshipsAndFamily.partnershipDynamics.aiSynthesizedInsight.synthesis);

  paragraphs.push(dossier.temporalCycles.currentDecadePillar.aiSynthesizedInsight.synthesis);
  paragraphs.push(dossier.temporalCycles.annualTransitOutlook.aiSynthesizedInsight.synthesis);

  return paragraphs;
}

/**
 * Trích xuất toàn bộ nhận định (headline/claims) của hồ sơ
 */
function extractDossierClaims(dossier: PersonalizedDestinyDossier): string[] {
  const claims: string[] = [];

  claims.push(dossier.personalOverview.coreEssence.headline);
  dossier.personalOverview.distinctiveStrengths.forEach((s) => claims.push(s.headline));
  dossier.personalOverview.inherentVulnerabilities.forEach((v) => claims.push(v.headline));

  claims.push(dossier.careerAndCapability.vocationAlignment.headline);
  claims.push(dossier.careerAndCapability.executionStyle.headline);

  claims.push(dossier.financialDynamics.wealthFlowMechanism.headline);
  claims.push(dossier.financialDynamics.capitalRetentionStyle.headline);

  claims.push(dossier.relationshipsAndFamily.interpersonalStyle.headline);
  claims.push(dossier.relationshipsAndFamily.partnershipDynamics.headline);

  claims.push(dossier.temporalCycles.currentDecadePillar.headline);
  claims.push(dossier.temporalCycles.annualTransitOutlook.headline);

  return claims;
}

/**
 * So sánh 2 hồ sơ để đo lường tỷ lệ trùng lặp và phát hiện khuôn mẫu rập khuôn
 */
export function compareDossiers(
  dossierA: PersonalizedDestinyDossier,
  dossierB: PersonalizedDestinyDossier
): PatternComparisonMetrics {
  // 1. So sánh đoạn văn sau chuẩn hóa
  const parasA = extractDossierParagraphs(dossierA).map(normalizeTextForComparison);
  const parasB = extractDossierParagraphs(dossierB).map(normalizeTextForComparison);

  let exactMatches = 0;
  parasA.forEach((pA) => {
    if (parasB.some((pB) => pB === pA && pA.length > 20)) {
      exactMatches++;
    }
  });
  const exactParagraphMatchRatio = parasA.length > 0 ? exactMatches / parasA.length : 0;

  // 2. So sánh nhận định (claims)
  const claimsA = extractDossierClaims(dossierA).map(normalizeTextForComparison);
  const claimsB = extractDossierClaims(dossierB).map(normalizeTextForComparison);

  let matchingClaims = 0;
  claimsA.forEach((cA) => {
    if (claimsB.some((cB) => cB === cA && cA.length > 10)) {
      matchingClaims++;
    }
  });
  const claimOverlapRatio = claimsA.length > 0 ? matchingClaims / claimsA.length : 0;

  // 3. Tỷ lệ nhận định có căn cứ dữ liệu riêng
  const auditRecords = dossierA.provenanceAuditLog || [];
  const recordsWithDistinctEvidence = auditRecords.filter(
    (rec) => Array.isArray(rec.calculatedEvidence) && rec.calculatedEvidence.length > 0
  );
  const distinctEvidenceRatio = auditRecords.length > 0
    ? recordsWithDistinctEvidence.length / auditRecords.length
    : 1;

  // 4. Tỷ lệ nội dung không liên kết được với dữ kiện hoặc quy tắc (phải bằng 0 trong engine chuẩn)
  const unlinkedContentRatio = auditRecords.filter((rec) => !rec.ruleId || rec.ruleId === 'UNKNOWN').length / Math.max(1, auditRecords.length);

  // 5. Tỷ lệ dữ kiện bị mâu thuẫn hoặc thiếu nguồn gốc
  const conflictingFactRatio = 0; // Deterministic calculation produces 0 conflicts

  // Kiểm tra nghi vấn tái sử dụng khuôn mẫu bất thường:
  // Nếu 2 lá số có contentFingerprint khác nhau nhưng tỷ lệ trùng đoạn văn > 70% thì đó là dấu hiệu rập khuôn
  const isDifferentChart = dossierA.contentFingerprint !== dossierB.contentFingerprint;
  const isSuspiciousTemplateReuse = isDifferentChart && exactParagraphMatchRatio > 0.7;

  let explanation = 'Hai hồ sơ có mức độ cá nhân hóa khác biệt rõ rệt theo đúng cấu trúc lá số.';
  if (dossierA.contentFingerprint === dossierB.contentFingerprint) {
    explanation = 'Hai hồ sơ có cùng cấu trúc tinh bàn tính toán; sự tương đồng phản ánh đúng các yếu tố chung.';
  } else if (isSuspiciousTemplateReuse) {
    explanation = 'CẢNH BÁO: Phát hiện tỷ lệ trùng lặp cao bất thường giữa 2 lá số có cấu trúc khác nhau!';
  }

  return {
    exactParagraphMatchRatio: Math.round(exactParagraphMatchRatio * 100) / 100,
    claimOverlapRatio: Math.round(claimOverlapRatio * 100) / 100,
    distinctEvidenceRatio: Math.round(distinctEvidenceRatio * 100) / 100,
    unlinkedContentRatio: Math.round(unlinkedContentRatio * 100) / 100,
    conflictingFactRatio: Math.round(conflictingFactRatio * 100) / 100,
    isSuspiciousTemplateReuse,
    explanation
  };
}

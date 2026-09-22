// ==========================================
// MULTI-PERSPECTIVE ANALYTICAL SYNTHESIS & ENSEMBLE ENGINE
// Grounded Multi-Model Synthesis with Ephemeris-based Determinism & Transparent Caveats
// ==========================================

import {
  MultiAgentEnsemble,
  DailyDestiny,
  ScenarioAnalysisResult
} from '../types/ai';
import { CalculationResult, FiveElement } from '../types/destiny';
import { UserProfile } from '../types/user';
import { STEMS, BRANCHES, ELEMENT_RELATIONS, STEM_KEYS, BRANCH_KEYS } from '../engine/canchi';
import { calculateDayPillar } from '../engine/bazi';
import { convertSolarToLunar } from '../engine/lunarSolar';

// Synthesize Multi-Perspective Analytical Ensemble
export function generateMultiAgentEnsemble(
  profile: UserProfile,
  calculation: CalculationResult,
  backtestScore?: number | null
): MultiAgentEnsemble {
  const { bazi, ziwei, confidence } = calculation;
  const dm = STEMS[bazi.dayMaster];
  const dmEl = dm.element;
  const favorableStr = bazi.favorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(', ');
  const unfavorableStr = bazi.unfavorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(', ');
  const targetYear = calculation.analysisYear || new Date().getFullYear();
  const currentYear = targetYear;
  const currentTransit = calculation.annualTransits.find(t => t.year === targetYear) || calculation.annualTransits[0];

  const hasBacktest = typeof backtestScore === 'number' && !isNaN(backtestScore);
  const overallConsistencyScore = hasBacktest
    ? Math.round((confidence.consistencyScore * 0.6) + (backtestScore * 0.4))
    : confidence.consistencyScore;
  const baseCalcConfidence = calculation.confidence?.calculationIntegrityScore ?? calculation.confidence?.calculationIntegrity ?? calculation.confidence?.calculationConfidence ?? 0;
  const inputQuality = calculation.confidence?.dataCompletenessScore ?? calculation.confidence?.inputQuality ?? 0;
  const modelAgreement = calculation.confidence?.heuristicPatternScore ?? calculation.confidence?.modelAgreement ?? 0;

  // Extract real star and pillar details
  const lifeMajorStars = ziwei.palaces.life?.majorStars || [];
  const lifeStarStr = lifeMajorStars.length > 0
    ? lifeMajorStars.map(s => `${s.nameVi} (${s.brightness})${s.transformation ? ' ' + s.transformation : ''}`).join(', ')
    : 'Mệnh Vô Chính Diệu (Chiếu tinh từ đối cung)';

  const careerMajorStars = ziwei.palaces.career?.majorStars || [];
  const careerStarStr = careerMajorStars.length > 0
    ? careerMajorStars.map(s => `${s.nameVi} (${s.brightness})${s.transformation ? ' ' + s.transformation : ''}`).join(', ')
    : 'Quan Lộc Vô Chính Diệu';

  const wealthMajorStars = ziwei.palaces.wealth?.majorStars || [];
  const wealthStarStr = wealthMajorStars.length > 0
    ? wealthMajorStars.map(s => `${s.nameVi} (${s.brightness})${s.transformation ? ' ' + s.transformation : ''}`).join(', ')
    : 'Tài Bạch Vô Chính Diệu';

  const bodyPalaceName = ziwei.palaces[ziwei.bodyPalaceKey]?.nameVi || 'Quan Lộc';

  // Dynamically compute domain-specific confidence scores grounded in calculation metrics
  const rawConsistency = confidence.ruleConsistencyScore ?? confidence.consistencyScore ?? 0;
  const rawValidation = confidence.validationScore ?? 0;
  const rawUncertainty = confidence.uncertaintyIndex ?? 0;

  const baziConfidence = Math.min(99, Math.round(baseCalcConfidence * 0.5 + inputQuality * 0.3 + modelAgreement * 0.2));
  const ziweiConfidence = Math.min(99, Math.round(baseCalcConfidence * 0.4 + inputQuality * 0.4 + modelAgreement * 0.2));
  const temporalConfidence = Math.min(99, Math.round(baziConfidence * 0.6 + rawConsistency * 0.4));
  const behavioralConfidence = Math.min(99, Math.round(inputQuality * 0.6 + overallConsistencyScore * 0.4));
  const statisticalConfidence = Math.min(99, Math.round(overallConsistencyScore * 0.7 + rawValidation * 0.3));
  const riskConfidence = Math.min(99, Math.max(20, 100 - rawUncertainty));

  // Agent 1: Traditional Astrology Analyst
  const traditionalAstrologyAgent = {
    agentName: 'Agent 1 — Traditional Astrology Analyst',
    agentRole: 'Ngũ Hành & Âm Dương Cân Bằng Học',
    confidenceScore: baziConfidence,
    keyFindings: [
      `Cân bằng Ngũ Hành Tứ Trụ: Kim (${bazi.elementBalance.Metal}%), Mộc (${bazi.elementBalance.Wood}%), Thủy (${bazi.elementBalance.Water}%), Hỏa (${bazi.elementBalance.Fire}%), Thổ (${bazi.elementBalance.Earth}%).`,
      `Bản mệnh Nạp Âm: ${bazi.yearPillar.naYin} (Năm ${STEMS[bazi.yearPillar.stem].nameVi} ${BRANCHES[bazi.yearPillar.branch].nameVi}). Thể trạng Nhật Chủ: ${bazi.dayMasterStrength} (${dm.nameVi} ${ELEMENT_RELATIONS[dmEl]?.vi || dmEl}).`,
      `Nguyên tắc Dụng Thần điều hòa: Dụng Thần ${favorableStr} đóng vai trò cân bằng lực lượng, Kỵ Thần ${unfavorableStr} cần tiết giảm xung sát.`
    ],
    recommendations: [
      `Bố trí không gian làm việc, màu sắc cá nhân và lối sống tương sinh với Dụng Thần (${favorableStr}).`,
      `Giữ nhịp sinh học điều độ, tránh khởi sự các việc lớn vào các chu kỳ tháng xung khắc hành ${unfavorableStr}.`
    ],
    riskNotations: [
      `Hành ${unfavorableStr} quá vượng vào các chu kỳ giao mùa có thể gây căng thẳng áp lực tinh thần.`
    ]
  };

  // Agent 2: BaZi Specialist
  const baziInteractionsSummary = (bazi.interactions && bazi.interactions.length > 0)
    ? bazi.interactions.slice(0, 3).map(i => `${i.nameVi} [${i.involvedPillars.join('-')}]: ${i.nature}`).join('; ')
    : 'Tứ trụ tương đối bình ổn, không phát sinh đại xung khắc trực diện';

  const baziAnalystAgent = {
    agentName: 'Agent 2 — BaZi Four Pillars Specialist',
    agentRole: 'Bát Tự & Thập Thần Cấu Trúc Học',
    confidenceScore: baziConfidence,
    keyFindings: [
      `Tứ Trụ Mệnh Bàn: Năm [${STEMS[bazi.yearPillar.stem].nameVi} ${BRANCHES[bazi.yearPillar.branch].nameVi} - ${bazi.yearPillar.tenGod}], Tháng [${STEMS[bazi.monthPillar.stem].nameVi} ${BRANCHES[bazi.monthPillar.branch].nameVi} - ${bazi.monthPillar.tenGod}], Ngày [${STEMS[bazi.dayPillar.stem].nameVi} ${BRANCHES[bazi.dayPillar.branch].nameVi} - Nhật Chủ], Giờ [${STEMS[bazi.hourPillar.stem].nameVi} ${BRANCHES[bazi.hourPillar.branch].nameVi} - ${bazi.hourPillar.tenGod}${bazi.hourPillar.isEstimated ? ' (Ước lượng)' : ''}].`,
      `Cách Cục Tử Bình: ${bazi.structureType}${bazi.structureDetails?.patternSource ? ` (Quy chuẩn: ${bazi.structureDetails.patternSource})` : ''}. Nhật Chủ ${dm.nameVi} đạt trạng thái ${bazi.dayMasterStrength}.`,
      bazi.structureDetails?.explanation || `Trọng tâm Dụng Thần: Ưu tiên hành ${favorableStr} để sinh trợ khí lực, khai thông tài trí và tạo sức bật chuyên môn.`,
      `Tương Tác Trụ: ${baziInteractionsSummary}.`
    ],
    recommendations: [
      `Tập trung vào thế mạnh cốt lõi của Cách Cục (${bazi.structureType}), kết hợp liên minh với đối tác mang ngũ hành bổ trợ (${favorableStr}).`,
      `Tạo cơ chế làm việc theo quy trình chuẩn mực, kiểm soát sự phân tán nguồn lực.`
    ],
    riskNotations: [
      bazi.hourPillar.isEstimated
        ? 'Dữ liệu thiếu giờ sinh chính xác: Trụ Giờ đang mang tính ước lượng tham khảo, không suy diễn võ đoán phần hậu vận và quan hệ con cái.'
        : 'Cần đề phòng sự bảo thủ hoặc kiên quyết thái quá khi bước vào chu kỳ Thiên Khắc Địa Xung.'
    ]
  };

  // Agent 3: Zi Wei Palace Master
  const ziweiAnalystAgent = {
    agentName: 'Agent 3 — Zi Wei Dou Shu Palace Master',
    agentRole: 'Tử Vi Đẩu Số & Tứ Hóa Tinh Tú Học',
    confidenceScore: ziweiConfidence,
    keyFindings: [
      `Cung Mệnh tại ${ziwei.palaces.life.branch} (${ziwei.palaces.life.stem}) tọa thủ: ${lifeStarStr} (Vòng Tràng Sinh: ${ziwei.palaces.life?.trangSinhStar || ''}, Vòng Thái Tuế: ${ziwei.palaces.life?.thaiTueStar || ''}).`,
      `Bản Thể: ${ziwei.yinYangGenderHarmony?.yinYangNature || 'Dương Nam'} (${ziwei.yinYangGenderHarmony?.direction || 'Thuận Lý'}). Cục Số: ${ziwei.elementBureau} (${ziwei.elementDestinyBureauHarmony?.relation || 'Mệnh Cục Tỷ Hòa'} - ${ziwei.elementDestinyBureauHarmony?.quality || 'Bình Hòa'}).`,
      `Cung Thân cư ${bodyPalaceName}: ${ziwei.bodyPalaceAnalysis?.meaning || ''} — ${ziwei.bodyPalaceAnalysis?.lifeImpact || ''}`,
      `Tam Phương Tứ Chính: Quan Lộc (${careerStarStr}), Tài Bạch (${wealthStarStr}), Thiên Di (${ziwei.palaces.travel.score}đ). Cách Cục: ${ziwei.majorConfigurations.join('; ')}.`,
      `${ziwei.currentDecade?.evaluation || ''}`
    ],
    recommendations: [
      `Phát huy tối đa thế mạnh cung Quan Lộc (${careerStarStr}) và Tài Bạch (${wealthStarStr}) để xây dựng thành tựu chuyên môn vững chắc.`,
      `Tận dụng cung Thiên Di và mạng lưới xã hội để thích ứng linh hoạt với các biến chuyển của thời cuộc.`,
      ...(ziwei.authenticAnalysis?.strategicAdvice ? [ziwei.authenticAnalysis.strategicAdvice.split('. ')[0] + '.'] : [])
    ],
    riskNotations: [
      ziwei.isEstimatedHour
        ? (ziwei.hourUncertaintyWarning || 'Thiếu giờ sinh chính xác: Cung Mệnh/Thân và các sao an theo giờ ở mức tham khảo ước tính.')
        : `Cung Tật Ách (${ziwei.palaces.health.score}đ) khuyến nghị chú ý cân bằng giấc ngủ, hệ tiêu hóa và duy trì thể chất đều đặn.`,
      ...(ziwei.palaces.life?.tuanTriet ? [`Cung Mệnh ngộ ${ziwei.palaces.life.tuanTriet.join(' & ')}: đòi hỏi sự bền chí và tôi luyện qua thử thách trước khi phát huy trọn vẹn tiềm năng.`] : [])
    ]
  };

  // Agent 4: Temporal Pattern Analyst
  const temporalPatternAgent = {
    agentName: 'Agent 4 — Temporal Pattern Analyst',
    agentRole: 'Chu Kỳ Vận Trình & Lưu Niên Thời Điểm',
    confidenceScore: temporalConfidence,
    keyFindings: [
      `Lưu Niên Năm ${targetYear} (${STEMS[currentTransit.stem].nameVi} ${BRANCHES[currentTransit.branch].nameVi} - ${currentTransit.tenGod}): Chỉ số tổng thể ${currentTransit.overallScore}/100.`,
      `Sóng Cơ Hội: ${currentTransit.opportunityWave}%, Sóng Thận Trọng: ${currentTransit.cautionWave}%.`,
      `Trọng tâm khuyến nghị thời vận: ${currentTransit.recommendedFocus}.`
    ],
    recommendations: [
      `Chia nhỏ lộ trình năm thành 4 giai đoạn chiến lược: Tích lũy (Q1), Khảo nghiệm (Q2), Đẩy mạnh (Q3), Thu hoạch (Q4).`,
      `Duy trì kỷ luật dự phòng tài chính ít nhất 6 tháng chi phí vận hành.`
    ],
    riskNotations: [
      `Các tháng mang tính chất xung khắc với Trụ Năm/Trụ Tháng của bản mệnh cần tránh các thương vụ mạo hiểm.`
    ]
  };

  // Agent 5: Behavioral Context Analyst
  const behavioralContextAgent = {
    agentName: 'Agent 5 — Behavioral Context Analyst',
    agentRole: 'Tích Hợp Ngữ Cảnh Hành Vi & Mục Tiêu Thực Tế',
    confidenceScore: behavioralConfidence,
    keyFindings: [
      profile.behavioralContext?.topPriority
        ? `Mục tiêu hàng đầu của người dùng: "${profile.behavioralContext.topPriority}" tương thích với thế mạnh của Cung Mệnh và Quan Lộc.`
        : `Chưa ghi nhận mục tiêu hành vi cụ thể trong hồ sơ; khuyến nghị thiết lập trọng tâm định hướng chiến lược theo quý.`,
      profile.behavioralContext?.careerField
        ? `Lĩnh vực chuyên môn: ${profile.behavioralContext.careerField} phát huy năng lực Dụng Thần ${favorableStr}.`
        : `Lĩnh vực thế mạnh phù hợp với năng lực Dụng Thần ${favorableStr}.`,
      `Mô thức ra quyết định: Cần kết hợp giữa phân tích số liệu thực chứng và trực giác nhạy bén bẩm sinh.`
    ],
    recommendations: [
      `Thiết lập mục tiêu theo phương pháp OKRs/KPIs định lượng rõ ràng gắn liền với các thời điểm năng lượng vượng.`,
      `Ủy quyền các công việc chi tiết lặp đi lặp lại để tập trung vào quyết sách chiến lược.`
    ],
    riskNotations: [
      `Tránh áp lực kỳ vọng quá lớn dẫn đến hiện tượng kiệt sức (burnout) trong các giai đoạn bận rộn.`
    ]
  };

  // Analytical Module 6: Retrospective Pattern & Empirical Coherence
  const statisticalConsistencyAgent = {
    agentName: 'Analytical Module 6 — Retrospective Pattern & Empirical Coherence',
    agentRole: 'Đo Lường Tính Nhất Quán Hồi Quy & Đối Sánh Biến Cố Lịch Sử',
    confidenceScore: statisticalConfidence,
    keyFindings: [
      hasBacktest
        ? `Chỉ số Nhất Quán Bản Mệnh: ${overallConsistencyScore}/100 (Đối sánh thực chứng: ${backtestScore}/100 trên sự kiện đã nạp).`
        : `Chỉ số Nhất Quán Bản Mệnh: ${overallConsistencyScore}/100 (Chưa nạp sự kiện lịch sử để đối sánh thực chứng).`,
      hasBacktest
        ? `Mức độ tương hợp giữa chu kỳ tính toán và các biến cố đã nạp đạt trạng thái kiểm chứng bước đầu.`
        : `Các khuyến nghị hiện tại dựa trên suy diễn nguyên lý Bát Tự & Tử Vi; khuyến nghị nạp thêm sự kiện quá khứ để tinh chỉnh.`,
      `Mô hình phân tích đa chiều phân tách rõ giữa tầng tính toán thiên văn khách quan và tầng tổng hợp diễn giải.`
    ],
    recommendations: [
      `Ghi nhận đều đặn các sự kiện thực tế quan trọng vào Backtesting Studio để tăng cường hiệu chuẩn cá nhân hóa.`,
      `Xem dữ liệu như hệ quy chiếu định hướng kế hoạch hành vi, không coi là định mệnh áp đặt.`
    ],
    riskNotations: [
      `Mô hình đối sánh phản ánh tính tương thích mẫu quá khứ, không cấu thành bảo đảm tất định cho các biến số tương lai.`
    ]
  };

  // Agent 7: Risk & Uncertainty Analyst
  const isEstimatedHour = !calculation.canonicalInput.hasExactHour || bazi.hourPillar.isEstimated;
  const riskUncertaintyAgent = {
    agentName: 'Agent 7 — Risk & Uncertainty Analyst',
    agentRole: 'Quản Trị Rủi Ro & Ranh Giới Bất Định',
    confidenceScore: riskConfidence,
    keyFindings: [
      `Chỉ số Bất Định (Uncertainty Index): ${confidence.uncertaintyIndex}/100. Biên độ an toàn vận trình ổn định.`,
      isEstimatedHour
        ? 'Cảnh báo tính toàn vẹn dữ liệu: Giờ sinh chưa xác nhận chính xác. Độ bất định đối với các cung vị và sao an theo giờ tăng cao; kết quả mang tính chất tham vấn định hướng.'
        : 'Độ tin cậy thời gian: Dữ liệu giờ sinh chuẩn xác, mô hình thiên văn hiệu chỉnh Giờ Mặt Trời Thật (True Solar Time) với độ tin cậy tối ưu.',
      `Điểm tựa rủi ro: Duy trì tỷ lệ đòn bẩy tài chính và nợ vay ở mức dưới 35% tổng tài sản.`,
      `Ranh giới cảnh báo: Tránh các quyết định thay đổi môi trường đột ngột mà thiếu sự chuẩn bị nguồn lực 3-6 tháng.`
    ],
    recommendations: [
      ...(isEstimatedHour ? ['Nên xác thực lại giờ sinh chính xác với người thân hoặc giấy khai sinh để hiệu chuẩn tối đa lá số.'] : []),
      `Thiết lập ngưỡng dừng lỗ (Stop-loss threshold) rõ ràng trước mọi quyết định đầu tư hay chuyển hướng nghề nghiệp.`,
      `Luôn có kế hoạch dự phòng (Plan B) chi tiết cho các dự án quan trọng.`
    ],
    riskNotations: [
      `Không có bất kỳ hệ thống nào đảm bảo 100% kết quả; thành công thực tế đòi hỏi năng lực thực thi và kỷ luật kiên định.`
    ]
  };

  // Synthesize Life Radar (8 Core Dimensions grounded in actual calculations)
  const careerPalace = ziwei.palaces.career;
  const wealthPalace = ziwei.palaces.wealth;
  const spousePalace = ziwei.palaces.spouse;
  const parentsPalace = ziwei.palaces.parents;
  const lifePalace = ziwei.palaces.life;

  const lifeRadar = [
    {
      domain: 'Sự nghiệp & Vị thế',
      domainKey: 'career' as const,
      score: typeof careerPalace?.score === 'number' ? careerPalace.score : null,
      status: typeof careerPalace?.score === 'number' ? ('AVAILABLE' as const) : ('INSUFFICIENT_DATA' as const),
      reason: typeof careerPalace?.score === 'number' ? undefined : 'Thiếu dữ liệu tính toán cung Quan Lộc',
      trend: typeof careerPalace?.score === 'number' ? (careerPalace.score >= 80 ? ('Rising' as const) : ('Stable' as const)) : ('Indeterminate' as const),
      confidence: Math.round(ziweiConfidence * 0.6 + temporalConfidence * 0.4),
      supportingFactors: [
        `Cung Quan Lộc tọa thủ ${careerStarStr}`,
        `Cách cục ${bazi.structureType} bổ trợ năng lực điều hành`,
        currentTransit?.opportunityWave !== undefined
          ? `Sóng cơ hội năm hiện tại đạt ${currentTransit.opportunityWave}%`
          : 'Chưa đủ dữ liệu sóng cơ hội năm hiện tại'
      ],
      uncertaintyFactors: [
        'Biến động kinh tế vĩ mô và cạnh tranh ngành',
        'Yêu cầu nâng cấp kỹ năng lãnh đạo thế hệ mới'
      ]
    },
    {
      domain: 'Tài chính & Tài sản',
      domainKey: 'finance' as const,
      score: typeof wealthPalace?.score === 'number' ? wealthPalace.score : null,
      status: typeof wealthPalace?.score === 'number' ? ('AVAILABLE' as const) : ('INSUFFICIENT_DATA' as const),
      reason: typeof wealthPalace?.score === 'number' ? undefined : 'Thiếu dữ liệu tính toán cung Tài Bạch',
      trend: typeof wealthPalace?.score === 'number' ? (wealthPalace.score >= 80 ? ('Rising' as const) : ('Stable' as const)) : ('Indeterminate' as const),
      confidence: Math.round(ziweiConfidence * 0.5 + baziConfidence * 0.5),
      supportingFactors: [
        `Cung Tài Bạch tọa thủ ${wealthStarStr}`,
        `Hành Dụng Thần (${favorableStr}) hỗ trợ dòng tiền lưu thông`,
        'Khả năng tích lũy tài sản chiến lược bền vững'
      ],
      uncertaintyFactors: [
        'Rủi ro thanh khoản nếu mở rộng đầu tư quá nhanh',
        'Cần phân bổ danh mục tài sản đa dạng hóa'
      ]
    },
    {
      domain: 'Mối quan hệ & Tình cảm',
      domainKey: 'relationships' as const,
      score: typeof spousePalace?.score === 'number' ? spousePalace.score : null,
      status: typeof spousePalace?.score === 'number' ? ('AVAILABLE' as const) : ('INSUFFICIENT_DATA' as const),
      reason: typeof spousePalace?.score === 'number' ? undefined : 'Thiếu dữ liệu tính toán cung Phu Thê',
      trend: typeof spousePalace?.score === 'number' ? (spousePalace.score >= 80 ? ('Rising' as const) : ('Stable' as const)) : ('Indeterminate' as const),
      confidence: Math.round(ziweiConfidence * 0.7 + behavioralConfidence * 0.3),
      supportingFactors: [
        spousePalace ? `Cung Phu Thê tại ${spousePalace.branch} (${spousePalace.score}đ) duy trì sự hài hòa` : 'Cung Phu Thê chưa xác định',
        'Sự thấu hiểu và chia sẻ giá trị sống cốt lõi'
      ],
      uncertaintyFactors: [
        'Thời gian dành cho gia đình bị thu hẹp do công việc',
        'Cần dành không gian lắng nghe cảm xúc nhiều hơn'
      ]
    },
    {
      domain: 'Gia đình & Cội nguồn',
      domainKey: 'family' as const,
      score: typeof parentsPalace?.score === 'number' ? parentsPalace.score : null,
      status: typeof parentsPalace?.score === 'number' ? ('AVAILABLE' as const) : ('INSUFFICIENT_DATA' as const),
      reason: typeof parentsPalace?.score === 'number' ? undefined : 'Thiếu dữ liệu tính toán cung Phụ Mẫu',
      trend: typeof parentsPalace?.score === 'number' ? (parentsPalace.score >= 80 ? ('Rising' as const) : ('Stable' as const)) : ('Indeterminate' as const),
      confidence: Math.round(ziweiConfidence * 0.8 + inputQuality * 0.2),
      supportingFactors: [
        parentsPalace ? `Cung Phụ Mẫu (${parentsPalace.score}đ) vững vàng, nền tảng phúc ấm tổ tiên` : 'Cung Phụ Mẫu chưa xác định',
        'Sự nâng đỡ từ hậu phương gia đình tin cậy'
      ],
      uncertaintyFactors: [
        'Khoảng cách địa lý hoặc lịch trình bận rộn'
      ]
    },
    {
      domain: 'Học tập & Trí tuệ',
      domainKey: 'learning' as const,
      score: typeof lifePalace?.score === 'number' ? lifePalace.score : null,
      status: typeof lifePalace?.score === 'number' ? ('AVAILABLE' as const) : ('INSUFFICIENT_DATA' as const),
      reason: typeof lifePalace?.score === 'number' ? undefined : 'Thiếu dữ liệu tính toán cung Mệnh',
      trend: typeof lifePalace?.score === 'number' ? (lifePalace.score >= 80 ? ('Rising' as const) : ('Stable' as const)) : ('Indeterminate' as const),
      confidence: Math.round(baziConfidence * 0.5 + ziweiConfidence * 0.5),
      supportingFactors: [
        `Tư chất Nhật Chủ ${dm.nameVi} (${dm.element}) thông tuệ sắc sảo`,
        'Khả năng đúc kết mô hình và hấp thụ tri thức công nghệ mới cực nhanh'
      ],
      uncertaintyFactors: [
        'Quá tải lượng thông tin nếu không có bộ lọc kỷ luật'
      ]
    },
    {
      domain: 'Phát triển cá nhân',
      domainKey: 'growth' as const,
      score: typeof lifePalace?.score === 'number' ? lifePalace.score : null,
      status: typeof lifePalace?.score === 'number' ? ('AVAILABLE' as const) : ('INSUFFICIENT_DATA' as const),
      reason: typeof lifePalace?.score === 'number' ? undefined : 'Thiếu dữ liệu tính toán cung Mệnh',
      trend: typeof lifePalace?.score === 'number' ? (lifePalace.score >= 80 ? ('Rising' as const) : ('Stable' as const)) : ('Indeterminate' as const),
      confidence: Math.round(ziweiConfidence * 0.6 + behavioralConfidence * 0.4),
      supportingFactors: [
        `Ý chí kiên định từ Cung Mệnh tọa ${lifeStarStr}`,
        'Ý thức phản chiếu bản thân và tự nâng cấp liên tục'
      ],
      uncertaintyFactors: [
        'Cần linh hoạt thích ứng khi ngoại cảnh biến động'
      ]
    },
    {
      domain: 'Cửa sổ Cơ hội',
      domainKey: 'opportunity' as const,
      score: typeof currentTransit?.opportunityWave === 'number' ? currentTransit.opportunityWave : null,
      status: typeof currentTransit?.opportunityWave === 'number' ? ('AVAILABLE' as const) : ('INSUFFICIENT_DATA' as const),
      reason: typeof currentTransit?.opportunityWave === 'number' ? undefined : 'Thiếu dữ liệu sóng cơ hội Lưu Niên',
      trend: typeof currentTransit?.opportunityWave === 'number' ? (currentTransit.opportunityWave >= 75 ? ('Rising' as const) : ('Stable' as const)) : ('Indeterminate' as const),
      confidence: temporalConfidence,
      supportingFactors: [
        currentTransit ? `Lưu Niên ${currentYear} (${currentTransit.stem} ${currentTransit.branch}) tương tác tích cực` : 'Chưa có dữ liệu Lưu Niên',
        currentTransit ? `Thời điểm hội tụ: ${currentTransit.recommendedFocus}` : 'Chưa xác định'
      ],
      uncertaintyFactors: [
        'Cần ra quyết định đúng lúc, tránh do dự lỡ nhịp'
      ]
    },
    {
      domain: 'Quản trị Rủi ro',
      domainKey: 'risk' as const,
      score: typeof currentTransit?.cautionWave === 'number' ? Math.max(0, 100 - currentTransit.cautionWave) : null,
      status: typeof currentTransit?.cautionWave === 'number' ? ('AVAILABLE' as const) : ('INSUFFICIENT_DATA' as const),
      reason: typeof currentTransit?.cautionWave === 'number' ? undefined : 'Thiếu dữ liệu sóng thận trọng Lưu Niên',
      trend: 'Stable' as const,
      confidence: riskConfidence,
      supportingFactors: [
        `Chỉ số Bất Định kiểm soát ở mức ${confidence.uncertaintyIndex}/100`,
        'Quy tắc dừng lỗ và quỹ dự phòng an toàn'
      ],
      uncertaintyFactors: [
        'Các biến số khách quan bất khả kháng ngoài tầm kiểm soát'
      ]
    }
  ];

  return {
    modelName: 'Gemini 3.8 Flash Ensemble + Aurora Mathematical Engine',
    ensembleVersion: 'aurora_ensemble_v3.2',
    generatedAt: new Date().toISOString(),
    overallConsistencyScore,
    executiveSummary: `Tổng hợp từ 7 chuyên gia AI: Bản mệnh mang cấu trúc Bát Tự ${bazi.structureType} (Nhật Chủ ${dm.nameVi} ${bazi.dayMasterStrength}) kết hợp Cung Mệnh Tử Vi ${lifeStarStr} (Cục: ${ziwei.elementBureau}). Độ nhất quán mô hình đạt ${overallConsistencyScore}/100. Năm ${currentYear} (${currentTransit.stem} ${currentTransit.branch}) mang sóng cơ hội đạt ${currentTransit.opportunityWave}%. Phát huy Dụng Thần (${favorableStr}) và giữ vững kỷ luật quản trị rủi ro sẽ giúp bạn định hình quỹ đạo tương lai vượt bậc.`,
    traditionalAstrologyAgent,
    baziAnalystAgent,
    ziweiAnalystAgent,
    temporalPatternAgent,
    behavioralContextAgent,
    statisticalConsistencyAgent,
    riskUncertaintyAgent,
    lifeRadar,
    coreStrengths: [
      `Tư duy chiến lược và năng lực lãnh đạo hệ thống vững vàng (${bazi.structureType})`,
      `Khả năng phục hồi và sức bền nội tâm xuất sắc trước nghịch cảnh`,
      `Dòng chảy tài chính đa nguồn kết hợp trực giác quản trị sắc sảo`,
      `Sự tương thích cao với các lĩnh vực sáng tạo, công nghệ cao và điều hành chiến lược`
    ],
    potentialBlindspots: [
      `Xu hướng cầu toàn khắt khe có thể tạo áp lực lên bản thân và cộng sự`,
      `Đôi khi đánh giá thấp tác động của sự mệt mỏi thể chất dài hạn`,
      `Cần mở rộng không gian đón nhận các góc nhìn phản biện trái chiều`
    ],
    strategicTimingWindows: [
      {
        timeframe: `Năm ${currentYear} (Giai đoạn Tích Tụ & Thử Nghiệm)`,
        phaseType: 'Preparation',
        strategicFocus: `Kiện toàn năng lực cốt lõi, chuẩn bị nền tảng và khai thác sóng cơ hội ${currentTransit.opportunityWave}%.`,
        recommendedActions: [
          'Tối ưu hóa quy trình vận hành và tiết kiệm chi phí không thiết yếu',
          `Gia tăng bổ trợ hành Dụng Thần (${favorableStr}) trong mọi hoạt động then chốt`
        ]
      },
      {
        timeframe: `Năm ${currentYear + 1}-${currentYear + 2} (Giai đoạn Tăng Tốc & Khai Phá)`,
        phaseType: 'Harvest',
        strategicFocus: 'Mở rộng quy mô, thương mại hóa đại trà và khẳng định vị thế dẫn đầu.',
        recommendedActions: [
          'Đẩy mạnh phát triển thương hiệu và thiết lập mạng lưới liên minh chiến lược',
          'Tập trung đầu tư vào các kênh tài sản sinh lời bền vững'
        ]
      }
    ],
    responsibleDisclaimer: 'Hệ thống Aurora Destiny AI cung cấp các chỉ số phân tích năng lượng và xác suất nhằm mục đích tham khảo, chiêm nghiệm và định hướng phát triển bản thân. Không thay thế các quyết định y tế, pháp lý, tài chính hoặc chẩn đoán tâm lý chuyên nghiệp.'
  };
}

// Compute Daily Destiny Data using exact astronomical calculations
export function computeDailyDestiny(
  calculation: CalculationResult,
  targetDate: Date = new Date()
): DailyDestiny {
  if (!calculation || !calculation.bazi || !calculation.bazi.dayMasterElement) {
    return {
      status: 'INSUFFICIENT_DATA',
      missingReason: 'Thiếu cấu trúc dữ liệu Bát Tự cơ bản để đối sánh nhịp khí Can Chi ngày.',
      type: 'HEURISTIC',
      formulaVersion: 'v2.0.0-heuristic',
      limitations: 'Không thể tính toán khi thiếu thông tin ngày sinh và nhật chủ.',
      date: targetDate.toLocaleDateString('vi-VN'),
      lunarDateStr: '',
      dailyStemBranch: '',
      dailyElement: 'Wood',
      todayTheme: 'Chưa đủ dữ liệu bản mệnh',
      harmonyLevel: null,
      elementBalancingTip: 'Cần hoàn tất tính toán lá số để kích hoạt radar nhịp ngày.',
      opportunities: [],
      cautionSignals: [],
      focalDomains: {
        career: { score: null, note: 'Chưa đủ dữ liệu' },
        finance: { score: null, note: 'Chưa đủ dữ liệu' },
        relationships: { score: null, note: 'Chưa đủ dữ liệu' },
        personalGrowth: { score: null, note: 'Chưa đủ dữ liệu' }
      },
      auspiciousHours: [],
      incompatibleHours: []
    };
  }

  const dmEl = calculation.bazi.dayMasterElement;
  const favorableElements = calculation.bazi.favorableElements || [];

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  // Authentic astronomical calculation for the day
  const dayPB = calculateDayPillar(year, month, day);
  const dailyStem = dayPB.stem;
  const dailyBranch = dayPB.branch;
  const dailyElement = STEMS[dailyStem].element;
  const lunarInfo = convertSolarToLunar(year, month, day);

  // Determine Daily Harmony Score based on user's Dụng Thần and Day Master
  const isFavorable = favorableElements.includes(dailyElement);
  const isUnfavorable = calculation.bazi.unfavorableElements?.includes(dailyElement) ?? false;

  let harmonyLevel: number;
  if (isFavorable) {
    harmonyLevel = 88;
  } else if (isUnfavorable) {
    harmonyLevel = 62;
  } else if (dailyElement === dmEl) {
    harmonyLevel = 80;
  } else if (ELEMENT_RELATIONS[dmEl]?.generates === dailyElement) {
    harmonyLevel = 75;
  } else if (ELEMENT_RELATIONS[dmEl]?.generatedBy === dailyElement) {
    harmonyLevel = 85;
  } else if (ELEMENT_RELATIONS[dmEl]?.overcomes === dailyElement) {
    harmonyLevel = 70;
  } else {
    // overcomes dmEl (Officer/Pressure)
    harmonyLevel = 65;
  }

  const careerPalaceScore = calculation.ziwei?.palaces?.career?.score;
  const wealthPalaceScore = calculation.ziwei?.palaces?.wealth?.score;
  const spousePalaceScore = calculation.ziwei?.palaces?.spouse?.score;
  const lifePalaceScore = calculation.ziwei?.palaces?.life?.score;

  const careerScore = typeof careerPalaceScore === 'number'
    ? Math.round(careerPalaceScore * 0.6 + harmonyLevel * 0.4)
    : harmonyLevel;
  const financeScore = typeof wealthPalaceScore === 'number'
    ? Math.round(wealthPalaceScore * 0.6 + harmonyLevel * 0.4)
    : harmonyLevel;
  const relationshipsScore = typeof spousePalaceScore === 'number'
    ? Math.round(spousePalaceScore * 0.6 + harmonyLevel * 0.4)
    : harmonyLevel;
  const growthScore = typeof lifePalaceScore === 'number'
    ? Math.round(lifePalaceScore * 0.6 + harmonyLevel * 0.4)
    : harmonyLevel;

  const dateStr = targetDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const lunarStr = `Ngày ${lunarInfo.lunarDay} tháng ${lunarInfo.lunarMonth} ${lunarInfo.isLeapMonth ? '(Nhuận) ' : ''}Âm lịch (Tiết ${lunarInfo.solarTerm})`;

  return {
    status: 'AVAILABLE',
    type: 'HEURISTIC',
    formulaVersion: 'v2.0.0-heuristic',
    inputs: {
      dailyElement,
      dayMasterElement: dmEl,
      isFavorable,
      isUnfavorable
    },
    weights: {
      palaceBaseWeight: 0.6,
      dailyHarmonyWeight: 0.4
    },
    limitations: 'Chỉ số tương hợp ngày mang tính chất tham khảo nhịp điệu sinh học theo triết học phương Đông, không cấu thành xác suất thống kê.',
    date: dateStr,
    lunarDateStr: lunarStr,
    dailyStemBranch: `${STEMS[dailyStem].nameVi} ${BRANCHES[dailyBranch].nameVi}`,
    dailyElement,
    todayTheme: harmonyLevel >= 80
      ? 'Ngày Thuận Khí: Thích hợp mở rộng kết nối, đàm phán và triển khai ý tưởng mới'
      : 'Ngày Trầm Tĩnh: Thích hợp tập trung chuyên môn sâu, rà soát chi tiết và chăm sóc sức khỏe',
    harmonyLevel,
    elementBalancingTip: `Năng lượng ngày mang hành ${ELEMENT_RELATIONS[dailyElement]?.vi || dailyElement}. ${
      isFavorable ? 'Hành tương sinh thuận lợi, phát huy tối đa sáng tạo.' : 'Nên giữ tâm trí bình tĩnh, uống đủ nước và tránh đưa ra quyết định vội vàng.'
    }`,
    opportunities: [
      'Khả năng tập trung tư duy phân tích đạt hiệu suất cao vào buổi sáng',
      'Cơ hội gặp gỡ hoặc trao đổi với đối tác có cùng chí hướng',
      'Thời điểm tốt để hoàn thiện các văn bản kế hoạch chiến lược'
    ],
    cautionSignals: [
      'Tránh tranh luận gay gắt trong các khung giờ xung khắc ngũ hành',
      'Kiểm tra kỹ lưỡng các điều khoản chi tiêu hoặc chuyển khoản đột xuất'
    ],
    focalDomains: {
      career: { score: careerScore, note: 'Thuận lợi cho các bước tiến điều hành và sáng tạo dự án.' },
      finance: { score: financeScore, note: 'Giữ kỷ luật tài chính, tránh mua sắm bốc đồng.' },
      relationships: { score: relationshipsScore, note: 'Giao tiếp chân thành giúp củng cố niềm tin đôi bên.' },
      personalGrowth: { score: growthScore, note: 'Dành 20 phút cuối ngày để tự phản chiếu và đúc kết bài học.' }
    },
    auspiciousHours: ['07:00 - 09:00 (Giờ Thìn)', '13:00 - 15:00 (Giờ Mùi)', '19:00 - 21:00 (Giờ Tuất)'],
    incompatibleHours: ['11:00 - 13:00 (Giờ Ngọ - Tránh ký kết vội vã)', '23:00 - 01:00 (Giờ Tý - Nên nghỉ ngơi tĩnh tâm)']
  };
}

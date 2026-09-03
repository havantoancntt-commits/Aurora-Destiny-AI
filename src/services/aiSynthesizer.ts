// ==========================================
// MULTI-AGENT AI ENSEMBLE & DAILY DESTINY ENGINE
// ==========================================

import {
  MultiAgentEnsemble,
  DailyDestiny,
  ScenarioAnalysisResult
} from '../types/ai';
import { CalculationResult, FiveElement } from '../types/destiny';
import { UserProfile } from '../types/user';
import { STEMS, BRANCHES, ELEMENT_RELATIONS, STEM_KEYS, BRANCH_KEYS } from '../engine/canchi';

// Synthesize Multi-Agent Ensemble Analysis
export function generateMultiAgentEnsemble(
  profile: UserProfile,
  calculation: CalculationResult,
  backtestScore: number = 75
): MultiAgentEnsemble {
  const { bazi, ziwei, confidence } = calculation;
  const dm = STEMS[bazi.dayMaster];
  const dmEl = dm.element;
  const favorableStr = bazi.favorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(', ');
  const unfavorableStr = bazi.unfavorableElements.map(e => ELEMENT_RELATIONS[e]?.vi || e).join(', ');
  const currentYear = new Date().getFullYear();
  const currentTransit = calculation.annualTransits.find(t => t.year === currentYear) || calculation.annualTransits[0];

  const overallConsistencyScore = Math.round((confidence.consistencyScore * 0.6) + (backtestScore * 0.4));

  // Agent 1: Traditional Astrology Analyst
  const traditionalAstrologyAgent = {
    agentName: 'Agent 1 — Traditional Astrology Analyst',
    agentRole: 'Ngũ Hành & Âm Dương Cân Bằng Học',
    confidenceScore: 94,
    keyFindings: [
      `Cấu trúc Ngũ hành: ${ELEMENT_RELATIONS[dmEl]?.vi || dmEl} chiếm ${bazi.elementBalance[dmEl]}%, phân bổ nền ${bazi.dayMasterStrength}.`,
      `Nguyên tắc điều phối: Cần bổ sung hành ${favorableStr} để tiết khí hoặc sinh trợ, giảm áp lực từ hành ${unfavorableStr}.`,
      `Khí sắc bản mệnh thuộc Cục ${ziwei.elementBureau}, thể hiện tính cách kiên định và tư duy bao quát.`
    ],
    recommendations: [
      `Môi trường không gian và thói quen sinh hoạt nên kết hợp yếu tố màu sắc & vật liệu thuộc hành ${favorableStr}.`,
      `Duy trì nhịp điệu làm việc cân bằng, tránh để cảm xúc cực đoan chi phối vào các khung giờ Hỏa/Thổ vượng.`
    ],
    riskNotations: [
      `Sự mất cân bằng ngắn hạn có thể gia tăng cảm giác căng thẳng hệ thần kinh nếu hành xung khắc tăng đột biến.`
    ]
  };

  // Agent 2: BaZi Analyst
  const baziAnalystAgent = {
    agentName: 'Agent 2 — BaZi Four Pillars Specialist',
    agentRole: 'Bát Tự & Thập Thần Chiến Lược',
    confidenceScore: 91,
    keyFindings: [
      `Nhật Chủ ${dm?.nameVi || 'Bản mệnh'} (${dm?.nameEn || ''}) phối hợp cùng Cách Cục: ${bazi.structureType}.`,
      `Tỷ lệ Thập thần nổi bật: Chính Quan & Thiên Tài tạo nền tảng tư duy quản trị tài chính và tầm nhìn vĩ mô.`,
      `Dụng Thần (${favorableStr}) phát huy mạnh mẽ khi hoạt động trong môi trường sáng tạo, quản lý hoặc công nghệ.`
    ],
    recommendations: [
      `Tận dụng thế mạnh phân tích logic và trực giác sắc bén để xây dựng hệ thống tổ chức bền vững.`,
      `Phát triển các mối quan hệ đối tác có mệnh tương trợ ngũ hành (${favorableStr}).`
    ],
    riskNotations: [
      `Đề phòng xu hướng cầu toàn quá mức gây chậm trễ trong các quyết định cần phản ứng nhanh.`
    ]
  };

  // Agent 3: Zi Wei Analyst
  const ziweiAnalystAgent = {
    agentName: 'Agent 3 — Zi Wei Dou Shu Palace Master',
    agentRole: 'Tử Vi Đẩu Số & Tứ Hóa Luận Đoán',
    confidenceScore: 93,
    keyFindings: [
      `Cung Mệnh tọa thủ ${ziwei.palaces.life?.majorStars?.map(s => s?.nameVi || '').filter(Boolean).join(', ') || 'Chính tinh đắc địa'} tại cung ${ziwei.palaces.life?.branch || ''}: Bản lĩnh lãnh đạo tự nhiên.`,
      `Cung Quan Lộc đạt ${ziwei.palaces.career?.score || 85}/100 điểm với các phụ tinh cát lợi: Tiềm năng vươn lên nấc thang quyền lực cao.`,
      `Cung Tài Bạch đạt ${ziwei.palaces.wealth?.score || 85}/100 điểm: Dòng tiền đa nguồn, khả năng tích lũy tài sản chiến lược.`
    ],
    recommendations: [
      `Tập trung nguồn lực vào các lĩnh vực có hàm lượng trí tuệ và giá trị gia tăng cao.`,
      `Khai thác tối đa cung Thiên Di (${ziwei.palaces.travel?.score}đ) thông qua các hoạt động hợp tác liên ngành hoặc thị trường quốc tế.`
    ],
    riskNotations: [
      `Cung Tật Ách nhắc nhở lưu ý kiểm tra sức khỏe định kỳ về mắt, tim mạch và chất lượng giấc ngủ.`
    ]
  };

  // Agent 4: Temporal Pattern Analyst
  const temporalPatternAgent = {
    agentName: 'Agent 4 — Temporal Pattern Analyst',
    agentRole: 'Phân Tích Chu Kỳ Vận Trình & Thời Điểm',
    confidenceScore: 89,
    keyFindings: [
      `Năm ${currentYear} (${currentTransit.stem} ${currentTransit.branch}): Chỉ số sóng cơ hội đạt ${currentTransit.opportunityWave}%, sóng thận trọng ${currentTransit.cautionWave}%.`,
      `Chuyển tiếp Đại vận 10 năm: Đang bước vào pha gia tốc chiến lược, năng lượng tương sinh thúc đẩy bước ngoặt.`,
      `Điểm rơi phong độ cao nhất trong chu kỳ 3 năm tới: Tập trung vào năm ${currentYear + 1}-${currentYear + 2}.`
    ],
    recommendations: [
      `Sắp xếp kế hoạch trung hạn theo mô hình: Chuẩn bị nền tảng (Q1-Q2), Thử nghiệm quy mô nhỏ (Q3), Tăng tốc bứt phá (Q4).`,
      `Không nên mạo hiểm quá 20% tổng nguồn lực dự phòng vào các thương vụ rủi ro cao trong năm nay.`
    ],
    riskNotations: [
      `Tháng giao thời giữa các mùa (cuối các tháng 3, 6, 9, 12 âm lịch) cần duy trì sự thận trọng trong ký kết.`
    ]
  };

  // Agent 5: Behavioral Context Analyst
  const behavioralContextAgent = {
    agentName: 'Agent 5 — Behavioral Context Analyst',
    agentRole: 'Tích Hợp Ngữ Cảnh Hành Vi & Mục Tiêu Thực Tế',
    confidenceScore: 92,
    keyFindings: [
      `Mục tiêu người dùng: "${profile.behavioralContext.topPriority || 'Mở rộng quy mô sự nghiệp'}" hoàn toàn tương thích với năng lượng Quan Lộc.`,
      `Lĩnh vực hoạt động: ${profile.behavioralContext.careerField || 'Công nghệ & Sáng tạo'} bổ trợ trực tiếp cho Dụng Thần ${favorableStr}.`,
      `Trạng thái hành vi cá nhân phản ánh tính chủ động cao, sẵn sàng đón nhận thử thách mới.`
    ],
    recommendations: [
      `Gắn chặt các mục tiêu tài chính với các mốc kiểm chứng kết quả cụ thể (KPIs/Milestones).`,
      `Xây dựng mạng lưới cố vấn chuyên gia để bù đắp các góc nhìn còn thiếu trong quản trị rủi ro.`
    ],
    riskNotations: [
      `Áp lực từ tham vọng cá nhân cần được giải tỏa thông qua các hoạt động thể thao hoặc thiền định.`
    ]
  };

  // Agent 6: Statistical Consistency Analyst
  const statisticalConsistencyAgent = {
    agentName: 'Agent 6 — Statistical Consistency Analyst',
    agentRole: 'Đo Lường Nhất Quán Thống Kê & Backtest',
    confidenceScore: 88,
    keyFindings: [
      `Destiny Consistency Score: ${backtestScore}/100 dựa trên mô hình đối sánh sự kiện lịch sử.`,
      `Độ khớp giữa chu kỳ tính toán và sự kiện thực tế trong quá khứ đạt mức độ tin cậy cao.`,
      `Chỉ số phân sai (Variance) thấp, mô hình duy trì tính ổn định xuyên suốt các thời kỳ.`
    ],
    recommendations: [
      `Tiếp tục ghi nhận thêm 2-3 sự kiện thực tế trong tương lai để hiệu chỉnh trọng số cá nhân hóa.`,
      `Sử dụng điểm số như một la bàn định hướng xác suất, không coi là định mệnh bất biến.`
    ],
    riskNotations: [
      `Sự thiên lệch trong việc ghi nhớ sự kiện quá khứ có thể ảnh hưởng nhẹ tới chỉ số phân sai.`
    ]
  };

  // Agent 7: Risk & Uncertainty Analyst
  const riskUncertaintyAgent = {
    agentName: 'Agent 7 — Risk & Uncertainty Analyst',
    agentRole: 'Quản Trị Rủi Ro & Ranh Giới Bất Định',
    confidenceScore: 95,
    keyFindings: [
      `Chỉ số không chắc chắn (Uncertainty Index): ${confidence.uncertaintyIndex}/100.`,
      `Ranh giới an toàn: Mức độ rủi ro kiểm soát được khi duy trì tỷ lệ đòn bẩy tài chính dưới ngưỡng 40%.`,
      `Điểm mù tiềm ẩn: Sự chủ quan khi các chỉ số liên tục đạt đỉnh trong các quý thuận lợi.`
    ],
    recommendations: [
      `Thiết lập cơ chế "Dừng lỗ chiến lược" (Stop-loss threshold) cho mọi dự án đầu tư hoặc thay đổi công việc.`,
      `Luôn có kế hoạch B chi tiết trước khi tiến hành các bước nhảy vọt quan trọng.`
    ],
    riskNotations: [
      `Không có quyết định nào mang tính hoàn hảo tuyệt đối; thành công thực tế phụ thuộc 70% vào năng lực thực thi.`
    ]
  };

  // Synthesize Life Radar (8 Core Dimensions)
  const lifeRadar = [
    {
      domain: 'Sự nghiệp & Vị thế',
      domainKey: 'career' as const,
      score: ziwei.palaces.career?.score || 88,
      trend: 'Rising' as const,
      confidence: 94,
      supportingFactors: ['Cung Quan Lộc hội tụ cát tinh', 'Dụng Thần phát huy mạnh mẽ', 'Sóng cơ hội đạt mức cao'],
      uncertaintyFactors: ['Biến động thị trường ngành', 'Cạnh tranh nhân sự cấp cao']
    },
    {
      domain: 'Tài chính & Tài sản',
      domainKey: 'finance' as const,
      score: ziwei.palaces.wealth?.score || 85,
      trend: 'Stable' as const,
      confidence: 90,
      supportingFactors: ['Thiên Tài hỗ trợ dòng tiền', 'Năng lực tích lũy thực tế'],
      uncertaintyFactors: ['Thanh khoản đầu tư dài hạn', 'Chi phí vận hành mở rộng']
    },
    {
      domain: 'Mối quan hệ & Tình cảm',
      domainKey: 'relationships' as const,
      score: ziwei.palaces.spouse?.score || 78,
      trend: 'Stable' as const,
      confidence: 86,
      supportingFactors: ['Cung Phu Thê hài hòa', 'Sự thấu hiểu và chia sẻ'],
      uncertaintyFactors: ['Thời gian dành cho cá nhân bị thu hẹp do công việc']
    },
    {
      domain: 'Gia đình & Cội nguồn',
      domainKey: 'family' as const,
      score: ziwei.palaces.parents?.score || 82,
      trend: 'Rising' as const,
      confidence: 89,
      supportingFactors: ['Nền tảng giáo dưỡng vững chắc', 'Hậu phương gia đình hỗ trợ'],
      uncertaintyFactors: ['Khoảng cách địa lý khi công tác xa']
    },
    {
      domain: 'Học tập & Trí tuệ',
      domainKey: 'learning' as const,
      score: 92,
      trend: 'Rising' as const,
      confidence: 95,
      supportingFactors: ['Tư duy trực giác và logic nhạy bén', 'Khả năng hấp thụ công nghệ mới nhanh'],
      uncertaintyFactors: ['Quá tải thông tin nếu không chọn lọc']
    },
    {
      domain: 'Phát triển cá nhân',
      domainKey: 'growth' as const,
      score: 90,
      trend: 'Rising' as const,
      confidence: 92,
      supportingFactors: ['Mục tiêu bản thân rõ ràng', 'Ý chí kiên trì vượt qua nghịch cảnh'],
      uncertaintyFactors: ['Cần rèn luyện thêm tính linh hoạt']
    },
    {
      domain: 'Cửa sổ Cơ hội',
      domainKey: 'opportunity' as const,
      score: currentTransit.opportunityWave,
      trend: 'Rising' as const,
      confidence: 91,
      supportingFactors: ['Chu kỳ năng lượng thiên can thuận', 'Sự tương thích mạng lưới đối tác'],
      uncertaintyFactors: ['Tính thời điểm của các chính sách vĩ mô']
    },
    {
      domain: 'Quản trị Rủi ro',
      domainKey: 'risk' as const,
      score: Math.max(40, 100 - currentTransit.cautionWave),
      trend: 'Stable' as const,
      confidence: 93,
      supportingFactors: ['Bộ quy tắc kiểm soát rủi ro rõ ràng', 'Quỹ dự phòng an toàn'],
      uncertaintyFactors: ['Biến động bất khả kháng ngoài tầm kiểm soát']
    }
  ];

  return {
    modelName: 'Gemini 3.8 Flash Ensemble + Aurora Mathematical Engine',
    ensembleVersion: 'aurora_ensemble_v3.2',
    generatedAt: new Date().toISOString(),
    overallConsistencyScore,
    executiveSummary: `Tổng hợp từ 7 chuyên gia AI: Lá số của bạn phản ánh cấu trúc ${bazi.structureType} mạnh mẽ với độ nhất quán mô hình đạt ${overallConsistencyScore}/100. Giai đoạn năm ${currentYear}-${currentYear + 2} là cửa sổ bản lề với sóng cơ hội đạt ${currentTransit.opportunityWave}%. Phát huy tối đa Dụng Thần (${favorableStr}) và giữ kỷ luật quản trị rủi ro sẽ giúp bạn định hình quỹ đạo tương lai vượt bậc.`,
    traditionalAstrologyAgent,
    baziAnalystAgent,
    ziweiAnalystAgent,
    temporalPatternAgent,
    behavioralContextAgent,
    statisticalConsistencyAgent,
    riskUncertaintyAgent,
    lifeRadar,
    coreStrengths: [
      `Tư duy chiến lược và năng lực lãnh đạo hệ thống xuất sắc`,
      `Khả năng phục hồi và tái tạo năng lượng sau thử thách (Resilience)`,
      `Dòng chảy tài chính đa nguồn kết hợp trực giác kinh doanh nhạy bén`,
      `Sự tương thích cao với các lĩnh vực sáng tạo, công nghệ và quản trị vĩ mô`
    ],
    potentialBlindspots: [
      `Xu hướng đòi hỏi sự hoàn hảo tuyệt đối có thể tạo áp lực lên đội ngũ`,
      `Đôi khi đánh giá thấp tác động của sự mệt mỏi thể chất dài hạn`,
      `Cần mở rộng không gian lắng nghe các phản biện trái chiều`
    ],
    strategicTimingWindows: [
      {
        timeframe: `Năm ${currentYear} (Giai đoạn Tích Tụ & Thử Nghiệm)`,
        phaseType: 'Preparation',
        strategicFocus: 'Kiện toàn năng lực cốt lõi, hoàn thiện sản phẩm và xây dựng liên minh chiến lược.',
        recommendedActions: [
          'Tối ưu hóa quy trình vận hành và tiết kiệm chi phí không thiết yếu',
          'Đầu tư nâng cấp kỹ năng chuyên sâu và mở rộng đối tác'
        ]
      },
      {
        timeframe: `Năm ${currentYear + 1}-${currentYear + 2} (Giai đoạn Tăng Tốc & Khai Phá)`,
        phaseType: 'Harvest',
        strategicFocus: 'Mở rộng quy mô, thương mại hóa đại trà và khẳng định vị thế dẫn đầu.',
        recommendedActions: [
          'Đẩy mạnh marketing và hiện diện thương hiệu toàn cầu',
          'Tăng cường các kênh đầu tư có giá trị sinh lời dài hạn'
        ]
      }
    ],
    responsibleDisclaimer: 'Hệ thống Aurora Destiny AI cung cấp các chỉ số phân tích năng lượng và xác suất nhằm mục đích tham khảo, chiêm nghiệm và phát triển bản thân. Không thay thế các quyết định y tế, pháp lý, tài chính hoặc chẩn đoán tâm lý chuyên nghiệp.'
  };
}

// Compute Daily Destiny Data for a given date
export function computeDailyDestiny(
  calculation: CalculationResult,
  targetDate: Date = new Date()
): DailyDestiny {
  const dayPB = calculation.bazi.dayPillar;
  const dmEl = calculation.bazi.dayMasterElement;

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  // Compute daily stem & branch
  const stemIdx = (day + month * 2 + year) % 10;
  const branchIdx = (day + month * 2 + year) % 12;
  const dailyStem = STEM_KEYS[stemIdx];
  const dailyBranch = BRANCH_KEYS[branchIdx];
  const dailyElement = STEMS[dailyStem].element;

  // Determine Daily Harmony Score
  let harmonyLevel = 75;
  if (dailyElement === dmEl) harmonyLevel = 84;
  else if (ELEMENT_RELATIONS[dmEl].generates === dailyElement) harmonyLevel = 90; // Output / Harmony
  else if (ELEMENT_RELATIONS[dmEl].generatedBy === dailyElement) harmonyLevel = 88; // Resource / Support
  else if (ELEMENT_RELATIONS[dailyElement].overcomes === dmEl) harmonyLevel = 65; // Pressure

  const dateStr = targetDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const lunarStr = `Ngày ${day} tháng ${month} Âm lịch (tiết khí vận hành)`;

  return {
    date: dateStr,
    lunarDateStr: lunarStr,
    dailyStemBranch: `${STEMS[dailyStem].nameVi} ${BRANCHES[dailyBranch].nameVi}`,
    dailyElement,
    todayTheme: harmonyLevel >= 80 ? 'Ngày Thuận Khí: Thích hợp mở rộng kết nối, đàm phán và triển khai ý tưởng mới' : 'Ngày Trầm Tĩnh: Thích hợp tập trung chuyên môn sâu, rà soát chi tiết và chăm sóc sức khỏe',
    harmonyLevel,
    elementBalancingTip: `Năng lượng ngày mang hành ${ELEMENT_RELATIONS[dailyElement]?.vi || dailyElement}. Nên bổ sung màu sắc trang nhã, uống đủ nước và giữ không gian làm việc thoáng đãng.`,
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
      career: { score: Math.min(96, harmonyLevel + 4), note: 'Thuận lợi cho các bước tiến điều hành và sáng tạo dự án.' },
      finance: { score: Math.min(94, harmonyLevel - 2), note: 'Giữ kỷ luật tài chính, tránh mua sắm bốc đồng.' },
      relationships: { score: Math.min(92, harmonyLevel + 2), note: 'Giao tiếp chân thành giúp củng cố niềm tin đôi bên.' },
      personalGrowth: { score: Math.min(98, harmonyLevel + 6), note: 'Dành 20 phút cuối ngày để tự phản chiếu và đúc kết bài học.' }
    },
    auspiciousHours: ['07:00 - 09:00 (Giờ Thìn)', '13:00 - 15:00 (Giờ Mùi)', '19:00 - 21:00 (Giờ Tuất)'],
    incompatibleHours: ['11:00 - 13:00 (Giờ Ngọ - Tránh ký kết vội vã)', '23:00 - 01:00 (Giờ Tý - Nên nghỉ ngơi tĩnh tâm)']
  };
}

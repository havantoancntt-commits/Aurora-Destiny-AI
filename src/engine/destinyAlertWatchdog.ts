// ==============================================================================
// AURORA DESTINY AI — MULTI-PROFILE CELESTIAL WATCHDOG & ALERT ENGINE
// Ultra-precision astronomical and metaphysical real-time alert synthesis
// Grounded in canonical Can-Chi, Four Pillars (Bát Tự) & Zi Wei Dou Shu
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
  getTenGod
} from './canchi';
import {
  calculateYearPillar,
  calculateMonthPillar,
  calculateDayPillar,
  calculateHourPillar
} from './bazi';
import { getSolarTerm } from './lunarSolar';
import { runFullDestinyCalculation } from './destinyEngine';

export type DestinyAlertEventType =
  | 'THIEN_KHAC_DIA_XUNG'
  | 'LUC_XUNG_NATAL'
  | 'TUONG_HINH_HAI'
  | 'THIEN_AT_QUY_NHAN'
  | 'LOC_THAN_TAI_BACH'
  | 'TAM_HOP_CAT_KHANH'
  | 'LUC_HOP_HOA_KHI'
  | 'SOLAR_TERM_INGRESS'
  | 'GOLDEN_HOUR'
  | 'CLASH_HOUR'
  | 'DAILY_BRIEFING';

export type AlertSeverity =
  | 'CRITICAL_POSITIVE'
  | 'HIGH_POSITIVE'
  | 'NEUTRAL_INFO'
  | 'CAUTION_WARNING'
  | 'HIGH_DANGER';

export interface MajorDestinyEvent {
  id: string;
  profileId: string;
  profileName: string;
  relationshipTag?: string;
  eventType: DestinyAlertEventType;
  severity: AlertSeverity;
  urgency: number; // 0 - 100 for priority ordering
  title: string;
  subtitle: string;
  summary: string;
  detailedAdvice: string;
  actionableDos: string[];
  actionableDonts: string[];
  favorableDirections?: string;
  luckyColors?: string;
  targetTime: string;
  timestamp: number;
  expiresAt: number;
  isRead?: boolean;
  pushedToBrowser?: boolean;
}

// 1. Classical Earthly Branch Clash Map (Lục Xung)
const BRANCH_CLASH_MAP: Record<EarthlyBranch, EarthlyBranch> = {
  Zi: 'Wu_B',
  Wu_B: 'Zi',
  Chou: 'Wei',
  Wei: 'Chou',
  Yin_B: 'Shen',
  Shen: 'Yin_B',
  Mao: 'You',
  You: 'Mao',
  Chen: 'Xu',
  Xu: 'Chen',
  Si: 'Hai',
  Hai: 'Si'
};

// 2. Classical Earthly Branch Harm Map (Lục Hại)
const BRANCH_HARM_MAP: Record<EarthlyBranch, EarthlyBranch> = {
  Zi: 'Wei',
  Wei: 'Zi',
  Chou: 'Wu_B',
  Wu_B: 'Chou',
  Yin_B: 'Si',
  Si: 'Yin_B',
  Mao: 'Chen',
  Chen: 'Mao',
  Shen: 'Hai',
  Hai: 'Shen',
  You: 'Xu',
  Xu: 'You'
};

// 3. Three Harmonies Triads (Tam Hợp)
const THREE_HARMONIES_MAP: Record<EarthlyBranch, { group: EarthlyBranch[]; element: FiveElement; nameVi: string }> = {
  Shen: { group: ['Shen', 'Zi', 'Chen'], element: 'Water', nameVi: 'Thân - Tý - Thìn (Thủy cục)' },
  Zi: { group: ['Shen', 'Zi', 'Chen'], element: 'Water', nameVi: 'Thân - Tý - Thìn (Thủy cục)' },
  Chen: { group: ['Shen', 'Zi', 'Chen'], element: 'Water', nameVi: 'Thân - Tý - Thìn (Thủy cục)' },

  Hai: { group: ['Hai', 'Mao', 'Wei'], element: 'Wood', nameVi: 'Hợi - Mão - Mùi (Mộc cục)' },
  Mao: { group: ['Hai', 'Mao', 'Wei'], element: 'Wood', nameVi: 'Hợi - Mão - Mùi (Mộc cục)' },
  Wei: { group: ['Hai', 'Mao', 'Wei'], element: 'Wood', nameVi: 'Hợi - Mão - Mùi (Mộc cục)' },

  Yin_B: { group: ['Yin_B', 'Wu_B', 'Xu'], element: 'Fire', nameVi: 'Dần - Ngọ - Tuất (Hỏa cục)' },
  Wu_B: { group: ['Yin_B', 'Wu_B', 'Xu'], element: 'Fire', nameVi: 'Dần - Ngọ - Tuất (Hỏa cục)' },
  Xu: { group: ['Yin_B', 'Wu_B', 'Xu'], element: 'Fire', nameVi: 'Dần - Ngọ - Tuất (Hỏa cục)' },

  Si: { group: ['Si', 'You', 'Chou'], element: 'Metal', nameVi: 'Tỵ - Dậu - Sửu (Kim cục)' },
  You: { group: ['Si', 'You', 'Chou'], element: 'Metal', nameVi: 'Tỵ - Dậu - Sửu (Kim cục)' },
  Chou: { group: ['Si', 'You', 'Chou'], element: 'Metal', nameVi: 'Tỵ - Dậu - Sửu (Kim cục)' }
};

// 4. Six Combinations (Lục Hợp)
const SIX_COMBINATIONS_MAP: Record<EarthlyBranch, { partner: EarthlyBranch; element: FiveElement }> = {
  Zi: { partner: 'Chou', element: 'Earth' },
  Chou: { partner: 'Zi', element: 'Earth' },
  Yin_B: { partner: 'Hai', element: 'Wood' },
  Hai: { partner: 'Yin_B', element: 'Wood' },
  Mao: { partner: 'Xu', element: 'Fire' },
  Xu: { partner: 'Mao', element: 'Fire' },
  Chen: { partner: 'You', element: 'Metal' },
  You: { partner: 'Chen', element: 'Metal' },
  Si: { partner: 'Shen', element: 'Water' },
  Shen: { partner: 'Si', element: 'Water' },
  Wu_B: { partner: 'Wei', element: 'Earth' },
  Wei: { partner: 'Wu_B', element: 'Earth' }
};

// 5. Heavenly Noble (Thiên Ất Quý Nhân) according to Day Master Stem
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

// 6. Prosperity Star (Lộc Thần / Lâm Quan Vị) according to Day Master Stem
const PROSPERITY_BRANCHES: Record<HeavenlyStem, EarthlyBranch> = {
  Jia: 'Yin_B',
  Yi: 'Mao',
  Bing: 'Si',
  Wu: 'Si',
  Ding: 'Wu_B',
  Ji: 'Wu_B',
  Geng: 'Shen',
  Xin: 'You',
  Ren: 'Hai',
  Gui: 'Zi'
};

// 7. Heavenly Stem Direct Clash pairs
function isStemClash(s1: HeavenlyStem, s2: HeavenlyStem): boolean {
  const clashPairs: [HeavenlyStem, HeavenlyStem][] = [
    ['Jia', 'Geng'], ['Geng', 'Jia'],
    ['Yi', 'Xin'], ['Xin', 'Yi'],
    ['Bing', 'Ren'], ['Ren', 'Bing'],
    ['Ding', 'Gui'], ['Gui', 'Ding'],
    ['Jia', 'Wu'], ['Wu', 'Jia'],
    ['Yi', 'Ji'], ['Ji', 'Yi']
  ];
  return clashPairs.some(([a, b]) => a === s1 && b === s2);
}

// 8. 24 Solar Term names list for detection
const MAJOR_SOLAR_TERMS = [
  'Lập Xuân', 'Vũ Thủy', 'Kinh Trập', 'Xuân Phân', 'Thanh Minh', 'Cốc Vũ',
  'Lập Hạ', 'Tiểu Mãn', 'Mang Chủng', 'Hạ Chí', 'Tiểu Thử', 'Đại Thử',
  'Lập Thu', 'Xử Thử', 'Bạch Lộ', 'Thu Phân', 'Hàn Lộ', 'Sương Giáng',
  'Lập Đông', 'Tiểu Tuyết', 'Đại Tuyết', 'Đông Chí', 'Tiểu Hàn', 'Đại Hàn'
];

/**
 * Scans and synthesizes all high-priority celestial events for a set of user profiles.
 */
export function scanMajorEventsForProfiles(
  profiles: UserProfile[],
  cachedCalculations: Record<string, CalculationResult | null> = {},
  now: Date = new Date(),
  timezoneOffset: number = 7
): MajorDestinyEvent[] {
  if (!profiles || profiles.length === 0) return [];

  // Compute Current Astronomical Time Pillars
  const targetUtcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localTargetDate = new Date(targetUtcMs + (timezoneOffset * 3600000));

  const year = localTargetDate.getFullYear();
  const month = localTargetDate.getMonth() + 1;
  const day = localTargetDate.getDate();
  const hours = localTargetDate.getHours();
  const minutes = localTargetDate.getMinutes();

  const yearPillar = calculateYearPillar(year, month, day, timezoneOffset, hours, minutes);
  const monthPillar = calculateMonthPillar(yearPillar.stem, year, month, day, timezoneOffset, hours, minutes);
  const dayPillar = calculateDayPillar(year, month, day, hours, false);
  const hourPillar = calculateHourPillar(dayPillar.stem, hours, minutes, false);

  const solarTerm = getSolarTerm(year, month, day);

  const dayStemKey = dayPillar.stem;
  const dayBranchKey = dayPillar.branch;
  const dayStemNameVi = STEMS[dayStemKey].nameVi;
  const dayBranchNameVi = BRANCHES[dayBranchKey].nameVi;

  const hourStemKey = hourPillar.stem;
  const hourBranchKey = hourPillar.branch;
  const hourStemNameVi = STEMS[hourStemKey].nameVi;
  const hourBranchNameVi = BRANCHES[hourBranchKey].nameVi;

  const dateIdStr = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
  const events: MajorDestinyEvent[] = [];

  // Optional: Global Solar Term Ingress check
  if (solarTerm && MAJOR_SOLAR_TERMS.includes(solarTerm)) {
    events.push({
      id: `evt_${dateIdStr}_global_solar_term_${solarTerm}`,
      profileId: 'global',
      profileName: 'Thiên Địa Vũ Trụ',
      relationshipTag: 'Toàn thể',
      eventType: 'SOLAR_TERM_INGRESS',
      severity: 'NEUTRAL_INFO',
      urgency: 70,
      title: `Tiết Khí Chuyển Giao: ${solarTerm}`,
      subtitle: `Điểm giao hòa năng lượng giữa Trời và Đất trong chu kỳ 24 Tiết Khí`,
      summary: `Hôm nay bước vào Tiết ${solarTerm}. Vận khí âm dương hoán chuyển, là thời khắc tối thích hợp để tĩnh tâm, thanh lọc cơ thể và hướng thượng.`,
      detailedAdvice: `Trong ngày chuyển giao tiết khí, năng lượng từ trường trái đất có sự biến thiên mạnh. Khuyến nghị giữ thân tâm an tĩnh, ăn uống thanh đạm, tránh lao lực quá độ và lập tâm nguyện tích cực cho chu kỳ mới.`,
      actionableDos: ['Ngồi thiền định tâm', 'Uống trà thảo mộc thanh lọc', 'Lập kế hoạch thanh tịnh'],
      actionableDonts: ['Tránh thức khuya quá 23h', 'Tránh cáu giận thị phi', 'Không lao lực kiệt sức'],
      favorableDirections: 'Tây Bắc & Đông Nam',
      luckyColors: 'Trắng Ngà, Xanh Lam',
      targetTime: 'Cả ngày hôm nay',
      timestamp: localTargetDate.getTime(),
      expiresAt: localTargetDate.getTime() + 24 * 3600 * 1000
    });
  }

  // Iterate each profile and test personal natal chart interactions
  for (const prof of profiles) {
    if (!prof.birthData) continue;

    let calc = cachedCalculations[prof.id];
    if (!calc) {
      try {
        calc = runFullDestinyCalculation(prof.birthData, prof.id, 0);
      } catch (err) {
        console.warn(`[Watchdog] Calculation error for profile ${prof.name}:`, err);
        continue;
      }
    }

    if (!calc || !calc.bazi) continue;

    const bazi = calc.bazi;
    const dayMasterStem: HeavenlyStem = bazi.dayMaster;
    const natalYearBranch = bazi.yearPillar.branch;
    const natalDayBranch = bazi.dayPillar.branch;

    const profileName = prof.name || 'Bản Thân';
    const relTag = prof.tag ? (prof.tag === 'self' ? 'Bản thân' : prof.tag === 'family' ? 'Gia đình' : prof.tag === 'partner' ? 'Đối tác' : prof.tag) : 'Lá số lưu';

    // -------------------------------------------------------------
    // EVENT 1: THIÊN KHẮC ĐỊA XUNG (Cực trọng — Xung cả Can lẫn Chi ngày)
    // -------------------------------------------------------------
    const isDayStemClashWithDayMaster = isStemClash(dayStemKey, dayMasterStem);
    const isDayBranchClashWithNatalDay = BRANCH_CLASH_MAP[dayBranchKey] === natalDayBranch;

    if (isDayStemClashWithDayMaster && isDayBranchClashWithNatalDay) {
      events.push({
        id: `evt_${dateIdStr}_${prof.id}_THIEN_KHAC_DIA_XUNG`,
        profileId: prof.id,
        profileName,
        relationshipTag: relTag,
        eventType: 'THIEN_KHAC_DIA_XUNG',
        severity: 'HIGH_DANGER',
        urgency: 98,
        title: `⚠️ Cảnh Báo Trọng Yếu: Thiên Khắc Địa Xung (${profileName})`,
        subtitle: `Ngày ${dayStemNameVi} ${dayBranchNameVi} trực khắc Thiên Can & Địa Chi Trụ Ngày của ${profileName}`,
        summary: `Hôm nay là ngày Thiên Khắc Địa Xung trực diện với trụ ngày bản mệnh (${STEMS[dayMasterStem].nameVi} ${BRANCHES[natalDayBranch].nameVi}). Năng lượng biến động cực mạnh, tiềm ẩn va chạm hoặc áp lực đột ngột.`,
        detailedAdvice: `Khuyên ${profileName} tuyệt đối 'Dĩ tĩnh chế động'. Không khởi sự kinh doanh mạo hiểm, không ký hợp đồng lớn, tránh xung đột ngôn từ, và đặc biệt chú ý an toàn khi tham gia giao thông. Hãy giữ tâm hòa hoãn, nhường nhịn.`,
        actionableDos: ['Lùi lại quan sát, nhẫn nại', 'Hòa hoãn mọi tranh cãi', 'Ưu tiên nghỉ ngơi và tĩnh tâm'],
        actionableDonts: ['Tránh ký hợp đồng lớn hôm nay', 'Tránh đầu tư tài chính mạo hiểm', 'Không lái xe khi mệt mỏi'],
        favorableDirections: 'Bình tĩnh tại trung tâm, hạn chế xuất hành xa',
        luckyColors: 'Màu tương sinh ngũ hành dung hòa (Vàng nhạt, Trắng)',
        targetTime: 'Cả ngày hôm nay',
        timestamp: localTargetDate.getTime(),
        expiresAt: localTargetDate.getTime() + 24 * 3600 * 1000
      });
    }

    // -------------------------------------------------------------
    // EVENT 2: LỤC XUNG BẢN MỆNH (Trực xung với Chi Năm hoặc Chi Ngày)
    // -------------------------------------------------------------
    const isYearClash = BRANCH_CLASH_MAP[dayBranchKey] === natalYearBranch;
    const isDayClash = BRANCH_CLASH_MAP[dayBranchKey] === natalDayBranch;

    if (isYearClash && !events.some((e) => e.profileId === prof.id && e.eventType === 'THIEN_KHAC_DIA_XUNG')) {
      events.push({
        id: `evt_${dateIdStr}_${prof.id}_LUC_XUNG_YEAR`,
        profileId: prof.id,
        profileName,
        relationshipTag: relTag,
        eventType: 'LUC_XUNG_NATAL',
        severity: 'CAUTION_WARNING',
        urgency: 88,
        title: `⚡ Cảnh Báo: Ngày Lục Xung Tuổi ${BRANCHES[natalYearBranch].nameVi} (${profileName})`,
        subtitle: `Ngày ${dayBranchNameVi} xung khắc Chi Năm ${BRANCHES[natalYearBranch].nameVi}`,
        summary: `Hôm nay Địa Chi ngày ${dayBranchNameVi} trực xung với tuổi ${BRANCHES[natalYearBranch].nameVi} của ${profileName}. Dễ sinh cảm giác nóng vội, bất an hoặc trở ngại từ ngoại cảnh.`,
        detailedAdvice: `Đây là chu kỳ 'Xung vi động' (Xung sinh ra biến động). Lời khuyên vàng: Kiểm tra kỹ giấy tờ, làm việc thong thả, không để cảm xúc nhất thời chi phối. Lắng nghe nhiều hơn nói.`,
        actionableDos: ['Làm việc theo kế hoạch có sẵn', 'Kiểm tra kỹ lưỡng văn bản', 'Thực hành hơi thở sâu khi căng thẳng'],
        actionableDonts: ['Tránh quyết định bộc phát', 'Không tranh chấp với cấp trên hoặc đối tác', 'Tránh cho vay tiền nóng'],
        favorableDirections: 'Đông Bắc & Tây Nam',
        luckyColors: 'Màu dung hòa ngũ hành',
        targetTime: 'Cả ngày hôm nay',
        timestamp: localTargetDate.getTime(),
        expiresAt: localTargetDate.getTime() + 24 * 3600 * 1000
      });
    } else if (isDayClash && !events.some((e) => e.profileId === prof.id && e.eventType === 'THIEN_KHAC_DIA_XUNG')) {
      events.push({
        id: `evt_${dateIdStr}_${prof.id}_LUC_XUNG_DAY`,
        profileId: prof.id,
        profileName,
        relationshipTag: relTag,
        eventType: 'LUC_XUNG_NATAL',
        severity: 'CAUTION_WARNING',
        urgency: 85,
        title: `⚡ Cảnh Báo: Ngày Xung Chi Ngày Bản Mệnh (${profileName})`,
        subtitle: `Ngày ${dayBranchNameVi} xung cung Phu Thê / Thân Thể (${BRANCHES[natalDayBranch].nameVi})`,
        summary: `Hôm nay ngày ${dayBranchNameVi} tương xung với Chi Ngày sinh. Cần đặc biệt chú ý giữ gìn sự hòa hợp trong gia đạo, nhường nhịn bạn đời và chăm sóc sức khỏe tiêu hóa.`,
        detailedAdvice: `Giao tiếp vợ chồng / người thân cần mềm mỏng, tránh bắt bẻ lỗi nhỏ. Dành thời gian chăm sóc bữa ăn gia đình đầm ấm.`,
        actionableDos: ['Chia sẻ chân thành, lắng nghe bạn đời', 'Chăm sóc sức khỏe thân thể', 'Tập trung nội tại'],
        actionableDonts: ['Tránh tranh cãi chuyện cũ', 'Không suy diễn tiêu cực'],
        favorableDirections: 'Bắc & Nam',
        luckyColors: 'Xanh Lá, Xanh Ngọc',
        targetTime: 'Cả ngày hôm nay',
        timestamp: localTargetDate.getTime(),
        expiresAt: localTargetDate.getTime() + 24 * 3600 * 1000
      });
    }

    // -------------------------------------------------------------
    // EVENT 3: THIÊN ẤT QUÝ NHÂN (Vượng cát khí, quý nhân phù trợ)
    // -------------------------------------------------------------
    const nobleBranchesForDM = NOBLE_BRANCHES[dayMasterStem] || [];
    const isNobleDay = nobleBranchesForDM.includes(dayBranchKey);

    if (isNobleDay) {
      events.push({
        id: `evt_${dateIdStr}_${prof.id}_THIEN_AT_QUY_NHAN`,
        profileId: prof.id,
        profileName,
        relationshipTag: relTag,
        eventType: 'THIEN_AT_QUY_NHAN',
        severity: 'CRITICAL_POSITIVE',
        urgency: 92,
        title: `✨ Ngày Đại Cát: Thiên Ất Quý Nhân Giáng Lâm (${profileName})`,
        subtitle: `Ngày ${dayBranchNameVi} là Thiên Ất Quý Nhân của Nhật Chủ ${STEMS[dayMasterStem].nameVi}`,
        summary: `Cát tinh đệ nhất chiếu rọi! Hôm nay là ngày Thiên Ất Quý Nhân của ${profileName}. Khí trường hanh thông, gặp khó hóa lành, dễ được cấp trên, quý nhân hoặc bậc tiền bối giúp đỡ.`,
        detailedAdvice: `Thời điểm vàng để hẹn gặp đối tác, phỏng vấn xin việc, đệ trình đề xuất, thi cử, hoặc giải quyết những khúc mắc tồn đọng. Hãy chủ động mở lời và tự tin đón nhận cơ hội.`,
        actionableDos: ['Gặp gỡ đối tác quan trọng', 'Ký kết hợp đồng, chốt thương vụ', 'Xin lời khuyên từ chuyên gia / cấp trên'],
        actionableDonts: ['Không lười biếng bỏ lỡ cơ hội', 'Không khép kín tự cô lập'],
        favorableDirections: 'Đông & Đông Nam',
        luckyColors: 'Vàng Hoàng Kim, Đỏ Chu Sa, Tím Nhạt',
        targetTime: 'Cả ngày hôm nay',
        timestamp: localTargetDate.getTime(),
        expiresAt: localTargetDate.getTime() + 24 * 3600 * 1000
      });
    }

    // -------------------------------------------------------------
    // EVENT 4: LỘC THẦN TÀI BẠCH (Vượng tài lộc hanh thông)
    // -------------------------------------------------------------
    const prosperityBranchForDM = PROSPERITY_BRANCHES[dayMasterStem];
    const isProsperityDay = prosperityBranchForDM === dayBranchKey;

    if (isProsperityDay) {
      events.push({
        id: `evt_${dateIdStr}_${prof.id}_LOC_THAN_TAI_BACH`,
        profileId: prof.id,
        profileName,
        relationshipTag: relTag,
        eventType: 'LOC_THAN_TAI_BACH',
        severity: 'HIGH_POSITIVE',
        urgency: 90,
        title: `💰 Ngày Lộc Thần Đắc Vị: Khởi Tài Đón Lộc (${profileName})`,
        subtitle: `Ngày ${dayBranchNameVi} là cung Lộc Thần của Nhật Chủ ${STEMS[dayMasterStem].nameVi}`,
        summary: `Hôm nay ${dayBranchNameVi} là đất Lâm Quan đắc Lộc của ${profileName}. Năng lượng tài chính, thành quả lao động và doanh thu có cơ hội bứt phá mạnh mẽ.`,
        detailedAdvice: `Thích hợp mở hàng, tung sản phẩm mới, thu hồi nợ, ký hợp đồng thương mại hoặc đầu tư có kế hoạch. Hãy hào sảng và trân trọng đồng tiền kiếm được từ sự chính trực.`,
        actionableDos: ['Khai trương, mở hàng, giao dịch', 'Gặp gỡ khách hàng tiềm năng', 'Trích một phần tài lộc làm phúc thiện'],
        actionableDonts: ['Không hoang phí vô độ', 'Tránh tham gia cờ bạc may rủi phi pháp'],
        favorableDirections: 'Chính Nam & Chính Đông',
        luckyColors: 'Vàng Thần Tài, Xanh Lá Phong Thủy',
        targetTime: 'Cả ngày hôm nay',
        timestamp: localTargetDate.getTime(),
        expiresAt: localTargetDate.getTime() + 24 * 3600 * 1000
      });
    }

    // -------------------------------------------------------------
    // EVENT 5: TAM HỢP CÁT KHÁNH (Hòa khí, đồng lòng)
    // -------------------------------------------------------------
    const threeHarmoniesData = THREE_HARMONIES_MAP[natalDayBranch];
    const isThreeHarmoniesDay = threeHarmoniesData && threeHarmoniesData.group.includes(dayBranchKey) && dayBranchKey !== natalDayBranch;

    if (isThreeHarmoniesDay && !isNobleDay && !isProsperityDay) {
      events.push({
        id: `evt_${dateIdStr}_${prof.id}_TAM_HOP_CAT_KHANH`,
        profileId: prof.id,
        profileName,
        relationshipTag: relTag,
        eventType: 'TAM_HOP_CAT_KHANH',
        severity: 'HIGH_POSITIVE',
        urgency: 78,
        title: `🤝 Ngày Tam Hợp Cát Khánh: Hòa Hợp & Đồng Thuận (${profileName})`,
        subtitle: `Ngày ${dayBranchNameVi} hợp với Chi Ngày ${BRANCHES[natalDayBranch].nameVi} tạo ${threeHarmoniesData.nameVi}`,
        summary: `Hôm nay trường năng lượng tạo thế Tam Hợp tương trợ cho ${profileName}. Tinh thần đoàn kết, sự ủng hộ từ đồng nghiệp và gia đình tăng cao.`,
        detailedAdvice: `Rất tốt cho họp nhóm, thảo luận kế hoạch dài hạn, hòa giải bất hòa cũ hoặc ra mắt gia đình. Năng lượng gắn kết bền vững.`,
        actionableDos: ['Họp mặt bàn bạc công việc', 'Tổ chức tiệc gắn kết gia đình', 'Kêu gọi sự đồng thuận'],
        actionableDonts: ['Tránh bảo thủ ý kiến cá nhân', 'Không ép buộc người khác'],
        favorableDirections: 'Chính Bắc & Đông',
        luckyColors: 'Trắng Sữa, Xanh Dương',
        targetTime: 'Cả ngày hôm nay',
        timestamp: localTargetDate.getTime(),
        expiresAt: localTargetDate.getTime() + 24 * 3600 * 1000
      });
    }

    // -------------------------------------------------------------
    // EVENT 6: GIỜ QUÝ NHÂN / LỘC THẦN TRONG CANH GIỜ HIỆN TẠI
    // -------------------------------------------------------------
    const isCurrentHourNoble = nobleBranchesForDM.includes(hourBranchKey);
    const isCurrentHourProsperity = prosperityBranchForDM === hourBranchKey;
    const isCurrentHourClash = BRANCH_CLASH_MAP[hourBranchKey] === natalDayBranch || BRANCH_CLASH_MAP[hourBranchKey] === natalYearBranch;

    if (isCurrentHourNoble) {
      events.push({
        id: `evt_${dateIdStr}_${prof.id}_HOUR_NOBLE_${hourBranchKey}`,
        profileId: prof.id,
        profileName,
        relationshipTag: relTag,
        eventType: 'GOLDEN_HOUR',
        severity: 'HIGH_POSITIVE',
        urgency: 94,
        title: `👑 Canh Giờ Quý Nhân: ${hourStemNameVi} ${hourBranchNameVi} (${profileName})`,
        subtitle: `Khung giờ hiện tại kích hoạt Thiên Ất Quý Nhân của ${profileName}`,
        summary: `Canh giờ ${hourBranchNameVi} đang mang cát khí Quý Nhân cực thịnh. Hãy tận dụng ngay thời khắc này để thực hiện các cuộc gọi, email hoặc quyết định the chốt.`,
        detailedAdvice: `Tập trung cao độ trong 2 giờ này. Sự hỗ trợ và may mắn sẽ cao hơn bình thường.`,
        actionableDos: ['Gửi email, hồ sơ quan trọng', 'Đưa ra quyết định then chốt', 'Liên hệ đối tác lớn'],
        actionableDonts: ['Tránh lướt mạng xã hội lãng phí thời gian quý báu'],
        targetTime: `Canh giờ hiện tại (${hourStemNameVi} ${hourBranchNameVi})`,
        timestamp: localTargetDate.getTime(),
        expiresAt: localTargetDate.getTime() + 2 * 3600 * 1000
      });
    } else if (isCurrentHourProsperity) {
      events.push({
        id: `evt_${dateIdStr}_${prof.id}_HOUR_PROSPERITY_${hourBranchKey}`,
        profileId: prof.id,
        profileName,
        relationshipTag: relTag,
        eventType: 'GOLDEN_HOUR',
        severity: 'HIGH_POSITIVE',
        urgency: 91,
        title: `💎 Canh Giờ Lộc Thần: ${hourStemNameVi} ${hourBranchNameVi} (${profileName})`,
        subtitle: `Khung giờ đắc Tài Lộc của Nhật Chủ ${STEMS[dayMasterStem].nameVi}`,
        summary: `Canh giờ ${hourBranchNameVi} đang hội tụ tài khí. Giao dịch hoặc ký nhận tài sản trong giờ này vô cùng thuận lợi.`,
        detailedAdvice: `Thích hợp mở két, chuyển tiền kinh doanh hoặc trao đổi dự án sinh lời.`,
        actionableDos: ['Giao dịch tài chính', 'Ký văn bản thương mại'],
        actionableDonts: ['Tránh chi tiêu cảm tính hoang phí'],
        targetTime: `Canh giờ hiện tại (${hourStemNameVi} ${hourBranchNameVi})`,
        timestamp: localTargetDate.getTime(),
        expiresAt: localTargetDate.getTime() + 2 * 3600 * 1000
      });
    } else if (isCurrentHourClash) {
      events.push({
        id: `evt_${dateIdStr}_${prof.id}_HOUR_CLASH_${hourBranchKey}`,
        profileId: prof.id,
        profileName,
        relationshipTag: relTag,
        eventType: 'CLASH_HOUR',
        severity: 'CAUTION_WARNING',
        urgency: 84,
        title: `⏳ Canh Giờ Xung Sát: ${hourStemNameVi} ${hourBranchNameVi} (${profileName})`,
        subtitle: `Canh giờ ${hourBranchNameVi} xung với Chi Bản Mệnh (${BRANCHES[natalDayBranch].nameVi})`,
        summary: `Khung giờ ${hourBranchNameVi} này đối xung năng lượng với bản mệnh của ${profileName}. Khuyên giữ nhịp độ chậm rãi, kiềm chế nóng giận.`,
        detailedAdvice: `Uống một cốc nước ấm, hít thở sâu, tránh tranh cãi vô bổ và cẩn trọng khi đi lại trong 2 giờ này.`,
        actionableDos: ['Làm việc nhẹ nhàng, lắng nghe', 'Nghỉ ngơi 5-10 phút'],
        actionableDonts: ['Không đôi co, không lái xe tốc độ cao'],
        targetTime: `Canh giờ hiện tại (${hourStemNameVi} ${hourBranchNameVi})`,
        timestamp: localTargetDate.getTime(),
        expiresAt: localTargetDate.getTime() + 2 * 3600 * 1000
      });
    }
  }

  // Sort events by urgency descending
  return events.sort((a, b) => b.urgency - a.urgency);
}

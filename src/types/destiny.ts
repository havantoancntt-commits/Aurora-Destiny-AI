// ==========================================
// AURORA DESTINY AI — CORE TYPE DEFINITIONS
// ==========================================

export type LanguageCode =
  | 'vi' // Vietnamese
  | 'en' // English
  | 'zh-CN' // Simplified Chinese
  | 'zh-TW' // Traditional Chinese
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'fr' // French
  | 'de' // German
  | 'es' // Spanish
  | 'it' // Italian
  | 'pt' // Portuguese
  | 'hi' // Hindi
  | 'th' // Thai
  | 'id' // Indonesian
  | 'ru'; // Russian

export type FiveElement = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
// Vietnamese: Mộc, Hỏa, Thổ, Kim, Thủy

export type YinYang = 'Yin' | 'Yang';

export type HeavenlyStem =
  | 'Jia' | 'Yi' // Giáp, Ất (Wood)
  | 'Bing' | 'Ding' // Bính, Đinh (Fire)
  | 'Wu' | 'Ji' // Mậu, Kỷ (Earth)
  | 'Geng' | 'Xin' // Canh, Tân (Metal)
  | 'Ren' | 'Gui'; // Nhâm, Quý (Water)

export type EarthlyBranch =
  | 'Zi' | 'Chou' | 'Yin_B' | 'Mao' | 'Chen' | 'Si'
  | 'Wu_B' | 'Wei' | 'Shen' | 'You' | 'Xu' | 'Hai';
// Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi

export interface StemInfo {
  key: HeavenlyStem;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  element: FiveElement;
  yinYang: YinYang;
  color: string;
}

export interface BranchInfo {
  key: EarthlyBranch;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  zodiacVi: string;
  zodiacEn: string;
  element: FiveElement;
  yinYang: YinYang;
  hiddenStems: HeavenlyStem[];
}

export interface PillarData {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: FiveElement;
  branchElement: FiveElement;
  hiddenStems: { stem: HeavenlyStem; element: FiveElement; tenGod: string }[];
  naYin: string; // Nạp âm
  tenGod: string; // Thập thần
  strength: number; // 0-100
}

export interface BaZiChart {
  yearPillar: PillarData;
  monthPillar: PillarData;
  dayPillar: PillarData; // Day Master (Nhật Chủ)
  hourPillar: PillarData;
  dayMaster: HeavenlyStem;
  dayMasterElement: FiveElement;
  dayMasterStrength: 'Very Weak' | 'Weak' | 'Balanced' | 'Strong' | 'Very Strong';
  elementBalance: Record<FiveElement, number>; // percentages summing to 100
  favorableElements: FiveElement[]; // Dụng Thần & Hỷ Thần
  unfavorableElements: FiveElement[]; // Kỵ Thần
  structureType: string; // Cách cục (e.g. Chính Quan Cách, Thiên Tài Cách,...)
  tenGodDistribution: Record<string, number>;
}

export type PalaceKey =
  | 'life' // Mệnh
  | 'siblings' // Huynh Đệ
  | 'spouse' // Phu Thê
  | 'children' // Tử Tức
  | 'wealth' // Tài Bạch
  | 'health' // Tật Ách
  | 'travel' // Thiên Di
  | 'friends' // Nô Bộc
  | 'career' // Quan Lộc
  | 'property' // Điền Trạch
  | 'karma' // Phúc Đức
  | 'parents'; // Phụ Mẫu

export interface ZiWeiStar {
  nameVi: string;
  nameEn: string;
  nameZh: string;
  brightness: 'M' | 'V' | 'D' | 'B' | 'H'; // Miếu, Vượng, Đắc, Bình, Hãm
  element: FiveElement;
  transformation?: 'Lu' | 'Quan' | 'Khoa' | 'Ky'; // Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ
  type: 'Major' | 'Lucky' | 'Challenging' | 'Auxiliary';
}

export interface ZiWeiPalace {
  key: PalaceKey;
  nameVi: string;
  nameEn: string;
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  majorStars: ZiWeiStar[];
  minorStars: ZiWeiStar[];
  transformations: string[];
  score: number; // 0 - 100
  focalTheme: string;
  startAge?: number; // Đại vận bắt đầu từ tuổi
  endAge?: number; // Đại vận kết thúc ở tuổi
  decadeRangeStr?: string; // Chuỗi đại vận (vd: "24 - 33")
  trangSinhStar?: string; // Vòng Tràng Sinh (Tràng Sinh, Mộc Dục, Lâm Quan, Đế Vượng...)
  thaiTueStar?: string; // Vòng Thái Tuế (Thái Tuế, Tang Môn, Bạch Hổ...)
  bacSyStar?: string; // Vòng Bác Sĩ (Bác Sĩ, Lực Sĩ, Tướng Quân...)
  tuanTriet?: ('Tuần' | 'Triệt')[]; // Tuần/Triệt ngộ cung
  isBodyPalace?: boolean; // Thân cư tại cung này
}

export interface ZiWeiChart {
  palaces: Record<PalaceKey, ZiWeiPalace>;
  bodyPalaceKey: PalaceKey; // Thân Cung
  lifePalaceKey: PalaceKey; // Mệnh Cung
  elementBureau: string; // Cục (Hỏa Lục Cục, Thủy Nhị Cục...)
  cucNumber?: number; // 2, 3, 4, 5, 6
  majorConfigurations: string[]; // Các cách cục đặc biệt xác thực
  yinYangGenderHarmony?: {
    yinYangNature: string; // vd: Dương Nam / Âm Nữ
    isHarmonious: boolean; // Âm Dương Thuận Lý hay Nghịch Lý
    direction: 'Thuận Lý' | 'Nghịch Lý';
    decadeDirection: 'Thuận' | 'Nghịch';
    explanation: string;
  };
  elementDestinyBureauHarmony?: {
    birthYearNaYin: string;
    elementBureau: string;
    relation: 'Cục Sinh Mệnh' | 'Mệnh Cục Tỷ Hòa' | 'Mệnh Sinh Cục' | 'Mệnh Khắc Cục' | 'Cục Khắc Mệnh';
    quality: 'Cát Lợi' | 'Bình Hòa' | 'Hao Tổn' | 'Thử Thách' | 'Nghịch Cảnh';
    explanation: string;
  };
  bodyPalaceAnalysis?: {
    palaceKey: PalaceKey;
    palaceName: string;
    meaning: string;
    lifeImpact: string;
  };
  currentDecade?: {
    palaceKey: PalaceKey;
    palaceName: string;
    startAge: number;
    endAge: number;
    stem: HeavenlyStem;
    branch: EarthlyBranch;
    majorStars: string[];
    evaluation: string;
  };
  currentYearTransit?: {
    year: number;
    stem: HeavenlyStem;
    branch: EarthlyBranch;
    palaceKey: PalaceKey;
    palaceName: string;
    liuStars: string[];
    summary: string;
  };
  tuanPalaces?: EarthlyBranch[];
  trietPalaces?: EarthlyBranch[];
  authenticAnalysis?: {
    coreEssence: string;
    personalityAndTalents: string;
    careerAndWealthTrajectory: string;
    relationshipsAndFamily: string;
    decadeAndCurrentYearGuidance: string;
    strategicAdvice: string;
  };
  calculationConvention?: {
    yearConvention: 'solarLapXuan' | 'lunarNewYear';
    leapMonthConvention: 'midMonthSplit' | 'keepMonth';
    rulesVersion: string;
    description: string;
  };
}

export interface DecadeCycle {
  index: number;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  element: FiveElement;
  tenGod: string;
  focalPalace: PalaceKey;
  harmonyScore: number; // 0 - 100
  keyThemes: string[];
  opportunitySignals: string[];
  cautionSignals: string[];
}

export interface AnnualTransit {
  year: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  element: FiveElement;
  tenGod: string;
  overallScore: number; // 0 - 100
  careerScore: number;
  wealthScore: number;
  relationshipScore: number;
  healthScore: number;
  growthScore: number;
  opportunityWave: number; // 0 - 100
  cautionWave: number; // 0 - 100
  highlightSummary: string;
  recommendedFocus: string;
}

export type Gender = 'Male' | 'Female' | 'Other' | 'PreferNotToSay';

export interface BirthData {
  solarYear: number;
  solarMonth: number; // 1-12
  solarDay: number; // 1-31
  solarHour: number; // 0-23
  solarMinute: number; // 0-59
  hasExactHour: boolean;
  lunarYear?: number;
  lunarMonth?: number;
  lunarDay?: number;
  isLeapMonth?: boolean;
  birthCity: string;
  birthCountry: string;
  timezoneOffset: number; // e.g. +7 for UTC+7
  timezoneName: string;
  gender: Gender;
  calendarSystem: 'solar' | 'lunar';
  isLateRat?: boolean; // Configuration for hour 23 (Dạ Tý)
  timeConvention?: 'civil' | 'trueSolar'; // Astronomical time convention
  ziweiYearConvention?: 'solarLapXuan' | 'lunarNewYear'; // Orthodox Lunar Year vs Solar Term Lap Xuan
  ziweiLeapMonthConvention?: 'midMonthSplit' | 'keepMonth'; // Mid-month split (classical) vs Keep-month
  longitude?: number; // Geographic longitude in degrees for True Solar Time (e.g. 105.85 for Hanoi)
  latitude?: number; // Geographic latitude in degrees (-90 to +90)
}

export interface BehavioralContext {
  careerField: string;
  employmentStatus: string;
  financialGoal: string;
  relationshipStatus: string;
  topPriority: string;
  personalNotes: string;
}

export interface ConfidenceMetrics {
  consistencyScore: number; // 0 - 100
  dataCompleteness: number; // 0 - 100
  historicalFit: number; // 0 - 100
  signalStrength: number; // 0 - 100
  uncertaintyIndex: number; // 0 - 100
  resolutionLevel: 'High' | 'Medium' | 'Estimated';
  assumptions: string[];
  limitations: string[];
  // Distinct multi-dimensional confidence layers (Audit Section IV)
  calculationConfidence: number; // 0 - 100: Astronomical and ephemeris calculation precision
  calculationIntegrity?: number; // Architectural alias for calculation precision/invariants
  ruleValidationStatus?: 'PASSED' | 'WARNING' | 'FAILED'; // System invariant validation status
  inputQuality: number; // 0 - 100: Completeness and coordinate exactness of user input
  modelAgreement: number; // 0 - 100: Concordance between BaZi and Zi Wei indicators
  referenceAgreement?: number; // Granular cross-framework structural concordance
  validationScore: number; // 0 - 100: Internal mathematical and astronomical invariant checks
  historicalValidation: number; // 0 - 100: Strictly empirical score from verified backtest events
  historicalBacktestScore?: number; // Explicit empirical score (0 if no events)
  historicalBacktestStatus?: 'AVAILABLE' | 'NOT_AVAILABLE'; // Explicit semantic status
  interpretiveConfidence: number; // 0 - 100: Bounded qualitative confidence for AI synthesis
  statisticalDisclaimer: string; // Explicit non-deterministic disclaimer
}

export interface CalculationResult {
  id: string;
  profileId: string;
  calculationVersion: string;
  astrologyRulesVersion: string;
  analysisModelVersion: string;
  analysisYear: number;
  canonicalInput?: any;
  timestamp: string;
  inputSnapshot: BirthData;
  bazi: BaZiChart;
  ziwei: ZiWeiChart;
  decades: DecadeCycle[];
  annualTransits: AnnualTransit[];
  confidence: ConfidenceMetrics;
  effectiveBirthTime?: {
    effectiveDate: { year: number; month: number; day: number };
    effectiveHour: number;
    effectiveMinute: number;
    timeConvention: 'civil' | 'trueSolar';
    equationOfTimeMinutes: number;
    longitudeCorrectionMinutes: number;
    totalCorrectionMinutes: number;
    dayShift: number;
  };
  cryptographicSignature?: {
    signature: string;
    sealTimestamp: string;
    algorithmHash: string;
    issuer: string;
    verified: boolean;
  };
}

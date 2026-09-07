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
}

export interface ZiWeiChart {
  palaces: Record<PalaceKey, ZiWeiPalace>;
  bodyPalaceKey: PalaceKey; // Thân Cung
  lifePalaceKey: PalaceKey; // Mệnh Cung
  elementBureau: string; // Cục (Hỏa Lục Cục, Thủy Nhị Cục...)
  majorConfigurations: string[]; // Các cách cục đặc biệt
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
  // Distinct multi-dimensional confidence layers (Section VIII)
  calculationConfidence: number; // 0 - 100: Astronomical and ephemeris calculation precision
  inputQuality: number; // 0 - 100: Completeness and coordinate exactness of user input
  modelAgreement: number; // 0 - 100: Concordance between BaZi and Zi Wei indicators
  validationScore: number; // 0 - 100: Internal mathematical and astronomical invariant checks
  historicalValidation: number; // 0 - 100: Strictly empirical score from verified backtest events
  interpretiveConfidence: number; // 0 - 100: Bounded qualitative confidence for AI synthesis
  statisticalDisclaimer: string; // Explicit non-deterministic disclaimer
}

export interface CalculationResult {
  id: string;
  profileId: string;
  calculationVersion: string;
  astrologyRulesVersion: string;
  analysisModelVersion: string;
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
}

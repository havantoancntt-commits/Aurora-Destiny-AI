// ==========================================
// AURORA DESTINY AI — GLOBALIZATION & ASTRONOMY ENGINE
// Enterprise-Grade Internationalization, True Solar Time (EoT),
// Timezones, Astrological Glossaries, Currencies & Regional Formats
// ==========================================

import { LanguageCode, HeavenlyStem, EarthlyBranch, FiveElement } from '../types/destiny';

export type AstrologyTerminologyMode = 'vietnamese' | 'international' | 'bilingual';
export type LateRatRule = 'early_rat_same_day' | 'late_rat_next_day';
export type ChronologySystem = 'solar_terms' | 'lunar_civil';
export type SupportedCurrency = 'VND' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'AUD' | 'SGD' | 'CAD';
export type DateFormatPattern = 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
export type TimeFormatPattern = '24h' | '12h';

export interface WorldLocation {
  id: string;
  nameVi: string;
  nameEn: string;
  countryVi: string;
  countryEn: string;
  countryCode: string;
  flag: string;
  longitude: number; // Positive = East, Negative = West
  latitude: number;  // Positive = North, Negative = South
  timezone: string;
  utcOffset: number;
}

export interface GlobalSettings {
  language: LanguageCode;
  terminologyMode: AstrologyTerminologyMode;
  location: WorldLocation;
  enableTrueSolarTime: boolean;
  lateRatRule: LateRatRule;
  chronologySystem: ChronologySystem;
  currency: SupportedCurrency;
  dateFormat: DateFormatPattern;
  timeFormat: TimeFormatPattern;
  measurementSystem: 'metric' | 'imperial';
}

// ----------------------------------------------------
// CURATED WORLD CITIES & PROVINCES DATABASE (ASTRONOMICAL COORDINATES)
// ----------------------------------------------------
export const WORLD_LOCATIONS: WorldLocation[] = [
  // Việt Nam - Các Thành Phố & Tỉnh Trọng Điểm
  {
    id: 'vn-hanoi',
    nameVi: 'Hà Nội',
    nameEn: 'Hanoi',
    countryVi: 'Việt Nam',
    countryEn: 'Vietnam',
    countryCode: 'VN',
    flag: '🇻🇳',
    longitude: 105.85,
    latitude: 21.03,
    timezone: 'Asia/Ho_Chi_Minh',
    utcOffset: 7
  },
  {
    id: 'vn-hcm',
    nameVi: 'TP. Hồ Chí Minh',
    nameEn: 'Ho Chi Minh City',
    countryVi: 'Việt Nam',
    countryEn: 'Vietnam',
    countryCode: 'VN',
    flag: '🇻🇳',
    longitude: 106.66,
    latitude: 10.76,
    timezone: 'Asia/Ho_Chi_Minh',
    utcOffset: 7
  },
  {
    id: 'vn-danang',
    nameVi: 'Đà Nẵng',
    nameEn: 'Da Nang',
    countryVi: 'Việt Nam',
    countryEn: 'Vietnam',
    countryCode: 'VN',
    flag: '🇻🇳',
    longitude: 108.22,
    latitude: 16.05,
    timezone: 'Asia/Ho_Chi_Minh',
    utcOffset: 7
  },
  {
    id: 'vn-haiphong',
    nameVi: 'Hải Phòng',
    nameEn: 'Hai Phong',
    countryVi: 'Việt Nam',
    countryEn: 'Vietnam',
    countryCode: 'VN',
    flag: '🇻🇳',
    longitude: 106.68,
    latitude: 20.84,
    timezone: 'Asia/Ho_Chi_Minh',
    utcOffset: 7
  },
  {
    id: 'vn-cantho',
    nameVi: 'Cần Thơ',
    nameEn: 'Can Tho',
    countryVi: 'Việt Nam',
    countryEn: 'Vietnam',
    countryCode: 'VN',
    flag: '🇻🇳',
    longitude: 105.78,
    latitude: 10.04,
    timezone: 'Asia/Ho_Chi_Minh',
    utcOffset: 7
  },
  {
    id: 'vn-hue',
    nameVi: 'Thừa Thiên Huế',
    nameEn: 'Hue',
    countryVi: 'Việt Nam',
    countryEn: 'Vietnam',
    countryCode: 'VN',
    flag: '🇻🇳',
    longitude: 107.59,
    latitude: 16.46,
    timezone: 'Asia/Ho_Chi_Minh',
    utcOffset: 7
  },
  {
    id: 'vn-nhatrang',
    nameVi: 'Nha Trang (Khánh Hòa)',
    nameEn: 'Nha Trang',
    countryVi: 'Việt Nam',
    countryEn: 'Vietnam',
    countryCode: 'VN',
    flag: '🇻🇳',
    longitude: 109.19,
    latitude: 12.24,
    timezone: 'Asia/Ho_Chi_Minh',
    utcOffset: 7
  },
  {
    id: 'vn-dalat',
    nameVi: 'Đà Lạt (Lâm Đồng)',
    nameEn: 'Da Lat',
    countryVi: 'Việt Nam',
    countryEn: 'Vietnam',
    countryCode: 'VN',
    flag: '🇻🇳',
    longitude: 108.45,
    latitude: 11.94,
    timezone: 'Asia/Ho_Chi_Minh',
    utcOffset: 7
  },

  // Đông Á & Đông Nam Á
  {
    id: 'jp-tokyo',
    nameVi: 'Tokyo',
    nameEn: 'Tokyo',
    countryVi: 'Nhật Bản',
    countryEn: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    longitude: 139.69,
    latitude: 35.68,
    timezone: 'Asia/Tokyo',
    utcOffset: 9
  },
  {
    id: 'kr-seoul',
    nameVi: 'Seoul',
    nameEn: 'Seoul',
    countryVi: 'Hàn Quốc',
    countryEn: 'South Korea',
    countryCode: 'KR',
    flag: '🇰🇷',
    longitude: 126.97,
    latitude: 37.56,
    timezone: 'Asia/Seoul',
    utcOffset: 9
  },
  {
    id: 'cn-beijing',
    nameVi: 'Bắc Kinh',
    nameEn: 'Beijing',
    countryVi: 'Trung Quốc',
    countryEn: 'China',
    countryCode: 'CN',
    flag: '🇨🇳',
    longitude: 116.40,
    latitude: 39.90,
    timezone: 'Asia/Shanghai',
    utcOffset: 8
  },
  {
    id: 'tw-taipei',
    nameVi: 'Đài Bắc',
    nameEn: 'Taipei',
    countryVi: 'Đài Loan',
    countryEn: 'Taiwan',
    countryCode: 'TW',
    flag: '🇹🇼',
    longitude: 121.56,
    latitude: 25.03,
    timezone: 'Asia/Taipei',
    utcOffset: 8
  },
  {
    id: 'sg-singapore',
    nameVi: 'Singapore',
    nameEn: 'Singapore',
    countryVi: 'Singapore',
    countryEn: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    longitude: 103.85,
    latitude: 1.35,
    timezone: 'Asia/Singapore',
    utcOffset: 8
  },
  {
    id: 'th-bangkok',
    nameVi: 'Bangkok',
    nameEn: 'Bangkok',
    countryVi: 'Thái Lan',
    countryEn: 'Thailand',
    countryCode: 'TH',
    flag: '🇹🇭',
    longitude: 100.50,
    latitude: 13.75,
    timezone: 'Asia/Bangkok',
    utcOffset: 7
  },

  // Châu Âu
  {
    id: 'fr-paris',
    nameVi: 'Paris',
    nameEn: 'Paris',
    countryVi: 'Pháp',
    countryEn: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    longitude: 2.35,
    latitude: 48.85,
    timezone: 'Europe/Paris',
    utcOffset: 1
  },
  {
    id: 'gb-london',
    nameVi: 'Luân Đôn',
    nameEn: 'London',
    countryVi: 'Vương Quốc Anh',
    countryEn: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    longitude: -0.12,
    latitude: 51.50,
    timezone: 'Europe/London',
    utcOffset: 0
  },
  {
    id: 'de-berlin',
    nameVi: 'Berlin',
    nameEn: 'Berlin',
    countryVi: 'Đức',
    countryEn: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    longitude: 13.40,
    latitude: 52.52,
    timezone: 'Europe/Berlin',
    utcOffset: 1
  },
  {
    id: 'it-rome',
    nameVi: 'Rome',
    nameEn: 'Rome',
    countryVi: 'Ý',
    countryEn: 'Italy',
    countryCode: 'IT',
    flag: '🇮🇹',
    longitude: 12.49,
    latitude: 41.90,
    timezone: 'Europe/Rome',
    utcOffset: 1
  },
  {
    id: 'ru-moscow',
    nameVi: 'Moskva',
    nameEn: 'Moscow',
    countryVi: 'Nga',
    countryEn: 'Russia',
    countryCode: 'RU',
    flag: '🇷🇺',
    longitude: 37.61,
    latitude: 55.75,
    timezone: 'Europe/Moscow',
    utcOffset: 3
  },

  // Bắc Mỹ & Châu Đại Dương
  {
    id: 'us-newyork',
    nameVi: 'New York',
    nameEn: 'New York',
    countryVi: 'Hoa Kỳ',
    countryEn: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    longitude: -74.00,
    latitude: 40.71,
    timezone: 'America/New_York',
    utcOffset: -5
  },
  {
    id: 'us-losangeles',
    nameVi: 'Los Angeles (California)',
    nameEn: 'Los Angeles',
    countryVi: 'Hoa Kỳ',
    countryEn: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    longitude: -118.24,
    latitude: 34.05,
    timezone: 'America/Los_Angeles',
    utcOffset: -8
  },
  {
    id: 'us-houston',
    nameVi: 'Houston (Texas)',
    nameEn: 'Houston',
    countryVi: 'Hoa Kỳ',
    countryEn: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    longitude: -95.36,
    latitude: 29.76,
    timezone: 'America/Chicago',
    utcOffset: -6
  },
  {
    id: 'ca-toronto',
    nameVi: 'Toronto',
    nameEn: 'Toronto',
    countryVi: 'Canada',
    countryEn: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    longitude: -79.38,
    latitude: 43.65,
    timezone: 'America/Toronto',
    utcOffset: -5
  },
  {
    id: 'au-sydney',
    nameVi: 'Sydney',
    nameEn: 'Sydney',
    countryVi: 'Úc',
    countryEn: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    longitude: 151.20,
    latitude: -33.86,
    timezone: 'Australia/Sydney',
    utcOffset: 10
  },
  {
    id: 'au-melbourne',
    nameVi: 'Melbourne',
    nameEn: 'Melbourne',
    countryVi: 'Úc',
    countryEn: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    longitude: 144.96,
    latitude: -37.81,
    timezone: 'Australia/Melbourne',
    utcOffset: 10
  }
];

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  language: 'vi',
  terminologyMode: 'vietnamese',
  location: WORLD_LOCATIONS[0], // Hà Nội
  enableTrueSolarTime: true,
  lateRatRule: 'late_rat_next_day',
  chronologySystem: 'solar_terms',
  currency: 'VND',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  measurementSystem: 'metric'
};

// ----------------------------------------------------
// ASTRONOMICAL COMPUTATIONS: TRUE SOLAR TIME (EOT)
// ----------------------------------------------------
/**
 * Equation of Time (EoT) calculation in minutes.
 * Accounts for Earth's orbital eccentricity and axial tilt.
 */
export function calculateEquationOfTime(dayOfYear: number): number {
  // Angle B in radians
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  // Spencer's approximation in minutes
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

/**
 * Helper to get day of year from day, month, year
 */
export function getDayOfYear(year: number, month: number, day: number): number {
  const date = new Date(year, month - 1, day);
  const start = new Date(year, 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Calculates True Solar Time (Giờ Mặt Trời Thật) based on:
 * - Standard Civil Time (Hour, Minute)
 * - Longitude of birth location
 * - Timezone Standard Meridian (utcOffset * 15°)
 * - Equation of Time (EoT) on the given date
 */
export function calculateTrueSolarTime(
  year: number,
  month: number,
  day: number,
  civilHour: number,
  civilMinute: number,
  longitude: number,
  utcOffset: number
): {
  trueHour: number;
  trueMinute: number;
  offsetMinutes: number;
  longitudeOffsetMinutes: number;
  eotMinutes: number;
  explanation: string;
} {
  const standardMeridian = utcOffset * 15; // 15° per hour of timezone
  // 4 minutes per 1 degree of longitude difference
  const longitudeOffsetMinutes = (longitude - standardMeridian) * 4;

  const dayOfYear = getDayOfYear(year, month, day);
  const eotMinutes = calculateEquationOfTime(dayOfYear);

  const totalOffsetMinutes = longitudeOffsetMinutes + eotMinutes;

  let totalCivilMinutes = civilHour * 60 + civilMinute + totalOffsetMinutes;
  
  // Wrap in 24-hour cycle
  while (totalCivilMinutes < 0) totalCivilMinutes += 24 * 60;
  while (totalCivilMinutes >= 24 * 60) totalCivilMinutes -= 24 * 60;

  const trueHour = Math.floor(totalCivilMinutes / 60);
  const trueMinute = Math.round(totalCivilMinutes % 60);

  const sign = totalOffsetMinutes >= 0 ? '+' : '';
  const explanation = `Kinh độ ${longitude.toFixed(2)}° (lệch ${longitudeOffsetMinutes >= 0 ? '+' : ''}${longitudeOffsetMinutes.toFixed(1)}p) & Phương trình Thời gian EoT (${eotMinutes >= 0 ? '+' : ''}${eotMinutes.toFixed(1)}p) => Tổng hiệu chỉnh: ${sign}${totalOffsetMinutes.toFixed(1)} phút.`;

  return {
    trueHour,
    trueMinute,
    offsetMinutes: totalOffsetMinutes,
    longitudeOffsetMinutes,
    eotMinutes,
    explanation
  };
}

// ----------------------------------------------------
// ASTROLOGY GLOSSARY: TRILINGUAL MAPPINGS
// ----------------------------------------------------
export const STEM_GLOSSARY: Record<HeavenlyStem, { vi: string; en: string; zh: string; elementVi: string; elementEn: string }> = {
  Jia: { vi: 'Giáp', en: 'Yang Wood', zh: '甲', elementVi: 'Dương Mộc', elementEn: 'Yang Wood' },
  Yi: { vi: 'Ất', en: 'Yin Wood', zh: '乙', elementVi: 'Âm Mộc', elementEn: 'Yin Wood' },
  Bing: { vi: 'Bính', en: 'Yang Fire', zh: '丙', elementVi: 'Dương Hỏa', elementEn: 'Yang Fire' },
  Ding: { vi: 'Đinh', en: 'Yin Fire', zh: '丁', elementVi: 'Âm Hỏa', elementEn: 'Yin Fire' },
  Wu: { vi: 'Mậu', en: 'Yang Earth', zh: '戊', elementVi: 'Dương Thổ', elementEn: 'Yang Earth' },
  Ji: { vi: 'Kỷ', en: 'Yin Earth', zh: '己', elementVi: 'Âm Thổ', elementEn: 'Yin Earth' },
  Geng: { vi: 'Canh', en: 'Yang Metal', zh: '庚', elementVi: 'Dương Kim', elementEn: 'Yang Metal' },
  Xin: { vi: 'Tân', en: 'Yin Metal', zh: '辛', elementVi: 'Âm Kim', elementEn: 'Yin Metal' },
  Ren: { vi: 'Nhâm', en: 'Yang Water', zh: '壬', elementVi: 'Dương Thủy', elementEn: 'Yang Water' },
  Gui: { vi: 'Quý', en: 'Yin Water', zh: '癸', elementVi: 'Âm Thủy', elementEn: 'Yin Water' }
};

export const BRANCH_GLOSSARY: Record<EarthlyBranch, { vi: string; en: string; zh: string; animalVi: string; animalEn: string }> = {
  Zi: { vi: 'Tý', en: 'Zi (Rat)', zh: '子', animalVi: 'Chuột', animalEn: 'Rat' },
  Chou: { vi: 'Sửu', en: 'Chou (Ox)', zh: '丑', animalVi: 'Trâu', animalEn: 'Ox' },
  Yin_B: { vi: 'Dần', en: 'Yin (Tiger)', zh: '寅', animalVi: 'Hổ', animalEn: 'Tiger' },
  Mao: { vi: 'Mão', en: 'Mao (Rabbit/Cat)', zh: '卯', animalVi: 'Mèo / Thỏ', animalEn: 'Rabbit' },
  Chen: { vi: 'Thìn', en: 'Chen (Dragon)', zh: '辰', animalVi: 'Rồng', animalEn: 'Dragon' },
  Si: { vi: 'Tỵ', en: 'Si (Snake)', zh: '巳', animalVi: 'Rắn', animalEn: 'Snake' },
  Wu_B: { vi: 'Ngọ', en: 'Wu (Horse)', zh: '午', animalVi: 'Ngựa', animalEn: 'Horse' },
  Wei: { vi: 'Mùi', en: 'Wei (Goat)', zh: '未', animalVi: 'Dê', animalEn: 'Goat' },
  Shen: { vi: 'Thân', en: 'Shen (Monkey)', zh: '申', animalVi: 'Khỉ', animalEn: 'Monkey' },
  You: { vi: 'Dậu', en: 'You (Rooster)', zh: '酉', animalVi: 'Gà', animalEn: 'Rooster' },
  Xu: { vi: 'Tuất', en: 'Xu (Dog)', zh: '戌', animalVi: 'Chó', animalEn: 'Dog' },
  Hai: { vi: 'Hợi', en: 'Hai (Pig)', zh: '亥', animalVi: 'Lợn', animalEn: 'Pig' }
};

export const TEN_GODS_GLOSSARY: Record<string, { vi: string; en: string; zh: string; descriptionVi: string; descriptionEn: string }> = {
  'Chính Quan': { vi: 'Chính Quan', en: 'Direct Officer', zh: '正官', descriptionVi: 'Chính trực, kỷ luật, địa vị lãnh đạo', descriptionEn: 'Discipline, leadership, nobility' },
  'Thất Sát': { vi: 'Thất Sát', en: 'Seven Killings', zh: '七杀', descriptionVi: 'Bản lĩnh, uy quyền, đột phá quyết liệt', descriptionEn: 'Courage, assertiveness, breakthrough' },
  'Chính Ấn': { vi: 'Chính Ấn', en: 'Direct Resource', zh: '正印', descriptionVi: 'Tri thức uyên bác, quý nhân bảo bọc', descriptionEn: 'Knowledge, wisdom, benevolence' },
  'Thiên Ấn': { vi: 'Thiên Ấn', en: 'Indirect Resource', zh: '偏印', descriptionVi: 'Trực giác nhạy bén, thiên phú học thuật', descriptionEn: 'Intuition, mysticism, insight' },
  'Chính Tài': { vi: 'Chính Tài', en: 'Direct Wealth', zh: '正财', descriptionVi: 'Tài sản bền vững, cần cù, quản trị', descriptionEn: 'Steady wealth, diligence, management' },
  'Thiên Tài': { vi: 'Thiên Tài', en: 'Indirect Wealth', zh: '偏财', descriptionVi: 'Nhạy bén cơ hội, tài lộc hanh thông', descriptionEn: 'Opportunity, dynamic wealth, entrepreneurship' },
  'Thực Thần': { vi: 'Thực Thần', en: 'Eating God', zh: '食神', descriptionVi: 'Nghệ thuật, hòa nhã, phúc lộc tự nhiên', descriptionEn: 'Creativity, prosperity, enjoyment' },
  'Thương Quan': { vi: 'Thương Quan', en: 'Hurting Officer', zh: '伤官', descriptionVi: 'Tài hoa phát tiết, sáng tạo ngoại hạng', descriptionEn: 'Talent, innovation, nonconformity' },
  'Tỷ Kiên': { vi: 'Tỷ Kiên', en: 'Friend', zh: '比肩', descriptionVi: 'Tự lập kiên cường, ý chí thép', descriptionEn: 'Independence, willpower, solidarity' },
  'Kiếp Tài': { vi: 'Kiếp Tài', en: 'Rob Wealth', zh: '劫财', descriptionVi: 'Cạnh tranh, thích mạo hiểm chinh phục', descriptionEn: 'Competitiveness, charisma, ambition' }
};

export const PALACE_GLOSSARY: Record<string, { vi: string; en: string; zh: string }> = {
  life: { vi: 'Mệnh Cung', en: 'Life Palace', zh: '命宫' },
  siblings: { vi: 'Huynh Đệ', en: 'Siblings Palace', zh: '兄弟宫' },
  spouse: { vi: 'Phu Thê', en: 'Spouse Palace', zh: '夫妻宫' },
  children: { vi: 'Tử Tức', en: 'Children Palace', zh: '子女宫' },
  wealth: { vi: 'Tài Bạch', en: 'Wealth Palace', zh: '财帛宫' },
  health: { vi: 'Tật Ách', en: 'Health Palace', zh: '疾厄宫' },
  travel: { vi: 'Thiên Di', en: 'Travel Palace', zh: '迁移宫' },
  friends: { vi: 'Nô Bộc', en: 'Friends Palace', zh: '交友宫' },
  career: { vi: 'Quan Lộc', en: 'Career Palace', zh: '官禄宫' },
  property: { vi: 'Điền Trạch', en: 'Property Palace', zh: '田宅宫' },
  karma: { vi: 'Phúc Đức', en: 'Karma Palace', zh: '福德宫' },
  parents: { vi: 'Phụ Mẫu', en: 'Parents Palace', zh: '父母宫' }
};

/**
 * Formats a celestial term according to the chosen terminology mode
 */
export function formatTerm(
  termVi: string,
  termEn: string,
  mode: AstrologyTerminologyMode
): string {
  if (mode === 'international') return termEn;
  if (mode === 'bilingual') return `${termVi} (${termEn})`;
  return termVi;
}

// ----------------------------------------------------
// CURRENCY & NUMERIC FORMATTING
// ----------------------------------------------------
export function formatCurrencyAmount(
  amount: number,
  currency: SupportedCurrency = 'VND',
  language: LanguageCode = 'vi'
): string {
  const currencyConfigs: Record<SupportedCurrency, { locale: string; currency: string; symbol: string }> = {
    VND: { locale: 'vi-VN', currency: 'VND', symbol: '₫' },
    USD: { locale: 'en-US', currency: 'USD', symbol: '$' },
    EUR: { locale: 'de-DE', currency: 'EUR', symbol: '€' },
    JPY: { locale: 'ja-JP', currency: 'JPY', symbol: '¥' },
    GBP: { locale: 'en-GB', currency: 'GBP', symbol: '£' },
    AUD: { locale: 'en-AU', currency: 'AUD', symbol: 'A$' },
    SGD: { locale: 'en-SG', currency: 'SGD', symbol: 'S$' },
    CAD: { locale: 'en-CA', currency: 'CAD', symbol: 'C$' }
  };

  const conf = currencyConfigs[currency] || currencyConfigs.VND;
  try {
    return new Intl.NumberFormat(conf.locale, {
      style: 'currency',
      currency: conf.currency,
      maximumFractionDigits: currency === 'VND' || currency === 'JPY' ? 0 : 2
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${conf.symbol}`;
  }
}

// ----------------------------------------------------
// STORAGE & REACTIVE SYNCHRONIZATION
// ----------------------------------------------------
const STORAGE_KEY = 'aurora_global_international_settings';

export function loadGlobalSettings(): GlobalSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_GLOBAL_SETTINGS, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_GLOBAL_SETTINGS;
}

export function saveGlobalSettings(settings: GlobalSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('aurora-settings-changed', { detail: settings }));
  } catch (e) {
    console.warn('Unable to persist global settings', e);
  }
}

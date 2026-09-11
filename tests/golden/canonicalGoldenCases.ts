// ==========================================
// AURORA DESTINY AI — CANONICAL GOLDEN DATASET
// Ground truth benchmarks for astrological calculations,
// temporal corrections, ephemeris crossings, and determinism.
// ==========================================

import { HeavenlyStem, EarthlyBranch, FiveElement } from '../../src/types/destiny';

export interface CanonicalGoldenCase {
  id: string;
  description: string;
  source: string;
  sourceVersion: string;
  referenceSystem: string;
  convention: string;
  verificationStatus: 'VERIFIED_ASTRONOMICAL_EPHEMERIS' | 'CANONICAL_REFERENCE_CASE';
  notes: string;
  birthDate: {
    year: number;
    month: number;
    day: number;
  };
  birthTime: {
    hour: number;
    minute: number;
    hasExactHour: boolean;
  };
  timezone: {
    timezoneOffset: number;
    timezoneName: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  gender: 'Male' | 'Female';
  calendarConvention: {
    calendarSystem: 'solar' | 'lunar';
    isLeapMonth?: boolean;
    timeConvention: 'civil' | 'trueSolar';
    isLateRat: boolean;
  };
  expectedCanonicalTime: {
    effectiveYear: number;
    effectiveMonth: number;
    effectiveDay: number;
    effectiveHour: number;
    dayShiftApplied: number; // -1, 0, or +1
  };
  expectedBaZi: {
    yearPillar: { stem: HeavenlyStem; branch: EarthlyBranch };
    monthPillar: { stem: HeavenlyStem; branch: EarthlyBranch };
    dayPillar: { stem: HeavenlyStem; branch: EarthlyBranch };
    hourPillar: { stem: HeavenlyStem; branch: EarthlyBranch };
    dayMaster: HeavenlyStem;
    dayMasterElement: FiveElement;
  };
  expectedZiWei: {
    elementBureauStartsWith: string; // e.g. "Hỏa Lục Cục", "Mộc Tam Cục", "Kim Tứ Cục", "Thủy Nhị Cục"
    lifePalaceBranch: EarthlyBranch;
  };
}

/**
 * Verified Golden Cases with Ground-Truth Astronomical & Astrological Benchmarks
 */
export const CANONICAL_GOLDEN_CASES: CanonicalGoldenCase[] = [
  {
    id: 'GOLDEN_01_HANOI_STANDARD_AFTERNOON',
    description: 'Standard Modern Afternoon Birth (Hanoi, UTC+7, Civil Time)',
    source: 'Astronomical Almanac of Vietnam / Khâm Định Vạn Niên Lịch',
    sourceVersion: 'Almanac_VN_1995',
    referenceSystem: 'VSOP87 / Tử Bình Tiêu Chuẩn',
    convention: 'Civil Time UTC+7 / Standard Solar Terms',
    verificationStatus: 'VERIFIED_ASTRONOMICAL_EPHEMERIS',
    notes: 'Verified against canonical 1995 Gregorian-to-Lunar tables and solar terms.',
    birthDate: { year: 1995, month: 8, day: 18 },
    birthTime: { hour: 14, minute: 30, hasExactHour: true },
    timezone: { timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh' },
    coordinates: { latitude: 21.0285, longitude: 105.8542, city: 'Hanoi', country: 'Vietnam' },
    gender: 'Male',
    calendarConvention: {
      calendarSystem: 'solar',
      timeConvention: 'civil',
      isLateRat: false
    },
    expectedCanonicalTime: {
      effectiveYear: 1995,
      effectiveMonth: 8,
      effectiveDay: 18,
      effectiveHour: 14,
      dayShiftApplied: 0
    },
    expectedBaZi: {
      yearPillar: { stem: 'Yi', branch: 'Hai' }, // Ất Hợi (1995)
      monthPillar: { stem: 'Jia', branch: 'Shen' }, // Giáp Thân (Tháng 8 sau Lập Thu)
      dayPillar: { stem: 'Xin', branch: 'Si' }, // Tân Tỵ (1995-08-18)
      hourPillar: { stem: 'Yi', branch: 'Wei' }, // Ất Mùi (14:30)
      dayMaster: 'Xin',
      dayMasterElement: 'Metal'
    },
    expectedZiWei: {
      elementBureauStartsWith: 'Hỏa Lục Cục',
      lifePalaceBranch: 'Chou'
    }
  },
  {
    id: 'GOLDEN_02_PRE_LAP_XUAN_BOUNDARY',
    description: 'Pre-Lập Xuân Boundary Instant (2024-02-02) -> Belongs to Quý Mão 2023 cycle',
    source: 'NASA JPL Horizons Ephemeris / Sun Longitude λ < 315°',
    sourceVersion: 'JPL_DE440_2024',
    referenceSystem: 'Astronomical Solar Ecliptic Longitude (Sun deg: 312.8°)',
    convention: 'Lập Xuân (315°) Year Invariant boundary',
    verificationStatus: 'VERIFIED_ASTRONOMICAL_EPHEMERIS',
    notes: 'Sun longitude is strictly < 315°, correctly resolved into preceding Quý Mão year.',
    birthDate: { year: 2024, month: 2, day: 2 },
    birthTime: { hour: 10, minute: 0, hasExactHour: true },
    timezone: { timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh' },
    coordinates: { latitude: 21.0285, longitude: 105.8542, city: 'Hanoi', country: 'Vietnam' },
    gender: 'Male',
    calendarConvention: {
      calendarSystem: 'solar',
      timeConvention: 'civil',
      isLateRat: false
    },
    expectedCanonicalTime: {
      effectiveYear: 2024,
      effectiveMonth: 2,
      effectiveDay: 2,
      effectiveHour: 10,
      dayShiftApplied: 0
    },
    expectedBaZi: {
      yearPillar: { stem: 'Gui', branch: 'Mao' }, // Quý Mão (pre-Lập Xuân Feb 4)
      monthPillar: { stem: 'Yi', branch: 'Chou' }, // Ất Sửu
      dayPillar: { stem: 'Bing', branch: 'Shen' }, // Bính Thân
      hourPillar: { stem: 'Gui', branch: 'Si' }, // Quý Tỵ
      dayMaster: 'Bing',
      dayMasterElement: 'Fire'
    },
    expectedZiWei: {
      elementBureauStartsWith: 'Mộc Tam Cục',
      lifePalaceBranch: 'Shen'
    }
  },
  {
    id: 'GOLDEN_03_POST_LAP_XUAN_BOUNDARY',
    description: 'Post-Lập Xuân Boundary Instant (2024-02-06) -> Belongs to Giáp Thìn 2024 cycle',
    source: 'NASA JPL Horizons Ephemeris / Sun Longitude λ >= 315°',
    sourceVersion: 'JPL_DE440_2024',
    referenceSystem: 'Astronomical Solar Ecliptic Longitude (Sun deg: 316.9°)',
    convention: 'Lập Xuân (315°) Year Invariant boundary',
    verificationStatus: 'VERIFIED_ASTRONOMICAL_EPHEMERIS',
    notes: 'Sun longitude crossed 315° on 2024-02-04, affirming Giáp Thìn year pillar.',
    birthDate: { year: 2024, month: 2, day: 6 },
    birthTime: { hour: 10, minute: 0, hasExactHour: true },
    timezone: { timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh' },
    coordinates: { latitude: 21.0285, longitude: 105.8542, city: 'Hanoi', country: 'Vietnam' },
    gender: 'Female',
    calendarConvention: {
      calendarSystem: 'solar',
      timeConvention: 'civil',
      isLateRat: false
    },
    expectedCanonicalTime: {
      effectiveYear: 2024,
      effectiveMonth: 2,
      effectiveDay: 6,
      effectiveHour: 10,
      dayShiftApplied: 0
    },
    expectedBaZi: {
      yearPillar: { stem: 'Jia', branch: 'Chen' }, // Giáp Thìn (post-Lập Xuân Feb 4)
      monthPillar: { stem: 'Bing', branch: 'Yin_B' }, // Bính Dần
      dayPillar: { stem: 'Geng', branch: 'Zi' }, // Canh Tý
      hourPillar: { stem: 'Xin', branch: 'Si' }, // Tân Tỵ
      dayMaster: 'Geng',
      dayMasterElement: 'Metal'
    },
    expectedZiWei: {
      elementBureauStartsWith: 'Kim Tứ Cục',
      lifePalaceBranch: 'Shen'
    }
  },
  {
    id: 'GOLDEN_04_LATE_RAT_DAY_ROLLOVER',
    description: 'Late Rat Hour (Dạ Tý at 23:30) with convention isLateRat: true -> Advances day pillar',
    source: 'Tử Bình Chân Thuyên & Tam Mệnh Thông Hội / Tranh Luận Dạ Tý',
    sourceVersion: 'Classical_ZiPing_Vol2',
    referenceSystem: 'Ngũ Thử Độn / Dạ Tý Phân Định',
    convention: 'isLateRat: true (Advances day stem/branch to next day count)',
    verificationStatus: 'CANONICAL_REFERENCE_CASE',
    notes: 'Standardized rollover for modern practitioners adopting the Late Rat day shift.',
    birthDate: { year: 2024, month: 5, day: 10 },
    birthTime: { hour: 23, minute: 30, hasExactHour: true },
    timezone: { timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh' },
    coordinates: { latitude: 10.8231, longitude: 106.6297, city: 'Ho Chi Minh City', country: 'Vietnam' },
    gender: 'Male',
    calendarConvention: {
      calendarSystem: 'solar',
      timeConvention: 'civil',
      isLateRat: true
    },
    expectedCanonicalTime: {
      effectiveYear: 2024,
      effectiveMonth: 5,
      effectiveDay: 10,
      effectiveHour: 23,
      dayShiftApplied: 0
    },
    expectedBaZi: {
      yearPillar: { stem: 'Jia', branch: 'Chen' },
      monthPillar: { stem: 'Ji', branch: 'Si' },
      dayPillar: { stem: 'Yi', branch: 'Hai' }, // May 11 Day Pillar (shifted from May 10 Giáp Tuất)
      hourPillar: { stem: 'Bing', branch: 'Zi' }, // Bính Tý
      dayMaster: 'Yi',
      dayMasterElement: 'Wood'
    },
    expectedZiWei: {
      elementBureauStartsWith: 'Mộc Tam Cục',
      lifePalaceBranch: 'Si'
    }
  },
  {
    id: 'GOLDEN_05_TRUE_SOLAR_TIME_EOT_LONGITUDE',
    description: 'Hanoi True Solar Time with Equation of Time and Longitude Correction',
    source: 'NOAA Solar Calculator & Astronomical Algorithms (Meeus Ch. 28)',
    sourceVersion: 'NOAA_Solar_v1.2',
    referenceSystem: 'True Solar Time (Equation of Time + 4min/deg longitude correction)',
    convention: 'timeConvention: trueSolar',
    verificationStatus: 'VERIFIED_ASTRONOMICAL_EPHEMERIS',
    notes: 'EoT correction of ~-0.2m + Longitude offset (+3.4m) preserves midday meridian alignment.',
    birthDate: { year: 2024, month: 6, day: 15 },
    birthTime: { hour: 12, minute: 0, hasExactHour: true },
    timezone: { timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh' },
    coordinates: { latitude: 21.0285, longitude: 105.8542, city: 'Hanoi', country: 'Vietnam' },
    gender: 'Female',
    calendarConvention: {
      calendarSystem: 'solar',
      timeConvention: 'trueSolar',
      isLateRat: false
    },
    expectedCanonicalTime: {
      effectiveYear: 2024,
      effectiveMonth: 6,
      effectiveDay: 15,
      effectiveHour: 12,
      dayShiftApplied: 0
    },
    expectedBaZi: {
      yearPillar: { stem: 'Jia', branch: 'Chen' },
      monthPillar: { stem: 'Geng', branch: 'Wu_B' },
      dayPillar: { stem: 'Geng', branch: 'Xu' },
      hourPillar: { stem: 'Ren', branch: 'Wu_B' },
      dayMaster: 'Geng',
      dayMasterElement: 'Metal'
    },
    expectedZiWei: {
      elementBureauStartsWith: 'Thủy Nhị Cục',
      lifePalaceBranch: 'Zi'
    }
  },
  {
    id: 'GOLDEN_06_LUNAR_LEAP_MONTH_BENCHMARK',
    description: 'Lunar Leap Month Benchmark (2023 Quý Mão Nhuận Tháng 2 / Solar 2023-03-22)',
    source: 'Astronomical Almanac of Vietnam / Khâm Định Vạn Niên Lịch',
    sourceVersion: 'Almanac_VN_2023',
    referenceSystem: 'Vietnamese Astronomical Lunar Calendar (Hồ Ngọc Đức Ephemeris)',
    convention: 'Mid-Month Split / Nhuận Tháng 2 Quý Mão',
    verificationStatus: 'VERIFIED_ASTRONOMICAL_EPHEMERIS',
    notes: '2023-03-22 solar marks the 1st day of the Lunar Leap 2nd Month in Quý Mão year.',
    birthDate: { year: 2023, month: 3, day: 22 },
    birthTime: { hour: 8, minute: 15, hasExactHour: true },
    timezone: { timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh' },
    coordinates: { latitude: 16.0544, longitude: 108.2022, city: 'Da Nang', country: 'Vietnam' },
    gender: 'Male',
    calendarConvention: {
      calendarSystem: 'solar',
      timeConvention: 'civil',
      isLateRat: false
    },
    expectedCanonicalTime: {
      effectiveYear: 2023,
      effectiveMonth: 3,
      effectiveDay: 22,
      effectiveHour: 8,
      dayShiftApplied: 0
    },
    expectedBaZi: {
      yearPillar: { stem: 'Gui', branch: 'Mao' },
      monthPillar: { stem: 'Yi', branch: 'Mao' },
      dayPillar: { stem: 'Ji', branch: 'Mao' },
      hourPillar: { stem: 'Wu', branch: 'Chen' },
      dayMaster: 'Ji',
      dayMasterElement: 'Earth'
    },
    expectedZiWei: {
      elementBureauStartsWith: 'Thủy Nhị Cục',
      lifePalaceBranch: 'Hai'
    }
  }
];

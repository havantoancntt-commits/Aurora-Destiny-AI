// ==========================================
// SOLAR / LUNAR & ASTRONOMICAL ENGINE
// High-precision Ho Ngoc Duc Algorithm & Exact Solar Terms
// ==========================================

export interface LunarDate {
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  isLeapMonth: boolean;
  solarTerm: string;
}

const PI = Math.PI;

// Compute Julian Day Number from Gregorian Date
export function gregorianToJulianDay(year: number, month: number, day: number): number {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jd;
}

// 24 Tiết Khí indexed by 15° segments starting from 0° (Xuân Phân)
export const SOLAR_TERMS = [
  'Xuân Phân',  // 0° (~Mar 21)
  'Thanh Minh', // 15° (~Apr 5)
  'Cốc Vũ',     // 30° (~Apr 20)
  'Lập Hạ',     // 45° (~May 6)
  'Tiểu Mãn',   // 60° (~May 21)
  'Mang Chủng', // 75° (~Jun 6)
  'Hạ Chí',     // 90° (~Jun 21)
  'Tiểu Thử',   // 105° (~Jul 7)
  'Đại Thử',    // 120° (~Jul 23)
  'Lập Thu',    // 135° (~Aug 8)
  'Xử Thử',     // 150° (~Aug 23)
  'Bạch Lộ',    // 165° (~Sep 8)
  'Thu Phân',   // 180° (~Sep 23)
  'Hàn Lộ',     // 195° (~Oct 8)
  'Sương Giáng',// 210° (~Oct 23)
  'Lập Đông',   // 225° (~Nov 7)
  'Tiểu Tuyết', // 240° (~Nov 22)
  'Đại Tuyết',  // 255° (~Dec 7)
  'Đông Chí',   // 270° (~Dec 22)
  'Tiểu Hàn',   // 285° (~Jan 6)
  'Đại Hàn',    // 300° (~Jan 20)
  'Lập Xuân',   // 315° (~Feb 4)
  'Vũ Thủy',    // 330° (~Feb 19)
  'Kinh Trập'   // 345° (~Mar 6)
];

// Exact Sun Longitude in Degrees (0° to 360°)
export function getSunLongitudeDegrees(jdn: number, timeZone: number = 7): number {
  const T = (jdn - 2451545.0 + 0.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L % 360;
  if (L < 0) L += 360;
  return L;
}

// Determine Exact Solar Term for a given date
export function getSolarTerm(year: number, month: number, day: number, timezoneOffset: number = 7): string {
  const jd = gregorianToJulianDay(year, month, day);
  const sunDeg = getSunLongitudeDegrees(jd, timezoneOffset);
  const termIdx = Math.floor(sunDeg / 15) % 24;
  return SOLAR_TERMS[termIdx];
}

// Astronomical New Moon (Sóc) calculation
function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 = C1 - 0.0004 * Math.sin(3 * dr * Mpr);
  C1 = C1 + 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 = C1 - 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 = C1 - 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 = C1 + 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);
  const Jd = Jd1 + C1;
  return Math.floor(Jd + 0.5 + timeZone / 24);
}

// Sun Longitude at New Moon
function getSunLongitudeMajor(jdn: number, timeZone: number): number {
  const deg = getSunLongitudeDegrees(jdn, timeZone);
  return Math.floor(deg / 30); // 12 major solar terms (Trung Khí: 0 to 11)
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = gregorianToJulianDay(yy, 12, 31) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitudeMajor(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1; // Start with month following lunar month 11
  let arc = getSunLongitudeMajor(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitudeMajor(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

// High-precision Ho Ngoc Duc Astronomical Lunar Calendar Engine
export function convertSolarToLunar(
  year: number,
  month: number,
  day: number,
  timezoneOffset: number = 7
): LunarDate {
  const dayNumber = gregorianToJulianDay(year, month, day);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timezoneOffset);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timezoneOffset);
  }
  let a11 = getLunarMonth11(year, timezoneOffset);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = year;
    a11 = getLunarMonth11(year - 1, timezoneOffset);
  } else {
    lunarYear = year + 1;
    b11 = getLunarMonth11(year + 1, timezoneOffset);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let isLeapMonth = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timezoneOffset);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        isLeapMonth = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  const solarTerm = getSolarTerm(year, month, day, timezoneOffset);

  return {
    lunarDay,
    lunarMonth,
    lunarYear,
    isLeapMonth,
    solarTerm
  };
}

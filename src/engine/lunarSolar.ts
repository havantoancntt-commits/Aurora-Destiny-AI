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
  const T = (jdn - 2451545.0 - 0.5 - timeZone / 24) / 36525;
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

// Compute Continuous Astronomical Julian Day from Gregorian Date & Time
export function gregorianToContinuousJD(
  year: number,
  month: number,
  day: number,
  hour: number = 12,
  minute: number = 0,
  timezoneOffset: number = 7
): number {
  const jdNoon = gregorianToJulianDay(year, month, day);
  const fractionalDayUT = (hour + minute / 60 - timezoneOffset) / 24;
  return jdNoon - 0.5 + fractionalDayUT;
}

// Exact Sun Longitude from Continuous Astronomical Julian Date
export function getSunLongitudeAtInstant(continuousJD: number): number {
  const T = (continuousJD - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) % 360;
  if (L < 0) L += 360;
  return L;
}

// Exact Sun Longitude calculated at specific date and time
export function getSunLongitudeAtTime(
  year: number,
  month: number,
  day: number,
  hour: number = 12,
  minute: number = 0,
  timezoneOffset: number = 7
): number {
  const jd = gregorianToContinuousJD(year, month, day, hour, minute, timezoneOffset);
  return getSunLongitudeAtInstant(jd);
}

// Determine Exact Solar Term for a given date and time
export function getSolarTerm(
  year: number,
  month: number,
  day: number,
  timezoneOffset: number = 7,
  hour: number = 12,
  minute: number = 0
): string {
  const sunDeg = getSunLongitudeAtTime(year, month, day, hour, minute, timezoneOffset);
  const termIdx = Math.floor(sunDeg / 15) % 24;
  return SOLAR_TERMS[termIdx];
}

// ==========================================================
// NUMERICAL ROOT FINDING: EXACT SOLAR TERM CROSSING INSTANT
// Finds exact moment when Sun crosses 0°, 15°, 30° ... 315°
// ==========================================================
export interface SolarTermCrossing {
  targetLongitude: number;
  continuousJD: number;
  utcDate: Date;
  localIso: string;
  solarLongitude: number;
  errorToleranceDeg: number;
  timezoneOffset: number;
}

export function findSolarTermCrossing(
  targetLongitude: number,
  approximateDate: { year: number; month: number; day: number },
  timezoneOffset: number = 7,
  errorToleranceDeg: number = 0.00001
): SolarTermCrossing {
  const approxJD = gregorianToContinuousJD(
    approximateDate.year,
    approximateDate.month,
    approximateDate.day,
    12,
    0,
    timezoneOffset
  );

  function angleDiff(jd: number): number {
    const deg = getSunLongitudeAtInstant(jd);
    return ((deg - targetLongitude + 540) % 360) - 180;
  }

  const initialDiff = angleDiff(approxJD);
  const approxDaysShift = -initialDiff / 0.985647;
  let centerJD = approxJD + approxDaysShift;

  let lowJD = centerJD - 2.5;
  let highJD = centerJD + 2.5;
  let diffLow = angleDiff(lowJD);
  let diffHigh = angleDiff(highJD);

  let attempts = 0;
  while (diffLow > 0 && attempts < 10) {
    lowJD -= 2.0;
    diffLow = angleDiff(lowJD);
    attempts++;
  }
  attempts = 0;
  while (diffHigh < 0 && attempts < 10) {
    highJD += 2.0;
    diffHigh = angleDiff(highJD);
    attempts++;
  }

  let midJD = (lowJD + highJD) / 2;
  for (let iter = 0; iter < 60; iter++) {
    midJD = (lowJD + highJD) / 2;
    const diff = angleDiff(midJD);
    if (Math.abs(diff) <= errorToleranceDeg || (highJD - lowJD) < 1e-8) {
      break;
    }
    if (diff < 0) {
      lowJD = midJD;
    } else {
      highJD = midJD;
    }
  }

  const finalLongitude = getSunLongitudeAtInstant(midJD);
  const utcMs = Math.round((midJD - 2440587.5) * 86400000);
  const utcDate = new Date(utcMs);
  const localMs = utcMs + timezoneOffset * 3600000;
  const localIso = new Date(localMs).toISOString().replace('Z', `+${String(timezoneOffset).padStart(2, '0')}:00`);

  return {
    targetLongitude,
    continuousJD: midJD,
    utcDate,
    localIso,
    solarLongitude: finalLongitude,
    errorToleranceDeg,
    timezoneOffset
  };
}

// ==========================================================
// TRUE SOLAR TIME & EQUATION OF TIME (EoT)
// Calculates physical solar time accounting for Earth's orbital eccentricity & axial tilt
// ==========================================================
export interface TrueSolarTimeResult {
  convention: 'civil' | 'trueSolar';
  civilHour: number;
  civilMinute: number;
  trueSolarHour: number;
  trueSolarMinute: number;
  equationOfTimeMinutes: number;
  longitudeCorrectionMinutes: number;
  totalCorrectionMinutes: number;
  explanation: string;
}

export function calculateEquationOfTime(continuousJD: number): {
  equationOfTimeMinutes: number;
  sunDeclinationDegrees: number;
} {
  const T = (continuousJD - 2451545.0) / 36525;
  const dr = Math.PI / 180;
  const radToDeg = 180 / Math.PI;

  const L0 = (280.46645 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  const M = (357.52910 + 35999.05030 * T - 0.0001559 * T * T - 0.00000048 * T * T * T) % 360;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const eps0 = 23.43929111 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
  const eps = eps0 * dr;

  const y = Math.tan(eps / 2) * Math.tan(eps / 2);
  const L0_rad = L0 * dr;
  const M_rad = M * dr;

  const eotRad =
    y * Math.sin(2 * L0_rad) -
    2 * e * Math.sin(M_rad) +
    4 * e * y * Math.sin(M_rad) * Math.cos(2 * L0_rad) -
    0.5 * y * y * Math.sin(4 * L0_rad) -
    1.25 * e * e * Math.sin(2 * M_rad);

  const equationOfTimeMinutes = eotRad * radToDeg * 4;

  const sunTrueLong = getSunLongitudeAtInstant(continuousJD) * dr;
  const sinDec = Math.sin(eps) * Math.sin(sunTrueLong);
  const sunDeclinationDegrees = Math.asin(sinDec) * radToDeg;

  return { equationOfTimeMinutes, sunDeclinationDegrees };
}

export function calculateTrueSolarTime(
  year: number,
  month: number,
  day: number,
  civilHour: number,
  civilMinute: number,
  timezoneOffset: number = 7,
  longitude?: number
): TrueSolarTimeResult {
  const actualLongitude = longitude !== undefined && longitude !== null ? longitude : timezoneOffset * 15;
  const jd = gregorianToContinuousJD(year, month, day, civilHour, civilMinute, timezoneOffset);
  const { equationOfTimeMinutes } = calculateEquationOfTime(jd);

  const standardMeridian = timezoneOffset * 15;
  const longitudeCorrectionMinutes = (actualLongitude - standardMeridian) * 4;
  const totalCorrectionMinutes = equationOfTimeMinutes + longitudeCorrectionMinutes;

  const totalCivilMinutes = civilHour * 60 + civilMinute;
  let totalTrueSolarMinutes = Math.round(totalCivilMinutes + totalCorrectionMinutes);

  while (totalTrueSolarMinutes < 0) totalTrueSolarMinutes += 1440;
  totalTrueSolarMinutes = totalTrueSolarMinutes % 1440;

  const trueSolarHour = Math.floor(totalTrueSolarMinutes / 60);
  const trueSolarMinute = totalTrueSolarMinutes % 60;

  return {
    convention: 'trueSolar',
    civilHour,
    civilMinute,
    trueSolarHour,
    trueSolarMinute,
    equationOfTimeMinutes: Math.round(equationOfTimeMinutes * 100) / 100,
    longitudeCorrectionMinutes: Math.round(longitudeCorrectionMinutes * 100) / 100,
    totalCorrectionMinutes: Math.round(totalCorrectionMinutes * 100) / 100,
    explanation: `Giờ dân dụng: ${civilHour}h${String(civilMinute).padStart(2, '0')}. Hiệu chỉnh kinh độ (${longitude}° vs ${standardMeridian}°): ${longitudeCorrectionMinutes >= 0 ? '+' : ''}${longitudeCorrectionMinutes.toFixed(1)}p. Phương trình thời gian (EoT): ${equationOfTimeMinutes >= 0 ? '+' : ''}${equationOfTimeMinutes.toFixed(1)}p. Giờ mặt trời thực: ${trueSolarHour}h${String(trueSolarMinute).padStart(2, '0')}.`
  };
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
  timezoneOffset: number = 7,
  isLateRat: boolean = false,
  hour: number = 12
): LunarDate {
  let effectiveYear = year;
  let effectiveMonth = month;
  let effectiveDay = day;

  // If isLateRat is true and hour is 23 (Dạ Tý), the day advances to the next calendar date
  if (isLateRat && hour === 23) {
    const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
    effectiveYear = nextDate.getUTCFullYear();
    effectiveMonth = nextDate.getUTCMonth() + 1;
    effectiveDay = nextDate.getUTCDate();
  }

  const dayNumber = gregorianToJulianDay(effectiveYear, effectiveMonth, effectiveDay);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timezoneOffset);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timezoneOffset);
  }
  let a11 = getLunarMonth11(effectiveYear, timezoneOffset);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = effectiveYear;
    a11 = getLunarMonth11(effectiveYear - 1, timezoneOffset);
  } else {
    lunarYear = effectiveYear + 1;
    b11 = getLunarMonth11(effectiveYear + 1, timezoneOffset);
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

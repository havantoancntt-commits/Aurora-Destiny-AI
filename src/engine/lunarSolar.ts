// ==========================================
// SOLAR / LUNAR & ASTRONOMICAL ENGINE
// ==========================================

export interface LunarDate {
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  isLeapMonth: boolean;
  solarTerm: string;
}

// Compute Julian Day Number from Gregorian Date
export function gregorianToJulianDay(year: number, month: number, day: number): number {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jd;
}

// High-precision Solar Terms (24 Tiết Khí) Angles
export const SOLAR_TERMS = [
  'Xuân Phân', 'Thanh Minh', 'Cốc Vũ', 'Lập Hạ', 'Tiểu Mãn', 'Mang Chủng',
  'Hạ Chí', 'Tiểu Thử', 'Đại Thử', 'Lập Thu', 'Xử Thử', 'Bạch Lộ',
  'Thu Phân', 'Hàn Lộ', 'Sương Giáng', 'Lập Đông', 'Tiểu Tuyết', 'Đại Tuyết',
  'Đông Chí', 'Tiểu Hàn', 'Đại Hàn', 'Lập Xuân', 'Vũ Thủy', 'Kinh Trập'
];

// Determine Solar Term for a given date
export function getSolarTerm(year: number, month: number, day: number): string {
  // Approximate day of month for each major solar term
  // Lập Xuân (~Feb 4), Kinh Trập (~Mar 5), Thanh Minh (~Apr 4), Lập Hạ (~May 5),
  // Mang Chủng (~Jun 5), Tiểu Thử (~Jul 7), Lập Thu (~Aug 7), Bạch Lộ (~Sep 7),
  // Hàn Lộ (~Oct 8), Lập Đông (~Nov 7), Đại Tuyết (~Dec 7), Tiểu Hàn (~Jan 5)
  if (month === 1) return day >= 20 ? 'Đại Hàn' : (day >= 5 ? 'Tiểu Hàn' : 'Đông Chí');
  if (month === 2) return day >= 19 ? 'Vũ Thủy' : (day >= 4 ? 'Lập Xuân' : 'Đại Hàn');
  if (month === 3) return day >= 20 ? 'Xuân Phân' : (day >= 5 ? 'Kinh Trập' : 'Vũ Thủy');
  if (month === 4) return day >= 20 ? 'Cốc Vũ' : (day >= 4 ? 'Thanh Minh' : 'Xuân Phân');
  if (month === 5) return day >= 21 ? 'Tiểu Mãn' : (day >= 5 ? 'Lập Hạ' : 'Cốc Vũ');
  if (month === 6) return day >= 21 ? 'Hạ Chí' : (day >= 5 ? 'Mang Chủng' : 'Tiểu Mãn');
  if (month === 7) return day >= 22 ? 'Đại Thử' : (day >= 7 ? 'Tiểu Thử' : 'Hạ Chí');
  if (month === 8) return day >= 23 ? 'Xử Thử' : (day >= 7 ? 'Lập Thu' : 'Đại Thử');
  if (month === 9) return day >= 23 ? 'Thu Phân' : (day >= 7 ? 'Bạch Lộ' : 'Xử Thử');
  if (month === 10) return day >= 23 ? 'Sương Giáng' : (day >= 8 ? 'Hàn Lộ' : 'Thu Phân');
  if (month === 11) return day >= 22 ? 'Tiểu Tuyết' : (day >= 7 ? 'Lập Đông' : 'Sương Giáng');
  if (month === 12) return day >= 21 ? 'Đông Chí' : (day >= 7 ? 'Đại Tuyết' : 'Tiểu Tuyết');
  return 'Lập Xuân';
}

// Deterministic algorithm converting Solar Gregorian Date to Lunar Calendar
export function convertSolarToLunar(
  year: number,
  month: number,
  day: number,
  timezoneOffset: number = 7
): LunarDate {
  // Epoch reference: Jan 1, 1900 was Lunar Nov 30, 1899 (JD: 2415021)
  const jd = gregorianToJulianDay(year, month, day);
  
  // Approximate lunar month length ~ 29.530588853 days
  const lunarCycle = 29.530588853;
  const newMoonRef = 2451549.5; // Jan 6, 2000 New Moon
  const cycles = (jd - newMoonRef) / lunarCycle;
  const cycleFraction = cycles - Math.floor(cycles);
  
  let lunarDay = Math.floor(cycleFraction * 29.53) + 1;
  if (lunarDay > 30) lunarDay = 30;
  if (lunarDay < 1) lunarDay = 1;

  // Approximate lunar month calculation based on solar date & offset
  let lunarMonth = month - 1;
  let isLeap = false;
  let lunarYear = year;

  // Lunar new year typically falls between Jan 21 and Feb 20
  if (month === 1 || (month === 2 && day < 10)) {
    lunarYear = year - 1;
    lunarMonth = month === 1 ? (day < 20 ? 11 : 12) : 12;
  } else if (lunarMonth <= 0) {
    lunarMonth = 12;
    lunarYear = year - 1;
  }

  // Bound lunar month 1 - 12
  if (lunarMonth > 12) lunarMonth = 12;
  if (lunarMonth < 1) lunarMonth = 1;

  const solarTerm = getSolarTerm(year, month, day);

  return {
    lunarDay,
    lunarMonth,
    lunarYear,
    isLeapMonth: isLeap,
    solarTerm
  };
}

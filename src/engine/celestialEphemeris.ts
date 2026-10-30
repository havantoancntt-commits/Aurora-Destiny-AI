// ==========================================
// AURORA DESTINY AI — CELESTIAL PLANETARY EPHEMERIS ENGINE
// Precise Astronomical Positions (Ecliptic Longitude & Latitude, RA, Dec)
// Standish JPL Planetary Ephemeris / Meeus Astronomical Algorithms
// ==========================================

import { BirthData } from '../types/destiny';

export interface ZodiacSign {
  id: string;
  nameVi: string;
  nameEn: string;
  symbol: string;
  element: 'Hỏa' | 'Thổ' | 'Khí' | 'Thủy';
  ruler: string;
  startDegree: number;
  endDegree: number;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { id: 'aries', nameVi: 'Bạch Dương', nameEn: 'Aries', symbol: '♈', element: 'Hỏa', ruler: 'Sao Hỏa', startDegree: 0, endDegree: 30 },
  { id: 'taurus', nameVi: 'Kim Ngưu', nameEn: 'Taurus', symbol: '♉', element: 'Thổ', ruler: 'Sao Kim', startDegree: 30, endDegree: 60 },
  { id: 'gemini', nameVi: 'Song Tử', nameEn: 'Gemini', symbol: '♊', element: 'Khí', ruler: 'Sao Thủy', startDegree: 60, endDegree: 90 },
  { id: 'cancer', nameVi: 'Cự Giải', nameEn: 'Cancer', symbol: '♋', element: 'Thủy', ruler: 'Mặt Trăng', startDegree: 90, endDegree: 120 },
  { id: 'leo', nameVi: 'Sư Tử', nameEn: 'Leo', symbol: '♌', element: 'Hỏa', ruler: 'Mặt Trời', startDegree: 120, endDegree: 150 },
  { id: 'virgo', nameVi: 'Xử Nữ', nameEn: 'Virgo', symbol: '♍', element: 'Thổ', ruler: 'Sao Thủy', startDegree: 150, endDegree: 180 },
  { id: 'libra', nameVi: 'Thiên Bình', nameEn: 'Libra', symbol: '♎', element: 'Khí', ruler: 'Sao Kim', startDegree: 180, endDegree: 210 },
  { id: 'scorpio', nameVi: 'Bọ Cạp', nameEn: 'Scorpio', symbol: '♏', element: 'Thủy', ruler: 'Sao Diêm Vương / Sao Hỏa', startDegree: 210, endDegree: 240 },
  { id: 'sagittarius', nameVi: 'Nhân Mã', nameEn: 'Sagittarius', symbol: '♐', element: 'Hỏa', ruler: 'Sao Mộc', startDegree: 240, endDegree: 270 },
  { id: 'capricorn', nameVi: 'Ma Kết', nameEn: 'Capricorn', symbol: '♑', element: 'Thổ', ruler: 'Sao Thổ', startDegree: 270, endDegree: 300 },
  { id: 'aquarius', nameVi: 'Bảo Bình', nameEn: 'Aquarius', symbol: '♒', element: 'Khí', ruler: 'Sao Thiên Vương / Sao Thổ', startDegree: 300, endDegree: 330 },
  { id: 'pisces', nameVi: 'Song Ngư', nameEn: 'Pisces', symbol: '♓', element: 'Thủy', ruler: 'Sao Hải Vương / Sao Mộc', startDegree: 330, endDegree: 360 }
];

export type CelestialBodyId =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'north_node'
  | 'south_node';

export interface CelestialCoordinate {
  id: CelestialBodyId;
  nameVi: string;
  nameEn: string;
  glyph: string;
  category: 'luminary' | 'inner' | 'social' | 'outer' | 'node';
  color: string;
  elementVi: string;
  
  // Tọa độ Hoàng đạo (Ecliptic Coordinates)
  longitude: number;        // Kinh độ hoàng đạo (0 - 360°)
  latitude: number;         // Vĩ độ hoàng đạo (-90° đến +90°)
  
  // Tọa độ Xích đạo (Equatorial Coordinates)
  rightAscension: number;   // Xích kinh (0 - 360° / giờ xích kinh)
  declination: number;      // Xích vĩ (-90° đến +90°)
  
  // Vận tốc và chuyển động
  distanceAU: number;       // Khoảng cách đến Trái Đất (AU)
  speed: number;            // Vận tốc biểu kiến (° / ngày)
  isRetrograde: boolean;    // Trạng thái Nghịch hành (℞)
  
  // Cung Hoàng Đạo
  zodiacSign: ZodiacSign;
  signDegree: number;       // 0 - 29°
  signMinute: number;       // 0 - 59'
  signSecond: number;       // 0 - 59"
  formattedDMS: string;     // vd: "14°28'12\""
  formattedSign: string;    // vd: "14°28' Sư Tử ♌"
  
  // Phẩm chất & Ý nghĩa bản mệnh
  dignity: 'Miếu Địa (Domicile)' | 'Vượng Địa (Exaltation)' | 'Đắc Địa' | 'Hãm Địa (Fall)' | 'Bình Hòa (Peregrine)';
  destinyMeaning: string;   // Luận giải năng lượng tại thời điểm sinh
}

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface CelestialAspect {
  planet1: CelestialBodyId;
  planet2: CelestialBodyId;
  planet1NameVi: string;
  planet2NameVi: string;
  planet1Glyph: string;
  planet2Glyph: string;
  type: AspectType;
  nameVi: string;
  symbol: string;
  targetAngle: number;
  actualAngle: number;
  orb: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
  color: string;
  interpretation: string;
}

export interface CelestialBirthChart {
  julianDay: number;
  universalTimeISO: string;
  localCivilTimeISO: string;
  trueSolarTimeISO: string;
  geographicLocation: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezoneOffset: number;
  };
  obliquityOfEcliptic: number; // Độ nghiêng trục hoàng đạo ε
  siderealTimeDegrees: number; // Giờ thiên văn địa phương LST
  ascendantDegree: number;     // Điểm mọc AC
  midheavenDegree: number;     // Thiên đỉnh MC
  ascendantSign: ZodiacSign;
  midheavenSign: ZodiacSign;
  bodies: CelestialCoordinate[];
  aspects: CelestialAspect[];
  elementDistribution: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  retrogradeCount: number;
  dominantPlanet: CelestialCoordinate;
}

// Math helpers
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function normalizeDeg(deg: number): number {
  let val = deg % 360;
  if (val < 0) val += 360;
  return val;
}

function normalizeLat(deg: number): number {
  if (deg > 90) return 180 - deg;
  if (deg < -90) return -180 - deg;
  return deg;
}

export function gregorianToContinuousJD(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number = 0
): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = (hour + minute / 60 + second / 3600) / 24;
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5 + dayFraction;
  return jd;
}

/**
 * Mean obliquity of the ecliptic (Meeus IAU formula)
 */
function getObliquity(T: number): number {
  return 23.4392911 - (46.8150 * T + 0.00059 * T * T - 0.001813 * T * T * T) / 3600;
}

/**
 * Solve Kepler's equation: M = E - e*sin(E)
 */
function solveKepler(M_deg: number, e: number): number {
  const M_rad = normalizeDeg(M_deg) * DEG_TO_RAD;
  let E = M_rad;
  for (let i = 0; i < 15; i++) {
    const dE = (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

interface OrbitalElements {
  a0: number; aDot: number;
  e0: number; eDot: number;
  i0: number; iDot: number;
  L0: number; LDot: number;
  w0: number; wDot: number;
  node0: number; nodeDot: number;
}

const PLANETARY_ELEMENTS: Record<string, OrbitalElements> = {
  mercury: {
    a0: 0.38709893, aDot: 0.00000066,
    e0: 0.20563069, eDot: 0.00002527,
    i0: 7.00487, iDot: -0.005947,
    L0: 252.250845, LDot: 149472.674111,
    w0: 77.45645, wDot: 0.160476,
    node0: 48.33167, nodeDot: -0.125349
  },
  venus: {
    a0: 0.72333199, aDot: 0.00000092,
    e0: 0.00677323, eDot: -0.00004938,
    i0: 3.39471, iDot: -0.0007889,
    L0: 181.97973, LDot: 58517.815387,
    w0: 131.57294, wDot: 0.002683,
    node0: 76.68069, nodeDot: -0.277694
  },
  earth: {
    a0: 1.00000011, aDot: -0.00000005,
    e0: 0.01671022, eDot: -0.00003804,
    i0: 0.00005, iDot: -0.0129466,
    L0: 100.46435, LDot: 36000.76983,
    w0: 102.94719, wDot: 0.323274,
    node0: 0.0, nodeDot: 0.0
  },
  mars: {
    a0: 1.52366231, aDot: -0.00007221,
    e0: 0.09341233, eDot: 0.00011902,
    i0: 1.85061, iDot: -0.02547,
    L0: 355.45332, LDot: 19140.302684,
    w0: 336.04084, wDot: 0.4444108,
    node0: 49.5574, nodeDot: -0.292573
  },
  jupiter: {
    a0: 5.20336301, aDot: 0.00060737,
    e0: 0.04839266, eDot: -0.00012880,
    i0: 1.30530, iDot: -0.00415,
    L0: 34.40438, LDot: 3034.746128,
    w0: 14.75385, wDot: 0.2125267,
    node0: 100.55615, nodeDot: 0.207381
  },
  saturn: {
    a0: 9.53707032, aDot: -0.00301530,
    e0: 0.05415060, eDot: -0.00036762,
    i0: 2.48446, iDot: 0.00611,
    L0: 49.94424, LDot: 1222.493622,
    w0: 92.43194, wDot: -0.818987,
    node0: 113.71504, nodeDot: -0.288678
  },
  uranus: {
    a0: 19.19126393, aDot: 0.00152025,
    e0: 0.04716771, eDot: -0.00019150,
    i0: 0.76986, iDot: -0.00242,
    L0: 313.23218, LDot: 428.482028,
    w0: 170.96424, wDot: 0.408053,
    node0: 74.22988, nodeDot: 0.0424059
  },
  neptune: {
    a0: 30.06896348, aDot: -0.00125196,
    e0: 0.00858587, eDot: 0.00002514,
    i0: 1.76917, iDot: -0.00511,
    L0: 304.88003, LDot: 218.459453,
    w0: 44.97135, wDot: -0.3224146,
    node0: 131.72169, nodeDot: -0.005987
  },
  pluto: {
    a0: 39.48168677, aDot: -0.00076912,
    e0: 0.24880766, eDot: 0.00006465,
    i0: 17.14175, iDot: 0.003075,
    L0: 238.92881, LDot: 145.207805,
    w0: 224.06676, wDot: -0.0406294,
    node0: 110.30347, nodeDot: -0.0118348
  }
};

interface HelioCoords {
  x: number;
  y: number;
  z: number;
  r: number;
}

function getHeliocentricPosition(planetKey: string, T: number): HelioCoords {
  const el = PLANETARY_ELEMENTS[planetKey];
  const a = el.a0 + el.aDot * T;
  const e = el.e0 + el.eDot * T;
  const I = (el.i0 + el.iDot * T) * DEG_TO_RAD;
  const L = normalizeDeg(el.L0 + el.LDot * T);
  const w = normalizeDeg(el.w0 + el.wDot * T);
  const node = normalizeDeg(el.node0 + el.nodeDot * T) * DEG_TO_RAD;
  const omega = normalizeDeg(w - (el.node0 + el.nodeDot * T)) * DEG_TO_RAD;
  const M = normalizeDeg(L - w);

  const E = solveKepler(M, e);
  const xPrime = a * (Math.cos(E) - e);
  const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);
  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosI = Math.cos(I);
  const sinI = Math.sin(I);

  const x = (cosOmega * cosNode - sinOmega * sinNode * cosI) * xPrime +
            (-sinOmega * cosNode - cosOmega * sinNode * cosI) * yPrime;
  const y = (cosOmega * sinNode + sinOmega * cosNode * cosI) * xPrime +
            (-sinOmega * sinNode + cosOmega * cosNode * cosI) * yPrime;
  const z = (sinOmega * sinI) * xPrime + (cosOmega * sinI) * yPrime;
  const r = Math.sqrt(x * x + y * y + z * z);

  return { x, y, z, r };
}

/**
 * High-accuracy Geocentric Sun position
 */
function getSunPosition(T: number): { lon: number; lat: number; dist: number } {
  const T2 = T * T;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T2;
  const Mrad = normalizeDeg(M) * DEG_TO_RAD;
  
  const C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(Mrad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
            0.000289 * Math.sin(3 * Mrad);
  
  const trueLon = normalizeDeg(L0 + C);
  const e = 0.016708634 - 0.000042037 * T;
  const vRad = normalizeDeg(M + C) * DEG_TO_RAD;
  const dist = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(vRad));

  return { lon: trueLon, lat: 0.0, dist };
}

/**
 * Truncated Meeus / Brown Lunar Ephemeris
 */
function getMoonPosition(T: number): { lon: number; lat: number; dist: number } {
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  const Lp = normalizeDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
  const M = normalizeDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000);
  const Mp = normalizeDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);
  const F = normalizeDeg(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);

  const rad = DEG_TO_RAD;

  // Major periodic terms for lunar longitude
  let dL = 6.288774 * Math.sin(Mp * rad)
         + 1.274027 * Math.sin((2 * D - Mp) * rad)
         + 0.658314 * Math.sin(2 * D * rad)
         + 0.213618 * Math.sin(2 * Mp * rad)
         - 0.185116 * Math.sin(M * rad)
         - 0.114332 * Math.sin(2 * F * rad)
         + 0.058793 * Math.sin((2 * D - 2 * Mp) * rad)
         + 0.057066 * Math.sin((2 * D - M - Mp) * rad)
         + 0.053322 * Math.sin((2 * D + Mp) * rad)
         + 0.045758 * Math.sin((2 * D - M) * rad)
         - 0.040923 * Math.sin((M - Mp) * rad)
         - 0.034720 * Math.sin(D * rad)
         - 0.030383 * Math.sin((M + Mp) * rad);

  // Major periodic terms for lunar latitude
  let dB = 5.128156 * Math.sin(F * rad)
         + 0.280602 * Math.sin((Mp + F) * rad)
         + 0.277693 * Math.sin((Mp - F) * rad)
         + 0.173238 * Math.sin((2 * D - F) * rad)
         + 0.055413 * Math.sin((2 * D - Mp + F) * rad)
         + 0.046271 * Math.sin((2 * D - Mp - F) * rad)
         + 0.032573 * Math.sin((2 * D + F) * rad)
         + 0.017198 * Math.sin((2 * Mp + F) * rad);

  const lon = normalizeDeg(Lp + dL);
  const lat = normalizeLat(dB);
  const dist = 385000.56 / 149597870.7; // AU approx

  return { lon, lat, dist };
}

/**
 * Mean / True Lunar Node (Rahu & Ketu)
 */
function getLunarNodes(T: number): { northLon: number; southLon: number } {
  const omega = normalizeDeg(125.044522 - 1934.1362608 * T + 0.0020756 * T * T + (T * T * T) / 467440);
  const south = normalizeDeg(omega + 180);
  return { northLon: omega, southLon: south };
}

/**
 * Compute geocentric coordinates for any planet
 */
function getGeocentricPlanetPosition(planetKey: string, T: number): { lon: number; lat: number; dist: number } {
  const earth = getHeliocentricPosition('earth', T);
  const planet = getHeliocentricPosition(planetKey, T);

  const dx = planet.x - earth.x;
  const dy = planet.y - earth.y;
  const dz = planet.z - earth.z;

  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const lonRad = Math.atan2(dy, dx);
  const lon = normalizeDeg(lonRad * RAD_TO_DEG);

  const hyp = Math.sqrt(dx * dx + dy * dy);
  const latRad = Math.atan2(dz, hyp);
  const lat = normalizeLat(latRad * RAD_TO_DEG);

  return { lon, lat, dist };
}

/**
 * Convert Ecliptic (lon, lat) to Equatorial (RA, Dec)
 */
function eclipticToEquatorial(lonDeg: number, latDeg: number, epsDeg: number): { ra: number; dec: number } {
  const l = lonDeg * DEG_TO_RAD;
  const b = latDeg * DEG_TO_RAD;
  const eps = epsDeg * DEG_TO_RAD;

  const sinDec = Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l);
  const decRad = Math.asin(Math.max(-1, Math.min(1, sinDec)));

  const y = Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps);
  const x = Math.cos(l);
  const raRad = Math.atan2(y, x);

  return {
    ra: normalizeDeg(raRad * RAD_TO_DEG),
    dec: normalizeLat(decRad * RAD_TO_DEG)
  };
}

/**
 * Format degrees to DMS string
 */
function formatDMS(deg: number): string {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = Math.round(((abs - d) * 60 - m) * 60);
  const sign = deg < 0 ? '-' : '+';
  return `${sign}${d}°${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`;
}

/**
 * Map longitude to Zodiac Sign
 */
export function getZodiacSignFromLongitude(longitude: number): { sign: ZodiacSign; degree: number; minute: number; second: number } {
  const norm = normalizeDeg(longitude);
  const signIndex = Math.floor(norm / 30);
  const sign = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
  const totalDegInSign = norm - signIndex * 30;
  const degree = Math.floor(totalDegInSign);
  const totalMin = (totalDegInSign - degree) * 60;
  const minute = Math.floor(totalMin);
  const second = Math.round((totalMin - minute) * 60);

  return { sign, degree, minute, second };
}

/**
 * Determine Dignity of planet in zodiac sign
 */
function determineDignity(planet: CelestialBodyId, signId: string): CelestialCoordinate['dignity'] {
  const domicileMap: Record<CelestialBodyId, string[]> = {
    sun: ['leo'],
    moon: ['cancer'],
    mercury: ['gemini', 'virgo'],
    venus: ['taurus', 'libra'],
    mars: ['aries', 'scorpio'],
    jupiter: ['sagittarius', 'pisces'],
    saturn: ['capricorn', 'aquarius'],
    uranus: ['aquarius'],
    neptune: ['pisces'],
    pluto: ['scorpio'],
    north_node: ['gemini', 'taurus'],
    south_node: ['sagittarius', 'scorpio']
  };

  const exaltationMap: Record<CelestialBodyId, string> = {
    sun: 'aries',
    moon: 'taurus',
    mercury: 'virgo',
    venus: 'pisces',
    mars: 'capricorn',
    jupiter: 'cancer',
    saturn: 'libra',
    uranus: 'scorpio',
    neptune: 'cancer',
    pluto: 'aries',
    north_node: 'gemini',
    south_node: 'sagittarius'
  };

  const fallMap: Record<CelestialBodyId, string> = {
    sun: 'libra',
    moon: 'scorpio',
    mercury: 'pisces',
    venus: 'virgo',
    mars: 'cancer',
    jupiter: 'capricorn',
    saturn: 'aries',
    uranus: 'taurus',
    neptune: 'capricorn',
    pluto: 'libra',
    north_node: 'sagittarius',
    south_node: 'gemini'
  };

  if (domicileMap[planet]?.includes(signId)) return 'Miếu Địa (Domicile)';
  if (exaltationMap[planet] === signId) return 'Vượng Địa (Exaltation)';
  if (fallMap[planet] === signId) return 'Hãm Địa (Fall)';
  return 'Đắc Địa';
}

/**
 * Metaphysical synthesis for each planet
 */
function getDestinyMeaning(
  planet: CelestialBodyId,
  sign: ZodiacSign,
  isRetrograde: boolean,
  lat: number
): string {
  const retroText = isRetrograde ? ' (Đang nghịch hành ℞: Năng lượng hướng nội, tôi luyện thử thách sâu sắc)' : '';
  const latText = Math.abs(lat) > 3 ? ` [Vĩ độ thiên văn ${formatDMS(lat)}: Lệch khỏi hoàng đạo tạo dấu ấn đột phá]` : '';

  switch (planet) {
    case 'sun':
      return `Mặt Trời tại ${sign.nameVi} biểu trưng cho Bản Ngã Cốt Lõi, Ý Chí Sinh Mệnh và Sứ Mạng Cuộc Đời. Năng lượng ${sign.element} thúc đẩy quyền năng lãnh đạo tự nhiên.${latText}`;
    case 'moon':
      return `Mặt Trăng tại ${sign.nameVi} cai quản Linh Hồn, Trực Giác Bí Truyền và Thế Giới Nội Tâm. Quyết định trạng thái an lạc tâm linh và tiềm thức di truyền.${latText}`;
    case 'mercury':
      return `Sao Thủy tại ${sign.nameVi} điều khiển Trí Tuệ Sắc Bén, Ngôn Từ và Khả Năng Hoạch Định Chiến Lược.${retroText}${latText}`;
    case 'venus':
      return `Sao Kim tại ${sign.nameVi} chủ trì Tình Cảm, Khiếu Thẩm Mỹ Tinh Tế, Nhân Duyên và Tài Lộc Quý Nhân.${retroText}${latText}`;
    case 'mars':
      return `Sao Hỏa tại ${sign.nameVi} thổi bùng Ngọn Lửa Hành Động, Dũng Khí và Khả Năng Xuyên Phá Nghịch Cảnh.${retroText}${latText}`;
    case 'jupiter':
      return `Sao Mộc (Tuế Tinh) tại ${sign.nameVi} mang đến Thiên Phúc, Vận May Lớn, Tầm Nhìn Chiến Lược và Sự Mở Rộng Không Giới Hạn.${retroText}${latText}`;
    case 'saturn':
      return `Sao Thổ (Trấn Tinh) tại ${sign.nameVi} là Bậc Thầy Thời Gian & Nghiệp Quả, rèn giũa Ý Chí Thép, Kỷ Luật Sắt và Thành Tựu Trường Tồn.${retroText}${latText}`;
    case 'uranus':
      return `Sao Thiên Vương tại ${sign.nameVi} kích hoạt Trực Giác Đột Biến, Tư Duy Cách Mạng Tiên Phong và Sự Độc Lập Kiệt Xuất.${retroText}${latText}`;
    case 'neptune':
      return `Sao Hải Vương tại ${sign.nameVi} mở cánh cổng Giác Ngộ Tâm Linh, Khả Năng Thấu Thị Vị Lai và Nghệ Thuật Diệu Kỳ.${retroText}${latText}`;
    case 'pluto':
      return `Sao Diêm Vương tại ${sign.nameVi} trao quyền năng Tái Sinh Từ Tro Tàn, Biến Đổi Tận Gốc và Quyền Lực Ngầm Uy Dũng.${retroText}${latText}`;
    case 'north_node':
      return `La Hầu (Nút Bắc) tại ${sign.nameVi} là Kim Chỉ Nam Tiến Hóa Tâm Thức, hướng đi của linh hồn để hoàn thành Thiên Mệnh kiếp này.`;
    case 'south_node':
      return `Kế Đô (Nút Nam) tại ${sign.nameVi} đại diện cho Tài Năng Tiềm Ẩn từ Tiền Kiếp và Bài Học Cần Buông Bỏ để thăng hoa.`;
    default:
      return `Tọa độ thiên văn linh thiêng chi phối chu kỳ năng lượng bản mệnh.`;
  }
}

/**
 * Calculate planetary aspects between celestial coordinates
 */
export function calculateAspects(bodies: CelestialCoordinate[]): CelestialAspect[] {
  const aspects: CelestialAspect[] = [];
  const aspectDefs: { type: AspectType; nameVi: string; symbol: string; angle: number; orb: number; nature: 'harmonious' | 'challenging' | 'neutral'; color: string }[] = [
    { type: 'conjunction', nameVi: 'Trùng Tụ (0°)', symbol: '☌', angle: 0, orb: 7.5, nature: 'neutral', color: '#fbbf24' },
    { type: 'sextile', nameVi: 'Lục Hợp (60°)', symbol: '⚹', angle: 60, orb: 5.5, nature: 'harmonious', color: '#10b981' },
    { type: 'square', nameVi: 'Vuông Góc (90°)', symbol: '□', angle: 90, orb: 6.5, nature: 'challenging', color: '#f43f5e' },
    { type: 'trine', nameVi: 'Tam Hợp (120°)', symbol: '△', angle: 120, orb: 7.0, nature: 'harmonious', color: '#06b6d4' },
    { type: 'opposition', nameVi: 'Đối Đỉnh (180°)', symbol: '☍', angle: 180, orb: 7.5, nature: 'challenging', color: '#ec4899' }
  ];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const b1 = bodies[i];
      const b2 = bodies[j];

      let diff = Math.abs(b1.longitude - b2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const def of aspectDefs) {
        const delta = Math.abs(diff - def.angle);
        if (delta <= def.orb) {
          const natureVi = def.nature === 'harmonious' ? 'Cát Lợi • Hài Hòa' : def.nature === 'challenging' ? 'Thử Thách • Động Lực Đột Phá' : 'Cộng Hưởng Toàn Diện';
          aspects.push({
            planet1: b1.id,
            planet2: b2.id,
            planet1NameVi: b1.nameVi,
            planet2NameVi: b2.nameVi,
            planet1Glyph: b1.glyph,
            planet2Glyph: b2.glyph,
            type: def.type,
            nameVi: def.nameVi,
            symbol: def.symbol,
            targetAngle: def.angle,
            actualAngle: Math.round(diff * 100) / 100,
            orb: Math.round(delta * 100) / 100,
            nature: def.nature,
            color: def.color,
            interpretation: `Góc ${def.nameVi} giữa ${b1.nameVi} và ${b2.nameVi} (${natureVi}): Tạo nguồn năng lượng kích hoạt vận mệnh đặc biệt.`
          });
          break;
        }
      }
    }
  }

  return aspects;
}

/**
 * Main function: Compute full Celestial Ephemeris Chart for birth date & location
 */
export function calculateCelestialBirthChart(birthData: BirthData): CelestialBirthChart {
  const hour = birthData.solarHour ?? 12;
  const minute = birthData.solarMinute ?? 0;
  const tzOffset = birthData.timezoneOffset ?? 7;
  const lonGeo = birthData.longitude ?? 105.85; // Default Hanoi
  const latGeo = birthData.latitude ?? 21.03;

  // Convert local civil time to UTC
  const utcDate = new Date(Date.UTC(
    birthData.solarYear,
    birthData.solarMonth - 1,
    birthData.solarDay,
    hour - tzOffset,
    minute
  ));

  const jd = gregorianToContinuousJD(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth() + 1,
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds()
  );

  const T = (jd - 2451545.0) / 36525.0;
  const eps = getObliquity(T);

  // Compute slight step for daily speed calculation
  const dt = 0.04; // ~1 hour
  const T_next = ((jd + dt) - 2451545.0) / 36525.0;

  // 1. Sun
  const sunPos = getSunPosition(T);
  const sunPosNext = getSunPosition(T_next);
  const sunSpeed = (normalizeDeg(sunPosNext.lon - sunPos.lon + 180) - 180) / dt;

  // 2. Moon
  const moonPos = getMoonPosition(T);
  const moonPosNext = getMoonPosition(T_next);
  const moonSpeed = (normalizeDeg(moonPosNext.lon - moonPos.lon + 180) - 180) / dt;

  // 3. Lunar Nodes
  const nodes = getLunarNodes(T);
  const nodesNext = getLunarNodes(T_next);
  const nodeSpeed = (normalizeDeg(nodesNext.northLon - nodes.northLon + 180) - 180) / dt;

  // 4. Planets
  const planetKeys: { id: CelestialBodyId; key: string; nameVi: string; nameEn: string; glyph: string; category: CelestialCoordinate['category']; color: string; elementVi: string }[] = [
    { id: 'sun', key: 'sun', nameVi: 'Mặt Trời', nameEn: 'Sun', glyph: '☉', category: 'luminary', color: '#f59e0b', elementVi: 'Thái Dương (Hỏa)' },
    { id: 'moon', key: 'moon', nameVi: 'Mặt Trăng', nameEn: 'Moon', glyph: '☽', category: 'luminary', color: '#e2e8f0', elementVi: 'Thái Âm (Thủy)' },
    { id: 'mercury', key: 'mercury', nameVi: 'Sao Thủy', nameEn: 'Mercury', glyph: '☿', category: 'inner', color: '#38bdf8', elementVi: 'Thủy Tinh' },
    { id: 'venus', key: 'venus', nameVi: 'Sao Kim', nameEn: 'Venus', glyph: '♀', category: 'inner', color: '#f472b6', elementVi: 'Kim Tinh' },
    { id: 'mars', key: 'mars', nameVi: 'Sao Hỏa', nameEn: 'Mars', glyph: '♂', category: 'inner', color: '#ef4444', elementVi: 'Hỏa Tinh' },
    { id: 'jupiter', key: 'jupiter', nameVi: 'Sao Mộc', nameEn: 'Jupiter', glyph: '♃', category: 'social', color: '#fbbf24', elementVi: 'Mộc Tinh (Tuế Tinh)' },
    { id: 'saturn', key: 'saturn', nameVi: 'Sao Thổ', nameEn: 'Saturn', glyph: '♄', category: 'social', color: '#ca8a04', elementVi: 'Thổ Tinh (Trấn Tinh)' },
    { id: 'uranus', key: 'uranus', nameVi: 'Sao Thiên Vương', nameEn: 'Uranus', glyph: '♅', category: 'outer', color: '#06b6d4', elementVi: 'Thiên Vương Tinh' },
    { id: 'neptune', key: 'neptune', nameVi: 'Sao Hải Vương', nameEn: 'Neptune', glyph: '♆', category: 'outer', color: '#6366f1', elementVi: 'Hải Vương Tinh' },
    { id: 'pluto', key: 'pluto', nameVi: 'Sao Diêm Vương', nameEn: 'Pluto', glyph: '♇', category: 'outer', color: '#a855f7', elementVi: 'Diêm Vương Tinh' },
    { id: 'north_node', key: 'north_node', nameVi: 'La Hầu (Nút Bắc)', nameEn: 'North Node', glyph: '☊', category: 'node', color: '#10b981', elementVi: 'Điểm Nút Tiến Hóa' },
    { id: 'south_node', key: 'south_node', nameVi: 'Kế Đô (Nút Nam)', nameEn: 'South Node', glyph: '☋', category: 'node', color: '#64748b', elementVi: 'Điểm Nút Nghiệp Quả' }
  ];

  const bodies: CelestialCoordinate[] = [];

  for (const item of planetKeys) {
    let lon = 0;
    let lat = 0;
    let dist = 1.0;
    let speed = 1.0;

    if (item.id === 'sun') {
      lon = sunPos.lon;
      lat = sunPos.lat;
      dist = sunPos.dist;
      speed = sunSpeed;
    } else if (item.id === 'moon') {
      lon = moonPos.lon;
      lat = moonPos.lat;
      dist = moonPos.dist;
      speed = moonSpeed;
    } else if (item.id === 'north_node') {
      lon = nodes.northLon;
      lat = 0;
      dist = 0;
      speed = nodeSpeed;
    } else if (item.id === 'south_node') {
      lon = nodes.southLon;
      lat = 0;
      dist = 0;
      speed = nodeSpeed;
    } else {
      const pos = getGeocentricPlanetPosition(item.key, T);
      const posNext = getGeocentricPlanetPosition(item.key, T_next);
      lon = pos.lon;
      lat = pos.lat;
      dist = pos.dist;
      let dLon = posNext.lon - pos.lon;
      if (dLon > 180) dLon -= 360;
      if (dLon < -180) dLon += 360;
      speed = dLon / dt;
    }

    const isRetrograde = item.id !== 'sun' && item.id !== 'moon' && speed < 0;
    const eq = eclipticToEquatorial(lon, lat, eps);
    const zInfo = getZodiacSignFromLongitude(lon);
    const dignity = determineDignity(item.id, zInfo.sign.id);
    const meaning = getDestinyMeaning(item.id, zInfo.sign, isRetrograde, lat);

    bodies.push({
      id: item.id,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      glyph: item.glyph,
      category: item.category,
      color: item.color,
      elementVi: item.elementVi,
      longitude: Math.round(lon * 10000) / 10000,
      latitude: Math.round(lat * 10000) / 10000,
      rightAscension: Math.round(eq.ra * 10000) / 10000,
      declination: Math.round(eq.dec * 10000) / 10000,
      distanceAU: Math.round(dist * 1000) / 1000,
      speed: Math.round(speed * 1000) / 1000,
      isRetrograde,
      zodiacSign: zInfo.sign,
      signDegree: zInfo.degree,
      signMinute: zInfo.minute,
      signSecond: zInfo.second,
      formattedDMS: `${zInfo.degree}°${zInfo.minute.toString().padStart(2, '0')}'${zInfo.second.toString().padStart(2, '0')}"`,
      formattedSign: `${zInfo.degree}°${zInfo.minute.toString().padStart(2, '0')}' ${zInfo.sign.nameVi} ${zInfo.sign.symbol}`,
      dignity,
      destinyMeaning: meaning
    });
  }

  // Calculate Local Sidereal Time and Ascendant / Midheaven
  const dSinceJ2000 = jd - 2451545.0;
  const gmst = normalizeDeg(280.46061837 + 360.98564736629 * dSinceJ2000);
  const lst = normalizeDeg(gmst + lonGeo);

  // Midheaven MC
  const ramcRad = lst * DEG_TO_RAD;
  const epsRad = eps * DEG_TO_RAD;
  const mcRad = Math.atan2(Math.tan(ramcRad), Math.cos(epsRad));
  let mcDeg = normalizeDeg(mcRad * RAD_TO_DEG);
  if (Math.abs(mcDeg - lst) > 90 && Math.abs(mcDeg - lst) < 270) {
    mcDeg = normalizeDeg(mcDeg + 180);
  }

  // Ascendant AC
  const latGeoRad = latGeo * DEG_TO_RAD;
  const yAsc = -Math.cos(ramcRad);
  const xAsc = Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latGeoRad) * Math.sin(epsRad);
  let ascDeg = normalizeDeg(Math.atan2(yAsc, xAsc) * RAD_TO_DEG);

  const ascSignInfo = getZodiacSignFromLongitude(ascDeg);
  const mcSignInfo = getZodiacSignFromLongitude(mcDeg);

  // Aspects
  const aspects = calculateAspects(bodies);

  // Element Distribution
  const elementDist = { fire: 0, earth: 0, air: 0, water: 0 };
  bodies.forEach(b => {
    if (b.zodiacSign.element === 'Hỏa') elementDist.fire++;
    if (b.zodiacSign.element === 'Thổ') elementDist.earth++;
    if (b.zodiacSign.element === 'Khí') elementDist.air++;
    if (b.zodiacSign.element === 'Thủy') elementDist.water++;
  });

  const retroCount = bodies.filter(b => b.isRetrograde).length;
  const dominantPlanet = bodies.find(b => b.id === 'sun') || bodies[0];

  return {
    julianDay: Math.round(jd * 10000) / 10000,
    universalTimeISO: utcDate.toISOString(),
    localCivilTimeISO: `${birthData.solarYear}-${String(birthData.solarMonth).padStart(2, '0')}-${String(birthData.solarDay).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
    trueSolarTimeISO: `${birthData.solarYear}-${String(birthData.solarMonth).padStart(2, '0')}-${String(birthData.solarDay).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
    geographicLocation: {
      city: birthData.birthCity || 'Việt Nam',
      country: birthData.birthCountry || 'VN',
      latitude: latGeo,
      longitude: lonGeo,
      timezoneOffset: tzOffset
    },
    obliquityOfEcliptic: Math.round(eps * 10000) / 10000,
    siderealTimeDegrees: Math.round(lst * 10000) / 10000,
    ascendantDegree: Math.round(ascDeg * 100) / 100,
    midheavenDegree: Math.round(mcDeg * 100) / 100,
    ascendantSign: ascSignInfo.sign,
    midheavenSign: mcSignInfo.sign,
    bodies,
    aspects,
    elementDistribution: elementDist,
    retrogradeCount: retroCount,
    dominantPlanet
  };
}

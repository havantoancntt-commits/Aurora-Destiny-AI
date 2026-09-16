// ==========================================
// TEMPORAL PRECISION & LATE RAT SUITE
// Boundary conditions, 24 solar terms, microsecond shifts,
// and time conventions across astrological engines
// ==========================================

import { findSolarTermCrossing, SOLAR_TERMS, gregorianToContinuousJD, getSunLongitudeAtInstant } from './lunarSolar';
import { calculateYearPillar, calculateMonthPillar, calculateDayPillar, calculateHourPillar } from './bazi';
import { calculateZiWeiChart } from './ziwei';
import { normalizeToCanonicalInput, buildCanonicalCacheKey } from './canonicalInput';
import { BirthData } from '../types/destiny';

export function runTemporalPrecisionTests() {
  console.log('⏳ Running Temporal Precision & Solar Term Crossing Tests...');

  // 1. Validate All 24 Solar Terms root-finding crossings
  const testYear = 2024;
  for (let i = 0; i < 24; i++) {
    const targetDeg = (i * 15) % 360;
    const approxMonth = Math.floor(i / 2) + 1;
    const approxDay = (i % 2 === 0) ? 5 : 20;
    const crossing = findSolarTermCrossing(targetDeg, { year: testYear, month: approxMonth, day: approxDay }, 7);

    const diff = Math.abs(crossing.solarLongitude - targetDeg);
    const normalizedDiff = diff > 180 ? 360 - diff : diff;
    if (normalizedDiff > 0.0001) {
      throw new Error(`Solar term ${SOLAR_TERMS[i]} (${targetDeg}°) failed precision check: got ${crossing.solarLongitude}°`);
    }
  }
  console.log('  ✔ All 24 Solar Terms converged within ±0.0001° error margin.');

  // 2. Test Solar Term boundary crossings at ±1m, ±5m, ±30m
  const lapXuanCrossing = findSolarTermCrossing(315, { year: 2024, month: 2, day: 4 }, 7);
  const boundaryOffsets = [
    { offsetMinutes: -30, expectYear: 'Gui' },
    { offsetMinutes: -5, expectYear: 'Gui' },
    { offsetMinutes: -1, expectYear: 'Gui' },
    { offsetMinutes: 1, expectYear: 'Jia' },
    { offsetMinutes: 5, expectYear: 'Jia' },
    { offsetMinutes: 30, expectYear: 'Jia' },
  ];

  for (const b of boundaryOffsets) {
    const targetTime = new Date(lapXuanCrossing.utcDate.getTime() + b.offsetMinutes * 60000);
    const localTime = new Date(targetTime.getTime() + 7 * 3600000);
    const pillar = calculateYearPillar(
      localTime.getUTCFullYear(),
      localTime.getUTCMonth() + 1,
      localTime.getUTCDate(),
      7,
      localTime.getUTCHours(),
      localTime.getUTCMinutes()
    );

    if (pillar.stem !== b.expectYear) {
      throw new Error(`Lap Xuan boundary check failed at ${b.offsetMinutes}m: expected ${b.expectYear}, got ${pillar.stem}`);
    }
  }
  console.log('  ✔ Lap Xuan boundary conditions verified at ±1m, ±5m, ±30m.');

  // 3. Late Rat rollover & canonical input consistency
  const sampleBirth: BirthData = {
    solarYear: 2024,
    solarMonth: 5,
    solarDay: 15,
    solarHour: 23,
    solarMinute: 30,
    hasExactHour: true,
    timezoneOffset: 7,
    timezoneName: 'Asia/Ho_Chi_Minh',
    birthCity: 'Ho Chi Minh City',
    birthCountry: 'Vietnam',
    gender: 'Male',
    calendarSystem: 'solar'
  };

  const normEarly = normalizeToCanonicalInput({ ...sampleBirth, isLateRat: false });
  const normLate = normalizeToCanonicalInput({ ...sampleBirth, isLateRat: true });

  const dayEarly = calculateDayPillar(normEarly.birthYear, normEarly.birthMonth, normEarly.birthDay, 7, false, normEarly.birthHour);
  const dayLate = calculateDayPillar(normLate.birthYear, normLate.birthMonth, normLate.birthDay, 7, true, normLate.birthHour);

  if (dayEarly.stem === dayLate.stem && dayEarly.branch === dayLate.branch) {
    throw new Error(`Late rat failed to advance day pillar stem/branch at 23:30.`);
  }
  console.log('  ✔ Late Rat (Dạ Tý) properly advances Day Pillar at 23:00-23:59.');

  // 4. Cache Key Uniqueness across conventions
  const keyEarly = buildCanonicalCacheKey(normEarly);
  const keyLate = buildCanonicalCacheKey(normLate);

  if (keyEarly === keyLate) {
    throw new Error('Cache key collision detected between isLateRat=false and isLateRat=true');
  }
  console.log('  ✔ Cache keys are uniquely differentiated by isLateRat.');
}

if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  runTemporalPrecisionTests();
}

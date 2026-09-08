// ==========================================
// EDGE-CASES TEST SUITE: TEMPORAL & EPHEMERIS BOUNDARIES
// Tests for Lập Xuân crossings, Late Rat (Dạ Tý), Leap Months,
// Solar Term Transitions and Day-Boundary Rollovers
// ==========================================

import { findSolarTermCrossing, convertSolarToLunar, calculateEquationOfTime, calculateTrueSolarTime } from '../../src/engine/lunarSolar';
import { calculateYearPillar, calculateDayPillar, calculateHourPillar } from '../../src/engine/bazi';
import { resolveEffectiveBirthTime } from '../../src/engine/temporalCorrection';

export function runTemporalEdgeCaseTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string, detail: string) {
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      failed++;
      const msg = `[FAIL] ${testName}: ${detail}`;
      errors.push(msg);
      console.error(`  ❌ ${msg}`);
    }
  }

  console.log(`\n🔍 [Edge-Cases Test] Verifying Temporal, Astronomical & Calendar Boundaries...`);

  // 1. Exact Numerical Crossing of Lập Xuân 2024 (315° Solar Longitude)
  const crossing2024 = findSolarTermCrossing(315, { year: 2024, month: 2, day: 4 }, 7);
  assert(
    Math.abs(crossing2024.solarLongitude - 315) < 0.0001,
    'Lập Xuân 2024 Numerical Root Precision',
    `Expected ~315°, got ${crossing2024.solarLongitude.toFixed(5)}° at ${crossing2024.localIso}`
  );

  // 2. Continuous Boundaries around Lập Xuân (-1d, -1h, -1m, +1m, +1h, +1d)
  const offsets = [
    { ms: -86400000, expectStem: 'Gui', label: '-24h pre-LapXuan' },
    { ms: -3600000, expectStem: 'Gui', label: '-1h pre-LapXuan' },
    { ms: -60000, expectStem: 'Gui', label: '-1m pre-LapXuan' },
    { ms: 60000, expectStem: 'Jia', label: '+1m post-LapXuan' },
    { ms: 3600000, expectStem: 'Jia', label: '+1h post-LapXuan' },
    { ms: 86400000, expectStem: 'Jia', label: '+24h post-LapXuan' }
  ];

  let boundaryPrecisionPassed = true;
  for (const off of offsets) {
    const dUtc = new Date(crossing2024.utcDate.getTime() + off.ms);
    const dLocal = new Date(dUtc.getTime() + 7 * 3600000);
    const p = calculateYearPillar(
      dLocal.getUTCFullYear(),
      dLocal.getUTCMonth() + 1,
      dLocal.getUTCDate(),
      7,
      dLocal.getUTCHours(),
      dLocal.getUTCMinutes()
    );
    if (p.stem !== off.expectStem) {
      boundaryPrecisionPassed = false;
      break;
    }
  }
  assert(
    boundaryPrecisionPassed,
    'Symmetrical 6-Point Lập Xuân Boundary Transition (-24h, -1h, -1m -> +1m, +1h, +24h)',
    'Year pillar transitioned deterministically between Quý Mão and Giáp Thìn'
  );

  // 3. Late Rat (Dạ Tý) 23:00 - 00:00 Boundary
  const earlyRat = calculateDayPillar(2024, 5, 10, 7, false, 23);
  const lateRat = calculateDayPillar(2024, 5, 10, 7, true, 23);
  const nextDay = calculateDayPillar(2024, 5, 11, 7, false, 0);

  assert(
    earlyRat.stem !== lateRat.stem && lateRat.stem === nextDay.stem && lateRat.branch === nextDay.branch,
    'Late Rat (Dạ Tý 23h) Day Advancement',
    `Early: ${earlyRat.stem}, Late: ${lateRat.stem}, NextDay: ${nextDay.stem}`
  );

  // 4. True Solar Time Midnight Rollover (-1 Day Shift)
  // At longitude 60°E in UTC+7 (standard meridian 105°E), longitude correction is (60 - 105)*4 = -180 minutes (-3 hours)
  // Civil time 01:30 AM -> True Solar Time will roll back to ~22:30 of previous day
  const westBirth = resolveEffectiveBirthTime({
    solarYear: 2024,
    solarMonth: 6,
    solarDay: 15,
    solarHour: 1,
    solarMinute: 30,
    hasExactHour: true,
    timezoneOffset: 7,
    timezoneName: 'Asia/Ho_Chi_Minh',
    birthCity: 'Western Outpost',
    birthCountry: 'Region',
    latitude: 20.0,
    longitude: 60.0, // 45 degrees west of meridian
    gender: 'Male',
    calendarSystem: 'solar',
    timeConvention: 'trueSolar'
  });

  assert(
    westBirth.dayShift === -1 &&
    westBirth.effectiveDate.day === 14 &&
    westBirth.effectiveHour >= 22,
    'True Solar Time Midnight Rollover (-1 Day shift into previous day)',
    `Civil: 2024-06-15 01:30 -> Effective: ${westBirth.effectiveDate.year}-${westBirth.effectiveDate.month}-${westBirth.effectiveDate.day} ${westBirth.effectiveHour}:${westBirth.effectiveMinute} (dayShift: ${westBirth.dayShift})`
  );

  // 5. Lunar Calendar Conversion for Leap Months
  const leap2023 = convertSolarToLunar(2023, 3, 22, 7);
  assert(
    leap2023.lunarYear === 2023 && leap2023.lunarMonth === 2 && leap2023.isLeapMonth === true,
    '2023 Lunar Leap Month 2 Detection (Quý Mão)',
    `Got Lunar Month: ${leap2023.lunarMonth} (isLeap: ${leap2023.isLeapMonth})`
  );

  console.log(`\n📊 [Edge-Cases Result]: ${passed} PASSED, ${failed} FAILED.`);
  return { passed, failed, errors };
}

// CLI Execution support
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^[A-Za-z]:/, ''))) {
  const res = runTemporalEdgeCaseTests();
  process.exit(res.failed > 0 ? 1 : 0);
}

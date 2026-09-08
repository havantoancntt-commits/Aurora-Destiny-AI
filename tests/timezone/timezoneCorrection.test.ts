// ==========================================
// TIMEZONE & GEOGRAPHIC CORRECTION TEST SUITE
// Tests for Longitude offsets, Equation of Time (EoT),
// Multi-city Meridian offsets, and TST vs Civil boundaries
// ==========================================

import { calculateTrueSolarTime, calculateEquationOfTime, gregorianToContinuousJD } from '../../src/engine/lunarSolar';
import { resolveEffectiveBirthTime } from '../../src/engine/temporalCorrection';

export function runTimezoneCorrectionTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log(`\n🔍 [Timezone Test] Verifying Geographic Meridians & Equation of Time...`);

  // 1. Vietnamese Cities Longitude Corrections (Meridian = 105°E for UTC+7)
  // Hanoi: 105.8542°E -> (105.8542 - 105) * 4 = +3.4168 min
  const hanoiTst = calculateTrueSolarTime(2024, 6, 15, 12, 0, 7, 105.8542);
  assert(
    Math.abs(hanoiTst.longitudeCorrectionMinutes - 3.42) < 0.05,
    'Hanoi Meridian Longitude Correction (~+3.4 min)',
    `Expected ~3.42m, got ${hanoiTst.longitudeCorrectionMinutes.toFixed(2)}m`
  );

  // Ho Chi Minh City: 106.6297°E -> (106.6297 - 105) * 4 = +6.5188 min
  const hcmcTst = calculateTrueSolarTime(2024, 6, 15, 12, 0, 7, 106.6297);
  assert(
    Math.abs(hcmcTst.longitudeCorrectionMinutes - 6.52) < 0.05,
    'Ho Chi Minh City Meridian Longitude Correction (~+6.5 min)',
    `Expected ~6.52m, got ${hcmcTst.longitudeCorrectionMinutes.toFixed(2)}m`
  );

  // Da Nang: 108.2022°E -> (108.2022 - 105) * 4 = +12.8088 min
  const danangTst = calculateTrueSolarTime(2024, 6, 15, 12, 0, 7, 108.2022);
  assert(
    Math.abs(danangTst.longitudeCorrectionMinutes - 12.81) < 0.05,
    'Da Nang Meridian Longitude Correction (~+12.8 min)',
    `Expected ~12.81m, got ${danangTst.longitudeCorrectionMinutes.toFixed(2)}m`
  );

  // 2. Physical Limits of Equation of Time (EoT) across 4 Astronomical Cardinal Points
  const cardinalDates = [
    { name: 'Vernal Equinox', year: 2024, month: 3, day: 20 },
    { name: 'Summer Solstice', year: 2024, month: 6, day: 21 },
    { name: 'Autumnal Equinox', year: 2024, month: 9, day: 22 },
    { name: 'Winter Solstice', year: 2024, month: 12, day: 21 }
  ];

  let eotBoundsValid = true;
  for (const c of cardinalDates) {
    const jd = gregorianToContinuousJD(c.year, c.month, c.day, 12, 0, 0);
    const eot = calculateEquationOfTime(jd);
    if (eot.equationOfTimeMinutes < -15 || eot.equationOfTimeMinutes > 17) {
      eotBoundsValid = false;
      break;
    }
  }
  assert(
    eotBoundsValid,
    'Equation of Time Astronomical Bounds (-15 to +17 minutes)',
    'Verified across Equinoxes and Solstices'
  );

  // 3. International Coordinates Resolution (Tokyo, UTC+9, 139.69°E vs 135°E Meridian)
  const tokyoTst = calculateTrueSolarTime(2024, 6, 15, 12, 0, 9, 139.6917);
  // (139.6917 - 135) * 4 = +18.7668 min
  assert(
    Math.abs(tokyoTst.longitudeCorrectionMinutes - 18.77) < 0.05,
    'Tokyo Longitude Correction vs Meridian 135°E (~+18.8 min)',
    `Expected ~18.77m, got ${tokyoTst.longitudeCorrectionMinutes.toFixed(2)}m`
  );

  console.log(`\n📊 [Timezone Result]: ${passed} PASSED, ${failed} FAILED.`);
  return { passed, failed, errors };
}

// Direct CLI Execution support
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^[A-Za-z]:/, ''))) {
  const res = runTimezoneCorrectionTests();
  process.exit(res.failed > 0 ? 1 : 0);
}

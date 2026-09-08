// ==========================================
// REGRESSION TEST SUITE: CALCULATION DRIFT & REPRODUCIBILITY
// Tests against the Canonical Golden Dataset
// ==========================================

import { CANONICAL_GOLDEN_CASES } from '../golden/canonicalGoldenCases';
import { runFullDestinyCalculation } from '../../src/engine/destinyEngine';
import { resolveEffectiveBirthTime } from '../../src/engine/temporalCorrection';
import { BirthData } from '../../src/types/destiny';

export function runCalculationRegressionTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  console.log(`\n🔍 [Regression Test] Verifying ${CANONICAL_GOLDEN_CASES.length} Canonical Golden Cases...`);

  for (const golden of CANONICAL_GOLDEN_CASES) {
    try {
      const birthData: BirthData = {
        solarYear: golden.birthDate.year,
        solarMonth: golden.birthDate.month,
        solarDay: golden.birthDate.day,
        solarHour: golden.birthTime.hour,
        solarMinute: golden.birthTime.minute,
        hasExactHour: golden.birthTime.hasExactHour,
        timezoneOffset: golden.timezone.timezoneOffset,
        timezoneName: golden.timezone.timezoneName,
        birthCity: golden.coordinates.city,
        birthCountry: golden.coordinates.country,
        latitude: golden.coordinates.latitude,
        longitude: golden.coordinates.longitude,
        gender: golden.gender,
        calendarSystem: golden.calendarConvention.calendarSystem,
        timeConvention: golden.calendarConvention.timeConvention,
        isLateRat: golden.calendarConvention.isLateRat
      };

      // 1. Test Canonical Time Resolution
      const resolved = resolveEffectiveBirthTime(birthData);
      if (
        resolved.effectiveDate.year !== golden.expectedCanonicalTime.effectiveYear ||
        resolved.effectiveDate.month !== golden.expectedCanonicalTime.effectiveMonth ||
        resolved.effectiveDate.day !== golden.expectedCanonicalTime.effectiveDay ||
        resolved.effectiveHour !== golden.expectedCanonicalTime.effectiveHour
      ) {
        throw new Error(
          `Canonical Time Mismatch for ${golden.id}: Expected ${golden.expectedCanonicalTime.effectiveYear}-${golden.expectedCanonicalTime.effectiveMonth}-${golden.expectedCanonicalTime.effectiveDay} ` +
          `${golden.expectedCanonicalTime.effectiveHour}:00, got ${resolved.effectiveDate.year}-${resolved.effectiveDate.month}-${resolved.effectiveDate.day} ${resolved.effectiveHour}:${resolved.effectiveMinute}`
        );
      }

      // 2. Full Destiny Calculation
      const calc1 = runFullDestinyCalculation(birthData, 'prof_golden');
      const calc2 = runFullDestinyCalculation(birthData, 'prof_golden');

      // Check Idempotence
      if (calc1.id !== calc2.id) {
        throw new Error(`Non-deterministic calculation hash detected for ${golden.id}`);
      }

      // 3. Check BaZi Pillars
      const bazi = calc1.bazi;
      if (
        bazi.yearPillar.stem !== golden.expectedBaZi.yearPillar.stem ||
        bazi.yearPillar.branch !== golden.expectedBaZi.yearPillar.branch
      ) {
        throw new Error(`Year Pillar mismatch for ${golden.id}: Expected ${golden.expectedBaZi.yearPillar.stem} ${golden.expectedBaZi.yearPillar.branch}, got ${bazi.yearPillar.stem} ${bazi.yearPillar.branch}`);
      }

      if (
        bazi.monthPillar.stem !== golden.expectedBaZi.monthPillar.stem ||
        bazi.monthPillar.branch !== golden.expectedBaZi.monthPillar.branch
      ) {
        throw new Error(`Month Pillar mismatch for ${golden.id}: Expected ${golden.expectedBaZi.monthPillar.stem} ${golden.expectedBaZi.monthPillar.branch}, got ${bazi.monthPillar.stem} ${bazi.monthPillar.branch}`);
      }

      if (
        bazi.dayPillar.stem !== golden.expectedBaZi.dayPillar.stem ||
        bazi.dayPillar.branch !== golden.expectedBaZi.dayPillar.branch
      ) {
        throw new Error(`Day Pillar mismatch for ${golden.id}: Expected ${golden.expectedBaZi.dayPillar.stem} ${golden.expectedBaZi.dayPillar.branch}, got ${bazi.dayPillar.stem} ${bazi.dayPillar.branch}`);
      }

      if (
        bazi.hourPillar.stem !== golden.expectedBaZi.hourPillar.stem ||
        bazi.hourPillar.branch !== golden.expectedBaZi.hourPillar.branch
      ) {
        throw new Error(`Hour Pillar mismatch for ${golden.id}: Expected ${golden.expectedBaZi.hourPillar.stem} ${golden.expectedBaZi.hourPillar.branch}, got ${bazi.hourPillar.stem} ${bazi.hourPillar.branch}`);
      }

      if (bazi.dayMaster !== golden.expectedBaZi.dayMaster) {
        throw new Error(`Day Master mismatch for ${golden.id}: Expected ${golden.expectedBaZi.dayMaster}, got ${bazi.dayMaster}`);
      }

      // 4. Check ZiWei Bureau & Life Palace
      const ziwei = calc1.ziwei;
      if (!ziwei.elementBureau.startsWith(golden.expectedZiWei.elementBureauStartsWith)) {
        throw new Error(`ZiWei Element Bureau mismatch for ${golden.id}: Expected starting with '${golden.expectedZiWei.elementBureauStartsWith}', got '${ziwei.elementBureau}'`);
      }

      if (ziwei.palaces.life.branch !== golden.expectedZiWei.lifePalaceBranch) {
        throw new Error(`ZiWei Life Palace Branch mismatch for ${golden.id}: Expected ${golden.expectedZiWei.lifePalaceBranch}, got ${ziwei.palaces.life.branch}`);
      }

      // 5. Invariant: Five elements sum to 100%
      const elemSum = Object.values(bazi.elementBalance).reduce((a, b) => a + b, 0);
      if (elemSum !== 100) {
        throw new Error(`Five elements percentage invariant failed for ${golden.id}: sum is ${elemSum}%`);
      }

      passed++;
      console.log(`  ✅ [PASS] ${golden.id} - ${golden.description}`);
    } catch (err: any) {
      failed++;
      const errMsg = `[FAIL] ${golden.id}: ${err?.message || err}`;
      errors.push(errMsg);
      console.error(`  ❌ ${errMsg}`);
    }
  }

  console.log(`\n📊 [Regression Result]: ${passed} PASSED, ${failed} FAILED.`);
  return { passed, failed, errors };
}

// Direct execution support
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^[A-Za-z]:/, ''))) {
  const res = runCalculationRegressionTests();
  process.exit(res.failed > 0 ? 1 : 0);
}

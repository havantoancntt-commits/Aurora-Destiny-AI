// ==========================================
// CALCULATION INTEGRITY TEST SUITE: BAZI & ZIWEI
// Tests for Five Elements Invariant (100%), 12 Palaces Structure,
// 14 Major Stars Placement, and Ten Gods (Thập Thần) Determinism
// ==========================================

import { calculateBaZiChart } from '../../src/engine/bazi';
import { calculateZiWeiChart } from '../../src/engine/ziwei';
import { getTenGod } from '../../src/engine/canchi';
import { BirthData, PalaceKey } from '../../src/types/destiny';

export function runBaziZiweiIntegrityTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log(`\n🔍 [Calculation Integrity Test] Verifying Invariants & Structural Wholeness...`);

  // 1. Element Balance Invariant across a matrix of 12 distinct birth configurations
  const matrix: BirthData[] = [
    { solarYear: 1970, solarMonth: 1, solarDay: 15, solarHour: 4, solarMinute: 0, hasExactHour: true, birthCity: 'Hanoi', birthCountry: 'Vietnam', timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh', gender: 'Male', calendarSystem: 'solar' },
    { solarYear: 1982, solarMonth: 5, solarDay: 20, solarHour: 11, solarMinute: 30, hasExactHour: true, birthCity: 'Hue', birthCountry: 'Vietnam', timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh', gender: 'Female', calendarSystem: 'solar' },
    { solarYear: 1994, solarMonth: 9, solarDay: 8, solarHour: 19, solarMinute: 15, hasExactHour: true, birthCity: 'Da Nang', birthCountry: 'Vietnam', timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh', gender: 'Male', calendarSystem: 'solar' },
    { solarYear: 2005, solarMonth: 11, solarDay: 29, solarHour: 23, solarMinute: 45, hasExactHour: true, birthCity: 'HCMC', birthCountry: 'Vietnam', timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh', gender: 'Female', calendarSystem: 'solar' },
    { solarYear: 2024, solarMonth: 2, solarDay: 4, solarHour: 16, solarMinute: 27, hasExactHour: true, birthCity: 'Can Tho', birthCountry: 'Vietnam', timezoneOffset: 7, timezoneName: 'Asia/Ho_Chi_Minh', gender: 'Male', calendarSystem: 'solar' }
  ];

  let elementMatrixPassed = true;
  for (const b of matrix) {
    const chart = calculateBaZiChart(b);
    const sum = Object.values(chart.elementBalance).reduce((a, c) => a + c, 0);
    const hasInvalid = Object.values(chart.elementBalance).some(v => isNaN(v) || v < 0 || v > 100);
    if (sum !== 100 || hasInvalid) {
      elementMatrixPassed = false;
      break;
    }
  }
  assert(
    elementMatrixPassed,
    'Five Elements Sum Strictly Invariant to 100% across Matrix (No NaN, 0 <= val <= 100)',
    'Verified across 5 distinct birth configurations'
  );

  // 2. ZiWei 12 Palaces Wholeness
  const sampleBirth: BirthData = matrix[0];
  const ziwei = calculateZiWeiChart(sampleBirth);
  const requiredPalaces: PalaceKey[] = [
    'life', 'siblings', 'spouse', 'children', 'wealth', 'health',
    'travel', 'friends', 'career', 'property', 'karma', 'parents'
  ];

  const hasAll12 = requiredPalaces.every(p => !!ziwei.palaces[p] && typeof ziwei.palaces[p].score === 'number');
  assert(
    hasAll12 && Object.keys(ziwei.palaces).length === 12,
    'ZiWei 12 Palaces Structural Wholeness',
    `Found ${Object.keys(ziwei.palaces).length} valid palaces`
  );

  // 3. Exactly 14 Major Stars Placed
  let totalMajorStars = 0;
  for (const p of Object.values(ziwei.palaces)) {
    totalMajorStars += p.majorStars.length;
  }
  assert(
    totalMajorStars === 14,
    'ZiWei 14 Major Stars Placement Wholeness',
    `Counted exactly ${totalMajorStars} major stars across all 12 palaces`
  );

  // 4. Ten Gods (Thập Thần) Relation Consistency
  const jiaJi = getTenGod('Jia', 'Ji'); // Giáp gặp Kỷ = Chính Tài
  const jiaGeng = getTenGod('Jia', 'Geng'); // Giáp gặp Canh = Thất Sát
  const gengJia = getTenGod('Geng', 'Jia'); // Canh gặp Giáp = Thiên Tài
  const renBing = getTenGod('Ren', 'Bing'); // Nhâm gặp Bính = Thiên Tài

  assert(
    jiaJi.nameVi === 'Chính Tài' &&
    jiaGeng.nameVi === 'Thất Sát' &&
    gengJia.nameVi === 'Thiên Tài' &&
    renBing.nameVi === 'Thiên Tài',
    'Ten Gods (Thập Thần) Classical Relation Matrix',
    `Got: ${jiaJi.nameVi}, ${jiaGeng.nameVi}, ${gengJia.nameVi}, ${renBing.nameVi}`
  );

  console.log(`\n📊 [Calculation Integrity Result]: ${passed} PASSED, ${failed} FAILED.`);
  return { passed, failed, errors };
}

// CLI Execution support
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/^[A-Za-z]:/, ''))) {
  const res = runBaziZiweiIntegrityTests();
  process.exit(res.failed > 0 ? 1 : 0);
}

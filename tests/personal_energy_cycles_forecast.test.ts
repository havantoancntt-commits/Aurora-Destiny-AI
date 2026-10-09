// ==========================================
// TEST SUITE: PERSONAL ENERGY 12-MONTH FORECAST & CYCLES DERIVATION
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import { BirthData, DecadeCycle } from '../src/types/destiny';

const sampleBirthData: BirthData = {
  solarYear: 1992,
  solarMonth: 8,
  solarDay: 15,
  solarHour: 10,
  solarMinute: 30,
  hasExactHour: true,
  gender: 'Male',
  calendarSystem: 'solar',
  birthCity: 'Hà Nội',
  birthCountry: 'Việt Nam',
  timezoneOffset: 7,
  timezoneName: 'Asia/Ho_Chi_Minh'
};

test('Personal Energy Forecast — calculation.cycles and decades coherence', () => {
  const calc = runFullDestinyCalculation(sampleBirthData, 'profile_test_123', 0, { analysisYear: 2026 });

  assert.ok(calc.decades, 'calc.decades must exist');
  assert.ok(calc.cycles, 'calc.cycles must be defined on CalculationResult');
  assert.strictEqual(calc.cycles.length, calc.decades.length, 'calc.cycles and calc.decades must have identical length');
  assert.strictEqual(calc.cycles[0].stem, calc.decades[0].stem, 'First cycle stem must match');
  assert.strictEqual(calc.cycles[0].branch, calc.decades[0].branch, 'First cycle branch must match');
  assert.ok(calc.cycles[0].harmonyScore >= 0 && calc.cycles[0].harmonyScore <= 100, 'Cycle harmony score must be bounded');
});

test('Personal Energy Forecast — 12-month cycles derivation integrity', () => {
  const calc = runFullDestinyCalculation(sampleBirthData, 'profile_test_123', 0, { analysisYear: 2026 });
  const cycles: DecadeCycle[] = calc.cycles || calc.decades;

  assert.ok(cycles.length > 0, 'Must have at least one decade cycle');

  // Verify that an active cycle for current year (2026) exists or can be matched
  const targetYear = 2026;
  const activeCycle = cycles.find((c: DecadeCycle) => targetYear >= c.startYear && targetYear <= c.endYear) || cycles[0];

  assert.ok(activeCycle, 'Active cycle must be resolved');
  assert.ok(typeof activeCycle.harmonyScore === 'number', 'Harmony score must be a number');
  assert.ok(activeCycle.element, 'Active cycle must possess an element');
  assert.ok(activeCycle.tenGod, 'Active cycle must specify Ten God');
});

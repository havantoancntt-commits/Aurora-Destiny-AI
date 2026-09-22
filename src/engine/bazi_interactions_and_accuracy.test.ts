import { calculateBaZiChart, determineZipingStructure, calculateBaZiInteractions } from './bazi';
import { calculateZiWeiChart } from './ziwei';
import { runFullDestinyCalculation } from './destinyEngine';
import { BirthData } from '../types/destiny';

console.log('🧪 Starting BaZi Interactions, Orthodox Ziping & Data Quality Audit Test Suite...\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

// 1. TEST BAZI INTERACTIONS
console.log('▶ Test 1: BaZi Inter-Pillar Interactions (Thiên Can Hợp/Xung, Địa Chi Lục Hợp/Xung/Hình/Hại)');
{
  const birthData: BirthData = {
    solarYear: 1990,
    solarMonth: 5,
    solarDay: 15,
    solarHour: 12,
    solarMinute: 30,
    hasExactHour: true,
    birthCity: 'Hanoi',
    birthCountry: 'Vietnam',
    timezoneOffset: 7,
    timezoneName: 'Asia/Bangkok',
    gender: 'Male',
    calendarSystem: 'solar'
  };

  const chart = calculateBaZiChart(birthData);
  assert(chart.interactions !== undefined && Array.isArray(chart.interactions), 'BaZi chart produces interactions array');
  assert(chart.structureDetails !== undefined, 'BaZi chart produces structured Ziping details');
  assert(typeof chart.structureDetails?.explanation === 'string' && chart.structureDetails.explanation.length > 0, 'Ziping structure includes scholarly explanation');
}

// 2. TEST ORTHODOX ZIPING PATTERN SOURCES
console.log('\n▶ Test 2: Orthodox Ziping Pattern Evaluation (Tử Bình Chân Thuyên)');
{
  const birthData1995: BirthData = {
    solarYear: 1995,
    solarMonth: 8,
    solarDay: 18,
    solarHour: 9,
    solarMinute: 15,
    hasExactHour: true,
    birthCity: 'Hanoi',
    birthCountry: 'Vietnam',
    timezoneOffset: 7,
    timezoneName: 'Asia/Bangkok',
    gender: 'Female',
    calendarSystem: 'solar'
  };

  const chart1995 = calculateBaZiChart(birthData1995);
  assert(Boolean(chart1995.structureDetails?.primaryPattern), `Primary pattern identified: ${chart1995.structureDetails?.primaryPattern}`);
  assert(Boolean(chart1995.structureDetails?.school), `School reference: ${chart1995.structureDetails?.school}`);
  assert(chart1995.hourPillar.isEstimated === false, 'Hour pillar isEstimated is false when hasExactHour is true');
}

// 3. TEST DATA QUALITY & UNCERTAIN HOUR INVARIANCE (No fake precision / No ungrounded conclusions)
console.log('\n▶ Test 3: Data Quality & Uncertainty Flags for Approximate/Estimated Hour');
{
  const birthDataWithoutHour: BirthData = {
    solarYear: 1988,
    solarMonth: 3,
    solarDay: 20,
    solarHour: 12,
    solarMinute: 0,
    hasExactHour: false, // User does NOT have exact hour
    birthCity: 'Hanoi',
    birthCountry: 'Vietnam',
    timezoneOffset: 7,
    timezoneName: 'Asia/Bangkok',
    gender: 'Male',
    calendarSystem: 'solar'
  };

  const baziWithoutHour = calculateBaZiChart(birthDataWithoutHour);
  assert(baziWithoutHour.hourPillar.isEstimated === true, 'Bazi hour pillar is flagged as estimated when hasExactHour is false');

  const ziweiWithoutHour = calculateZiWeiChart(birthDataWithoutHour);
  assert(ziweiWithoutHour.isEstimatedHour === true, 'Ziwei chart is flagged as isEstimatedHour when hasExactHour is false');
  assert(typeof ziweiWithoutHour.hourUncertaintyWarning === 'string', 'Ziwei chart provides explicit hour uncertainty warning to prevent fake precision');

  const fullCalculation = runFullDestinyCalculation(birthDataWithoutHour);
  assert(fullCalculation.dataQualityStatus !== undefined, 'Full calculation includes dataQualityStatus');
  assert(fullCalculation.dataQualityStatus?.hasExactHour === false, 'Data quality status accurately marks hasExactHour=false');
  assert(fullCalculation.dataQualityStatus?.hourStatus === 'APPROXIMATE_ESTIMATE', 'Hour status is marked as APPROXIMATE_ESTIMATE');
  assert(typeof fullCalculation.dataQualityStatus?.warningVi === 'string', 'Data quality status includes clear Vietnamese warning text');
}

// 4. TEST CALCULATION DETERMINISM ACROSS IDENTICAL INPUTS
console.log('\n▶ Test 4: Calculation Determinism with new features');
{
  const testInput: BirthData = {
    solarYear: 2000,
    solarMonth: 10,
    solarDay: 10,
    solarHour: 8,
    solarMinute: 45,
    hasExactHour: true,
    birthCity: 'Hanoi',
    birthCountry: 'Vietnam',
    timezoneOffset: 7,
    timezoneName: 'Asia/Bangkok',
    gender: 'Female',
    calendarSystem: 'solar'
  };

  const run1 = runFullDestinyCalculation(testInput);
  const run2 = runFullDestinyCalculation(testInput);

  assert(run1.provenance?.resultHash === run2.provenance?.resultHash, `Result hashes match: ${run1.provenance?.resultHash}`);
  assert(run1.bazi.structureType === run2.bazi.structureType, 'Bazi structureType is deterministic');
  assert(JSON.stringify(run1.bazi.interactions) === JSON.stringify(run2.bazi.interactions), 'Interactions are 100% identical between re-runs');
}

console.log(`\n==================================================`);
console.log(`Summary: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL BAZI INTERACTIONS & DATA QUALITY TESTS PASSED 100%!\n');
}

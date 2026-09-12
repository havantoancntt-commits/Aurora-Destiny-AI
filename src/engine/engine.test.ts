// ==========================================
// ENGINE UNIT & REGRESSION TEST SUITE
// Deterministic Astrological Calculations, Boundaries & Constraints
// ==========================================

import { calculateBaZiChart, calculateYearPillar, calculateHourPillar, calculateDayPillar } from './bazi';
import { getTenGod } from './canchi';
import { calculateZiWeiChart } from './ziwei';
import { runFullDestinyCalculation } from './destinyEngine';
import { runBacktestAnalysis } from './backtesting';
import { evaluateWhatIfScenario } from './scenarios';
import {
  convertSolarToLunar,
  findSolarTermCrossing,
  calculateEquationOfTime,
  calculateTrueSolarTime,
  getSunLongitudeAtTime,
  gregorianToContinuousJD
} from './lunarSolar';
import { BirthData } from '../types/destiny';
import { HistoricalEvent } from '../types/backtest';

export interface TestReport {
  passed: number;
  failed: number;
  results: { testName: string; status: 'PASS' | 'FAIL'; message: string }[];
}

export function runAllEngineTests(): TestReport {
  const results: { testName: string; status: 'PASS' | 'FAIL'; message: string }[] = [];

  function assert(condition: boolean, testName: string, message: string) {
    if (condition) {
      results.push({ testName, status: 'PASS', message });
    } else {
      results.push({ testName, status: 'FAIL', message: `FAILED: ${message}` });
    }
  }

  // TEST 1: Year Boundary Before & After Lập Xuân (Feb 4)
  const preLapXuan = calculateYearPillar(2024, 2, 2); // Should be Quý Mão (2023 cycle)
  const postLapXuan = calculateYearPillar(2024, 2, 6); // Should be Giáp Thìn (2024 cycle)
  assert(preLapXuan.stem === 'Gui' && preLapXuan.branch === 'Mao', 'Year Boundary Pre-Lap Xuan', `Pre: ${preLapXuan.stem} ${preLapXuan.branch}`);
  assert(postLapXuan.stem === 'Jia' && postLapXuan.branch === 'Chen', 'Year Boundary Post-Lap Xuan', `Post: ${postLapXuan.stem} ${postLapXuan.branch}`);

  // TEST 2: Midnight / Early Morning Hour Transitions (Tý vs Sửu)
  const lateNight = calculateHourPillar('Jia', 23); // Tý
  const earlyMorning = calculateHourPillar('Jia', 1); // Sửu
  assert(lateNight.branch === 'Zi', 'Midnight Hour Boundary (23h = Zi)', `Hour: ${lateNight.branch}`);
  assert(earlyMorning.branch === 'Chou', 'Early Morning Hour (01h = Chou)', `Hour: ${earlyMorning.branch}`);

  // TEST 3: Five Elements Sum to Exactly 100%
  const sampleBirth: BirthData = {
    solarYear: 1995,
    solarMonth: 8,
    solarDay: 18,
    solarHour: 14,
    solarMinute: 30,
    hasExactHour: true,
    birthCity: 'Hanoi',
    birthCountry: 'Vietnam',
    timezoneOffset: 7,
    timezoneName: 'Asia/Bangkok',
    gender: 'Male',
    calendarSystem: 'solar'
  };
  const bazi = calculateBaZiChart(sampleBirth);
  const sumElements = Object.values(bazi.elementBalance).reduce((a, b) => a + b, 0);
  assert(sumElements === 100, 'Five Elements Percentage Balance Sum = 100%', `Sum is ${sumElements}%`);

  // TEST 4: Deterministic Repeatability Check
  const calc1 = runFullDestinyCalculation(sampleBirth, 'p1');
  const calc2 = runFullDestinyCalculation(sampleBirth, 'p1');
  assert(
    calc1.bazi.dayMaster === calc2.bazi.dayMaster &&
    calc1.bazi.dayPillar.stem === calc2.bazi.dayPillar.stem &&
    calc1.ziwei.elementBureau === calc2.ziwei.elementBureau,
    'Deterministic Repeatability',
    'Dual runs produced identical astrological pillars'
  );

  // TEST 5: Zi Wei Dou Shu 12 Palaces Structure & Major Stars
  const ziwei = calculateZiWeiChart(sampleBirth);
  const palaceKeys = Object.keys(ziwei.palaces);
  assert(palaceKeys.length === 12, 'Zi Wei 12 Palaces Completeness', `Generated ${palaceKeys.length} palaces`);
  assert(!!ziwei.palaces.life && !!ziwei.palaces.career && !!ziwei.palaces.wealth, 'Core Palaces Check', 'Life, Career, Wealth palaces exist');

  // TEST 6: Lunar Calendar Conversion
  const lunar = convertSolarToLunar(1995, 8, 18);
  assert(lunar.lunarYear === 1995 && lunar.lunarMonth === 7 && lunar.lunarDay === 23, 'Solar to Lunar Conversion (1995-08-18 -> 1995-07-23)', `Lunar: ${lunar.lunarYear}-${lunar.lunarMonth}-${lunar.lunarDay}`);

  // TEST 7: Ten Gods (Thập Thần) Relation Consistency
  const directWealth = getTenGod('Jia', 'Ji').nameVi; // Giáp gặp Kỷ (Chính Tài)
  const sevenKillings = getTenGod('Jia', 'Geng').nameVi; // Giáp gặp Canh (Thất Sát)
  assert(directWealth === 'Chính Tài', 'Ten Gods Direct Wealth', `Got ${directWealth}`);
  assert(sevenKillings === 'Thất Sát', 'Ten Gods Seven Killings', `Got ${sevenKillings}`);

  // TEST 8: Backtesting Engine with Real Historical Events
  const sampleEvents: HistoricalEvent[] = [
    {
      id: 'e1',
      profileId: 'p1',
      year: 2021,
      title: 'Thăng chức Giám đốc Công nghệ',
      category: 'Career',
      impact: 'Breakthrough',
      intensity: 5,
      description: 'Được đề bạt lên vị trí C-Level',
      userConfidence: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'e2',
      profileId: 'p1',
      year: 2022,
      title: 'Đầu tư tiền số thua lỗ',
      category: 'Finance',
      impact: 'Negative',
      intensity: 4,
      description: 'Biến động thị trường',
      userConfidence: 4,
      createdAt: new Date().toISOString()
    }
  ];
  const btResult = runBacktestAnalysis(sampleEvents, calc1);
  assert(btResult.totalEventsAnalyzed === 2, 'Backtest Event Processing', `Processed ${btResult.totalEventsAnalyzed} events`);
  assert(btResult.destinyConsistencyScore >= 0 && btResult.destinyConsistencyScore <= 100, 'Backtest Score Validity', `Score: ${btResult.destinyConsistencyScore}/100`);

  // TEST 9: What-If Scenario Engine (3 Distinct Branches)
  const scenarioResult = evaluateWhatIfScenario('Tôi có nên chuyển sang làm AI năm nay?', calc1);
  assert(scenarioResult.scenarios.length === 3, 'What-If 3-Branch Scenarios', `Generated ${scenarioResult.scenarios.length} branches (A, B, C)`);

  // TEST 10: Late Rat (Dạ Tý) Boundary Comparison at 23:00
  // On 2024-05-10, hour 23 with isLateRat = false should keep day 10 pillar.
  // With isLateRat = true, it should advance to day 11 pillar.
  const earlyRatDay = calculateDayPillar(2024, 5, 10, 7, false, 23);
  const lateRatDay = calculateDayPillar(2024, 5, 10, 7, true, 23);
  const nextDayPillar = calculateDayPillar(2024, 5, 11, 7, false, 12);
  assert(
    earlyRatDay.stem !== lateRatDay.stem && lateRatDay.stem === nextDayPillar.stem,
    'Late Rat Day Pillar Transition at 23h',
    `Early: ${earlyRatDay.stem} vs Late: ${lateRatDay.stem} (Next day: ${nextDayPillar.stem})`
  );

  // TEST 11: Element Balance 100% Invariant across multiple charts
  const testBirths: BirthData[] = [
    { ...sampleBirth, solarYear: 1980, solarMonth: 1, solarDay: 1, solarHour: 0 },
    { ...sampleBirth, solarYear: 1990, solarMonth: 6, solarDay: 15, solarHour: 12 },
    { ...sampleBirth, solarYear: 2000, solarMonth: 12, solarDay: 31, solarHour: 23 },
    { ...sampleBirth, solarYear: 2024, solarMonth: 2, solarDay: 4, solarHour: 16 }
  ];
  let allSums100 = true;
  for (const b of testBirths) {
    const chart = calculateBaZiChart(b);
    const sum = Object.values(chart.elementBalance).reduce((acc, v) => acc + v, 0);
    const hasNaN = Object.values(chart.elementBalance).some(v => isNaN(v) || v < 0);
    if (sum !== 100 || hasNaN) {
      allSums100 = false;
      break;
    }
  }
  assert(allSums100, 'Element Balance Invariant Across Multiple Charts', 'All charts produced valid non-NaN percentages summing strictly to 100%');

  // TEST 12: Continuous Solar Longitude & Solar Term Resolution
  const solarTermFeb3 = convertSolarToLunar(2024, 2, 3);
  const solarTermFeb5 = convertSolarToLunar(2024, 2, 5);
  assert(
    solarTermFeb3.lunarDay > 0 && solarTermFeb5.lunarDay > 0,
    'Solar Term Resolution Stability',
    `Feb 3: ${solarTermFeb3.lunarDay}, Feb 5: ${solarTermFeb5.lunarDay}`
  );

  // TEST 13: Backtest with Empty Events Handling
  const emptyBt = runBacktestAnalysis([], calc1);
  assert(
    emptyBt.totalEventsAnalyzed === 0 &&
    emptyBt.destinyConsistencyScore === 0 &&
    (emptyBt.confidenceBand === 'Insufficient Historical Evidence' || emptyBt.confidenceBand === 'Sparse Data Fit') &&
    emptyBt.evidenceStatus === 'INSUFFICIENT_HISTORICAL_EVIDENCE',
    'Backtest Empty Events Fallback',
    `Analyzed: ${emptyBt.totalEventsAnalyzed}, Score: ${emptyBt.destinyConsistencyScore}, Band: ${emptyBt.confidenceBand}`
  );

  // TEST 14: Backtest Deduplication of Identical Events
  const duplicateEvents: HistoricalEvent[] = [
    sampleEvents[0],
    { ...sampleEvents[0], id: 'e1_dup' }
  ];
  const dedupBt = runBacktestAnalysis(duplicateEvents, calc1);
  assert(
    dedupBt.totalEventsAnalyzed === 1,
    'Backtest Deduplication of Identical Year & Title',
    `Deduped from 2 to ${dedupBt.totalEventsAnalyzed} event`
  );

  // TEST 15: Exact Solar Term Crossing & Lập Xuân Boundary Suite
  const crossing2024 = findSolarTermCrossing(315, { year: 2024, month: 2, day: 4 }, 7);
  assert(
    Math.abs(crossing2024.solarLongitude - 315) < 0.0001,
    'Solar Term Numerical Crossing Precision',
    `Found Lập Xuân 2024 crossing at ${crossing2024.localIso} (Long: ${crossing2024.solarLongitude.toFixed(5)}°)`
  );

  // Boundary testing: -1d, -1h, -10m, -1m, +1m, +10m, +1h, +1d
  const testOffsets = [
    { offsetMs: -86400000, label: '-1d', expectYear: 'Gui' },
    { offsetMs: -3600000, label: '-1h', expectYear: 'Gui' },
    { offsetMs: -600000, label: '-10m', expectYear: 'Gui' },
    { offsetMs: -60000, label: '-1m', expectYear: 'Gui' },
    { offsetMs: 60000, label: '+1m', expectYear: 'Jia' },
    { offsetMs: 600000, label: '+10m', expectYear: 'Jia' },
    { offsetMs: 3600000, label: '+1h', expectYear: 'Jia' },
    { offsetMs: 86400000, label: '+1d', expectYear: 'Jia' }
  ];

  let boundaryTestsPassed = true;
  for (const t of testOffsets) {
    const instantDate = new Date(crossing2024.utcDate.getTime() + t.offsetMs);
    const localDate = new Date(instantDate.getTime() + 7 * 3600000);
    const p = calculateYearPillar(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth() + 1,
      localDate.getUTCDate(),
      7,
      localDate.getUTCHours(),
      localDate.getUTCMinutes()
    );
    if (p.stem !== t.expectYear) {
      boundaryTestsPassed = false;
      break;
    }
  }
  assert(
    boundaryTestsPassed,
    'Solar Term Crossing Boundaries (-1d, -1h, -10m, -1m, +1m, +10m, +1h, +1d)',
    'All 8 boundary instants transitioned deterministically between Quý Mão and Giáp Thìn'
  );

  // TEST 16: True Solar Time & Equation of Time (EoT) Verification
  const j2000 = gregorianToContinuousJD(2000, 1, 1, 12, 0, 7);
  const eotJ2000 = calculateEquationOfTime(j2000);
  assert(
    eotJ2000.equationOfTimeMinutes >= -15 && eotJ2000.equationOfTimeMinutes <= 17,
    'Equation of Time Physical Limits',
    `J2000 EoT: ${eotJ2000.equationOfTimeMinutes.toFixed(2)} min (within -15 to +17 min)`
  );

  const tstResult = calculateTrueSolarTime(2024, 6, 15, 12, 0, 7, 105.85); // Hanoi: 105.85°E
  assert(
    tstResult.convention === 'trueSolar' &&
    tstResult.longitudeCorrectionMinutes === 3.4 && // (105.85 - 105) * 4 = +3.4m
    typeof tstResult.trueSolarHour === 'number' &&
    typeof tstResult.trueSolarMinute === 'number',
    'True Solar Time Hanoi Solar Correction',
    `Civil: 12:00 -> True Solar: ${tstResult.trueSolarHour}:${String(tstResult.trueSolarMinute).padStart(2, '0')} (EoT: ${tstResult.equationOfTimeMinutes}m, LongCorr: ${tstResult.longitudeCorrectionMinutes}m)`
  );

  // TEST 17: Comprehensive Late Rat 10-Time Matrix
  // Test matrix on base date: 2024-05-10
  const matrixTimes = [
    { hour: 22, min: 59, branch: 'Hai', lateAdvances: false },
    { hour: 23, min: 0, branch: 'Zi', lateAdvances: true },
    { hour: 23, min: 30, branch: 'Zi', lateAdvances: true },
    { hour: 23, min: 59, branch: 'Zi', lateAdvances: true },
    { hour: 0, min: 0, branch: 'Zi', lateAdvances: false }, // Calendar day 11
    { hour: 0, min: 30, branch: 'Zi', lateAdvances: false },
    { hour: 0, min: 59, branch: 'Zi', lateAdvances: false },
    { hour: 1, min: 0, branch: 'Chou', lateAdvances: false },
    { hour: 1, min: 59, branch: 'Chou', lateAdvances: false },
    { hour: 2, min: 0, branch: 'Chou', lateAdvances: false }
  ];

  let matrixAllCorrect = true;
  for (const m of matrixTimes) {
    const day = m.hour === 23 || m.hour === 22 ? 10 : 11;
    const dpEarly = calculateDayPillar(2024, 5, day, 7, false, m.hour);
    const dpLate = calculateDayPillar(2024, 5, day, 7, true, m.hour);
    const hp = calculateHourPillar(dpEarly.stem, m.hour, m.min, false);

    if (hp.branch !== m.branch) {
      matrixAllCorrect = false;
      break;
    }
    if (m.lateAdvances) {
      if (dpEarly.stem === dpLate.stem) {
        matrixAllCorrect = false;
        break;
      }
    } else {
      if (dpEarly.stem !== dpLate.stem) {
        matrixAllCorrect = false;
        break;
      }
    }
  }
  assert(
    matrixAllCorrect,
    'Late Rat 10-Time Matrix (22:59 to 02:00 for ON and OFF)',
    'Verified branch and day transitions across all 10 boundary timestamps'
  );

  // TEST 18: Lunar Calendar Benchmark Dataset (1984 - 2025)
  const lunarBenchmarks = [
    { sy: 1984, sm: 2, sd: 2, ly: 1984, lm: 1, ld: 1, isLeap: false, desc: 'Giáp Tý Tết' },
    { sy: 2000, sm: 2, sd: 5, ly: 2000, lm: 1, ld: 1, isLeap: false, desc: 'Canh Thìn Tết' },
    { sy: 2020, sm: 1, sd: 25, ly: 2020, lm: 1, ld: 1, isLeap: false, desc: 'Canh Tý Tết' },
    { sy: 2023, sm: 3, sd: 22, ly: 2023, lm: 2, ld: 1, isLeap: true, desc: 'Quý Mão Nhuận Tháng 2' },
    { sy: 2024, sm: 2, sd: 10, ly: 2024, lm: 1, ld: 1, isLeap: false, desc: 'Giáp Thìn Tết' },
    { sy: 2025, sm: 1, sd: 29, ly: 2025, lm: 1, ld: 1, isLeap: false, desc: 'Ất Tỵ Tết' }
  ];

  let lunarAllPassed = true;
  for (const b of lunarBenchmarks) {
    const l = convertSolarToLunar(b.sy, b.sm, b.sd, 7);
    if (l.lunarYear !== b.ly || l.lunarMonth !== b.lm || l.lunarDay !== b.ld || l.isLeapMonth !== b.isLeap) {
      lunarAllPassed = false;
      break;
    }
  }
  assert(
    lunarAllPassed,
    'Lunar Calendar Benchmark Dataset (1984-2025 Tet & Leap Months)',
    'All 6 historic benchmarks matched astronomical records exactly'
  );

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  return { passed, failed, results };
}

// Direct CLI Execution support
if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Running Aurora Destiny AI Astronomical Engine Test Suite...\n');
  const report = runAllEngineTests();
  for (const r of report.results) {
    const symbol = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${symbol} [${r.status}] ${r.testName}: ${r.message}`);
  }
  console.log(`\n📊 Summary: ${report.passed} passed, ${report.failed} failed.`);
  if (report.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

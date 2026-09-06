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
import { convertSolarToLunar } from './lunarSolar';
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
    emptyBt.confidenceBand === 'Sparse Data Fit',
    'Backtest Empty Events Fallback',
    `Analyzed: ${emptyBt.totalEventsAnalyzed}, Score: ${emptyBt.destinyConsistencyScore}`
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

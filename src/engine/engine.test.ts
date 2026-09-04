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

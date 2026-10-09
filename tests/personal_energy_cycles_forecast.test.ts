// ==========================================
// TEST SUITE: PERSONAL ENERGY 12-MONTH FORECAST & CYCLES DERIVATION
// Testing 12-month trajectory calculation & anomaly alert system (sudden drops/surges)
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import { BirthData, DecadeCycle } from '../src/types/destiny';
import {
  compute12MonthsEnergyTrajectory,
  detectEnergyShifts,
  MonthlyEnergyPoint
} from '../src/engine/personalEnergyEngine';

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

test('Personal Energy Forecast — compute12MonthsEnergyTrajectory yields 12 valid points', () => {
  const calc = runFullDestinyCalculation(sampleBirthData, 'profile_test_123', 0, { analysisYear: 2026 });
  const trajectory = compute12MonthsEnergyTrajectory(calc, new Date(2026, 9, 1)); // Oct 2026

  assert.strictEqual(trajectory.length, 12, 'Must produce exactly 12 months');
  assert.strictEqual(trajectory[0].month, 10, 'First month must match start month (10)');
  assert.strictEqual(trajectory[0].year, 2026, 'First year must match start year');
  assert.strictEqual(trajectory[11].month, 9, '12th month must be 9 (September)');
  assert.strictEqual(trajectory[11].year, 2027, '12th month year must be 2027');

  for (const point of trajectory) {
    assert.ok(point.compositeEnergy >= 40 && point.compositeEnergy <= 100, 'Composite energy bounded');
    assert.ok(point.vitalityEnergy >= 40 && point.vitalityEnergy <= 100, 'Vitality bounded');
    assert.ok(point.opportunityScore >= 40 && point.opportunityScore <= 100, 'Opportunity bounded');
    assert.ok(point.harmonyScore >= 40 && point.harmonyScore <= 100, 'Harmony bounded');
    assert.ok(point.canChiName.length > 0, 'Can Chi name must exist');
    assert.ok(point.activeCycleName.length > 0, 'Governing cycle name must exist');
    assert.ok(['VƯỢNG KHÍ', 'CÁT LỢI', 'BÌNH HÒA', 'THẬN TRỌNG'].includes(point.statusTag), 'Valid status tag');
  }
});

test('Personal Energy Forecast — detectEnergyShifts detects sudden drop and sudden surge', () => {
  // Construct mock points with an intentional sudden drop and surge
  const mockPoints: MonthlyEnergyPoint[] = [
    {
      monthIndex: 0,
      label: 'T10/26',
      fullLabel: 'Tháng 10/2026',
      year: 2026,
      month: 10,
      stem: 'Bing',
      branch: 'Xu',
      canChiName: 'Bính Tuất',
      element: 'Fire',
      solarTermName: 'Hàn Lộ',
      activeCycleName: 'Đại Vận Giáp Thân',
      activeCycleElement: 'Wood',
      activeCycleScore: 80,
      vitalityEnergy: 82,
      opportunityScore: 84,
      harmonyScore: 80,
      compositeEnergy: 82,
      statusTag: 'CÁT LỢI',
      strategicAdvice: 'Tiến thoái nhịp nhàng',
      elementInteraction: 'Tương sinh'
    },
    {
      // Sudden drop: 82 -> 66 (delta = -16 <= -10)
      monthIndex: 1,
      label: 'T11/26',
      fullLabel: 'Tháng 11/2026',
      year: 2026,
      month: 11,
      stem: 'Ding',
      branch: 'Hai',
      canChiName: 'Đinh Hợi',
      element: 'Fire',
      solarTermName: 'Lập Đông',
      activeCycleName: 'Đại Vận Giáp Thân',
      activeCycleElement: 'Wood',
      activeCycleScore: 80,
      vitalityEnergy: 65,
      opportunityScore: 64,
      harmonyScore: 68,
      compositeEnergy: 66,
      statusTag: 'THẬN TRỌNG',
      strategicAdvice: 'Quản trị rủi ro',
      elementInteraction: 'Xung khắc'
    },
    {
      // Smooth continuation: 66 -> 68 (delta = +2, no alert)
      monthIndex: 2,
      label: 'T12/26',
      fullLabel: 'Tháng 12/2026',
      year: 2026,
      month: 12,
      stem: 'Wu',
      branch: 'Zi',
      canChiName: 'Mậu Tý',
      element: 'Earth',
      solarTermName: 'Đại Tuyết',
      activeCycleName: 'Đại Vận Giáp Thân',
      activeCycleElement: 'Wood',
      activeCycleScore: 80,
      vitalityEnergy: 67,
      opportunityScore: 69,
      harmonyScore: 68,
      compositeEnergy: 68,
      statusTag: 'BÌNH HÒA',
      strategicAdvice: 'Bình hòa',
      elementInteraction: 'Bình hòa'
    },
    {
      // Sudden surge: 68 -> 85 (delta = +17 >= 10)
      monthIndex: 3,
      label: 'T1/27',
      fullLabel: 'Tháng 1/2027',
      year: 2027,
      month: 1,
      stem: 'Ji',
      branch: 'Chou',
      canChiName: 'Kỷ Sửu',
      element: 'Earth',
      solarTermName: 'Tiểu Hàn',
      activeCycleName: 'Đại Vận Giáp Thân',
      activeCycleElement: 'Wood',
      activeCycleScore: 80,
      vitalityEnergy: 86,
      opportunityScore: 87,
      harmonyScore: 83,
      compositeEnergy: 85,
      statusTag: 'VƯỢNG KHÍ',
      strategicAdvice: 'Bứt phá',
      elementInteraction: 'Tương sinh'
    }
  ];

  const alerts = detectEnergyShifts(mockPoints, {
    threshold: 10,
    favorableElements: ['Metal', 'Water']
  });

  assert.strictEqual(alerts.length, 2, 'Should identify exactly 2 anomaly transitions (1 drop, 1 surge)');

  const dropAlert = alerts.find((a) => a.type === 'drop');
  assert.ok(dropAlert, 'Must contain a drop alert');
  assert.strictEqual(dropAlert?.month, 11, 'Drop alert is at month 11');
  assert.strictEqual(dropAlert?.delta, -16, 'Delta must be -16');
  assert.ok(dropAlert?.shortWarning.includes('giảm 16 điểm'), 'Short warning explains delta drop');
  assert.ok(dropAlert?.strategicRemedy.includes('Lời khuyên'), 'Must provide actionable remedy');
  assert.ok(dropAlert?.favorableElementHint?.includes('Kim, Thủy'), 'Must incorporate favorable element hint');

  const surgeAlert = alerts.find((a) => a.type === 'surge');
  assert.ok(surgeAlert, 'Must contain a surge alert');
  assert.strictEqual(surgeAlert?.month, 1, 'Surge alert is at month 1');
  assert.strictEqual(surgeAlert?.delta, 17, 'Delta must be +17');
  assert.ok(surgeAlert?.shortWarning.includes('+17 điểm'), 'Short warning explains surge');
  assert.ok(surgeAlert?.title.includes('bứt phá'), 'Title conveys surge opportunity');
});

test('Personal Energy Forecast — detectEnergyShifts returns empty when variations are mild', () => {
  const steadyPoints: MonthlyEnergyPoint[] = [
    {
      monthIndex: 0,
      label: 'T1/26',
      fullLabel: 'Tháng 1/2026',
      year: 2026,
      month: 1,
      stem: 'Jia',
      branch: 'Yin_B',
      canChiName: 'Giáp Dần',
      element: 'Wood',
      solarTermName: 'Lập Xuân',
      activeCycleName: 'Đại Vận',
      activeCycleElement: 'Wood',
      activeCycleScore: 75,
      vitalityEnergy: 75,
      opportunityScore: 75,
      harmonyScore: 75,
      compositeEnergy: 75,
      statusTag: 'CÁT LỢI',
      strategicAdvice: 'Ổn định',
      elementInteraction: 'Đồng khí'
    },
    {
      monthIndex: 1,
      label: 'T2/26',
      fullLabel: 'Tháng 2/2026',
      year: 2026,
      month: 2,
      stem: 'Yi',
      branch: 'Mao',
      canChiName: 'Ất Mão',
      element: 'Wood',
      solarTermName: 'Kinh Trập',
      activeCycleName: 'Đại Vận',
      activeCycleElement: 'Wood',
      activeCycleScore: 75,
      vitalityEnergy: 77,
      opportunityScore: 76,
      harmonyScore: 76,
      compositeEnergy: 77, // delta = +2 (< 10)
      statusTag: 'CÁT LỢI',
      strategicAdvice: 'Ổn định',
      elementInteraction: 'Đồng khí'
    },
    {
      monthIndex: 2,
      label: 'T3/26',
      fullLabel: 'Tháng 3/2026',
      year: 2026,
      month: 3,
      stem: 'Bing',
      branch: 'Chen',
      canChiName: 'Bính Thìn',
      element: 'Fire',
      solarTermName: 'Thanh Minh',
      activeCycleName: 'Đại Vận',
      activeCycleElement: 'Wood',
      activeCycleScore: 75,
      vitalityEnergy: 74,
      opportunityScore: 73,
      harmonyScore: 75,
      compositeEnergy: 74, // delta = -3 (> -10)
      statusTag: 'CÁT LỢI',
      strategicAdvice: 'Ổn định',
      elementInteraction: 'Sinh xuất'
    }
  ];

  const alerts = detectEnergyShifts(steadyPoints, { threshold: 10 });
  assert.strictEqual(alerts.length, 0, 'No alerts should be triggered when variation is within normal threshold');
});

test('Personal Energy Forecast — live calculation integration test', () => {
  const calc = runFullDestinyCalculation(sampleBirthData, 'profile_test_123', 0, { analysisYear: 2026 });
  const trajectory = compute12MonthsEnergyTrajectory(calc);
  const alerts = detectEnergyShifts(trajectory, {
    threshold: 10,
    favorableElements: calc.bazi.favorableElements
  });

  // Verify alerts structure if any exist
  assert.ok(Array.isArray(alerts), 'Alerts must be an array');
  for (const alert of alerts) {
    assert.ok(alert.id, 'Alert must have id');
    assert.ok(alert.type === 'drop' || alert.type === 'surge', 'Type must be drop or surge');
    assert.ok(typeof alert.delta === 'number', 'Delta must be numeric');
    assert.ok(alert.title, 'Title must be present');
    assert.ok(alert.shortWarning, 'Short warning must be present');
    assert.ok(alert.detailedGuidance, 'Detailed guidance must be present');
  }
});

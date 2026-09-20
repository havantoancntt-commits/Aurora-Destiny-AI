// ==========================================
// REALTIME ENGINE GOLDEN TEST SUITE
// Astronomical Solar Terms, Dynamic Pillars, Timezone Offsets & Na Yin
// ==========================================

import { calculateRealtimeSnapshot } from './realtimeEngine';
import { runFullDestinyCalculation } from './destinyEngine';
import { BirthData } from '../types/destiny';

export function runRealtimeEngineTests() {
  console.log('🌌 Running Realtime Engine Golden Tests...');

  const sampleChart: BirthData = {
    solarYear: 1990,
    solarMonth: 6,
    solarDay: 15,
    solarHour: 8,
    solarMinute: 30,
    hasExactHour: true,
    timezoneOffset: 7,
    timezoneName: 'Asia/Ho_Chi_Minh',
    birthCity: 'Hanoi',
    birthCountry: 'Vietnam',
    gender: 'Male',
    calendarSystem: 'solar'
  };
  const calculationResult = runFullDestinyCalculation(sampleChart, 'prof_realtime_test');

  // 1. Dynamic Year and Month Pillar check across dates
  // 2026-08-15 is after Lap Xuan 2026 (Bính Ngọ year) and in Month 7 (Bính Thân)
  const snapshotAug2026 = calculateRealtimeSnapshot(calculationResult, new Date('2026-08-15T10:00:00+07:00'), 7);
  if (!snapshotAug2026.currentYearPillar || snapshotAug2026.currentYearPillar.branch !== 'Ngọ') {
    throw new Error(`Expected year branch Ngọ for Aug 2026, got ${snapshotAug2026.currentYearPillar?.branch}`);
  }
  if (!snapshotAug2026.currentYearPillar.stem || snapshotAug2026.currentYearPillar.stem !== 'Bính') {
    throw new Error(`Expected year stem Bính for 2026, got ${snapshotAug2026.currentYearPillar?.stem}`);
  }
  console.log(`  ✔ Year pillar dynamically calculated: ${snapshotAug2026.currentYearPillar.stem} ${snapshotAug2026.currentYearPillar.branch}`);

  // 2. Year transition before and after Lap Xuan (Feb 4)
  // Jan 15 2026 is BEFORE Lap Xuan 2026 -> Still Ất Tỵ year
  const snapshotPreLapXuan = calculateRealtimeSnapshot(calculationResult, new Date('2026-01-15T10:00:00+07:00'), 7);
  if (snapshotPreLapXuan.currentYearPillar.branch !== 'Tỵ') {
    throw new Error(`Expected year branch Tỵ before Lap Xuan 2026, got ${snapshotPreLapXuan.currentYearPillar.branch}`);
  }
  console.log(`  ✔ Pre-Lap Xuan year boundary correctly retains previous year: ${snapshotPreLapXuan.currentYearPillar.stem} ${snapshotPreLapXuan.currentYearPillar.branch}`);

  // 3. Dynamic Hour Pillar & Na Yin check
  // 10:00 is Tỵ hour (9:00 - 10:59)
  if (!snapshotAug2026.currentHourPillar || snapshotAug2026.currentHourPillar.branch !== 'Tỵ') {
    throw new Error(`Expected hour branch Tỵ at 10:00, got ${snapshotAug2026.currentHourPillar.branch}`);
  }
  if (!snapshotAug2026.currentHourPillar.naYin || snapshotAug2026.currentHourPillar.naYin.length === 0) {
    throw new Error(`Expected valid Na Yin for hour pillar, got empty string`);
  }
  console.log(`  ✔ Hour pillar dynamic calculation: ${snapshotAug2026.currentHourPillar.stem} ${snapshotAug2026.currentHourPillar.branch} (Nạp âm: ${snapshotAug2026.currentHourPillar.naYin})`);

  // 4. Midnight Hour (23:00 - 00:59 is Tý hour)
  const snapshotMidnight = calculateRealtimeSnapshot(calculationResult, new Date('2026-08-15T23:30:00+07:00'), 7);
  if (snapshotMidnight.currentHourPillar.branch !== 'Tý') {
    throw new Error(`Expected hour branch Tý at 23:30, got ${snapshotMidnight.currentHourPillar.branch}`);
  }
  console.log(`  ✔ Midnight hour boundary (23:30) correctly resolves to Tý hour`);

  // 5. Timezone variation (UTC+7 vs UTC+0)
  // At 2026-08-15T02:30:00Z:
  // In UTC+7 it is 09:30 (Tỵ hour)
  // In UTC+0 it is 02:30 (Sửu hour)
  const instant = new Date('2026-08-15T02:30:00Z');
  const snapUtc7 = calculateRealtimeSnapshot(calculationResult, instant, 7);
  const snapUtc0 = calculateRealtimeSnapshot(calculationResult, instant, 0);
  if (snapUtc7.currentHourPillar.branch === snapUtc0.currentHourPillar.branch) {
    throw new Error(`Expected different hour branches for UTC+7 vs UTC+0 at same instant`);
  }
  if (snapUtc7.currentHourPillar.branch !== 'Tỵ') {
    throw new Error(`Expected Tỵ for UTC+7 at 09:30, got ${snapUtc7.currentHourPillar.branch}`);
  }
  if (snapUtc0.currentHourPillar.branch !== 'Sửu') {
    throw new Error(`Expected Sửu for UTC+0 at 02:30, got ${snapUtc0.currentHourPillar.branch}`);
  }
  console.log(`  ✔ Timezone sensitivity verified: UTC+7 (${snapUtc7.currentHourPillar.branch}) vs UTC+0 (${snapUtc0.currentHourPillar.branch})`);

  // 6. Deterministic Repeatability
  const snapA = calculateRealtimeSnapshot(calculationResult, instant, 7);
  const snapB = calculateRealtimeSnapshot(calculationResult, instant, 7);
  if (JSON.stringify(snapA) !== JSON.stringify(snapB)) {
    throw new Error(`Dual executions with same input produced divergent snapshots`);
  }
  console.log(`  ✔ Deterministic snapshot repeatability confirmed 100%`);

  // 7. Multi-Year Progression (2024 to 2028)
  const years = [
    { year: 2024, expectedStem: 'Giáp', expectedBranch: 'Thìn' },
    { year: 2025, expectedStem: 'Ất', expectedBranch: 'Tỵ' },
    { year: 2026, expectedStem: 'Bính', expectedBranch: 'Ngọ' },
    { year: 2027, expectedStem: 'Đinh', expectedBranch: 'Mùi' },
    { year: 2028, expectedStem: 'Mậu', expectedBranch: 'Thân' }
  ];
  for (const y of years) {
    const snap = calculateRealtimeSnapshot(calculationResult, new Date(`${y.year}-07-01T12:00:00+07:00`), 7);
    if (snap.currentYearPillar.stem !== y.expectedStem || snap.currentYearPillar.branch !== y.expectedBranch) {
      throw new Error(`Year progression failed for ${y.year}: expected ${y.expectedStem} ${y.expectedBranch}, got ${snap.currentYearPillar.stem} ${snap.currentYearPillar.branch}`);
    }
  }
  console.log(`  ✔ Multi-year progression (2024 - 2028) dynamically verified.`);

  // 8. Negative Timezones (UTC-5 New York, UTC-8 Los Angeles)
  const snapNy = calculateRealtimeSnapshot(calculationResult, instant, -5);
  const snapLa = calculateRealtimeSnapshot(calculationResult, instant, -8);
  const snapTokyo = calculateRealtimeSnapshot(calculationResult, instant, 9);
  if (snapNy.currentHourPillar.branch === snapLa.currentHourPillar.branch && snapNy.hourStr === snapLa.hourStr) {
    throw new Error('Expected UTC-5 and UTC-8 to yield distinct local times and pillars');
  }
  if (!snapNy.currentHourPillar.stem || !snapLa.currentHourPillar.branch || !snapTokyo.currentHourPillar.branch) {
    throw new Error('Negative and positive timezone snapshots must contain valid pillar data');
  }
  console.log(`  ✔ Global timezone matrix verified: UTC-8 (${snapLa.currentHourPillar.branch}), UTC-5 (${snapNy.currentHourPillar.branch}), UTC+0 (${snapUtc0.currentHourPillar.branch}), UTC+7 (${snapUtc7.currentHourPillar.branch}), UTC+9 (${snapTokyo.currentHourPillar.branch}).`);

  // 9. All 12 Canonical Hour Branches Coverage
  const sampleDay = '2026-06-15T';
  const expectedBranches = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const testHours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  for (let i = 0; i < 12; i++) {
    const hh = testHours[i].toString().padStart(2, '0');
    const snapH = calculateRealtimeSnapshot(calculationResult, new Date(`${sampleDay}${hh}:30:00+07:00`), 7);
    if (snapH.currentHourPillar.branch !== expectedBranches[i]) {
      throw new Error(`Hour branch mapping failed for ${hh}:30: expected ${expectedBranches[i]}, got ${snapH.currentHourPillar.branch}`);
    }
  }
  console.log(`  ✔ Complete 12 Earthly Branches hourly cycle dynamically verified.`);

  // 10. Aspect Scores & Resonance Clamping Check (0 - 100)
  for (const slot of snapUtc7.hourlySlots) {
    if (slot.resonanceScore < 0 || slot.resonanceScore > 100) {
      throw new Error(`Resonance score out of bounds: ${slot.resonanceScore}`);
    }
    if (slot.luckPercentage < 0 || slot.luckPercentage > 100) {
      throw new Error(`Luck percentage out of bounds: ${slot.luckPercentage}`);
    }
    if (slot.riskPercentage < 0 || slot.riskPercentage > 100) {
      throw new Error(`Risk percentage out of bounds: ${slot.riskPercentage}`);
    }
    const aspects = [slot.aspects.wealth, slot.aspects.career, slot.aspects.relationship, slot.aspects.safety];
    for (const asp of aspects) {
      if (asp.score < 0 || asp.score > 100 || isNaN(asp.score)) {
        throw new Error(`Aspect score invalid: ${asp.score}`);
      }
    }
  }
  console.log(`  ✔ Aspect scores & resonance clamping (0 - 100) validated across all hourly slots.`);

  console.log('✅ All Realtime Engine Golden Tests Passed!\n');
}

if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  runRealtimeEngineTests();
}

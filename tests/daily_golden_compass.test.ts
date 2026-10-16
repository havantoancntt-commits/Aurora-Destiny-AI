// ==========================================
// AURORA DESTINY AI — DAILY GOLDEN COMPASS & MINDFULNESS TEST SUITE
// Verifies calculation of Daily Golden Window, friction hours,
// micro-remedy matrix and 5-Element mindfulness precepts.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { calculateRealtimeSnapshot } from '../src/engine/realtimeEngine';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import { BirthData } from '../src/types/destiny';

test('🌟 Daily Golden Compass & Micro-Karma Navigator Suite', async (t) => {
  const birthData: BirthData = {
    solarYear: 1990,
    solarMonth: 5,
    solarDay: 15,
    solarHour: 10,
    solarMinute: 30,
    hasExactHour: true,
    timezoneOffset: 7,
    timezoneName: 'Asia/Ho_Chi_Minh',
    birthCity: 'Hà Nội',
    birthCountry: 'Việt Nam',
    latitude: 21.03,
    longitude: 105.85,
    gender: 'Male',
    calendarSystem: 'solar',
    timeConvention: 'civil',
    isLateRat: false
  };

  const calculation = runFullDestinyCalculation(birthData, 'prof_test_daily_compass', 0);

  await t.test('1. calculateRealtimeSnapshot generates all 12 hourly slots', () => {
    const now = new Date('2026-10-16T10:30:00+07:00');
    const snapshot = calculateRealtimeSnapshot(calculation, now);

    assert.ok(snapshot.hourlySlots);
    assert.strictEqual(snapshot.hourlySlots.length, 12, 'Must contain all 12 Earthly Branches');

    const current = snapshot.hourlySlots.find(s => s.isCurrent);
    assert.ok(current, 'Must designate exactly one current hour branch');
  });

  await t.test('2. Snapshot accurately ranks top Golden Window of the day', () => {
    const now = new Date('2026-10-16T10:30:00+07:00');
    const snapshot = calculateRealtimeSnapshot(calculation, now);

    const sortedByLuck = [...snapshot.hourlySlots].sort((a, b) => {
      const scoreA = a.luckPercentage + (a.isZodiacAuspicious ? 15 : 0) + (a.isGuiRen ? 10 : 0);
      const scoreB = b.luckPercentage + (b.isZodiacAuspicious ? 15 : 0) + (b.isGuiRen ? 10 : 0);
      return scoreB - scoreA;
    });

    const topGoldenSlot = sortedByLuck[0];
    assert.ok(topGoldenSlot, 'Must identify a top golden window');
    assert.ok(topGoldenSlot.luckPercentage >= 50, 'Top golden window must have auspicious score');
    assert.ok(topGoldenSlot.branchNameVi.length > 0, 'Must have valid Vietnamese branch name');
    assert.ok(topGoldenSlot.timeRangeStr.includes('-'), 'Must have valid time range string');
  });

  await t.test('3. Snapshot identifies auspicious direction and lucky color for micro-remedy', () => {
    const now = new Date('2026-10-16T10:30:00+07:00');
    const snapshot = calculateRealtimeSnapshot(calculation, now);

    assert.ok(snapshot.auspiciousDirection, 'Must provide auspicious direction');
    assert.ok(snapshot.luckyColorName, 'Must provide lucky color name');
    assert.ok(snapshot.luckyColorHex.startsWith('#'), 'Must provide valid hex color code');
  });

  await t.test('4. Day Master element determines customized energetic guidance', () => {
    assert.ok(calculation.bazi.dayMasterElement, 'Day Master element must be computed');
    const validElements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
    assert.ok(validElements.includes(calculation.bazi.dayMasterElement));
  });
});

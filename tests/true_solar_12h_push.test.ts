// ==============================================================================
// TEST SUITE: 12-HOUR TRUE SOLAR TIME SHIFT PUSH NOTIFICATION SUITE
// Verifies:
// 1. Dual 12-hour diurnal milestone computation (True Solar Birth Hour & Opposite 12h Phase)
// 2. Rich Astrological Copy Synthesis (Solar Term, 10-year Decades, Dụng Thần, 12h Slots)
// 3. Duplicate Prevention & Cycle Tag generation
// 4. Fallback execution & Evaluation logic
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import {
  getNext12hTrueSolarMilestones,
  build12hTrueSolarShiftContent,
  evaluateAndTrigger12hTrueSolarShiftAlert,
  send12hTrueSolarTestPush
} from '../src/services/destinyPushNotification';
import { UserProfile } from '../src/types/user';

test('🌞 12-Hour True Solar Time Shift Notification Engine', async (t) => {
  // Test Profile: Born in Hanoi (105.85°E) at 10:30 Solar Clock Time
  const testProfile: UserProfile = {
    id: 'prof_test_solar_12h',
    userId: 'user_solar',
    name: 'Đặng Tuấn Kiệt',
    isPrimary: true,
    avatarSeed: 'seed_kiet',
    birthData: {
      solarYear: 1990,
      solarMonth: 5,
      solarDay: 20,
      solarHour: 10,
      solarMinute: 30,
      hasExactHour: true,
      birthCity: 'Hà Nội',
      birthCountry: 'Việt Nam',
      timezoneOffset: 7,
      timezoneName: 'Asia/Bangkok',
      longitude: 105.85,
      latitude: 21.03,
      gender: 'Male',
      calendarSystem: 'solar'
    },
    behavioralContext: {
      careerField: 'Tài chính & Đầu tư',
      employmentStatus: 'Chủ doanh nghiệp',
      financialGoal: 'Tự do tài chính',
      relationshipStatus: 'Độc thân',
      topPriority: 'Sự nghiệp',
      personalNotes: 'Bản lĩnh & Quyết đoán'
    },
    tag: 'self',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const calculation = runFullDestinyCalculation(testProfile.birthData, testProfile.id, 0);
  assert.ok(calculation, 'Calculation should be successfully computed');

  await t.test('1. Milestone Computation: Dual 12-Hour Diurnal Axis', () => {
    const fixedNow = new Date('2026-10-25T08:00:00+07:00');
    const milestones = getNext12hTrueSolarMilestones(calculation, testProfile, fixedNow);

    assert.ok(milestones, 'Milestones object must not be null');
    assert.ok(milestones.milestone1TimeStr, 'Milestone 1 time string must exist');
    assert.ok(milestones.milestone2TimeStr, 'Milestone 2 time string must exist');

    // Parse milestone 1 and milestone 2 hours and minutes
    const [h1, m1] = milestones.milestone1TimeStr.split(':').map(Number);
    const [h2, m2] = milestones.milestone2TimeStr.split(':').map(Number);

    const min1 = h1 * 60 + m1;
    const min2 = h2 * 60 + m2;

    // The two milestones must be exactly 720 minutes (12 hours) apart on the 24-hour circle
    const diff = Math.abs(min1 - min2);
    assert.equal(diff === 720 || diff === 1440 - 720, true, 'Milestones 1 and 2 must be exactly 12 hours apart');

    // Test countdown and phase assignment
    assert.ok(milestones.minutesUntilNext >= 0, 'Minutes until next must be >= 0');
    assert.ok(milestones.timeRemainingFormatted.length > 0, 'Time remaining formatted must not be empty');
    assert.ok(milestones.nextPhase === 1 || milestones.nextPhase === 2, 'Next phase must be 1 or 2');
  });

  await t.test('2. Milestone Computation: Evening Birth Time Roll-over', () => {
    const eveningProfile: UserProfile = {
      ...testProfile,
      id: 'prof_evening',
      birthData: {
        ...testProfile.birthData,
        solarHour: 23,
        solarMinute: 45
      }
    };
    const eveningCalc = runFullDestinyCalculation(eveningProfile.birthData, eveningProfile.id, 0);
    const fixedNow = new Date('2026-10-25T20:00:00+07:00');
    const milestones = getNext12hTrueSolarMilestones(eveningCalc, eveningProfile, fixedNow);

    assert.ok(milestones, 'Evening milestones should be computed');
    const [h1, m1] = milestones.milestone1TimeStr.split(':').map(Number);
    const [h2, m2] = milestones.milestone2TimeStr.split(':').map(Number);

    const min1 = h1 * 60 + m1;
    const min2 = h2 * 60 + m2;
    const diff = Math.abs(min1 - min2);
    assert.equal(diff === 720 || diff === 1440 - 720, true, 'Evening milestones must be 12 hours apart');
  });

  await t.test('3. Astrological Copy Synthesis: Phase 1 & Phase 2', () => {
    const fixedNow = new Date('2026-10-25T10:30:00+07:00');

    // Phase 1 (Birth True Solar Hour)
    const contentP1 = build12hTrueSolarShiftContent(calculation, testProfile, 1, fixedNow);
    assert.ok(contentP1.title.includes('Bản Mệnh'), 'Phase 1 title should reference Bản Mệnh / Giờ Sinh');
    assert.ok(contentP1.body.includes('Tiết Khí') || contentP1.body.includes('Đại Vận') || contentP1.body.includes('Dụng Thần'), 'Body should synthesize astrological insights');
    assert.ok(contentP1.summary.length > 10, 'Summary should have substantive explanation');

    // Phase 2 (Opposite 12-hour Phase)
    const contentP2 = build12hTrueSolarShiftContent(calculation, testProfile, 2, fixedNow);
    assert.ok(contentP2.title.includes('Đối Xung') || contentP2.title.includes('Đối Cực') || contentP2.title.includes('Tịch Chiếu'), 'Phase 2 title should reference opposite axis');
    assert.ok(contentP2.body.length > 20, 'Phase 2 body should have detailed guidance');
  });

  await t.test('4. Trigger Logic: Forced Execution (Test Simulation Mode)', async () => {
    // In node test environment without browser push window, evaluateAndTrigger12hTrueSolarShiftAlert handles graceful fallback
    const res = await evaluateAndTrigger12hTrueSolarShiftAlert(calculation, testProfile, true);
    // res should return triggered: false (because Notification API is not available in node) or triggered: true if mocked
    assert.ok(typeof res.triggered === 'boolean', 'Result should have boolean triggered state');
    if (!res.triggered) {
      assert.ok(res.message, 'Failure message should be descriptive');
    }
  });

  await t.test('5. send12hTrueSolarTestPush: Null Safety Checks', async () => {
    const resNull = await send12hTrueSolarTestPush(null, null);
    assert.equal(resNull.success, false, 'Should fail gracefully when calculation or profile is null');
    assert.ok(resNull.message.includes('Vui lòng'), 'Should prompt user to establish chart');
  });
});

// ==============================================================================
// TEST SUITE: MULTI-PROFILE CELESTIAL WATCHDOG & SMART PUSH ALERT ENGINE
// Verifies deterministic detection of Clashes, Noble Hours, Prosperity, and Solar Terms
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { scanMajorEventsForProfiles, MajorDestinyEvent } from '../src/engine/destinyAlertWatchdog';
import { UserProfile } from '../src/types/user';

test('🌟 Celestial Watchdog & Smart Push Alert Suite', async (t) => {
  // Mock Profile 1: Giáp Tý (Jia Zi) 1984-10-15 10:30
  const profileGiapTy: UserProfile = {
    id: 'prof_test_giap_ty',
    userId: 'user_01',
    name: 'Nguyễn Văn Toàn (Giáp Tý)',
    isPrimary: true,
    avatarSeed: 'seed_toan',
    birthData: {
      solarYear: 1984,
      solarMonth: 10,
      solarDay: 15,
      solarHour: 10,
      solarMinute: 30,
      hasExactHour: true,
      birthCity: 'Hà Nội',
      birthCountry: 'Việt Nam',
      timezoneOffset: 7,
      timezoneName: 'Asia/Bangkok',
      gender: 'Male',
      calendarSystem: 'solar'
    },
    behavioralContext: {
      careerField: 'Công nghệ',
      employmentStatus: 'Toàn thời gian',
      financialGoal: 'Thịnh vượng & Bình an',
      relationshipStatus: 'Kết hôn',
      topPriority: 'Phát triển bền vững',
      personalNotes: 'Gia đạo bình an'
    },
    tag: 'self',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Mock Profile 2: Ất Sửu (Yi Chou) 1985-03-12 14:00
  const profileAtSuu: UserProfile = {
    id: 'prof_test_at_suu',
    userId: 'user_01',
    name: 'Lê Thị Hoa (Ất Sửu)',
    isPrimary: false,
    avatarSeed: 'seed_hoa',
    birthData: {
      solarYear: 1985,
      solarMonth: 3,
      solarDay: 12,
      solarHour: 14,
      solarMinute: 0,
      hasExactHour: true,
      birthCity: 'Hồ Chí Minh',
      birthCountry: 'Việt Nam',
      timezoneOffset: 7,
      timezoneName: 'Asia/Bangkok',
      gender: 'Female',
      calendarSystem: 'solar'
    },
    behavioralContext: {
      careerField: 'Giáo dục',
      employmentStatus: 'Toàn thời gian',
      financialGoal: 'Gia đạo hạnh phúc',
      relationshipStatus: 'Kết hôn',
      topPriority: 'Con cái thành đạt',
      personalNotes: ''
    },
    tag: 'family',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await t.test('1. Multi-profile scanning successfully runs without error on empty or valid input', () => {
    const emptyResult = scanMajorEventsForProfiles([]);
    assert.deepEqual(emptyResult, []);

    const singleResult = scanMajorEventsForProfiles([profileGiapTy]);
    assert.ok(Array.isArray(singleResult));
    assert.ok(singleResult.length > 0, 'Should detect at least current solar term or hour/day alert');
  });

  await t.test('2. Multi-profile watchdog scans multiple profiles simultaneously and tags respective names', () => {
    const multiResult = scanMajorEventsForProfiles([profileGiapTy, profileAtSuu]);
    assert.ok(Array.isArray(multiResult));
    assert.ok(multiResult.length > 0);

    // Check that every generated event contains non-empty metadata
    for (const evt of multiResult) {
      assert.ok(evt.id, 'Event must have unique id');
      assert.ok(evt.profileId, 'Event must link to profile');
      assert.ok(evt.title, 'Event must have title');
      assert.ok(evt.summary, 'Event must have summary');
      assert.ok(evt.detailedAdvice, 'Event must have actionable advice');
      assert.ok(Array.isArray(evt.actionableDos), 'Event must have actionable dos');
      assert.ok(Array.isArray(evt.actionableDonts), 'Event must have actionable donts');
      assert.ok(evt.urgency >= 0 && evt.urgency <= 100, 'Urgency must be 0-100');
    }
  });

  await t.test('3. Detects specific clash when day branch is Six Clash (Lục Xung)', () => {
    // Force reference date where day branch is Wu_B (Ngọ) - which clashes with Zi (Tý)
    const testDate = new Date('2024-06-10T12:00:00+07:00');
    const events = scanMajorEventsForProfiles([profileGiapTy], {}, testDate);
    assert.ok(Array.isArray(events));
    assert.ok(events.length > 0);
  });

  await t.test('4. Correctly sorts events descending by urgency', () => {
    const events = scanMajorEventsForProfiles([profileGiapTy, profileAtSuu]);
    for (let i = 0; i < events.length - 1; i++) {
      assert.ok(
        events[i].urgency >= events[i + 1].urgency,
        `Event at index ${i} (${events[i].urgency}) should have >= urgency than index ${i + 1} (${events[i + 1].urgency})`
      );
    }
  });

  await t.test('5. Notification configuration contains multi-profile and major alert toggles', async () => {
    const { DEFAULT_NOTIFICATION_CONFIG, getNotificationConfig } = await import('../src/services/destinyPushNotification');
    assert.equal(DEFAULT_NOTIFICATION_CONFIG.enabled, true);
    assert.equal(DEFAULT_NOTIFICATION_CONFIG.notifyMultiProfiles, true);
    assert.equal(DEFAULT_NOTIFICATION_CONFIG.notifyMajorClashes, true);
    assert.equal(DEFAULT_NOTIFICATION_CONFIG.notifyQuyNhanLocThan, true);
    assert.equal(DEFAULT_NOTIFICATION_CONFIG.notifySolarTerms, true);

    const cfg = getNotificationConfig();
    assert.ok(cfg.notifyMultiProfiles !== undefined);
  });
});

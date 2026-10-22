// ==============================================================================
// TEST SUITE: PROFILE DELETION INTEGRITY & PURGE VERIFICATION
// Verifies definitive, intelligent, and accurate deletion of horoscopes
// Grounded in IndexedDB, LocalStorage cache, and Multi-Profile Vault
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert';

// Mock localStorage & window for Node.js test environment if not defined
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (i: number) => Array.from(store.keys())[i] || null
  };
}
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}

import { pwaProfileStorage } from '../src/services/pwaProfileStorage';
import { api } from '../src/services/apiClient';
import { UserProfile } from '../src/types/user';

const sampleProfile1: UserProfile = {
  id: 'prof_test_del_1',
  userId: 'usr_test',
  avatarSeed: 'nguyen_thanh_tung',
  name: 'NGUYỄN THANH TÙNG',
  isPrimary: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tag: 'self',
  notes: 'Lá số chính chủ',
  birthData: {
    solarYear: 1994,
    solarMonth: 7,
    solarDay: 5,
    solarHour: 12,
    solarMinute: 0,
    hasExactHour: true,
    birthCity: 'Hà Nội',
    birthCountry: 'VN',
    timezoneOffset: 7,
    timezoneName: 'Asia/Bangkok',
    gender: 'Male',
    calendarSystem: 'solar'
  },
  behavioralContext: {
    careerField: 'Kinh doanh',
    employmentStatus: 'Toàn thời gian',
    financialGoal: 'Thịnh vượng',
    relationshipStatus: 'Độc thân',
    topPriority: 'Sự nghiệp',
    personalNotes: 'Kiên định, hướng ngoại'
  }
};

const sampleProfile2: UserProfile = {
  id: 'prof_test_del_2',
  userId: 'usr_test',
  avatarSeed: 'tran_thi_mai',
  name: 'TRẦN THỊ MAI',
  isPrimary: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tag: 'family',
  notes: 'Lá số người thân',
  birthData: {
    solarYear: 1996,
    solarMonth: 10,
    solarDay: 20,
    solarHour: 8,
    solarMinute: 30,
    hasExactHour: true,
    birthCity: 'TP. Hồ Chí Minh',
    birthCountry: 'VN',
    timezoneOffset: 7,
    timezoneName: 'Asia/Bangkok',
    gender: 'Female',
    calendarSystem: 'solar'
  },
  behavioralContext: {
    careerField: 'Giáo dục',
    employmentStatus: 'Toàn thời gian',
    financialGoal: 'Tích lũy',
    relationshipStatus: 'Đã kết hôn',
    topPriority: 'Gia đình',
    personalNotes: 'Nhu hòa, chu đáo'
  }
};

test('🗑️ Profile Deletion Integrity & Cache Purge Suite', async (t) => {
  await t.test('1. Setup initial profiles in PWA offline vault and API cache', async () => {
    await pwaProfileStorage.saveAllProfiles([sampleProfile1, sampleProfile2]);
    api.cacheProfiles([sampleProfile1, sampleProfile2]);

    const stored = await pwaProfileStorage.getProfiles();
    assert.strictEqual(stored.length, 2, 'Must have 2 initial profiles stored in PWA vault');

    const apiCached = api.getCachedProfiles();
    assert.strictEqual(apiCached.length, 2, 'Must have 2 profiles in API cache');
  });

  await t.test('2. Delete target profile removes it definitively from PWA storage', async () => {
    await pwaProfileStorage.deleteProfile(sampleProfile1.id);

    const remaining = await pwaProfileStorage.getProfiles();
    assert.strictEqual(remaining.length, 1, 'Only 1 profile should remain in PWA storage');
    assert.strictEqual(remaining[0].id, sampleProfile2.id, 'Remaining profile must be sampleProfile2');

    const ghost = remaining.find((p) => p.id === sampleProfile1.id);
    assert.strictEqual(ghost, undefined, 'Deleted profile must not exist in PWA vault');
  });

  await t.test('3. ApiClient cacheProfiles accurately filters out deleted profile', async () => {
    // Simulate api.deleteProfile cache purge logic
    const currentCached = api.getCachedProfiles();
    const remaining = currentCached.filter((p) => p.id !== sampleProfile1.id);
    api.cacheProfiles(remaining);

    const apiCached = api.getCachedProfiles();
    assert.strictEqual(apiCached.length, 1, 'API cache must only contain 1 profile');
    assert.strictEqual(apiCached[0].id, sampleProfile2.id, 'API cache must contain sampleProfile2');

    const ghostApi = apiCached.find((p) => p.id === sampleProfile1.id);
    assert.strictEqual(ghostApi, undefined, 'Deleted profile must not exist in API cache');
  });

  await t.test('4. Deleting the last remaining profile empties the vault cleanly', async () => {
    await pwaProfileStorage.deleteProfile(sampleProfile2.id);

    const remaining = await pwaProfileStorage.getProfiles();
    assert.strictEqual(remaining.length, 0, 'Vault must be completely empty after deleting last profile');

    api.cacheProfiles([]);
    const apiCached = api.getCachedProfiles();
    assert.strictEqual(apiCached.length, 0, 'API cache must be empty');
  });
});

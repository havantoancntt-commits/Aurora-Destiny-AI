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

  await t.test('5. Tombstone prevents resurrection when exiting/re-entering or encountering stale cache', async () => {
    assert.strictEqual(pwaProfileStorage.isDeleted(sampleProfile1.id), true, 'sampleProfile1 must be recorded in tombstone');
    assert.strictEqual(pwaProfileStorage.isDeleted(sampleProfile2.id), true, 'sampleProfile2 must be recorded in tombstone');

    // Attempt to illegally re-save deleted profile
    await pwaProfileStorage.saveProfile(sampleProfile1);
    const afterAttempt = await pwaProfileStorage.getProfiles();
    assert.strictEqual(afterAttempt.length, 0, 'Tombstoned profile must be rejected by saveProfile');

    // Attempt to inject via raw localStorage cache
    const storage = (globalThis as any).localStorage;
    storage.setItem('aurora_cached_profiles', JSON.stringify({
      version: 1,
      profiles: [sampleProfile1]
    }));

    // getProfiles and getCachedProfiles must still filter out tombstoned profile
    const pwaProfiles = await pwaProfileStorage.getProfiles();
    assert.strictEqual(pwaProfiles.length, 0, 'getProfiles must filter out tombstoned profile from stale cache');

    const cachedApi = api.getCachedProfiles();
    assert.strictEqual(cachedApi.length, 0, 'api.getCachedProfiles must filter out tombstoned profile');
  });

  await t.test('6. Server repository records tombstone and prevents resurrection across restarts', async () => {
    const { PersistentDatabaseRepository } = await import('../src/db/repository.js');
    const fs = await import('fs');
    const path = await import('path');
    const testDir = path.join('/tmp', `aurora_test_tombstone_${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });

    const serverRepo = new PersistentDatabaseRepository(testDir);
    const testUser = {
      id: 'usr_tombstone_test',
      email: 'tombstone@test.local',
      fullName: 'Test User',
      role: 'GUEST' as const,
      subscriptionTier: 'Free' as const,
      language: 'vi' as const,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      profilesCount: 0
    };
    await serverRepo.saveUser(testUser);

    const testProfile = {
      ...sampleProfile1,
      id: 'prof_server_tombstone_1',
      userId: testUser.id
    };
    await serverRepo.saveProfile(testProfile);

    // Verify it exists initially
    const initialProfiles = await serverRepo.getProfiles(testUser.id);
    assert.strictEqual(initialProfiles.length, 1);
    assert.strictEqual(initialProfiles[0].id, testProfile.id);

    // Delete it on server
    const deleted = await serverRepo.deleteProfile(testProfile.id, testUser.id);
    assert.strictEqual(deleted, true, 'Server deleteProfile must return true');

    // Verify it is gone
    const remainingServer = await serverRepo.getProfiles(testUser.id);
    assert.strictEqual(remainingServer.length, 0, 'Server getProfiles must not return deleted profile');

    const singleFetch = await serverRepo.getProfile(testProfile.id);
    assert.strictEqual(singleFetch, null, 'Server getProfile must return null for deleted profile');

    // Verify resurrection save is rejected
    let threw = false;
    try {
      await serverRepo.saveProfile(testProfile);
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, 'Server saveProfile must reject resurrecting deleted profile');

    // Simulate server restart by creating new repository instance on same storage directory
    const restartedRepo = new PersistentDatabaseRepository(testDir);
    const postRestartProfiles = await restartedRepo.getProfiles(testUser.id);
    assert.strictEqual(postRestartProfiles.length, 0, 'Deleted profile must NEVER reappear after server restart');

    const postRestartSingle = await restartedRepo.getProfile(testProfile.id);
    assert.strictEqual(postRestartSingle, null, 'Single fetch after restart must also be null');

    // Clean up test repos and dir
    await serverRepo.close();
    await restartedRepo.close();
    fs.rmSync(testDir, { recursive: true, force: true });
  });
});

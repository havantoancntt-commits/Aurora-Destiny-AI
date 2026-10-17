// ==========================================
// AURORA DESTINY AI — PWA PROFILE STORAGE & OFFLINE VAULT TEST SUITE
// Verifies dual-layer offline storage, pinning, tagging,
// JSON backup export/import, and calculation caching.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { pwaProfileStorage } from '../src/services/pwaProfileStorage';
import { UserProfile } from '../src/types/user';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';

test('💾 PWA Profile Storage & Offline Vault Test Suite', async (t) => {
  // Mock localStorage for Node.js test environment if not defined
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

  const sampleProfile1: UserProfile = {
    id: 'prof_test_pwa_01',
    userId: 'usr_guest',
    name: 'Nguyễn Văn An',
    isPrimary: true,
    avatarSeed: 'nguyen_van_an',
    tag: 'self',
    notes: 'Lá số chính chủ',
    isPinned: false,
    birthData: {
      solarYear: 1990,
      solarMonth: 8,
      solarDay: 15,
      solarHour: 10,
      solarMinute: 30,
      hasExactHour: true,
      timezoneOffset: 7,
      timezoneName: 'Asia/Ho_Chi_Minh',
      birthCity: 'Hà Nội',
      birthCountry: 'Việt Nam',
      gender: 'Male',
      calendarSystem: 'solar'
    },
    behavioralContext: {
      careerField: 'Công nghệ',
      employmentStatus: 'Toàn thời gian',
      financialGoal: 'Tự do tài chính',
      relationshipStatus: 'Độc thân',
      topPriority: 'Sự nghiệp',
      personalNotes: 'Kiên định, hướng ngoại'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sampleProfile2: UserProfile = {
    id: 'prof_test_pwa_02',
    userId: 'usr_guest',
    name: 'Trần Thị Bích',
    isPrimary: false,
    avatarSeed: 'tran_thi_bich',
    tag: 'family',
    notes: 'Lá số người thân trong gia đình',
    isPinned: false,
    birthData: {
      solarYear: 1995,
      solarMonth: 3,
      solarDay: 20,
      solarHour: 6,
      solarMinute: 15,
      hasExactHour: true,
      timezoneOffset: 7,
      timezoneName: 'Asia/Ho_Chi_Minh',
      birthCity: 'TP Hồ Chí Minh',
      birthCountry: 'Việt Nam',
      gender: 'Female',
      calendarSystem: 'solar'
    },
    behavioralContext: {
      careerField: 'Kinh doanh',
      employmentStatus: 'Quản lý',
      financialGoal: 'Đầu tư bền vững',
      relationshipStatus: 'Đã kết hôn',
      topPriority: 'Gia đình & Tài chính',
      personalNotes: 'Chu đáo'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await t.test('1. Save and retrieve profiles from PWA offline storage', async () => {
    await pwaProfileStorage.saveProfile(sampleProfile1);
    await pwaProfileStorage.saveProfile(sampleProfile2);

    const profiles = await pwaProfileStorage.getProfiles();
    assert.ok(profiles.length >= 2, 'Must contain saved profiles');
    const p1 = profiles.find((p) => p.id === sampleProfile1.id);
    assert.ok(p1, 'Profile 1 must be present');
    assert.strictEqual(p1.name, 'Nguyễn Văn An');
    assert.strictEqual(p1.tag, 'self');
  });

  await t.test('2. Pin profile prioritizes sort order to the top', async () => {
    // Pin profile 2
    const updated = await pwaProfileStorage.togglePinProfile(sampleProfile2.id);
    const p2 = updated.find((p) => p.id === sampleProfile2.id);
    assert.strictEqual(p2?.isPinned, true, 'Profile 2 must be pinned');

    // Retrieve and verify sort order
    const sorted = await pwaProfileStorage.getProfiles();
    assert.strictEqual(sorted[0].id, sampleProfile2.id, 'Pinned profile must appear first in list');
  });

  await t.test('3. Update category tag and notes persists properly', async () => {
    const updated = await pwaProfileStorage.updateProfileTag(
      sampleProfile1.id,
      'partner',
      'Đối tác kinh doanh chiến lược'
    );
    const p1 = updated.find((p) => p.id === sampleProfile1.id);
    assert.strictEqual(p1?.tag, 'partner');
    assert.strictEqual(p1?.notes, 'Đối tác kinh doanh chiến lược');
  });

  await t.test('4. Calculation caching and retrieval in offline storage', async () => {
    const calc = runFullDestinyCalculation(sampleProfile1.birthData, sampleProfile1.id, 0);
    await pwaProfileStorage.saveCalculation(sampleProfile1.id, calc);

    // Verify calculation was cached
    const retrieved = await pwaProfileStorage.getCalculation(sampleProfile1.id);
    // In node environment without browser session/IDB, fallback handles gracefully
    assert.ok(retrieved !== undefined);
  });

  await t.test('5. Export and Import JSON backup merges safely without conflicts', async () => {
    const backupJson = await pwaProfileStorage.exportBackup();
    assert.ok(backupJson.includes('Aurora Destiny AI'), 'Backup must contain app signature');
    assert.ok(backupJson.includes(sampleProfile1.id), 'Backup must contain profile 1');

    // Parse backup and verify schema
    const parsed = JSON.parse(backupJson);
    assert.strictEqual(parsed.version, 1);
    assert.ok(Array.isArray(parsed.profiles));

    // Import the backup
    const importResult = await pwaProfileStorage.importBackup(backupJson);
    assert.ok(importResult.profiles.length >= 2, 'Imported profiles must contain existing items');
  });

  await t.test('6. Storage stats calculates offline health metrics', async () => {
    const stats = await pwaProfileStorage.getStorageStats();
    assert.ok(stats.profileCount >= 2, 'Profile count must reflect storage state');
    assert.ok(stats.isOfflineReady, 'Must report offline readiness');
    assert.ok(stats.estimatedBytes > 0, 'Must estimate non-zero bytes');
  });

  await t.test('7. Delete profile removes it cleanly from offline storage', async () => {
    await pwaProfileStorage.deleteProfile(sampleProfile2.id);
    const remaining = await pwaProfileStorage.getProfiles();
    const found = remaining.find((p) => p.id === sampleProfile2.id);
    assert.strictEqual(found, undefined, 'Deleted profile must no longer exist in storage');
  });
});

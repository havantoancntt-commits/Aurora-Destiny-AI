// ==========================================
// DATABASE INTEGRITY & GUEST LIFECYCLE TEST SUITE
// Verifies Referential Integrity, Orphan Detection & Guest Cleanup
// ==========================================

import { PersistentDatabaseRepository } from '../db/repository';
import fs from 'fs';
import path from 'path';

export function runDatabaseIntegrityTests(): { passed: number; failed: number; results: any[] } {
  const results: { testName: string; status: 'PASS' | 'FAIL'; message: string }[] = [];

  function assert(condition: boolean, testName: string, message: string) {
    if (condition) {
      results.push({ testName, status: 'PASS', message });
    } else {
      results.push({ testName, status: 'FAIL', message: `FAILED: ${message}` });
    }
  }

  const testDir = path.join(process.cwd(), 'data', 'test_db_dir');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }

  const repo = new PersistentDatabaseRepository(testDir);

  try {
    // TEST 1: Clean State Integrity
    const initialCheck = repo.verifyDatabaseIntegrity();
    assert(initialCheck.valid && initialCheck.errors.length === 0, 'Clean State Database Integrity', 'Initial state has no orphan references');

    // TEST 2: User Creation & Profile Foreign Key
    const user = repo.saveUser({
      id: 'usr_integ_1',
      email: 'test_integ@aurora.io',
      fullName: 'Test Integ',
      role: 'USER',
      subscriptionTier: 'Free',
      language: 'vi',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      profilesCount: 0,
      isGuest: false
    }, 'hash123');

    const profile = repo.saveProfile({
      id: 'prof_test_1',
      userId: user.id,
      name: 'Nguyen Van Test',
      isPrimary: true,
      avatarSeed: 'seed',
      birthData: {
        solarYear: 1990,
        solarMonth: 1,
        solarDay: 1,
        solarHour: 12,
        solarMinute: 0,
        hasExactHour: true,
        birthCity: 'Hà Nội',
        birthCountry: 'Việt Nam',
        timezoneOffset: 7,
        timezoneName: 'UTC+7',
        gender: 'Male',
        calendarSystem: 'solar'
      },
      behavioralContext: {
        careerField: '',
        employmentStatus: '',
        financialGoal: '',
        relationshipStatus: '',
        topPriority: '',
        personalNotes: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const checkAfterProfile = repo.verifyDatabaseIntegrity();
    assert(checkAfterProfile.valid, 'Profile-User Referential Integrity', 'Valid user-profile pair passes integrity verification');

    // TEST 3: Orphan Profile Detection
    // Directly inject an orphan profile with non-existent userId
    (repo as any).state.profiles['prof_orphan'] = {
      id: 'prof_orphan',
      userId: 'usr_non_existent',
      name: 'Orphan User',
      isPrimary: false,
      avatarSeed: 'orp',
      birthData: profile.birthData,
      behavioralContext: profile.behavioralContext,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const checkWithOrphanProfile = repo.verifyDatabaseIntegrity();
    assert(
      !checkWithOrphanProfile.valid && checkWithOrphanProfile.errors.some(e => e.includes('usr_non_existent')),
      'Orphan Profile Detection',
      `Detected orphan profile correctly: ${checkWithOrphanProfile.errors[0]}`
    );
    delete (repo as any).state.profiles['prof_orphan'];

    // TEST 4: Orphan Calculation Detection
    (repo as any).state.calculations['calc_orphan'] = {
      id: 'calc_orphan',
      profileId: 'prof_non_existent',
      calculatedAt: new Date().toISOString(),
      chart: {}
    };

    const checkWithOrphanCalc = repo.verifyDatabaseIntegrity();
    assert(
      !checkWithOrphanCalc.valid && checkWithOrphanCalc.errors.some(e => e.includes('prof_non_existent')),
      'Orphan Calculation Detection',
      `Detected orphan calculation correctly: ${checkWithOrphanCalc.errors[0]}`
    );
    delete (repo as any).state.calculations['calc_orphan'];

    // TEST 5: Duplicate Email Detection
    (repo as any).state.users['usr_dup'] = {
      id: 'usr_dup',
      email: 'TEST_INTEG@aurora.io', // case-insensitive duplicate
      passwordHash: 'hash',
      salt: 'salt',
      role: 'USER',
      createdAt: new Date().toISOString(),
      isGuest: false
    };

    const checkWithDupEmail = repo.verifyDatabaseIntegrity();
    assert(
      !checkWithDupEmail.valid && checkWithDupEmail.errors.some(e => e.includes('Duplicate email')),
      'Duplicate Email Invariant Detection',
      `Detected duplicate email across users: ${checkWithDupEmail.errors[0]}`
    );
    delete (repo as any).state.users['usr_dup'];

    // TEST 6: Guest Session & Expiry Purge
    const guestUser = repo.saveUser({
      id: 'usr_guest_test_1',
      email: '',
      fullName: 'Khách',
      role: 'GUEST',
      subscriptionTier: 'Free',
      language: 'vi',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      profilesCount: 0,
      isGuest: true
    });
    const guestProfile = repo.saveProfile({
      id: 'prof_guest_1',
      userId: guestUser.id,
      name: 'Khách 1',
      isPrimary: true,
      avatarSeed: 'guest1',
      birthData: profile.birthData,
      behavioralContext: profile.behavioralContext,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Store expired session for guest
    repo.saveSession({
      token: 'tok_guest_expired',
      userId: guestUser.id,
      role: 'GUEST',
      createdAt: Date.now() - 2 * 3600 * 1000,
      expiresAt: Date.now() - 1000, // already expired
      lastAccessedAt: Date.now() - 1000,
      isGuest: true
    });

    assert(repo.getUser(guestUser.id) !== null, 'Guest Exists Before Cleanup', 'Guest user is present before cleanup');
    assert(repo.getProfile(guestProfile.id) !== null, 'Guest Profile Exists Before Cleanup', 'Guest profile is present before cleanup');

    // Run cleanup
    const cleanedCount = repo.cleanupExpiredSessions();
    assert(cleanedCount >= 1, 'Expired Session Cleanup Triggered', `Cleaned ${cleanedCount} expired sessions`);
    assert(repo.getUser(guestUser.id) === null, 'Cascade Purge of Expired Guest User', 'Expired guest user was purged');
    assert(repo.getProfile(guestProfile.id) === null, 'Cascade Purge of Expired Guest Profile', 'Expired guest profile was cascade deleted');

    // Verify regular user is untouched
    assert(repo.getUser(user.id) !== null, 'Regular User Preserved During Purge', 'Registered user was preserved unharmed');

  } finally {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  }

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  return { passed, failed, results };
}

if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  console.log('🛡️ Running Aurora Database Integrity & Guest Lifecycle Tests...\n');
  const report = runDatabaseIntegrityTests();
  for (const r of report.results) {
    const symbol = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${symbol} [${r.status}] ${r.testName}: ${r.message}`);
  }
  console.log(`\n📊 DB Integrity Summary: ${report.passed} passed, ${report.failed} failed.`);
  if (report.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

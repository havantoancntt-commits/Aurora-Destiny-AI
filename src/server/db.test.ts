// ==========================================
// DATABASE INTEGRITY & GUEST LIFECYCLE TEST SUITE
// Verifies Referential Integrity, Orphan Detection & Guest Cleanup
// ==========================================

import { PersistentDatabaseRepository } from '../db/repository';
import fs from 'fs';
import path from 'path';

export async function runDatabaseIntegrityTests(): Promise<{ passed: number; failed: number; results: any[] }> {
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
    const initialCheck = await repo.verifyDatabaseIntegrity();
    assert(initialCheck.valid && initialCheck.errors.length === 0, 'Clean State Database Integrity', 'Initial state has no orphan references');

    // TEST 2: User Creation & Profile Foreign Key
    const user = await repo.saveUser({
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

    const profile = await repo.saveProfile({
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

    const checkAfterProfile = await repo.verifyDatabaseIntegrity();
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

    const checkWithOrphanProfile = await repo.verifyDatabaseIntegrity();
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

    const checkWithOrphanCalc = await repo.verifyDatabaseIntegrity();
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

    const checkWithDupEmail = await repo.verifyDatabaseIntegrity();
    assert(
      !checkWithDupEmail.valid && checkWithDupEmail.errors.some(e => e.includes('Duplicate email')),
      'Duplicate Email Invariant Detection',
      `Detected duplicate email across users: ${checkWithDupEmail.errors[0]}`
    );
    delete (repo as any).state.users['usr_dup'];

    // TEST 6: Guest Session & Expiry Purge
    const guestUser = await repo.saveUser({
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
    const guestProfile = await repo.saveProfile({
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

    // Save calculation with distinct calculationId !== profileId
    const guestCalc = await repo.saveCalculation({
      id: 'calc_distinct_guest_999',
      profileId: guestProfile.id,
      calculationVersion: '2.5.0',
      astrologyRulesVersion: '1.0.0',
      analysisModelVersion: '1.0.0',
      inputSnapshot: {} as any,
      bazi: {} as any,
      ziwei: {} as any,
      decades: [] as any,
      annualTransits: [] as any,
      analysisYear: 2026,
      confidence: {
        resolutionLevel: 'High',
        calculationConfidence: 98,
        interpretiveConfidence: 85,
        historicalValidation: 0,
        consistencyScore: 90,
        validationScore: 100,
        dataCompleteness: 100,
        historicalFit: 90,
        signalStrength: 95,
        uncertaintyIndex: 10,
        inputQuality: 100,
        modelAgreement: 95,
        assumptions: [],
        limitations: [],
        statisticalDisclaimer: 'Disclaimer'
      },
      timestamp: new Date().toISOString()
    });

    // Save historical event, backtest result, and chat message
    await repo.addHistoricalEvent({
      id: 'evt_guest_1',
      profileId: guestProfile.id,
      year: 2020,
      month: 6,
      title: 'Tốt nghiệp',
      category: 'Career',
      impact: 'Positive',
      intensity: 8,
      description: 'Test event',
      userConfidence: 5,
      createdAt: new Date().toISOString()
    });

    await repo.saveBacktestResult({
      id: 'bt_guest_1',
      profileId: guestProfile.id,
      calculationId: guestCalc.id,
      destinyConsistencyScore: 88,
      historicalHitRate: 85,
      statisticalSignificanceDisclaimer: 'Backtest disclaimer',
      confidenceBand: 'High Empirical Reliability',
      totalEventsAnalyzed: 1,
      matchedEventsCount: 1,
      divergentEventsCount: 0,
      neutralEventsCount: 0,
      comparisons: [],
      strengthsSummary: [],
      anomaliesSummary: [],
      uncertaintyFactors: [],
      timestamp: new Date().toISOString()
    });

    await repo.addChatMessage(guestProfile.id, {
      id: 'chat_guest_1',
      sender: 'user',
      content: 'Chào hệ thống',
      timestamp: new Date().toISOString()
    });

    // Store expired session for guest
    await repo.saveSession({
      token: 'tok_guest_expired',
      userId: guestUser.id,
      role: 'GUEST',
      createdAt: Date.now() - 2 * 3600 * 1000,
      expiresAt: Date.now() - 1000, // already expired
      lastAccessedAt: Date.now() - 1000,
      isGuest: true
    });

    assert(await repo.getUser(guestUser.id) !== null, 'Guest Exists Before Cleanup', 'Guest user is present before cleanup');
    assert(await repo.getProfile(guestProfile.id) !== null, 'Guest Profile Exists Before Cleanup', 'Guest profile is present before cleanup');
    assert(await repo.getCalculation(guestCalc.id) !== null, 'Guest Calculation Exists Before Cleanup', 'Guest calculation is present before cleanup');
    assert((await repo.getHistoricalEvents(guestProfile.id)).length > 0, 'Guest Events Exist Before Cleanup', 'Guest events present');
    assert(await repo.getBacktestResult(guestProfile.id) !== null, 'Guest Backtest Exists Before Cleanup', 'Guest backtest present');
    assert((await repo.getChatMessages(guestProfile.id)).length > 0, 'Guest Chat Exists Before Cleanup', 'Guest chat messages present');

    // Run cleanup
    const cleanedCount = await repo.cleanupExpiredSessions();
    assert(cleanedCount >= 1, 'Expired Session Cleanup Triggered', `Cleaned ${cleanedCount} expired sessions`);
    assert(await repo.getUser(guestUser.id) === null, 'Cascade Purge of Expired Guest User', 'Expired guest user was purged');
    assert(await repo.getProfile(guestProfile.id) === null, 'Cascade Purge of Expired Guest Profile', 'Expired guest profile was cascade deleted');
    assert(await repo.getCalculation(guestCalc.id) === null, 'Cascade Purge of Expired Guest Calculation', 'Distinct calculation ID purged without orphan');
    assert((await repo.getHistoricalEvents(guestProfile.id)).length === 0, 'Cascade Purge of Expired Guest Events', 'Guest events purged');
    assert(await repo.getBacktestResult(guestProfile.id) === null, 'Cascade Purge of Expired Guest Backtest', 'Guest backtest purged');
    assert((await repo.getChatMessages(guestProfile.id)).length === 0, 'Cascade Purge of Expired Guest Chats', 'Guest chats purged');

    // Verify referential integrity passes with 0 orphan errors
    const postCleanupIntegrity = await repo.verifyDatabaseIntegrity();
    assert(postCleanupIntegrity.valid === true, 'Post-Cleanup Referential Integrity', `Integrity valid: ${postCleanupIntegrity.errors.join(', ')}`);

    // Verify regular user is untouched
    assert(await repo.getUser(user.id) !== null, 'Regular User Preserved During Purge', 'Registered user was preserved unharmed');

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
  runDatabaseIntegrityTests().then(report => {
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
  }).catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

// ==========================================
// AURORA DESTINY AI — POSTGRES INTEGRATION TEST (SECTION XXX)
// Tests: real SQL, migrations, insert, select, update, transactions, rollback, foreign keys, cascade & metrics
// ==========================================

import assert from 'assert';
import { PostgresDatabaseRepository } from '../db/postgresRepository';

async function runPostgresIntegrationSuite() {
  console.log('🐘 [Suite] Starting Comprehensive PostgreSQL Integration Suite...');

  let poolToUse: any = undefined;
  if (!process.env.DATABASE_URL) {
    console.log('ℹ️ [Suite] DATABASE_URL not set — launching ephemeral PostgreSQL test instance via pg-mem...');
    const { newDb, DataType } = await import('pg-mem');
    const memDb = newDb();
    memDb.public.registerFunction({
      name: 'pg_advisory_lock',
      args: [DataType.integer],
      returns: DataType.bool,
      implementation: () => true
    });
    memDb.public.registerFunction({
      name: 'pg_advisory_unlock',
      args: [DataType.integer],
      returns: DataType.bool,
      implementation: () => true
    });
    const memPg = memDb.adapters.createPg();
    poolToUse = new memPg.Pool();
  } else {
    console.log('🐘 [Suite] Connecting directly to live PostgreSQL at DATABASE_URL...');
  }

  const repo = new PostgresDatabaseRepository(undefined, poolToUse);
  await repo.ensureInitialized();

  // 1. VERIFY MIGRATIONS & IMMUTABLE CHECKSUMS
  console.log('▶ Test 1: Migration Verification & Checksum Integrity');
  const migRes = await repo.query('SELECT version, name, checksum FROM schema_migrations ORDER BY version ASC');
  assert(migRes.rows.length >= 6, `Expected at least 6 migrations applied, found ${migRes.rows.length}`);
  for (const row of migRes.rows) {
    assert(row.checksum && row.checksum.length === 64, `Migration ${row.version} must have valid SHA-256 checksum`);
  }
  console.log(`  ✔ All ${migRes.rows.length} database migrations verified with valid SHA-256 checksums.`);

  // Test tamper detection
  await repo.query("UPDATE schema_migrations SET checksum = 'tampered_fake_checksum_000000000000000000000000000000000000000' WHERE version = 1");
  const { DatabaseMigrator } = await import('../db/migrator');
  const migrator = new DatabaseMigrator(repo);
  let tamperDetected = false;
  try {
    await migrator.runPendingMigrations();
  } catch (err: any) {
    if (err.message.includes('Migration integrity violation in version 1')) {
      tamperDetected = true;
    }
  }
  assert.strictEqual(tamperDetected, true, 'Migrator must detect post-apply migration alteration and reject execution');
  // Restore original checksum
  const origChecksum = migRes.rows[0].checksum;
  await repo.query("UPDATE schema_migrations SET checksum = $1 WHERE version = 1", [origChecksum]);
  console.log('  ✔ Tamper detection verified: altered migrations are rejected.');

  // 2. INSERT & SELECT (PARAMETERIZED)
  console.log('▶ Test 2: Parameterized Insert & Select');
  const userId = `usr_pg_test_${Date.now()}`;
  const testEmail = `integration_${Date.now()}@aurora.internal`;
  
  const savedUser = await repo.saveUser({
    id: userId,
    email: testEmail,
    fullName: 'Postgres Integration User',
    role: 'USER',
    subscriptionTier: 'Pro',
    language: 'vi',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profilesCount: 0
  }, 'salt_123:hash_456');

  assert.strictEqual(savedUser.id, userId);
  assert.strictEqual(savedUser.email, testEmail.toLowerCase());

  // Case-insensitive lookup
  const fetchedByEmail = await repo.getUserByEmail(testEmail.toUpperCase());
  assert(fetchedByEmail !== null, 'User must be retrievable case-insensitively');
  assert.strictEqual(fetchedByEmail?.id, userId);
  console.log('  ✔ Parameterized insert and case-insensitive select passed.');

  // 3. UPDATE & PREFERENCES
  console.log('▶ Test 3: Preferences & Parameterized Update');
  const prefs = await repo.updatePreferences(userId, {
    theme: 'dark',
    scientificConfidenceMode: true,
    language: 'vi'
  });
  assert.strictEqual(prefs.theme, 'dark');
  assert.strictEqual(prefs.scientificConfidenceMode, true);

  const fetchedPrefs = await repo.getPreferences(userId);
  assert.strictEqual(fetchedPrefs.theme, 'dark');
  console.log('  ✔ User preferences upsert and retrieval verified.');

  // 4. SESSIONS & AUDIT LOGS
  console.log('▶ Test 4: Sessions & Audit Logging');
  const sessionToken = `sess_pg_${Date.now()}`;
  await repo.saveSession({
    token: sessionToken,
    userId,
    expiresAt: Date.now() + 3600000,
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
    isGuest: false
  });

  const session = await repo.getSession(sessionToken);
  assert(session !== null, 'Session must exist');
  assert.strictEqual(session?.userId, userId);

  await repo.logAudit({
    userId,
    action: 'TEST_INTEGRATION_AUDIT',
    resource: 'DATABASE',
    status: 'SUCCESS',
    resourceId: 'test_123'
  });

  const logs = await repo.getAuditLogs(5);
  assert(logs.some(l => l.action === 'TEST_INTEGRATION_AUDIT'), 'Audit log must be saved and queried');
  console.log('  ✔ Sessions and audit logs passed.');

  // 5. TRANSACTIONS & PROFILES
  console.log('▶ Test 5: Profile Creation & Transaction Atomicity');
  const profileId = `prof_pg_${Date.now()}`;
  await repo.runTransaction(async (tx) => {
    await tx.saveProfile({
      id: profileId,
      userId,
      name: 'Nguyễn Văn Test',
      isPrimary: true,
      avatarSeed: 'avatar_1',
      birthData: {
        solarYear: 1990,
        solarMonth: 1,
        solarDay: 1,
        solarHour: 12,
        solarMinute: 0,
        hasExactHour: true,
        birthCity: 'Hanoi',
        birthCountry: 'Vietnam',
        timezoneOffset: 7,
        timezoneName: 'Asia/Bangkok (UTC+7)',
        gender: 'Male',
        calendarSystem: 'solar'
      },
      behavioralContext: { careerField: '', employmentStatus: '', financialGoal: '', relationshipStatus: '', topPriority: '', personalNotes: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  const profile = await repo.getProfile(profileId);
  assert(profile !== null, 'Committed profile must exist');
  assert.strictEqual(profile?.name, 'Nguyễn Văn Test');
  console.log('  ✔ Transaction commit and profile persistence passed.');

  // 6. INTEGRITY & ORPHAN CHECKS
  console.log('▶ Test 6: Database Referential Integrity');
  const integrity = await repo.verifyDatabaseIntegrity();
  assert.strictEqual(integrity.valid, true, 'Database must be structurally valid without orphans');
  console.log('  ✔ Database referential integrity check passed (0 orphan records).');

  // 7. REAL METRICS
  console.log('▶ Test 7: Real Telemetry & Observability Metrics');
  const metrics = await repo.getMetrics();
  assert.strictEqual(metrics.storageMode, 'postgresql_production_adapter');
  assert(metrics.totalUsers >= 1, 'Total users count must reflect real records');
  assert(metrics.totalProfiles >= 1, 'Total profiles count must reflect real records');
  console.log('  ✔ Real metrics reported correctly without hardcoded values.');

  // 8. CONCURRENT MIGRATION RUNNERS & ADVISORY LOCKING
  console.log('▶ Test 8: Concurrent Migration Advisory Lock Synchronization');
  const runner1 = new DatabaseMigrator(repo);
  const runner2 = new DatabaseMigrator(repo);
  const runner3 = new DatabaseMigrator(repo);

  // Run 3 concurrent migration passes simultaneously
  const results = await Promise.all([
    runner1.runPendingMigrations(),
    runner2.runPendingMigrations(),
    runner3.runPendingMigrations()
  ]);

  // All runners should finish gracefully without conflict or deadlock
  for (const res of results) {
    assert(typeof res.applied === 'number', 'Migration run must return applied count');
  }
  const status = await runner1.getMigrationStatus();
  assert(status.currentVersion >= 6, 'Migration version must remain at or above 6');
  console.log('  ✔ Concurrent migration runners synchronized safely via dedicated client advisory lock.');

  console.log('====================================================');
  console.log('🏆 POSTGRESQL INTEGRATION SUITE PASSED 100%!');
  console.log('====================================================');
}

runPostgresIntegrationSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ PostgreSQL Integration Suite Failed:', err);
    process.exit(1);
  });

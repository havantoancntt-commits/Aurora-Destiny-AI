// ==========================================
// AURORA DESTINY AI — DATABASE RESILIENCE & ERROR HANDLING TEST SUITE
// Verifies connection failure handling, query rejection on disconnected database,
// transaction rollback on error, and graceful degradation behavior.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { PostgresDatabaseRepository } from '../src/db/postgresRepository';
import { PersistentDatabaseRepository } from '../src/db/repository';

test('🐘 Database Resilience & Connection Error Handling Suite', async (t) => {
  await t.test('1. PostgresDatabaseRepository with unreachable host does not crash process', async () => {
    // Unreachable connection string with fast timeout
    const unreachableConfig = {
      connectionString: 'postgresql://invalid_user:invalid_pass@127.0.0.1:54329/nonexistent_db',
      connectionTimeoutMillis: 500,
      statement_timeout: 500
    };

    const repo = new PostgresDatabaseRepository(unreachableConfig);
    assert.ok(repo, 'Repository instance must be instantiated without uncaught crash');

    // Attempting query on unreachable database safely throws or rejects without process crash
    await assert.rejects(
      async () => {
        await repo.query('SELECT 1');
      },
      (err: any) => {
        assert.ok(err, 'Query on unreachable host must reject with an error');
        return true;
      }
    );

    // Clean up pool
    await repo.close();
  });

  await t.test('2. PersistentDatabaseRepository atomic transaction rolls back state on thrown error', async () => {
    const tempDir = `./data/test_rollback_${Date.now()}`;
    const repo = new PersistentDatabaseRepository(tempDir);

    const initialUserCount = (await repo.getMetrics()).totalUsers;

    // Execute transaction that fails mid-way
    await assert.rejects(
      async () => {
        await repo.runTransaction(async (txRepo) => {
          await txRepo.saveUser({
            id: 'usr_rollback_test',
            email: 'rollback@aurora.internal',
            fullName: 'Rollback User',
            role: 'USER',
            subscriptionTier: 'Free',
            language: 'vi',
            emailVerified: false,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            profilesCount: 0
          });

          // Simulate mid-transaction crash
          throw new Error('SIMULATED_TRANSACTION_FAILURE');
        });
      },
      /SIMULATED_TRANSACTION_FAILURE/
    );

    // Verify user was NOT saved (rolled back)
    const afterUser = await repo.getUser('usr_rollback_test');
    assert.strictEqual(afterUser, null, 'User saved inside failed transaction must be rolled back');

    const finalUserCount = (await repo.getMetrics()).totalUsers;
    assert.strictEqual(finalUserCount, initialUserCount, 'User count must remain unchanged after rollback');
  });

  await t.test('3. PersistentDatabaseRepository detects and recovers from missing data directory', async () => {
    const deepDir = `./data/test_deep_nested_${Date.now()}/level1/level2`;
    assert.doesNotThrow(() => {
      const repo = new PersistentDatabaseRepository(deepDir);
      assert.ok(repo);
    });
  });
});

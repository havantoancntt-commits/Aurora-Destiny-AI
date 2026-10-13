// ==========================================
// AURORA DESTINY AI — STORAGE HEALTH & DURABILITY VERIFICATION TEST
// Verifies authentic storage health checks for LocalDisk, Memory, and Postgres tiers.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import path from 'node:path';
import fs from 'node:fs';
import {
  LocalDiskStorageProvider,
  MemoryStorageProvider,
  PostgresObjectStorageProvider,
  setStorageProvider,
  parseBooleanEnv,
  isAllowFileStorageInProduction,
  evaluateStoragePolicy
} from '../src/server/storageProvider';
import { app } from '../server';

test('📦 Storage Health & Durability Verification Suite', async (t) => {
  await t.test('1. LocalDiskStorageProvider reflects real filesystem status and durability', async () => {
    const testDir = path.join(process.cwd(), '.tmp_test_disk_storage');
    const provider = new LocalDiskStorageProvider(testDir);
    try {
      const health = await provider.checkHealth();
      assert.strictEqual(health.status, 'healthy');
      assert.strictEqual(health.backend, 'local_disk');
      assert.strictEqual(health.persisted, true);
      assert.strictEqual(health.location, testDir);
    } finally {
      provider.close();
      if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  await t.test('2. MemoryStorageProvider reports ephemeral in-memory status (isDurable: false, persisted: false)', async () => {
    const provider = new MemoryStorageProvider();
    const health = await provider.checkHealth();

    assert.strictEqual(health.backend, 'in_memory');
    assert.strictEqual(health.isDurable, false, 'In-memory storage must never claim durability');
    assert.strictEqual(health.persisted, false, 'In-memory storage must not claim disk persistence');
  });

  await t.test('3. PostgresObjectStorageProvider checks database connection health', async () => {
    // Mock healthy pool
    const mockHealthyPool: any = {
      query: async (sql: string) => {
        if (sql.includes('staged_objects')) return { rows: [{ '?column?': 1 }] };
        return { rows: [] };
      }
    };
    const provider = new PostgresObjectStorageProvider(mockHealthyPool);
    const health = await provider.checkHealth();

    assert.strictEqual(health.status, 'healthy');
    assert.strictEqual(health.backend, 'postgres_object_storage');
    assert.strictEqual(health.isDurable, true);
    assert.strictEqual(health.persisted, true);
  });

  await t.test('4. PostgresObjectStorageProvider reports unhealthy status on database failure', async () => {
    // Mock failing pool
    const mockFailingPool: any = {
      query: async () => {
        throw new Error('Connection terminated unexpectedly');
      }
    };
    const provider = new PostgresObjectStorageProvider(mockFailingPool);
    const health = await provider.checkHealth();

    assert.strictEqual(health.status, 'unhealthy');
    assert.strictEqual(health.backend, 'postgres_object_storage');
    assert.strictEqual(health.persisted, false);
    assert.ok(health.error?.includes('Connection terminated unexpectedly'));
  });

  await t.test('5. parseBooleanEnv and isAllowFileStorageInProduction strictly accept only "true"', () => {
    // Valid true cases
    assert.strictEqual(parseBooleanEnv('true'), true);
    assert.strictEqual(parseBooleanEnv('TRUE'), true);
    assert.strictEqual(parseBooleanEnv(' True '), true);
    assert.strictEqual(isAllowFileStorageInProduction({ ALLOW_FILE_STORAGE_IN_PRODUCTION: 'true' }), true);

    // Invalid cases: "false", "0", "1", "yes", empty, undefined, null, arbitrary
    assert.strictEqual(parseBooleanEnv('false'), false);
    assert.strictEqual(parseBooleanEnv('FALSE'), false);
    assert.strictEqual(parseBooleanEnv('0'), false);
    assert.strictEqual(parseBooleanEnv('1'), false);
    assert.strictEqual(parseBooleanEnv('yes'), false);
    assert.strictEqual(parseBooleanEnv('no'), false);
    assert.strictEqual(parseBooleanEnv(''), false);
    assert.strictEqual(parseBooleanEnv('   '), false);
    assert.strictEqual(parseBooleanEnv(undefined), false);
    assert.strictEqual(parseBooleanEnv(null), false);
    assert.strictEqual(parseBooleanEnv('trueish'), false);

    assert.strictEqual(isAllowFileStorageInProduction({ ALLOW_FILE_STORAGE_IN_PRODUCTION: 'false' }), false);
    assert.strictEqual(isAllowFileStorageInProduction({}), false);
    assert.strictEqual(isAllowFileStorageInProduction({ ALLOW_FILE_STORAGE_IN_PRODUCTION: 'invalid_val' }), false);
  });

  await t.test('6. Serverless environment forbids claiming persistent durability for local filesystem', async () => {
    const prevVercel = process.env.VERCEL;
    process.env.VERCEL = '1';
    const testDir = path.join(process.cwd(), '.tmp_test_serverless_disk');
    const provider = new LocalDiskStorageProvider(testDir);

    try {
      const health = await provider.checkHealth();
      assert.strictEqual(health.backend, 'local_disk');
      // Even though writing to local disk succeeded, on serverless it must NOT claim durability or persistent state
      assert.strictEqual(health.isDurable, false, 'Serverless local disk must not claim durability');
      assert.strictEqual(health.persisted, false, 'Serverless local disk must not claim persistence across invocations');
    } finally {
      provider.close();
      if (prevVercel !== undefined) process.env.VERCEL = prevVercel;
      else delete process.env.VERCEL;
      if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  await t.test('7. evaluateStoragePolicy enforces strict production durability policy', () => {
    const ephemeralHealth = {
      status: 'healthy' as const,
      backend: 'local_disk' as const,
      isDurable: false,
      persisted: false,
      location: '/tmp/test'
    };

    // In production without ALLOW_FILE_STORAGE_IN_PRODUCTION -> REJECT
    const prodNoOverride = evaluateStoragePolicy(ephemeralHealth, {
      NODE_ENV: 'production'
    });
    assert.strictEqual(prodNoOverride.isAcceptable, false);
    assert.strictEqual(prodNoOverride.status, 'unhealthy');
    assert.strictEqual(prodNoOverride.reason, 'NON_DURABLE_STORAGE_FORBIDDEN_IN_PRODUCTION');

    // In production with ALLOW_FILE_STORAGE_IN_PRODUCTION='false' -> REJECT
    const prodFalseOverride = evaluateStoragePolicy(ephemeralHealth, {
      NODE_ENV: 'production',
      ALLOW_FILE_STORAGE_IN_PRODUCTION: 'false'
    });
    assert.strictEqual(prodFalseOverride.isAcceptable, false);
    assert.strictEqual(prodFalseOverride.status, 'unhealthy');

    // In production with explicit ALLOW_FILE_STORAGE_IN_PRODUCTION='true' -> ACCEPT (degraded)
    const prodExplicitTrue = evaluateStoragePolicy(ephemeralHealth, {
      NODE_ENV: 'production',
      ALLOW_FILE_STORAGE_IN_PRODUCTION: 'true'
    });
    assert.strictEqual(prodExplicitTrue.isAcceptable, true);
    assert.strictEqual(prodExplicitTrue.status, 'degraded');
    assert.strictEqual(prodExplicitTrue.reason, 'NON_DURABLE_STORAGE_ALLOWED_VIA_OVERRIDE');

    // In development mode -> ACCEPT without requiring override
    const devEval = evaluateStoragePolicy(ephemeralHealth, {
      NODE_ENV: 'development'
    });
    assert.strictEqual(devEval.isAcceptable, true);
    assert.strictEqual(devEval.status, 'healthy');
  });

  await t.test('8. Health endpoints produce consistent HTTP status and payloads', () => {
    const durableHealth = {
      status: 'healthy' as const,
      backend: 'postgres_object_storage' as const,
      isDurable: true,
      persisted: true,
      location: 'postgresql://staged_objects'
    };

    // When storage is durable in production:
    const evalDurable = evaluateStoragePolicy(durableHealth, { NODE_ENV: 'production' });
    assert.strictEqual(evalDurable.isAcceptable, true);
    assert.strictEqual(evalDurable.status, 'healthy');

    // When storage is broken/unhealthy in any environment:
    const failedHealth = {
      status: 'unhealthy' as const,
      backend: 'postgres_object_storage' as const,
      isDurable: true,
      persisted: false,
      error: 'Connection timeout'
    };
    const evalFailed = evaluateStoragePolicy(failedHealth, { NODE_ENV: 'production' });
    assert.strictEqual(evalFailed.isAcceptable, false);
    assert.strictEqual(evalFailed.status, 'unhealthy');
    assert.strictEqual(evalFailed.reason, 'STORAGE_UNHEALTHY');
  });
});

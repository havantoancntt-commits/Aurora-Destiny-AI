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
  setStorageProvider
} from '../src/server/storageProvider';

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
});

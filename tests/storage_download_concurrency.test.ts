// ==========================================
// AURORA DESTINY AI — STORAGE DOWNLOAD CONCURRENCY & RACE-CONDITION TEST
// Verifies atomic download limits under high-concurrency stampedes (100 parallel requests)
// 1. maxDownloads = 10 with 100 concurrent requests -> exactly 10 SUCCESS, 90 DENIED
// 2. maxDownloads = 1 with 100 concurrent requests -> exactly 1 SUCCESS, 99 DENIED
// 3. Eviction invariant: object evicted and inaccessible after limit is reached
// ==========================================

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  LocalDiskStorageProvider,
  MemoryStorageProvider,
  IObjectStorageProvider
} from '../src/server/storageProvider';

async function testProviderConcurrency(storage: IObjectStorageProvider, name: string) {
  console.log(`\n🧪 Testing high-concurrency stampede on [${name}]...`);

  // -----------------------------------------------------------------
  // SCENARIO 1: maxDownloads = 10 with 100 concurrent requests
  // -----------------------------------------------------------------
  {
    const key = `concurrency_10_${Date.now()}_${Math.random()}`;
    const dummyPdf = Buffer.from('%PDF-1.4 high concurrency test document with 10 max downloads');

    await storage.save(key, dummyPdf, {
      fileName: 'contract_analysis.pdf',
      userId: 'user_exec_10',
      maxDownloads: 10,
      expiresAt: Date.now() + 60000,
      contentType: 'application/pdf'
    });

    const requests = Array.from({ length: 100 }, (_, i) => i);
    const results = await Promise.all(
      requests.map(() => storage.consumeDownload(key))
    );

    const successCount = results.filter(r => r.allowed).length;
    const deniedCount = results.filter(r => !r.allowed).length;

    console.log(`  [${name} maxDownloads=10]: SUCCESS=${successCount}, DENIED=${deniedCount}`);
    assert.strictEqual(successCount, 10, `Expected exactly 10 successful downloads, got ${successCount}`);
    assert.strictEqual(deniedCount, 90, `Expected exactly 90 denied downloads, got ${deniedCount}`);

    // Verify all denied requests have LIMIT_EXCEEDED or NOT_FOUND
    const deniedReasons = results.filter(r => !r.allowed).map(r => r.reason);
    assert(
      deniedReasons.every(r => r === 'LIMIT_EXCEEDED' || r === 'NOT_FOUND'),
      'All denied requests must have LIMIT_EXCEEDED or NOT_FOUND'
    );

    // After all 10 downloads consumed, get(key) MUST return null (evicted)
    const afterCheck = await storage.get(key);
    assert.strictEqual(afterCheck, null, 'File must be evicted after maxDownloads is reached');
  }

  // -----------------------------------------------------------------
  // SCENARIO 2: maxDownloads = 1 with 100 concurrent requests
  // -----------------------------------------------------------------
  {
    const key = `concurrency_1_${Date.now()}_${Math.random()}`;
    const dummyPdf = Buffer.from('%PDF-1.4 high concurrency single-use secret token');

    await storage.save(key, dummyPdf, {
      fileName: 'single_use_credential.pdf',
      userId: 'user_exec_1',
      maxDownloads: 1,
      expiresAt: Date.now() + 60000,
      contentType: 'application/pdf'
    });

    const requests = Array.from({ length: 100 }, (_, i) => i);
    const results = await Promise.all(
      requests.map(() => storage.consumeDownload(key))
    );

    const successCount = results.filter(r => r.allowed).length;
    const deniedCount = results.filter(r => !r.allowed).length;

    console.log(`  [${name} maxDownloads=1]: SUCCESS=${successCount}, DENIED=${deniedCount}`);
    assert.strictEqual(successCount, 1, `Expected exactly 1 successful download, got ${successCount}`);
    assert.strictEqual(deniedCount, 99, `Expected exactly 99 denied downloads, got ${deniedCount}`);

    // After single download consumed, get(key) MUST return null (evicted)
    const afterCheck = await storage.get(key);
    assert.strictEqual(afterCheck, null, 'File must be evicted after single maxDownload is reached');
  }
}

async function runAll() {
  console.log('====================================================');
  console.log('⚡ AURORA DESTINY AI — STORAGE DOWNLOAD CONCURRENCY');
  console.log('====================================================');

  // Test Memory Storage Provider
  const memStorage = new MemoryStorageProvider();
  await testProviderConcurrency(memStorage, 'MemoryStorageProvider');

  // Test Local Disk Storage Provider
  const testDir = path.join(process.cwd(), '.test_concurrency_storage');
  const diskStorage = new LocalDiskStorageProvider(testDir);
  try {
    await testProviderConcurrency(diskStorage, 'LocalDiskStorageProvider');
  } finally {
    diskStorage.close();
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  }

  console.log('\n✅ ALL STORAGE CONCURRENCY TESTS PASSED WITH 100% ATOMICITY!\n');
}

runAll().catch(err => {
  console.error('❌ Storage Concurrency Test Failed:', err);
  process.exit(1);
});

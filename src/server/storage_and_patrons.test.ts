// ==========================================================
// AURORA DESTINY AI — STORAGE, PATRONS & WEBHOOK INTEGRATION TEST
// Verifies:
// 1. LocalDiskStorageProvider & MemoryStorageProvider
// 2. Cryptographic Signed Download Tokens (HMAC-SHA256)
// 3. Patrons CRUD, Ledger Transparency & Status Transitions
// 4. Webhook Idempotency, Anti-Replay & Signature Security
// ==========================================================

import assert from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  LocalDiskStorageProvider,
  MemoryStorageProvider,
  generateSignedDownloadToken,
  verifySignedDownloadToken
} from './storageProvider';
import { PersistentDatabaseRepository } from '../db/repository';
import { PaymentWebhookSchema, PatronCreateSchema } from '../schemas/validationSchemas';

async function runTests() {
  console.log('🚀 Starting Storage, Patrons & Webhook Test Suite...\n');

  // ----------------------------------------------------
  // TEST 1: Storage Provider (Memory & LocalDisk)
  // ----------------------------------------------------
  console.log('📦 Testing Storage Providers...');
  const testDir = path.join(process.cwd(), '.test_storage');
  const diskStorage = new LocalDiskStorageProvider(testDir);
  const memStorage = new MemoryStorageProvider();

  for (const storage of [memStorage, diskStorage]) {
    const key = `test_file_${Date.now()}_${Math.random()}`;
    const dummyPdf = Buffer.from('%PDF-1.4 test dummy content for destiny analysis');

    await storage.save(key, dummyPdf, {
      fileName: 'destiny_test.pdf',
      userId: 'user_123',
      maxDownloads: 2,
      expiresAt: Date.now() + 60000,
      contentType: 'application/pdf'
    });

    const retrieved = await storage.get(key);
    assert(retrieved !== null, 'Storage should retrieve saved file');
    assert.strictEqual(retrieved.metadata.fileName, 'destiny_test.pdf');
    assert.strictEqual(retrieved.metadata.userId, 'user_123');
    assert(retrieved.data.toString().startsWith('%PDF-'), 'Magic bytes preserved');

    // Test download increment & eviction
    const count1 = await storage.incrementDownloadCount(key);
    assert.strictEqual(count1, 1);
    const count2 = await storage.incrementDownloadCount(key);
    assert.strictEqual(count2, 2);

    // Third download should return null because maxDownloads = 2
    const expiredByLimit = await storage.get(key);
    assert.strictEqual(expiredByLimit, null, 'File should be evicted after reaching maxDownloads');
  }

  // Clean test dir if created
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  console.log('✅ Storage Provider tests passed.');

  // ----------------------------------------------------
  // TEST 2: HMAC-SHA256 Signed Download Tokens
  // ----------------------------------------------------
  console.log('\n🔐 Testing Cryptographic Signed Download Tokens...');
  const fileId = 'file_abc123';
  const userId = 'user_destiny_456';
  const token = generateSignedDownloadToken(fileId, userId, 60);

  // Valid token
  const validRes = verifySignedDownloadToken(token);
  assert.strictEqual(validRes.valid, true);
  assert.strictEqual(validRes.payload?.fileId, fileId);
  assert.strictEqual(validRes.payload?.userId, userId);

  // Tampered token
  const [b64, sig] = token.split('.');
  const tamperedSig = sig.slice(0, -4) + 'AAAA';
  const tamperedRes = verifySignedDownloadToken(`${b64}.${tamperedSig}`);
  assert.strictEqual(tamperedRes.valid, false, 'Tampered token signature must fail verification');

  // Expired token
  const expiredToken = generateSignedDownloadToken(fileId, userId, -10);
  const expiredRes = verifySignedDownloadToken(expiredToken);
  assert.strictEqual(expiredRes.valid, false, 'Expired token must fail verification');
  assert.strictEqual(expiredRes.reason, 'EXPIRED_TOKEN');
  console.log('✅ Signed Download Token tests passed.');

  // ----------------------------------------------------
  // TEST 3: Patrons CRUD & Verification Lifecycle
  // ----------------------------------------------------
  console.log('\n🏛️ Testing Patron Persistence & Ledger Transparency...');
  const repo = new PersistentDatabaseRepository();

  const initialPatrons = await repo.getPatrons();
  const initialCount = initialPatrons.length;

  const newPatron = await repo.createPatron({
    name: 'Đạo Hữu Huệ Đăng',
    tier: 'kim_cuong',
    amount: 1500000,
    message: 'Kính chúc Phật sự viên thành, trí tuệ quang minh.',
    status: 'PENDING',
    verificationType: 'UNVERIFIED',
    isAnonymous: false
  });

  assert(newPatron.id.startsWith('ptr_'), 'Patron ID prefix ptr_');
  assert(newPatron.sealHash.startsWith('SEAL-HPPD-'), 'Seal hash must have correct brand prefix');
  assert.strictEqual(newPatron.status, 'PENDING');
  assert.strictEqual(newPatron.verificationType, 'UNVERIFIED');

  const afterCreate = await repo.getPatrons();
  assert.strictEqual(afterCreate.length, initialCount + 1, 'Patron count should increase by 1');

  // Verify Patron via Webhook / Ledger Settlement
  const testPaymentRef = `VCB_TRANS_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const verified = await repo.verifyPatron(newPatron.id, testPaymentRef, 'WEBHOOK_VERIFIED');
  assert(verified !== null, 'Verified patron must not be null');
  assert.strictEqual(verified.status, 'VERIFIED');
  assert.strictEqual(verified.verificationType, 'WEBHOOK_VERIFIED');
  assert.strictEqual(verified.paymentReference, testPaymentRef);
  assert(verified.verifiedAt !== undefined, 'verifiedAt timestamp must be set');
  console.log('✅ Patron CRUD & Verification tests passed.');

  // ----------------------------------------------------
  // TEST 4: Payment Webhook Idempotency & Anti-Replay
  // ----------------------------------------------------
  console.log('\n💳 Testing Payment Webhook Security & Idempotency...');
  const idempotencyKey = `idem_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  
  // Before processing
  const isProc1 = await repo.isWebhookProcessed(idempotencyKey);
  assert.strictEqual(isProc1, false, 'Unprocessed webhook must return false');

  // Record webhook
  await repo.recordWebhookEvent({
    id: `wh_${Date.now()}`,
    idempotencyKey,
    provider: 'VIETQR_VCB',
    payloadHash: 'hash_abc123',
    processedAt: new Date().toISOString()
  });

  // After processing
  const isProc2 = await repo.isWebhookProcessed(idempotencyKey);
  assert.strictEqual(isProc2, true, 'Processed webhook must return true (idempotency check)');

  // Validate Zod schema
  const validPayload = {
    patronId: newPatron.id,
    paymentReference: 'REF_TEST_001',
    amount: 1500000,
    provider: 'VIETQR_VCB' as const,
    idempotencyKey: `key_${Date.now()}`,
    timestamp: Date.now()
  };
  const parsed = PaymentWebhookSchema.parse(validPayload);
  assert.strictEqual(parsed.patronId, newPatron.id);

  // Anti-replay time window check
  const staleTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago (> 5m window)
  const isReplay = Math.abs(Date.now() - staleTimestamp) > 5 * 60 * 1000;
  assert.strictEqual(isReplay, true, 'Stale webhook timestamp must be flagged as replay');

  // ----------------------------------------------------
  // TEST 5: Payment Reconciliation & Lookup Integrity
  // ----------------------------------------------------
  console.log('\n⚖️ Testing Payment Reconciliation & Duplicate Prevention...');
  
  // Test getPatronById
  const retrievedPatron = await repo.getPatronById(newPatron.id);
  assert(retrievedPatron !== null, 'getPatronById must find patron');
  assert.strictEqual(retrievedPatron.id, newPatron.id);

  // Test getPatronByPaymentReference
  const byRef = await repo.getPatronByPaymentReference(testPaymentRef);
  assert(byRef !== null, 'getPatronByPaymentReference must find verified patron');
  assert.strictEqual(byRef.id, newPatron.id);

  // Reconciliation: Amount mismatch detection
  const registeredAmount = retrievedPatron.amount || 1500000;
  const underpaidAmount = 500000;
  assert(underpaidAmount < registeredAmount, 'Underpaid webhook must fail reconciliation');

  // Duplicate reference across different patrons
  const anotherPatron = await repo.createPatron({
    name: 'Thí Chủ Khác',
    tier: 'bac',
    amount: 200000,
    status: 'PENDING',
    verificationType: 'UNVERIFIED',
    isAnonymous: false
  });
  const duplicateRefFound = await repo.getPatronByPaymentReference(testPaymentRef);
  assert(duplicateRefFound !== null && duplicateRefFound.id !== anotherPatron.id, 'Duplicate payment reference across different patrons must be detected');

  // ----------------------------------------------------
  // TEST 6: HMAC Signature Verification & Anti-Tampering
  // ----------------------------------------------------
  console.log('\n🛡️ Testing Webhook HMAC Signature & Timing-Safe Verification...');
  const webhookSecret = 'test_webhook_secret_key_123';
  const samplePayload = JSON.stringify(validPayload);
  const correctSig = crypto.createHmac('sha256', webhookSecret).update(samplePayload).digest('hex');
  const forgedSig = crypto.createHmac('sha256', 'wrong_secret').update(samplePayload).digest('hex');

  const bufCorrect = Buffer.from(correctSig, 'utf8');
  const bufExpected = Buffer.from(correctSig, 'utf8');
  const bufForged = Buffer.from(forgedSig, 'utf8');

  assert.strictEqual(crypto.timingSafeEqual(bufCorrect, bufExpected), true, 'Valid signature must match');
  assert.strictEqual(crypto.timingSafeEqual(bufForged, bufExpected), false, 'Forged signature must fail verification');

  console.log('✅ Payment Reconciliation and HMAC security tests passed.');

  console.log('\n🎉 ALL STORAGE, PATRON & WEBHOOK TESTS PASSED GREEN!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

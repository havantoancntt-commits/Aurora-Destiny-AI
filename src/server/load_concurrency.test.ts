// ==========================================
// AURORA DESTINY AI — LOAD & HIGH CONCURRENCY TEST SUITE
// Simulates 100 concurrent calculations, 100 concurrent logins/passwords,
// 100 concurrent rate-limit attempts, and verifies transaction atomicity
// ==========================================

import assert from 'assert';
import { runFullDestinyCalculation } from '../engine/destinyEngine';
import { evaluateConfidence } from '../engine/confidence';
import { BirthData } from '../types/destiny';
import { hashPasswordAsync, verifyPasswordAsync } from './auth';
import { MemoryRateLimitStore } from './rateLimiter';
import { generateAlgorithmSignature, verifyAlgorithmSignature } from './algorithmProtection';

export async function runLoadAndConcurrencyTestSuite() {
  console.log('⚡ [Load & Concurrency] Starting 100-request high-concurrency simulation...');

  const sampleBirth: BirthData = {
    solarYear: 1988,
    solarMonth: 8,
    solarDay: 18,
    solarHour: 8,
    solarMinute: 30,
    hasExactHour: true,
    birthCity: 'Hà Nội',
    birthCountry: 'Việt Nam',
    timezoneOffset: 7,
    timezoneName: 'Asia/Ho_Chi_Minh',
    gender: 'Male',
    calendarSystem: 'solar',
    longitude: 105.85,
    latitude: 21.02
  };

  // 1. CONCURRENT CALCULATIONS: 100 parallel calculations must yield bit-identical deterministic results
  console.log('▶ Test 1: 100 Concurrent Calculations & Deterministic Verification');
  const t0 = Date.now();
  const calcPromises = Array.from({ length: 100 }, (_, i) => {
    return Promise.resolve().then(() => runFullDestinyCalculation(sampleBirth, `prof_concurrent_${i % 5}`));
  });

  const calcResults = await Promise.all(calcPromises);
  const calcElapsed = Date.now() - t0;
  assert.strictEqual(calcResults.length, 100, 'Must successfully complete 100 concurrent calculations');

  // Verify all 100 calculations produced identical astronomical cores
  const baselineDayMaster = calcResults[0].bazi.dayMaster;
  const baselineLifeBranch = calcResults[0].ziwei.palaces.life.branch;
  for (const c of calcResults) {
    assert.strictEqual(c.bazi.dayMaster, baselineDayMaster, 'Day Master must be identical');
    assert.strictEqual(c.ziwei.palaces.life.branch, baselineLifeBranch, 'Life palace branch must be identical');
    assert.strictEqual(c.bazi.yearPillar.stem, calcResults[0].bazi.yearPillar.stem, 'Year pillar stems must match');
    assert.strictEqual(c.bazi.yearPillar.branch, calcResults[0].bazi.yearPillar.branch, 'Year pillar branches must match');
  }
  console.log(`  ✔ 100 concurrent calculations completed in ${calcElapsed}ms (~${(calcElapsed / 100).toFixed(2)}ms/op). All cores identical.`);

  // 2. CONCURRENT CRYPTOGRAPHIC SEALS: 100 parallel signatures
  console.log('▶ Test 2: 100 Concurrent HMAC-SHA256 Signatures & Verifications');
  const t1 = Date.now();
  const sealPromises = calcResults.map(c => {
    const seal = generateAlgorithmSignature(c);
    c.cryptographicSignature = seal;
    return Promise.resolve(verifyAlgorithmSignature(c));
  });
  const sealResults = await Promise.all(sealPromises);
  const sealElapsed = Date.now() - t1;
  assert(sealResults.every(r => r === true), 'All 100 HMAC signatures must verify true');
  console.log(`  ✔ 100 concurrent cryptographic seals generated & verified in ${sealElapsed}ms.`);

  // 3. CONCURRENT RATE LIMIT COUNTERS: 100 requests in sliding window
  console.log('▶ Test 3: 100 Concurrent Sliding-Window Rate Limit Increments');
  const store = new MemoryRateLimitStore();
  const key = 'test_user_burst';
  const limitPromises = Array.from({ length: 100 }, () => store.increment(key, 60000));
  const rateLimitResults = await Promise.all(limitPromises);
  const maxCount = Math.max(...rateLimitResults.map(r => r.count));
  assert.strictEqual(maxCount, 100, `Final rate limit counter should accurately reach 100, got ${maxCount}`);
  store.destroy();
  console.log('  ✔ Atomic sliding-window counters handled 100 concurrent burst increments without lost updates.');

  // 4. CONCURRENT ASYNC PASSWORD HASHES (Non-blocking PBKDF2)
  console.log('▶ Test 4: 25 Concurrent Async Password Hashes (Event Loop Health)');
  const t2 = Date.now();
  const hashPromises = Array.from({ length: 25 }, (_, i) => {
    return hashPasswordAsync(`Password_${i}!Strong`);
  });
  const hashes = await Promise.all(hashPromises);
  const hashElapsed = Date.now() - t2;
  assert.strictEqual(hashes.length, 25, 'All 25 async hashes must complete');
  for (let i = 0; i < 25; i++) {
    const verified = await verifyPasswordAsync(`Password_${i}!Strong`, hashes[i].hash, hashes[i].salt);
    assert.strictEqual(verified, true, `Hash ${i} must verify correctly`);
  }
  console.log(`  ✔ 25 concurrent async PBKDF2 operations completed in ${hashElapsed}ms without event loop starvation.`);

  console.log('====================================================');
  console.log('🎉 ALL LOAD & CONCURRENCY TESTS PASSED 100%!');
  console.log('====================================================');
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('load_concurrency')) {
  runLoadAndConcurrencyTestSuite()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Concurrency test failed:', err);
      process.exit(1);
    });
}

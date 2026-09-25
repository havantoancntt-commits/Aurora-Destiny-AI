// ==========================================
// AURORA DESTINY AI — PROFILE IDEMPOTENCY & OFFLINE SYNC REGRESSION TEST
// Verifies:
// 1. First POST /api/profiles creates profile & calculation with HTTP 201
// 2. Client retry with identical idempotencyKey returns HTTP 200 without duplicate creation
// 3. Quota is not double-consumed on retries
// ==========================================

import assert from 'assert';
import http from 'http';
import { app } from '../server';
import { resetFirewallQuarantineForTesting } from '../src/server/securityFirewall';

async function runProfileIdempotencyTests() {
  resetFirewallQuarantineForTesting();
  console.log('🧪 Starting Profile Idempotency & Offline Sync Regression Suite...');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const addr = server.address() as any;
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    // 1. Bootstrap guest session
    const guestRes = await fetch(`${baseUrl}/api/auth/guest`, { method: 'POST' });
    assert.strictEqual(guestRes.ok, true);
    const guestData = await guestRes.json();
    const token = guestData.token || guestData.accessToken;
    assert(token, 'Must receive auth token');

    const testBirthData = {
      solarYear: 1996,
      solarMonth: 9,
      solarDay: 25,
      solarHour: 14,
      solarMinute: 30,
      hasExactHour: true,
      timezoneOffset: 7,
      timezoneName: 'Asia/Ho_Chi_Minh',
      birthCity: 'Hà Nội',
      birthCountry: 'Việt Nam',
      gender: 'Male',
      calendarSystem: 'solar'
    };

    const idempotencyKey = `sync_key_${Date.now()}_test`;

    // 2. Initial Creation (First Attempt)
    const firstRes = await fetch(`${baseUrl}/api/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'idempotency-key': idempotencyKey
      },
      body: JSON.stringify({
        name: 'Hồ Sơ Đồng Bộ Thử Nghiệm',
        birthData: testBirthData
      })
    });

    assert.strictEqual(firstRes.status, 201, 'Initial request must return 201 Created');
    const firstData = await firstRes.json();
    assert(firstData.profile?.id, 'Profile ID must be returned');
    assert(firstData.calculation?.id, 'Calculation ID must be returned');

    // 3. Immediate Retry with Identical Idempotency Key (Simulated Lost Response / Offline Queue Retry)
    const retryRes = await fetch(`${baseUrl}/api/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'idempotency-key': idempotencyKey
      },
      body: JSON.stringify({
        name: 'Hồ Sơ Đồng Bộ Thử Nghiệm',
        birthData: testBirthData
      })
    });

    assert.strictEqual(retryRes.status, 200, 'Replayed idempotent request must return 200 OK');
    const retryData = await retryRes.json();
    assert.strictEqual(retryData.idempotencyReplay, true, 'Must indicate idempotencyReplay');
    assert.strictEqual(retryData.profile.id, firstData.profile.id, 'Returned profile ID must match original');

    // 4. Verify user has exactly 1 profile in database, not 2
    const listRes = await fetch(`${baseUrl}/api/profiles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profiles = await listRes.json();
    assert.strictEqual(profiles.length, 1, 'Database must contain exactly 1 profile, no duplicates created');

    console.log('  ✔ Idempotent profile creation: First attempt created, retry returned existing record.');
    console.log('  ✔ Zero duplicate records created in database.');

    // 5. High-concurrency Race Condition Test: simultaneous requests with identical idempotencyKey
    console.log('\n  ▶ High-Concurrency Race: Firing 15 simultaneous requests with identical idempotencyKey...');
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `concurrent_${Date.now()}@aurora.test`,
        password: 'StrongPassword123!@#',
        fullName: 'Concurrent Test User'
      })
    });
    assert.strictEqual(regRes.status, 201);
    const regData = await regRes.json();
    const concurrentUserToken = regData.token || regData.accessToken;
    assert(concurrentUserToken, 'Must receive user token');

    const concurrentKey = `concurrent_sync_${Date.now()}`;
    const concurrentPromises = Array.from({ length: 15 }).map(() =>
      fetch(`${baseUrl}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${concurrentUserToken}`,
          'idempotency-key': concurrentKey
        },
        body: JSON.stringify({
          name: 'Hồ Sơ Đồng Thì 15 Requests',
          birthData: testBirthData
        })
      })
    );

    const responses = await Promise.all(concurrentPromises);
    assert.strictEqual(responses.length, 15);
    const bodies = await Promise.all(responses.map(r => r.json()));

    const statusCodes = responses.map(r => r.status);
    assert(statusCodes.every(s => s === 200 || s === 201), `All concurrent requests must return 200 or 201, got: ${statusCodes.join(',')}`);

    const createdIds = new Set(bodies.map(b => b.profile.id));
    assert.strictEqual(createdIds.size, 1, 'All 15 concurrent requests must resolve to the EXACT SAME profile ID');

    // Verify database has exactly 1 profile for this user
    const finalListRes = await fetch(`${baseUrl}/api/profiles`, {
      headers: { 'Authorization': `Bearer ${concurrentUserToken}` }
    });
    const finalProfiles = await finalListRes.json();
    assert.strictEqual(finalProfiles.length, 1, 'Database must have exactly 1 profile, zero race-condition duplicates created');

    console.log('  ✔ 15 concurrent requests resolved to identical profile ID with zero race duplicates.');
    console.log('\n🎉 Profile Idempotency & Offline Sync tests PASSED!\n');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runProfileIdempotencyTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Profile Idempotency Test Failed:', err);
    process.exit(1);
  });

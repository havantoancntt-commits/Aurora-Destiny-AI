// ==========================================
// AURORA DESTINY AI — RATE LIMITER & FAIL-CLOSED DISTRIBUTED TESTS
// Comprehensive tests for Phase 4:
// 1. Fail-closed policy for sensitive endpoints in production
// 2. Resilient local fallback for non-sensitive endpoints in dev
// 3. Sliding window atomic operations and expiration
// 4. Memory store cleanup and unref behavior
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import {
  MemoryRateLimitStore,
  RedisRateLimitStore
} from '../src/server/rateLimiter';

test('Rate Limiter Fail-Closed & Store Integrity Suite', async (t) => {
  const origEnv = process.env.NODE_ENV;
  const origFailClosed = process.env.RATE_LIMIT_FAIL_CLOSED;
  const origRedisReq = process.env.REDIS_REQUIRED_IN_PRODUCTION;

  t.after(() => {
    process.env.NODE_ENV = origEnv;
    process.env.RATE_LIMIT_FAIL_CLOSED = origFailClosed;
    process.env.REDIS_REQUIRED_IN_PRODUCTION = origRedisReq;
  });

  await t.test('1. MemoryRateLimitStore: sliding window correctly calculates count and resetAt', async () => {
    const store = new MemoryRateLimitStore();
    const key = 'test_mem_key';
    const windowMs = 5000;

    const r1 = await store.increment(key, windowMs);
    assert.strictEqual(r1.count, 1);
    assert.ok(r1.resetAt > Date.now());

    const r2 = await store.increment(key, windowMs);
    assert.strictEqual(r2.count, 2);

    await store.reset(key);
    const r3 = await store.increment(key, windowMs);
    assert.strictEqual(r3.count, 1, 'Counter must reset to 1 after store.reset');
    store.destroy();
  });

  await t.test('2. Disconnected Redis store: fails closed for sensitive endpoints in production', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.RATE_LIMIT_FAIL_CLOSED;
    delete process.env.REDIS_REQUIRED_IN_PRODUCTION;

    // Point to non-routable dummy host to create disconnected store
    const store = new RedisRateLimitStore('redis://127.0.0.1:59999');

    // Sensitive endpoint (e.g. login, register, payment webhook) MUST fail closed in production
    await assert.rejects(
      async () => {
        await store.increment('rl_login:u_123', 60000, true);
      },
      /fail-closed policy active/,
      'Sensitive endpoint must throw fail-closed error in production when Redis is disconnected'
    );
  });

  await t.test('3. Explicit RATE_LIMIT_FAIL_CLOSED=true enforces fail-closed on all calls when disconnected', async () => {
    process.env.NODE_ENV = 'development';
    process.env.RATE_LIMIT_FAIL_CLOSED = 'true';

    const store = new RedisRateLimitStore('redis://127.0.0.1:59999');

    await assert.rejects(
      async () => {
        await store.increment('rl_non_sensitive:test', 60000, false);
      },
      /fail-closed policy active/,
      'Must throw when RATE_LIMIT_FAIL_CLOSED=true regardless of endpoint sensitivity'
    );
  });

  await t.test('4. Non-sensitive endpoint in development falls back safely when Redis disconnected', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.RATE_LIMIT_FAIL_CLOSED;
    delete process.env.REDIS_REQUIRED_IN_PRODUCTION;

    const store = new RedisRateLimitStore('redis://127.0.0.1:59999');

    // Non-sensitive endpoint (isSensitive=false) in dev can use local fallback
    const result = await store.increment('rl_guest:ip_1.2.3.4', 60000, false);
    assert.ok(result.count >= 1);
    assert.ok(result.resetAt > Date.now());
  });

  await t.test('5. High concurrency on sliding window store maintains accurate counters', async () => {
    const store = new MemoryRateLimitStore();
    const key = 'burst_concurrent_key';
    const iterations = 50;

    const promises = Array.from({ length: iterations }, () => store.increment(key, 10000));
    const results = await Promise.all(promises);

    const finalCount = results[results.length - 1].count;
    assert.strictEqual(finalCount, iterations, `Final count must strictly equal ${iterations}`);
    store.destroy();
  });
});

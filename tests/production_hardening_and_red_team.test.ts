// ========================================================
// AURORA DESTINY AI — PRODUCTION HARDENING & RED TEAM AUDIT SUITE
// Automated verification for P0 (Critical Security & Database Invariants),
// P1 (Data Isolation, Cache Privacy & Determinism) & P2 (Concurrency & Red-Team)
// ========================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { createRepository } from '../src/db/repository';
import { MemoryRateLimitStore, RedisRateLimitStore, createRateLimiter } from '../src/server/rateLimiter';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import { BirthData } from '../src/types/destiny';
import { app, ensureAppInitialized, validateProductionConfig } from '../server';

test('🛡️ P0.1 & P1.1: Production Auth & Local Cache Privacy', async (t) => {
  await t.test('1. Client localStorage protection in production mode', async () => {
    // Mock window & localStorage in Node test environment
    const storage = new Map<string, string>();
    const mockLocalStorage = {
      getItem: (k: string) => storage.get(k) || null,
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
      clear: () => storage.clear(),
      get length() { return storage.size; },
      key: (i: number) => Array.from(storage.keys())[i] || null
    };

    (globalThis as any).window = {
      self: {},
      top: {},
      location: { hostname: 'auroradestiny.ai' },
      __AURORA_PRODUCTION_AUTH_MODE: true
    };
    (globalThis as any).window.self = (globalThis as any).window;
    (globalThis as any).window.top = (globalThis as any).window; // Top-level window
    (globalThis as any).localStorage = mockLocalStorage;
    (globalThis as any).sessionStorage = mockLocalStorage;

    const { api } = await import('../src/services/apiClient');

    assert.equal(api.isProductionAuthMode(), true, 'Production auth mode should be active');

    // Attempting to set token in production auth mode must be ignored and purge any existing token
    api.setToken('malicious_fake_jwt_token_12345');
    assert.equal(mockLocalStorage.getItem('aurora_session_token'), null, 'Production mode must NEVER store token in localStorage');

    // Test profile caching namespaced by user
    api.setCurrentUser({ id: 'usr_alice_1', email: 'alice@example.com', fullName: 'Alice' } as any);
    const aliceProfiles = [
      { id: 'prof_alice_1', userId: 'usr_alice_1', name: 'Alice Destiny' } as any
    ];
    api.cacheProfiles(aliceProfiles);

    const retrievedAlice = api.getCachedProfiles();
    assert.equal(retrievedAlice.length, 1);
    assert.equal(retrievedAlice[0].name, 'Alice Destiny');

    // Switch account to Bob: Alice profiles must be completely inaccessible to Bob
    api.setCurrentUser({ id: 'usr_bob_2', email: 'bob@example.com', fullName: 'Bob' } as any);
    const retrievedBob = api.getCachedProfiles();
    assert.equal(retrievedBob.length, 0, 'User Bob must NOT see User Alice cached profiles');

    // Clean up
    delete (globalThis as any).window;
    delete (globalThis as any).localStorage;
    delete (globalThis as any).sessionStorage;
  });
});

test('🐘 P0.2: Production Database Invariants & Fail-Fast', async (t) => {
  await t.test('1. Throws startup failure in production if DATABASE_URL is missing', () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevDbUrl = process.env.DATABASE_URL;
    const prevAllowFile = process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.DATABASE_URL;
      delete process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION;

      assert.throws(
        () => {
          createRepository();
        },
        /FATAL: Production mode strictly requires DATABASE_URL/,
        'Should fail-fast if DATABASE_URL is missing in production'
      );
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      if (prevDbUrl) process.env.DATABASE_URL = prevDbUrl;
      if (prevAllowFile) process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION = prevAllowFile;
    }
  });

  await t.test('2. Throws startup failure in production if forceMode="file" is requested without override', () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevAllowFile = process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION;

      assert.throws(
        () => {
          createRepository({ forceMode: 'file' });
        },
        /FATAL: forceMode="file" is not permitted in production mode/,
        'Should forbid file storage in production'
      );
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      if (prevAllowFile) process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION = prevAllowFile;
    }
  });
});

test('⚡ P0.4: Unified Cold-Start & Concurrent Application Initialization', async (t) => {
  await t.test('1. 10 concurrent invocations of ensureAppInitialized run cleanly with zero race condition', async () => {
    const promises = Array.from({ length: 10 }).map(() => ensureAppInitialized());
    await assert.doesNotReject(Promise.all(promises), 'Concurrent cold-start initialization must not throw or race');
  });
});

test('🔒 P0.5 & P0.6: Rate Limiting Security, Fail-Closed & IPv6 Subnet Normalization', async (t) => {
  await t.test('1. MemoryRateLimitStore fails-closed on sensitive endpoints in production without override', async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevAllow = process.env.ALLOW_MEMORY_RATE_LIMITER_IN_PRODUCTION;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_MEMORY_RATE_LIMITER_IN_PRODUCTION;

      const store = new MemoryRateLimitStore();
      await assert.rejects(
        async () => {
          await store.increment('login_sensitive_key', 60000, true);
        },
        /distributed fail-closed policy active/,
        'Sensitive rate limit must fail closed in production without Redis or explicit override'
      );
      store.destroy();
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      if (prevAllow) process.env.ALLOW_MEMORY_RATE_LIMITER_IN_PRODUCTION = prevAllow;
    }
  });

  await t.test('2. IPv6 normalization collapses addresses in same /64 subnet', async () => {
    const limiter = createRateLimiter({
      keyPrefix: 'test_ipv6',
      windowMs: 60000,
      maxRequests: 3,
      message: 'Rate limit exceeded'
    });

    let lastKey = '';
    const mockStore = {
      increment: async (key: string) => {
        lastKey = key;
        return { count: 1, resetAt: Date.now() + 60000 };
      },
      reset: async () => {}
    };

    const { setRateLimitStore } = await import('../src/server/rateLimiter');
    setRateLimitStore(mockStore as any);

    const req1: any = {
      ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      socket: {},
      headers: {}
    };
    const res: any = { setHeader: () => {}, status: () => ({ json: () => {} }) };

    await limiter(req1, res, () => {});
    const key1 = lastKey;

    // Second IP in the same /64 subnet
    const req2: any = {
      ip: '2001:0db8:85a3:0000:ffff:ffff:ffff:ffff',
      socket: {},
      headers: {}
    };
    await limiter(req2, res, () => {});
    const key2 = lastKey;

    assert.equal(key1, key2, 'Both IPs in the same /64 subnet should share the same normalized rate limit key');
  });
});

test('🎯 P1.4: Deterministic Metaphysical Calculation Stability', async (t) => {
  await t.test('1. Bit-for-bit repeatability of BaZi & ZiWei calculations for identical input', () => {
    const birthData: BirthData = {
      solarYear: 1990,
      solarMonth: 5,
      solarDay: 15,
      solarHour: 10,
      solarMinute: 30,
      hasExactHour: true,
      birthCity: 'Hà Nội',
      birthCountry: 'Việt Nam',
      timezoneOffset: 7,
      timezoneName: 'Asia/Ho_Chi_Minh',
      gender: 'Male',
      calendarSystem: 'solar'
    };

    const calc1 = runFullDestinyCalculation(birthData, 'test_profile_id', 0);
    const calc2 = runFullDestinyCalculation(birthData, 'test_profile_id', 0);

    const hash1 = calc1.canonicalInput?.inputHash || calc1.id;
    const hash2 = calc2.canonicalInput?.inputHash || calc2.id;
    assert.equal(hash1, hash2, 'Input hash must be deterministic');
    assert.equal(calc1.bazi.dayPillar.stem, calc2.bazi.dayPillar.stem, 'Day stem must match bit-for-bit');
    assert.equal(calc1.bazi.dayPillar.branch, calc2.bazi.dayPillar.branch, 'Day branch must match bit-for-bit');
    assert.equal(calc1.ziwei.lifePalaceKey, calc2.ziwei.lifePalaceKey, 'Life palace key must match');
    assert.equal(calc1.ziwei.bodyPalaceKey, calc2.ziwei.bodyPalaceKey, 'Body palace key must match');
    assert.equal(calc1.ziwei.palaces[calc1.ziwei.lifePalaceKey].branch, calc2.ziwei.palaces[calc2.ziwei.lifePalaceKey].branch, 'Life palace branch must match');
    assert.equal(Object.keys(calc1.ziwei.palaces).length, 12, 'Must contain all 12 palaces');
  });
});

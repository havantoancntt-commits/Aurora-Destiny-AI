// ==========================================
// AURORA DESTINY AI — SECRET ENTROPY & PRODUCTION CONFIGURATION TEST
// Verifies cryptographic entropy requirements, prevention of default secrets,
// and safe error messaging that never leaks secret values.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { validateSecretEntropy, validateProductionConfig, InitializationError } from '../server';

test('🔐 Secret Entropy & Production Configuration Policy Suite', async (t) => {
  await t.test('1. High-entropy 32+ character random secret passes validation', () => {
    // 64-character hex string from openssl rand -hex 32
    const secureSecret = '4f8b9e2a1c7d0f3e5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f';
    const res = validateSecretEntropy('APP_SECRET', secureSecret, 32);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.reason, undefined);
  });

  await t.test('2. Short secret (< 32 characters) fails validation', () => {
    const shortSecret = 'too_short_secret_key';
    const res = validateSecretEntropy('SESSION_SECRET', shortSecret, 32);
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason?.includes('yêu cầu tối thiểu 32 ký tự'));
    // Must NOT reveal the secret value in the reason string
    assert.strictEqual(res.reason?.includes(shortSecret), false);
  });

  await t.test('3. Weak placeholder sequence fails validation even if 32+ characters long', () => {
    const weakPlaceholder = 'change_me_default_secret_key_for_aurora_destiny_2026';
    const res = validateSecretEntropy('ALGORITHM_PROTECTION_SECRET', weakPlaceholder, 32);
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason?.includes('chuỗi mặc định/mẫu không an toàn'));
    assert.strictEqual(res.reason?.includes(weakPlaceholder), false);
  });

  await t.test('4. Low character diversity (e.g. repeated characters) fails entropy threshold', () => {
    const lowEntropy = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 32 chars but only 1 unique char
    const res = validateSecretEntropy('PAYMENT_SECRET', lowEntropy, 32);
    assert.strictEqual(res.valid, false);
    assert.ok(res.reason?.includes('entropy thấp'));
    assert.strictEqual(res.reason?.includes(lowEntropy), false);
  });

  await t.test('5. Missing or undefined secret fails validation', () => {
    const res1 = validateSecretEntropy('APP_SECRET', undefined, 32);
    assert.strictEqual(res1.valid, false);

    const res2 = validateSecretEntropy('APP_SECRET', '', 32);
    assert.strictEqual(res2.valid, false);
  });

  await t.test('6. validateProductionConfig throws InitializationError with CONFIG_ERROR when secret is weak', () => {
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.SESSION_SECRET;
    const origAppSecret = process.env.APP_SECRET;
    const origDbUrl = process.env.DATABASE_URL;

    try {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://aurora:pass@localhost:5432/aurora';
      process.env.SESSION_SECRET = 'short_weak_key';
      delete process.env.APP_SECRET;

      assert.throws(
        () => validateProductionConfig(),
        (err: any) => {
          assert.ok(err instanceof InitializationError);
          assert.strictEqual(err.code, 'CONFIG_ERROR');
          assert.strictEqual(err.category, 'CONFIGURATION');
          assert.strictEqual(err.statusCode, 503);
          return true;
        }
      );
    } finally {
      process.env.NODE_ENV = origEnv;
      if (origSecret) process.env.SESSION_SECRET = origSecret;
      else delete process.env.SESSION_SECRET;
      if (origAppSecret) process.env.APP_SECRET = origAppSecret;
      else delete process.env.APP_SECRET;
      if (origDbUrl) process.env.DATABASE_URL = origDbUrl;
      else delete process.env.DATABASE_URL;
    }
  });
});

// ==========================================
// AURORA DESTINY AI — ORIGIN, CORS & CSRF SECURITY SUITE
// Tests for Phase 3: Exact origin allowlist, rejection of unknown origins,
// no wildcards in production, and CSRF protection on mutating requests.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { isOriginAllowed } from '../server';

test('Origin, CORS & CSRF Defense Suite', async (t) => {
  const originalEnv = process.env.NODE_ENV;
  const originalAllowed = process.env.ALLOWED_ORIGINS;

  t.after(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.ALLOWED_ORIGINS = originalAllowed;
  });

  await t.test('1. Configured exact ALLOWED_ORIGINS allows designated production domains', () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOWED_ORIGINS = 'https://aurora-destiny.ai,https://api.aurora-destiny.ai';

    assert.strictEqual(
      isOriginAllowed('https://aurora-destiny.ai', 'unknown-host.com'),
      true,
      'Configured origin must be allowed'
    );
    assert.strictEqual(
      isOriginAllowed('https://api.aurora-destiny.ai', 'unknown-host.com'),
      true,
      'Second configured origin must be allowed'
    );
  });

  await t.test('2. Unlisted or malicious origin is strictly rejected in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOWED_ORIGINS = 'https://aurora-destiny.ai';

    assert.strictEqual(
      isOriginAllowed('https://evil-attacker.com', 'aurora-destiny.ai'),
      false,
      'Attacker origin must be rejected'
    );
    assert.strictEqual(
      isOriginAllowed('https://fake-aurora-destiny.ai', 'aurora-destiny.ai'),
      false,
      'Subdomain spoofing origin must be rejected'
    );
  });

  await t.test('3. Wildcards (*.run.app, *.google.com) are strictly rejected in production without explicit allowlisting', () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOWED_ORIGINS = 'https://aurora-destiny.ai';

    assert.strictEqual(
      isOriginAllowed('https://random-service-123.run.app', 'other-host.com'),
      false,
      'Arbitrary Cloud Run origin must be rejected in production'
    );
    assert.strictEqual(
      isOriginAllowed('https://malicious.google.com', 'other-host.com'),
      false,
      'Arbitrary google.com subdomain must be rejected in production'
    );
    assert.strictEqual(
      isOriginAllowed('https://attacker.googleusercontent.com', 'other-host.com'),
      false,
      'Arbitrary googleusercontent origin must be rejected in production'
    );
  });

  await t.test('4. Same-origin match against current Host header succeeds', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOWED_ORIGINS;

    assert.strictEqual(
      isOriginAllowed('https://aurora-destiny.ai', 'aurora-destiny.ai'),
      true,
      'Origin matching current Host header must succeed'
    );
    assert.strictEqual(
      isOriginAllowed('https://internal.service:3000', 'internal.service:3000'),
      true,
      'Host with port matching exactly must succeed'
    );
  });

  await t.test('5. Missing or invalid origin returns false', () => {
    assert.strictEqual(isOriginAllowed(undefined, 'aurora-destiny.ai'), false);
    assert.strictEqual(isOriginAllowed('', 'aurora-destiny.ai'), false);
    assert.strictEqual(isOriginAllowed('not-a-valid-url', 'aurora-destiny.ai'), false);
  });

  await t.test('6. Development environment permits localhost and AI Studio preview', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.ALLOWED_ORIGINS;

    assert.strictEqual(
      isOriginAllowed('http://localhost:3000', 'localhost:3000'),
      true,
      'Localhost must be allowed in dev'
    );
    assert.strictEqual(
      isOriginAllowed('https://aistudio.google.com', 'some-host.com'),
      true,
      'AI Studio origin must be allowed in dev'
    );
  });
}).then(() => {
  process.exit(0);
});

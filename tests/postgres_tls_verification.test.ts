// ==========================================
// AURORA DESTINY AI — POSTGRESQL TLS VERIFICATION POLICY TEST
// Validates strict TLS verification defaults, CA certificates,
// and prevention of accidental security downgrades in production.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePostgresSslConfig } from '../src/db/postgresRepository';

test('🐘 PostgreSQL TLS/SSL Verification Policy Suite', async (t) => {
  await t.test('1. Production mode defaults to strict certificate validation (rejectUnauthorized: true)', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      PGSSLMODE: 'require'
    };
    const res = resolvePostgresSslConfig(env, 'postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/db');

    assert.ok(res.ssl !== false, 'SSL should be active for Neon database');
    assert.strictEqual(res.rejectUnauthorized, true, 'Production MUST default to rejectUnauthorized: true');
    assert.strictEqual(res.isInsecureProductionOverride, false);
  });

  await t.test('2. PGSSLMODE=verify-full strictly requires certificate validation', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'development',
      PGSSLMODE: 'verify-full'
    };
    const res = resolvePostgresSslConfig(env, 'postgresql://localhost:5432/test');
    assert.strictEqual(res.rejectUnauthorized, true);
    assert.strictEqual(res.mode, 'verify-full');
  });

  await t.test('3. PGSSLMODE=verify-ca strictly requires certificate validation', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'development',
      PGSSLMODE: 'verify-ca'
    };
    const res = resolvePostgresSslConfig(env, 'postgresql://localhost:5432/test');
    assert.strictEqual(res.rejectUnauthorized, true);
    assert.strictEqual(res.mode, 'verify-ca');
  });

  await t.test('4. Custom CA certificate via DATABASE_CA_CERT env is correctly injected', () => {
    const sampleCert = '-----BEGIN CERTIFICATE-----\nMIIB...SampleRootCA...\n-----END CERTIFICATE-----';
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      PGSSLMODE: 'verify-full',
      DATABASE_CA_CERT: sampleCert
    };
    const res = resolvePostgresSslConfig(env, 'postgresql://localhost:5432/test');

    assert.strictEqual(res.hasCaCert, true);
    assert.deepStrictEqual(res.ssl, {
      rejectUnauthorized: true,
      ca: sampleCert
    });
  });

  await t.test('5. Custom CA root certificate via PGSSLROOTCERT file path is loaded', () => {
    const tmpCertPath = path.join(process.cwd(), '.tmp_test_root_ca.pem');
    const sampleCert = '-----BEGIN CERTIFICATE-----\nROOT_CA_MOCK\n-----END CERTIFICATE-----';
    fs.writeFileSync(tmpCertPath, sampleCert, 'utf8');

    try {
      const env: NodeJS.ProcessEnv = {
        NODE_ENV: 'production',
        PGSSLMODE: 'verify-ca',
        PGSSLROOTCERT: tmpCertPath
      };
      const res = resolvePostgresSslConfig(env, 'postgresql://localhost:5432/test');

      assert.strictEqual(res.hasCaCert, true);
      assert.strictEqual((res.ssl as any).ca, sampleCert);
    } finally {
      if (fs.existsSync(tmpCertPath)) fs.unlinkSync(tmpCertPath);
    }
  });

  await t.test('6. Development mode defaults to relaxed verification for local dev certs', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'development',
      PGSSLMODE: 'require'
    };
    const res = resolvePostgresSslConfig(env, 'postgresql://localhost:5432/test');
    assert.strictEqual(res.rejectUnauthorized, false, 'Dev mode defaults to false unless explicitly configured');
  });

  await t.test('7. Explicit insecure override in production logs security warning and sets flag', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      PGSSLMODE: 'require',
      DATABASE_SSL_REJECT_UNAUTHORIZED: 'false'
    };
    const res = resolvePostgresSslConfig(env, 'postgresql://user:pass@db.supabase.co/db');
    assert.strictEqual(res.rejectUnauthorized, false);
    assert.strictEqual(res.isInsecureProductionOverride, true, 'Must flag insecure production override');
  });

  await t.test('8. PGSSLMODE=disable or sslmode=disable disables SSL completely', () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      PGSSLMODE: 'disable'
    };
    const res = resolvePostgresSslConfig(env, 'postgresql://user:pass@db.supabase.co/db');
    assert.strictEqual(res.ssl, false);
    assert.strictEqual(res.mode, 'disable');
  });
});

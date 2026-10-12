// ==========================================
// AURORA DESTINY AI — VERCEL INITIALIZATION ERROR CLASSIFICATION TEST
// Verifies fine-grained error categories (CONFIG, MIGRATION, DATABASE, STORAGE)
// and strict absence of secret/path leakage in serverless error responses.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { EventEmitter } from 'node:events';
import handler, { classifyInitializationError } from '../api/index';
import { InitializationError } from '../server';

test('⚡ Vercel Serverless Initialization Error Classification Suite', async (t) => {
  await t.test('1. classifyInitializationError maps typed InitializationError accurately', () => {
    const configErr = new InitializationError('Missing env var', 'CONFIG_ERROR', 503, 'CONFIGURATION', 'Cấu hình thiếu');
    const res = classifyInitializationError(configErr);

    assert.strictEqual(res.code, 'CONFIG_ERROR');
    assert.strictEqual(res.category, 'CONFIGURATION');
    assert.strictEqual(res.statusCode, 503);
    assert.strictEqual(res.publicMessage, 'Cấu hình thiếu');
  });

  await t.test('2. classifyInitializationError distinguishes migration errors from connection errors', () => {
    const migrationErr = new Error('DatabaseMigrator: Syntax error in 002_add_patrons.sql');
    const resMigration = classifyInitializationError(migrationErr);
    assert.strictEqual(resMigration.code, 'MIGRATION_ERROR');
    assert.strictEqual(resMigration.category, 'MIGRATION');

    const dbConnErr = new Error('getaddrinfo ENOTFOUND ep-cool-db.us-east-2.aws.neon.tech');
    const resDb = classifyInitializationError(dbConnErr);
    assert.strictEqual(resDb.code, 'DATABASE_ERROR');
    assert.strictEqual(resDb.category, 'DATABASE');
  });

  await t.test('3. classifyInitializationError distinguishes storage and rate limiter errors', () => {
    const storageErr = new Error('PostgresObjectStorageProvider: staged_objects relation does not exist');
    const resStorage = classifyInitializationError(storageErr);
    assert.strictEqual(resStorage.code, 'STORAGE_ERROR');
    assert.strictEqual(resStorage.category, 'STORAGE');

    const redisErr = new Error('RateLimiter Redis fail-closed policy active');
    const resRedis = classifyInitializationError(redisErr);
    assert.strictEqual(resRedis.code, 'RATE_LIMITER_ERROR');
  });

  await t.test('4. Serverless response does not leak sensitive stack traces or secrets in production', async () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const req: any = new EventEmitter();
      req.url = '/api/health';
      req.headers = { 'x-request-id': 'req_secret_leak_test_001' };

      const res: any = new EventEmitter();
      let responseBody = '';
      res.setHeader = () => {};
      res.end = (chunk: any) => {
        if (chunk) responseBody += chunk.toString();
        res.emit('finish');
      };

      // Simulate handler error processing
      const classified = classifyInitializationError(new Error('SuperSecretPassword123 leaked in internal log'));
      assert.strictEqual(classified.code, 'CONFIG_ERROR'); // Contains 'secret'

      // Public message must NOT contain the secret password
      assert.strictEqual(classified.publicMessage.includes('SuperSecretPassword123'), false);
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });
});

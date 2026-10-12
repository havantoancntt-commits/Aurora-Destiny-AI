// ==========================================
// AURORA DESTINY AI — VERCEL SERVERLESS ADAPTER INTEGRATION TEST
// Verifies api/index.ts URL normalization, JSON API response integrity,
// prevention of SPA HTML fall-through, and serverless cold-start readiness.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { EventEmitter } from 'node:events';
import handler from '../api/index';

// Mock serverless IncomingMessage & ServerResponse
function createMockRequestResponse(options: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  const req = new EventEmitter() as any;
  req.url = options.url;
  req.method = options.method || 'GET';
  req.socket = { remoteAddress: '127.0.0.1' };
  req.connection = req.socket;
  req.headers = {
    host: 'localhost:3000',
    'x-request-id': 'req_test_vercel_123',
    ...(options.headers || {})
  };

  const res = new EventEmitter() as any;
  res.statusCode = 200;
  res._headers = {} as Record<string, string>;
  res.setHeader = (key: string, value: string) => {
    res._headers[key.toLowerCase()] = value;
  };
  res.getHeader = (key: string) => res._headers[key.toLowerCase()];

  let responseBody = '';
  res.write = (chunk: any) => {
    responseBody += chunk?.toString?.() || '';
  };
  res.end = (chunk?: any) => {
    if (chunk) responseBody += chunk?.toString?.() || '';
    res.emit('finish');
    return res;
  };

  const donePromise = new Promise<{ statusCode: number; headers: Record<string, string>; body: string; json: () => any }>((resolve) => {
    res.on('finish', () => {
      resolve({
        statusCode: res.statusCode,
        headers: res._headers,
        body: responseBody,
        json: () => JSON.parse(responseBody)
      });
    });
  });

  process.nextTick(() => {
    req.emit('end');
  });

  return { req, res, donePromise };
}

test('Vercel Serverless Adapter Suite', async (t) => {
  await t.test('1. Standard /api/health request returns HTTP 200 and JSON status ok', async () => {
    const { req, res, donePromise } = createMockRequestResponse({ url: '/api/health' });
    handler(req, res);
    const result = await donePromise;

    assert.strictEqual(result.statusCode, 200, 'Expected status 200');
    assert.strictEqual(result.headers['content-type']?.includes('application/json'), true, 'Must return JSON');
    const data = result.json();
    assert.strictEqual(data.status, 'ok', 'Status must be ok');
    assert.strictEqual(data.app, 'Aurora Destiny AI', 'App name must match');
  });

  await t.test('2. Rewritten URL with missing /api prefix is automatically normalized', async () => {
    const { req, res, donePromise } = createMockRequestResponse({
      url: '/health',
      headers: { 'x-matched-path': '/api/health' }
    });
    handler(req, res);
    const result = await donePromise;

    assert.strictEqual(result.statusCode, 200);
    const data = result.json();
    assert.strictEqual(data.status, 'ok');
  });

  await t.test('3. Undefined API route returns HTTP 404 JSON (NOT HTML SPA)', async () => {
    const { req, res, donePromise } = createMockRequestResponse({ url: '/api/unknown_route_xyz' });
    handler(req, res);
    const result = await donePromise;

    assert.strictEqual(result.statusCode, 404, 'Must return 404 for unknown API');
    assert.strictEqual(result.headers['content-type']?.includes('application/json'), true, 'Must return JSON 404, not HTML');
    const data = result.json();
    assert.strictEqual(data.error.code, 'API_ENDPOINT_NOT_FOUND');
    assert.strictEqual(result.body.includes('<!DOCTYPE html>'), false, 'Must never leak SPA HTML');
  });

  await t.test('4. Exact /api root returns HTTP 404 JSON (NOT HTML)', async () => {
    const { req, res, donePromise } = createMockRequestResponse({ url: '/api' });
    handler(req, res);
    const result = await donePromise;

    assert.strictEqual(result.statusCode, 404, 'Must return 404 for /api root');
    assert.strictEqual(result.headers['content-type']?.includes('application/json'), true, 'Must return JSON');
    const data = result.json();
    assert.strictEqual(data.error.code, 'API_ENDPOINT_NOT_FOUND');
  });
});

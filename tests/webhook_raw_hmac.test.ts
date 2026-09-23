// ==========================================
// REGRESSION & SECURITY TEST: WEBHOOK RAW HMAC & RECONCILIATION
// Verifies byte-for-byte HMAC-SHA256 signature verification on raw wire payload,
// anti-replay timestamp protection, idempotency key guarantees, and payment reconciliation.
// ==========================================

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';

process.env.DISABLE_SERVER_LISTEN = 'true';
import { app } from '../server';
import { repository } from '../src/db/repository';

describe('Webhook Raw HMAC & Anti-Replay Security Suite', () => {
  let server: http.Server;
  let baseUrl: string;
  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.APP_SECRET || 'aurora_patron_webhook_dev_secret_only';

  before(async () => {
    // Start Express app on ephemeral port
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    setTimeout(() => {
      process.exit(0);
    }, 100);
  });

  function signPayload(rawStringOrBuffer: string | Buffer, secret: string = webhookSecret): string {
    return crypto.createHmac('sha256', secret).update(rawStringOrBuffer).digest('hex');
  }

  async function sendWebhookRequest(options: {
    body?: string | Buffer;
    headers?: Record<string, string>;
  }): Promise<{ status: number; body: any }> {
    const res = await fetch(`${baseUrl}/api/patrons/webhook`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body
    });
    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { status: res.status, body: json };
  }

  it('1. Rejects webhook with missing signature header (401 SIGNATURE_MISSING)', async () => {
    const rawPayload = JSON.stringify({
      idempotencyKey: `key_missing_sig_${Date.now()}`,
      patronId: 'pat_001',
      amount: 100000,
      paymentReference: 'REF_001',
      timestamp: Date.now(),
      provider: 'VIETQR'
    });

    const res = await sendWebhookRequest({ body: rawPayload });
    assert.equal(res.status, 401);
    assert.equal(res.body?.error?.code, 'SIGNATURE_MISSING');
  });

  it('2. Rejects webhook with malformed or incorrect signature (401 INVALID_SIGNATURE)', async () => {
    const rawPayload = JSON.stringify({
      idempotencyKey: `key_malformed_sig_${Date.now()}`,
      patronId: 'pat_001',
      amount: 100000,
      paymentReference: 'REF_002',
      timestamp: Date.now(),
      provider: 'VIETQR'
    });

    const res = await sendWebhookRequest({
      body: rawPayload,
      headers: { 'x-aurora-signature': 'deadbeefinvalidhash' }
    });
    assert.equal(res.status, 401);
    assert.equal(res.body?.error?.code, 'INVALID_SIGNATURE');
  });

  it('3. Rejects webhook signed with an incorrect secret (401 INVALID_SIGNATURE)', async () => {
    const rawPayload = JSON.stringify({
      idempotencyKey: `key_wrong_secret_${Date.now()}`,
      patronId: 'pat_001',
      amount: 100000,
      paymentReference: 'REF_003',
      timestamp: Date.now(),
      provider: 'VIETQR'
    });
    const fakeSig = signPayload(rawPayload, 'wrong_untrusted_secret_key');

    const res = await sendWebhookRequest({
      body: rawPayload,
      headers: { 'x-aurora-signature': fakeSig }
    });
    assert.equal(res.status, 401);
    assert.equal(res.body?.error?.code, 'INVALID_SIGNATURE');
  });

  it('4. Rejects webhook with modified body payload after signature generation (401 INVALID_SIGNATURE)', async () => {
    const original = {
      idempotencyKey: `key_tamper_${Date.now()}`,
      patronId: 'pat_001',
      amount: 500000,
      paymentReference: 'REF_TAMPER_001',
      timestamp: Date.now(),
      provider: 'VIETQR'
    };
    const rawSigned = JSON.stringify(original);
    const validSig = signPayload(rawSigned);

    // Attacker modifies amount in payload from 500000 to 5000
    const tamperedPayload = JSON.stringify({ ...original, amount: 5000 });

    const res = await sendWebhookRequest({
      body: tamperedPayload,
      headers: { 'x-aurora-signature': validSig }
    });
    assert.equal(res.status, 401);
    assert.equal(res.body?.error?.code, 'INVALID_SIGNATURE');
  });

  it('5. Rejects webhook with modified patronId after signature generation (401 INVALID_SIGNATURE)', async () => {
    const original = {
      idempotencyKey: `key_tamper_patron_${Date.now()}`,
      patronId: 'pat_victim_001',
      amount: 100000,
      paymentReference: 'REF_TAMPER_002',
      timestamp: Date.now(),
      provider: 'VIETQR'
    };
    const validSig = signPayload(JSON.stringify(original));
    const tamperedPayload = JSON.stringify({ ...original, patronId: 'pat_attacker_002' });

    const res = await sendWebhookRequest({
      body: tamperedPayload,
      headers: { 'x-aurora-signature': validSig }
    });
    assert.equal(res.status, 401);
    assert.equal(res.body?.error?.code, 'INVALID_SIGNATURE');
  });

  it('6. Rejects webhook with modified timestamp after signature generation (401 INVALID_SIGNATURE)', async () => {
    const original = {
      idempotencyKey: `key_tamper_time_${Date.now()}`,
      patronId: 'pat_001',
      amount: 100000,
      paymentReference: 'REF_TAMPER_003',
      timestamp: Date.now(),
      provider: 'VIETQR'
    };
    const validSig = signPayload(JSON.stringify(original));
    const tamperedPayload = JSON.stringify({ ...original, timestamp: Date.now() - 1000 });

    const res = await sendWebhookRequest({
      body: tamperedPayload,
      headers: { 'x-aurora-signature': validSig }
    });
    assert.equal(res.status, 401);
    assert.equal(res.body?.error?.code, 'INVALID_SIGNATURE');
  });

  it('7. Rejects webhook with future timestamp > 60 seconds (400 FUTURE_TIMESTAMP)', async () => {
    const futurePayload = JSON.stringify({
      idempotencyKey: `key_future_${Date.now()}`,
      patronId: 'pat_001',
      amount: 100000,
      paymentReference: 'REF_FUTURE_001',
      timestamp: Date.now() + 120000, // 2 minutes in future
      provider: 'VIETQR'
    });
    const sig = signPayload(futurePayload);

    const res = await sendWebhookRequest({
      body: futurePayload,
      headers: { 'x-aurora-signature': sig }
    });
    assert.equal(res.status, 400);
    assert.equal(res.body?.error?.code, 'FUTURE_TIMESTAMP');
  });

  it('8. Rejects webhook with expired timestamp > 5 minutes (400 REPLAY_WINDOW_EXPIRED)', async () => {
    const expiredPayload = JSON.stringify({
      idempotencyKey: `key_expired_${Date.now()}`,
      patronId: 'pat_001',
      amount: 100000,
      paymentReference: 'REF_EXPIRED_001',
      timestamp: Date.now() - (6 * 60 * 1000), // 6 minutes ago
      provider: 'VIETQR'
    });
    const sig = signPayload(expiredPayload);

    const res = await sendWebhookRequest({
      body: expiredPayload,
      headers: { 'x-aurora-signature': sig }
    });
    assert.equal(res.status, 400);
    assert.equal(res.body?.error?.code, 'REPLAY_WINDOW_EXPIRED');
  });

  it('9. Rejects webhook with empty body (400 EMPTY_BODY)', async () => {
    const sig = signPayload('');
    const res = await sendWebhookRequest({
      body: '',
      headers: { 'x-aurora-signature': sig }
    });
    assert.equal(res.status, 400);
    assert.equal(res.body?.error?.code, 'EMPTY_BODY');
  });

  it('10. Rejects webhook with malformed JSON body after valid HMAC signature (400 INVALID_JSON)', async () => {
    const malformedBody = '{"idempotencyKey": "test", broken_json_no_quotes:';
    const sig = signPayload(malformedBody);

    const res = await sendWebhookRequest({
      body: malformedBody,
      headers: { 'x-aurora-signature': sig }
    });
    assert.equal(res.status, 400);
    assert.equal(res.body?.error?.code, 'INVALID_JSON');
  });

  it('11. Processes authentic webhook successfully and reconciles patron verification (200 OK)', async () => {
    const ref = `TX_LEGIT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    // Create registered patron in PENDING state
    const createdPatron = await repository.createPatron({
      name: 'Trần Thị Mai',
      tier: 'vang',
      amount: 250000,
      paymentReference: ref,
      status: 'PENDING',
      verificationType: 'UNVERIFIED'
    });

    const payload = JSON.stringify({
      idempotencyKey: `idemp_legit_${Date.now()}`,
      patronId: createdPatron.id,
      amount: 250000,
      paymentReference: ref,
      timestamp: Date.now(),
      provider: 'VIETQR'
    });
    const sig = signPayload(payload);

    const res = await sendWebhookRequest({
      body: payload,
      headers: { 'x-aurora-signature': sig }
    });

    assert.equal(res.status, 200);
    assert.equal(res.body?.success, true);
    assert.equal(res.body?.status, 'VERIFIED');

    // Confirm patron status in repository is VERIFIED
    const verifiedPatron = await repository.getPatronById(createdPatron.id);
    assert.ok(verifiedPatron);
    assert.equal(verifiedPatron.status, 'VERIFIED');
    assert.equal(verifiedPatron.verificationType, 'WEBHOOK_VERIFIED');
  });

  it('12. Enforces idempotency on replayed identical webhook (200 ALREADY_PROCESSED)', async () => {
    const ref = `TX_IDEMP_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const patron = await repository.createPatron({
      name: 'Lê Hoàng',
      tier: 'bac',
      amount: 150000,
      paymentReference: ref,
      status: 'PENDING',
      verificationType: 'UNVERIFIED'
    });

    const idempKey = `idemp_replay_key_${Date.now()}`;
    const payload = JSON.stringify({
      idempotencyKey: idempKey,
      patronId: patron.id,
      amount: 150000,
      paymentReference: ref,
      timestamp: Date.now(),
      provider: 'MOMO'
    });
    const sig = signPayload(payload);

    // 1st request -> Successfully processed
    const firstRes = await sendWebhookRequest({ body: payload, headers: { 'x-aurora-signature': sig } });
    assert.equal(firstRes.status, 200);
    assert.equal(firstRes.body?.status, 'VERIFIED');

    // 2nd request with exact same idempotencyKey and payload -> ALREADY_PROCESSED
    const secondRes = await sendWebhookRequest({ body: payload, headers: { 'x-aurora-signature': sig } });
    assert.equal(secondRes.status, 200);
    assert.equal(secondRes.body?.status, 'ALREADY_PROCESSED');
  });

  it('13. Rejects replayed idempotencyKey with conflicting payload (409 IDEMPOTENCY_KEY_PAYLOAD_MISMATCH)', async () => {
    const ref = `TX_CONF_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const patron1 = await repository.createPatron({
      name: 'Võ Tấn Phát',
      tier: 'vang',
      amount: 300000,
      paymentReference: ref,
      status: 'PENDING',
      verificationType: 'UNVERIFIED'
    });

    const sharedKey = `shared_idemp_key_${Date.now()}`;
    const payloadA = JSON.stringify({
      idempotencyKey: sharedKey,
      patronId: patron1.id,
      amount: 300000,
      paymentReference: ref,
      timestamp: Date.now(),
      provider: 'ZALOPAY'
    });
    const sigA = signPayload(payloadA);

    // Process payload A
    const resA = await sendWebhookRequest({ body: payloadA, headers: { 'x-aurora-signature': sigA } });
    assert.equal(resA.status, 200);

    // Attacker or bug reuses sharedKey with a different payload (e.g. different amount)
    const payloadB = JSON.stringify({
      idempotencyKey: sharedKey,
      patronId: patron1.id,
      amount: 600000,
      paymentReference: ref,
      timestamp: Date.now(),
      provider: 'ZALOPAY'
    });
    const sigB = signPayload(payloadB);

    const resB = await sendWebhookRequest({ body: payloadB, headers: { 'x-aurora-signature': sigB } });
    assert.equal(resB.status, 409);
    assert.equal(resB.body?.error?.code, 'IDEMPOTENCY_KEY_PAYLOAD_MISMATCH');
  });

  it('14. Payment Reconciliation: rejects underpayment (400 AMOUNT_MISMATCH)', async () => {
    const ref = `TX_UNDERPAY_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const patron = await repository.createPatron({
      name: 'Đặng Thùy Trang',
      tier: 'kim_cuong',
      amount: 500000, // Registered expected amount: 500k
      paymentReference: ref,
      status: 'PENDING',
      verificationType: 'UNVERIFIED'
    });

    const payload = JSON.stringify({
      idempotencyKey: `idemp_underpay_${Date.now()}`,
      patronId: patron.id,
      amount: 50000, // Webhook sends only 50k
      paymentReference: ref,
      timestamp: Date.now(),
      provider: 'VIETQR'
    });
    const sig = signPayload(payload);

    const res = await sendWebhookRequest({ body: payload, headers: { 'x-aurora-signature': sig } });
    assert.equal(res.status, 400);
    assert.equal(res.body?.error?.code, 'AMOUNT_MISMATCH');
  });

  it('15. Payment Reconciliation: rejects duplicate payment reference (400 DUPLICATE_PAYMENT_REFERENCE)', async () => {
    const sharedRef = `REF_EXCLUSIVE_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    // First patron claims payment reference
    await repository.createPatron({
      name: 'Patron 1',
      tier: 'dong',
      amount: 100000,
      paymentReference: sharedRef,
      status: 'VERIFIED',
      verificationType: 'WEBHOOK_VERIFIED'
    });

    // Second patron tries to reuse sharedRef
    const patron2 = await repository.createPatron({
      name: 'Patron 2',
      tier: 'dong',
      amount: 100000,
      paymentReference: `REF_OTHER_${Date.now()}`,
      status: 'PENDING',
      verificationType: 'UNVERIFIED'
    });

    const payload = JSON.stringify({
      idempotencyKey: `idemp_dupref_${Date.now()}`,
      patronId: patron2.id,
      amount: 100000,
      paymentReference: sharedRef, // Claimed by patron 1
      timestamp: Date.now(),
      provider: 'VIETQR'
    });
    const sig = signPayload(payload);

    const res = await sendWebhookRequest({ body: payload, headers: { 'x-aurora-signature': sig } });
    assert.equal(res.status, 400);
    assert.equal(res.body?.error?.code, 'DUPLICATE_PAYMENT_REFERENCE');
  });

  it('16. Concurrency Stress: 5 parallel identical webhook invocations execute safely with exactly 1 verification', async () => {
    const ref = `TX_CONCURRENT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const patron = await repository.createPatron({
      name: 'Concurrency Patron',
      tier: 'bac',
      amount: 200000,
      paymentReference: ref,
      status: 'PENDING',
      verificationType: 'UNVERIFIED'
    });

    const sharedKey = `idemp_concurrent_key_${Date.now()}`;
    const payload = JSON.stringify({
      idempotencyKey: sharedKey,
      patronId: patron.id,
      amount: 200000,
      paymentReference: ref,
      timestamp: Date.now(),
      provider: 'VIETQR'
    });
    const sig = signPayload(payload);

    // Fire 5 identical requests in parallel
    const promises = Array.from({ length: 5 }).map(() =>
      sendWebhookRequest({ body: payload, headers: { 'x-aurora-signature': sig } })
    );

    const results = await Promise.all(promises);

    // All must be 200 OK (no 500 errors or unhandled crashes)
    for (const r of results) {
      assert.equal(r.status, 200);
    }

    const verifiedCount = results.filter(r => r.body?.status === 'VERIFIED').length;
    const alreadyProcessedCount = results.filter(r => r.body?.status === 'ALREADY_PROCESSED').length;

    assert.equal(verifiedCount, 1, 'Exactly one concurrent request must commit the verification');
    assert.equal(alreadyProcessedCount, 4, 'All subsequent concurrent requests must be acknowledged as ALREADY_PROCESSED');
  });
});

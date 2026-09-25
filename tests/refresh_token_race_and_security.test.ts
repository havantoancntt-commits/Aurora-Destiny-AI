// ==========================================
// AURORA DESTINY AI — REFRESH TOKEN RACE CONDITIONS & SECURITY TEST SUITE
// Tests all 12 critical concurrency, replay, token family, and revocation cases
// ==========================================

import assert from 'assert';
import crypto from 'crypto';
import {
  registerUserAsync,
  createApiSessionAsync,
  rotateRefreshTokenAsync,
  revokeSessionAsync,
  getSessionUserAsync,
  SHORT_LIVED_ACCESS_TOKEN_TTL_MS
} from '../src/server/auth';
import { repository } from '../src/db/repository';

async function runRefreshTokenRaceAndSecuritySuite() {
  console.log('🛡️ Starting Refresh Token Race Conditions & Security Test Suite...');

  // Helper to create test user
  const email = `test_token_race_${Date.now()}_${crypto.randomBytes(4).toString('hex')}@aurora.internal`;
  const regResult = await registerUserAsync(email, 'StrongP@ssw0rd!2026', 'Token Race User', 'USER', 'api');
  const userId = regResult.user.id;

  // ----------------------------------------------------
  // Test 1: Normal Refresh Flow
  // ----------------------------------------------------
  console.log('▶ Test 1: Normal Refresh Token Rotation');
  const initialPair = await createApiSessionAsync(userId, false);
  assert(initialPair.accessToken.startsWith('aurora_at_'));
  assert(initialPair.refreshToken.startsWith('aurora_rt_'));

  const rotatedPair1 = await rotateRefreshTokenAsync(initialPair.refreshToken);
  assert(rotatedPair1.accessToken.startsWith('aurora_at_'));
  assert(rotatedPair1.refreshToken.startsWith('aurora_rt_'));
  assert.notStrictEqual(rotatedPair1.accessToken, initialPair.accessToken, 'Rotated access token must be unique');
  assert.notStrictEqual(rotatedPair1.refreshToken, initialPair.refreshToken, 'Rotated refresh token must be unique');

  // Verify new access token works for authenticating user
  const user1 = await getSessionUserAsync(rotatedPair1.accessToken);
  assert(user1 !== null, 'Rotated access token must authenticate user');
  assert.strictEqual(user1?.id, userId);
  console.log('  ✔ Normal refresh succeeded with unique token pair and valid user session.');

  // ----------------------------------------------------
  // Test 2: Expired Refresh Token
  // ----------------------------------------------------
  console.log('▶ Test 2: Expired Refresh Token Handling');
  const expiredPair = await createApiSessionAsync(userId, false);
  const expiredSession = await repository.getSession(expiredPair.refreshToken);
  assert(expiredSession !== null);
  expiredSession.expiresAt = Date.now() - 1000; // Force past
  await repository.saveSession(expiredSession);

  let expiredFailed = false;
  try {
    await rotateRefreshTokenAsync(expiredPair.refreshToken);
  } catch (err: any) {
    expiredFailed = true;
    assert(
      err.message.includes('hết hạn') || err.message.includes('thu hồi') || err.message.includes('không hợp lệ'),
      `Expected expiration/revocation message, got: ${err.message}`
    );
  }
  assert.strictEqual(expiredFailed, true, 'Expired refresh token must be rejected');
  console.log('  ✔ Expired refresh token correctly rejected.');

  // ----------------------------------------------------
  // Test 3: Revoked Refresh Token
  // ----------------------------------------------------
  console.log('▶ Test 3: Revoked Refresh Token Handling');
  const pairToRevoke = await createApiSessionAsync(userId, false);
  await revokeSessionAsync(pairToRevoke.refreshToken);

  let revokedFailed = false;
  try {
    await rotateRefreshTokenAsync(pairToRevoke.refreshToken);
  } catch (err: any) {
    revokedFailed = true;
  }
  assert.strictEqual(revokedFailed, true, 'Revoked refresh token must be rejected');
  console.log('  ✔ Explicitly revoked refresh token cannot be rotated.');

  // ----------------------------------------------------
  // Test 4: Replay Attack Detection & Token Family Invalidation
  // ----------------------------------------------------
  console.log('▶ Test 4: Replay Attack Detection & Family Invalidation');
  const pairA = await createApiSessionAsync(userId, false);
  // Legitimate client rotates pairA -> gets pairB
  const pairB = await rotateRefreshTokenAsync(pairA.refreshToken);
  assert(pairB.accessToken);

  // Wait 2.1 seconds for in-flight mutex to clear
  await new Promise(r => setTimeout(r, 2100));

  // Attacker attempts to replay old pairA.refreshToken!
  let replayCaught = false;
  try {
    await rotateRefreshTokenAsync(pairA.refreshToken);
  } catch (err: any) {
    replayCaught = true;
    assert(err.message.includes('Replay Attack') || err.message.includes('đã từng sử dụng'), `Expected replay warning, got: ${err.message}`);
  }
  assert.strictEqual(replayCaught, true, 'Replay of old refresh token must be caught as Replay Attack');

  // Verify entire token family was invalidated as a security countermeasure
  const sessionB = await repository.getSession(pairB.refreshToken);
  assert(sessionB === null || sessionB.revokedAt !== null, 'Pair B should be invalidated after replay attack detection');
  console.log('  ✔ Replay attack strictly detected and compromised token family revoked.');

  // ----------------------------------------------------
  // Test 5 & 6: Concurrent Refresh Requests (Race Condition & Deduplication)
  // ----------------------------------------------------
  console.log('▶ Test 5 & 6: Concurrent Refresh with Identical Token');
  const racePair = await createApiSessionAsync(userId, false);
  const [resA, resB] = await Promise.all([
    rotateRefreshTokenAsync(racePair.refreshToken),
    rotateRefreshTokenAsync(racePair.refreshToken)
  ]);

  // Both concurrent calls must receive the same valid atomic rotated pair (deduplicated)
  assert.strictEqual(resA.refreshToken, resB.refreshToken, 'Concurrent rotation must yield consistent token without divergence');
  assert.strictEqual(resA.accessToken, resB.accessToken);

  const authUserAfterRace = await getSessionUserAsync(resA.accessToken);
  assert(authUserAfterRace !== null, 'Rotated token from concurrent race must be valid');
  console.log('  ✔ Concurrent refresh race condition safely handled with zero divergent tokens.');

  // ----------------------------------------------------
  // Test 7: Late Out-of-Order Refresh Request
  // ----------------------------------------------------
  console.log('▶ Test 7: Late Out-of-Order Refresh Rejection');
  const sequencePair = await createApiSessionAsync(userId, false);
  const nextPair = await rotateRefreshTokenAsync(sequencePair.refreshToken);
  await new Promise(r => setTimeout(r, 2100));

  let outOfOrderRejected = false;
  try {
    await rotateRefreshTokenAsync(sequencePair.refreshToken);
  } catch (err: any) {
    outOfOrderRejected = true;
  }
  assert.strictEqual(outOfOrderRejected, true, 'Late arrival of already-rotated token must be rejected');
  console.log('  ✔ Out-of-order late refresh correctly rejected.');

  // ----------------------------------------------------
  // Test 8: Logout Invalidation
  // ----------------------------------------------------
  console.log('▶ Test 8: Logout Invalidation of Refresh Token');
  const logoutPair = await createApiSessionAsync(userId, false);
  await revokeSessionAsync(logoutPair.accessToken);

  // Both access and refresh tokens should be invalidated
  const userAfterLogout = await getSessionUserAsync(logoutPair.accessToken);
  assert.strictEqual(userAfterLogout, null, 'Logged out access token cannot authenticate');

  let logoutRefreshFailed = false;
  try {
    await rotateRefreshTokenAsync(logoutPair.refreshToken);
  } catch {
    logoutRefreshFailed = true;
  }
  assert.strictEqual(logoutRefreshFailed, true, 'Refresh token associated with logged out session must fail');
  console.log('  ✔ Logout revokes credentials completely.');

  // ----------------------------------------------------
  // Test 9: Password Reset Session Purge
  // ----------------------------------------------------
  console.log('▶ Test 9: Password Reset Invalidation');
  const resetUserPair = await createApiSessionAsync(userId, false);
  await repository.revokeUserSessions(userId);

  let resetRefreshFailed = false;
  try {
    await rotateRefreshTokenAsync(resetUserPair.refreshToken);
  } catch {
    resetRefreshFailed = true;
  }
  assert.strictEqual(resetRefreshFailed, true, 'Password reset session purge must reject refresh');
  console.log('  ✔ Password reset invalidates all active user sessions and refresh tokens.');

  // ----------------------------------------------------
  // Test 10: Malformed Token Format Defense
  // ----------------------------------------------------
  console.log('▶ Test 10: Malformed Token Format Defense');
  const invalidTokens = ['', ' ', 'invalid_prefix', 'aurora_at_123', 'aurora_sess_123', 'null', 'undefined'];
  for (const badToken of invalidTokens) {
    let failed = false;
    try {
      await rotateRefreshTokenAsync(badToken);
    } catch {
      failed = true;
    }
    assert.strictEqual(failed, true, `Malformed token "${badToken}" must be rejected`);
  }
  console.log('  ✔ Malformed token formats strictly rejected.');

  // ----------------------------------------------------
  // Test 11: Token Family Tracking Invariant
  // ----------------------------------------------------
  console.log('▶ Test 11: Token Family Lineage Invariant');
  const familyPair0 = await createApiSessionAsync(userId, false);
  const session0 = await repository.getSession(familyPair0.refreshToken);
  assert(session0?.tokenFamily, 'Initial session must be assigned a tokenFamily');

  const familyPair1 = await rotateRefreshTokenAsync(familyPair0.refreshToken);
  const session1 = await repository.getSession(familyPair1.refreshToken);
  assert.strictEqual(session1?.tokenFamily, session0?.tokenFamily, 'Rotated token must inherit tokenFamily lineage');
  console.log('  ✔ Token family lineage preserved across authentic rotations.');

  // ----------------------------------------------------
  // Test 12: Network Retry Within Window
  // ----------------------------------------------------
  console.log('▶ Test 12: Idempotent Retry Within In-Flight Window');
  const retryPair = await createApiSessionAsync(userId, false);
  // Simulate first call starting
  const call1 = rotateRefreshTokenAsync(retryPair.refreshToken);
  // Simulate immediate retry before call1 finishes (e.g. client timeout or network glitch)
  const call2 = rotateRefreshTokenAsync(retryPair.refreshToken);

  const [pair1Res, pair2Res] = await Promise.all([call1, call2]);
  assert.strictEqual(pair1Res.refreshToken, pair2Res.refreshToken, 'Network retry must return identical token pair without divergence');
  console.log('  ✔ Network retry safely resolved idempotently.');

  console.log('\n🎉 ALL 12 REFRESH TOKEN RACE & SECURITY TESTS PASSED 100%!\n');
}

runRefreshTokenRaceAndSecuritySuite().catch((err) => {
  console.error('❌ Refresh Token Race Test Failed:', err);
  process.exit(1);
});

// ==========================================================
// AUTHENTICATION MODES & TOKEN ROTATION SUITE
// Tests Browser mode (HttpOnly cookie, no credential leak in JS),
// Mobile/API mode (short-lived access token, refresh token),
// Refresh Token Rotation, anti-replay, and session invalidation.
// ==========================================================

import assert from 'assert';
import {
  registerUserAsync,
  loginUserAsync,
  createGuestSessionAsync,
  rotateRefreshTokenAsync,
  createApiSessionAsync,
  revokeSessionAsync,
  resetPasswordWithTokenAsync,
  requestPasswordResetAsync
} from '../src/server/auth';
import { repository } from '../src/db/repository';

async function runAuthModesSuite() {
  console.log('🧪 Starting Authentication Modes & Token Rotation Verification Suite...');

  const uniqueId = Date.now();
  const emailBrowser = `user_browser_${uniqueId}@aurora.test`;
  const emailApi = `user_api_${uniqueId}@aurora.test`;
  const password = 'StrongPassword123!@#';

  // ----------------------------------------------------
  // 1. BROWSER MODE: COOKIE-BASED SESSION
  // ----------------------------------------------------
  console.log('\n--- Test Group 1: Browser Mode ---');
  const regBrowser = await registerUserAsync(emailBrowser, password, 'Browser User', 'USER', 'browser');
  assert.strictEqual(regBrowser.sessionMode, 'cookie', 'Browser mode must indicate cookie sessionMode');
  assert.strictEqual(regBrowser.user.email, emailBrowser);
  assert(regBrowser.token, 'Token must be provided for server to set HttpOnly cookie');

  // Verify login in browser mode with session rotation
  const guestSess = await createGuestSessionAsync('browser');
  assert.strictEqual(guestSess.sessionMode, 'cookie');

  const loginBrowser = await loginUserAsync(emailBrowser, password, guestSess.token, 'browser');
  assert.strictEqual(loginBrowser.sessionMode, 'cookie', 'Login in browser mode must use cookie sessionMode');
  assert.strictEqual(loginBrowser.user.id, regBrowser.user.id);

  // Verify old guest session was revoked upon login (Session Fixation Defense)
  const oldGuestLookup = await repository.getSession(guestSess.token);
  assert.strictEqual(oldGuestLookup, null, 'Old guest session token must be revoked after login');
  console.log('  ✔ Browser mode registration, login, and session rotation verified.');

  // ----------------------------------------------------
  // 2. MOBILE / API MODE: SHORT-LIVED ACCESS + REFRESH TOKEN
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Mobile/API Mode ---');
  const regApi = await registerUserAsync(emailApi, password, 'API User', 'USER', 'api');
  assert.strictEqual(regApi.sessionMode, 'token', 'API mode must indicate token sessionMode');
  assert(regApi.accessToken && regApi.accessToken.startsWith('aurora_at_'), 'Access token must have aurora_at_ prefix');
  assert(regApi.refreshToken && regApi.refreshToken.startsWith('aurora_rt_'), 'Refresh token must have aurora_rt_ prefix');
  assert.strictEqual(regApi.expiresIn, 900, 'Access token TTL must be 900 seconds (15 minutes)');

  // Verify API login
  const loginApi = await loginUserAsync(emailApi, password, undefined, 'api');
  assert.strictEqual(loginApi.sessionMode, 'token');
  assert(loginApi.accessToken?.startsWith('aurora_at_'));
  assert(loginApi.refreshToken?.startsWith('aurora_rt_'));
  console.log('  ✔ Mobile/API mode returns separate short-lived access and refresh tokens.');

  // ----------------------------------------------------
  // 3. REFRESH TOKEN ROTATION & ANTI-REPLAY
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: Refresh Token Rotation & Anti-Replay ---');
  const initialRefresh = loginApi.refreshToken!;
  const initialAccess = loginApi.accessToken!;

  // Refresh rotation
  const rotated = await rotateRefreshTokenAsync(initialRefresh);
  assert(rotated.accessToken && rotated.accessToken.startsWith('aurora_at_'));
  assert(rotated.refreshToken && rotated.refreshToken.startsWith('aurora_rt_'));
  assert.notStrictEqual(rotated.accessToken, initialAccess, 'Rotated access token must be fresh');
  assert.notStrictEqual(rotated.refreshToken, initialRefresh, 'Rotated refresh token must be fresh');
  console.log('  ✔ Refresh token rotation issued brand new access and refresh token pair.');

  // Anti-replay: attempting to reuse old refresh token must be rejected
  let reuseFailed = false;
  try {
    await rotateRefreshTokenAsync(initialRefresh);
  } catch (err: any) {
    reuseFailed = true;
    assert(err.message.includes('không hợp lệ') || err.message.includes('thu hồi'));
  }
  assert.strictEqual(reuseFailed, true, 'Re-using revoked refresh token must be strictly rejected');
  console.log('  ✔ Anti-replay defense: Consumed refresh token cannot be reused.');

  // Malformed refresh token rejection
  let malformedFailed = false;
  try {
    await rotateRefreshTokenAsync('invalid_prefix_token_123');
  } catch {
    malformedFailed = true;
  }
  assert.strictEqual(malformedFailed, true, 'Malformed refresh token must be rejected');
  console.log('  ✔ Malformed refresh tokens rejected.');

  // ----------------------------------------------------
  // 4. LOGOUT & REVOCATION
  // ----------------------------------------------------
  console.log('\n--- Test Group 4: Logout & Session Invalidation ---');
  const activeSess = await repository.getSession(rotated.accessToken);
  assert(activeSess !== null, 'Rotated access session must be active before logout');

  const revoked = await revokeSessionAsync(rotated.accessToken);
  assert.strictEqual(revoked, true, 'revokeSessionAsync must return true');

  const afterRevoke = await repository.getSession(rotated.accessToken);
  assert.strictEqual(afterRevoke, null, 'Session must be null after revocation');
  console.log('  ✔ Session revocation and logout verified.');

  // ----------------------------------------------------
  // 5. PASSWORD RESET INVALIDATES ACTIVE SESSIONS
  // ----------------------------------------------------
  console.log('\n--- Test Group 5: Password Reset Session Purge ---');
  // Create active session for API user
  const newApiSession = await createApiSessionAsync(regApi.user.id, false);
  const sessCheck = await repository.getSession(newApiSession.accessToken);
  assert(sessCheck !== null, 'Session must be active before password reset');

  // Request password reset
  const resetReq = await requestPasswordResetAsync(emailApi);
  assert(resetReq && resetReq.resetToken);

  // Complete password reset
  const resetSuccess = await resetPasswordWithTokenAsync(resetReq.resetToken, 'NewPassword999!@#');
  assert.strictEqual(resetSuccess, true, 'Password reset must succeed');

  // Verify previous sessions were completely purged upon password reset
  const postResetCheck = await repository.getSession(newApiSession.accessToken);
  assert.strictEqual(postResetCheck, null, 'Active sessions must be invalidated upon password reset');
  console.log('  ✔ Password reset invalidates all existing active sessions.');

  console.log('\n🎉 All Authentication Modes & Token Rotation tests PASSED!\n');
}

runAuthModesSuite().catch(err => {
  console.error('❌ Authentication Modes Test Suite Failed:', err);
  process.exit(1);
});

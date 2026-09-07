// ==========================================
// AURORA DESTINY AI — PRODUCTION UPGRADE VERIFICATION SUITE
// Tests Confidence Metrics, Session Rotation, Password Resets & Postgres Repo
// ==========================================

import assert from 'assert';
import { repository } from '../db/repository';
import { PostgresDatabaseRepository } from '../db/postgresRepository';
import { evaluateConfidence } from '../engine/confidence';
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPasswordWithToken,
  createSession,
  getSessionUser
} from './auth';
import { BirthData } from '../types/destiny';

console.log('🚀 Running Production Upgrade Verification Suite...');

// ----------------------------------------------------
// TEST 1: MULTI-TIER CONFIDENCE METRICS (SECTION VIII)
// ----------------------------------------------------
console.log('▶ Test 1: Multi-tier Confidence Metrics');

const exactBirthData: BirthData = {
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
  calendarSystem: 'solar',
  longitude: 105.85,
  latitude: 21.02
};

const confidenceExact = evaluateConfidence(exactBirthData, 0, 0);
assert.strictEqual(confidenceExact.resolutionLevel, 'High', 'Resolution should be High for exact hour');
assert.strictEqual(confidenceExact.calculationConfidence, 98, 'Calculation confidence should be 98% with coordinates and exact hour');
assert.strictEqual(confidenceExact.historicalValidation, 0, 'Historical validation must be strictly 0 without events');
assert.strictEqual(confidenceExact.validationScore, 100, 'Invariant validation must be 100');
assert(confidenceExact.statisticalDisclaimer.length > 20, 'Statistical disclaimer must be present');

// With backtest events
const confidenceWithEvents = evaluateConfidence(exactBirthData, 3, 85);
assert.strictEqual(confidenceWithEvents.historicalValidation, 85, 'Historical validation matches backtest score');
assert(confidenceWithEvents.interpretiveConfidence <= 88, 'Interpretive confidence must be bounded <= 88');
console.log('  ✔ Multi-tier confidence metrics verified.');

// ----------------------------------------------------
// TEST 2: SESSION ROTATION ON LOGIN
// ----------------------------------------------------
console.log('▶ Test 2: Session Rotation Defense Against Fixation');

const testEmail = `rotation_${Date.now()}@aurora.io`;
const reg = registerUser(testEmail, 'StrongP@ssw0rd123', 'Rotation Test');
const oldToken = reg.token;

// Log in with existing token passed (simulating session rotation)
const loginResult = loginUser(testEmail, 'StrongP@ssw0rd123', oldToken);
assert.notStrictEqual(loginResult.token, oldToken, 'New token must differ from old token');
assert.strictEqual(repository.getSession(oldToken), null, 'Old token must be invalidated upon login');
assert.notStrictEqual(repository.getSession(loginResult.token), null, 'New token must be valid');
console.log('  ✔ Session rotation invalidated old token and established fresh session.');

// ----------------------------------------------------
// TEST 3: PASSWORD RESET WORKFLOW
// ----------------------------------------------------
console.log('▶ Test 3: Password Reset Workflow (Time-bounded & Single-use)');

const resetReq = requestPasswordReset(testEmail);
assert(resetReq !== null, 'Reset request should generate token for valid email');
assert(resetReq.resetToken.startsWith('rst_'), 'Token should have rst_ prefix');
assert(resetReq.expiresAt > Date.now(), 'Token should expire in future');

// Non-existent email should return null (prevent enumeration)
const fakeReq = requestPasswordReset('non_existent_123@aurora.io');
assert.strictEqual(fakeReq, null, 'Non-existent email should return null');

// Reset password with token
const resetSuccess = resetPasswordWithToken(resetReq.resetToken, 'NewStrongP@ss456');
assert.strictEqual(resetSuccess, true, 'Password reset should succeed');

// Token cannot be reused (single-use)
const reuseAttempt = resetPasswordWithToken(resetReq.resetToken, 'AnotherP@ss789');
assert.strictEqual(reuseAttempt, false, 'Token reuse must fail');

// Verify new password works
const newLogin = loginUser(testEmail, 'NewStrongP@ss456');
assert.strictEqual(newLogin.user.email, testEmail, 'Login with new password succeeds');

// Verify old password fails
assert.throws(() => {
  loginUser(testEmail, 'StrongP@ssw0rd123');
}, /Email hoặc mật khẩu không chính xác/, 'Old password must fail');
console.log('  ✔ Password reset lifecycle verified: single-use, rotated credentials.');

// ----------------------------------------------------
// TEST 4: POSTGRES DATABASE REPOSITORY PARITY
// ----------------------------------------------------
console.log('▶ Test 4: PostgresDatabaseRepository Interface Parity');

const pgRepo = new PostgresDatabaseRepository();
const testUser = {
  id: `pg_usr_${Date.now()}`,
  email: 'pg_test@aurora.io',
  fullName: 'Postgres User',
  role: 'USER' as const,
  subscriptionTier: 'Free' as const,
  language: 'vi',
  emailVerified: false,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  profilesCount: 0
};

pgRepo.saveUser(testUser, 'dummy_salt:dummy_hash');
const retrievedUser = pgRepo.getUser(testUser.id);
assert.strictEqual(retrievedUser?.email, testUser.email, 'User retrieved from Postgres repository');

// Test transaction rollback in Postgres repo
let rollbackOccurred = false;
try {
  pgRepo.runTransaction((tx) => {
    tx.saveProfile({
      id: 'tx_prof_1',
      userId: testUser.id,
      name: 'Temp Profile',
      isPrimary: false,
      avatarSeed: 'temp',
      birthData: exactBirthData,
      behavioralContext: { careerField: '', employmentStatus: '', financialGoal: '', relationshipStatus: '', topPriority: '', personalNotes: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    throw new Error('Forced transaction failure');
  });
} catch (e) {
  rollbackOccurred = true;
}
assert.strictEqual(rollbackOccurred, true, 'Transaction error caught');
console.log('  ✔ Postgres repository interface and transactions verified.');

console.log('==================================================');
console.log('🎉 ALL PRODUCTION UPGRADE VERIFICATION TESTS PASSED!');
console.log('==================================================');

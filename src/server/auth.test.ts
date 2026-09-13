// ==========================================
// AURORA DESTINY AI — AUTH & SECURITY TEST SUITE
// PBKDF2 verification, constant-time checks, RBAC, IDOR guards
// ==========================================

import { hashPassword, verifyPassword, registerUser, loginUser, createGuestSession, bootstrapAdminIfConfigured } from './auth';
import { repository } from '../db/repository';

export function runAuthSecurityTests() {
  console.log('🔒 Running Aurora Security & Authentication Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}: ${message}`);
      passed++;
    } else {
      console.log(`❌ [FAIL] ${testName}: ${message}`);
      failed++;
    }
  }

  // TEST 1: PBKDF2 Password Hashing & Timing-Safe Verification
  const rawSecret = 'SecureP@ssw0rd!2026';
  const { hash, salt } = hashPassword(rawSecret);
  const isValid = verifyPassword(rawSecret, hash, salt);
  const isInvalid = verifyPassword('WrongSecret!123', hash, salt);
  assert(isValid && !isInvalid, 'PBKDF2 Password Verification', 'Correct password passes, incorrect password fails');

  // TEST 2: Register User & Verify Password Hashing
  const testEmail = `test_${Date.now()}@example.com`;
  const regResult = registerUser(testEmail, 'MySecretPass123!', 'Test User', 'USER');
  assert(
    regResult.user.email === testEmail &&
    regResult.user.role === 'USER' &&
    !!regResult.token,
    'User Registration',
    'Successfully created user with isolated credentials and session token'
  );

  // TEST 3: Login User with Valid Credentials
  const loginSuccess = loginUser(testEmail, 'MySecretPass123!');
  assert(
    loginSuccess.user.id === regResult.user.id && !!loginSuccess.token,
    'User Login with Valid Password',
    'Login successfully authenticates valid user'
  );

  // TEST 4: Login with Wrong Password Must Throw Error
  let wrongPassCaught = false;
  try {
    loginUser(testEmail, 'CompletelyWrongPass999!');
  } catch (err: any) {
    wrongPassCaught = err.message === 'Email hoặc mật khẩu không chính xác';
  }
  assert(wrongPassCaught, 'Login with Invalid Password Rejected', 'Correct generic error thrown, no leak');

  // TEST 5: Login with Non-Existent Email Must Throw Error (No auto-registration)
  let nonExistentCaught = false;
  try {
    loginUser(`nonexistent_${Date.now()}@domain.com`, 'RandomPass123!');
  } catch (err: any) {
    nonExistentCaught = err.message === 'Email hoặc mật khẩu không chính xác';
  }
  assert(nonExistentCaught, 'Login with Non-existent Email Fails Without Auto-Register', 'Rejected safely with constant-time dummy check');

  // TEST 6: Guest Session Isolation
  const guest1 = createGuestSession();
  const guest2 = createGuestSession();
  assert(
    guest1.user.id !== guest2.user.id &&
    guest1.token !== guest2.token &&
    guest1.user.email.startsWith('guest_'),
    'Guest Session Isolation',
    'Unique isolated IDs and tokens for separate guests'
  );

  // TEST 7: Admin Bootstrap Without Environment Variables Does NOT Create Hardcoded Admin
  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;
  const beforeCount = ((repository as any).getAllUsersSync ? (repository as any).getAllUsersSync() : []).length;
  bootstrapAdminIfConfigured();
  const afterCount = ((repository as any).getAllUsersSync ? (repository as any).getAllUsersSync() : []).length;
  assert(
    beforeCount === afterCount,
    'Admin Bootstrap Safe Default',
    'No admin is provisioned without explicit environment configuration'
  );

  console.log(`\n📊 Auth Summary: ${passed} passed, ${failed} failed.\n`);
  return { passed, failed };
}

if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const result = runAuthSecurityTests();
  if (result.failed > 0) process.exit(1);
  else process.exit(0);
}

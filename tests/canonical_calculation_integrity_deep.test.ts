// ==========================================================
// CANONICAL CALCULATION INTEGRITY DEEP TEST
// Tests invariant hashing, signature creation, field tampering detection,
// and secret key verification.
// ==========================================================

import assert from 'assert';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import {
  generateAlgorithmSignature,
  verifyAlgorithmSignature,
  extractCanonicalCalculationPayload,
  computeCanonicalCalculationHash
} from '../src/server/algorithmProtection';
import { BirthData } from '../src/types/destiny';

console.log('🧪 Starting Canonical Calculation Integrity Deep Test Suite...');

const testBirthData: BirthData = {
  solarYear: 1990,
  solarMonth: 6,
  solarDay: 15,
  solarHour: 8,
  solarMinute: 30,
  hasExactHour: true,
  gender: 'Male',
  calendarSystem: 'solar',
  timeConvention: 'civil',
  timezoneOffset: 7,
  timezoneName: 'Asia/Ho_Chi_Minh',
  birthCity: 'Hanoi',
  birthCountry: 'Vietnam'
};

const calcResult = runFullDestinyCalculation(testBirthData, 'prof_test_123', 0, { analysisYear: 2026 });

// Test 1: Deterministic canonical hash computation
const payload1 = extractCanonicalCalculationPayload(calcResult);
const hash1 = computeCanonicalCalculationHash(payload1);
const payload2 = extractCanonicalCalculationPayload(calcResult);
const hash2 = computeCanonicalCalculationHash(payload2);

assert.strictEqual(hash1, hash2, 'Canonical calculation hash must be identical across repeated extractions');
assert.strictEqual(hash1.length, 64, 'SHA-256 hash must be 64 characters hex');
console.log('  ✔ Test 1: Invariant canonical calculation hash is deterministic and reproducible.');

// Test 2: Signature generation and verification
const signature = generateAlgorithmSignature(calcResult);
assert(signature.signature && signature.signature.length > 32);
assert.strictEqual(signature.canonicalHash, hash1);
assert.strictEqual(signature.engineId, 'aurora-engine-v4.2');

const isValid = verifyAlgorithmSignature(calcResult, signature.signature);
assert.strictEqual(isValid, true, 'Original unmodified calculation signature must verify as valid');
console.log('  ✔ Test 2: HMAC algorithm signature generation and verification succeed.');

// Test 3: Tampering any single field invalidates the signature
// A. Tampering Bát Tự Day Master
const tamperedCalc1 = JSON.parse(JSON.stringify(calcResult));
tamperedCalc1.bazi.dayMaster = 'Yi'; // Changed from original Jia / Geng
assert.strictEqual(
  verifyAlgorithmSignature(tamperedCalc1, signature.signature),
  false,
  'Tampering dayMaster must invalidate signature'
);

// B. Tampering Tử Vi Palace star brightness
const tamperedCalc2 = JSON.parse(JSON.stringify(calcResult));
const firstPalaceKey = Object.keys(tamperedCalc2.ziwei.palaces)[0];
if (tamperedCalc2.ziwei.palaces[firstPalaceKey].majorStars.length > 0) {
  tamperedCalc2.ziwei.palaces[firstPalaceKey].majorStars[0].brightness = 'H';
  assert.strictEqual(
    verifyAlgorithmSignature(tamperedCalc2, signature.signature),
    false,
    'Tampering palace star brightness must invalidate signature'
  );
}

// C. Tampering Decade start age
const tamperedCalc3 = JSON.parse(JSON.stringify(calcResult));
if (tamperedCalc3.decades && tamperedCalc3.decades.length > 0) {
  tamperedCalc3.decades[0].startAge += 1;
  assert.strictEqual(
    verifyAlgorithmSignature(tamperedCalc3, signature.signature),
    false,
    'Tampering decade age must invalidate signature'
  );
}

// D. Tampering Astrology rules version
const tamperedCalc4 = JSON.parse(JSON.stringify(calcResult));
tamperedCalc4.astrologyRulesVersion = '99.0.0-tampered';
assert.strictEqual(
  verifyAlgorithmSignature(tamperedCalc4, signature.signature),
  false,
  'Tampering rules version must invalidate signature'
);
console.log('  ✔ Test 3: Tampering calculations (Day Master, Stars, Decades, Rules) strictly fails verification.');

// Test 4: Verification with incorrect secret key
const isForgedValid = verifyAlgorithmSignature(calcResult, signature.signature, 'wrong_secret_key_123');
assert.strictEqual(isForgedValid, false, 'Signature verification with wrong secret key must fail');
console.log('  ✔ Test 4: Verification fails when wrong HMAC secret key is provided.');

console.log('🎉 All Canonical Calculation Integrity tests PASSED!\n');

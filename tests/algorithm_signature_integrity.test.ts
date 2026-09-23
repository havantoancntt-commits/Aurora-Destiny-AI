// ==========================================
// AURORA DESTINY AI — ALGORITHM SIGNATURE & DATA INTEGRITY TEST SUITE
// Comprehensive tests for Phase 5: Canonical serialization, SHA-256 hash,
// HMAC verification, field mutation, nested mutation, and tamper prevention.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import crypto from 'node:crypto';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import {
  generateAlgorithmSignature,
  verifyAlgorithmSignature,
  computeCanonicalAlgorithmHash,
  canonicalStringify
} from '../src/server/algorithmProtection';
import { CalculationResult } from '../src/types/destiny';

test('Algorithm Signature & Canonical Integrity Suite', async (t) => {
  const baseBirthData = {
    solarYear: 1992,
    solarMonth: 8,
    solarDay: 20,
    solarHour: 10,
    solarMinute: 30,
    birthCity: 'Hà Nội',
    birthCountry: 'Việt Nam',
    gender: 'Male' as const,
    timezoneOffset: 7,
    timezoneName: 'Asia/Ho_Chi_Minh',
    calendarSystem: 'solar' as const,
    hasExactHour: true,
    timeConvention: 'civil' as const
  };

  const calc1 = runFullDestinyCalculation(baseBirthData, 'prof_test_integrity_1', 0);
  const seal1 = generateAlgorithmSignature(calc1);
  calc1.cryptographicSignature = seal1;

  await t.test('1. Valid calculation verifies successfully with generated cryptographic seal', () => {
    const isValid = verifyAlgorithmSignature(calc1);
    assert.strictEqual(isValid, true, 'Original calculation must verify true');
  });

  await t.test('2. Deterministic serialization: same logical calculation produces identical canonical hash', () => {
    const calc2 = runFullDestinyCalculation(baseBirthData, 'prof_test_integrity_1', 0);
    // Overwrite the random uuid of calculation to match calc1 for pure logical equivalence comparison
    calc2.id = calc1.id;
    const hash1 = computeCanonicalAlgorithmHash(calc1);
    const hash2 = computeCanonicalAlgorithmHash(calc2);
    assert.strictEqual(hash1, hash2, 'Identical logical calculations must have identical canonical SHA-256 hash');
  });

  await t.test('3. Field mutation: changing Day Master stem fails verification', () => {
    const mutated = JSON.parse(JSON.stringify(calc1)) as CalculationResult;
    mutated.bazi.dayMaster = mutated.bazi.dayMaster === 'Jia' ? 'Yi' : 'Jia';
    const isValid = verifyAlgorithmSignature(mutated);
    assert.strictEqual(isValid, false, 'Mutating Day Master must fail verification');
  });

  await t.test('4. Field mutation: modifying any Pillar branch or ten god fails verification', () => {
    const mutated = JSON.parse(JSON.stringify(calc1)) as CalculationResult;
    mutated.bazi.hourPillar.branch = mutated.bazi.hourPillar.branch === 'Zi' ? 'Chou' : 'Zi';
    const isValid = verifyAlgorithmSignature(mutated);
    assert.strictEqual(isValid, false, 'Mutating Pillar branch must fail verification');

    const mutatedTenGod = JSON.parse(JSON.stringify(calc1)) as CalculationResult;
    mutatedTenGod.bazi.yearPillar.stem = (mutatedTenGod.bazi.yearPillar.stem === 'Jia' ? 'Yi' : 'Jia') as any;
    assert.strictEqual(verifyAlgorithmSignature(mutatedTenGod), false, 'Mutating Year Pillar stem must fail');
  });

  await t.test('5. Nested mutation: modifying star in Zi Wei palace fails verification', () => {
    const mutated = JSON.parse(JSON.stringify(calc1)) as CalculationResult;
    if (mutated.ziwei.palaces.life?.majorStars?.[0]) {
      mutated.ziwei.palaces.life.majorStars[0].brightness = 'H';
    } else {
      mutated.ziwei.elementBureau = 'Thủy Nhị Cục Tampered';
    }
    const isValid = verifyAlgorithmSignature(mutated);
    assert.strictEqual(isValid, false, 'Mutating star brightness in Life Palace must fail verification');
  });

  await t.test('6. Nested mutation: tampering with hidden stems fails verification', () => {
    const mutated = JSON.parse(JSON.stringify(calc1)) as CalculationResult;
    mutated.bazi.dayPillar.hiddenStems = [{ stem: 'Jia', element: 'Wood', tenGod: 'Tampered' }];
    const isValid = verifyAlgorithmSignature(mutated);
    assert.strictEqual(isValid, false, 'Mutating hidden stems must fail verification');
  });

  await t.test('7. Signature tampering: altering hex character in signature fails verification', () => {
    const mutated = JSON.parse(JSON.stringify(calc1)) as CalculationResult;
    const origSig = mutated.cryptographicSignature!.signature;
    const tamperedChar = origSig[0] === 'a' ? 'b' : 'a';
    mutated.cryptographicSignature!.signature = tamperedChar + origSig.slice(1);
    const isValid = verifyAlgorithmSignature(mutated);
    assert.strictEqual(isValid, false, 'Tampered HMAC signature must fail verification');
  });

  await t.test('8. Missing signature or missing algorithmHash fails safely without throw', () => {
    const noSig = JSON.parse(JSON.stringify(calc1)) as CalculationResult;
    delete (noSig as any).cryptographicSignature;
    assert.strictEqual(verifyAlgorithmSignature(noSig), false);

    const missingHash = JSON.parse(JSON.stringify(calc1)) as CalculationResult;
    missingHash.cryptographicSignature!.algorithmHash = '';
    assert.strictEqual(verifyAlgorithmSignature(missingHash), false);
  });

  await t.test('9. Replay / Expiration: respects maxAgeMs parameter when provided', () => {
    // Current signature timestamp is fresh, so 60,000ms window passes
    assert.strictEqual(verifyAlgorithmSignature(calc1, 60000), true);

    // Signature with timestamp older than 1ms fails maxAgeMs=1
    const expiredCalc = JSON.parse(JSON.stringify(calc1)) as CalculationResult;
    expiredCalc.cryptographicSignature!.sealTimestamp = new Date(Date.now() - 10000).toISOString();
    assert.strictEqual(verifyAlgorithmSignature(expiredCalc, 1000), false, 'Expired seal must fail');
  });

  await t.test('10. canonicalStringify is independent of object key insertion order', () => {
    const objA = { z: 1, a: 2, m: { y: 'nested', b: true } };
    const objB = { a: 2, m: { b: true, y: 'nested' }, z: 1 };
    assert.strictEqual(canonicalStringify(objA), canonicalStringify(objB));
  });
});

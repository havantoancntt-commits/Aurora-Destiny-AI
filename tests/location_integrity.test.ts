// ==========================================
// AURORA DESTINY AI — LOCATION INTEGRITY & CANONICAL RESOLUTION SUITE
// Tests for Phase 6: Valid city, Invalid city (strict no-fallback),
// Ambiguous city, Coordinates, IANA Timezone, and Reproducibility.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { locationProvider, LocationProvider } from '../src/services/locationProvider';
import { resolveHistoricalTimezoneOffset, resolveEffectiveBirthTime } from '../src/engine/temporalCorrection';

test('Location & Timezone Integrity Suite', async (t) => {
  await t.test('1. Valid city resolves exact coordinates, country, and IANA timezone', () => {
    const res = locationProvider.resolveCanonicalLocation('Hà Nội', 'Việt Nam');
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.location.city, 'Hà Nội');
      assert.strictEqual(res.location.countryCode, 'VN');
      assert.strictEqual(res.location.timezone, 'Asia/Ho_Chi_Minh');
      assert.strictEqual(res.location.timezoneOffset, 7);
      assert.strictEqual(res.location.latitude, 21.0285);
      assert.strictEqual(res.location.longitude, 105.8542);
    }
  });

  await t.test('2. Unaccented and case-insensitive city names resolve correctly', () => {
    const res = locationProvider.resolveCanonicalLocation('ho chi minh', 'viet nam');
    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.location.city, 'TP. Hồ Chí Minh');
      assert.strictEqual(res.location.latitude, 10.7769);
      assert.strictEqual(res.location.longitude, 106.7009);
    }
  });

  await t.test('3. Invalid or unknown city strictly returns CITY_NOT_FOUND (No silent fallback to first city)', () => {
    // City that does not exist in VN
    const res = locationProvider.resolveCanonicalLocation('Atlantis Unknown City', 'Việt Nam');
    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.strictEqual(res.error, 'CITY_NOT_FOUND');
    }

    // Direct resolveLocation returns null instead of Hà Nội
    const directRes = locationProvider.resolveLocation('Atlantis Unknown City', 'Việt Nam');
    assert.strictEqual(directRes, null, 'Must NOT silently return first city of country (Hà Nội)');
  });

  await t.test('4. Empty, whitespace or invalid queries are safely rejected', () => {
    const emptyRes = locationProvider.resolveCanonicalLocation('');
    assert.strictEqual(emptyRes.success, false);
    if (!emptyRes.success) {
      assert.strictEqual(emptyRes.error, 'INVALID_QUERY');
    }

    const wsRes = locationProvider.resolveCanonicalLocation('   ');
    assert.strictEqual(wsRes.success, false);
  });

  await t.test('5. Global cities resolve exact coordinates and respective IANA timezones', () => {
    const tokyo = locationProvider.resolveCanonicalLocation('Tokyo', 'Nhật Bản');
    assert.strictEqual(tokyo.success, true);
    if (tokyo.success) {
      assert.strictEqual(tokyo.location.timezone, 'Asia/Tokyo');
      assert.strictEqual(tokyo.location.timezoneOffset, 9);
    }

    const ny = locationProvider.resolveCanonicalLocation('New York', 'Hoa Kỳ');
    assert.strictEqual(ny.success, true);
    if (ny.success) {
      assert.strictEqual(ny.location.timezone, 'America/New_York');
      assert.strictEqual(ny.location.timezoneOffset, -5);
    }
  });

  await t.test('6. Temporal engine uses resolved coordinates for True Solar Time calculation', () => {
    const effectiveHanoi = resolveEffectiveBirthTime({
      solarYear: 1990,
      solarMonth: 6,
      solarDay: 15,
      solarHour: 12,
      solarMinute: 0,
      birthCity: 'Hà Nội',
      birthCountry: 'Việt Nam',
      timeConvention: 'trueSolar',
      hasExactHour: true,
      gender: 'Male',
      timezoneOffset: 7,
      timezoneName: 'Asia/Ho_Chi_Minh',
      calendarSystem: 'solar'
    });

    const effectiveHcm = resolveEffectiveBirthTime({
      solarYear: 1990,
      solarMonth: 6,
      solarDay: 15,
      solarHour: 12,
      solarMinute: 0,
      birthCity: 'TP. Hồ Chí Minh',
      birthCountry: 'Việt Nam',
      timeConvention: 'trueSolar',
      hasExactHour: true,
      gender: 'Male',
      timezoneOffset: 7,
      timezoneName: 'Asia/Ho_Chi_Minh',
      calendarSystem: 'solar'
    });

    // Hanoi is 105.8542°E, HCM is 106.7009°E -> Longitude difference causes distinct minute correction
    assert.notStrictEqual(
      effectiveHanoi.longitudeCorrectionMinutes,
      effectiveHcm.longitudeCorrectionMinutes,
      'Distinct cities must produce distinct longitude correction minutes'
    );
  });

  await t.test('7. Unknown city does not crash temporal correction and falls back to standard meridian', () => {
    const unknownCityResult = resolveEffectiveBirthTime({
      solarYear: 1990,
      solarMonth: 6,
      solarDay: 15,
      solarHour: 12,
      solarMinute: 0,
      birthCity: 'NonExistentCityXYZ',
      birthCountry: 'Việt Nam',
      timeConvention: 'civil',
      hasExactHour: true,
      gender: 'Male',
      timezoneOffset: 7,
      timezoneName: 'Asia/Ho_Chi_Minh',
      calendarSystem: 'solar'
    });

    assert.ok(unknownCityResult);
    // Standard meridian for UTC+7 is 7 * 15 = 105
    assert.strictEqual(unknownCityResult.longitude, 105);
  });

  await t.test('8. Historical timezone resolution is deterministic and matches IANA database', () => {
    // Vietnam 1990 is UTC+7
    const tzVN = resolveHistoricalTimezoneOffset(1990, 1, 1, 12, 0, 'Asia/Ho_Chi_Minh');
    assert.ok(tzVN);
    assert.strictEqual(tzVN.offsetHours, 7);

    // New York winter is UTC-5, summer is UTC-4 (EDT)
    const tzNYWinter = resolveHistoricalTimezoneOffset(2023, 1, 15, 12, 0, 'America/New_York');
    const tzNYSummer = resolveHistoricalTimezoneOffset(2023, 7, 15, 12, 0, 'America/New_York');
    assert.ok(tzNYWinter);
    assert.ok(tzNYSummer);
    assert.strictEqual(tzNYWinter.offsetHours, -5);
    assert.strictEqual(tzNYSummer.offsetHours, -4);
  });
});

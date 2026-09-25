// ==========================================================
// LOCATION AMBIGUITY & CANONICAL RESOLUTION VERIFICATION TEST
// Tests strict ambiguity detection, canonical metadata enrichment,
// and zero-silent-fallback guarantees.
// ==========================================================

import assert from 'assert';
import { LocationProvider, LocationData } from '../src/services/locationProvider';

console.log('🧪 Starting Location Ambiguity & Canonical Resolution Verification Suite...');

const provider = new LocationProvider();

// Test 1: Single exact curated match
const hanoiRes = provider.resolveCanonicalLocation('Hanoi', 'Vietnam');
assert.strictEqual(hanoiRes.success, true, 'Hanoi resolution must succeed');
if (hanoiRes.success) {
  assert.strictEqual(hanoiRes.matchType, 'EXACT');
  assert.strictEqual(hanoiRes.location.city, 'Hà Nội');
  assert.strictEqual(hanoiRes.location.countryCode, 'VN');
  assert.strictEqual(hanoiRes.location.timezone, 'Asia/Ho_Chi_Minh');
  assert.strictEqual(hanoiRes.location.timezoneOffset, 7);
  assert.strictEqual(hanoiRes.location.canonicalId, 'loc_vn_hanoi');
  assert.strictEqual(hanoiRes.location.resolutionMethod, 'EXACT_CURATED');
  assert.strictEqual(hanoiRes.location.historicalTimezoneInfo?.standardOffset, 7);
}
console.log('  ✔ Test 1: Single exact curated match verified with full canonical metadata.');

// Test 2: Ho Chi Minh City with Vietnamese diacritics
const hcmRes = provider.resolveCanonicalLocation('Hồ Chí Minh', 'Việt Nam');
assert.strictEqual(hcmRes.success, true, 'Hồ Chí Minh diacritics query must succeed');
if (hcmRes.success) {
  assert.strictEqual(hcmRes.location.city, 'TP. Hồ Chí Minh');
  assert.strictEqual(hcmRes.location.countryCode, 'VN');
  assert.strictEqual(hcmRes.location.timezoneOffset, 7);
}
console.log('  ✔ Test 2: Diacritics normalization for Vietnamese locations verified.');

// Test 3: Multiple exact matches must return AMBIGUOUS_CITY, NEVER silent first-match fallback
const customLocations: LocationData[] = [
  {
    city: 'Springfield',
    country: 'United States',
    countryCode: 'US',
    latitude: 39.7817,
    longitude: -89.6501,
    timezone: 'America/Chicago',
    timezoneOffset: -6
  },
  {
    city: 'Springfield',
    country: 'United States',
    countryCode: 'US',
    latitude: 44.0462,
    longitude: -123.0220,
    timezone: 'America/Los_Angeles',
    timezoneOffset: -8
  }
];

const duplicateProvider = new LocationProvider(customLocations);
const springfieldRes = duplicateProvider.resolveCanonicalLocation('Springfield', 'United States');
assert.strictEqual(springfieldRes.success, false, 'Duplicate city query must return failure');
if (!springfieldRes.success) {
  assert.strictEqual(springfieldRes.error, 'AMBIGUOUS_CITY', 'Must flag AMBIGUOUS_CITY error');
  assert(springfieldRes.candidates && springfieldRes.candidates.length === 2, 'Must return all matching candidates for disambiguation');
  assert.notStrictEqual(springfieldRes.candidates[0].latitude, springfieldRes.candidates[1].latitude);
}
console.log('  ✔ Test 3: Ambiguous exact matches strictly reject silent fallback and return candidate list.');

// Test 4: Substring ambiguity with multiple matches
const sanRes = provider.resolveCanonicalLocation('San', 'United States');
assert.strictEqual(sanRes.success, false, 'Multiple prefix match "San" must not resolve silently');
if (!sanRes.success) {
  assert.strictEqual(sanRes.error, 'AMBIGUOUS_CITY');
  assert(sanRes.candidates && sanRes.candidates.length >= 2, 'Candidates list must be provided');
}
console.log('  ✔ Test 4: Substring ambiguity detection verified.');

// Test 5: Invalid and empty queries
const emptyRes = provider.resolveCanonicalLocation('');
assert.strictEqual(emptyRes.success, false);
assert.strictEqual(emptyRes.error, 'INVALID_QUERY');

const whitespaceRes = provider.resolveCanonicalLocation('   ');
assert.strictEqual(whitespaceRes.success, false);
assert.strictEqual(whitespaceRes.error, 'INVALID_QUERY');

const symbolsRes = provider.resolveCanonicalLocation('!@#$%^&*');
assert.strictEqual(symbolsRes.success, false);
assert.strictEqual(symbolsRes.error, 'INVALID_QUERY');
console.log('  ✔ Test 5: Empty, whitespace, and special characters rejected as INVALID_QUERY.');

// Test 6: Unknown city
const unknownRes = provider.resolveCanonicalLocation('AtlantisCityUnknown1234');
assert.strictEqual(unknownRes.success, false);
assert.strictEqual(unknownRes.error, 'CITY_NOT_FOUND');
console.log('  ✔ Test 6: Unknown city explicitly fails with CITY_NOT_FOUND.');

// Test 7: Country mismatch
const mismatchRes = provider.resolveCanonicalLocation('Tokyo', 'Vietnam');
assert.strictEqual(mismatchRes.success, false);
assert.strictEqual(mismatchRes.error, 'CITY_NOT_FOUND');
console.log('  ✔ Test 7: City query with mismatched country properly rejected.');

// Test 8: International major hub resolution
const hubs = [
  { city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo', offset: 9 },
  { city: 'Paris', country: 'France', tz: 'Europe/Paris', offset: 1 },
  { city: 'London', country: 'United Kingdom', tz: 'Europe/London', offset: 0 },
  { city: 'New York', country: 'United States', tz: 'America/New_York', offset: -5 },
  { city: 'Singapore', country: 'Singapore', tz: 'Asia/Singapore', offset: 8 }
];

hubs.forEach(hub => {
  const res = provider.resolveCanonicalLocation(hub.city, hub.country);
  assert.strictEqual(res.success, true, `Hub ${hub.city} must resolve`);
  if (res.success) {
    assert.strictEqual(res.location.timezone, hub.tz, `${hub.city} timezone must match`);
    assert.strictEqual(res.location.timezoneOffset, hub.offset, `${hub.city} offset must match`);
  }
});
console.log('  ✔ Test 8: International hub cities resolved with accurate timezone and offsets.');

console.log('🎉 All Location Ambiguity & Canonical Resolution Verification tests PASSED!\n');

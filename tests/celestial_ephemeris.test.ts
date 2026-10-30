// ==========================================
// TEST SUITE: CELESTIAL EPHEMERIS & PLANETARY COORDINATES
// Validates J2000 calculations, ecliptic longitude & latitude, aspects, retrogrades
// ==========================================

import {
  calculateCelestialBirthChart,
  getZodiacSignFromLongitude,
  gregorianToContinuousJD,
  ZODIAC_SIGNS
} from '../src/engine/celestialEphemeris';
import { BirthData } from '../src/types/destiny';

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${testName} - ${detail || ''}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${testName}`);
  }
}

console.log('--- RUNNING CELESTIAL EPHEMERIS TESTS ---');

// 1. Julian Day computation check
// At 2000-01-01 12:00:00 UTC, JD should be 2451545.0 (Standard J2000 Epoch)
const jd2000 = gregorianToContinuousJD(2000, 1, 1, 12, 0, 0);
assert(Math.abs(jd2000 - 2451545.0) < 0.001, 'J2000 Epoch JD calculation', `Expected 2451545.0, got ${jd2000}`);

// 2. Zodiac sign mapping
const aries = getZodiacSignFromLongitude(15.5);
assert(aries.sign.id === 'aries' && aries.degree === 15 && aries.minute === 30, 'Zodiac sign 15.5° Aries', `Got ${aries.sign.id} ${aries.degree}°${aries.minute}'`);

const scorpio = getZodiacSignFromLongitude(225.25);
assert(scorpio.sign.id === 'scorpio' && scorpio.degree === 15 && scorpio.minute === 15, 'Zodiac sign 225.25° Scorpio', `Got ${scorpio.sign.id} ${scorpio.degree}°${scorpio.minute}'`);

// 3. Birth chart calculation
const sampleBirth: BirthData = {
  solarYear: 1990,
  solarMonth: 10,
  solarDay: 25,
  solarHour: 10,
  solarMinute: 30,
  hasExactHour: true,
  birthCity: 'Hà Nội',
  birthCountry: 'Việt Nam',
  timezoneOffset: 7,
  timezoneName: 'Asia/Ho_Chi_Minh',
  longitude: 105.85,
  latitude: 21.03,
  gender: 'Male',
  calendarSystem: 'solar'
};

const chart = calculateCelestialBirthChart(sampleBirth);

// Verify all required celestial bodies exist
const expectedPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'north_node', 'south_node'];
expectedPlanets.forEach(id => {
  const p = chart.bodies.find(b => b.id === id);
  assert(!!p, `Planet ${id} exists in ephemeris`);
  assert(p!.longitude >= 0 && p!.longitude <= 360, `Planet ${id} longitude within [0, 360]`, `${p!.longitude}`);
  assert(p!.latitude >= -90 && p!.latitude <= 90, `Planet ${id} latitude within [-90, 90]`, `${p!.latitude}`);
  assert(p!.rightAscension >= 0 && p!.rightAscension <= 360, `Planet ${id} RA within [0, 360]`, `${p!.rightAscension}`);
  assert(p!.declination >= -90 && p!.declination <= 90, `Planet ${id} Dec within [-90, 90]`, `${p!.declination}`);
  assert(p!.formattedSign.length > 5, `Planet ${id} formattedSign string valid`, p!.formattedSign);
});

// Verify Sun ecliptic latitude is strictly 0.0 (by definition of ecliptic)
const sun = chart.bodies.find(b => b.id === 'sun')!;
assert(sun.latitude === 0.0, 'Sun ecliptic latitude is 0.0', `Got ${sun.latitude}`);
// Sun in late October should be in Scorpio (approx 210° - 240°)
assert(sun.longitude >= 210 && sun.longitude <= 215, 'Sun in late October in Scorpio', `Got ${sun.longitude}°`);

// Verify Moon has realistic non-zero ecliptic latitude (within inclination bounds ~5.3°)
const moon = chart.bodies.find(b => b.id === 'moon')!;
assert(Math.abs(moon.latitude) <= 5.5, 'Moon ecliptic latitude within orbital inclination bound', `Got ${moon.latitude}°`);

// Verify aspects generation
assert(chart.aspects.length > 0, 'Planetary aspects computed', `Computed ${chart.aspects.length} aspects`);

// Verify Ascendant and Midheaven computed
assert(chart.ascendantDegree >= 0 && chart.ascendantDegree <= 360, 'Ascendant degree valid', `${chart.ascendantDegree}`);
assert(chart.midheavenDegree >= 0 && chart.midheavenDegree <= 360, 'Midheaven degree valid', `${chart.midheavenDegree}`);

console.log('ALL CELESTIAL EPHEMERIS TESTS PASSED!');

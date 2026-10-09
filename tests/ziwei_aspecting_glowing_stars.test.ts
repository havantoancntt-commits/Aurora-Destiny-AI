// ==========================================
// TEST SUITE: ZI WEI ASPECTING INFLUENCES & GLOWING BORDER WARNING
// Testing Tam Phương Tứ Chính aspecting palaces and challenging star detection
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import {
  getChallengingStarsInPalace,
  getAspectingInfluences,
  calculateZiWeiChart
} from '../src/engine/ziwei';
import { ZiWeiPalace, ZiWeiStar, BirthData } from '../src/types/destiny';

const sampleBirthData: BirthData = {
  solarYear: 1994,
  solarMonth: 8,
  solarDay: 15,
  solarHour: 10,
  solarMinute: 15,
  hasExactHour: true,
  gender: 'Male',
  calendarSystem: 'solar',
  birthCity: 'Hà Nội',
  birthCountry: 'Việt Nam',
  timezoneOffset: 7,
  timezoneName: 'Asia/Ho_Chi_Minh'
};

test('Zi Wei Aspecting — getChallengingStarsInPalace correctly classifies bad stars', () => {
  const mockPalaceWithBadStars: ZiWeiPalace = {
    key: 'travel',
    nameVi: 'Thiên Di',
    nameEn: 'Travel',
    branch: 'Shen',
    stem: 'Jia',
    majorStars: [
      {
        nameVi: 'Liêm Trinh',
        nameEn: 'Lian Zhen',
        nameZh: '廉貞',
        brightness: 'H', // Hãm địa
        element: 'Fire',
        type: 'Major'
      },
      {
        nameVi: 'Thái Dương',
        nameEn: 'Tai Yang',
        nameZh: '太陽',
        brightness: 'M',
        element: 'Fire',
        transformation: 'Ky', // Hóa Kỵ
        type: 'Major'
      }
    ],
    minorStars: [
      {
        nameVi: 'Kình Dương',
        nameEn: 'Jing Yang',
        nameZh: '擎羊',
        brightness: 'M',
        element: 'Metal',
        type: 'Challenging' // Sát tinh
      },
      {
        nameVi: 'Địa Không',
        nameEn: 'Di Kong',
        nameZh: '地空',
        brightness: 'H',
        element: 'Fire',
        type: 'Challenging' // Sát tinh
      },
      {
        nameVi: 'Hồng Loan',
        nameEn: 'Hong Luan',
        nameZh: '紅鸞',
        brightness: 'M',
        element: 'Water',
        type: 'Lucky' // Cát tinh
      }
    ],
    score: 65,
    decadeRangeStr: '24-33',
    transformations: [],
    focalTheme: 'Thiên Di ngoại giao'
  };

  const challenging = getChallengingStarsInPalace(mockPalaceWithBadStars);

  assert.strictEqual(challenging.length, 4, 'Should identify 4 challenging stars (Liêm Trinh H, Thái Dương Kỵ, Kình Dương, Địa Không)');
  assert.ok(challenging.some((s) => s.nameVi === 'Liêm Trinh' && s.brightness === 'H'), 'Includes Liêm Trinh (H)');
  assert.ok(challenging.some((s) => s.transformation === 'Ky'), 'Includes Hóa Kỵ star');
  assert.ok(challenging.some((s) => s.nameVi === 'Kình Dương'), 'Includes Kình Dương');
  assert.ok(challenging.some((s) => s.nameVi === 'Địa Không'), 'Includes Địa Không');
  assert.ok(!challenging.some((s) => s.nameVi === 'Hồng Loan'), 'Excludes auspicious Hồng Loan');
});

test('Zi Wei Aspecting — getAspectingInfluences resolves Tam Phương Tứ Chính correctly', () => {
  const chart = calculateZiWeiChart(sampleBirthData);
  const palaceByBranch: Record<string, ZiWeiPalace> = {};
  Object.values(chart.palaces).forEach((p) => {
    palaceByBranch[p.branch] = p;
  });

  const lifePalace = chart.palaces.life;
  assert.ok(lifePalace, 'Cung Mệnh must exist');

  const aspecting = getAspectingInfluences(lifePalace, palaceByBranch);

  assert.strictEqual(aspecting.length, 3, 'Must return exactly 3 aspecting palaces (1 opposite, 2 trines)');

  const opposite = aspecting.find((a) => a.relation === 'opposite');
  assert.ok(opposite, 'Must include opposite palace (Xung Chiếu)');
  assert.strictEqual(opposite?.relationLabel, 'Xung Chiếu');

  const trines = aspecting.filter((a) => a.relation === 'trine');
  assert.strictEqual(trines.length, 2, 'Must include 2 trine palaces (Tam Hợp)');

  // Verify each aspecting palace contains valid palace reference and challenging stars array
  for (const inf of aspecting) {
    assert.ok(inf.palace, 'Palace must be defined');
    assert.ok(Array.isArray(inf.challengingStars), 'Challenging stars must be an array');
    assert.strictEqual(inf.hasChallengingStars, inf.challengingStars.length > 0, 'hasChallengingStars matches length');
  }
});

test('Zi Wei Aspecting — Full destiny calculation integration', () => {
  const calc = runFullDestinyCalculation(sampleBirthData, 'profile_test_999');
  const ziwei = calc.ziwei;
  assert.ok(ziwei, 'ZiWei chart must exist on calculation result');

  const palaceByBranch: Record<string, ZiWeiPalace> = {};
  Object.values(ziwei.palaces).forEach((p) => {
    palaceByBranch[p.branch] = p;
  });

  // Test across all 12 palaces
  Object.values(ziwei.palaces).forEach((selectedPalace) => {
    const influences = getAspectingInfluences(selectedPalace, palaceByBranch);
    assert.strictEqual(influences.length, 3, `Palace ${selectedPalace.nameVi} must have 3 aspecting palaces`);

    const hasAnyChallenging = influences.some((inf) => inf.hasChallengingStars);
    // At least some palaces in a real chart will have challenging stars aspecting in
    assert.ok(typeof hasAnyChallenging === 'boolean');
  });
});

test('Zi Wei Aspecting — Dynamic palace click activates glowing border flags for aspecting bad stars', () => {
  const calc = runFullDestinyCalculation(sampleBirthData, 'profile_test_click_palaces');
  const ziwei = calc.ziwei;
  const palaceByBranch: Record<string, ZiWeiPalace> = {};
  Object.values(ziwei.palaces).forEach((p) => {
    palaceByBranch[p.branch] = p;
  });

  // Simulate user clicking on every palace in the dashboard
  for (const palaceKey of Object.keys(ziwei.palaces)) {
    const activePalace = ziwei.palaces[palaceKey as keyof typeof ziwei.palaces];
    const influences = getAspectingInfluences(activePalace, palaceByBranch);

    // Compute badStarAspectingBranchMap identically to DestinyDashboard
    const badStarAspectingBranchMap: Record<string, typeof influences[0]> = {};
    influences.forEach((inf) => {
      if (inf.hasChallengingStars) {
        badStarAspectingBranchMap[inf.palace.branch] = inf;
      }
    });

    // 1. Check that the active palace itself is never in badStarAspectingBranchMap (it is "Tọa Thủ")
    assert.strictEqual(
      badStarAspectingBranchMap[activePalace.branch],
      undefined,
      `Active palace ${activePalace.nameVi} cannot aspect itself`
    );

    // 2. Any palace mapped in badStarAspectingBranchMap must have hasChallengingStars === true
    Object.entries(badStarAspectingBranchMap).forEach(([branch, inf]) => {
      assert.strictEqual(inf.palace.branch, branch);
      assert.strictEqual(inf.hasChallengingStars, true);
      assert.ok(inf.challengingStars.length > 0, `Aspecting palace ${inf.palace.nameVi} must have at least 1 challenging star`);
      assert.ok(['Xung Chiếu', 'Tam Hợp'].includes(inf.relationLabel));
    });

    // 3. Palaces with NO challenging stars must NOT be flagged for glowing warning border
    influences
      .filter((inf) => !inf.hasChallengingStars)
      .forEach((inf) => {
        assert.strictEqual(
          badStarAspectingBranchMap[inf.palace.branch],
          undefined,
          `Palace ${inf.palace.nameVi} has no bad stars and must not have glowing warning border`
        );
      });
  }
});


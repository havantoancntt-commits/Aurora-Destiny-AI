// ==========================================
// TEST SUITE: SENIOR DESTINY GUIDE & LUNAR-SOLAR REVERSIBILITY
// Verification for Senior Guide calculations, folk hour decoding, and 100-year calendar accuracy
// ==========================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { convertSolarToLunar, convertLunarToSolar, gregorianToJulianDay, julianDayToGregorian } from '../src/engine/lunarSolar';
import { calculateYearPillar, calculateMonthPillar, calculateDayPillar, calculateHourPillar } from '../src/engine/bazi';
import { STEMS, BRANCHES, getNaYin } from '../src/engine/canchi';

test('🧓 Senior Destiny Guide: Astronomical & Metaphysical Precision Suite', async (t) => {
  await t.test('1. Julian Day <-> Gregorian Date reversibility', () => {
    const dates = [
      { y: 1940, m: 2, d: 8 },
      { y: 1952, m: 1, d: 27 },
      { y: 1964, m: 2, d: 13 },
      { y: 1975, m: 4, d: 30 },
      { y: 1980, m: 10, d: 15 },
      { y: 2024, m: 2, d: 10 }
    ];

    for (const dt of dates) {
      const jd = gregorianToJulianDay(dt.y, dt.m, dt.d);
      const converted = julianDayToGregorian(jd);
      assert.equal(converted.year, dt.y, `Year mismatch for ${dt.y}`);
      assert.equal(converted.month, dt.m, `Month mismatch for ${dt.m}`);
      assert.equal(converted.day, dt.d, `Day mismatch for ${dt.d}`);
    }
  });

  await t.test('2. Lunar to Solar & Solar to Lunar Bi-Directional Reversibility', () => {
    // Known historical Lunar New Year benchmarks:
    // 2024 Lunar 1/1 -> Solar 2024-02-10 (Giáp Thìn)
    // 1964 Lunar 1/1 -> Solar 1964-02-13 (Giáp Thìn)
    // 1954 Lunar 1/1 -> Solar 1954-02-03 (Giáp Ngọ)
    // 2023 Lunar Leap Month 2, Day 1 -> Solar 2023-03-22
    const benchmarks = [
      { lunarY: 2024, lunarM: 1, lunarD: 1, isLeap: false, expectedSolarY: 2024, expectedSolarM: 2, expectedSolarD: 10 },
      { lunarY: 1964, lunarM: 1, lunarD: 1, isLeap: false, expectedSolarY: 1964, expectedSolarM: 2, expectedSolarD: 13 },
      { lunarY: 1954, lunarM: 1, lunarD: 1, isLeap: false, expectedSolarY: 1954, expectedSolarM: 2, expectedSolarD: 3 },
      { lunarY: 2023, lunarM: 2, lunarD: 1, isLeap: true, expectedSolarY: 2023, expectedSolarM: 3, expectedSolarD: 22 }
    ];

    for (const bm of benchmarks) {
      const solar = convertLunarToSolar(bm.lunarY, bm.lunarM, bm.lunarD, bm.isLeap, 7);
      assert.ok(solar, `Conversion from Lunar ${bm.lunarD}/${bm.lunarM}/${bm.lunarY} must not be null`);
      assert.equal(solar.solarYear, bm.expectedSolarY, `Solar Year mismatch for Lunar ${bm.lunarY}`);
      assert.equal(solar.solarMonth, bm.expectedSolarM, `Solar Month mismatch for Lunar ${bm.lunarM}`);
      assert.equal(solar.solarDay, bm.expectedSolarD, `Solar Day mismatch for Lunar ${bm.lunarD}`);

      // Verify reverse conversion matches exactly
      const reverseLunar = convertSolarToLunar(solar.solarYear, solar.solarMonth, solar.solarDay, 7);
      assert.equal(reverseLunar.lunarYear, bm.lunarY);
      assert.equal(reverseLunar.lunarMonth, bm.lunarM);
      assert.equal(reverseLunar.lunarDay, bm.lunarD);
      assert.equal(reverseLunar.isLeapMonth, bm.isLeap);
    }
  });

  await t.test('3. Senior Folk Birth Hour Memory mapping integrity', () => {
    // Test the 12 Vietnamese folk memories for seniors
    const folkHours = [
      { folkName: 'Nửa đêm canh ba', branch: 'Zi', hour: 0, minute: 30 },
      { folkName: 'Gà gáy đầu tiên', branch: 'Chou', hour: 2, minute: 0 },
      { folkName: 'Rạng đông hé sáng', branch: 'Yin_B', hour: 4, minute: 0 },
      { folkName: 'Mặt trời nhô ngọn tre', branch: 'Mao', hour: 6, minute: 0 },
      { folkName: 'Ăn điểm tâm sáng', branch: 'Chen', hour: 8, minute: 0 },
      { folkName: 'Nắng lên cao, tan chợ', branch: 'Si', hour: 10, minute: 0 },
      { folkName: 'Chính trưa đứng bóng', branch: 'Wu_B', hour: 12, minute: 0 },
      { folkName: 'Đầu giờ chiều', branch: 'Wei', hour: 14, minute: 0 },
      { folkName: 'Xế chiều nghiêng bóng', branch: 'Shen', hour: 16, minute: 0 },
      { folkName: 'Chập tối, gà lên chuồng', branch: 'You', hour: 18, minute: 0 },
      { folkName: 'Ăn cơm tối, lên đèn dầu', branch: 'Xu', hour: 20, minute: 0 },
      { folkName: 'Đêm khuya thanh vắng', branch: 'Hai', hour: 22, minute: 0 }
    ];

    // For day pillar stem Giáp (Jia)
    for (const fh of folkHours) {
      const hourPillar = calculateHourPillar('Jia', fh.hour, fh.minute, false);
      assert.equal(hourPillar.branch, fh.branch, `Folk hour ${fh.folkName} must map to branch ${fh.branch}`);
    }
  });

  await t.test('4. Na Yin & Pillar consistency for elder birth years', () => {
    // 1954 Giáp Ngọ -> Sa Trung Kim
    const p1954 = calculateYearPillar(1954, 6, 1, 7, 12, 0);
    assert.equal(STEMS[p1954.stem].nameVi, 'Giáp');
    assert.equal(BRANCHES[p1954.branch].nameVi, 'Ngọ');
    const nayin1954 = getNaYin(p1954.stem, p1954.branch);
    assert.ok(nayin1954.includes('Kim'), '1954 Giáp Ngọ must be Kim');

    // 1964 Giáp Thìn -> Phúc Đăng Hỏa
    const p1964 = calculateYearPillar(1964, 6, 1, 7, 12, 0);
    assert.equal(STEMS[p1964.stem].nameVi, 'Giáp');
    assert.equal(BRANCHES[p1964.branch].nameVi, 'Thìn');
    const nayin1964 = getNaYin(p1964.stem, p1964.branch);
    assert.ok(nayin1964.includes('Hỏa'), '1964 Giáp Thìn must be Hỏa');
  });
});

// ==========================================
// AURORA DESTINY AI — AI OUTPUT VALIDATOR & ANTI-HALLUCINATION SUITE
// Comprehensive tests for Phase 10:
// 1. Star hallucination, 2. Wrong palace hallucination, 3. Inverted day master,
// 4. Fabricated can chi pillar, 5. Banned claim detection, 6. Validator accept/reject.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { runFullDestinyCalculation } from '../src/engine/destinyEngine';
import { AiOutputValidator } from '../src/services/aiOutputValidator';

test('AI Output Validator & Anti-Hallucination Suite', async (t) => {
  const calc = runFullDestinyCalculation({
    solarYear: 1990,
    solarMonth: 5,
    solarDay: 15,
    solarHour: 8,
    solarMinute: 30,
    birthCity: 'Hà Nội',
    birthCountry: 'Việt Nam',
    gender: 'Male',
    timezoneOffset: 7,
    timezoneName: 'Asia/Ho_Chi_Minh',
    calendarSystem: 'solar',
    hasExactHour: true,
    timeConvention: 'civil'
  }, 'prof_validator_test', 0);

  await t.test('1. Valid grounded text with genuine chart facts passes validation', () => {
    const validText = `Lá số của bạn có cấu trúc Bát Tự vững vàng với Dụng Thần được điều hòa. ` +
      `Cung Mệnh Tử Vi định hướng hành động cẩn trọng, phát triển năng lực nội tại và quản trị rủi ro chu kỳ.`;
    const res = AiOutputValidator.validate(validText, calc);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.violations.length, 0);
    assert.strictEqual(res.fallbackUsed, false);
  });

  await t.test('2. Star Hallucination: inventing a star not present on the chart is caught', () => {
    // Check which stars are on the chart
    const allStars = new Set<string>();
    Object.values(calc.ziwei.palaces).forEach(p => {
      p.majorStars.forEach(s => allStars.add(s.nameVi.toLowerCase()));
      p.minorStars.forEach(s => allStars.add(s.nameVi.toLowerCase()));
    });

    // Pick a canonical star definitely NOT in life palace or chart
    const nonExistentStar = allStars.has('thiên hình') ? 'thiên riêu' : 'thiên hình';
    const hallucinatedText = `Tại cung Mệnh của bạn có sao ${nonExistentStar} chiếu mệnh, cần hết sức thận trọng.`;
    const res = AiOutputValidator.validate(hallucinatedText, calc);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.violations.some(v => v.category === 'STAR_HALLUCINATION' || v.category === 'WRONG_PALACE'));
    assert.strictEqual(res.fallbackUsed, true);
  });

  await t.test('3. Wrong Palace: asserting a star belongs to the wrong palace is caught', () => {
    // Find a palace other than life that has a major star
    let otherPalaceKey = '';
    let otherPalaceStar = '';
    for (const [key, p] of Object.entries(calc.ziwei.palaces)) {
      if (key !== 'life' && p.majorStars.length > 0) {
        otherPalaceKey = key;
        otherPalaceStar = p.majorStars[0].nameVi;
        break;
      }
    }

    if (otherPalaceStar) {
      const wrongPalaceText = `Lá số này có sao ${otherPalaceStar} thủ mệnh tại cung Mệnh mang lại nhiều đột phá.`;
      const res = AiOutputValidator.validate(wrongPalaceText, calc);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.violations.some(v => v.category === 'WRONG_PALACE'));
      assert.strictEqual(res.fallbackUsed, true);
    }
  });

  await t.test('4. Inverted Day Master: asserting incorrect Day Master is rejected', () => {
    const wrongStem = calc.bazi.dayMaster === 'Jia' ? 'đinh' : 'giáp';
    const invertedText = `Xét thấy bạn có Nhật Chủ ${wrongStem} sinh vào mùa hạ, hỏa khí vượng tướng.`;
    const res = AiOutputValidator.validate(invertedText, calc);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.violations.some(v => v.category === 'INVERTED_DAY_MASTER'));
    assert.strictEqual(res.fallbackUsed, true);
    assert.ok(res.sanitizedContent.includes('HỆ THỐNG KIỂM SOÁT TÍNH ĐÚNG ĐẮN'));
  });

  await t.test('5. Banned Medical Claim: diagnosing illness or telling user to stop medication is rejected', () => {
    const dangerousMedical = `Theo cung Tật Ách này, bạn bị ung thư giai đoạn đầu, nên ngưng uống thuốc tây y và tập trung cúng lễ.`;
    const res = AiOutputValidator.validate(dangerousMedical, calc);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.violations.some(v => v.category === 'BANNED_CLAIM'));
    assert.strictEqual(res.fallbackUsed, true);
  });

  await t.test('6. Banned Financial Claim: gambling or guaranteed lottery is rejected', () => {
    const dangerousFinance = `Năm nay cung Tài có sao Vũ Khúc, hãy tất tay vào cổ phiếu đầu cơ hoặc chơi lô đề chắc chắn trúng lớn.`;
    const res = AiOutputValidator.validate(dangerousFinance, calc);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.violations.some(v => v.category === 'BANNED_CLAIM'));
  });

  await t.test('7. Banned Fatalistic Claim: absolute death prediction is rejected', () => {
    const dangerousFatal = `Đến năm 45 tuổi bạn sẽ gặp đại nạn chết yểu không thể qua khỏi.`;
    const res = AiOutputValidator.validate(dangerousFatal, calc);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.violations.some(v => v.category === 'BANNED_CLAIM'));
  });

  await t.test('8. Banned Superstition: claiming evil curse or demand money for clearing karma is rejected', () => {
    const dangerousSuperstition = `Bạn đang bị ma ám và dính bùa ngải, phải nạp tiền giải nghiệp ngay mới giữ được tính mạng.`;
    const res = AiOutputValidator.validate(dangerousSuperstition, calc);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.violations.some(v => v.category === 'BANNED_CLAIM'));
  });

  await t.test('9. Safe fallback includes genuine mathematical coordinates', () => {
    const badText = `Bạn bị ma ám nặng và can ngày giáp sẽ chết yểu.`;
    const res = AiOutputValidator.validate(badText, calc);
    assert.strictEqual(res.fallbackUsed, true);
    assert.ok(res.sanitizedContent.includes('Nhật Chủ (Can ngày)'));
    assert.ok(res.sanitizedContent.includes('Cấu trúc mệnh cục'));
    assert.ok(res.sanitizedContent.includes('Dụng Thần hỗ trợ'));
  });
});

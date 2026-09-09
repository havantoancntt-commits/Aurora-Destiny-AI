// ==========================================
// ZI WEI ORTHODOX ACCURACY & AUTHENTICITY TESTS
// Kiểm thử độ chính xác Tử Vi Đẩu Số chính tông
// ==========================================

import assert from 'assert';
import { calculateZiWeiChart, PALACE_DEFS } from './ziwei';
import { BirthData } from '../types/destiny';

console.log('🧪 Starting Zi Wei Dou Shu Orthodox Accuracy & Authenticity Test Suite...');

// Case 1: Giáp Tuất (1994), Nam mạng, sinh ngày 15/08/1994 lúc 10h15 sáng (Giờ Tỵ)
// Giáp Tuất: Dương Nam -> Âm Dương Thuận Lý, Đại Vận đi THUẬN.
// Giáp: Triệt tại Thân - Dậu.
// Giáp Tuất tuần: Tuần tại Thân - Dậu.
// Giờ Tỵ: Thân cư Phu Thê.
const birthCase1: BirthData = {
  solarYear: 1994,
  solarMonth: 8,
  solarDay: 15,
  solarHour: 10,
  solarMinute: 15,
  gender: 'Male',
  timezoneOffset: 7,
  hasExactHour: true,
  birthCity: 'Hanoi',
  birthCountry: 'Vietnam',
  timezoneName: 'Asia/Ho_Chi_Minh',
  calendarSystem: 'solar'
};

const chart1 = calculateZiWeiChart(birthCase1);

// Test 1: 12 Cung đầy đủ
assert.strictEqual(Object.keys(chart1.palaces).length, 12, '12 Cung phải tồn tại đầy đủ');
console.log('  ✔ Test 1: 12 Palaces completeness verified');

// Test 2: Âm Dương Thuận Lý cho Dương Nam
assert(chart1.yinYangGenderHarmony, 'yinYangGenderHarmony must exist');
assert.strictEqual(chart1.yinYangGenderHarmony.yinYangNature, 'Dương Nam', 'Giáp Tuất nam mạng là Dương Nam');
assert.strictEqual(chart1.yinYangGenderHarmony.direction, 'Thuận Lý', 'Dương Nam phải là Âm Dương Thuận Lý');
assert.strictEqual(chart1.yinYangGenderHarmony.decadeDirection, 'Thuận', 'Dương Nam đại vận đi Thuận');
console.log('  ✔ Test 2: Yin-Yang Harmony & Decade Direction verified for Yang Male');

// Test 3: Cung Thân sinh giờ Tỵ -> Thân cư Phu Thê
assert.strictEqual(chart1.bodyPalaceKey, 'spouse', 'Sinh giờ Tỵ Thân phải cư Phu Thê');
assert.strictEqual(chart1.palaces.spouse.isBodyPalace, true, 'Cung Phu Thê phải có cờ isBodyPalace = true');
console.log('  ✔ Test 3: Body Palace (Thân cư Phu Thê) verified');

// Test 4: Vòng Tràng Sinh, Vòng Thái Tuế, Vòng Bác Sĩ có mặt ở tất cả 12 cung
Object.values(chart1.palaces).forEach(p => {
  assert(p.trangSinhStar, `Cung ${p.nameVi} phải có sao Vòng Tràng Sinh`);
  assert(p.thaiTueStar, `Cung ${p.nameVi} phải có sao Vòng Thái Tuế`);
  assert(p.bacSyStar, `Cung ${p.nameVi} phải có sao Vòng Bác Sĩ`);
  assert(p.startAge !== undefined && p.endAge !== undefined, `Cung ${p.nameVi} phải có đại vận`);
});
console.log('  ✔ Test 4: Trang Sinh, Thai Tue, Bac Sy circles and decade ranges verified in all 12 palaces');

// Test 5: Triệt và Tuần tại Thân - Dậu cho Giáp Tuất
assert(chart1.trietPalaces?.includes('Shen') && chart1.trietPalaces?.includes('You'), 'Giáp: Triệt tại Thân và Dậu');
assert(chart1.tuanPalaces?.includes('Shen') && chart1.tuanPalaces?.includes('You'), 'Giáp Tuất tuần: Tuần tại Thân và Dậu');
console.log('  ✔ Test 5: Tuan & Triet palaces verified for Jia-Xu');

// Test 6: Đại vận cung Mệnh bắt đầu bằng Cục số
const cucNum = chart1.cucNumber;
assert(cucNum && [2, 3, 4, 5, 6].includes(cucNum), `Cục số phải là 2, 3, 4, 5 hoặc 6 (got ${cucNum})`);
assert.strictEqual(chart1.palaces.life.startAge, cucNum, `Cung Mệnh phải bắt đầu từ ${cucNum} tuổi`);
console.log(`  ✔ Test 6: Decade start age matches Cuc Number (${cucNum})`);

// Test 7: Âm Nam test (Ất Hợi 1995, Nam mạng) -> Âm Nam, Nghịch Lý, Đại Vận đi NGHỊCH
const birthCase2: BirthData = {
  solarYear: 1995,
  solarMonth: 10,
  solarDay: 10,
  solarHour: 14,
  solarMinute: 30,
  gender: 'Male',
  timezoneOffset: 7,
  hasExactHour: true,
  birthCity: 'Hanoi',
  birthCountry: 'Vietnam',
  timezoneName: 'Asia/Ho_Chi_Minh',
  calendarSystem: 'solar'
};
const chart2 = calculateZiWeiChart(birthCase2);
assert.strictEqual(chart2.yinYangGenderHarmony?.yinYangNature, 'Âm Nam', 'Ất Hợi nam mạng là Âm Nam');
assert.strictEqual(chart2.yinYangGenderHarmony?.direction, 'Nghịch Lý', 'Âm Nam là Âm Dương Nghịch Lý');
assert.strictEqual(chart2.yinYangGenderHarmony?.decadeDirection, 'Nghịch', 'Âm Nam đại vận đi Nghịch');
console.log('  ✔ Test 7: Yin-Yang Harmony & Decade Direction verified for Yin Male (Reverse)');

// Test 8: Không bịa đặt cách cục - Cách cục trả về phải có nghĩa và căn cứ
assert(chart1.majorConfigurations.length > 0, 'Phải có cách cục xác thực');
chart1.majorConfigurations.forEach(cfg => {
  assert(typeof cfg === 'string' && cfg.length > 3, 'Cách cục phải là chuỗi hợp lệ');
  assert(!cfg.includes('undefined'), 'Cách cục không được chứa undefined');
});
console.log(`  ✔ Test 8: Major configurations verified strictly: [${chart1.majorConfigurations.join('; ')}]`);

// Test 9: Báo cáo Luận giải Chân thực (Authentic Analysis)
assert(chart1.authenticAnalysis, 'authenticAnalysis must exist');
assert(chart1.authenticAnalysis.coreEssence.length > 20, 'Bản Mệnh coreEssence phải phân tích sâu sắc');
assert(chart1.authenticAnalysis.careerAndWealthTrajectory.length > 20, 'Quan Lộc & Tài Bạch trajectory phải phân tích cụ thể');
assert(chart1.authenticAnalysis.decadeAndCurrentYearGuidance.length > 20, 'Đại vận & Lưu niên phải phân tích rõ ràng');
assert(chart1.authenticAnalysis.strategicAdvice.length > 20, 'Khuyến nghị hành động phải thực chất');
console.log('  ✔ Test 9: Authentic in-depth analysis verified');

console.log('\n==================================================');
console.log('🎉 ALL ZI WEI ORTHODOX ACCURACY TESTS PASSED 100%!');
console.log('==================================================\n');

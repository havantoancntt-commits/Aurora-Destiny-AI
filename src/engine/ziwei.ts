// ==========================================
// ZI WEI DOU SHU (TỬ VI ĐẨU SỐ) ENGINE
// Chuẩn xác, chính tông, bảo đảm tính xác thực
// Không tự ý thêm bớt đặt điều - Phản ánh chân thực lá số mỗi cá nhân
// ==========================================

import {
  ZiWeiChart,
  ZiWeiPalace,
  ZiWeiStar,
  PalaceKey,
  BirthData,
  HeavenlyStem,
  EarthlyBranch,
  FiveElement
} from '../types/destiny';
import { BRANCH_KEYS, STEM_KEYS, STEMS, getNaYin } from './canchi';
import { convertSolarToLunar } from './lunarSolar';
import { calculateYearPillar } from './bazi';
import { generateAuthenticZiWeiReport } from './ziweiInterpretation';

export const PALACE_DEFS: { key: PalaceKey; nameVi: string; nameEn: string; focalTheme: string }[] = [
  { key: 'life', nameVi: 'Mệnh', nameEn: 'Life / Destiny', focalTheme: 'Bản thể, tư chất bẩm sinh, ý chí và mô hình định mệnh cốt lõi' },
  { key: 'siblings', nameVi: 'Huynh Đệ', nameEn: 'Siblings & Peers', focalTheme: 'Mối quan hệ anh em, tri kỷ, mạng lưới đồng nghiệp cộng sự' },
  { key: 'spouse', nameVi: 'Phu Thê', nameEn: 'Spouse & Marriage', focalTheme: 'Hôn nhân phối ngẫu, duyên nợ tình cảm, sự hòa hợp tâm thức' },
  { key: 'children', nameVi: 'Tử Tức', nameEn: 'Children & Subordinates', focalTheme: 'Hậu duệ, thế hệ kế cận, truyền thừa và mối nhân duyên con cái' },
  { key: 'wealth', nameVi: 'Tài Bạch', nameEn: 'Wealth & Assets', focalTheme: 'Dòng tiền, năng lực tạo dựng của cải, tư duy quản trị tài chính' },
  { key: 'health', nameVi: 'Tật Ách', nameEn: 'Health & Well-being', focalTheme: 'Thể chất, năng lượng sinh học, phòng ngừa rủi ro và bệnh tật' },
  { key: 'travel', nameVi: 'Thiên Di', nameEn: 'Travel & Outer World', focalTheme: 'Môi trường ngoại cảnh, khả năng xuất ngoại, vị thế xã hội bên ngoài' },
  { key: 'friends', nameVi: 'Nô Bộc', nameEn: 'Friends & Allies', focalTheme: 'Bạn bè, đối tác hợp tác, cấp dưới và trợ lực xã hội' },
  { key: 'career', nameVi: 'Quan Lộc', nameEn: 'Career & Authority', focalTheme: 'Sự nghiệp chuyên môn, quyền lực, con đường công danh chức vụ' },
  { key: 'property', nameVi: 'Điền Trạch', nameEn: 'Property & Real Estate', focalTheme: 'Bất động sản, tài sản tích lũy, cơ nghiệp tổ phụ và gia trạch' },
  { key: 'karma', nameVi: 'Phúc Đức', nameEn: 'Spiritual Well-being & Karma', focalTheme: 'Đời sống tinh thần, phúc trạch tổ tiên, nội tâm an nhiên tĩnh tại' },
  { key: 'parents', nameVi: 'Phụ Mẫu', nameEn: 'Parents & Mentors', focalTheme: 'Cha mẹ, tiền bối nâng đỡ, ân điển gia tộc và nguồn cội che chở' },
];

// Determine Four Transformations (Tứ Hóa: Lộc, Quyền, Khoa, Kỵ) by Year Stem
export function getTuHoa(yearStem: HeavenlyStem): Record<'Lu' | 'Quan' | 'Khoa' | 'Ky', string> {
  const tuHoaMap: Record<HeavenlyStem, Record<'Lu' | 'Quan' | 'Khoa' | 'Ky', string>> = {
    Jia: { Lu: 'Liêm Trinh', Quan: 'Phá Quân', Khoa: 'Vũ Khúc', Ky: 'Thái Dương' },
    Yi: { Lu: 'Thiên Cơ', Quan: 'Thiên Lương', Khoa: 'Tử Vi', Ky: 'Thái Âm' },
    Bing: { Lu: 'Thiên Đồng', Quan: 'Thiên Cơ', Khoa: 'Văn Xương', Ky: 'Liêm Trinh' },
    Ding: { Lu: 'Thái Âm', Quan: 'Thiên Đồng', Khoa: 'Thiên Cơ', Ky: 'Cự Môn' },
    Wu: { Lu: 'Tham Lang', Quan: 'Thái Âm', Khoa: 'Hữu Bật', Ky: 'Thiên Cơ' },
    Ji: { Lu: 'Vũ Khúc', Quan: 'Tham Lang', Khoa: 'Thiên Lương', Ky: 'Văn Khúc' },
    Geng: { Lu: 'Thái Dương', Quan: 'Vũ Khúc', Khoa: 'Thái Âm', Ky: 'Thiên Đồng' },
    Xin: { Lu: 'Cự Môn', Quan: 'Thái Dương', Khoa: 'Văn Khúc', Ky: 'Văn Xương' },
    Ren: { Lu: 'Thiên Lương', Quan: 'Tử Vi', Khoa: 'Tả Phụ', Ky: 'Vũ Khúc' },
    Gui: { Lu: 'Phá Quân', Quan: 'Cự Môn', Khoa: 'Thái Âm', Ky: 'Tham Lang' },
  };

  return tuHoaMap[yearStem] || tuHoaMap['Jia'];
}

// 14 Major Stars Reference
export const MAJOR_STARS: { nameVi: string; nameEn: string; nameZh: string; element: FiveElement }[] = [
  { nameVi: 'Tử Vi', nameEn: 'Emperor (Zi Wei)', nameZh: '紫微', element: 'Earth' },
  { nameVi: 'Thiên Cơ', nameEn: 'Strategist (Tian Ji)', nameZh: '天機', element: 'Wood' },
  { nameVi: 'Thái Dương', nameEn: 'Sun (Tai Yang)', nameZh: '太陽', element: 'Fire' },
  { nameVi: 'Vũ Khúc', nameEn: 'General / Financier (Wu Qu)', nameZh: '武曲', element: 'Metal' },
  { nameVi: 'Thiên Đồng', nameEn: 'Lucky Child (Tian Tong)', nameZh: '天同', element: 'Water' },
  { nameVi: 'Liêm Trinh', nameEn: 'Judge / Diplomat (Lian Zhen)', nameZh: '廉貞', element: 'Fire' },
  { nameVi: 'Thiên Phủ', nameEn: 'Treasury / Empress (Tian Fu)', nameZh: '天府', element: 'Earth' },
  { nameVi: 'Thái Âm', nameEn: 'Moon (Tai Yin)', nameZh: '太陰', element: 'Water' },
  { nameVi: 'Tham Lang', nameEn: 'Wolf of Desire (Tan Lang)', nameZh: '貪狼', element: 'Wood' },
  { nameVi: 'Cự Môn', nameEn: 'Great Gate / Orator (Ju Men)', nameZh: '巨門', element: 'Water' },
  { nameVi: 'Thiên Tướng', nameEn: 'Prime Minister (Tian Xiang)', nameZh: '天相', element: 'Water' },
  { nameVi: 'Thiên Lương', nameEn: 'Elder Sage (Tian Liang)', nameZh: '天梁', element: 'Earth' },
  { nameVi: 'Thất Sát', nameEn: 'Seven Killings Warrior (Qi Sha)', nameZh: '七殺', element: 'Metal' },
  { nameVi: 'Phá Quân', nameEn: 'Army Breaker / Disruptor (Po Jun)', nameZh: '破軍', element: 'Water' },
];

// Classical Star Brightness: [Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi]
export const STAR_BRIGHTNESS: Record<string, ('M' | 'V' | 'D' | 'B' | 'H')[]> = {
  'Tử Vi':      ['B', 'D', 'M', 'B', 'V', 'V', 'M', 'D', 'M', 'B', 'V', 'B'],
  'Thiên Cơ':   ['D', 'H', 'D', 'M', 'M', 'B', 'M', 'H', 'D', 'M', 'M', 'B'],
  'Thái Dương': ['H', 'H', 'V', 'M', 'V', 'M', 'M', 'D', 'B', 'H', 'H', 'H'],
  'Vũ Khúc':    ['V', 'M', 'V', 'D', 'M', 'B', 'V', 'M', 'V', 'D', 'M', 'B'],
  'Thiên Đồng': ['V', 'H', 'M', 'D', 'B', 'H', 'H', 'H', 'V', 'H', 'B', 'M'],
  'Liêm Trinh': ['B', 'D', 'V', 'H', 'M', 'H', 'V', 'D', 'V', 'H', 'M', 'H'],
  'Thiên Phủ':  ['M', 'M', 'M', 'B', 'M', 'D', 'M', 'M', 'M', 'B', 'M', 'D'],
  'Thái Âm':    ['M', 'D', 'H', 'H', 'H', 'H', 'H', 'B', 'D', 'V', 'M', 'M'],
  'Tham Lang':  ['B', 'M', 'D', 'H', 'M', 'H', 'B', 'M', 'D', 'H', 'M', 'H'],
  'Cự Môn':     ['V', 'H', 'V', 'M', 'H', 'H', 'V', 'H', 'D', 'M', 'H', 'V'],
  'Thiên Tướng':['M', 'D', 'M', 'H', 'D', 'D', 'M', 'D', 'M', 'H', 'D', 'D'],
  'Thiên Lương':['M', 'V', 'M', 'M', 'M', 'H', 'M', 'V', 'H', 'D', 'M', 'H'],
  'Thất Sát':   ['M', 'D', 'M', 'H', 'D', 'H', 'M', 'D', 'M', 'H', 'D', 'B'],
  'Phá Quân':   ['M', 'V', 'H', 'H', 'V', 'D', 'M', 'V', 'H', 'H', 'V', 'D'],
};

// Classical formula to locate Tử Vi star position (Branch index: 0=Zi, 1=Chou, ..., 11=Hai)
function getTuViBranchIndex(lunarDay: number, cucNumber: number): number {
  const remainder = lunarDay % cucNumber;
  if (remainder === 0) {
    const q = lunarDay / cucNumber;
    return (1 + q) % 12; // In Earthly Branches: Dần is index 2. 2 + q - 1 = 1 + q.
  }
  const x = cucNumber - remainder;
  const q = (lunarDay + x) / cucNumber;
  if (x % 2 === 0) {
    return (1 + q + x) % 12;
  } else {
    return (1 + q - x + 24) % 12;
  }
}

// Xác định Triệt Không (Triệt Lộ Không Vong) theo Can năm sinh
function getTrietBranches(yearStem: HeavenlyStem): [EarthlyBranch, EarthlyBranch] {
  switch (yearStem) {
    case 'Jia':
    case 'Ji':
      return ['Shen', 'You']; // Thân, Dậu
    case 'Yi':
    case 'Geng':
      return ['Wu_B', 'Wei']; // Ngọ, Mùi
    case 'Bing':
    case 'Xin':
      return ['Chen', 'Si']; // Thìn, Tỵ
    case 'Ding':
    case 'Ren':
      return ['Yin_B', 'Mao']; // Dần, Mão
    case 'Wu':
    case 'Gui':
    default:
      return ['Zi', 'Chou']; // Tý, Sửu
  }
}

// Xác định Tuần Không (Tuần Trung Không Vong) theo Can Chi năm sinh
function getTuanBranches(yearStemIdx: number, yearBranchIdx: number): [EarthlyBranch, EarthlyBranch] {
  const diff = (yearBranchIdx - yearStemIdx + 12) % 12;
  switch (diff) {
    case 0:  return ['Xu', 'Hai'];     // Giáp Tý tuần: Tuất, Hợi
    case 10: return ['Shen', 'You'];   // Giáp Tuất tuần: Thân, Dậu
    case 8:  return ['Wu_B', 'Wei'];   // Giáp Thân tuần: Ngọ, Mùi
    case 6:  return ['Chen', 'Si'];    // Giáp Ngọ tuần: Thìn, Tỵ
    case 4:  return ['Yin_B', 'Mao'];  // Giáp Thìn tuần: Dần, Mão
    case 2:
    default: return ['Zi', 'Chou'];    // Giáp Dần tuần: Tý, Sửu
  }
}

export function calculateZiWeiChart(birthData: BirthData, options?: { analysisYear?: number }): ZiWeiChart {
  const yearConvention = birthData.ziweiYearConvention || 'solarLapXuan';
  const leapMonthConvention = birthData.ziweiLeapMonthConvention || 'midMonthSplit';

  const lunar = convertSolarToLunar(
    birthData.solarYear,
    birthData.solarMonth,
    birthData.solarDay,
    birthData.timezoneOffset,
    birthData.isLateRat,
    birthData.solarHour
  );

  // Determine Year Can-Chi based on selected Zi Wei convention
  let yearStem: HeavenlyStem;
  let yearBranch: EarthlyBranch;
  let yearStemIdx: number;
  let yearBranchIdx: number;

  const yearPB = calculateYearPillar(
    birthData.solarYear,
    birthData.solarMonth,
    birthData.solarDay,
    birthData.timezoneOffset,
    birthData.solarHour,
    birthData.solarMinute || 0
  );

  if (yearConvention === 'lunarNewYear') {
    // Orthodox Classical Zi Wei (Tử Vi Đẩu Số Toàn Thư / Trần Đoàn): Year switches at Lunar New Year
    const ziweiYear = lunar.lunarYear;
    yearStemIdx = ((ziweiYear - 4) % 10 + 10) % 10;
    yearBranchIdx = ((ziweiYear - 4) % 12 + 12) % 12;
    yearStem = STEM_KEYS[yearStemIdx];
    yearBranch = BRANCH_KEYS[yearBranchIdx];
  } else {
    // Solar Term / Lập Xuân Convention (Bắc Phái / Tử Vân): Year switches at Solar Longitude 315°
    yearStem = yearPB.stem;
    yearBranch = yearPB.branch;
    yearStemIdx = STEM_KEYS.indexOf(yearStem);
    yearBranchIdx = BRANCH_KEYS.indexOf(yearBranch);
  }

  const tuHoa = getTuHoa(yearStem);

  // Handle Leap Month (Tháng Nhuận) in Zi Wei
  let effectiveLunarMonth = lunar.lunarMonth;
  if (lunar.isLeapMonth && leapMonthConvention === 'midMonthSplit' && lunar.lunarDay > 15) {
    // Classical rule: If born past the 15th of leap month, count into following month
    effectiveLunarMonth = (lunar.lunarMonth % 12) + 1;
  }

  // Hour branch index (Tý = 0, Sửu = 1, Dần = 2, ...)
  const birthHourBranchIdx = Math.floor((birthData.solarHour + 1) / 2) % 12;

  // Cung Mệnh: Từ Dần (2), đếm thuận đến tháng sinh âm lịch, rồi đếm nghịch đến giờ sinh
  const lifePalaceBranchIdx = (2 + (effectiveLunarMonth - 1) - birthHourBranchIdx + 24) % 12;

  // Cung Thân: Từ Dần (2), đếm thuận đến tháng sinh âm lịch, rồi đếm thuận đến giờ sinh
  const bodyPalaceBranchIdx = (2 + (effectiveLunarMonth - 1) + birthHourBranchIdx) % 12;

  // Xác định Can của Cung Mệnh bằng Ngũ Hổ Độn từ Can Năm
  const startStemForYin = ((yearStemIdx % 5) * 2 + 2) % 10;
  const lifePalaceStemIdx = (startStemForYin + ((lifePalaceBranchIdx - 2 + 12) % 12)) % 10;
  const lifePalaceStem = STEM_KEYS[lifePalaceStemIdx];
  const lifePalaceBranch = BRANCH_KEYS[lifePalaceBranchIdx];

  // Cục determination based on Na Yin of Life Palace Can-Chi
  const lifeNaYin = getNaYin(lifePalaceStem, lifePalaceBranch);
  let cucNumber = 4; // default Kim Tứ Cục
  let elementBureau = 'Kim Tứ Cục (Metal 4)';

  if (lifeNaYin.includes('Thủy')) {
    cucNumber = 2;
    elementBureau = 'Thủy Nhị Cục (Water 2)';
  } else if (lifeNaYin.includes('Mộc')) {
    cucNumber = 3;
    elementBureau = 'Mộc Tam Cục (Wood 3)';
  } else if (lifeNaYin.includes('Kim')) {
    cucNumber = 4;
    elementBureau = 'Kim Tứ Cục (Metal 4)';
  } else if (lifeNaYin.includes('Thổ')) {
    cucNumber = 5;
    elementBureau = 'Thổ Ngũ Cục (Earth 5)';
  } else if (lifeNaYin.includes('Hỏa')) {
    cucNumber = 6;
    elementBureau = 'Hỏa Lục Cục (Fire 6)';
  }

  // Exact Tử Vi star placement
  const tuViBranchIdx = getTuViBranchIndex(lunar.lunarDay, cucNumber);

  // Exact Thiên Phủ star placement (Đối xứng với Tử Vi qua trục Dần - Thân)
  const thienPhuBranchIdx = (4 - tuViBranchIdx + 24) % 12;

  // Map 14 major stars to their exact Earthly Branches
  const majorStarBranchMap: Record<number, { nameVi: string; nameEn: string; nameZh: string; element: FiveElement }[]> = {};
  for (let i = 0; i < 12; i++) majorStarBranchMap[i] = [];

  // Group 1: 6 stars from Tử Vi
  const tuViGroup: { offset: number; name: string }[] = [
    { offset: 0, name: 'Tử Vi' },
    { offset: -1, name: 'Thiên Cơ' },
    { offset: -3, name: 'Thái Dương' },
    { offset: -4, name: 'Vũ Khúc' },
    { offset: -5, name: 'Thiên Đồng' },
    { offset: -8, name: 'Liêm Trinh' }
  ];

  tuViGroup.forEach(item => {
    const bIdx = (tuViBranchIdx + item.offset + 24) % 12;
    const def = MAJOR_STARS.find(s => s.nameVi === item.name)!;
    majorStarBranchMap[bIdx].push(def);
  });

  // Group 2: 8 stars from Thiên Phủ
  const thienPhuGroup: { offset: number; name: string }[] = [
    { offset: 0, name: 'Thiên Phủ' },
    { offset: 1, name: 'Thái Âm' },
    { offset: 2, name: 'Tham Lang' },
    { offset: 3, name: 'Cự Môn' },
    { offset: 4, name: 'Thiên Tướng' },
    { offset: 5, name: 'Thiên Lương' },
    { offset: 6, name: 'Thất Sát' },
    { offset: 10, name: 'Phá Quân' }
  ];

  thienPhuGroup.forEach(item => {
    const bIdx = (thienPhuBranchIdx + item.offset) % 12;
    const def = MAJOR_STARS.find(s => s.nameVi === item.name)!;
    majorStarBranchMap[bIdx].push(def);
  });

  // ==========================================
  // Âm Dương Nam Nữ và Chiều Đại Vận / Tràng Sinh / Bác Sĩ
  // ==========================================
  const isYangYear = STEMS[yearStem].yinYang === 'Yang';
  const isMale = birthData.gender === 'Male';
  const isThuan = (isMale && isYangYear) || (!isMale && !isYangYear); // Dương Nam / Âm Nữ đi THUẬN

  // Classical Auxiliary Stars exact branch calculations
  // Tả Phụ (từ Thìn thuận), Hữu Bật (từ Tuất nghịch)
  const taPhuBranch = (4 + (lunar.lunarMonth - 1)) % 12;
  const huuBatBranch = (10 - (lunar.lunarMonth - 1) + 24) % 12;

  // Văn Xương (từ Tuất nghịch), Văn Khúc (từ Thìn thuận)
  const vanXuongBranch = (10 - birthHourBranchIdx + 24) % 12;
  const vanKhucBranch = (4 + birthHourBranchIdx) % 12;

  // Lộc Tồn by Year Stem: Giáp->Dần(2), Ất->Mão(3), Bính/Mậu->Tỵ(5), Đinh/Kỷ->Ngọ(6), Canh->Thân(8), Tân->Dậu(9), Nhâm->Hợi(11), Quý->Tý(0)
  const locTonBranches = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
  const locTonBranch = locTonBranches[yearStemIdx];
  const kinhDuongBranch = (locTonBranch + 1) % 12;
  const daLaBranch = (locTonBranch - 1 + 12) % 12;

  // Thiên Khôi, Thiên Việt
  const thienKhoiBranches = [1, 0, 11, 11, 1, 0, 6, 6, 3, 3];
  const thienVietBranches = [7, 8, 9, 9, 7, 8, 2, 2, 5, 5];
  const thienKhoiBranch = thienKhoiBranches[yearStemIdx];
  const thienVietBranch = thienVietBranches[yearStemIdx];

  // Địa Không, Địa Kiếp (từ Hợi)
  const diaKhongBranch = (11 - birthHourBranchIdx + 24) % 12;
  const diaKiepBranch = (11 + birthHourBranchIdx) % 12;

  // Hỏa Tinh, Linh Tinh (theo Tam hợp Chi năm và Chiều Nam Nữ)
  let hoaTinhStart = 1; // Sửu
  let linhTinhStart = 3; // Mão
  if ([2, 6, 10].includes(yearBranchIdx)) { // Dần Ngọ Tuất
    hoaTinhStart = 1; linhTinhStart = 3;
  } else if ([8, 0, 4].includes(yearBranchIdx)) { // Thân Tý Thìn
    hoaTinhStart = 2; linhTinhStart = 10;
  } else if ([5, 9, 1].includes(yearBranchIdx)) { // Tỵ Dậu Sửu
    hoaTinhStart = 3; linhTinhStart = 10;
  } else { // Hợi Mão Mùi
    hoaTinhStart = 9; linhTinhStart = 10;
  }

  const hoaTinhBranch = isThuan
    ? (hoaTinhStart + birthHourBranchIdx) % 12
    : (hoaTinhStart - birthHourBranchIdx + 24) % 12;
  const linhTinhBranch = (linhTinhStart + birthHourBranchIdx) % 12;

  // Thiên Mã (theo Tam hợp Chi năm)
  let thienMaBranch = 8;
  if ([2, 6, 10].includes(yearBranchIdx)) thienMaBranch = 8; // Thân
  else if ([8, 0, 4].includes(yearBranchIdx)) thienMaBranch = 2; // Dần
  else if ([5, 9, 1].includes(yearBranchIdx)) thienMaBranch = 11; // Hợi
  else thienMaBranch = 5; // Tỵ

  // Đào Hoa / Hàm Trì
  let daoHoaBranch = 3;
  if ([2, 6, 10].includes(yearBranchIdx)) daoHoaBranch = 3; // Mão
  else if ([8, 0, 4].includes(yearBranchIdx)) daoHoaBranch = 9; // Dậu
  else if ([5, 9, 1].includes(yearBranchIdx)) daoHoaBranch = 6; // Ngọ
  else daoHoaBranch = 0; // Tý

  // Hồng Loan, Thiên Hỷ
  const hongLoanBranch = (3 - yearBranchIdx + 24) % 12;
  const thienHyBranch = (hongLoanBranch + 6) % 12;

  // Thiên Khốc, Thiên Hư
  const thienKhocBranch = (6 - yearBranchIdx + 24) % 12;
  const thienHuBranch = (6 + yearBranchIdx) % 12;

  // Cô Thần, Quả Tú
  let coThanBranch = 5;
  let quaTuBranch = 1;
  if ([11, 0, 1].includes(yearBranchIdx)) { // Hợi Tý Sửu
    coThanBranch = 2; quaTuBranch = 10;
  } else if ([2, 3, 4].includes(yearBranchIdx)) { // Dần Mão Thìn
    coThanBranch = 5; quaTuBranch = 1;
  } else if ([5, 6, 7].includes(yearBranchIdx)) { // Tỵ Ngọ Mùi
    coThanBranch = 8; quaTuBranch = 4;
  } else { // Thân Dậu Tuất
    coThanBranch = 11; quaTuBranch = 7;
  }

  // Thiên Hình, Thiên Riêu (theo tháng sinh âm lịch)
  const thienHinhBranch = (9 + lunar.lunarMonth - 1) % 12;
  const thienRieuBranch = (1 + lunar.lunarMonth - 1) % 12;

  // Map auxiliary stars by branch
  const minorStarBranchMap: Record<number, ZiWeiStar[]> = {};
  for (let i = 0; i < 12; i++) minorStarBranchMap[i] = [];

  const addAux = (b: number, nameVi: string, type: 'Lucky' | 'Challenging', element: FiveElement = 'Wood') => {
    minorStarBranchMap[b].push({
      nameVi,
      nameEn: nameVi,
      nameZh: '',
      brightness: 'M',
      element,
      type
    });
  };

  // Cát tinh & Trợ tinh
  addAux(taPhuBranch, 'Tả Phụ', 'Lucky', 'Earth');
  addAux(huuBatBranch, 'Hữu Bật', 'Lucky', 'Water');
  addAux(vanXuongBranch, 'Văn Xương', 'Lucky', 'Metal');
  addAux(vanKhucBranch, 'Văn Khúc', 'Lucky', 'Water');
  addAux(locTonBranch, 'Lộc Tồn', 'Lucky', 'Earth');
  addAux(thienKhoiBranch, 'Thiên Khôi', 'Lucky', 'Fire');
  addAux(thienVietBranch, 'Thiên Việt', 'Lucky', 'Fire');
  addAux(thienMaBranch, 'Thiên Mã', 'Lucky', 'Fire');
  addAux(hongLoanBranch, 'Hồng Loan', 'Lucky', 'Water');
  addAux(thienHyBranch, 'Thiên Hỷ', 'Lucky', 'Water');
  addAux(daoHoaBranch, 'Đào Hoa', 'Lucky', 'Wood');

  // Sát tinh & Hung bại tinh
  addAux(kinhDuongBranch, 'Kình Dương', 'Challenging', 'Metal');
  addAux(daLaBranch, 'Đà La', 'Challenging', 'Metal');
  addAux(diaKhongBranch, 'Địa Không', 'Challenging', 'Fire');
  addAux(diaKiepBranch, 'Địa Kiếp', 'Challenging', 'Fire');
  addAux(hoaTinhBranch, 'Hỏa Tinh', 'Challenging', 'Fire');
  addAux(linhTinhBranch, 'Linh Tinh', 'Challenging', 'Fire');
  addAux(thienKhocBranch, 'Thiên Khốc', 'Challenging', 'Water');
  addAux(thienHuBranch, 'Thiên Hư', 'Challenging', 'Water');
  addAux(coThanBranch, 'Cô Thần', 'Challenging', 'Fire');
  addAux(quaTuBranch, 'Quả Tú', 'Challenging', 'Fire');
  addAux(thienHinhBranch, 'Thiên Hình', 'Challenging', 'Fire');
  addAux(thienRieuBranch, 'Thiên Riêu', 'Challenging', 'Water');

  // ==========================================
  // VÒNG THÁI TUẾ (12 SAO) THEO CHI NĂM SINH
  // ==========================================
  const THAI_TUE_STARS = [
    'Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm',
    'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Long Đức',
    'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Trực Phù'
  ];
  const thaiTueBranchMap: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    const b = (yearBranchIdx + i) % 12;
    thaiTueBranchMap[b] = THAI_TUE_STARS[i];
  }

  // ==========================================
  // VÒNG BÁC SĨ (12 SAO) THEO LỘC TỒN & CHIỀU THUẬN/NGHỊCH
  // ==========================================
  const BAC_SY_STARS = [
    'Bác Sĩ', 'Lực Sĩ', 'Thanh Long', 'Tiểu Hao',
    'Tướng Quân', 'Tấu Thư', 'Phi Liêm', 'Hỷ Thần',
    'Bệnh Phù', 'Đại Hao', 'Phục Binh', 'Quan Phủ'
  ];
  const bacSyBranchMap: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    const b = isThuan
      ? (locTonBranch + i) % 12
      : (locTonBranch - i + 24) % 12;
    bacSyBranchMap[b] = BAC_SY_STARS[i];
  }

  // ==========================================
  // VÒNG TRÀNG SINH (12 SAO) THEO CỤC & CHIỀU THUẬN/NGHỊCH
  // ==========================================
  const TRANG_SINH_STARS = [
    'Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan',
    'Đế Vượng', 'Suy', 'Bệnh', 'Tử',
    'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'
  ];
  let trangSinhStartBranch = 8; // default Thân (Thủy Nhị Cục / Thổ Ngũ Cục)
  if (cucNumber === 2 || cucNumber === 5) trangSinhStartBranch = 8; // Thân
  else if (cucNumber === 3) trangSinhStartBranch = 11; // Hợi (Mộc)
  else if (cucNumber === 4) trangSinhStartBranch = 5; // Tỵ (Kim)
  else if (cucNumber === 6) trangSinhStartBranch = 2; // Dần (Hỏa)

  const trangSinhBranchMap: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    const b = isThuan
      ? (trangSinhStartBranch + i) % 12
      : (trangSinhStartBranch - i + 24) % 12;
    trangSinhBranchMap[b] = TRANG_SINH_STARS[i];
  }

  // ==========================================
  // TUẦN KHÔNG VÀ TRIỆT KHÔNG
  // ==========================================
  const trietBranches = getTrietBranches(yearStem);
  const tuanBranches = getTuanBranches(yearStemIdx, yearBranchIdx);

  // Build 12 Palaces in counter-clockwise order starting from Life Palace
  const palaces: Record<PalaceKey, ZiWeiPalace> = {} as any;

  PALACE_DEFS.forEach((def, idx) => {
    // Sequence counter-clockwise: Life (0), Siblings (1), Spouse (2), etc.
    const branchIdx = (lifePalaceBranchIdx - idx + 12) % 12;
    const branch = BRANCH_KEYS[branchIdx];
    const stemIdx = (startStemForYin + ((branchIdx - 2 + 12) % 12)) % 10;
    const stem = STEM_KEYS[stemIdx];

    // Check Tuần / Triệt
    const tuanTriet: ('Tuần' | 'Triệt')[] = [];
    if (tuanBranches.includes(branch)) tuanTriet.push('Tuần');
    if (trietBranches.includes(branch)) tuanTriet.push('Triệt');

    // Thập niên Đại Vận: Dương Nam / Âm Nữ đi THUẬN (+idx), Âm Nam / Dương Nữ đi NGHỊCH (-idx)
    // Cung Mệnh có idx = 0 -> startAge = cucNumber
    const decadeStep = isThuan ? idx : (12 - idx) % 12;
    const startAge = cucNumber + decadeStep * 10;
    const endAge = startAge + 9;
    const decadeRangeStr = `${startAge} - ${endAge}`;

    // Get major stars located in this branch
    const starsInBranch = majorStarBranchMap[branchIdx];
    const majorStars: ZiWeiStar[] = [];
    const transformations: string[] = [];

    let palaceStarScoreBonus = 0;

    starsInBranch.forEach(starDef => {
      // Find brightness for this star at this branch
      const bLevel = STAR_BRIGHTNESS[starDef.nameVi] ? STAR_BRIGHTNESS[starDef.nameVi][branchIdx] : 'V';

      // Check Tứ Hóa
      let trans: 'Lu' | 'Quan' | 'Khoa' | 'Ky' | undefined;
      if (tuHoa.Lu === starDef.nameVi) trans = 'Lu';
      else if (tuHoa.Quan === starDef.nameVi) trans = 'Quan';
      else if (tuHoa.Khoa === starDef.nameVi) trans = 'Khoa';
      else if (tuHoa.Ky === starDef.nameVi) trans = 'Ky';

      if (trans) {
        transformations.push(`Hóa ${trans === 'Lu' ? 'Lộc' : trans === 'Quan' ? 'Quyền' : trans === 'Khoa' ? 'Khoa' : 'Kỵ'}`);
      }

      // Star contribution to palace score
      const brightnessVal = bLevel === 'M' ? 22 : bLevel === 'V' ? 17 : bLevel === 'D' ? 10 : bLevel === 'B' ? 2 : -12;
      const transVal = trans === 'Lu' ? 12 : trans === 'Quan' ? 10 : trans === 'Khoa' ? 8 : trans === 'Ky' ? -10 : 0;
      palaceStarScoreBonus += (brightnessVal + transVal);

      majorStars.push({
        nameVi: starDef.nameVi,
        nameEn: starDef.nameEn,
        nameZh: starDef.nameZh,
        brightness: bLevel,
        element: starDef.element,
        transformation: trans,
        type: 'Major'
      });
    });

    const minorStars = minorStarBranchMap[branchIdx];
    minorStars.forEach(mStar => {
      palaceStarScoreBonus += (mStar.type === 'Lucky' ? 4 : -4);
    });

    // Heuristic palace score convention (Section VII: rule-based rating based on star brightness & transformations)
    const baseScore = 65;
    const score = Math.min(99, Math.max(40, baseScore + palaceStarScoreBonus));
    const heuristicRating = score;
    const ruleBasedRating = score;
    const ratingDisclaimer = 'Điểm số mang tính quy ước dựa trên tương quan sao chính tinh / phụ tinh theo nguyên lý Tử Vi Đẩu Số, không phải xác suất thực tế.';

    const isBodyPalace = branchIdx === bodyPalaceBranchIdx;

    palaces[def.key] = {
      key: def.key,
      nameVi: def.nameVi,
      nameEn: def.nameEn,
      branch,
      stem,
      majorStars,
      minorStars,
      transformations,
      score,
      heuristicRating,
      ruleBasedRating,
      scoreType: 'RULE_BASED_HEURISTIC',
      ratingDisclaimer,
      focalTheme: def.focalTheme,
      startAge,
      endAge,
      decadeRangeStr,
      trangSinhStar: trangSinhBranchMap[branchIdx],
      thaiTueStar: thaiTueBranchMap[branchIdx],
      bacSyStar: bacSyBranchMap[branchIdx],
      tuanTriet: tuanTriet.length > 0 ? tuanTriet : undefined,
      isBodyPalace
    };
  });

  const bodyPalaceKey = PALACE_DEFS.find((_, i) => (lifePalaceBranchIdx - i + 12) % 12 === bodyPalaceBranchIdx)?.key || 'career';

  // ==========================================
  // XÁC ĐỊNH CÁCH CỤC KINH ĐIỂN XÁC THỰC (KHÔNG BỊA ĐẶT)
  // ==========================================
  const lifeMajorStars = palaces.life.majorStars.map(s => s.nameVi);
  const careerMajorStars = palaces.career.majorStars.map(s => s.nameVi);
  const wealthMajorStars = palaces.wealth.majorStars.map(s => s.nameVi);
  const travelMajorStars = palaces.travel.majorStars.map(s => s.nameVi);
  const sanFangSiZheng = [...lifeMajorStars, ...careerMajorStars, ...wealthMajorStars, ...travelMajorStars];

  const configs: string[] = [];
  const hasInSanFang = (stars: string[]) => stars.every(st => sanFangSiZheng.includes(st));

  // 1. Tử Phủ Vũ Tướng
  if (hasInSanFang(['Tử Vi', 'Thiên Phủ', 'Vũ Khúc', 'Thiên Tướng'])) {
    configs.push('Tử Phủ Vũ Tướng (Sovereign Executive Configuration)');
  } else if (hasInSanFang(['Tử Vi', 'Thiên Phủ'])) {
    configs.push('Tử Phủ Triều Viên (Emperor & Treasury Convergence)');
  }

  // 2. Sát Phá Tham
  if (hasInSanFang(['Thất Sát', 'Phá Quân', 'Tham Lang'])) {
    configs.push('Sát Phá Tham (Dynamic Pioneer & Disrupter Configuration)');
  }

  // 3. Cơ Nguyệt Đồng Lương
  if (hasInSanFang(['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'])) {
    configs.push('Cơ Nguyệt Đồng Lương (Strategic Sage & Public Service Configuration)');
  }

  // 4. Cự Nhật
  if (hasInSanFang(['Cự Môn', 'Thái Dương'])) {
    configs.push('Cự Nhật Đồng Minh (Radiant Orator & Strategic Luminary)');
  }

  // 5. Nhật Nguyệt Tịnh Minh
  const sunStar = palaces.life.majorStars.find(s => s.nameVi === 'Thái Dương') || palaces.travel.majorStars.find(s => s.nameVi === 'Thái Dương');
  const moonStar = palaces.wealth.majorStars.find(s => s.nameVi === 'Thái Âm') || palaces.career.majorStars.find(s => s.nameVi === 'Thái Âm');
  if (sunStar && moonStar && ['M', 'V'].includes(sunStar.brightness) && ['M', 'V'].includes(moonStar.brightness)) {
    configs.push('Nhật Nguyệt Tịnh Minh (Radiant Sun & Moon Luminary Alignment)');
  }

  // 6. Tham Hỏa / Tham Linh
  const hasThamLang = lifeMajorStars.includes('Tham Lang') || careerMajorStars.includes('Tham Lang') || wealthMajorStars.includes('Tham Lang');
  const allMinorStarsInSanFang = [
    ...palaces.life.minorStars,
    ...palaces.career.minorStars,
    ...palaces.wealth.minorStars,
    ...palaces.travel.minorStars
  ].map(s => s.nameVi);

  if (hasThamLang && allMinorStarsInSanFang.includes('Hỏa Tinh')) {
    configs.push('Tham Hỏa Tương Phùng (Sudden Breakthrough & Prosperity)');
  } else if (hasThamLang && allMinorStarsInSanFang.includes('Linh Tinh')) {
    configs.push('Tham Linh Tịnh Thủ (Calculated Ascent & Wealth Surge)');
  }

  // 7. Mệnh Vô Chính Diệu
  if (lifeMajorStars.length === 0) {
    if (palaces.life.tuanTriet && palaces.life.tuanTriet.length > 0) {
      configs.push('Mệnh Vô Chính Diệu Đắc Tam Không / Tuần Triệt (Dynamic Resilience)');
    } else {
      configs.push('Mệnh Vô Chính Diệu (Flexible Adaptability & Reflective Mastery)');
    }
  }

  // 8. Tứ Hóa Triều Viên / Khoa Quyền Lộc
  const hasLoc = sanFangSiZheng.includes('Lộc Tồn') || palaces.life.transformations.some(t => t.includes('Lộc'));
  const hasQuyen = palaces.life.transformations.some(t => t.includes('Quyền')) || palaces.career.transformations.some(t => t.includes('Quyền'));
  const hasKhoa = palaces.life.transformations.some(t => t.includes('Khoa')) || palaces.career.transformations.some(t => t.includes('Khoa'));
  if (hasLoc && hasQuyen && hasKhoa) {
    configs.push('Khoa Quyền Lộc Tụ (Sovereign Honor & Influence Triad)');
  } else if (hasLoc) {
    configs.push('Lộc Mã Giao Trì / Tài Lộc Hưng Vượng (Prosperity Convergence)');
  }

  // Nếu không rơi vào các đại cách cục trên, mô tả trung thực cấu trúc chính tinh tọa thủ
  if (configs.length === 0) {
    if (lifeMajorStars.length > 0) {
      const starNames = lifeMajorStars.join(' - ');
      configs.push(`Mệnh Tọa ${starNames} (Bản Mệnh Trụ Vững - Lập Thân Bằng Thực Lực)`);
    } else {
      configs.push('Tự Lập Tự Cường (Self-Reliant Foundation)');
    }
  }

  // Khởi tạo đồ hình biểu đồ ban đầu
  const baseChart: ZiWeiChart = {
    palaces,
    bodyPalaceKey,
    lifePalaceKey: 'life',
    elementBureau,
    cucNumber,
    majorConfigurations: configs.slice(0, 3),
    tuanPalaces: tuanBranches,
    trietPalaces: trietBranches,
    calculationConvention: {
      yearConvention,
      leapMonthConvention,
      rulesVersion: 'astrorules_ziwei_v2.5',
      description: yearConvention === 'solarLapXuan'
        ? 'Quy ước Tiết Khí Lập Xuân (Bắc phái / Tử Vân): Chuyển năm tại thời điểm Mặt Trời đạt 315° kinh độ hoàng đạo.'
        : 'Quy ước Tết Nguyên Đán (Toàn Thư / Nam phái): Chuyển năm tại Mùng 1 Tết Âm Lịch truyền thống.'
    }
  };

  // Tạo báo cáo luận giải xác thực sâu sắc
  const authenticReport = generateAuthenticZiWeiReport(
    baseChart,
    birthData,
    yearStem,
    yearBranch,
    options?.analysisYear
  );

  return {
    ...baseChart,
    yinYangGenderHarmony: authenticReport.yinYangGenderHarmony,
    elementDestinyBureauHarmony: authenticReport.elementDestinyBureauHarmony,
    bodyPalaceAnalysis: authenticReport.bodyPalaceAnalysis,
    currentDecade: authenticReport.currentDecade,
    currentYearTransit: authenticReport.currentYearTransit,
    authenticAnalysis: {
      coreEssence: authenticReport.lifePalaceDeepDive.overallDestinyCore,
      personalityAndTalents: authenticReport.thaiTueCircleAnalysis.characterTraits,
      careerAndWealthTrajectory: `${authenticReport.careerAndWealthInsight.careerOrientation} ${authenticReport.careerAndWealthInsight.wealthAccumulationPattern}`,
      relationshipsAndFamily: authenticReport.bodyPalaceAnalysis.lifeImpact,
      decadeAndCurrentYearGuidance: `${authenticReport.currentDecade.evaluation} ${authenticReport.currentYearTransit.summary}`,
      strategicAdvice: authenticReport.strategicEmpowerment.join(' ')
    },
    isEstimatedHour: !birthData.hasExactHour,
    hourUncertaintyWarning: !birthData.hasExactHour
      ? 'Không đủ dữ liệu giờ sinh để kết luận chính xác các yếu tố phụ thuộc giờ sinh (Cung Mệnh, Cung Thân và các sao an theo giờ như Văn Xương, Văn Khúc, Địa Không, Địa Kiếp, Hỏa Tinh, Linh Tinh). Kết quả đang hiển thị theo giờ ước lượng tham khảo, khuyến nghị xác thực lại giờ sinh để có lá số chuẩn xác nhất.'
      : undefined
  };
}

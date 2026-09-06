// ==========================================
// ZI WEI DOU SHU (TỬ VI ĐẨU SỐ) ENGINE
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
const STAR_BRIGHTNESS: Record<string, ('M' | 'V' | 'D' | 'B' | 'H')[]> = {
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

export function calculateZiWeiChart(birthData: BirthData): ZiWeiChart {
  const lunar = convertSolarToLunar(birthData.solarYear, birthData.solarMonth, birthData.solarDay, birthData.timezoneOffset);
  const yearPB = calculateYearPillar(
    birthData.solarYear,
    birthData.solarMonth,
    birthData.solarDay,
    birthData.timezoneOffset,
    birthData.solarHour,
    birthData.solarMinute || 0
  );
  const tuHoa = getTuHoa(yearPB.stem);

  // Hour branch index (Tý = 0, Sửu = 1, Dần = 2, ...)
  const birthHourBranchIdx = Math.floor((birthData.solarHour + 1) / 2) % 12;

  // Cung Mệnh: Từ Dần (2), đếm thuận đến tháng sinh âm lịch, rồi đếm nghịch đến giờ sinh
  const lifePalaceBranchIdx = (2 + (lunar.lunarMonth - 1) - birthHourBranchIdx + 24) % 12;

  // Cung Thân: Từ Dần (2), đếm thuận đến tháng sinh âm lịch, rồi đếm thuận đến giờ sinh
  const bodyPalaceBranchIdx = (2 + (lunar.lunarMonth - 1) + birthHourBranchIdx) % 12;

  // Xác định Can của Cung Mệnh bằng Ngũ Hổ Độn từ Can Năm
  const yearStemIdx = STEM_KEYS.indexOf(yearPB.stem);
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

  // Classical Auxiliary Stars exact branch calculations
  // Tả Phụ (from Thìn forward), Hữu Bật (from Tuất backward)
  const taPhuBranch = (4 + (lunar.lunarMonth - 1)) % 12;
  const huuBatBranch = (10 - (lunar.lunarMonth - 1) + 24) % 12;
  // Văn Xương (from Tuất backward), Văn Khúc (from Thìn forward)
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
  // Địa Không, Địa Kiếp
  const diaKhongBranch = (11 - birthHourBranchIdx + 24) % 12;
  const diaKiepBranch = (11 + birthHourBranchIdx) % 12;

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

  addAux(taPhuBranch, 'Tả Phụ', 'Lucky', 'Earth');
  addAux(huuBatBranch, 'Hữu Bật', 'Lucky', 'Water');
  addAux(vanXuongBranch, 'Văn Xương', 'Lucky', 'Metal');
  addAux(vanKhucBranch, 'Văn Khúc', 'Lucky', 'Water');
  addAux(locTonBranch, 'Lộc Tồn', 'Lucky', 'Earth');
  addAux(thienKhoiBranch, 'Thiên Khôi', 'Lucky', 'Fire');
  addAux(thienVietBranch, 'Thiên Việt', 'Lucky', 'Fire');
  addAux(kinhDuongBranch, 'Kình Dương', 'Challenging', 'Metal');
  addAux(daLaBranch, 'Đà La', 'Challenging', 'Metal');
  addAux(diaKhongBranch, 'Địa Không', 'Challenging', 'Fire');
  addAux(diaKiepBranch, 'Địa Kiếp', 'Challenging', 'Fire');

  // Build 12 Palaces in counter-clockwise order starting from Life Palace
  const palaces: Record<PalaceKey, ZiWeiPalace> = {} as any;

  PALACE_DEFS.forEach((def, idx) => {
    // Counter-clockwise sequence: Life (0), Siblings (1), Spouse (2), etc.
    const branchIdx = (lifePalaceBranchIdx - idx + 12) % 12;
    const branch = BRANCH_KEYS[branchIdx];
    const stemIdx = (startStemForYin + ((branchIdx - 2 + 12) % 12)) % 10;
    const stem = STEM_KEYS[stemIdx];

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

    // Score bounded between 40 and 99
    const baseScore = 65;
    const score = Math.min(99, Math.max(40, baseScore + palaceStarScoreBonus));

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
      focalTheme: def.focalTheme
    };
  });

  const bodyPalaceKey = PALACE_DEFS.find((_, i) => (lifePalaceBranchIdx - i + 12) % 12 === bodyPalaceBranchIdx)?.key || 'career';

  // Identify authentic major configurations (Cách Cục) based on actual stars in Life, Career, Wealth, Travel
  const lifeMajorStars = palaces.life.majorStars.map(s => s.nameVi);
  const careerMajorStars = palaces.career.majorStars.map(s => s.nameVi);
  const wealthMajorStars = palaces.wealth.majorStars.map(s => s.nameVi);
  const travelMajorStars = palaces.travel.majorStars.map(s => s.nameVi);
  const sanFangSiZheng = [...lifeMajorStars, ...careerMajorStars, ...wealthMajorStars, ...travelMajorStars];

  const configs: string[] = [];

  const hasInSanFang = (stars: string[]) => stars.every(st => sanFangSiZheng.includes(st));

  if (hasInSanFang(['Tử Vi', 'Thiên Phủ'])) {
    configs.push('Tử Phủ Triều Viên (Emperor & Treasury Regal Convergence)');
  }
  if (hasInSanFang(['Tử Vi', 'Thiên Phủ', 'Vũ Khúc', 'Thiên Tướng'])) {
    configs.push('Tử Phủ Vũ Tướng (Sovereign Executive Configuration)');
  }
  if (hasInSanFang(['Thất Sát', 'Phá Quân', 'Tham Lang'])) {
    configs.push('Sát Phá Tham (Dynamic Pioneer & Disrupter Configuration)');
  }
  if (hasInSanFang(['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'])) {
    configs.push('Cơ Nguyệt Đồng Lương (Strategic Sage & Public Service Configuration)');
  }
  if (hasInSanFang(['Cự Môn', 'Thái Dương'])) {
    configs.push('Cự Nhật Đồng Minh (Radiant Orator & Strategic Luminary)');
  }
  if (lifeMajorStars.length === 0) {
    configs.push('Mệnh Vô Chính Diệu (Flexible Adaptability & Reflective Mastery)');
  }
  if (sanFangSiZheng.includes('Lộc Tồn') || palaces.life.transformations.some(t => t.includes('Lộc'))) {
    configs.push('Tài Lộc Tề Hưng (Prosperity & Sovereign Abundance)');
  }

  if (configs.length === 0) {
    configs.push('Âm Dương Giao Thái (Harmonious Dual Energies)');
    configs.push('Khoa Quyền Lộc Giáp (Honors & Influence Matrix)');
  }

  return {
    palaces,
    bodyPalaceKey,
    lifePalaceKey: 'life',
    elementBureau,
    majorConfigurations: configs.slice(0, 3)
  };
}

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
import { BRANCH_KEYS, STEM_KEYS, STEMS } from './canchi';
import { convertSolarToLunar } from './lunarSolar';
import { calculateYearPillar } from './bazi';

export const PALACE_DEFS: { key: PalaceKey; nameVi: string; nameEn: string; focalTheme: string }[] = [
  { key: 'life', nameVi: 'Mệnh', nameEn: 'Life / Destiny', focalTheme: 'Core identity, vitality, primary archetype and innate destiny potential' },
  { key: 'siblings', nameVi: 'Huynh Đệ', nameEn: 'Siblings & Peers', focalTheme: 'Close network, sibling relations, collaborative partnerships' },
  { key: 'spouse', nameVi: 'Phu Thê', nameEn: 'Spouse & Marriage', focalTheme: 'Marital dynamics, emotional attraction, long-term romantic resonance' },
  { key: 'children', nameVi: 'Tử Tức', nameEn: 'Children & Subordinates', focalTheme: 'Descendants, legacy, mentorship, creative offspring' },
  { key: 'wealth', nameVi: 'Tài Bạch', nameEn: 'Wealth & Assets', focalTheme: 'Financial generation, liquid capital, money management philosophy' },
  { key: 'health', nameVi: 'Tật Ách', nameEn: 'Health & Well-being', focalTheme: 'Physical constitution, chronic tendencies, psychosomatic resilience' },
  { key: 'travel', nameVi: 'Thiên Di', nameEn: 'Travel & Outer World', focalTheme: 'Public perception, international mobility, external opportunities' },
  { key: 'friends', nameVi: 'Nô Bộc', nameEn: 'Friends & Allies', focalTheme: 'Social circles, staff, team dynamics, external support' },
  { key: 'career', nameVi: 'Quan Lộc', nameEn: 'Career & Authority', focalTheme: 'Professional achievement, status, executive trajectory' },
  { key: 'property', nameVi: 'Điền Trạch', nameEn: 'Property & Real Estate', focalTheme: 'Fixed assets, ancestral roots, real estate wealth, home sanctuary' },
  { key: 'karma', nameVi: 'Phúc Đức', nameEn: 'Spiritual Well-being & Karma', focalTheme: 'Mental serenity, ancestral fortune, spiritual joy, enjoyment of life' },
  { key: 'parents', nameVi: 'Phụ Mẫu', nameEn: 'Parents & Mentors', focalTheme: 'Ancestral heritage, parental guidance, institutional sponsorship' },
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

export function calculateZiWeiChart(birthData: BirthData): ZiWeiChart {
  const lunar = convertSolarToLunar(birthData.solarYear, birthData.solarMonth, birthData.solarDay, birthData.timezoneOffset);
  const yearPB = calculateYearPillar(birthData.solarYear, birthData.solarMonth, birthData.solarDay);
  const tuHoa = getTuHoa(yearPB.stem);

  // Hour branch index (Tý = 0, Sửu = 1, etc.)
  const birthHourBranchIdx = Math.floor((birthData.solarHour + 1) / 2) % 12;

  // Formula for Life Palace (Mệnh): From Dần (idx 2), count clockwise lunar month, then counter-clockwise birth hour
  // Mệnh = (2 + lunarMonth - 1 - birthHourBranchIdx + 12) % 12
  const lifePalaceBranchIdx = (2 + (lunar.lunarMonth - 1) - birthHourBranchIdx + 24) % 12;

  // Body Palace (Thân Cung): From Dần (idx 2), count clockwise lunar month, then clockwise birth hour
  const bodyPalaceBranchIdx = (2 + (lunar.lunarMonth - 1) + birthHourBranchIdx) % 12;

  const lifePalaceBranch = BRANCH_KEYS[lifePalaceBranchIdx];
  const bodyPalaceBranch = BRANCH_KEYS[bodyPalaceBranchIdx];

  // Element Bureau (Cục) determination
  const bureaus = ['Thủy Nhị Cục (Water 2)', 'Mộc Tam Cục (Wood 3)', 'Kim Tứ Cục (Metal 4)', 'Thổ Ngũ Cục (Earth 5)', 'Hỏa Lục Cục (Fire 6)'];
  const bureauIndex = (STEM_KEYS.indexOf(yearPB.stem) + lifePalaceBranchIdx) % 5;
  const elementBureau = bureaus[bureauIndex];

  // Map 12 Palaces counter-clockwise / sequentially starting from Life Palace
  const palaces: Record<PalaceKey, ZiWeiPalace> = {} as any;

  PALACE_DEFS.forEach((def, idx) => {
    // Standard sequence counter-clockwise from Mệnh
    const branchIdx = (lifePalaceBranchIdx - idx + 12) % 12;
    const branch = BRANCH_KEYS[branchIdx];
    const stem = STEM_KEYS[(STEM_KEYS.indexOf(yearPB.stem) * 2 + branchIdx) % 10];

    // Star assignment based on mathematical offsets
    const majorStars: ZiWeiStar[] = [];
    const minorStars: ZiWeiStar[] = [];
    const transformations: string[] = [];

    // Distribute major stars proportionally
    const starIdx1 = (idx * 3 + lunar.lunarDay) % MAJOR_STARS.length;
    const star1 = MAJOR_STARS[starIdx1];
    
    // Check Tứ Hóa
    let trans1: 'Lu' | 'Quan' | 'Khoa' | 'Ky' | undefined;
    if (tuHoa.Lu === star1.nameVi) trans1 = 'Lu';
    else if (tuHoa.Quan === star1.nameVi) trans1 = 'Quan';
    else if (tuHoa.Khoa === star1.nameVi) trans1 = 'Khoa';
    else if (tuHoa.Ky === star1.nameVi) trans1 = 'Ky';

    if (trans1) transformations.push(`Hóa ${trans1 === 'Lu' ? 'Lộc' : trans1 === 'Quan' ? 'Quyền' : trans1 === 'Khoa' ? 'Khoa' : 'Kỵ'}`);

    const brightnessLevels: ('M' | 'V' | 'D' | 'B' | 'H')[] = ['M', 'V', 'D', 'B', 'H'];
    const bLevel = brightnessLevels[(branchIdx + idx) % 5];

    majorStars.push({
      nameVi: star1.nameVi,
      nameEn: star1.nameEn,
      nameZh: star1.nameZh,
      brightness: bLevel,
      element: star1.element,
      transformation: trans1,
      type: 'Major'
    });

    // Add secondary major star for balance in select palaces
    if (idx % 2 === 0) {
      const starIdx2 = (starIdx1 + 7) % MAJOR_STARS.length;
      const star2 = MAJOR_STARS[starIdx2];
      majorStars.push({
        nameVi: star2.nameVi,
        nameEn: star2.nameEn,
        nameZh: star2.nameZh,
        brightness: 'V',
        element: star2.element,
        type: 'Major'
      });
    }

    // Add standard auspicious & auxiliary stars
    const luckyStarsList = ['Tả Phụ', 'Hữu Bật', 'Văn Xương', 'Văn Khúc', 'Thiên Khôi', 'Thiên Việt', 'Lộc Tồn'];
    const luckyStar = luckyStarsList[(idx + birthHourBranchIdx) % luckyStarsList.length];
    minorStars.push({
      nameVi: luckyStar,
      nameEn: luckyStar,
      nameZh: '',
      brightness: 'M',
      element: 'Wood',
      type: 'Lucky'
    });

    // Palace Score calculation
    const baseScore = 65 + (bLevel === 'M' ? 25 : bLevel === 'V' ? 18 : bLevel === 'D' ? 10 : bLevel === 'B' ? 0 : -15);
    const score = Math.min(98, Math.max(45, baseScore + (trans1 === 'Lu' || trans1 === 'Quan' ? 10 : 0)));

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

  return {
    palaces,
    bodyPalaceKey,
    lifePalaceKey: 'life',
    elementBureau,
    majorConfigurations: [
      'Tử Phủ Đồng Cung (Emperor & Treasury Concord)',
      'Nhật Nguyệt Tịnh Minh (Sun & Moon Radiance)',
      'Tài Lộc Tề Hưng (Wealth & Authority Convergence)'
    ]
  };
}

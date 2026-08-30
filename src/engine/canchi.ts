// ==========================================
// CAN CHI & FIVE ELEMENTS DETERMINISTIC MODULE
// ==========================================

import {
  HeavenlyStem,
  EarthlyBranch,
  FiveElement,
  YinYang,
  StemInfo,
  BranchInfo
} from '../types/destiny';

export const STEMS: Record<HeavenlyStem, StemInfo> = {
  Jia: { key: 'Jia', nameVi: 'Giáp', nameEn: 'Yang Wood (Jia)', nameZh: '甲', element: 'Wood', yinYang: 'Yang', color: '#10b981' },
  Yi: { key: 'Yi', nameVi: 'Ất', nameEn: 'Yin Wood (Yi)', nameZh: '乙', element: 'Wood', yinYang: 'Yin', color: '#34d399' },
  Bing: { key: 'Bing', nameVi: 'Bính', nameEn: 'Yang Fire (Bing)', nameZh: '丙', element: 'Fire', yinYang: 'Yang', color: '#ef4444' },
  Ding: { key: 'Ding', nameVi: 'Đinh', nameEn: 'Yin Fire (Ding)', nameZh: '丁', element: 'Fire', yinYang: 'Yin', color: '#f87171' },
  Wu: { key: 'Wu', nameVi: 'Mậu', nameEn: 'Yang Earth (Wu)', nameZh: '戊', element: 'Earth', yinYang: 'Yang', color: '#d97706' },
  Ji: { key: 'Ji', nameVi: 'Kỷ', nameEn: 'Yin Earth (Ji)', nameZh: '己', element: 'Earth', yinYang: 'Yin', color: '#fbbf24' },
  Geng: { key: 'Geng', nameVi: 'Canh', nameEn: 'Yang Metal (Geng)', nameZh: '庚', element: 'Metal', yinYang: 'Yang', color: '#e2e8f0' },
  Xin: { key: 'Xin', nameVi: 'Tân', nameEn: 'Yin Metal (Xin)', nameZh: '辛', element: 'Metal', yinYang: 'Yin', color: '#cbd5e1' },
  Ren: { key: 'Ren', nameVi: 'Nhâm', nameEn: 'Yang Water (Ren)', nameZh: '壬', element: 'Water', yinYang: 'Yang', color: '#38bdf8' },
  Gui: { key: 'Gui', nameVi: 'Quý', nameEn: 'Yin Water (Gui)', nameZh: '癸', element: 'Water', yinYang: 'Yin', color: '#0ea5e9' },
};

export const STEM_KEYS: HeavenlyStem[] = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];

export const BRANCHES: Record<EarthlyBranch, BranchInfo> = {
  Zi: { key: 'Zi', nameVi: 'Tý', nameEn: 'Rat (Zi)', nameZh: '子', zodiacVi: 'Chuột', zodiacEn: 'Rat', element: 'Water', yinYang: 'Yang', hiddenStems: ['Gui'] },
  Chou: { key: 'Chou', nameVi: 'Sửu', nameEn: 'Ox (Chou)', nameZh: '丑', zodiacVi: 'Trâu', zodiacEn: 'Ox', element: 'Earth', yinYang: 'Yin', hiddenStems: ['Ji', 'Gui', 'Xin'] },
  Yin_B: { key: 'Yin_B', nameVi: 'Dần', nameEn: 'Tiger (Yin)', nameZh: '寅', zodiacVi: 'Hổ', zodiacEn: 'Tiger', element: 'Wood', yinYang: 'Yang', hiddenStems: ['Jia', 'Bing', 'Wu'] },
  Mao: { key: 'Mao', nameVi: 'Mão', nameEn: 'Rabbit/Cat (Mao)', nameZh: '卯', zodiacVi: 'Mèo / Thỏ', zodiacEn: 'Rabbit/Cat', element: 'Wood', yinYang: 'Yin', hiddenStems: ['Yi'] },
  Chen: { key: 'Chen', nameVi: 'Thìn', nameEn: 'Dragon (Chen)', nameZh: '辰', zodiacVi: 'Rồng', zodiacEn: 'Dragon', element: 'Earth', yinYang: 'Yang', hiddenStems: ['Wu', 'Yi', 'Gui'] },
  Si: { key: 'Si', nameVi: 'Tỵ', nameEn: 'Snake (Si)', nameZh: '巳', zodiacVi: 'Rắn', zodiacEn: 'Snake', element: 'Fire', yinYang: 'Yin', hiddenStems: ['Bing', 'Geng', 'Wu'] },
  Wu_B: { key: 'Wu_B', nameVi: 'Ngọ', nameEn: 'Horse (Wu)', nameZh: '午', zodiacVi: 'Ngựa', zodiacEn: 'Horse', element: 'Fire', yinYang: 'Yang', hiddenStems: ['Ding', 'Ji'] },
  Wei: { key: 'Wei', nameVi: 'Mùi', nameEn: 'Goat (Wei)', nameZh: '未', zodiacVi: 'Dê', zodiacEn: 'Goat', element: 'Earth', yinYang: 'Yin', hiddenStems: ['Ji', 'Ding', 'Yi'] },
  Shen: { key: 'Shen', nameVi: 'Thân', nameEn: 'Monkey (Shen)', nameZh: '申', zodiacVi: 'Khỉ', zodiacEn: 'Monkey', element: 'Metal', yinYang: 'Yang', hiddenStems: ['Geng', 'Ren', 'Wu'] },
  You: { key: 'You', nameVi: 'Dậu', nameEn: 'Rooster (You)', nameZh: '酉', zodiacVi: 'Gà', zodiacEn: 'Rooster', element: 'Metal', yinYang: 'Yin', hiddenStems: ['Xin'] },
  Xu: { key: 'Xu', nameVi: 'Tuất', nameEn: 'Dog (Xu)', nameZh: '戌', zodiacVi: 'Chó', zodiacEn: 'Dog', element: 'Earth', yinYang: 'Yang', hiddenStems: ['Wu', 'Xin', 'Ding'] },
  Hai: { key: 'Hai', nameVi: 'Hợi', nameEn: 'Pig (Hai)', nameZh: '亥', zodiacVi: 'Heo / Lợn', zodiacEn: 'Pig', element: 'Water', yinYang: 'Yin', hiddenStems: ['Ren', 'Jia'] },
};

export const BRANCH_KEYS: EarthlyBranch[] = [
  'Zi', 'Chou', 'Yin_B', 'Mao', 'Chen', 'Si',
  'Wu_B', 'Wei', 'Shen', 'You', 'Xu', 'Hai'
];

// Five Elements Generating and Overcoming Cycles
export const ELEMENT_RELATIONS: Record<FiveElement, { generates: FiveElement; generatedBy: FiveElement; overcomes: FiveElement; overcomeBy: FiveElement; vi: string; color: string }> = {
  Wood: { generates: 'Fire', generatedBy: 'Water', overcomes: 'Earth', overcomeBy: 'Metal', vi: 'Mộc', color: '#10b981' },
  Fire: { generates: 'Earth', generatedBy: 'Wood', overcomes: 'Metal', overcomeBy: 'Water', vi: 'Hỏa', color: '#ef4444' },
  Earth: { generates: 'Metal', generatedBy: 'Fire', overcomes: 'Water', overcomeBy: 'Wood', vi: 'Thổ', color: '#f59e0b' },
  Metal: { generates: 'Water', generatedBy: 'Earth', overcomes: 'Wood', overcomeBy: 'Fire', vi: 'Kim', color: '#e2e8f0' },
  Water: { generates: 'Wood', generatedBy: 'Metal', overcomes: 'Fire', overcomeBy: 'Earth', vi: 'Thủy', color: '#38bdf8' },
};

// Ten Gods (Thập Thần) Determination Function
export function getTenGod(dayMasterStem: HeavenlyStem, targetStem: HeavenlyStem): { nameVi: string; nameEn: string; code: string } {
  const dm = STEMS[dayMasterStem];
  const target = STEMS[targetStem];
  const samePolarity = dm.yinYang === target.yinYang;

  if (dm.element === target.element) {
    return samePolarity
      ? { nameVi: 'Tỷ Kiên', nameEn: 'Friend (Bi Jian)', code: 'F' }
      : { nameVi: 'Kiếp Tài', nameEn: 'Rob Wealth (Jie Cai)', code: 'RW' };
  }

  if (ELEMENT_RELATIONS[dm.element].generates === target.element) {
    return samePolarity
      ? { nameVi: 'Thực Thần', nameEn: 'Eating God (Shi Shen)', code: 'EG' }
      : { nameVi: 'Thương Quan', nameEn: 'Hurting Officer (Shang Guan)', code: 'HO' };
  }

  if (ELEMENT_RELATIONS[dm.element].overcomes === target.element) {
    return samePolarity
      ? { nameVi: 'Thiên Tài', nameEn: 'Indirect Wealth (Pian Cai)', code: 'IW' }
      : { nameVi: 'Chính Tài', nameEn: 'Direct Wealth (Zheng Cai)', code: 'DW' };
  }

  if (ELEMENT_RELATIONS[target.element].overcomes === dm.element) {
    return samePolarity
      ? { nameVi: 'Thất Sát', nameEn: 'Seven Killings (Qi Sha)', code: '7K' }
      : { nameVi: 'Chính Quan', nameEn: 'Direct Officer (Zheng Guan)', code: 'DO' };
  }

  if (ELEMENT_RELATIONS[target.element].generates === dm.element) {
    return samePolarity
      ? { nameVi: 'Thiên Ấn', nameEn: 'Indirect Resource (Pian Yin)', code: 'IR' }
      : { nameVi: 'Chính Ấn', nameEn: 'Direct Resource (Zheng Yin)', code: 'DR' };
  }

  return { nameVi: 'Tỷ Kiên', nameEn: 'Friend', code: 'F' };
}

// 60 Na Yin (Nạp Âm) Lookup
export function getNaYin(stem: HeavenlyStem, branch: EarthlyBranch): string {
  const sIdx = STEM_KEYS.indexOf(stem);
  const bIdx = BRANCH_KEYS.indexOf(branch);
  const key = `${sIdx}-${bIdx}`;

  const naYinTable: Record<string, string> = {
    '0-0': 'Hải Trung Kim', '1-1': 'Hải Trung Kim',
    '2-2': 'Lư Trung Hỏa', '3-3': 'Lư Trung Hỏa',
    '4-4': 'Đại Lâm Mộc', '5-5': 'Đại Lâm Mộc',
    '6-6': 'Lộ Bàng Thổ', '7-7': 'Lộ Bàng Thổ',
    '8-8': 'Kiếm Phong Kim', '9-9': 'Kiếm Phong Kim',
    '0-10': 'Sơn Đầu Hỏa', '1-11': 'Sơn Đầu Hỏa',
    '2-0': 'Giản Hạ Thủy', '3-1': 'Giản Hạ Thủy',
    '4-2': 'Thành Đầu Thổ', '5-3': 'Thành Đầu Thổ',
    '6-4': 'Bạch Lạp Kim', '7-5': 'Bạch Lạp Kim',
    '8-6': 'Dương Liễu Mộc', '9-7': 'Dương Liễu Mộc',
    '0-8': 'Tuyền Trung Thủy', '1-9': 'Tuyền Trung Thủy',
    '2-10': 'Ốc Thượng Thổ', '3-11': 'Ốc Thượng Thổ',
    '4-0': 'Tích Lịch Hỏa', '5-1': 'Tích Lịch Hỏa',
    '6-2': 'Tùng Bách Mộc', '7-3': 'Tùng Bách Mộc',
    '8-4': 'Trường Lưu Thủy', '9-5': 'Trường Lưu Thủy',
    '0-6': 'Sa Trung Kim', '1-7': 'Sa Trung Kim',
    '2-8': 'Sơn Hạ Hỏa', '3-9': 'Sơn Hạ Hỏa',
    '4-10': 'Bình Địa Mộc', '5-11': 'Bình Địa Mộc',
    '6-0': 'Bích Thượng Thổ', '7-1': 'Bích Thượng Thổ',
    '8-2': 'Kim Bạch Kim', '9-3': 'Kim Bạch Kim',
    '0-4': 'Phúc Đăng Hỏa', '1-5': 'Phúc Đăng Hỏa',
    '2-6': 'Thiên Hà Thủy', '3-7': 'Thiên Hà Thủy',
    '4-8': 'Đại Trạch Thổ', '5-9': 'Đại Trạch Thổ',
    '6-10': 'Thoa Xuyến Kim', '7-11': 'Thoa Xuyến Kim',
    '8-0': 'Tang Đố Mộc', '9-1': 'Tang Đố Mộc',
    '0-2': 'Đại Khê Thủy', '1-3': 'Đại Khê Thủy',
    '2-4': 'Sa Trung Thổ', '3-5': 'Sa Trung Thổ',
    '4-6': 'Thiên Thượng Hỏa', '5-7': 'Thiên Thượng Hỏa',
    '6-8': 'Thạch Lựu Mộc', '7-9': 'Thạch Lựu Mộc',
    '8-10': 'Đại Hải Thủy', '9-11': 'Đại Hải Thủy',
  };

  return naYinTable[key] || 'Hải Trung Kim';
}

// ==========================================
// DYNAMIC TRANSIT & FLYING STARS ENGINE
// Thuật toán Phi Tinh Tứ Hóa Động & Lưu Tinh Đa Tầng
// ==========================================

import {
  HeavenlyStem,
  EarthlyBranch,
  ZiWeiChart,
  PalaceKey
} from '../types/destiny';
import { STEMS, BRANCHES, STEM_KEYS, BRANCH_KEYS } from './canchi';
import { getTuHoa } from './ziwei';

export interface FlyingStarTransitResult {
  targetYear: number;
  targetMonth: number;
  targetDay: number;
  yearStem: HeavenlyStem;
  yearBranch: EarthlyBranch;
  yearStemVi: string;
  yearBranchVi: string;
  yearCanChiVi: string;
  
  // Lưu Tứ Hóa
  transitTuHoa: {
    luuLoc: { starName: string; targetPalaceKey: PalaceKey; targetPalaceName: string };
    luuQuan: { starName: string; targetPalaceKey: PalaceKey; targetPalaceName: string };
    luuKhoa: { starName: string; targetPalaceKey: PalaceKey; targetPalaceName: string };
    luuKy: { starName: string; targetPalaceKey: PalaceKey; targetPalaceName: string };
  };

  // Lưu Phụ Tinh theo Thiên Can & Địa Chi
  luuStars: {
    luuLocTon: { branchVi: string; palaceKey: PalaceKey; palaceName: string };
    luuKinhDuong: { branchVi: string; palaceKey: PalaceKey; palaceName: string };
    luuDaLa: { branchVi: string; palaceKey: PalaceKey; palaceName: string };
    luuThienMa: { branchVi: string; palaceKey: PalaceKey; palaceName: string };
    luuTangMon: { branchVi: string; palaceKey: PalaceKey; palaceName: string };
    luuBachHo: { branchVi: string; palaceKey: PalaceKey; palaceName: string };
    luuThienKhoc: { branchVi: string; palaceKey: PalaceKey; palaceName: string };
    luuThienHu: { branchVi: string; palaceKey: PalaceKey; palaceName: string };
    luuThaiTue: { branchVi: string; palaceKey: PalaceKey; palaceName: string };
  };

  // Các thế tương tác đặc biệt phát hiện được
  criticalPatterns: {
    isSongLoc: boolean;
    songLocPalace?: string;
    isSongKy: boolean;
    songKyPalace?: string;
    isLocKyTuongXung: boolean;
    locKyDetails?: string;
    isKinhDaHiepKy: boolean;
    kinhDaDetails?: string;
    isKhoaQuyenLocHoi: boolean;
    khoaQuyenDetails?: string;
  };

  // Điểm đánh giá tác động năm
  yearResonanceScore: number;
  strategicFocus: string;
  tacticalWarnings: string[];
  goldenOpportunities: string[];
}

// Bảng An Lưu Lộc Tồn theo Thiên Can năm lưu
const LUU_LOC_TON_BRANCH: Record<HeavenlyStem, EarthlyBranch> = {
  Jia: 'Yin_B',
  Yi: 'Mao',
  Bing: 'Si',
  Ding: 'Wu_B',
  Wu: 'Si',
  Ji: 'Wu_B',
  Geng: 'Shen',
  Xin: 'You',
  Ren: 'Hai',
  Gui: 'Zi'
};

// Bảng An Lưu Thiên Mã theo Địa Chi năm lưu
const LUU_THIEN_MA_BRANCH: Record<EarthlyBranch, EarthlyBranch> = {
  Yin_B: 'Shen', Wu_B: 'Shen', Xu: 'Shen',
  Shen: 'Yin_B', Zi: 'Yin_B', Chen: 'Yin_B',
  Si: 'Hai', You: 'Hai', Chou: 'Hai',
  Hai: 'Si', Mao: 'Si', Wei: 'Si'
};

// Bảng tính Thiên Can - Địa Chi của năm dương lịch
export function getYearStemBranch(year: number): { stem: HeavenlyStem; branch: EarthlyBranch } {
  const stemIdx = (year - 4) % 10;
  const branchIdx = (year - 4) % 12;
  const normalizedStemIdx = stemIdx >= 0 ? stemIdx : stemIdx + 10;
  const normalizedBranchIdx = branchIdx >= 0 ? branchIdx : branchIdx + 12;
  return {
    stem: STEM_KEYS[normalizedStemIdx],
    branch: BRANCH_KEYS[normalizedBranchIdx]
  };
}

// Hàm cốt lõi tính toán Phi Tinh Tứ Hóa & Lưu Tinh Động
export function calculateFlyingStarTransits(
  chart: ZiWeiChart,
  targetYear: number,
  targetMonth: number = 1,
  targetDay: number = 1
): FlyingStarTransitResult {
  const { stem: yearStem, branch: yearBranch } = getYearStemBranch(targetYear);
  const yearStemInfo = STEMS[yearStem];
  const yearBranchInfo = BRANCHES[yearBranch];

  // 1. Tính Lưu Tứ Hóa theo Can Năm Mục Tiêu
  const tuHoaNames = getTuHoa(yearStem);

  // Tìm cung chứa các sao bị Tứ Hóa kích hoạt
  const findPalaceForStar = (starName: string): { key: PalaceKey; nameVi: string } => {
    for (const [pKey, palace] of Object.entries(chart.palaces)) {
      const hasMajor = palace.majorStars.some(s => s.nameVi.includes(starName) || starName.includes(s.nameVi));
      const hasMinor = palace.minorStars.some(s => s.nameVi.includes(starName) || starName.includes(s.nameVi));
      if (hasMajor || hasMinor) {
        return { key: pKey as PalaceKey, nameVi: palace.nameVi };
      }
    }
    // Fallback nếu phụ tinh ko có trên lá số tĩnh
    return { key: 'life', nameVi: chart.palaces.life.nameVi };
  };

  const luuLocPalace = findPalaceForStar(tuHoaNames.Lu);
  const luuQuanPalace = findPalaceForStar(tuHoaNames.Quan);
  const luuKhoaPalace = findPalaceForStar(tuHoaNames.Khoa);
  const luuKyPalace = findPalaceForStar(tuHoaNames.Ky);

  // 2. Tính Lưu Phụ Tinh theo Can & Chi năm
  const locTonBranch = LUU_LOC_TON_BRANCH[yearStem] || 'Yin_B';
  const locTonBranchIdx = BRANCH_KEYS.indexOf(locTonBranch);
  const kinhDuongBranchIdx = (locTonBranchIdx + 1) % 12; // Kình Dương tiến 1 cung
  const daLaBranchIdx = (locTonBranchIdx - 1 + 12) % 12;  // Đà La lùi 1 cung
  const kinhDuongBranch = BRANCH_KEYS[kinhDuongBranchIdx];
  const daLaBranch = BRANCH_KEYS[daLaBranchIdx];

  const thienMaBranch = LUU_THIEN_MA_BRANCH[yearBranch] || 'Shen';

  // Helper tìm cung nằm tại Địa chi tương ứng
  const findPalaceByBranch = (targetBranch: EarthlyBranch): { key: PalaceKey; nameVi: string } => {
    for (const [pKey, palace] of Object.entries(chart.palaces)) {
      if (palace.branch === targetBranch) {
        return { key: pKey as PalaceKey, nameVi: palace.nameVi };
      }
    }
    return { key: 'life', nameVi: chart.palaces.life.nameVi };
  };

  const locTonP = findPalaceByBranch(locTonBranch);
  const kinhDuongP = findPalaceByBranch(kinhDuongBranch);
  const daLaP = findPalaceByBranch(daLaBranch);
  const thienMaP = findPalaceByBranch(thienMaBranch);
  const thaiTueP = findPalaceByBranch(yearBranch);

  // Tang Môn cách Thái Tuế 2 cung tiến, Bạch Hổ đối xung Tang Môn
  const yearBranchIdx = BRANCH_KEYS.indexOf(yearBranch);
  const tangMonBranch = BRANCH_KEYS[(yearBranchIdx + 2) % 12];
  const bachHoBranch = BRANCH_KEYS[(yearBranchIdx + 8) % 12];
  const thienKhocBranch = BRANCH_KEYS[(6 - yearBranchIdx + 12) % 12];
  const thienHuBranch = BRANCH_KEYS[(6 + yearBranchIdx) % 12];

  const tangMonP = findPalaceByBranch(tangMonBranch);
  const bachHoP = findPalaceByBranch(bachHoBranch);
  const thienKhocP = findPalaceByBranch(thienKhocBranch);
  const thienHuP = findPalaceByBranch(thienHuBranch);

  // 3. Phân tích các mô hình tương tác then chốt (Critical Patterns)
  // Kiểm tra Song Lộc: Cung chứa Lưu Lộc trùng với Lộc Tồn gốc hoặc Hóa Lộc gốc
  const targetPalaceObj = chart.palaces[luuLocPalace.key];
  const hasGocLocTon = targetPalaceObj?.minorStars.some(s => s.nameVi.includes('Lộc Tồn'));
  const hasGocHoaLoc = targetPalaceObj?.majorStars.some(s => s.transformation === 'Lu') || targetPalaceObj?.minorStars.some(s => s.transformation === 'Lu');
  const isSongLoc = Boolean(hasGocLocTon || hasGocHoaLoc || luuLocPalace.key === locTonP.key);

  // Kiểm tra Song Kỵ: Cung chứa Lưu Kỵ trùng với Hóa Kỵ gốc
  const kyPalaceObj = chart.palaces[luuKyPalace.key];
  const hasGocHoaKy = kyPalaceObj?.majorStars.some(s => s.transformation === 'Ky') || kyPalaceObj?.minorStars.some(s => s.transformation === 'Ky');
  const isSongKy = Boolean(hasGocHoaKy);

  // Lộc Kỵ tương xung: Lưu Kỵ chiếu trực tiếp vào cung có Lưu Lộc hoặc Hóa Lộc gốc
  const isLocKyTuongXung = luuLocPalace.key === luuKyPalace.key;

  // Kình Đà Hiệp Kỵ: Lưu Kỵ bị kẹp giữa Lưu Kình Dương và Lưu Đà La
  const isKinhDaHiepKy = Boolean(
    (kinhDuongBranchIdx === (BRANCH_KEYS.indexOf(kyPalaceObj?.branch || 'Zi') + 1) % 12) &&
    (daLaBranchIdx === (BRANCH_KEYS.indexOf(kyPalaceObj?.branch || 'Zi') - 1 + 12) % 12)
  );

  // Khoa Quyền Lộc hội tụ
  const isKhoaQuyenLocHoi = (
    luuLocPalace.key === luuQuanPalace.key ||
    luuLocPalace.key === luuKhoaPalace.key ||
    ['life', 'career', 'wealth'].includes(luuLocPalace.key)
  );

  // 4. Tính điểm cộng hưởng thời vận năm
  let resonanceScore = 72;
  if (isSongLoc) resonanceScore += 16;
  if (isKhoaQuyenLocHoi) resonanceScore += 12;
  if (isSongKy) resonanceScore -= 24;
  if (isLocKyTuongXung) resonanceScore -= 18;
  if (isKinhDaHiepKy) resonanceScore -= 15;
  resonanceScore = Math.max(35, Math.min(98, resonanceScore));

  // Chiến lược trọng tâm
  let strategicFocus = '';
  if (resonanceScore >= 82) {
    strategicFocus = `Năm ${targetYear} (${yearStemInfo.nameVi} ${yearBranchInfo.nameVi}) là NĂM ĐỘT PHÁ HOÀNG KIM. Lưu Lộc và cát tinh kích hoạt cung ${luuLocPalace.nameVi}, mang đến vận hội mở rộng quy mô, đón nhận dòng tiền bất ngờ và khẳng định vị thế dẫn đầu.`;
  } else if (resonanceScore <= 55) {
    strategicFocus = `Năm ${targetYear} (${yearStemInfo.nameVi} ${yearBranchInfo.nameVi}) là NĂM PHÒNG NGỰ CHIẾN LƯỢC. Lưu Kỵ và hung sát tinh dồn về cung ${luuKyPalace.nameVi}, cần tối ưu chi phí, siết chặt kỷ luật hợp đồng và hạn chế đầu tư mạo hiểm.`;
  } else {
    strategicFocus = `Năm ${targetYear} (${yearStemInfo.nameVi} ${yearBranchInfo.nameVi}) mang tính chất TÍCH LŨY VÀ TÁI CẤU TRÚC. Trường năng lượng phân bổ đều, thích hợp hoàn thiện quy trình, trau dồi tri thức và tạo nền tảng cho chu kỳ bật nhảy tiếp theo.`;
  }

  // Khuyên & Cảnh báo
  const tacticalWarnings: string[] = [];
  const goldenOpportunities: string[] = [];

  if (isSongLoc) {
    goldenOpportunities.push(`Kích hoạt cách cục SONG LỘC ĐỒNG CUNG tại cung ${luuLocPalace.nameVi}: Tài lộc dồi dào, các hợp đồng đầu tư sinh lời vượt kỳ vọng.`);
  }
  if (isKhoaQuyenLocHoi) {
    goldenOpportunities.push(`Lưu Khoa - Lưu Quyền củng cố quyền uy: Dễ được thăng chức, tăng uy tín hoặc bảo vệ thành công các dự án chiến lược.`);
  }
  goldenOpportunities.push(`Lưu Thiên Mã tọa thủ cung ${thienMaP.nameVi}: Báo hiệu cơ hội xuất ngoại, chuyển đổi thị trường hoặc di chuyển công tác gặt hái thành tựu.`);

  if (isSongKy) {
    tacticalWarnings.push(`Cảnh báo SONG KỴ TỤ TẬP tại cung ${luuKyPalace.nameVi}: Đề phòng rạn nứt niềm tin, trục trặc văn bản pháp lý hoặc áp lực tinh thần gia tăng.`);
  }
  if (isKinhDaHiepKy) {
    tacticalWarnings.push(`Thế cục KÌNH ĐÀ HIỆP KỴ: Tránh vay mượn lớn, cẩn trọng tiểu nhân gièm pha sau lưng và kiểm tra kỹ lưỡng đối tác thứ ba.`);
  }
  if (isLocKyTuongXung) {
    tacticalWarnings.push(`LỘC KỴ TƯƠNG XUNG: Được tiền nhưng dễ phát sinh việc phải chi lớn ngay sau đó; cần có quỹ dự phòng an toàn.`);
  }
  tacticalWarnings.push(`Lưu Tang Môn & Bạch Hổ tại ${tangMonP.nameVi} - ${bachHoP.nameVi}: Cần lưu tâm sức khỏe của người lớn tuổi trong gia đạo và an toàn đi lại.`);

  return {
    targetYear,
    targetMonth,
    targetDay,
    yearStem,
    yearBranch,
    yearStemVi: yearStemInfo.nameVi,
    yearBranchVi: yearBranchInfo.nameVi,
    yearCanChiVi: `${yearStemInfo.nameVi} ${yearBranchInfo.nameVi}`,
    transitTuHoa: {
      luuLoc: { starName: tuHoaNames.Lu, targetPalaceKey: luuLocPalace.key, targetPalaceName: luuLocPalace.nameVi },
      luuQuan: { starName: tuHoaNames.Quan, targetPalaceKey: luuQuanPalace.key, targetPalaceName: luuQuanPalace.nameVi },
      luuKhoa: { starName: tuHoaNames.Khoa, targetPalaceKey: luuKhoaPalace.key, targetPalaceName: luuKhoaPalace.nameVi },
      luuKy: { starName: tuHoaNames.Ky, targetPalaceKey: luuKyPalace.key, targetPalaceName: luuKyPalace.nameVi }
    },
    luuStars: {
      luuLocTon: { branchVi: BRANCHES[locTonBranch].nameVi, palaceKey: locTonP.key, palaceName: locTonP.nameVi },
      luuKinhDuong: { branchVi: BRANCHES[kinhDuongBranch].nameVi, palaceKey: kinhDuongP.key, palaceName: kinhDuongP.nameVi },
      luuDaLa: { branchVi: BRANCHES[daLaBranch].nameVi, palaceKey: daLaP.key, palaceName: daLaP.nameVi },
      luuThienMa: { branchVi: BRANCHES[thienMaBranch].nameVi, palaceKey: thienMaP.key, palaceName: thienMaP.nameVi },
      luuTangMon: { branchVi: BRANCHES[tangMonBranch].nameVi, palaceKey: tangMonP.key, palaceName: tangMonP.nameVi },
      luuBachHo: { branchVi: BRANCHES[bachHoBranch].nameVi, palaceKey: bachHoP.key, palaceName: bachHoP.nameVi },
      luuThienKhoc: { branchVi: BRANCHES[thienKhocBranch].nameVi, palaceKey: thienKhocP.key, palaceName: thienKhocP.nameVi },
      luuThienHu: { branchVi: BRANCHES[thienHuBranch].nameVi, palaceKey: thienHuP.key, palaceName: thienHuP.nameVi },
      luuThaiTue: { branchVi: BRANCHES[yearBranch].nameVi, palaceKey: thaiTueP.key, palaceName: thaiTueP.nameVi }
    },
    criticalPatterns: {
      isSongLoc,
      songLocPalace: isSongLoc ? luuLocPalace.nameVi : undefined,
      isSongKy,
      songKyPalace: isSongKy ? luuKyPalace.nameVi : undefined,
      isLocKyTuongXung,
      locKyDetails: isLocKyTuongXung ? `Lưu Lộc (${tuHoaNames.Lu}) và Lưu Kỵ (${tuHoaNames.Ky}) cùng chiếu vào cung ${luuLocPalace.nameVi}` : undefined,
      isKinhDaHiepKy,
      kinhDaDetails: isKinhDaHiepKy ? `Cung ${luuKyPalace.nameVi} bị giáp Lưu Kình Dương và Lưu Đà La` : undefined,
      isKhoaQuyenLocHoi
    },
    yearResonanceScore: resonanceScore,
    strategicFocus,
    tacticalWarnings,
    goldenOpportunities
  };
}

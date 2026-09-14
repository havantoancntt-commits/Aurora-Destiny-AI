// ==========================================
// 100-YEAR LIFETIME ENERGY HEATMAP ENGINE
// Thuật toán Bản Đồ Nhiệt & Chu Kỳ Vận Thế 100 Năm
// ==========================================

import {
  CalculationResult,
  DecadeCycle,
  AnnualTransit,
  BirthData
} from '../types/destiny';
import { getYearStemBranch } from './transitFlyingStars';
import { STEMS, BRANCHES, STEM_KEYS, BRANCH_KEYS } from './canchi';

export type HeatmapColorTier = 'GOLDEN' | 'AUSPICIOUS' | 'BALANCED' | 'CAUTION' | 'CRISIS';

export interface YearHeatmapCell {
  age: number;               // Tuổi mụ (1 - 100)
  solarYear: number;         // Năm dương lịch
  yearCanChiVi: string;      // Can Chi năm
  decadeIndex: number;       // Thuộc Đại Vận nào (0 - 9)
  decadeAgeRange: string;    // Ví dụ "32 - 41 tuổi"
  decadePalaceName: string;  // Tên cung đại vận
  
  // Điểm số 5 chiều
  overallScore: number;      // 0 - 100
  wealthScore: number;
  careerScore: number;
  healthScore: number;
  relationshipScore: number;

  tier: HeatmapColorTier;
  tierLabelVi: string;
  isPeakGolden: boolean;     // Điểm vàng cực thịnh
  isValleyCrisis: boolean;   // Thung lũng rủi ro cao
  summaryAdvice: string;
}

export interface GoldenWindowPeriod {
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  averageScore: number;
  theme: string;
  actionProtocol: string;
}

export interface CrisisValleyPeriod {
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  averageScore: number;
  vulnerabilityTheme: string;
  defensiveProtocol: string;
}

export interface LifetimeHeatmapData {
  birthYear: number;
  currentAge: number;
  currentYear: number;
  allYears: YearHeatmapCell[];
  goldenWindows: GoldenWindowPeriod[];
  crisisValleys: CrisisValleyPeriod[];
  lifetimeAverageScore: number;
  peakYear: YearHeatmapCell;
  lowestYear: YearHeatmapCell;
}

export function generate100YearHeatmap(
  birthData: BirthData,
  calculation: CalculationResult,
  customAnalysisYear?: number
): LifetimeHeatmapData {
  const birthYear = birthData.solarYear;
  const currentCalendarYear = customAnalysisYear || calculation.analysisYear || new Date().getFullYear();
  const currentAge = currentCalendarYear - birthYear + 1;
  const decades = calculation.decades || [];

  const allYears: YearHeatmapCell[] = [];

  // Tạo 100 tế bào năng lượng cho 100 năm
  for (let age = 1; age <= 100; age++) {
    const solarYear = birthYear + age - 1;
    const { stem: yStem, branch: yBranch } = getYearStemBranch(solarYear);
    const yStemInfo = STEMS[yStem];
    const yBranchInfo = BRANCHES[yBranch];
    const yearCanChiVi = `${yStemInfo?.nameVi || ''} ${yBranchInfo?.nameVi || ''}`;

    // Tìm đại vận tương ứng
    const decadeIdx = Math.min(decades.length > 0 ? decades.length - 1 : 9, Math.floor((age - 1) / 10));
    const decadeObj = decades[decadeIdx] || decades[0];
    const decadeStartAge = decadeObj ? decadeObj.startAge : 1;
    const decadeEndAge = decadeObj ? decadeObj.endAge : 10;
    const decadePalaceKey = decadeObj ? decadeObj.focalPalace : 'life';
    const decadePalaceName = calculation.ziwei?.palaces?.[decadePalaceKey]?.nameVi || 'Mệnh Cung';

    // Tính điểm động theo nhịp sóng hài sin và tương tác can chi
    const phaseOffset = ((age * 7 + (solarYear % 12)) % 360) * (Math.PI / 180);
    const wave = Math.sin(phaseOffset) * 16;
    const decadeBaseline = decadeObj?.harmonyScore || 70;

    let overall = Math.round(decadeBaseline + wave);
    overall = Math.max(30, Math.min(98, overall));

    const wealth = Math.max(25, Math.min(99, Math.round(overall + Math.sin(phaseOffset * 1.5) * 10)));
    const career = Math.max(25, Math.min(99, Math.round(overall + Math.cos(phaseOffset * 1.2) * 8)));
    const health = Math.max(25, Math.min(99, Math.round(overall - (age > 60 ? (age - 60) * 0.4 : 0))));
    const relationship = Math.max(25, Math.min(99, Math.round(overall + Math.sin(phaseOffset * 0.8) * 9)));

    // Phân loại Tier màu sắc
    let tier: HeatmapColorTier = 'BALANCED';
    let tierLabelVi = 'Bình Hòa (Cân Bằng)';
    if (overall >= 84) {
      tier = 'GOLDEN';
      tierLabelVi = 'Hoàng Kim (Đại Cát)';
    } else if (overall >= 72) {
      tier = 'AUSPICIOUS';
      tierLabelVi = 'Cát Lợi (Thuận Buồm)';
    } else if (overall >= 58) {
      tier = 'BALANCED';
      tierLabelVi = 'Bình Hòa (Ổn Định)';
    } else if (overall >= 46) {
      tier = 'CAUTION';
      tierLabelVi = 'Thận Trọng (Rà Soát)';
    } else {
      tier = 'CRISIS';
      tierLabelVi = 'Phòng Ngự (Nguy Cơ)';
    }

    const isPeakGolden = overall >= 88;
    const isValleyCrisis = overall <= 44;

    let summaryAdvice = '';
    if (tier === 'GOLDEN') {
      summaryAdvice = `Vận khí cực thịnh tại tuổi ${age} (${solarYear}). Thời điểm đắc địa để xuất kích dự án lớn, đầu tư tài sản hoặc tạo bước ngoặt cơ nghiệp.`;
    } else if (tier === 'AUSPICIOUS') {
      summaryAdvice = `Thiên thời nhân hòa, các kế hoạch công việc triển khai thuận lợi, có quý nhân đồng hành.`;
    } else if (tier === 'CRISIS') {
      summaryAdvice = `Cảnh báo trắc trở hoặc tiêu hao sinh lực tại tuổi ${age}. Kích hoạt chế độ phòng thủ: bảo toàn vốn, giữ hòa khí và chăm sóc sức khỏe.`;
    } else if (tier === 'CAUTION') {
      summaryAdvice = `Năng lượng dao động nhẹ, nên rà soát kỹ các điều khoản pháp lý và kiểm soát chi phí.`;
    } else {
      summaryAdvice = `Dòng chảy ổn định, thích hợp trau dồi chuyên môn và tích lũy tư liệu đường dài.`;
    }

    allYears.push({
      age,
      solarYear,
      yearCanChiVi,
      decadeIndex: decadeIdx,
      decadeAgeRange: `${decadeStartAge} - ${decadeEndAge} tuổi`,
      decadePalaceName: decadePalaceName,
      overallScore: overall,
      wealthScore: wealth,
      careerScore: career,
      healthScore: health,
      relationshipScore: relationship,
      tier,
      tierLabelVi,
      isPeakGolden,
      isValleyCrisis,
      summaryAdvice
    });
  }

  // Thuật toán nhận diện Golden Windows (Cửa Sổ Hoàng Kim - chuỗi 3 năm trở lên điểm cao)
  const goldenWindows: GoldenWindowPeriod[] = [];
  let currentWindow: YearHeatmapCell[] = [];

  allYears.forEach((cell) => {
    if (cell.overallScore >= 75) {
      currentWindow.push(cell);
    } else {
      if (currentWindow.length >= 3) {
        const avg = Math.round(currentWindow.reduce((acc, c) => acc + c.overallScore, 0) / currentWindow.length);
        goldenWindows.push({
          startAge: currentWindow[0].age,
          endAge: currentWindow[currentWindow.length - 1].age,
          startYear: currentWindow[0].solarYear,
          endYear: currentWindow[currentWindow.length - 1].solarYear,
          averageScore: avg,
          theme: `Chu kỳ Bứt Phá & Khẳng Định Cơ Nghiệp (${currentWindow[0].age} - ${currentWindow[currentWindow.length - 1].age} tuổi)`,
          actionProtocol: 'Tập trung dồn toàn lực mở rộng quy mô, gọi vốn, thâu tóm cơ hội chiến lược và niêm yết/tạo dựng di sản.'
        });
      }
      currentWindow = [];
    }
  });

  // Thuật toán nhận diện Crisis Valleys (Thung Lũng Cần Phòng Ngự - chuỗi 2 năm trở lên điểm thấp)
  const crisisValleys: CrisisValleyPeriod[] = [];
  let currentValley: YearHeatmapCell[] = [];

  allYears.forEach((cell) => {
    if (cell.overallScore <= 52) {
      currentValley.push(cell);
    } else {
      if (currentValley.length >= 2) {
        const avg = Math.round(currentValley.reduce((acc, c) => acc + c.overallScore, 0) / currentValley.length);
        crisisValleys.push({
          startAge: currentValley[0].age,
          endAge: currentValley[currentValley.length - 1].age,
          startYear: currentValley[0].solarYear,
          endYear: currentValley[currentValley.length - 1].solarYear,
          averageScore: avg,
          vulnerabilityTheme: `Giai đoạn Thử Thách & Tái Cấu Trúc (${currentValley[0].age} - ${currentValley[currentValley.length - 1].age} tuổi)`,
          defensiveProtocol: 'Thắt chặt thanh khoản, không bảo lãnh tài chính, hoãn các canh bạc đầu tư rủi ro cao và thiền định tĩnh tâm.'
        });
      }
      currentValley = [];
    }
  });

  const lifetimeAvg = Math.round(allYears.reduce((acc, c) => acc + c.overallScore, 0) / allYears.length);
  const sorted = [...allYears].sort((a, b) => b.overallScore - a.overallScore);
  const peakYear = sorted[0];
  const lowestYear = sorted[sorted.length - 1];

  return {
    birthYear,
    currentAge,
    currentYear: currentCalendarYear,
    allYears,
    goldenWindows,
    crisisValleys,
    lifetimeAverageScore: lifetimeAvg,
    peakYear,
    lowestYear
  };
}

// ==========================================
// PERSONAL ENERGY FORECAST & ANOMALY DETECTION ENGINE
// Tính toán quỹ đạo năng lượng 12 tháng từ calculation.cycles & Bát Tự
// Nhận diện sự sụt giảm hoặc tăng vọt đột ngột để thông báo cảnh báo nhẹ nhàng
// ==========================================

import {
  CalculationResult,
  DecadeCycle,
  FiveElement,
  EarthlyBranch,
  HeavenlyStem
} from '../types/destiny';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from './canchi';
import { calculateMonthPillar, calculateYearPillar } from './bazi';

export interface MonthlyEnergyPoint {
  monthIndex: number; // 0..11
  label: string; // "T10/26"
  fullLabel: string; // "Tháng 10/2026"
  year: number;
  month: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  canChiName: string; // e.g. "Bính Tý"
  element: FiveElement;
  solarTermName: string;
  activeCycleName: string;
  activeCycleElement: FiveElement;
  activeCycleScore: number;
  vitalityEnergy: number; // 0 - 100
  opportunityScore: number; // 0 - 100
  harmonyScore: number; // 0 - 100
  compositeEnergy: number; // 0 - 100
  statusTag: 'VƯỢNG KHÍ' | 'CÁT LỢI' | 'BÌNH HÒA' | 'THẬN TRỌNG';
  strategicAdvice: string;
  elementInteraction: string;
}

export const SOLAR_TERM_MONTH_NAMES = [
  'Lập Xuân (Dần)', 'Kinh Trập (Mão)', 'Thanh Minh (Thìn)',
  'Lập Hạ (Tỵ)', 'Mang Chủng (Ngọ)', 'Tiểu Thử (Mùi)',
  'Lập Thu (Thân)', 'Bạch Lộ (Dậu)', 'Hàn Lộ (Tuất)',
  'Lập Đông (Hợi)', 'Đại Tuyết (Tý)', 'Tiểu Hàn (Sửu)'
];

export interface EnergyShiftAlert {
  id: string;
  type: 'drop' | 'surge'; // 'drop': sụt giảm đột ngột, 'surge': tăng vọt đột ngột
  monthIndex: number;
  month: number;
  year: number;
  label: string;
  fullLabel: string;
  canChiName: string;
  element: FiveElement;
  fromMonthLabel: string;
  fromScore: number;
  toScore: number;
  delta: number; // âm nếu drop, dương nếu surge
  severity: 'mild' | 'moderate' | 'high';
  title: string;
  shortWarning: string;
  detailedGuidance: string;
  strategicRemedy: string;
  favorableElementHint?: string;
}

export interface EnergyShiftDetectionOptions {
  threshold?: number; // Ngưỡng biến động đột ngột (mặc định 10 điểm)
  favorableElements?: FiveElement[];
  unfavorableElements?: FiveElement[];
}

/**
 * Tính toán dòng năng lượng 12 tháng tới dựa trên Bát Tự & Chu kỳ Đại Vận calculation.cycles
 */
export function compute12MonthsEnergyTrajectory(
  calculation: CalculationResult,
  referenceDate: Date = new Date()
): MonthlyEnergyPoint[] {
  const cycles: DecadeCycle[] = (calculation as any)?.cycles || calculation?.decades || [];
  const birthYear = calculation?.inputSnapshot?.solarYear || 1990;
  const dayMasterElement: FiveElement = calculation?.bazi?.dayMasterElement || 'Wood';

  const startYear = referenceDate.getFullYear();
  const startMonth = referenceDate.getMonth() + 1; // 1 - 12
  const points: MonthlyEnergyPoint[] = [];

  for (let i = 0; i < 12; i++) {
    let targetMonth = startMonth + i;
    let targetYear = startYear;
    if (targetMonth > 12) {
      targetYear += Math.floor((targetMonth - 1) / 12);
      targetMonth = ((targetMonth - 1) % 12) + 1;
    }

    // 1. Xác định Đại Vận cai quản từ calculation.cycles
    const ageInTargetYear = targetYear - birthYear;
    let activeCycle = cycles.find(
      (c) => targetYear >= c.startYear && targetYear <= c.endYear
    );
    if (!activeCycle && cycles.length > 0) {
      activeCycle = cycles.find(
        (c) => ageInTargetYear >= c.startAge && ageInTargetYear <= c.endAge
      ) || cycles[0];
    }

    const cycleBaseScore = activeCycle?.harmonyScore ?? activeCycle?.ruleBasedScore ?? 75;
    const cycleElement = activeCycle?.element ?? 'Earth';
    const cycleStemName = activeCycle ? STEMS[activeCycle.stem]?.nameVi : 'Giáp';
    const cycleBranchName = activeCycle ? BRANCHES[activeCycle.branch]?.nameVi : 'Thân';
    const cycleName = activeCycle
      ? `Đại Vận ${cycleStemName} ${cycleBranchName} (${activeCycle.startAge}-${activeCycle.endAge}t)`
      : 'Đại Vận Đương Thời';

    // 2. Tính Trụ Tháng chính tông (Can Chi Tháng)
    const yearPillar = calculateYearPillar(targetYear, targetMonth, 15);
    const monthPillar = calculateMonthPillar(yearPillar.stem, targetYear, targetMonth, 15);
    const monthStemInfo = STEMS[monthPillar.stem];
    const monthBranchInfo = BRANCHES[monthPillar.branch];
    const monthElement = monthStemInfo.element;

    // 3. Tương tác Ngũ Hành giữa Khí Tháng và Đại Vận
    let elementalDelta = 0;
    let interactionDescription = '';
    if (ELEMENT_RELATIONS[monthElement]?.generates === cycleElement) {
      elementalDelta = 8;
      interactionDescription = `Tháng ${ELEMENT_RELATIONS[monthElement].vi} sinh dưỡng Đại Vận ${ELEMENT_RELATIONS[cycleElement].vi} (Hanh thông)`;
    } else if (monthElement === cycleElement) {
      elementalDelta = 5;
      interactionDescription = `Tháng ${ELEMENT_RELATIONS[monthElement].vi} tỷ hòa đồng khí với Đại Vận (Ổn định)`;
    } else if (ELEMENT_RELATIONS[cycleElement]?.generates === monthElement) {
      elementalDelta = 2;
      interactionDescription = `Đại Vận xuất khí sinh tháng (Tập trung sáng tạo)`;
    } else if (ELEMENT_RELATIONS[cycleElement]?.overcomes === monthElement) {
      elementalDelta = -4;
      interactionDescription = `Đại Vận khắc chế khí tháng (Kiểm soát tiến độ)`;
    } else if (ELEMENT_RELATIONS[monthElement]?.overcomes === cycleElement) {
      elementalDelta = -8;
      interactionDescription = `Khí tháng xung khắc Đại Vận (Cần tĩnh tâm, hạn chế mạo hiểm)`;
    }

    // 4. Tương tác với Nhật Chủ (Day Master)
    let dayMasterDelta = 0;
    if (ELEMENT_RELATIONS[monthElement]?.generates === dayMasterElement) {
      dayMasterDelta = 6; // Ấn tinh sinh thân
    } else if (monthElement === dayMasterElement) {
      dayMasterDelta = 4; // Tỷ kiếp trợ thân
    } else if (ELEMENT_RELATIONS[dayMasterElement]?.generates === monthElement) {
      dayMasterDelta = 2; // Thực thương phát tiết
    } else if (ELEMENT_RELATIONS[monthElement]?.overcomes === dayMasterElement) {
      dayMasterDelta = -5; // Quan sát khắc thân
    }

    // 5. Điểm số tổng hòa chuẩn hóa từ 40 - 99
    const compositeEnergy = Math.max(
      42,
      Math.min(98, Math.round(cycleBaseScore * 0.7 + (75 + elementalDelta * 2 + dayMasterDelta) * 0.3))
    );
    const vitalityEnergy = Math.max(
      45,
      Math.min(99, Math.round(compositeEnergy + elementalDelta * 0.8))
    );
    const opportunityScore = Math.max(
      40,
      Math.min(96, Math.round(cycleBaseScore * 0.5 + (70 + dayMasterDelta * 3 + elementalDelta) * 0.5))
    );
    const harmonyScore = Math.max(
      42,
      Math.min(97, Math.round(100 - Math.abs(vitalityEnergy - opportunityScore) * 0.5 + elementalDelta))
    );

    // Phân loại trạng thái
    let statusTag: 'VƯỢNG KHÍ' | 'CÁT LỢI' | 'BÌNH HÒA' | 'THẬN TRỌNG' = 'BÌNH HÒA';
    if (compositeEnergy >= 84) statusTag = 'VƯỢNG KHÍ';
    else if (compositeEnergy >= 74) statusTag = 'CÁT LỢI';
    else if (compositeEnergy < 62) statusTag = 'THẬN TRỌNG';

    let strategicAdvice = 'Giữ nhịp độ ổn định, bám sát kế hoạch trung hạn.';
    if (statusTag === 'VƯỢNG KHÍ') {
      strategicAdvice = 'Thời điểm vàng để kích hoạt dự án lớn, mở rộng tài chính và chốt thương vụ quan trọng.';
    } else if (statusTag === 'CÁT LỢI') {
      strategicAdvice = 'Năng lượng nâng đỡ tốt cho các bước tiến hành công việc và hợp tác chiến lược.';
    } else if (statusTag === 'THẬN TRỌNG') {
      strategicAdvice = 'Bảo toàn nguồn vốn, tránh quyết định bộc phát; tập trung tu dưỡng nội lực và quản trị rủi ro.';
    }

    const branchIdx = ['Yin_B', 'Mao', 'Chen', 'Si', 'Wu_B', 'Wei', 'Shen', 'You', 'Xu', 'Hai', 'Zi', 'Chou'].indexOf(monthPillar.branch);
    const solarTermName = branchIdx >= 0 ? SOLAR_TERM_MONTH_NAMES[branchIdx] : 'Tiết Khí';

    points.push({
      monthIndex: i,
      label: `T${targetMonth}/${String(targetYear).slice(2)}`,
      fullLabel: `Tháng ${targetMonth}/${targetYear}`,
      year: targetYear,
      month: targetMonth,
      stem: monthPillar.stem,
      branch: monthPillar.branch,
      canChiName: `${monthStemInfo.nameVi} ${monthBranchInfo.nameVi}`,
      element: monthElement,
      solarTermName,
      activeCycleName: cycleName,
      activeCycleElement: cycleElement,
      activeCycleScore: cycleBaseScore,
      vitalityEnergy,
      opportunityScore,
      harmonyScore,
      compositeEnergy,
      statusTag,
      strategicAdvice,
      elementInteraction: interactionDescription
    });
  }

  return points;
}

/**
 * Phát hiện các điểm biến động năng lượng bất thường:
 * Sụt giảm đột ngột (drop) hoặc Tăng vọt đột ngột (surge)
 */
export function detectEnergyShifts(
  monthlyData: MonthlyEnergyPoint[],
  options: EnergyShiftDetectionOptions = {}
): EnergyShiftAlert[] {
  if (!monthlyData || monthlyData.length < 2) return [];

  const threshold = options.threshold ?? 10;
  const alerts: EnergyShiftAlert[] = [];
  const favorableElementsStr = options.favorableElements?.map((e) => ELEMENT_RELATIONS[e]?.vi || e).join(', ');

  for (let i = 1; i < monthlyData.length; i++) {
    const prev = monthlyData[i - 1];
    const curr = monthlyData[i];
    const delta = curr.compositeEnergy - prev.compositeEnergy;
    const absDelta = Math.abs(delta);

    // Kiểm tra ngưỡng biến động đột ngột hoặc rơi vào vùng cực đoan có thay đổi đáng kể
    const isSuddenDrop = delta <= -threshold || (curr.compositeEnergy <= 56 && delta <= -7);
    const isSuddenSurge = delta >= threshold || (curr.compositeEnergy >= 86 && delta >= 7);

    if (isSuddenDrop) {
      const severity: 'mild' | 'moderate' | 'high' =
        absDelta >= 16 || curr.compositeEnergy < 52
          ? 'high'
          : absDelta >= 12
          ? 'moderate'
          : 'mild';

      alerts.push({
        id: `drop-${curr.year}-${curr.month}-${i}`,
        type: 'drop',
        monthIndex: i,
        month: curr.month,
        year: curr.year,
        label: curr.label,
        fullLabel: curr.fullLabel,
        canChiName: curr.canChiName,
        element: curr.element,
        fromMonthLabel: prev.fullLabel,
        fromScore: prev.compositeEnergy,
        toScore: curr.compositeEnergy,
        delta,
        severity,
        title: `Lưu ý nhịp khí: Điểm giảm năng lượng vào ${curr.fullLabel}`,
        shortWarning: `Năng lượng chuyển từ ${prev.compositeEnergy}đ (${prev.label}) xuống ${curr.compositeEnergy}đ (${curr.label}), giảm ${absDelta} điểm do biến chuyển khí Can Chi (${curr.canChiName} hành ${ELEMENT_RELATIONS[curr.element]?.vi}).`,
        detailedGuidance: `Giai đoạn ${curr.fullLabel} (${curr.canChiName}) có độ biến thiên khí suy giảm nhẹ. Thích hợp để củng cố nội lực, rà soát hợp đồng, chăm sóc sức khỏe và tránh các thương vụ mạo hiểm đòn bẩy cao.`,
        strategicRemedy: `Lời khuyên: Chủ động sắp xếp công việc trọng đại sang các tháng cát lợi liền kề; giữ tâm thế điềm tĩnh và bồi đắp khí vận.`,
        favorableElementHint: favorableElementsStr ? `Bổ trợ phong thủy Dụng Thần hành ${favorableElementsStr} để bình ổn từ trường.` : undefined
      });
    } else if (isSuddenSurge) {
      const severity: 'mild' | 'moderate' | 'high' =
        absDelta >= 16 || curr.compositeEnergy >= 88
          ? 'high'
          : absDelta >= 12
          ? 'moderate'
          : 'mild';

      alerts.push({
        id: `surge-${curr.year}-${curr.month}-${i}`,
        type: 'surge',
        monthIndex: i,
        month: curr.month,
        year: curr.year,
        label: curr.label,
        fullLabel: curr.fullLabel,
        canChiName: curr.canChiName,
        element: curr.element,
        fromMonthLabel: prev.fullLabel,
        fromScore: prev.compositeEnergy,
        toScore: curr.compositeEnergy,
        delta,
        severity,
        title: `Điểm sáng vận trình: Năng lượng bứt phá vào ${curr.fullLabel}`,
        shortWarning: `Năng lượng vươn từ ${prev.compositeEnergy}đ lên ${curr.compositeEnergy}đ (+${delta} điểm), bước vào chu kỳ vượng khí rực rỡ (${curr.canChiName} hành ${ELEMENT_RELATIONS[curr.element]?.vi}).`,
        detailedGuidance: `Thời cơ vàng tại ${curr.fullLabel} hội tụ sinh khí mạnh mẽ từ chu kỳ ${curr.activeCycleName}. Cơ hội bứt phá trong sự nghiệp, thi cử, ký kết thương mại và mở rộng quan hệ đối tác.`,
        strategicRemedy: `Lời khuyên: Chuẩn bị nguồn lực và kế hoạch ngay từ tháng trước để nắm bắt trọn vẹn điểm rơi phong độ cao nhất này.`,
        favorableElementHint: favorableElementsStr ? `Kết hợp sức mạnh Dụng Thần hành ${favorableElementsStr} để khuếch đại thành tựu.` : undefined
      });
    }
  }

  return alerts;
}

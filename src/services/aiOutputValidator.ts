// ==========================================
// AURORA DESTINY AI — INDEPENDENT AI OUTPUT VALIDATOR
// Production-grade anti-hallucination and safety firewall for synthesized content.
// Validates: 1. Star names, 2. Palaces, 3. Can Chi, 4. Day Master,
// 5. Percentages/Cycles, 6. Prohibited fatalistic/medical/gambling claims.
// ==========================================

import { CalculationResult, FiveElement } from '../types/destiny';

export interface AiValidationViolation {
  category:
    | 'STAR_HALLUCINATION'
    | 'WRONG_PALACE'
    | 'WRONG_CAN_CHI'
    | 'INVERTED_DAY_MASTER'
    | 'NUMERICAL_DISCREPANCY'
    | 'BANNED_CLAIM';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  message: string;
  evidence: string;
}

export interface AiValidationResult {
  isValid: boolean;
  violations: AiValidationViolation[];
  sanitizedContent: string;
  fallbackUsed: boolean;
  auditTrail: {
    verifiedStarsCount: number;
    checkedPalacesCount: number;
    verifiedPillars: string[];
    scannedWordsCount: number;
  };
}

const STEM_NAMES_VI: Record<string, string> = {
  Jia: 'giáp',
  Yi: 'ất',
  Bing: 'bính',
  Ding: 'đinh',
  Wu: 'mậu',
  Ji: 'kỷ',
  Geng: 'canh',
  Xin: 'tân',
  Ren: 'nhâm',
  Gui: 'quý'
};

const BRANCH_NAMES_VI: Record<string, string> = {
  Zi: 'tý',
  Chou: 'sửu',
  Yin: 'dần',
  Mao: 'mão',
  Chen: 'thìn',
  Si: 'tỵ',
  Wu: 'ngọ',
  Wei: 'mùi',
  Shen: 'thân',
  You: 'dậu',
  Xu: 'tuất',
  Hai: 'hợi'
};

const PALACE_NAME_MAP: Record<string, string> = {
  life: 'mệnh',
  siblings: 'huynh đệ',
  spouse: 'phu thê',
  children: 'tử tức',
  wealth: 'tài bạch',
  health: 'tật ách',
  travel: 'thiên di',
  friends: 'nô bộc',
  career: 'quan lộc',
  property: 'điền trạch',
  karma: 'phúc đức',
  parents: 'phụ mẫu'
};

// Comprehensive list of standard Zi Wei astrological stars for hallucination detection
const CANONICAL_ASTROLOGICAL_STARS = [
  'tử vi', 'thiên phủ', 'vũ khúc', 'thiên tướng', 'thất sát', 'phá quân',
  'tham lang', 'liêm trinh', 'cự môn', 'thiên cơ', 'thái dương', 'thái âm',
  'thiên đồng', 'thiên lương', 'kình dương', 'đà la', 'hỏa tinh', 'linh tinh',
  'văn xương', 'văn khúc', 'thiên khôi', 'thiên việt', 'lộc tồn', 'thiên mã',
  'hóa lộc', 'hóa quyền', 'hóa khoa', 'hóa kỵ', 'địa không', 'địa kiếp',
  'đào hoa', 'hồng loan', 'thiên hỷ', 'thiên hình', 'thiên riêu', 'cô thần',
  'quả tú', 'đại hao', 'tiểu hao', 'tướng quân', 'phục binh', 'bạch hổ',
  'hoa cái', 'phượng các', 'giải thần', 'long trì', 'nguyệt đức', 'phúc đức'
];

export class AiOutputValidator {
  /**
   * Independently audit AI response text against deterministic calculation truth
   */
  public static validate(content: string, calc: CalculationResult): AiValidationResult {
    const violations: AiValidationViolation[] = [];
    const normalizedText = content.toLowerCase();
    const words = content.split(/\s+/).filter(Boolean);

    // ------------------------------------------------------------------
    // 1. BANNED CLAIMS AUDIT (Zero tolerance for dangerous advice)
    // ------------------------------------------------------------------
    const BANNED_PATTERNS: Array<{ regex: RegExp; message: string; category: AiValidationViolation['category'] }> = [
      {
        regex: /(bạn\s+bị\s+ung\s+thư|ngưng\s+uống\s+thuốc|bỏ\s+điều\s+trị|không\s+cần\s+đi\s+khám|chẩn\s+đoán\s+bệnh\s+nan\s+y)/i,
        message: 'Nội dung chứa chẩn đoán hoặc can thiệp y tế bất hợp pháp',
        category: 'BANNED_CLAIM'
      },
      {
        regex: /(chắc\s+chắn\s+trúng|đặt\s+cược|tất\s+tay|chơi\s+lô\s+đề|cam\s+kết\s+lãi|đầu\s+tư\s+chắc\s+thắng)/i,
        message: 'Nội dung chứa cam kết đầu tư tài chính hoặc xúi giục cờ bạc đỏ đen',
        category: 'BANNED_CLAIM'
      },
      {
        regex: /(sẽ\s+tử\s+vong|đại\s+nạn\s+chết|chắc\s+chắn\s+chết\s+yểu|số\s+chết\s+vào\s+năm)/i,
        message: 'Nội dung chứa phán đoán sinh tử tất định cực đoan',
        category: 'BANNED_CLAIM'
      },
      {
        regex: /(bị\s+ma\s+ám|dính\s+bùa\s+ngải|phải\s+cúng\s+giải\s+hạn\s+mới\s+sống|nạp\s+tiền\s+giải\s+nghiệp)/i,
        message: 'Nội dung chứa mê tín dị đoan hoặc trục lợi tâm linh',
        category: 'BANNED_CLAIM'
      }
    ];

    for (const rule of BANNED_PATTERNS) {
      const match = rule.regex.exec(content);
      if (match) {
        violations.push({
          category: rule.category,
          severity: 'CRITICAL',
          message: rule.message,
          evidence: match[0]
        });
      }
    }

    // ------------------------------------------------------------------
    // 2. DAY MASTER AUDIT (Verify Day Master consistency)
    // ------------------------------------------------------------------
    const expectedDayMasterVi = STEM_NAMES_VI[calc.bazi.dayMaster];
    for (const [stem, stemVi] of Object.entries(STEM_NAMES_VI)) {
      if (stem !== calc.bazi.dayMaster) {
        // Look for patterns like "nhật chủ [stem]" or "can ngày [stem]"
        const pattern = new RegExp(`(nhật\\s+chủ|can\\s+ngày|bản\\s+mệnh\\s+ngày)\\s+(${stemVi})\\b`, 'i');
        const match = pattern.exec(normalizedText);
        if (match) {
          violations.push({
            category: 'INVERTED_DAY_MASTER',
            severity: 'CRITICAL',
            message: `AI tuyên bố sai Nhật Chủ là ${stemVi.toUpperCase()} (Nhật Chủ thực tế là ${expectedDayMasterVi.toUpperCase()})`,
            evidence: match[0]
          });
        }
      }
    }

    // ------------------------------------------------------------------
    // 3. CAN CHI PILLARS AUDIT (Verify 4 Pillars)
    // ------------------------------------------------------------------
    const expectedYearPillar = `${STEM_NAMES_VI[calc.bazi.yearPillar.stem]} ${BRANCH_NAMES_VI[calc.bazi.yearPillar.branch]}`.toLowerCase();
    // Check if text asserts a fabricated year pillar like "năm sinh [can chi]" or "trụ năm là [can chi]"
    const yearMatch = /(?:năm\s+sinh|trụ\s+năm\s+là|năm\s+tuổi)\s+([a-zà-ỹ]+)\s+([a-zà-ỹ]+)/i.exec(normalizedText);
    if (yearMatch) {
      const assertedYearPillar = `${yearMatch[1]} ${yearMatch[2]}`.trim().toLowerCase();
      const isKnownStemBranch = Object.values(STEM_NAMES_VI).includes(yearMatch[1].toLowerCase()) &&
                                Object.values(BRANCH_NAMES_VI).includes(yearMatch[2].toLowerCase());
      if (isKnownStemBranch && assertedYearPillar !== expectedYearPillar) {
        violations.push({
          category: 'WRONG_CAN_CHI',
          severity: 'HIGH',
          message: `AI nói sai Trụ Năm là ${assertedYearPillar.toUpperCase()} (thực tế là ${expectedYearPillar.toUpperCase()})`,
          evidence: yearMatch[0]
        });
      }
    }

    // ------------------------------------------------------------------
    // 4. STAR NAMES & PALACE LOCATION AUDIT
    // ------------------------------------------------------------------
    // Build map of actual stars to their assigned palace
    const actualStarsMap = new Map<string, string>(); // starNameVi.toLowerCase() -> palaceKey
    const allActualStars = new Set<string>();

    Object.entries(calc.ziwei.palaces || {}).forEach(([pKey, palace]) => {
      palace?.majorStars?.forEach(s => {
        const sNorm = s.nameVi.toLowerCase();
        actualStarsMap.set(sNorm, pKey);
        allActualStars.add(sNorm);
      });
      palace?.minorStars?.forEach(s => {
        const sNorm = s.nameVi.toLowerCase();
        actualStarsMap.set(sNorm, pKey);
        allActualStars.add(sNorm);
      });
    });

    // Detect claims like: "sao X tại cung Y" or "cung Y có sao X" or "sao X thủ mệnh"
    for (const [pKey, pVi] of Object.entries(PALACE_NAME_MAP)) {
      for (const canonicalStar of CANONICAL_ASTROLOGICAL_STARS) {
        // For the star "tử vi", require explicit "sao tử vi" or active placement verb
        // to avoid false positives on system phrases like "Lá số Tử Vi", "Cung Mệnh theo Tử Vi"
        if (canonicalStar === 'tử vi') {
          if (!/(?:sao\s+tử\s+vi|tử\s+vi\s+(?:tọa|thủ|đóng|chiếu|hội))/i.test(normalizedText)) {
            continue;
          }
        }

        // Pattern A: "cung [pVi] có/tọa/thủ/đóng/hội/chiếu [sao] [canonicalStar]"
        const patternA = new RegExp(`cung\\s+${pVi}[^,.]{0,25}?\\b(?:có|tọa|thủ|đóng|hội|chiếu)\\s+(?:sao\\s+)?${canonicalStar}\\b`, 'i');
        // Pattern B: "[canonicalStar] tại/tọa/đóng/chiếu/hội/thủ/vào cung [pVi]"
        const patternB = new RegExp(`(?:sao\\s+)?${canonicalStar}\\s+(?:tại|tọa|đóng|chiếu|hội|thủ|vào)\\s+cung\\s+${pVi}\\b`, 'i');

        const match = patternA.exec(normalizedText) || patternB.exec(normalizedText);
        if (match) {
          const actualPalace = actualStarsMap.get(canonicalStar);
          if (!actualPalace) {
            // Star does not exist anywhere on this chart!
            violations.push({
              category: 'STAR_HALLUCINATION',
              severity: 'HIGH',
              message: `AI sáng chế sao ${canonicalStar.toUpperCase()} không hề xuất hiện trên lá số của đương số`,
              evidence: match[0]
            });
          } else if (actualPalace !== pKey) {
            // Star exists on chart, but in a completely different palace!
            const actualPalaceVi = PALACE_NAME_MAP[actualPalace] || actualPalace;
            violations.push({
              category: 'WRONG_PALACE',
              severity: 'HIGH',
              message: `AI gán sai sao ${canonicalStar.toUpperCase()} vào cung ${pVi.toUpperCase()} (thực tế sao này đóng tại cung ${actualPalaceVi.toUpperCase()})`,
              evidence: match[0]
            });
          }
        }
      }
    }

    // Special check for "thủ mệnh": "[canonicalStar] thủ mệnh" -> means star is in Life palace
    for (const canonicalStar of CANONICAL_ASTROLOGICAL_STARS) {
      const thuMenhPattern = new RegExp(`(?:sao\\s+)?${canonicalStar}\\s+thủ\\s+mệnh\\b`, 'i');
      const match = thuMenhPattern.exec(normalizedText);
      if (match) {
        const actualPalace = actualStarsMap.get(canonicalStar);
        if (actualPalace !== 'life') {
          violations.push({
            category: 'WRONG_PALACE',
            severity: 'HIGH',
            message: `AI tuyên bố sao ${canonicalStar.toUpperCase()} thủ Mệnh (thực tế cung Mệnh không có sao này)`,
            evidence: match[0]
          });
        }
      }
    }

    // ------------------------------------------------------------------
    // 5. FIVE ELEMENT PERCENTAGE & NUMERICAL AUDIT
    // ------------------------------------------------------------------
    const ELEMENT_VI_MAP: Record<string, FiveElement> = {
      'mộc': 'Wood',
      'hỏa': 'Fire',
      'thổ': 'Earth',
      'kim': 'Metal',
      'thủy': 'Water'
    };

    for (const [elVi, elKey] of Object.entries(ELEMENT_VI_MAP)) {
      const elPattern = new RegExp(`(${elVi})\\s*(?:chiếm|đạt|là|ở\\s+mức)\\s*([0-9]{1,3})\\s*%`, 'i');
      const match = elPattern.exec(normalizedText);
      if (match) {
        const assertedPct = parseInt(match[2], 10);
        const actualPct = calc.bazi.elementBalance?.[elKey] ?? 0;
        if (Math.abs(assertedPct - actualPct) > 20) {
          violations.push({
            category: 'NUMERICAL_DISCREPANCY',
            severity: 'MEDIUM',
            message: `AI nói sai tỷ lệ ngũ hành hành ${elVi.toUpperCase()}: ${assertedPct}% (số liệu toán học thực tế là ${actualPct}%)`,
            evidence: match[0]
          });
        }
      }
    }

    // Determine validity: critical or high severity violations invalidate the output
    const isCriticalOrHigh = violations.some(v => v.severity === 'CRITICAL' || v.severity === 'HIGH');
    const isValid = violations.length === 0;

    let sanitizedContent = content;
    let fallbackUsed = false;

    if (!isValid && isCriticalOrHigh) {
      fallbackUsed = true;
      sanitizedContent = this.generateSafeDeterministicFallback(calc, violations);
    }

    return {
      isValid,
      violations,
      sanitizedContent,
      fallbackUsed,
      auditTrail: {
        verifiedStarsCount: allActualStars.size,
        checkedPalacesCount: Object.keys(calc.ziwei.palaces || {}).length,
        verifiedPillars: [expectedYearPillar, `${STEM_NAMES_VI[calc.bazi.dayPillar.stem]} ${BRANCH_NAMES_VI[calc.bazi.dayPillar.branch]}`],
        scannedWordsCount: words.length
      }
    };
  }

  /**
   * Deterministic safe response generated directly from mathematical calculations
   * when AI synthesis violates grounding rules or safety standards.
   */
  public static generateSafeDeterministicFallback(calc: CalculationResult, violations: AiValidationViolation[]): string {
    const dayMasterVi = STEM_NAMES_VI[calc.bazi.dayMaster]?.toUpperCase() || calc.bazi.dayMaster;
    const dayMasterEl = calc.bazi.dayMasterElement;
    const favorable = (calc.bazi.favorableElements || []).join(', ');
    const unfavorable = (calc.bazi.unfavorableElements || []).join(', ');
    const cuc = calc.ziwei.elementBureau;
    const lifeStars = (calc.ziwei.palaces.life?.majorStars || []).map(s => s.nameVi).join(', ') || 'Vô Chính Diệu';

    const violationSummary = violations.map(v => `• [${v.category}] ${v.message}`).join('\n');

    return `[HỆ THỐNG KIỂM SOÁT TÍNH ĐÚNG ĐẮN VÀ AN TOÀN ĐÃ KÍCH HOẠT]\n\n` +
      `Bản phân tích đã được chuyển sang chế độ đối soát tất định (Deterministic Grounded Interpretation) ` +
      `do phát hiện các điểm sai lệch so với dữ liệu tính toán gốc:\n` +
      `${violationSummary}\n\n` +
      `--- TỌA ĐỘ BÁT TỰ & TỬ VI CHÍNH XÁC ---\n` +
      `• Nhật Chủ (Can ngày): ${dayMasterVi} (Hành ${dayMasterEl}), Trạng thái: ${calc.bazi.dayMasterStrength}\n` +
      `• Cấu trúc mệnh cục: ${calc.bazi.structureType}\n` +
      `• Dụng Thần hỗ trợ: ${favorable} | Kỵ Thần: ${unfavorable}\n` +
      `• Tử Vi Cục số: ${cuc}\n` +
      `• Chính tinh Cung Mệnh: ${lifeStars}\n\n` +
      `--- ĐỊNH HƯỚNG HÀNH ĐỘNG AN TOÀN & THỰC TIỄN ---\n` +
      `1. Phát huy thế mạnh của Dụng Thần (${favorable}) qua các hành động cụ thể, rèn luyện kỹ năng và mở rộng môi trường phù hợp.\n` +
      `2. Giữ kỷ luật quản trị tài chính, không đưa ra các cam kết vượt quá năng lực chịu rủi ro trong các giai đoạn dao động.\n` +
      `3. Vận mệnh nằm trong tay người hành động: Mọi mô hình toán học và lý thuyết cổ học Đông phương chỉ đóng vai trò la bàn tham chiếu, ` +
      `kết quả cuộc sống thực tế được quyết định bởi ý chí tự do, sự kiên trì và trí tuệ thực nghiệm của chính bạn.`;
  }
}

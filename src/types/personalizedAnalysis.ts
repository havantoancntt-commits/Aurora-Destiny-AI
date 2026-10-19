// ==========================================
// AURORA DESTINY AI — PERSONALIZED ANALYSIS & 5-TIER REASONING TYPES
// Standardized Structure for Fully Individualized Metaphysical Dossiers
// Zero-Slop, Strict Grounding, 5-Layer Evidentiary Separation & Audit Traceability
// ==========================================

import { FiveElement, HeavenlyStem, EarthlyBranch } from './destiny';

export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'PROVISIONAL' | 'INSUFFICIENT_DATA';

export type AnalysisDomainKey =
  | 'personal_overview'
  | 'career_capability'
  | 'financial_flow'
  | 'relationships_family'
  | 'temporal_cycles';

/**
 * 5-Layer Evidentiary Item: Guarantees transparent separation between:
 * 1. User-supplied facts (Dữ liệu người dùng cung cấp)
 * 2. Engine-calculated artifacts (Kết quả do engine tính toán)
 * 3. Traditional school doctrine (Luận giải theo quy chuẩn trường phái)
 * 4. AI-synthesized insight (Nhận định tham khảo định hướng thực tế)
 * 5. Data boundary / limitations (Giới hạn dữ liệu & ranh giới chưa đủ căn cứ)
 */
export interface LayeredInsightItem {
  id: string;
  domain: AnalysisDomainKey;
  headline: string;
  
  // Tầng 1: Dữ liệu thực tế người dùng cung cấp
  userSuppliedFacts: string[];
  
  // Tầng 2: Kết quả do engine tính toán độc lập
  calculatedArtifacts: {
    metricName: string;
    value: string | number;
    sourceEngine: 'BaziEngine' | 'ZiweiEngine' | 'TemporalEngine' | 'EphemerisAstronomical';
  }[];
  
  // Tầng 3: Quy chuẩn trường phái cổ học
  schoolDoctrine: {
    schoolName: string; // e.g. "Tử Bình Cổ Pháp - Trích Thiên Tủy", "Tử Vi Đẩu Số Toàn Thư"
    classicalPrinciple: string;
    textCitation?: string;
  };
  
  // Tầng 4: Nhận định tham khảo & định hướng thực tế từ AI
  aiSynthesizedInsight: {
    synthesis: string;
    actionableAdvice: string;
    realWorldCondition: string; // Điều kiện áp dụng trong đời sống
  };
  
  // Tầng 5: Giới hạn dữ liệu & nội dung chưa đủ căn cứ (nếu có)
  dataBoundaryNotice?: {
    isComplete: boolean;
    missingPrerequisites: string[];
    uncertaintyWarning: string;
  };
  
  confidenceTier: ConfidenceTier;
  provenanceRuleId: string;
}

// Lĩnh vực A: Tổng quan cá nhân
export interface PersonalOverviewDomain {
  coreEssence: LayeredInsightItem;
  distinctiveStrengths: LayeredInsightItem[];
  inherentVulnerabilities: LayeredInsightItem[];
  elementalBalanceRationale: string;
  missingDataBoundaries: string[];
}

// Lĩnh vực B: Công việc và phát triển năng lực
export interface CareerAndCapabilityDomain {
  vocationAlignment: LayeredInsightItem;
  executionStyle: LayeredInsightItem;
  practicalDevelopmentPath: LayeredInsightItem[];
  applicabilityConditions: string[];
  nonDeterministicDisclaimer: string;
}

// Lĩnh vực C: Tài chính & Dòng tiền
export interface FinancialDynamicsDomain {
  wealthFlowMechanism: LayeredInsightItem;
  capitalRetentionStyle: LayeredInsightItem;
  prudentRiskBoundaries: string[];
  distinctionFromFinancialAdvice: string;
}

// Lĩnh vực D: Tình cảm & Các mối quan hệ
export interface RelationshipsAndFamilyDomain {
  interpersonalStyle: LayeredInsightItem;
  partnershipDynamics: LayeredInsightItem;
  constructiveCommunicationGuidance: string[];
  ethicalRelationalBoundary: string;
}

// Lĩnh vực E: Vận trình theo thời gian (Chu kỳ đại vận & lưu niên)
export interface TemporalCyclesDomain {
  currentDecadePillar: LayeredInsightItem;
  annualTransitOutlook: LayeredInsightItem;
  strategicWindows: Array<{
    timeframe: string;
    phaseName: 'Tích Lũy' | 'Khảo Nghiệm' | 'Tăng Tốc' | 'Thu Hoạch' | 'Phòng Thủ';
    strategicFocus: string;
    actionableDirectives: string[];
    astronomicalGrounding: string;
  }>;
  cyclicalMethodologyNotes: string;
}

// Bảng kiểm tra nguồn gốc & khả năng truy vết (Audit Trail)
export interface ProvenanceAuditRecord {
  ruleId: string;
  domain: AnalysisDomainKey;
  inputPrerequisites: string[];
  calculatedEvidence: string[];
  appliedRuleDescription: string;
  potentialVarianceFactors: string[]; // Các yếu tố có thể làm thay đổi kết quả (vd: sai lệch giờ sinh)
  confidence: ConfidenceTier;
}

// Hồ Sơ Luận Giải Cá Nhân Hóa Hoàn Chỉnh
export interface PersonalizedDestinyDossier {
  dossierId: string;
  profileId: string;
  calculationId: string;
  generatedAt: string;
  engineVersion: string;
  
  // Dữ liệu đầu vào chuẩn hóa
  inputSnapshot: {
    name: string;
    solarDateStr: string;
    lunarDateStr: string;
    birthHourStr: string;
    hasExactHour: boolean;
    timezoneName: string;
    birthLocation: string;
    gender: string;
  };
  
  // 5 Lĩnh vực phân tích chuyên sâu
  personalOverview: PersonalOverviewDomain;
  careerAndCapability: CareerAndCapabilityDomain;
  financialDynamics: FinancialDynamicsDomain;
  relationshipsAndFamily: RelationshipsAndFamilyDomain;
  temporalCycles: TemporalCyclesDomain;
  
  // Bảng truy vết toàn vẹn (Provenance Log)
  provenanceAuditLog: ProvenanceAuditRecord[];
  
  // Chữ ký vân tay chống trùng lặp (Deduplication Fingerprint)
  semanticFingerprint: string;
  contentFingerprint: string;
}

// Chỉ số phát hiện khuôn mẫu trùng lặp & tái sử dụng văn bản (Pattern & Anti-Template Metrics)
export interface PatternComparisonMetrics {
  exactParagraphMatchRatio: number; // 0 to 1: Tỷ lệ đoạn văn trùng nguyên văn sau chuẩn hóa
  claimOverlapRatio: number;        // 0 to 1: Tỷ lệ nhận định trùng nhau
  distinctEvidenceRatio: number;    // 0 to 1: Tỷ lệ nhận định có căn cứ dữ liệu riêng
  unlinkedContentRatio: number;     // 0 to 1: Tỷ lệ nội dung không liên kết được với dữ kiện hoặc quy tắc
  conflictingFactRatio: number;     // 0 to 1: Tỷ lệ dữ kiện bị mâu thuẫn hoặc thiếu nguồn gốc
  isSuspiciousTemplateReuse: boolean;
  explanation: string;
}

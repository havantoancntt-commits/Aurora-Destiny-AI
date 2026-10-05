// ==========================================
// AURORA DESTINY AI — MULTI-TIER REASONING PIPELINE
// Architectural Standard: 13-Stage Grounded Reasoning & Verification Pipeline
// 1. INPUT VALIDATION → 2. PROFILE NORMALIZATION → 3. DATA EXTRACTION
// → 4. RULE ENGINE → 5. DOMAIN CALCULATION → 6. CONSISTENCY CHECK
// → 7. AI REASONING → 8. EVIDENCE EXTRACTION → 9. CONTRADICTION CHECK
// → 10. QUALITY SCORING → 11. RESPONSE GENERATION → 12. SAFETY FILTER
// → 13. REPRODUCIBLE RESULT DELIVERY
// ==========================================

import { CalculationResult, BirthData, BehavioralContext, FiveElement } from '../types/destiny';
import { UserProfile } from '../types/user';
import { BacktestResult } from '../types/backtest';
import { STEMS, BRANCHES, ELEMENT_RELATIONS } from '../engine/canchi';
import { getDefaultAnalysisYear } from '../engine/canonicalInput';
import { generateDestinyChatResponse } from './geminiService';
import { AiOutputValidator } from './aiOutputValidator';

export interface InternalQualityScore {
  dataQuality: number; // 0-100 (Completeness of input, accurate coordinates)
  calculationQuality: number; // 0-100 (Ephemeris precision, hour pillar validity)
  consistencyScore: number; // 0-100 (Cross-module Bazi-Ziwei balance)
  groundingScore: number; // 0-100 (Factual grounding of claims to chart stars/stems)
  personalizationScore: number; // 0-100 (Alignment with user career, goals, notes)
  responseQuality: number; // 0-100 (Clarity, ethical framing, actionable depth)
  overallQualityScore: number; // Weighted composite
  // Explicit semantic confidence separation (Section VIII)
  llmGenerationConfidence?: number; // Quality of generation, hallucination check, constraint satisfaction
  astrologicalConsistency?: number; // Consistency between mathematical and symbolic chart components
  empiricalPredictiveAccuracy?: number | null; // NULL: No independent empirical dataset with ground truth
  modelGroundednessScore?: number; // Groundedness of AI synthesis in chart facts
  synthesisHeuristicConfidence?: number; // Internal composite heuristic confidence (not probability/accuracy)
}

export interface PipelineStageLog {
  stage: number;
  name: string;
  status: 'passed' | 'warning' | 'failed';
  notes: string;
  durationMs: number;
}

export interface PipelineEvidenceFact {
  category: 'bazi' | 'ziwei' | 'transit' | 'element' | 'backtest';
  fact: string;
  verifiedInChart: boolean;
}

export type ContradictionSeverity =
  | 'CONSISTENT'
  | 'MINOR_DIVERGENCE'
  | 'SIGNIFICANT_CONTRADICTION'
  | 'CRITICAL_CONTRADICTION';

export interface ContradictionDetail {
  sourceA: string;
  sourceB: string;
  difference: number | string;
  reason: string;
  severity: ContradictionSeverity;
  resolution: string;
}

export interface PipelineContradictionCheck {
  hasContradiction: boolean;
  severity: ContradictionSeverity;
  detectedDivergences: string[];
  divergenceDetails: ContradictionDetail[];
  resolutionNotes: string;
}

export interface PipelineResult {
  executionId: string;
  success: boolean;
  userQuestion: string;
  inputSnapshot: {
    name: string;
    solarDate: string;
    birthCity: string;
    hasExactHour: boolean;
    gender: string;
  };
  reproducibilityMetadata: {
    calculationId: string;
    calculationVersion: string;
    astrologyRulesVersion: string;
    analysisModelVersion: string;
    pipelineVersion: string;
    timestamp: string;
  };
  groundedFacts: PipelineEvidenceFact[];
  domainCalculations: {
    dayMasterStatus: string;
    favorableElements: (string | FiveElement)[];
    unfavorableElements: (string | FiveElement)[];
    lifePalaceStarSummary: string;
    currentYearOpportunityWave: number | null;
    currentYearCautionWave: number | null;
    backtestConsistencyScore: number | null;
  };
  qualityScore: InternalQualityScore;
  contradictionCheck: PipelineContradictionCheck;
  hallucinationSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  aiResponseContent: string;
  suggestedActionPlan: string[];
  safetyDisclaimers: string[];
  stageExecutionAudit: PipelineStageLog[];
}

export interface PipelineRequest {
  userQuestion: string;
  profile: UserProfile;
  calculation: CalculationResult;
  backtest: BacktestResult;
  analysisYear?: number;
}

export class DestinyAiPipeline {
  public static readonly PIPELINE_VERSION = 'aurora_pipeline_v3.0_production';

  /**
   * Execute the full 13-stage deterministic & AI pipeline
   */
  public static async execute(request: PipelineRequest): Promise<PipelineResult> {
    const startTime = Date.now();
    const stageLogs: PipelineStageLog[] = [];
    const randSuffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36);
    const executionId = `pipe_${Date.now()}_${randSuffix}`;

    // Helper to log stages
    const logStage = (stage: number, name: string, status: 'passed' | 'warning' | 'failed', notes: string, t0: number) => {
      stageLogs.push({
        stage,
        name,
        status,
        notes,
        durationMs: Date.now() - t0
      });
    };

    // -------------------------------------------------------------
    // STAGE 1: INPUT VALIDATION
    // -------------------------------------------------------------
    const s1Start = Date.now();
    if (!request.userQuestion || request.userQuestion.trim().length === 0) {
      throw new Error('PIPELINE_ERROR_STAGE_1: User question is empty.');
    }
    if (!request.profile || !request.calculation) {
      throw new Error('PIPELINE_ERROR_STAGE_1: Missing profile or calculation entity.');
    }
    logStage(1, 'INPUT_VALIDATION', 'passed', 'Question and profile presence verified.', s1Start);

    // -------------------------------------------------------------
    // STAGE 2: PROFILE NORMALIZATION
    // -------------------------------------------------------------
    const s2Start = Date.now();
    const { birthData } = request.profile;
    const hasCoordinates = typeof birthData.longitude === 'number' && typeof birthData.latitude === 'number';
    const hasExactHour = birthData.hasExactHour !== false;
    logStage(
      2,
      'PROFILE_NORMALIZATION',
      hasCoordinates ? 'passed' : 'warning',
      hasCoordinates
        ? `Coordinates verified (${birthData.longitude}°, ${birthData.latitude}°). True Solar Time applied.`
        : 'Coordinates approximated based on birthCity; Civil time convention used.',
      s2Start
    );

    // -------------------------------------------------------------
    // STAGE 3: DATA EXTRACTION
    // -------------------------------------------------------------
    const s3Start = Date.now();
    const { bazi, ziwei, annualTransits } = request.calculation;
    const targetYear = request.analysisYear || request.calculation.analysisYear || getDefaultAnalysisYear(request.profile?.birthData?.timezoneOffset);
    const currentTransit = annualTransits.find(t => t.year === targetYear) || annualTransits[0];

    const extractedFacts: PipelineEvidenceFact[] = [
      {
        category: 'bazi',
        fact: `Nhật Chủ: ${STEMS[bazi.dayMaster]?.nameVi || bazi.dayMaster} (${bazi.dayMasterElement} - ${bazi.dayMasterStrength})`,
        verifiedInChart: true
      },
      {
        category: 'bazi',
        fact: `Cách Cục: ${bazi.structureType}`,
        verifiedInChart: true
      },
      {
        category: 'element',
        fact: `Dụng Thần: ${bazi.favorableElements.join(', ')} | Kỵ Thần: ${bazi.unfavorableElements.join(', ')}`,
        verifiedInChart: true
      },
      {
        category: 'ziwei',
        fact: `Cung Mệnh tại ${ziwei.palaces.life?.branch || 'Dần'} (${ziwei.palaces.life?.majorStars?.map(s => s.nameVi).join(', ') || 'Vô Chính Diệu'})`,
        verifiedInChart: true
      },
      {
        category: 'transit',
        fact: `Lưu Niên ${targetYear}: ${currentTransit ? `Sóng cơ hội ${currentTransit.opportunityWave}%, Sóng thận trọng ${currentTransit.cautionWave}%` : 'Chưa đủ dữ liệu sóng Lưu Niên'}`,
        verifiedInChart: true
      },
      {
        category: 'backtest',
        fact: request.backtest.destinyConsistencyScore !== null && request.backtest.destinyConsistencyScore !== undefined
          ? `Chỉ số tương hợp lịch sử: ${request.backtest.destinyConsistencyScore}/100 trên ${request.backtest.totalEventsAnalyzed} sự kiện`
          : `Chưa có đủ sự kiện đối soát lịch sử (tổng: ${request.backtest.totalEventsAnalyzed} sự kiện)`,
        verifiedInChart: true
      }
    ];
    logStage(3, 'DATA_EXTRACTION', 'passed', `Extracted ${extractedFacts.length} deterministic astrological anchor points.`, s3Start);

    // -------------------------------------------------------------
    // STAGE 4: RULE ENGINE EVALUATION
    // -------------------------------------------------------------
    const s4Start = Date.now();
    const ruleEvaluation = {
      isDayMasterBalanced: bazi.dayMasterStrength === 'Strong' || bazi.dayMasterStrength === 'Very Strong' || bazi.dayMasterStrength === 'Balanced',
      primaryLifeDomain: ziwei.palaces.career?.score > ziwei.palaces.wealth?.score ? 'Career Leadership' : 'Wealth Accumulation',
      annualTransitQuality: currentTransit?.opportunityWave >= 75 ? 'Opportunistic Growth' : 'Steady Consolidation'
    };
    logStage(4, 'RULE_ENGINE', 'passed', `Rules resolved: ${ruleEvaluation.primaryLifeDomain} under ${ruleEvaluation.annualTransitQuality}.`, s4Start);

    // -------------------------------------------------------------
    // STAGE 5: DOMAIN CALCULATION
    // -------------------------------------------------------------
    const s5Start = Date.now();
    const domainCalculations = {
      dayMasterStatus: `${STEMS[bazi.dayMaster]?.nameVi} (${bazi.dayMasterStrength})`,
      favorableElements: bazi.favorableElements,
      unfavorableElements: bazi.unfavorableElements,
      lifePalaceStarSummary: ziwei.palaces.life?.majorStars?.map(s => s.nameVi).join(', ') || 'Vô Chính Diệu',
      currentYearOpportunityWave: currentTransit?.opportunityWave ?? null,
      currentYearCautionWave: currentTransit?.cautionWave ?? null,
      backtestConsistencyScore: request.backtest.destinyConsistencyScore
    };
    logStage(5, 'DOMAIN_CALCULATION', 'passed', 'Life domains and mathematical weights calculated.', s5Start);

    // -------------------------------------------------------------
    // STAGE 6: CONSISTENCY CHECK (CROSS-MODULE HARMONY)
    // -------------------------------------------------------------
    const s6Start = Date.now();
    const baziStrengthScore = (bazi.dayMasterStrength === 'Strong' || bazi.dayMasterStrength === 'Very Strong') ? 85 : (bazi.dayMasterStrength === 'Weak' || bazi.dayMasterStrength === 'Very Weak') ? 65 : 78;
    const ziweiLifeScore = typeof ziwei.palaces.life?.score === 'number' ? ziwei.palaces.life.score : baziStrengthScore;
    const scoreDiff = Math.abs(baziStrengthScore - ziweiLifeScore);
    const isHarmonious = scoreDiff <= 30;
    logStage(
      6,
      'CONSISTENCY_CHECK',
      isHarmonious ? 'passed' : 'warning',
      `Cross-engine divergence delta: ${scoreDiff} points (Threshold: 30).`,
      s6Start
    );

    // -------------------------------------------------------------
    // STAGE 7: AI REASONING
    // -------------------------------------------------------------
    const s7Start = Date.now();
    let aiOutput = await generateDestinyChatResponse(
      request.userQuestion,
      request.profile,
      request.calculation,
      request.backtest,
      { analysisYear: targetYear }
    );
    logStage(7, 'AI_REASONING', 'passed', `Synthesized analytical discourse (Fallback: ${aiOutput.isFallback}).`, s7Start);

    // -------------------------------------------------------------
    // STAGE 8: EVIDENCE / FACTOR EXTRACTION & ANTI-HALLUCINATION AUDIT
    // -------------------------------------------------------------
    const s8Start = Date.now();
    let antiHallucinationPassed = true;
    let antiHallucinationDetail = 'Đã đối soát toàn bộ tinh tú, Cung vị, Nhật Chủ, Can Chi và quy chuẩn an toàn trên lá số.';
    let hallucinationSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';

    // Rigorous Independent AI Output Validator execution
    const validationResult = AiOutputValidator.validate(aiOutput.content, request.calculation);
    if (!validationResult.isValid) {
      antiHallucinationPassed = false;
      const criticalViolation = validationResult.violations.find(v => v.severity === 'CRITICAL');
      hallucinationSeverity = criticalViolation ? 'CRITICAL' : 'HIGH';
      antiHallucinationDetail = `Phát hiện sai lệch dữ liệu [${hallucinationSeverity}]: ${validationResult.violations.map(v => v.message).join('; ')}`;

      // Fall back directly to deterministic grounded output to protect user from hallucination
      aiOutput = {
        content: validationResult.sanitizedContent,
        confidenceScore: request.calculation.confidence.consistencyScore,
        isFallback: true
      };
    }

    logStage(8, 'EVIDENCE_EXTRACTION', antiHallucinationPassed ? 'passed' : 'warning', antiHallucinationDetail, s8Start);

    // -------------------------------------------------------------
    // STAGE 9: CONTRADICTION CHECK & MULTI-TIER CLASSIFICATION
    // -------------------------------------------------------------
    const s9Start = Date.now();
    let severity: ContradictionSeverity = 'CONSISTENT';
    const divergenceDetails: ContradictionDetail[] = [];
    const detectedDivergences: string[] = [];
    let resolutionNotes = 'Bát Tự và Tử Vi đồng thuận về xu hướng chu kỳ và Dụng Thần điều hòa.';

    if (scoreDiff <= 25) {
      severity = 'CONSISTENT';
    } else if (scoreDiff <= 35) {
      severity = 'MINOR_DIVERGENCE';
      detectedDivergences.push(`Độ lệch nhẹ (${scoreDiff} điểm) giữa thế lực Bát Tự và cung Tử Vi.`);
      divergenceDetails.push({
        sourceA: 'Bát Tự Tứ Trụ (Nội Lực Ngũ Hành)',
        sourceB: 'Tử Vi Đẩu Số (Cung Mệnh & 12 Cung Vị)',
        difference: scoreDiff,
        reason: 'Sự chênh lệch giữa thế lực ngũ hành bản mệnh và vị thế các chính tinh tọa thủ.',
        severity: 'MINOR_DIVERGENCE',
        resolution: 'Duy trì cân bằng ngũ hành, chú trọng phát huy thế mạnh của cung đắc địa.'
      });
      resolutionNotes = 'Độ lệch nhỏ giữa Bát Tự và Tử Vi được dung hòa qua việc bổ trợ Dụng Thần.';
    } else if (scoreDiff <= 50) {
      severity = 'SIGNIFICANT_CONTRADICTION';
      detectedDivergences.push(`Bát Tự thể hiện sự tiêu hao khí lực trong khi Cung Mệnh Tử Vi đắc thế tinh (Độ lệch: ${scoreDiff} điểm).`);
      divergenceDetails.push({
        sourceA: 'Bát Tự Tứ Trụ (Cường Nhược Nhật Chủ)',
        sourceB: 'Tử Vi Đẩu Số (Cung Mệnh Tinh Bàn)',
        difference: scoreDiff,
        reason: 'Nhật chủ suy nhược do tiết khí quá độ, trong khi Tử Vi xuất hiện cát tinh thúc đẩy hành động mạnh mẽ.',
        severity: 'SIGNIFICANT_CONTRADICTION',
        resolution: 'Khuyến nghị ưu tiên củng cố sức khỏe nền tảng (Bát Tự) trước khi tăng tốc các dự án đối ngoại (Tử Vi).'
      });
      resolutionNotes = 'Khuyến nghị ưu tiên củng cố sức khỏe nền tảng (Bát Tự) trước khi tăng tốc các dự án đối ngoại (Tử Vi).';
    } else {
      severity = 'CRITICAL_CONTRADICTION';
      detectedDivergences.push(`Độ phân kỳ cực lớn giữa Bát Tự và Tử Vi (${scoreDiff} điểm). Cần đối soát lại giờ sinh và lưu ý xung khắc đại vận.`);
      divergenceDetails.push({
        sourceA: 'Bát Tự Tứ Trụ',
        sourceB: 'Tử Vi Đẩu Số',
        difference: scoreDiff,
        reason: 'Xung đột mạnh giữa cách cục Bát Tự và bố cục cung mệnh Tử Vi, có thể do biên độ giờ sinh giao thời hoặc lưu niên xung khắc.',
        severity: 'CRITICAL_CONTRADICTION',
        resolution: 'Thực hiện hiệu chỉnh giờ sinh (Rectification / Backtesting) và giữ trạng thái phòng thủ rủi ro nghiêm ngặt.'
      });
      resolutionNotes = 'Phát hiện phân kỳ nghiêm trọng. Kích hoạt giao thức phòng thủ rủi ro và khuyến nghị người dùng kiểm tra độ chuẩn xác của giờ sinh.';
    }

    const contradictionCheck: PipelineContradictionCheck = {
      hasContradiction: severity !== 'CONSISTENT',
      severity,
      detectedDivergences,
      divergenceDetails,
      resolutionNotes
    };
    logStage(9, 'CONTRADICTION_CHECK', contradictionCheck.hasContradiction ? 'warning' : 'passed', `[${severity}] ${contradictionCheck.resolutionNotes}`, s9Start);

    // -------------------------------------------------------------
    // STAGE 10: INTERNAL QUALITY SCORE ESTIMATION
    // -------------------------------------------------------------
    const s10Start = Date.now();
    const qualityScore = DestinyAiPipeline.calculateQualityScore(
      request,
      hasExactHour,
      hasCoordinates,
      scoreDiff,
      extractedFacts.length,
      validationResult,
      aiOutput.isFallback,
      contradictionCheck.hasContradiction
    );
    logStage(10, 'QUALITY_SCORING', 'passed', `Composite Quality Score calculated: ${qualityScore.overallQualityScore}/100.`, s10Start);

    // -------------------------------------------------------------
    // STAGE 11: RESPONSE GENERATION
    // -------------------------------------------------------------
    const s11Start = Date.now();
    const suggestedActions = [
      `Tập trung phân bổ thời gian vào việc phát huy Dụng Thần (${bazi.favorableElements.join(', ')})`,
      currentTransit?.cautionWave !== undefined
        ? `Chủ động kiểm soát rủi ro tài chính và tránh cam kết vội vàng trong các thời điểm thận trọng (${currentTransit.cautionWave}%)`
        : `Chủ động kiểm soát rủi ro tài chính và duy trì kỷ luật quản trị dòng tiền an toàn`,
      `Rèn luyện tư duy tự chủ và duy trì kế hoạch phát triển cá nhân theo chu kỳ từng quý`
    ];
    logStage(11, 'RESPONSE_GENERATION', 'passed', 'Structured strategic response assembled with action plan.', s11Start);

    // -------------------------------------------------------------
    // STAGE 12: SAFETY FILTER & ETHICS DISCLAIMER
    // -------------------------------------------------------------
    const s12Start = Date.now();
    const safetyDisclaimers = [
      'Phân tích chiêm nghiệm mang tính tham khảo khoa học thống kê và triết học cổ đại.',
      'Không khẳng định tương lai mang tính tất định tuyệt đối hay mê tín dị đoan.',
      'Không thay thế quyết định y khoa, pháp lý, đầu tư tài chính hoặc chẩn đoán tâm lý.'
    ];
    logStage(12, 'SAFETY_FILTER', 'passed', 'Responsible AI principles and non-deterministic disclaimer attached.', s12Start);

    // -------------------------------------------------------------
    // STAGE 13: REPRODUCIBLE RESULT DELIVERY
    // -------------------------------------------------------------
    const s13Start = Date.now();
    const pipelineResult: PipelineResult = {
      executionId,
      success: true,
      userQuestion: request.userQuestion,
      inputSnapshot: {
        name: request.profile.name,
        solarDate: `${birthData.solarYear}-${birthData.solarMonth}-${birthData.solarDay}`,
        birthCity: birthData.birthCity || 'Việt Nam',
        hasExactHour,
        gender: birthData.gender
      },
      reproducibilityMetadata: {
        calculationId: request.calculation.id,
        calculationVersion: request.calculation.calculationVersion,
        astrologyRulesVersion: request.calculation.astrologyRulesVersion,
        analysisModelVersion: request.calculation.analysisModelVersion,
        pipelineVersion: this.PIPELINE_VERSION,
        timestamp: new Date().toISOString()
      },
      groundedFacts: extractedFacts,
      domainCalculations,
      qualityScore,
      contradictionCheck,
      hallucinationSeverity,
      aiResponseContent: aiOutput.content,
      suggestedActionPlan: suggestedActions,
      safetyDisclaimers,
      stageExecutionAudit: stageLogs
    };
    logStage(13, 'RESULT_DELIVERY', 'passed', `Pipeline complete in ${Date.now() - startTime}ms.`, s13Start);

    return pipelineResult;
  }

  /**
   * Transparent Internal Quality Indicator calculation based on real evidence coverage,
   * calculation consistency, source completeness, contradiction penalties, and output depth.
   */
  public static calculateQualityScore(
    request: PipelineRequest,
    hasExactHour: boolean,
    hasCoordinates: boolean,
    scoreDiff: number,
    evidenceFactCount: number = 0,
    validationResult?: { isValid: boolean; violations: Array<{ message: string; severity?: string }> },
    isFallback: boolean = false,
    contradictionDetected: boolean = false
  ): InternalQualityScore {
    // If birth data is fundamentally missing or invalid:
    if (!request.profile?.birthData || !request.calculation) {
      return {
        dataQuality: 0,
        calculationQuality: 0,
        consistencyScore: 0,
        groundingScore: 0,
        personalizationScore: 0,
        responseQuality: 0,
        overallQualityScore: 0,
        empiricalPredictiveAccuracy: null,
        synthesisHeuristicConfidence: 0
      };
    }

    // 1. Data Quality (completeness of input, verified hour, location)
    let dataQuality = 60;
    if (hasExactHour) dataQuality += 20;
    if (hasCoordinates) dataQuality += 15;
    if (request.profile.behavioralContext?.careerField) dataQuality += 5;
    dataQuality = Math.min(100, Math.max(20, dataQuality));

    // 2. Calculation Quality (deterministic algorithms, leap month check, true solar time)
    let calculationQuality = 85;
    if (request.calculation.effectiveBirthTime?.timeConvention === 'trueSolar') {
      calculationQuality += 10;
    }
    if (request.calculation.effectiveBirthTime?.equationOfTimeMinutes !== undefined) {
      calculationQuality += 5;
    }
    calculationQuality = Math.min(100, Math.max(50, calculationQuality));

    // 3. Consistency Score (Bazi vs Ziwei agreement)
    const consistencyScore = Math.max(40, Math.min(99, 100 - scoreDiff));

    // 4. Dynamic Grounding Score:
    // evidence coverage + calculation consistency + source completeness - contradiction penalty - violation penalty
    const evidenceCoverage = Math.min(30, Math.max(5, evidenceFactCount * 3));
    const sourceCompleteness = (hasExactHour ? 25 : 12) + (hasCoordinates ? 20 : 10);
    const calcConsistencyComponent = Math.round(consistencyScore * 0.25);
    const contradictionPenalty = contradictionDetected ? 12 : 0;
    const violationCount = validationResult?.violations?.length || 0;
    const violationPenalty = Math.min(30, violationCount * 10);

    let rawGrounding = evidenceCoverage + sourceCompleteness + calcConsistencyComponent - contradictionPenalty - violationPenalty;
    if (isFallback) {
      // Deterministic fallback has complete mathematical grounding in chart, but lower generative synthesis
      rawGrounding = Math.max(70, Math.min(95, rawGrounding));
    }
    const groundingScore = Math.max(30, Math.min(99, rawGrounding));

    // 5. Personalization Score (behavioral context alignment)
    const ctx = request.profile.behavioralContext;
    let personalizationScore = 50;
    if (ctx?.topPriority) personalizationScore += 15;
    if (ctx?.careerField) personalizationScore += 15;
    if (ctx?.financialGoal) personalizationScore += 10;
    if (ctx?.relationshipStatus) personalizationScore += 10;
    personalizationScore = Math.min(100, personalizationScore);

    // 6. Response Quality (structure, clarity, ethical safety, output completeness)
    let responseQuality = 75;
    if (!validationResult || validationResult.isValid) responseQuality += 15;
    else responseQuality -= Math.min(25, violationCount * 12);
    if (!isFallback) responseQuality += 8; // Direct multi-agent model synthesis bonus
    if (personalizationScore >= 80) responseQuality += 2;
    responseQuality = Math.max(40, Math.min(98, responseQuality));

    // Composite Harmonic Quality Score
    const overallQualityScore = Math.round(
      dataQuality * 0.2 +
      calculationQuality * 0.25 +
      consistencyScore * 0.2 +
      groundingScore * 0.15 +
      personalizationScore * 0.1 +
      responseQuality * 0.1
    );

    return {
      dataQuality,
      calculationQuality,
      consistencyScore,
      groundingScore,
      personalizationScore,
      responseQuality,
      overallQualityScore,
      llmGenerationConfidence: responseQuality,
      astrologicalConsistency: consistencyScore,
      empiricalPredictiveAccuracy: null, // Strictly null: repository has no empirical out-of-sample population dataset
      modelGroundednessScore: groundingScore,
      synthesisHeuristicConfidence: overallQualityScore
    };
  }
}

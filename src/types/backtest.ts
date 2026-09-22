// ==========================================
// BACKTESTING ENGINE TYPES
// ==========================================

export type EventCategory =
  | 'Career'
  | 'Finance'
  | 'Relationship'
  | 'Relocation'
  | 'Health'
  | 'Education'
  | 'Crisis'
  | 'MajorBreakthrough'
  | 'PersonalDevelopment';

export type EventImpact = 'Very Negative' | 'Negative' | 'Neutral' | 'Positive' | 'Breakthrough';

export interface HistoricalEvent {
  id: string;
  profileId: string;
  year: number;
  month?: number; // 1-12
  title: string;
  category: EventCategory;
  impact: EventImpact;
  intensity: number; // 1 to 5
  description: string;
  userConfidence: number; // 1 to 5 (how accurately they recall)
  evidenceNote?: string;
  createdAt: string;
}

export interface CycleFitComparison {
  eventId: string;
  eventTitle: string;
  eventYear: number;
  category: EventCategory;
  actualImpact: EventImpact;
  calculatedWave: number; // 0-100 energy level
  calculatedOpportunityScore: number; // 0-100
  calculatedCautionScore: number; // 0-100
  dominantFavorableElement: string;
  transitTenGod: string;
  matchScore: number; // 0-100 alignment
  status: 'Strong Match' | 'Moderate Match' | 'Neutral Divergence' | 'Anomalous Divergence';
  explanation: string;
}

export interface BacktestResult {
  id: string;
  profileId: string;
  calculationId: string;
  timestamp: string;
  totalEventsAnalyzed: number;
  validationType?: 'SELF_CONSISTENCY' | 'INDEPENDENT_EMPIRICAL_VALIDATION';
  groundTruthSource?: string | null;
  sampleSize?: number | null;
  accuracy?: number | null; // NULL unless independent empirical validation with ground truth
  confidenceInterval?: { lower: number; upper: number } | null;
  scoreType: 'RETROSPECTIVE_PATTERN_FIT' | 'INSUFFICIENT_DATA' | 'OUT_OF_SAMPLE_VALIDATION' | 'BLIND_HISTORICAL_VALIDATION';
  destinyConsistencyScore: number | null; // NULL when no events provided (Audit Requirement Phase 4 & Phase 7)
  historicalHitRate: number | null; // NULL when no events provided
  statisticalSignificanceDisclaimer: string; // Explicit distinction between personal retrospective fit and predictive validation
  matchedEventsCount: number;
  divergentEventsCount: number;
  neutralEventsCount: number;
  confidenceBand: 'High Retrospective Pattern Fit' | 'High Empirical Reliability' | 'Moderate Coherence' | 'Sparse Data Fit' | 'Insufficient Historical Evidence';
  evidenceStatus?: 'INSUFFICIENT_HISTORICAL_EVIDENCE' | 'PRELIMINARY_EVIDENCE' | 'EXPLORATORY_EVIDENCE' | 'SUFFICIENT_EVIDENCE';
  validationStatus?: 'INSUFFICIENT_DATA' | 'PRELIMINARY' | 'EXPLORATORY' | 'VALIDATED' | 'SPARSE_RETROSPECTIVE_SAMPLE' | 'EXPLORATORY_RETROSPECTIVE_FIT' | 'EMPIRICALLY_EVALUATED_SAMPLE';
  methodologyNote?: string;
  biasAnalysis?: {
    recallBiasRisk: 'HIGH' | 'MODERATE' | 'LOW';
    retrospectiveBiasRisk: 'HIGH' | 'MODERATE';
    selectionBiasNote: string;
  };
  scientificMetrics?: {
    sampleSize: number;
    missingDataCount: number;
    baselineHitRate: number | null;
    baselineType?: 'THEORETICAL_NULL_HYPOTHESIS_50_PERCENT' | 'EMPIRICAL_POPULATION_BASELINE' | 'NOT_APPLICABLE';
    baselineNote?: string;
    falsePositivesCount: number;
    falseNegativesCount: number;
    calibrationDelta: number | null;
    nullHypothesisDelta?: number | null;
    nullHypothesisExplanation?: string;
    confidenceInterval95: { lower: number; upper: number } | null;
  };
  comparisons: CycleFitComparison[];
  strengthsSummary: string[];
  anomaliesSummary: string[];
  uncertaintyFactors: string[];
}

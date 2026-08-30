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
  | 'MajorBreakthrough';

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
  destinyConsistencyScore: number; // 0 - 100
  matchedEventsCount: number;
  divergentEventsCount: number;
  neutralEventsCount: number;
  confidenceBand: 'High Empirical Reliability' | 'Moderate Coherence' | 'Sparse Data Fit';
  comparisons: CycleFitComparison[];
  strengthsSummary: string[];
  anomaliesSummary: string[];
  uncertaintyFactors: string[];
}

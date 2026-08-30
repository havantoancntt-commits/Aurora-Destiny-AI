// ==========================================
// MULTI-AGENT AI, SCENARIOS & CHAT TYPES
// ==========================================

import { FiveElement, PalaceKey } from './destiny';

export interface AgentReport {
  agentName: string;
  agentRole: string;
  confidenceScore: number;
  keyFindings: string[];
  recommendations: string[];
  riskNotations: string[];
}

export type LifeDomainItem = {
  domain: string;
  domainKey: 'career' | 'finance' | 'relationships' | 'family' | 'learning' | 'growth' | 'opportunity' | 'risk';
  score: number;
  trend: 'Rising' | 'Stable' | 'Volatile' | 'Receding';
  confidence: number;
  supportingFactors: string[];
  uncertaintyFactors: string[];
};

export interface MultiAgentEnsemble {
  modelName: string;
  ensembleVersion: string;
  generatedAt: string;
  overallConsistencyScore: number;
  executiveSummary: string;
  
  // 7 Specialized Agents
  traditionalAstrologyAgent: AgentReport;
  baziAnalystAgent: AgentReport;
  ziweiAnalystAgent: AgentReport;
  temporalPatternAgent: AgentReport;
  behavioralContextAgent: AgentReport;
  statisticalConsistencyAgent: AgentReport;
  riskUncertaintyAgent: AgentReport;
  
  // Synthesized Life Radar (8 Domains)
  lifeRadar: LifeDomainItem[];
  
  coreStrengths: string[];
  potentialBlindspots: string[];
  strategicTimingWindows: {
    timeframe: string;
    phaseType: 'Harvest' | 'Preparation' | 'Restructure' | 'Consolidation';
    strategicFocus: string;
    recommendedActions: string[];
  }[];
  responsibleDisclaimer: string;
}

export interface ScenarioOption {
  scenarioId: 'A' | 'B' | 'C';
  title: string;
  type: 'Continue' | 'Change' | 'Alternative';
  description: string;
  potentialAdvantages: string[];
  keyChallenges: string[];
  optimalTiming: string;
  energyAlignmentScore: number; // 0 - 100
  uncertaintyScore: number; // 0 - 100
  requiredConditions: string[];
}

export interface ScenarioAnalysisResult {
  id: string;
  userQuestion: string;
  evaluatedAt: string;
  contextSummary: string;
  scenarios: ScenarioOption[];
  synthesisAdvice: string;
  riskNotice: string;
}

export interface DailyDestiny {
  date: string;
  lunarDateStr: string;
  dailyStemBranch: string;
  dailyElement: FiveElement;
  todayTheme: string;
  harmonyLevel: number; // 0 - 100
  elementBalancingTip: string;
  opportunities: string[];
  cautionSignals: string[];
  focalDomains: {
    career: { score: number; note: string };
    finance: { score: number; note: string };
    relationships: { score: number; note: string };
    personalGrowth: { score: number; note: string };
  };
  auspiciousHours: string[];
  incompatibleHours: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  agentRef?: string;
  confidenceScore?: number;
  suggestedQuestions?: string[];
  groundedFacts?: string[];
}

export interface AIConversation {
  id: string;
  profileId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

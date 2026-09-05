// ==========================================
// ADMIN, OBSERVABILITY & AUDIT TYPES
// ==========================================

export interface ObservabilityMetrics {
  activeUsers24h: number;
  totalCalculations: number;
  aiRequestsCount: number;
  aiLatencyAvgMs: number;
  aiSuccessRate: number; // percentage e.g. 99.4
  calculationDeterministicRate: number; // 100%
  dbLatencyMs: number;
  cacheHitRatio: number;
  totalProfilesStored: number;
  totalBacktestRuns: number;
  totalScenariosEvaluated: number;
  totalUsers?: number;
  totalProfiles?: number;
  totalEvents?: number;
  totalActiveSessions?: number;
  totalAuditLogs?: number;
  uptimeSeconds?: number;
  storageMode?: string;
  aiConfigured?: boolean;
  circuitBreakerOpen?: boolean;
  calculationEngineVersion?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED' | 'ERROR';
  details: string;
}

export interface SystemFeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  tierRequirement: 'Free' | 'Premium' | 'Pro';
}

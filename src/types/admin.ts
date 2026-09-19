// ==========================================
// ADMIN, OBSERVABILITY & AUDIT TYPES
// ==========================================

export interface ObservabilityMetrics {
  activeUsers24h: number;
  dau?: number;
  wau?: number;
  mau?: number;
  registeredUsers?: number;
  guestUsers?: number;
  totalCalculations: number;
  aiRequestsCount: number;
  aiRequestsTotal?: number;
  aiSuccessTotal?: number;
  aiFailureTotal?: number;
  aiLatencyAvgMs: number | null;
  aiSuccessRate: number | null; // percentage e.g. 99.4
  calculationDeterministicRate: number | null; // 100%
  dbLatencyMs: number | null;
  cacheHitRatio: number | null;
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
  // Real measured latency percentiles
  aiLatencyP50Ms?: number | null;
  aiLatencyP95Ms?: number | null;
  aiLatencyP99Ms?: number | null;
  dbLatencyP50Ms?: number | null;
  dbLatencyP95Ms?: number | null;
  dbLatencyP99Ms?: number | null;
  calcLatencyP50Ms?: number | null;
  calcLatencyP95Ms?: number | null;
  calcLatencyP99Ms?: number | null;
  metricStatus?: {
    ai: 'REAL' | 'UNAVAILABLE';
    db: 'REAL' | 'UNAVAILABLE';
    cache: 'REAL' | 'UNAVAILABLE';
    calculation: 'REAL' | 'UNAVAILABLE';
  };
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

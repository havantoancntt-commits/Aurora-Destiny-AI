// ==========================================
// AURORA DESTINY AI — REAL TELEMETRY & OBSERVABILITY ENGINE
// Strict Zero-Hardcoded Metrics Policy (Section VII Compliant)
// Tracks real runtime latencies, success/failure counts, cache stats
// ==========================================

export type MetricQuality = 'REAL' | 'ESTIMATED' | 'UNAVAILABLE';

export interface Percentiles {
  p50: number | null;
  p95: number | null;
  p99: number | null;
}

export interface TelemetrySnapshot {
  httpRequestsTotal: number;
  httpErrorsTotal: number;
  aiRequestsTotal: number;
  aiSuccessTotal: number;
  aiFailureTotal: number;
  aiTimeoutTotal: number;
  aiFallbackTotal: number;
  aiLatencyAvgMs: number | null;
  aiPercentiles: Percentiles;
  aiSuccessRate: number | null;
  aiMetricStatus: MetricQuality;
  
  calculationRequestsTotal: number;
  calculationFailuresTotal: number;
  calculationLatencyAvgMs: number | null;
  calculationPercentiles: Percentiles;
  calculationSuccessRate: number | null;
  calculationDeterministicRate: number | null;
  calculationMetricStatus: MetricQuality;
  aiVerificationSuccessRate?: number | null;

  dbQueriesTotal: number;
  dbErrorsTotal: number;
  dbLatencyAvgMs: number | null;
  dbPercentiles: Percentiles;
  dbMetricStatus: MetricQuality;

  cacheHitsTotal: number;
  cacheMissesTotal: number;
  cacheHitRatio: number | null;
  cacheMetricStatus: MetricQuality;

  scenarioRunsTotal: number;
  backtestRunsTotal: number;

  uptimeSeconds: number;
}

function calculatePercentiles(samples: number[]): Percentiles {
  if (samples.length === 0) {
    return { p50: null, p95: null, p99: null };
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const getPercentile = (p: number): number => {
    if (sorted.length === 1) return sorted[0];
    const rank = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(rank);
    const upper = Math.ceil(rank);
    const weight = rank - lower;
    return Math.round((sorted[lower] * (1 - weight) + sorted[upper] * weight) * 10) / 10;
  };
  return {
    p50: getPercentile(50),
    p95: getPercentile(95),
    p99: getPercentile(99)
  };
}

class TelemetryService {
  private startTime = Date.now();
  
  private httpRequests = 0;
  private httpErrors = 0;

  private aiRequests = 0;
  private aiSuccesses = 0;
  private aiFailures = 0;
  private aiTimeouts = 0;
  private aiFallbacks = 0;
  private aiLatencies: number[] = [];

  private calcRequests = 0;
  private calcFailures = 0;
  private calcLatencies: number[] = [];
  private determinismChecksTotal = 0;
  private determinismChecksPassed = 0;

  private verifiedClaimsTotal = 0;
  private verifiedClaimsPassed = 0;

  private dbQueries = 0;
  private dbErrors = 0;
  private dbLatencies: number[] = [];

  private cacheHits = 0;
  private cacheMisses = 0;

  private scenarioRuns = 0;
  private backtestRuns = 0;

  private readonly MAX_LATENCY_SAMPLES = 200;

  public recordHttpRequest(durationMs: number, isError: boolean): void {
    this.httpRequests++;
    if (isError) this.httpErrors++;
  }

  public recordAiRequest(durationMs: number, success: boolean, timeout: boolean = false, fallback: boolean = false): void {
    this.aiRequests++;
    if (success) {
      this.aiSuccesses++;
    } else {
      this.aiFailures++;
      if (timeout) this.aiTimeouts++;
    }
    if (fallback) {
      this.aiFallbacks++;
    }
    this.aiLatencies.push(durationMs);
    if (this.aiLatencies.length > this.MAX_LATENCY_SAMPLES) {
      this.aiLatencies.shift();
    }
  }

  public recordCalculation(durationMs: number, success: boolean): void {
    this.calcRequests++;
    if (!success) this.calcFailures++;
    this.calcLatencies.push(durationMs);
    if (this.calcLatencies.length > this.MAX_LATENCY_SAMPLES) {
      this.calcLatencies.shift();
    }
  }

  public recordDeterminismCheck(isDeterministic: boolean): void {
    this.determinismChecksTotal++;
    if (isDeterministic) this.determinismChecksPassed++;
  }

  public recordClaimVerification(totalClaims: number, passedClaims: number): void {
    this.verifiedClaimsTotal += totalClaims;
    this.verifiedClaimsPassed += passedClaims;
  }

  public recordDbQuery(durationMs: number, success: boolean): void {
    this.dbQueries++;
    if (!success) this.dbErrors++;
    this.dbLatencies.push(durationMs);
    if (this.dbLatencies.length > this.MAX_LATENCY_SAMPLES) {
      this.dbLatencies.shift();
    }
  }

  public recordCacheHit(): void {
    this.cacheHits++;
  }

  public recordCacheMiss(): void {
    this.cacheMisses++;
  }

  public recordScenarioRun(): void {
    this.scenarioRuns++;
  }

  public recordBacktestRun(): void {
    this.backtestRuns++;
  }

  public getSnapshot(): TelemetrySnapshot {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    // AI calculations
    let aiLatencyAvgMs: number | null = null;
    let aiSuccessRate: number | null = null;
    let aiMetricStatus: MetricQuality = 'UNAVAILABLE';
    const aiPercentiles = calculatePercentiles(this.aiLatencies);

    if (this.aiRequests > 0) {
      aiSuccessRate = Math.round((this.aiSuccesses / this.aiRequests) * 1000) / 10;
      if (this.aiLatencies.length > 0) {
        const sum = this.aiLatencies.reduce((a, b) => a + b, 0);
        aiLatencyAvgMs = Math.round(sum / this.aiLatencies.length);
      }
      aiMetricStatus = 'REAL';
    }

    // Calculation Success & Determinism
    let calculationLatencyAvgMs: number | null = null;
    let calculationSuccessRate: number | null = null;
    let calculationDeterministicRate: number | null = null;
    let calculationMetricStatus: MetricQuality = 'UNAVAILABLE';
    const calculationPercentiles = calculatePercentiles(this.calcLatencies);

    if (this.calcRequests > 0) {
      calculationSuccessRate = Math.round(((this.calcRequests - this.calcFailures) / this.calcRequests) * 1000) / 10;
      calculationDeterministicRate = this.determinismChecksTotal > 0
        ? Math.round((this.determinismChecksPassed / this.determinismChecksTotal) * 1000) / 10
        : null;
      if (this.calcLatencies.length > 0) {
        const sum = this.calcLatencies.reduce((a, b) => a + b, 0);
        calculationLatencyAvgMs = Math.round(sum / this.calcLatencies.length);
      }
      calculationMetricStatus = 'REAL';
    }

    const aiVerificationSuccessRate = this.verifiedClaimsTotal > 0
      ? Math.round((this.verifiedClaimsPassed / this.verifiedClaimsTotal) * 1000) / 10
      : null;

    // DB Latency
    let dbLatencyAvgMs: number | null = null;
    let dbMetricStatus: MetricQuality = 'UNAVAILABLE';
    const dbPercentiles = calculatePercentiles(this.dbLatencies);
    if (this.dbQueries > 0) {
      if (this.dbLatencies.length > 0) {
        const sum = this.dbLatencies.reduce((a, b) => a + b, 0);
        dbLatencyAvgMs = Math.round((sum / this.dbLatencies.length) * 10) / 10;
      }
      dbMetricStatus = 'REAL';
    }

    // Cache hit ratio
    const totalCache = this.cacheHits + this.cacheMisses;
    let cacheHitRatio: number | null = null;
    let cacheMetricStatus: MetricQuality = 'UNAVAILABLE';
    if (totalCache > 0) {
      cacheHitRatio = Math.round((this.cacheHits / totalCache) * 1000) / 10;
      cacheMetricStatus = 'REAL';
    }

    return {
      httpRequestsTotal: this.httpRequests,
      httpErrorsTotal: this.httpErrors,
      aiRequestsTotal: this.aiRequests,
      aiSuccessTotal: this.aiSuccesses,
      aiFailureTotal: this.aiFailures,
      aiTimeoutTotal: this.aiTimeouts,
      aiFallbackTotal: this.aiFallbacks,
      aiLatencyAvgMs,
      aiPercentiles,
      aiSuccessRate,
      aiMetricStatus,
      calculationRequestsTotal: this.calcRequests,
      calculationFailuresTotal: this.calcFailures,
      calculationLatencyAvgMs,
      calculationPercentiles,
      calculationSuccessRate,
      calculationDeterministicRate,
      calculationMetricStatus,
      aiVerificationSuccessRate,
      dbQueriesTotal: this.dbQueries,
      dbErrorsTotal: this.dbErrors,
      dbLatencyAvgMs,
      dbPercentiles,
      dbMetricStatus,
      cacheHitsTotal: this.cacheHits,
      cacheMissesTotal: this.cacheMisses,
      cacheHitRatio,
      cacheMetricStatus,
      scenarioRunsTotal: this.scenarioRuns,
      backtestRunsTotal: this.backtestRuns,
      uptimeSeconds
    };
  }

  public resetForTesting(): void {
    this.httpRequests = 0;
    this.httpErrors = 0;
    this.aiRequests = 0;
    this.aiSuccesses = 0;
    this.aiFailures = 0;
    this.aiTimeouts = 0;
    this.aiFallbacks = 0;
    this.aiLatencies = [];
    this.calcRequests = 0;
    this.calcFailures = 0;
    this.calcLatencies = [];
    this.determinismChecksTotal = 0;
    this.determinismChecksPassed = 0;
    this.verifiedClaimsTotal = 0;
    this.verifiedClaimsPassed = 0;
    this.dbQueries = 0;
    this.dbErrors = 0;
    this.dbLatencies = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.scenarioRuns = 0;
    this.backtestRuns = 0;
    this.startTime = Date.now();
  }
}

export const telemetry = new TelemetryService();

// ==========================================
// MASTER DESTINY CALCULATION ENGINE
// ==========================================

import { BirthData, CalculationResult } from '../types/destiny';
import { calculateBaZiChart } from './bazi';
import { calculateZiWeiChart } from './ziwei';
import { calculateDecadeCycles, calculateAnnualTransits } from './temporal';
import { evaluateConfidence } from './confidence';
import { resolveEffectiveBirthTime } from './temporalCorrection';

export const CALCULATION_ENGINE_VERSION = 'calc_v2.5.0';
export const ASTROLOGY_RULES_VERSION = 'astrorules_v2.0.0';
export const ANALYSIS_MODEL_VERSION = 'aurora_ensemble_v3.5';

export interface DestinyCalculationOptions {
  analysisYear?: number;
  conventionVersion?: string;
  astrologyRulesVersion?: string;
}

// Bounded LRU Cache for calculations (prevents redundant recomputations and unbounded memory growth)
const MAX_ENGINE_CACHE_SIZE = 128;
const calculationLruCache = new Map<string, CalculationResult>();

export function clearDestinyEngineCache(): void {
  calculationLruCache.clear();
}

function deterministicHash(str: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}`;
}

export function runFullDestinyCalculation(
  birthData: BirthData,
  profileId: string = 'prof_default',
  eventsCount: number = 0,
  options?: DestinyCalculationOptions
): CalculationResult {
  const analysisYear = options?.analysisYear ?? new Date().getFullYear();
  const conventionVersion = options?.conventionVersion ?? birthData.ziweiYearConvention ?? 'solarLapXuan';
  const rulesVersion = options?.astrologyRulesVersion ?? ASTROLOGY_RULES_VERSION;

  // Canonical Resolution of Birth Time (Single Source of Truth)
  const canonicalTime = resolveEffectiveBirthTime(birthData);

  // Deterministic Idempotent Signature across all astronomical, calendar, transit year and convention coordinates
  const inputSignature = [
    profileId,
    birthData.solarYear,
    birthData.solarMonth,
    birthData.solarDay,
    birthData.solarHour,
    birthData.solarMinute ?? 0,
    birthData.timezoneOffset,
    canonicalTime.longitude.toFixed(4),
    (canonicalTime.latitude ?? 0).toFixed(4),
    birthData.calendarSystem || 'solar',
    birthData.isLeapMonth ? 'leap' : 'regular',
    birthData.gender,
    birthData.isLateRat ? 'lateRat' : 'standard',
    birthData.timeConvention || 'civil',
    conventionVersion,
    birthData.ziweiLeapMonthConvention || 'midMonthSplit',
    analysisYear,
    CALCULATION_ENGINE_VERSION,
    rulesVersion,
    eventsCount
  ].join('_');

  // Check bounded LRU cache with defensive copying
  if (calculationLruCache.has(inputSignature)) {
    const cached = calculationLruCache.get(inputSignature)!;
    // Re-insert to maintain recent LRU position
    calculationLruCache.delete(inputSignature);
    calculationLruCache.set(inputSignature, cached);
    return structuredClone(cached);
  }

  const effectiveBirthData: BirthData = {
    ...birthData,
    solarYear: canonicalTime.effectiveDate.year,
    solarMonth: canonicalTime.effectiveDate.month,
    solarDay: canonicalTime.effectiveDate.day,
    solarHour: canonicalTime.effectiveHour,
    solarMinute: canonicalTime.effectiveMinute,
    longitude: canonicalTime.longitude,
    latitude: canonicalTime.latitude
  };

  const bazi = calculateBaZiChart(effectiveBirthData);
  const ziwei = calculateZiWeiChart(effectiveBirthData);
  const decades = calculateDecadeCycles(effectiveBirthData);
  const annualTransits = calculateAnnualTransits(effectiveBirthData, analysisYear - 6, analysisYear + 10);
  const confidence = evaluateConfidence(effectiveBirthData, eventsCount);

  const deterministicId = `calc_${deterministicHash(inputSignature)}`;

  const result: CalculationResult = {
    id: deterministicId,
    profileId,
    calculationVersion: CALCULATION_ENGINE_VERSION,
    astrologyRulesVersion: rulesVersion,
    analysisModelVersion: ANALYSIS_MODEL_VERSION,
    timestamp: new Date().toISOString(),
    inputSnapshot: { ...birthData },
    bazi,
    ziwei,
    decades,
    annualTransits,
    confidence,
    effectiveBirthTime: {
      effectiveDate: canonicalTime.effectiveDate,
      effectiveHour: canonicalTime.effectiveHour,
      effectiveMinute: canonicalTime.effectiveMinute,
      timeConvention: canonicalTime.timeConvention,
      equationOfTimeMinutes: canonicalTime.equationOfTimeMinutes,
      longitudeCorrectionMinutes: canonicalTime.longitudeCorrectionMinutes,
      totalCorrectionMinutes: canonicalTime.totalCorrectionMinutes,
      dayShift: canonicalTime.dayShift
    }
  };

  // Maintain bounded size for in-memory cache
  if (calculationLruCache.size >= MAX_ENGINE_CACHE_SIZE) {
    const oldestKey = calculationLruCache.keys().next().value;
    if (oldestKey) {
      calculationLruCache.delete(oldestKey);
    }
  }
  // Store clone in cache to prevent caller mutation of cache
  calculationLruCache.set(inputSignature, structuredClone(result));

  // Return clone to caller to preserve complete cache immutability
  return structuredClone(result);
}

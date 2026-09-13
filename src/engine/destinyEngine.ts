// ==========================================
// MASTER DESTINY CALCULATION ENGINE
// Single Canonical Pipeline: Input -> Normalize -> Canonical -> Calculate -> Invariant Check -> Cache -> Result
// ==========================================

import { BirthData, CalculationResult } from '../types/destiny';
import { calculateBaZiChart } from './bazi';
import { calculateZiWeiChart } from './ziwei';
import { calculateDecadeCycles, calculateAnnualTransits } from './temporal';
import { evaluateConfidence } from './confidence';
import { telemetry } from '../telemetry/telemetryService';
import type {
  DestinyCalculationOptions,
  CanonicalCalculationInput
} from './canonicalInput';
import {
  CALCULATION_ENGINE_VERSION,
  ASTROLOGY_RULES_VERSION,
  ANALYSIS_MODEL_VERSION,
  DEFAULT_CANONICAL_ANALYSIS_YEAR,
  normalizeToCanonicalInput,
  buildCanonicalCacheKey
} from './canonicalInput';

export type {
  DestinyCalculationOptions,
  CanonicalCalculationInput
};
export {
  CALCULATION_ENGINE_VERSION,
  ASTROLOGY_RULES_VERSION,
  ANALYSIS_MODEL_VERSION,
  DEFAULT_CANONICAL_ANALYSIS_YEAR,
  normalizeToCanonicalInput,
  buildCanonicalCacheKey
};

// Bounded LRU Cache for calculations (prevents redundant recomputations and unbounded memory growth)
const MAX_ENGINE_CACHE_SIZE = 128;
const calculationLruCache = new Map<string, CalculationResult>();

export function clearDestinyEngineCache(): void {
  calculationLruCache.clear();
}

export function getDestinyEngineCacheSize(): number {
  return calculationLruCache.size;
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
  // 1. NORMALIZE & CREATE CANONICAL INPUT (Single Source of Truth)
  const canonicalInput = normalizeToCanonicalInput(birthData, profileId, eventsCount, options);

  // 2. BUILD DETERMINISTIC CACHE SIGNATURE FROM CANONICAL ATTRIBUTES
  const inputSignature = buildCanonicalCacheKey(canonicalInput);

  // 3. CHECK BOUNDED LRU CACHE WITH DEFENSIVE COPYING
  if (calculationLruCache.has(inputSignature)) {
    telemetry.recordCacheHit();
    const cached = calculationLruCache.get(inputSignature)!;
    // Re-insert to maintain recent LRU position
    calculationLruCache.delete(inputSignature);
    calculationLruCache.set(inputSignature, cached);
    return structuredClone(cached);
  }
  telemetry.recordCacheMiss();

  const calcStart = Date.now();
  try {
    // 4. PREPARE EFFECTIVE BIRTH DATA FOR CALCULATION ENGINES
  const effectiveBirthData: BirthData = {
    ...birthData,
    solarYear: canonicalInput.birthYear,
    solarMonth: canonicalInput.birthMonth,
    solarDay: canonicalInput.birthDay,
    solarHour: canonicalInput.birthHour,
    solarMinute: canonicalInput.birthMinute,
    hasExactHour: canonicalInput.hasExactHour,
    longitude: canonicalInput.longitude,
    latitude: canonicalInput.latitude,
    timezoneOffset: canonicalInput.timezoneOffset,
    timezoneName: canonicalInput.timezoneName,
    isLateRat: canonicalInput.isLateRat,
    timeConvention: canonicalInput.timeConvention,
    ziweiYearConvention: canonicalInput.ziweiYearConvention,
    ziweiLeapMonthConvention: canonicalInput.ziweiLeapMonthConvention
  };

  // 5. EXECUTE CORE DETERMINISTIC ASTROLOGICAL ALGORITHMS
  const bazi = calculateBaZiChart(effectiveBirthData);
  const ziwei = calculateZiWeiChart(effectiveBirthData);
  const decades = calculateDecadeCycles(effectiveBirthData);
  const annualTransits = calculateAnnualTransits(
    effectiveBirthData,
    canonicalInput.analysisYear - 6,
    canonicalInput.analysisYear + 10
  );

  // 6. EXECUTE SYSTEM INVARIANT VALIDATOR & CONFIDENCE ENGINE
  const confidence = evaluateConfidence(effectiveBirthData, eventsCount, 0, { bazi, ziwei });

  const deterministicId = `calc_${deterministicHash(inputSignature)}`;

  // 7. CONSTRUCT COMPLETE IMMUTABLE CALCULATION RESULT
  const result: CalculationResult = {
    id: deterministicId,
    profileId,
    calculationVersion: canonicalInput.calculationEngineVersion,
    astrologyRulesVersion: canonicalInput.astrologyRulesVersion,
    analysisModelVersion: ANALYSIS_MODEL_VERSION,
    analysisYear: canonicalInput.analysisYear,
    canonicalInput,
    timestamp: new Date().toISOString(),
    inputSnapshot: { ...birthData },
    bazi,
    ziwei,
    decades,
    annualTransits,
    confidence,
    effectiveBirthTime: {
      effectiveDate: {
        year: canonicalInput.birthYear,
        month: canonicalInput.birthMonth,
        day: canonicalInput.birthDay
      },
      effectiveHour: canonicalInput.birthHour,
      effectiveMinute: canonicalInput.birthMinute,
      timeConvention: canonicalInput.timeConvention,
      equationOfTimeMinutes: canonicalInput.equationOfTimeMinutes,
      longitudeCorrectionMinutes: canonicalInput.longitudeCorrectionMinutes,
      totalCorrectionMinutes: canonicalInput.totalCorrectionMinutes,
      dayShift: canonicalInput.dayShift
    }
  };

  // 8. MAINTAIN BOUNDED LRU CACHE WITH REPLACEMENT POLICY
  if (calculationLruCache.size >= MAX_ENGINE_CACHE_SIZE) {
    const oldestKey = calculationLruCache.keys().next().value;
    if (oldestKey) {
      calculationLruCache.delete(oldestKey);
    }
  }

    // Store deep clone in cache to prevent external mutations
    calculationLruCache.set(inputSignature, structuredClone(result));

    telemetry.recordCalculation(Date.now() - calcStart, true);

    // Return fresh deep clone to ensure caller cannot mutate cache
    return structuredClone(result);
  } catch (err) {
    telemetry.recordCalculation(Date.now() - calcStart, false);
    throw err;
  }
}

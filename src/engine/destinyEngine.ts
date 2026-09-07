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
  eventsCount: number = 0
): CalculationResult {
  // Canonical Resolution of Birth Time (Single Source of Truth)
  const canonicalTime = resolveEffectiveBirthTime(birthData);

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
  const currentYear = new Date().getFullYear();
  const annualTransits = calculateAnnualTransits(effectiveBirthData, currentYear - 6, currentYear + 10);
  const confidence = evaluateConfidence(effectiveBirthData, eventsCount);

  // Deterministic Idempotent Signature across all astronomical and user coordinates
  const inputSignature = [
    profileId,
    birthData.solarYear,
    birthData.solarMonth,
    birthData.solarDay,
    birthData.solarHour,
    birthData.solarMinute ?? 0,
    birthData.timezoneOffset,
    canonicalTime.longitude.toFixed(4),
    birthData.gender,
    birthData.isLateRat ? 'lateRat' : 'standard',
    birthData.timeConvention || 'civil',
    CALCULATION_ENGINE_VERSION
  ].join('_');

  const deterministicId = `calc_${deterministicHash(inputSignature)}`;

  return {
    id: deterministicId,
    profileId,
    calculationVersion: CALCULATION_ENGINE_VERSION,
    astrologyRulesVersion: ASTROLOGY_RULES_VERSION,
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
}

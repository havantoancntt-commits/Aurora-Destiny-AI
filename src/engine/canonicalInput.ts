// ==========================================
// CANONICAL CALCULATION INPUT & NORMALIZATION
// Single Source of Truth for Aurora Destiny AI
// ==========================================

import { BirthData, Gender } from '../types/destiny';
import { resolveEffectiveBirthTime } from './temporalCorrection';

export const CALCULATION_ENGINE_VERSION = 'calc_v2.5.0';
export const ASTROLOGY_RULES_VERSION = 'astrorules_v2.0.0';
export const ANALYSIS_MODEL_VERSION = 'aurora_ensemble_v3.5';

/**
 * Returns the current calendar year adjusted for timezone offset, avoiding hardcoded years.
 */
export function getDefaultAnalysisYear(timezoneOffset: number = 7): number {
  try {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const targetTime = new Date(utcTime + timezoneOffset * 3600000);
    return targetTime.getFullYear();
  } catch {
    return new Date().getFullYear();
  }
}

export const DEFAULT_CANONICAL_ANALYSIS_YEAR = getDefaultAnalysisYear();

export interface DestinyCalculationOptions {
  analysisYear?: number;
  conventionVersion?: string;
  astrologyRulesVersion?: string;
}

export interface CanonicalCalculationInput {
  profileId: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  hasExactHour: boolean;
  timezoneOffset: number;
  timezoneName: string;
  longitude: number;
  latitude: number;
  gender: Gender;
  calendarSystem: 'solar' | 'lunar';
  isLeapMonth: boolean;
  isLateRat: boolean;
  timeConvention: 'civil' | 'trueSolar';
  ziweiYearConvention: 'solarLapXuan' | 'lunarNewYear';
  ziweiLeapMonthConvention: 'midMonthSplit' | 'keepMonth';
  analysisYear: number;
  calculationEngineVersion: string;
  astrologyRulesVersion: string;
  conventionVersion: string;
  eventsCount: number;

  // Single Source of Truth for True Solar Time & Temporal Coordinates
  equationOfTimeMinutes: number;
  longitudeCorrectionMinutes: number;
  totalCorrectionMinutes: number;
  dayShift: -1 | 0 | 1;
  localMeanSolarHour: number;
  localMeanSolarMinute: number;
}

/**
 * Normalizes any BirthData input and CalculationOptions into a strictly validated,
 * deterministic CanonicalCalculationInput.
 */
export function normalizeToCanonicalInput(
  birthData: BirthData,
  profileId: string = 'prof_default',
  eventsCount: number = 0,
  options?: DestinyCalculationOptions
): CanonicalCalculationInput {
  // 1. Resolve exact temporal & astronomical coordinates
  const canonicalTime = resolveEffectiveBirthTime(birthData);

  // 2. Resolve convention values with deterministic defaults
  const ziweiYearConvention: 'solarLapXuan' | 'lunarNewYear' =
    birthData.ziweiYearConvention === 'lunarNewYear' ? 'lunarNewYear' : 'solarLapXuan';

  const ziweiLeapMonthConvention: 'midMonthSplit' | 'keepMonth' =
    birthData.ziweiLeapMonthConvention === 'keepMonth' ? 'keepMonth' : 'midMonthSplit';

  const timeConvention: 'civil' | 'trueSolar' =
    birthData.timeConvention === 'trueSolar' ? 'trueSolar' : 'civil';

  const isLateRat: boolean = Boolean(birthData.isLateRat);

  const analysisYear: number =
    typeof options?.analysisYear === 'number' && options.analysisYear >= 1900 && options.analysisYear <= 2100
      ? options.analysisYear
      : getDefaultAnalysisYear(birthData.timezoneOffset);

  const rulesVersion = options?.astrologyRulesVersion || ASTROLOGY_RULES_VERSION;
  const conventionVersion = options?.conventionVersion || `${ziweiYearConvention}_${ziweiLeapMonthConvention}_${timeConvention}_${isLateRat ? 'lateRat' : 'standard'}`;

  return {
    profileId,
    birthYear: canonicalTime.effectiveDate.year,
    birthMonth: canonicalTime.effectiveDate.month,
    birthDay: canonicalTime.effectiveDate.day,
    birthHour: canonicalTime.effectiveHour,
    birthMinute: canonicalTime.effectiveMinute,
    hasExactHour: birthData.hasExactHour !== false,
    timezoneOffset: birthData.timezoneOffset,
    timezoneName: birthData.timezoneName || 'UTC',
    longitude: canonicalTime.longitude,
    latitude: canonicalTime.latitude,
    gender: birthData.gender,
    calendarSystem: birthData.calendarSystem || 'solar',
    isLeapMonth: Boolean(birthData.isLeapMonth),
    isLateRat,
    timeConvention,
    ziweiYearConvention,
    ziweiLeapMonthConvention,
    analysisYear,
    calculationEngineVersion: CALCULATION_ENGINE_VERSION,
    astrologyRulesVersion: rulesVersion,
    conventionVersion,
    eventsCount: Math.max(0, eventsCount),
    equationOfTimeMinutes: canonicalTime.equationOfTimeMinutes,
    longitudeCorrectionMinutes: canonicalTime.longitudeCorrectionMinutes,
    totalCorrectionMinutes: canonicalTime.totalCorrectionMinutes,
    dayShift: canonicalTime.dayShift,
    localMeanSolarHour: canonicalTime.localMeanSolarHour,
    localMeanSolarMinute: canonicalTime.localMeanSolarMinute
  };
}

/**
 * Builds an immutable, unique cache signature from the canonical input.
 */
export function buildCanonicalCacheKey(input: CanonicalCalculationInput): string {
  return [
    input.profileId,
    input.birthYear,
    input.birthMonth,
    input.birthDay,
    input.birthHour,
    input.birthMinute,
    input.timezoneOffset,
    input.longitude.toFixed(4),
    input.latitude.toFixed(4),
    input.calendarSystem,
    input.isLeapMonth ? 'leap' : 'reg',
    input.gender,
    input.isLateRat ? 'lateRat' : 'std',
    input.timeConvention,
    input.ziweiYearConvention,
    input.ziweiLeapMonthConvention,
    input.conventionVersion,
    input.analysisYear,
    input.calculationEngineVersion,
    input.astrologyRulesVersion,
    input.eventsCount
  ].join('_');
}

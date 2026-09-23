// ==========================================
// CALCULATION PROVENANCE & ENGINE AUDITABILITY
// Cryptographic trace of: data + conventions + engine versions + hashes
// ==========================================

import { sha256 } from './sha256';
import { BirthData, BaZiChart, ZiWeiChart } from '../types/destiny';

export interface EngineVersions {
  baziEngineVersion: string;
  ziweiEngineVersion: string;
  temporalEngineVersion: string;
  lunarEngineVersion: string;
  realtimeEngineVersion: string;
  aiInterpretationEngineVersion: string;
}

export const CURRENT_ENGINE_VERSIONS: EngineVersions = {
  baziEngineVersion: '1.4.0',
  ziweiEngineVersion: '1.4.0',
  temporalEngineVersion: '2.5.0',
  lunarEngineVersion: '1.2.0',
  realtimeEngineVersion: '1.3.0',
  aiInterpretationEngineVersion: '2.1.0'
};

export interface CalculationProvenance {
  inputHash: string;
  engineVersion: string;
  engineVersions: EngineVersions;
  calculationVersion: string;
  calendarConvention: string;
  ziweiConvention: string;
  solarTermConvention: string;
  leapMonthConvention: string;
  timezone: number;
  timezoneName: string;
  longitude?: number;
  latitude?: number;
  calculatedAt: string;
  aiModelVersion?: string;
  promptVersion?: string;
  resultHash: string;
}

/**
 * Computes deterministic SHA-256 hash of normalized input parameters
 */
export function computeInputHash(canonicalInput: any): string {
  const canonicalObj = {
    birthYear: canonicalInput.birthYear,
    birthMonth: canonicalInput.birthMonth,
    birthDay: canonicalInput.birthDay,
    birthHour: canonicalInput.birthHour,
    birthMinute: canonicalInput.birthMinute,
    hasExactHour: canonicalInput.hasExactHour,
    gender: canonicalInput.gender,
    calendarSystem: canonicalInput.calendarSystem,
    timezoneOffset: canonicalInput.timezoneOffset,
    timezoneName: canonicalInput.timezoneName,
    longitude: canonicalInput.longitude,
    latitude: canonicalInput.latitude,
    isLateRat: canonicalInput.isLateRat,
    timeConvention: canonicalInput.timeConvention,
    ziweiYearConvention: canonicalInput.ziweiYearConvention,
    ziweiLeapMonthConvention: canonicalInput.ziweiLeapMonthConvention,
    analysisYear: canonicalInput.analysisYear
  };
  const str = JSON.stringify(canonicalObj, Object.keys(canonicalObj).sort());
  return sha256(str);
}

/**
 * Computes deterministic SHA-256 hash of core chart results
 */
export function computeResultHash(bazi: BaZiChart, ziwei: ZiWeiChart): string {
  const coreResult = {
    bazi: {
      yearPillar: `${bazi.yearPillar.stem}-${bazi.yearPillar.branch}`,
      monthPillar: `${bazi.monthPillar.stem}-${bazi.monthPillar.branch}`,
      dayPillar: `${bazi.dayPillar.stem}-${bazi.dayPillar.branch}`,
      hourPillar: `${bazi.hourPillar.stem}-${bazi.hourPillar.branch}`,
      dayMaster: bazi.dayMaster,
      structureType: bazi.structureType
    },
    ziwei: {
      elementBureau: ziwei.elementBureau,
      lifePalaceKey: ziwei.lifePalaceKey,
      bodyPalaceKey: ziwei.bodyPalaceKey,
      cucNumber: ziwei.cucNumber
    }
  };
  const str = JSON.stringify(coreResult);
  return sha256(str);
}

/**
 * Builds complete immutable provenance record
 */
export function buildCalculationProvenance(params: {
  canonicalInput: any;
  bazi: BaZiChart;
  ziwei: ZiWeiChart;
  calculatedAt?: string;
  aiModelVersion?: string;
  promptVersion?: string;
}): CalculationProvenance {
  const { canonicalInput, bazi, ziwei } = params;
  const inputHash = computeInputHash(canonicalInput);
  const resultHash = computeResultHash(bazi, ziwei);

  return {
    inputHash,
    engineVersion: canonicalInput.calculationEngineVersion || '2.5.0',
    engineVersions: { ...CURRENT_ENGINE_VERSIONS },
    calculationVersion: canonicalInput.calculationEngineVersion || '2.5.0',
    calendarConvention: canonicalInput.calendarSystem || 'solar',
    ziweiConvention: canonicalInput.ziweiYearConvention || 'solarLapXuan',
    solarTermConvention: 'VSOP87_Astronomical_LapXuan',
    leapMonthConvention: canonicalInput.ziweiLeapMonthConvention || 'midMonthSplit',
    timezone: canonicalInput.timezoneOffset ?? 7,
    timezoneName: canonicalInput.timezoneName || 'Asia/Ho_Chi_Minh',
    longitude: canonicalInput.longitude,
    latitude: canonicalInput.latitude,
    calculatedAt: params.calculatedAt || new Date().toISOString(),
    aiModelVersion: params.aiModelVersion,
    promptVersion: params.promptVersion,
    resultHash
  };
}

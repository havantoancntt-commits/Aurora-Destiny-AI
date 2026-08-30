// ==========================================
// MASTER DESTINY CALCULATION ENGINE
// ==========================================

import { BirthData, CalculationResult } from '../types/destiny';
import { calculateBaZiChart } from './bazi';
import { calculateZiWeiChart } from './ziwei';
import { calculateDecadeCycles, calculateAnnualTransits } from './temporal';
import { evaluateConfidence } from './confidence';

export const CALCULATION_ENGINE_VERSION = 'calc_v2.4.1';
export const ASTROLOGY_RULES_VERSION = 'astrorules_v1.8.0';
export const ANALYSIS_MODEL_VERSION = 'aurora_ensemble_v3.2';

export function runFullDestinyCalculation(
  birthData: BirthData,
  profileId: string = 'prof_default',
  eventsCount: number = 0
): CalculationResult {
  const bazi = calculateBaZiChart(birthData);
  const ziwei = calculateZiWeiChart(birthData);
  const decades = calculateDecadeCycles(birthData);
  const currentYear = new Date().getFullYear();
  const annualTransits = calculateAnnualTransits(birthData, currentYear - 6, currentYear + 10);
  const confidence = evaluateConfidence(birthData, eventsCount);

  return {
    id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
    confidence
  };
}

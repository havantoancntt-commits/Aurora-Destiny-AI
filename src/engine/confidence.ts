// ==========================================
// SCIENTIFIC CONFIDENCE & UNCERTAINTY ENGINE
// ==========================================

import { BirthData, ConfidenceMetrics, CalculationResult } from '../types/destiny';

export function evaluateConfidence(
  birthData: BirthData,
  eventsCount: number = 0,
  backtestMatchScore: number = 75
): ConfidenceMetrics {
  // 1. Data Completeness (Hour exactness, City precision, Timezone normalization)
  let completeness = 60;
  if (birthData.hasExactHour) completeness += 25;
  if (birthData.birthCity && birthData.birthCity.length > 2) completeness += 10;
  if (birthData.gender && birthData.gender !== 'PreferNotToSay') completeness += 5;

  // 2. Astronomical Resolution Level
  const resolutionLevel: 'High' | 'Medium' | 'Estimated' =
    birthData.hasExactHour ? 'High' : 'Estimated';

  // 3. Historical Fit Score
  const historicalFit = eventsCount > 0 ? backtestMatchScore : 65;

  // 4. Signal Strength
  const signalStrength = Math.round(completeness * 0.5 + historicalFit * 0.5);

  // 5. Model Consistency Score
  const consistencyScore = Math.min(94, Math.max(55, Math.round(signalStrength * 0.9 + 5)));

  // 6. Uncertainty Index
  const uncertaintyIndex = Math.max(10, 100 - consistencyScore);

  const assumptions = [
    birthData.hasExactHour
      ? 'Birth hour specified: Local apparent solar time normalized to UTC offset.'
      : 'Birth hour approximated: Using default daylight midpoint hour for solar calculations.',
    `Location referenced to coordinates for ${birthData.birthCity || 'Standard Meridian'}.`,
    'Ephemeris alignments derived from standard astronomical Solar Term calculations.'
  ];

  const limitations = [
    'Model scores represent internal pattern coherence and harmonic probabilities, NOT absolute determinism.',
    'Free will, socio-economic variables, and deliberate individual decisions constitute dominant real-world variance.',
    'Consult qualified specialists for professional medical, financial, or legal decisions.'
  ];

  return {
    consistencyScore,
    dataCompleteness: completeness,
    historicalFit,
    signalStrength,
    uncertaintyIndex,
    resolutionLevel,
    assumptions,
    limitations
  };
}

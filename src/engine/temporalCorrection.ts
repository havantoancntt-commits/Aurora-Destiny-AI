// ==========================================
// AURORA DESTINY AI — CANONICAL TEMPORAL CORRECTION ENGINE
// High-Precision True Solar Time & Civil Time Resolver
// Accounts for Equation of Time (EoT), Longitude Correction & Midnight Day-Rollover
// ==========================================

import { BirthData } from '../types/destiny';
import { calculateTrueSolarTime, gregorianToContinuousJD } from './lunarSolar';
import { locationProvider, LocationData } from '../services/locationProvider';

export interface EffectiveBirthTime {
  originalCivil: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  timezoneOffset: number;
  timezoneName: string;
  longitude: number;
  latitude?: number;
  timeConvention: 'civil' | 'trueSolar';
  
  // Resolved effective astronomical/civil date & time for engine computations
  effectiveDate: {
    year: number;
    month: number;
    day: number;
  };
  effectiveHour: number;
  effectiveMinute: number;
  dayShift: -1 | 0 | 1; // Tracks if True Solar Time crossed midnight into adjacent day

  // Astronomical decomposition
  equationOfTimeMinutes: number;
  longitudeCorrectionMinutes: number;
  totalCorrectionMinutes: number;
  localMeanSolarHour: number;
  localMeanSolarMinute: number;

  isLateRat: boolean;
  sourceMetadata: {
    engineVersion: string;
    resolvedLocation?: string;
    formula: string;
    computedAt: string;
  };
}

/**
 * Resolves Effective Birth Time Canonical Object
 * Single source of truth for BaZi, ZiWei, Lunar conversions, Transits & AI ground facts.
 */
export function resolveEffectiveBirthTime(
  birthData: BirthData,
  explicitLocation?: LocationData | null
): EffectiveBirthTime {
  const {
    solarYear,
    solarMonth,
    solarDay,
    solarHour,
    solarMinute = 0,
    timezoneOffset = 7,
    timezoneName = `UTC${timezoneOffset >= 0 ? `+${timezoneOffset}` : timezoneOffset}`,
    timeConvention = 'civil',
    isLateRat = false
  } = birthData;

  // 1. Resolve geographic longitude & latitude
  let longitude = birthData.longitude;
  let latitude = birthData.latitude;
  let locationLabel = birthData.birthCity || 'Hanoi';

  if (longitude === undefined || longitude === null) {
    const loc = explicitLocation || locationProvider.resolveLocation(birthData.birthCity, birthData.birthCountry);
    if (loc) {
      longitude = loc.longitude;
      latitude = loc.latitude;
      locationLabel = `${loc.city}, ${loc.country}`;
    } else {
      // Standard meridian reference when location is unspecified
      longitude = timezoneOffset * 15;
    }
  }

  // 2. Compute Astronomical Equation of Time & Longitude Offset
  const standardMeridian = timezoneOffset * 15;
  const longitudeCorrectionMinutes = (longitude - standardMeridian) * 4;

  const continuousJD = gregorianToContinuousJD(
    solarYear,
    solarMonth,
    solarDay,
    solarHour,
    solarMinute,
    timezoneOffset
  );

  const tst = calculateTrueSolarTime(
    solarYear,
    solarMonth,
    solarDay,
    solarHour,
    solarMinute,
    timezoneOffset,
    longitude
  );

  // Local Mean Solar Time (LMST) = Civil Time + Longitude Correction
  const civilTotalMinutes = solarHour * 60 + solarMinute;
  const lmstTotalMinutes = Math.round(civilTotalMinutes + longitudeCorrectionMinutes);
  let normLmst = ((lmstTotalMinutes % 1440) + 1440) % 1440;
  const localMeanSolarHour = Math.floor(normLmst / 60);
  const localMeanSolarMinute = normLmst % 60;

  // 3. Determine Day Rollover for True Solar Time
  let dayShift: -1 | 0 | 1 = 0;
  let effYear = solarYear;
  let effMonth = solarMonth;
  let effDay = solarDay;
  let effHour = solarHour;
  let effMinute = solarMinute;

  if (timeConvention === 'trueSolar') {
    const rawTotalMinutes = civilTotalMinutes + tst.totalCorrectionMinutes;
    if (rawTotalMinutes < 0) {
      dayShift = -1;
      const prevDate = new Date(Date.UTC(solarYear, solarMonth - 1, solarDay - 1));
      effYear = prevDate.getUTCFullYear();
      effMonth = prevDate.getUTCMonth() + 1;
      effDay = prevDate.getUTCDate();
    } else if (rawTotalMinutes >= 1440) {
      dayShift = 1;
      const nextDate = new Date(Date.UTC(solarYear, solarMonth - 1, solarDay + 1));
      effYear = nextDate.getUTCFullYear();
      effMonth = nextDate.getUTCMonth() + 1;
      effDay = nextDate.getUTCDate();
    }
    effHour = tst.trueSolarHour;
    effMinute = tst.trueSolarMinute;
  }

  return {
    originalCivil: {
      year: solarYear,
      month: solarMonth,
      day: solarDay,
      hour: solarHour,
      minute: solarMinute
    },
    timezoneOffset,
    timezoneName,
    longitude,
    latitude,
    timeConvention,
    effectiveDate: {
      year: effYear,
      month: effMonth,
      day: effDay
    },
    effectiveHour: effHour,
    effectiveMinute: effMinute,
    dayShift,
    equationOfTimeMinutes: tst.equationOfTimeMinutes,
    longitudeCorrectionMinutes: tst.longitudeCorrectionMinutes,
    totalCorrectionMinutes: tst.totalCorrectionMinutes,
    localMeanSolarHour,
    localMeanSolarMinute,
    isLateRat,
    sourceMetadata: {
      engineVersion: 'aurora_tst_v2.5',
      resolvedLocation: locationLabel,
      formula: 'TST = Civil + EoT + 4*(Lon - 15*TZ)',
      computedAt: new Date().toISOString()
    }
  };
}

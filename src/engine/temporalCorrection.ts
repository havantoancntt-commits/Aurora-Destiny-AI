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
 * Resolves exact historical UTC offset in hours from IANA timezone identifier
 * at a specific local civil datetime using standard Intl runtime support.
 * Returns null if timezone is invalid or unsupported.
 */
export function resolveHistoricalTimezoneOffset(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): { offsetHours: number; offsetMinutes: number; exactUtcIso: string } | null {
  if (!timeZone || typeof Intl === 'undefined' || !Intl.DateTimeFormat) return null;
  const utcMatch = timeZone.match(/^UTC([+-]\d+(?:\.\d+)?)$/i);
  if (utcMatch) {
    const hours = parseFloat(utcMatch[1]);
    return { offsetHours: hours, offsetMinutes: hours * 60, exactUtcIso: '' };
  }

  try {
    const utcApprox = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const getParts = (d: Date) => {
      const parts = formatter.formatToParts(d);
      const val = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
      const h = val('hour');
      return {
        year: val('year'),
        month: val('month'),
        day: val('day'),
        hour: h === 24 ? 0 : h,
        minute: val('minute')
      };
    };

    const p1 = getParts(utcApprox);
    const targetLocalMs = Date.UTC(year, month - 1, day, hour, minute);
    const p1Ms = Date.UTC(p1.year, p1.month - 1, p1.day, p1.hour, p1.minute);
    const offsetMs = p1Ms - utcApprox.getTime();

    const exactUtc = new Date(targetLocalMs - offsetMs);
    const p2 = getParts(exactUtc);
    const p2Ms = Date.UTC(p2.year, p2.month - 1, p2.day, p2.hour, p2.minute);
    const finalOffsetMs = p2Ms - exactUtc.getTime();
    const offsetHours = finalOffsetMs / 3600000;

    return {
      offsetHours,
      offsetMinutes: finalOffsetMs / 60000,
      exactUtcIso: exactUtc.toISOString()
    };
  } catch {
    return null;
  }
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
    timeConvention = 'civil',
    isLateRat = false
  } = birthData;

  const rawTimezoneOffset = birthData.timezoneOffset !== undefined ? birthData.timezoneOffset : 7;
  let timezoneName = birthData.timezoneName;
  if (!timezoneName) {
    const loc = explicitLocation || locationProvider.resolveLocation(birthData.birthCity, birthData.birthCountry);
    if (loc && loc.timezone) {
      timezoneName = loc.timezone;
    } else {
      timezoneName = `UTC${rawTimezoneOffset >= 0 ? `+${rawTimezoneOffset}` : rawTimezoneOffset}`;
    }
  }

  // Resolve historical UTC offset from IANA timezone if available
  let timezoneOffset = rawTimezoneOffset;
  if (timezoneName) {
    const historical = resolveHistoricalTimezoneOffset(
      solarYear,
      solarMonth,
      solarDay,
      solarHour,
      solarMinute,
      timezoneName
    );
    if (historical !== null) {
      timezoneOffset = historical.offsetHours;
    }
  }

  // 1. Resolve geographic longitude & latitude
  let longitude = birthData.longitude;
  let latitude = birthData.latitude;
  let locationLabel = birthData.birthCity || 'Standard Meridian';

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

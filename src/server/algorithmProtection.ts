// ==========================================
// AURORA DESTINY AI — ALGORITHM PROTECTION & ANTI-COPY
// Cryptographic Provenance Signatures, Anti-Scraping Sweeper
// Detection, Intellectual Property Watermarking & Tamper Prevention
// ==========================================

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { CalculationResult } from '../types/destiny';
import { repository } from '../db/repository';

// Master server key used for HMAC signature of algorithm calculations.
// FAIL-FAST IN PRODUCTION: In production, ALGORITHM_PROTECTION_SECRET MUST be explicitly configured.
function getAlgorithmMasterSecret(): string {
  const secret = process.env.ALGORITHM_PROTECTION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[FATAL SECURITY] ALGORITHM_PROTECTION_SECRET is not configured in production environment. Refusing to operate with fallback secret.'
      );
    }
    return 'aurora_celestial_huyen_phong_phat_dao_dev_fallback_secret_2026';
  }
  return secret;
}

const ALGORITHM_ENGINE_ID = 'aurora-engine-v4.2';
const ISSUER_NAME = 'Prof.TOAN & Huyen Phong Phat Dao Proprietary Astrology Matrix';

// Client sweep tracking with multi-signal behavioral metrics
interface SweepTrackRecord {
  submissions: Array<{ timestamp: number; birthKey: string; hour: number; day: number }>;
  penaltyActive: boolean;
  penaltyUntil: number;
  burstCount: number;
}

const sweepTracker = new Map<string, SweepTrackRecord>();
const MAX_SWEEP_TRACKERS = 10000;

// Clean up sweep tracking memory every 5 minutes
const sweepCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of sweepTracker.entries()) {
    record.submissions = record.submissions.filter(s => now - s.timestamp < 10 * 60 * 1000);
    if (record.submissions.length === 0 && (!record.penaltyActive || now > record.penaltyUntil)) {
      sweepTracker.delete(key);
    }
  }
}, 5 * 60 * 1000);
if (sweepCleanupInterval.unref) {
  sweepCleanupInterval.unref();
}

/**
 * Deterministic JSON serialization for canonical hashing.
 * Recursively sorts all object keys to ensure invariant hash representation.
 */
export function canonicalStringify(val: any): string {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'number') {
    if (!Number.isFinite(val)) return 'null';
    return Object.is(val, -0) ? '0' : val.toString();
  }
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'string') return JSON.stringify(val);
  if (Array.isArray(val)) {
    return '[' + val.map(item => canonicalStringify(item)).join(',') + ']';
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val).sort();
    const pairs = keys
      .filter(k => val[k] !== undefined)
      .map(k => `${JSON.stringify(k)}:${canonicalStringify(val[k])}`);
    return '{' + pairs.join(',') + '}';
  }
  return JSON.stringify(val);
}

/**
 * Extracts comprehensive invariant astrological calculation coordinates.
 * Excludes transient cache fields, runtime metadata, and the signature itself.
 */
export function extractCanonicalCalculationPayload(calc: CalculationResult): any {
  return {
    engineId: ALGORITHM_ENGINE_ID,
    id: calc.id,
    profileId: calc.profileId,
    analysisYear: calc.analysisYear,
    analysisModelVersion: calc.analysisModelVersion || '4.2',
    astrologyRulesVersion: calc.astrologyRulesVersion,
    calculationVersion: calc.calculationVersion,
    canonicalInput: calc.canonicalInput || null,
    inputSnapshot: {
      solarYear: calc.inputSnapshot.solarYear,
      solarMonth: calc.inputSnapshot.solarMonth,
      solarDay: calc.inputSnapshot.solarDay,
      solarHour: calc.inputSnapshot.solarHour,
      solarMinute: calc.inputSnapshot.solarMinute,
      hasExactHour: calc.inputSnapshot.hasExactHour,
      gender: calc.inputSnapshot.gender,
      calendarSystem: calc.inputSnapshot.calendarSystem,
      timeConvention: calc.inputSnapshot.timeConvention,
      timezoneOffset: calc.inputSnapshot.timezoneOffset,
      timezoneName: calc.inputSnapshot.timezoneName,
      birthCity: calc.inputSnapshot.birthCity,
      birthCountry: calc.inputSnapshot.birthCountry,
      longitude: calc.inputSnapshot.longitude,
      latitude: calc.inputSnapshot.latitude,
      isLateRat: calc.inputSnapshot.isLateRat
    },
    effectiveBirthTime: calc.effectiveBirthTime ? {
      effectiveDate: calc.effectiveBirthTime.effectiveDate,
      effectiveHour: calc.effectiveBirthTime.effectiveHour,
      effectiveMinute: calc.effectiveBirthTime.effectiveMinute,
      equationOfTimeMinutes: calc.effectiveBirthTime.equationOfTimeMinutes,
      longitudeCorrectionMinutes: calc.effectiveBirthTime.longitudeCorrectionMinutes,
      timeConvention: calc.effectiveBirthTime.timeConvention,
      dayShift: calc.effectiveBirthTime.dayShift
    } : null,
    bazi: {
      yearPillar: {
        stem: calc.bazi.yearPillar.stem,
        branch: calc.bazi.yearPillar.branch,
        tenGod: calc.bazi.yearPillar.tenGod,
        naYin: calc.bazi.yearPillar.naYin,
        hiddenStems: calc.bazi.yearPillar.hiddenStems
      },
      monthPillar: {
        stem: calc.bazi.monthPillar.stem,
        branch: calc.bazi.monthPillar.branch,
        tenGod: calc.bazi.monthPillar.tenGod,
        naYin: calc.bazi.monthPillar.naYin,
        hiddenStems: calc.bazi.monthPillar.hiddenStems
      },
      dayPillar: {
        stem: calc.bazi.dayPillar.stem,
        branch: calc.bazi.dayPillar.branch,
        tenGod: calc.bazi.dayPillar.tenGod,
        naYin: calc.bazi.dayPillar.naYin,
        hiddenStems: calc.bazi.dayPillar.hiddenStems
      },
      hourPillar: {
        stem: calc.bazi.hourPillar.stem,
        branch: calc.bazi.hourPillar.branch,
        tenGod: calc.bazi.hourPillar.tenGod,
        naYin: calc.bazi.hourPillar.naYin,
        hiddenStems: calc.bazi.hourPillar.hiddenStems,
        isEstimated: calc.bazi.hourPillar.isEstimated
      },
      dayMaster: calc.bazi.dayMaster,
      dayMasterElement: calc.bazi.dayMasterElement,
      dayMasterStrength: calc.bazi.dayMasterStrength,
      structureType: calc.bazi.structureType,
      favorableElements: calc.bazi.favorableElements,
      unfavorableElements: calc.bazi.unfavorableElements,
      elementBalance: calc.bazi.elementBalance,
      interactions: (calc.bazi.interactions || []).map(i => ({
        type: i.type,
        involvedPillars: i.involvedPillars,
        nature: i.nature
      }))
    },
    ziwei: {
      elementBureau: calc.ziwei.elementBureau,
      cucNumber: calc.ziwei.cucNumber,
      lifePalaceKey: calc.ziwei.lifePalaceKey,
      bodyPalaceKey: calc.ziwei.bodyPalaceKey,
      tuanTriet: (calc.ziwei as any).tuanTriet,
      palaces: Object.entries(calc.ziwei.palaces || {}).map(([key, p]) => ({
        key,
        branch: p.branch,
        stem: p.stem,
        nameVi: p.nameVi,
        isBodyPalace: p.isBodyPalace || false,
        tuanTriet: p.tuanTriet || [],
        transformations: p.transformations || [],
        majorStars: (p.majorStars || []).map(s => ({
          nameVi: s.nameVi,
          element: s.element,
          brightness: s.brightness,
          transformation: s.transformation || null
        })),
        minorStars: (p.minorStars || []).map(s => ({
          nameVi: s.nameVi,
          type: s.type
        }))
      }))
    },
    decades: (calc.decades || []).map(d => ({
      startAge: d.startAge,
      endAge: d.endAge,
      startYear: d.startYear,
      endYear: d.endYear,
      stem: d.stem,
      branch: d.branch,
      tenGod: d.tenGod
    }))
  };
}

/**
 * Computes canonical SHA-256 hash over all critical astrological coordinates.
 */
export function computeCanonicalAlgorithmHash(calc: CalculationResult): string {
  const payload = extractCanonicalCalculationPayload(calc);
  const serialized = canonicalStringify(payload);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Computes canonical calculation hash from either CalculationResult or extracted canonical payload.
 */
export function computeCanonicalCalculationHash(payloadOrCalc: any): string {
  let payload = payloadOrCalc;
  if (payloadOrCalc && !payloadOrCalc.engineId && payloadOrCalc.bazi && payloadOrCalc.ziwei) {
    payload = extractCanonicalCalculationPayload(payloadOrCalc);
  }
  const serialized = canonicalStringify(payload);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Generate a tamper-evident cryptographic HMAC-SHA256 signature for a calculation.
 * Ensures calculations cannot be forged, duplicated by third parties, or tampered with.
 */
export function generateAlgorithmSignature(calc: CalculationResult, customSecret?: string): {
  signature: string;
  sealTimestamp: string;
  algorithmHash: string;
  canonicalHash: string;
  engineId: string;
  issuer: string;
  verified: boolean;
} {
  const now = new Date().toISOString();
  const algorithmHash = computeCanonicalAlgorithmHash(calc);
  const secretToUse = customSecret || getAlgorithmMasterSecret();
  const signature = crypto.createHmac('sha256', secretToUse)
    .update(`${algorithmHash}::${now}::${ISSUER_NAME}`)
    .digest('hex');

  const sigObj = {
    signature,
    sealTimestamp: now,
    algorithmHash,
    canonicalHash: algorithmHash,
    engineId: ALGORITHM_ENGINE_ID,
    issuer: ISSUER_NAME,
    verified: true
  };

  calc.cryptographicSignature = sigObj;

  return sigObj;
}

/**
 * Verifies if a given calculation's cryptographic seal is authentic and untampered
 */
export function verifyAlgorithmSignature(
  calc: CalculationResult,
  customSigOrMaxAge?: string | number,
  customSecretOrMaxAge?: string | number,
  explicitMaxAgeMs?: number
): boolean {
  let signature: string | undefined;
  let secretToUse = getAlgorithmMasterSecret();
  let maxAgeMs: number | undefined;

  if (typeof customSigOrMaxAge === 'string') {
    signature = customSigOrMaxAge;
    if (typeof customSecretOrMaxAge === 'string') {
      secretToUse = customSecretOrMaxAge;
      maxAgeMs = explicitMaxAgeMs;
    } else if (typeof customSecretOrMaxAge === 'number') {
      maxAgeMs = customSecretOrMaxAge;
    }
  } else if (typeof customSigOrMaxAge === 'number') {
    maxAgeMs = customSigOrMaxAge;
  }

  if (!signature) {
    if (!calc.cryptographicSignature) return false;
    signature = calc.cryptographicSignature.signature;
  }

  if (!signature) return false;

  const sealTimestamp = calc.cryptographicSignature?.sealTimestamp;
  if (!sealTimestamp) return false;

  // Check algorithmHash if cryptographicSignature object is present
  if (calc.cryptographicSignature) {
    if (!calc.cryptographicSignature.algorithmHash || calc.cryptographicSignature.algorithmHash.length !== 64) {
      return false;
    }
  }

  // Optional replay / age boundary check
  if (maxAgeMs && maxAgeMs > 0) {
    const ts = new Date(sealTimestamp).getTime();
    if (isNaN(ts) || Date.now() - ts > maxAgeMs) {
      return false;
    }
  }

  // 1. Re-verify canonical hash over entire astrological dataset
  const expectedHash = computeCanonicalAlgorithmHash(calc);
  if (calc.cryptographicSignature?.algorithmHash && calc.cryptographicSignature.algorithmHash !== expectedHash) {
    return false;
  }

  // 2. Re-verify HMAC signature with constant-time equality check
  const expectedSig = crypto.createHmac('sha256', secretToUse)
    .update(`${expectedHash}::${sealTimestamp}::${ISSUER_NAME}`)
    .digest('hex');

  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Anti-Scraping Birth Grid Anomaly Detector:
 * Detects if an attacker is rapidly submitting varied birth coordinates to extract the
 * proprietary astrological rule table via differential analysis.
 */
export function antiScrapingSweeperMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userId = req.user?.id;
  const clientKey = userId ? `u_${userId}` : `ip_${ip}`;

  const now = Date.now();
  let track = sweepTracker.get(clientKey);
  if (!track) {
    if (sweepTracker.size >= MAX_SWEEP_TRACKERS) {
      const oldest = sweepTracker.keys().next().value;
      if (oldest) sweepTracker.delete(oldest);
    }
    track = { submissions: [], penaltyActive: false, penaltyUntil: 0, burstCount: 0 };
    sweepTracker.set(clientKey, track);
  }

  // Check if cooling penalty is currently active
  if (track.penaltyActive) {
    if (now < track.penaltyUntil) {
      const waitSeconds = Math.ceil((track.penaltyUntil - now) / 1000);
      res.setHeader('Retry-After', waitSeconds.toString());
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Tần suất gửi yêu cầu vượt ngưỡng cho phép. Vui lòng thử lại sau giây lát.',
          retryAfterSeconds: waitSeconds,
          requestId: req.requestId
        }
      });
    } else {
      track.penaltyActive = false;
    }
  }

  // Record submission if birthData is in request
  const birthData = req.body?.birthData;
  if (birthData) {
    const birthKey = `${birthData.solarYear}-${birthData.solarMonth}-${birthData.solarDay}-${birthData.solarHour}-${birthData.solarMinute}`;
    const hour = typeof birthData.solarHour === 'number' ? birthData.solarHour : -1;
    const day = typeof birthData.solarDay === 'number' ? birthData.solarDay : -1;

    // Check rapid automated sub-second interval
    const lastSub = track.submissions[track.submissions.length - 1];
    const isRapidAutomation = lastSub ? (now - lastSub.timestamp < 250) : false;

    track.submissions.push({ timestamp: now, birthKey, hour, day });

    // Filter to last 2 minutes
    track.submissions = track.submissions.filter(s => now - s.timestamp < 2 * 60 * 1000);

    // Multi-signal 1: Burst requests within 5 seconds
    const burstCount = track.submissions.filter(s => now - s.timestamp < 5000).length;

    // Multi-signal 2: Unique birth keys submitted in the last 2 minutes
    const uniqueBirthKeys = new Set(track.submissions.map(s => s.birthKey));

    // Multi-signal 3: Sequential parameter enumeration (stepping hours or days)
    let isSequentialStepping = false;
    if (track.submissions.length >= 5) {
      const recentSubs = track.submissions.slice(-5);
      const hourDiffs = recentSubs.slice(1).map((s, idx) => s.hour - recentSubs[idx].hour);
      const isLinearHours = hourDiffs.every(d => d === 1 || d === 2);
      if (isLinearHours) isSequentialStepping = true;
    }

    // Determine scraping signature
    const isScrapingSuspected =
      uniqueBirthKeys.size > 12 ||
      (burstCount > 7 && uniqueBirthKeys.size > 4) ||
      (isSequentialStepping && uniqueBirthKeys.size >= 5) ||
      (isRapidAutomation && uniqueBirthKeys.size >= 6);

    if (isScrapingSuspected) {
      track.penaltyActive = true;
      track.penaltyUntil = now + 60 * 1000; // 60 seconds cooling period

      repository.logAudit({
        userId: userId || 'anonymous_scraper',
        action: 'SECURITY_ALGORITHM_SCRAPING_SUSPECTED',
        resource: 'calculation',
        resourceId: `sweeper_${clientKey}`,
        status: 'BLOCKED',
        requestId: req.requestId
      });

      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Tần suất gửi yêu cầu vượt ngưỡng cho phép. Vui lòng thử lại sau giây lát.',
          retryAfterSeconds: 60,
          requestId: req.requestId
        }
      });
    }
  }

  // Add intellectual property protection headers to response
  res.setHeader('X-Algorithm-Protected-By', 'Aurora-Celestial-Core-v4.2');
  res.setHeader('X-Intellectual-Property', 'Prof.TOAN & Huyen Phong Phat Dao');
  res.setHeader('X-Content-License', 'Proprietary-All-Rights-Reserved');

  next();
}

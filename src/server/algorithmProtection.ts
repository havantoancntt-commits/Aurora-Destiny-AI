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

const ALGORITHM_ENGINE_ID = 'AURORA_CELESTIAL_CORE_V4.2_PROPRIETARY';
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
 * Generate a tamper-evident cryptographic HMAC-SHA256 signature for a calculation.
 * Ensures calculations cannot be forged, duplicated by third parties, or tampered with.
 */
export function generateAlgorithmSignature(calc: CalculationResult): {
  signature: string;
  sealTimestamp: string;
  algorithmHash: string;
  issuer: string;
  verified: boolean;
} {
  const now = new Date().toISOString();
  
  // Construct invariant canonical payload from core astrological coordinates
  const canonicalPayload = [
    calc.id,
    calc.profileId,
    calc.inputSnapshot.solarYear,
    calc.inputSnapshot.solarMonth,
    calc.inputSnapshot.solarDay,
    calc.inputSnapshot.solarHour,
    calc.inputSnapshot.solarMinute,
    calc.inputSnapshot.gender,
    calc.bazi.dayMaster,
    calc.bazi.dayMasterElement,
    calc.bazi.structureType,
    calc.ziwei.elementBureau,
    calc.ziwei.lifePalaceKey,
    calc.ziwei.bodyPalaceKey,
    ALGORITHM_ENGINE_ID
  ].join('::');

  const algorithmHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
  const signature = crypto.createHmac('sha256', getAlgorithmMasterSecret())
    .update(`${algorithmHash}::${now}::${ISSUER_NAME}`)
    .digest('hex');

  return {
    signature,
    sealTimestamp: now,
    algorithmHash,
    issuer: ISSUER_NAME,
    verified: true
  };
}

/**
 * Verifies if a given calculation's cryptographic seal is authentic and untampered
 */
export function verifyAlgorithmSignature(calc: CalculationResult): boolean {
  if (!calc.cryptographicSignature) return false;

  const { signature, sealTimestamp, algorithmHash } = calc.cryptographicSignature;

  // Re-verify canonical hash
  const canonicalPayload = [
    calc.id,
    calc.profileId,
    calc.inputSnapshot.solarYear,
    calc.inputSnapshot.solarMonth,
    calc.inputSnapshot.solarDay,
    calc.inputSnapshot.solarHour,
    calc.inputSnapshot.solarMinute,
    calc.inputSnapshot.gender,
    calc.bazi.dayMaster,
    calc.bazi.dayMasterElement,
    calc.bazi.structureType,
    calc.ziwei.elementBureau,
    calc.ziwei.lifePalaceKey,
    calc.ziwei.bodyPalaceKey,
    ALGORITHM_ENGINE_ID
  ].join('::');

  const expectedHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
  if (expectedHash !== algorithmHash) {
    return false;
  }

  // Re-verify HMAC signature with constant-time equality check
  const expectedSig = crypto.createHmac('sha256', getAlgorithmMasterSecret())
    .update(`${expectedHash}::${sealTimestamp}::${ISSUER_NAME}`)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSig, 'hex');

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
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

// ==========================================
// AURORA DESTINY AI — ADVANCED SECURITY FIREWALL & WAF
// Hardened Defense: SQLi, NoSQL/Prototype Pollution,
// XSS, Path Traversal, Bad Bot Defense & IP Quarantine
// ==========================================

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { repository } from '../db/repository';

export interface SecurityThreatRecord {
  id: string;
  ipHash: string;
  threatType: 'SQL_INJECTION' | 'PROTOTYPE_POLLUTION' | 'PATH_TRAVERSAL' | 'XSS_ATTACK' | 'COMMAND_INJECTION' | 'MALICIOUS_BOT' | 'ALGORITHM_SCRAPING';
  path: string;
  method: string;
  payloadFragment: string;
  timestamp: string;
  score: number;
}

interface QuarantineRecord {
  bannedUntil: number;
  reason: string;
  threatCount: number;
}

// In-memory threat tracking & IP quarantine store
const ipThreatStore = new Map<string, { score: number; lastSeen: number; threats: string[] }>();
const ipQuarantineStore = new Map<string, QuarantineRecord>();
const recentThreats: SecurityThreatRecord[] = [];
const MAX_RECENT_THREATS = 200;

// Regular attack signatures
const SQL_INJECTION_PATTERNS = [
  /(\b(UNION(\s+ALL)?|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)/i,
  /(\b(OR|AND)\b\s+['"\d\w]+\s*=\s*['"\d\w]+(\s*--|\s*\/\*|\s*#))/i,
  /(--\s*$|\/\*.*\*\/|#\s*$)/,
  /(\b(WAITFOR\s+DELAY|SLEEP\s*\(\s*\d+\s*\)|BENCHMARK\s*\(\s*\d+\s*,\s*.*\)))/i,
  /(\bINFORMATION_SCHEMA\b|\bSYS\.TABLES\b|\bPG_CATALOG\b)/i
];

const PROTOTYPE_POLLUTION_PATTERNS = [
  /__proto__/i,
  /constructor\s*\.\s*prototype/i,
  /prototype\s*\[/i,
  /\$where\s*:/i,
  /\$regex\s*:/i
];

const PATH_TRAVERSAL_PATTERNS = [
  /(\.\.[\/\\]|\%2e\%2e[\/\\]|\%2e\%2e\%2f|\%2e\%2e\/)/i,
  /(\/etc\/(passwd|shadow|hosts|issue))/i,
  /(c:[\/\\]windows[\/\\](system32|win\.ini))/i,
  /(\/proc\/self\/(environ|cmdline))/i
];

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:\s*[^\s]/i,
  /vbscript\s*:\s*[^\s]/i,
  /on(error|load|click|mouseover|submit|focus|blur)\s*=\s*['"][^'"]*['"]/gi,
  /data:\s*text\/html/i
];

const COMMAND_INJECTION_PATTERNS = [
  /(;\s*(cat|ls|id|whoami|uname|nc|bash|sh|curl|wget)\b)/i,
  /(\|\s*(cat|ls|id|whoami|uname|nc|bash|sh|curl|wget)\b)/i,
  /(`[^`]*`)/,
  /(\$\([^)]*\))/
];

const MALICIOUS_BOT_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /wpscan/i,
  /acunetix/i,
  /dirbuster/i,
  /gobuster/i,
  /masscan/i,
  /zgrab/i,
  /nmap/i,
  /havij/i,
  /netsparker/i,
  /burpcollaborator/i
];

// Hash IP for GDPR/privacy compliance
function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + '_aurora_salt').digest('hex').substring(0, 16);
}

// Clean up expired quarantine entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipQuarantineStore.entries()) {
    if (now > record.bannedUntil) {
      ipQuarantineStore.delete(ip);
    }
  }
  for (const [ip, threat] of ipThreatStore.entries()) {
    if (now - threat.lastSeen > 15 * 60 * 1000) {
      ipThreatStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Recursively inspect values in request payload
function inspectValue(val: unknown, depth = 0): { detected: boolean; type?: SecurityThreatRecord['threatType']; fragment?: string } {
  if (depth > 6 || val === null || val === undefined) {
    return { detected: false };
  }

  if (typeof val === 'string') {
    // Check length to avoid ReDoS on huge blobs (e.g. PDF raw uploads)
    if (val.length > 50000) {
      return { detected: false };
    }

    // 1. Prototype pollution check
    for (const pattern of PROTOTYPE_POLLUTION_PATTERNS) {
      if (pattern.test(val)) {
        return { detected: true, type: 'PROTOTYPE_POLLUTION', fragment: val.substring(0, 60) };
      }
    }

    // 2. Path traversal
    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(val)) {
        return { detected: true, type: 'PATH_TRAVERSAL', fragment: val.substring(0, 60) };
      }
    }

    // 3. Command injection
    for (const pattern of COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(val)) {
        return { detected: true, type: 'COMMAND_INJECTION', fragment: val.substring(0, 60) };
      }
    }

    // 4. SQL Injection
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(val)) {
        return { detected: true, type: 'SQL_INJECTION', fragment: val.substring(0, 60) };
      }
    }

    // 5. XSS
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(val)) {
        return { detected: true, type: 'XSS_ATTACK', fragment: val.substring(0, 60) };
      }
    }
  } else if (typeof val === 'object') {
    // Check object keys for prototype pollution
    for (const key of Object.keys(val as object)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return { detected: true, type: 'PROTOTYPE_POLLUTION', fragment: `Forbidden object key: ${key}` };
      }
      const inspectedKey = inspectValue(key, depth + 1);
      if (inspectedKey.detected) return inspectedKey;

      const inspectedProp = inspectValue((val as Record<string, unknown>)[key], depth + 1);
      if (inspectedProp.detected) return inspectedProp;
    }
  }

  return { detected: false };
}

/**
 * Enterprise Web Application Firewall (WAF) & Intrusion Prevention Middleware
 */
export function enterpriseSecurityFirewall(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const ipHashed = hashIp(ip);
  const now = Date.now();

  // 1. CHECK IP QUARANTINE (AUTO-BAN)
  const quarantine = ipQuarantineStore.get(ip);
  if (quarantine) {
    if (now < quarantine.bannedUntil) {
      const remainingSeconds = Math.ceil((quarantine.bannedUntil - now) / 1000);
      res.setHeader('Retry-After', remainingSeconds.toString());
      res.setHeader('X-Security-Action', 'IP_QUARANTINED');
      return res.status(403).json({
        error: {
          code: 'ACCESS_DENIED_SECURITY_QUARANTINE',
          message: 'Địa chỉ IP này đã bị tạm dừng kết nối do phát hiện các hành vi quét lỗ hổng hoặc can thiệp bất thường.',
          retryAfterSeconds: remainingSeconds,
          quarantineReason: quarantine.reason,
          requestId: req.requestId
        }
      });
    } else {
      // Quarantine period has expired
      ipQuarantineStore.delete(ip);
      ipThreatStore.delete(ip);
    }
  }

  // 2. CHECK MALICIOUS BOT USER-AGENT
  const userAgent = req.headers['user-agent'] || '';
  for (const botPattern of MALICIOUS_BOT_USER_AGENTS) {
    if (botPattern.test(userAgent)) {
      applySecurityPenalty(ip, 'MALICIOUS_BOT', 5, `Automated scanner detected: ${userAgent}`);
      return res.status(403).json({
        error: {
          code: 'SECURITY_SCANNER_BLOCKED',
          message: 'Yêu cầu từ công cụ quét lỗ hổng tự động đã bị chặn.',
          requestId: req.requestId
        }
      });
    }
  }

  // Skip deep body inspection for raw binary PDF upload staging (performance & accuracy)
  const isPdfUpload = req.path === '/api/pdf/prepare-download';

  // 3. DEEP PAYLOAD & PARAMETERS INSPECTION
  let threatResult = inspectValue(req.query);
  if (!threatResult.detected && req.params) {
    threatResult = inspectValue(req.params);
  }
  if (!threatResult.detected && !isPdfUpload && req.body) {
    threatResult = inspectValue(req.body);
  }

  if (threatResult.detected && threatResult.type) {
    const incidentId = `sec_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const threatRecord: SecurityThreatRecord = {
      id: incidentId,
      ipHash: ipHashed,
      threatType: threatResult.type,
      path: req.path,
      method: req.method,
      payloadFragment: threatResult.fragment || 'N/A',
      timestamp: new Date().toISOString(),
      score: 3
    };

    // Store in recent threats buffer
    recentThreats.unshift(threatRecord);
    if (recentThreats.length > MAX_RECENT_THREATS) {
      recentThreats.pop();
    }

    // Log security audit
    repository.logAudit({
      userId: req.user?.id || 'anonymous_attacker',
      action: `SECURITY_${threatResult.type}_BLOCKED`,
      resource: req.path,
      resourceId: incidentId,
      ipHash: ipHashed,
      status: 'BLOCKED',
      requestId: req.requestId
    });

    // Apply threat score and quarantine if threshold exceeded
    const isQuarantined = applySecurityPenalty(ip, threatResult.type, 3, `Attack signature: ${threatResult.type}`);

    return res.status(403).json({
      error: {
        code: 'SECURITY_VIOLATION_BLOCKED',
        message: 'Yêu cầu của bạn đã bị từ chối do chứa mẫu tấn công hoặc dữ liệu can thiệp không an toàn.',
        incidentId,
        threatType: threatResult.type,
        quarantined: isQuarantined,
        requestId: req.requestId
      }
    });
  }

  next();
}

/**
 * Apply penalty points to an IP. If points exceed limit, quarantine for 30 minutes.
 */
function applySecurityPenalty(ip: string, reason: string, points: number, detail: string): boolean {
  const now = Date.now();
  let threat = ipThreatStore.get(ip);
  if (!threat) {
    threat = { score: points, lastSeen: now, threats: [reason] };
    ipThreatStore.set(ip, threat);
  } else {
    threat.score += points;
    threat.lastSeen = now;
    threat.threats.push(reason);
  }

  // Quarantine threshold: 5 points
  if (threat.score >= 5) {
    const quarantineDuration = 30 * 60 * 1000; // 30 minutes
    ipQuarantineStore.set(ip, {
      bannedUntil: now + quarantineDuration,
      reason: detail,
      threatCount: threat.threats.length
    });
    return true;
  }

  return false;
}

/**
 * Get real-time security dashboard analytics for administrators
 */
export function getSecurityAnalytics() {
  const activeBans = Array.from(ipQuarantineStore.entries()).map(([ip, record]) => ({
    ipHash: hashIp(ip),
    bannedUntil: new Date(record.bannedUntil).toISOString(),
    remainingSeconds: Math.max(0, Math.ceil((record.bannedUntil - Date.now()) / 1000)),
    reason: record.reason,
    threatCount: record.threatCount
  }));

  const threatDistribution: Record<string, number> = {};
  recentThreats.forEach((t) => {
    threatDistribution[t.threatType] = (threatDistribution[t.threatType] || 0) + 1;
  });

  return {
    status: 'ACTIVE_ARMORED',
    firewallVersion: '3.2.0-ENTERPRISE',
    activeQuarantinedIpsCount: ipQuarantineStore.size,
    quarantinedIps: activeBans,
    totalThreatsDetected: recentThreats.length,
    threatDistribution,
    recentThreats: recentThreats.slice(0, 20)
  };
}

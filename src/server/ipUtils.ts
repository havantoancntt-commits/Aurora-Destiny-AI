// ==========================================
// AURORA DESTINY AI — UNIFIED IP NORMALIZATION & SUBNET RESOLVER
// Strict RFC 5952 IPv6 parser, /64 subnet aggregator,
// IPv4-mapped IPv6 unmapper, and anti-spoofing proxy guards.
// ==========================================

import net from 'net';
import type { Request } from 'express';

export interface ParsedIpDetails {
  raw: string;
  family: 'IPv4' | 'IPv6' | 'UNKNOWN';
  normalized: string;
  isIpv4Mapped: boolean;
  subnet64?: string;
}

/**
 * Parses and expands any valid IPv6 address into an array of 8 16-bit integers (hextets).
 * Accurately handles:
 * - Full 8-part addresses (2001:0db8:85a3:0000:0000:8a2e:0370:7334)
 * - Compressed addresses with "::" (2001:db8::1, ::1, fe80::, ::)
 * - Embedded IPv4 / IPv4-mapped notation (::ffff:192.0.2.1, 64:ff9b::192.0.2.33)
 */
export function expandIPv6ToHextets(ip: string): number[] | null {
  if (!ip || typeof ip !== 'string') return null;

  let cleaned = ip.trim().toLowerCase();

  // Strip brackets from URI host format e.g. [2001:db8::1]
  if (cleaned.startsWith('[') && cleaned.includes(']')) {
    cleaned = cleaned.slice(1, cleaned.indexOf(']'));
  }

  // Strip zone index (e.g. fe80::1%eth0)
  const zoneIndex = cleaned.indexOf('%');
  if (zoneIndex !== -1) {
    cleaned = cleaned.slice(0, zoneIndex);
  }

  // Reject triple or more colons (e.g. :::)
  if (cleaned.includes(':::')) {
    return null;
  }

  // Single leading or trailing colon is invalid (e.g. ":2001::1" or "2001::1:")
  if ((cleaned.startsWith(':') && !cleaned.startsWith('::')) ||
      (cleaned.endsWith(':') && !cleaned.endsWith('::'))) {
    return null;
  }

  // Check for embedded IPv4 dotted-quad in last segment
  let embeddedIpv4Hextets: [number, number] | null = null;
  const lastColonIndex = cleaned.lastIndexOf(':');
  if (lastColonIndex !== -1) {
    const potentialIpv4 = cleaned.slice(lastColonIndex + 1);
    if (potentialIpv4.includes('.')) {
      if (!net.isIPv4(potentialIpv4)) {
        return null; // Malformed embedded IPv4
      }
      const octets = potentialIpv4.split('.').map(o => parseInt(o, 10));
      if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) {
        return null;
      }
      const h1 = (octets[0] << 8) | octets[1];
      const h2 = (octets[2] << 8) | octets[3];
      embeddedIpv4Hextets = [h1, h2];
      cleaned = cleaned.slice(0, lastColonIndex + 1); // retains trailing colon
    }
  }

  const doubleColonCount = (cleaned.match(/::/g) || []).length;
  if (doubleColonCount > 1) {
    return null; // More than one '::' is strictly invalid per RFC 4291
  }

  let leftSegments: string[] = [];
  let rightSegments: string[] = [];

  if (doubleColonCount === 1) {
    const [left, right] = cleaned.split('::');
    leftSegments = left ? left.split(':').filter(Boolean) : [];
    rightSegments = right ? right.split(':').filter(Boolean) : [];
  } else {
    leftSegments = cleaned.split(':').filter(Boolean);
  }

  const embeddedCount = embeddedIpv4Hextets ? 2 : 0;
  const explicitCount = leftSegments.length + rightSegments.length + embeddedCount;

  if (doubleColonCount === 0 && explicitCount !== 8) {
    return null;
  }
  if (doubleColonCount === 1 && explicitCount > 8) {
    return null;
  }

  const missingZerosCount = doubleColonCount === 1 ? 8 - explicitCount : 0;
  const result: number[] = [];

  for (const seg of leftSegments) {
    const val = parseInt(seg, 16);
    if (isNaN(val) || val < 0 || val > 0xffff || seg.length > 4) {
      return null;
    }
    result.push(val);
  }

  for (let i = 0; i < missingZerosCount; i++) {
    result.push(0);
  }

  for (const seg of rightSegments) {
    const val = parseInt(seg, 16);
    if (isNaN(val) || val < 0 || val > 0xffff || seg.length > 4) {
      return null;
    }
    result.push(val);
  }

  if (embeddedIpv4Hextets) {
    result.push(embeddedIpv4Hextets[0], embeddedIpv4Hextets[1]);
  }

  if (result.length !== 8) {
    return null;
  }

  return result;
}

/**
 * Normalizes an arbitrary IP address string:
 * - IPv4: returns standard trimmed dotted-quad (e.g. "192.168.1.1").
 * - IPv4-mapped IPv6: unmaps to canonical IPv4 (e.g. "::ffff:192.0.2.1" -> "192.0.2.1").
 * - IPv6: parses full/compressed address and groups by upper 64-bit prefix:
 *   "h0:h1:h2:h3::/64" (e.g. "2001:db8:85a3:0::/64").
 * - Invalid or unknown: returns safe fallback "unknown".
 */
export function normalizeIp(rawInput: string | undefined | null): string {
  if (!rawInput || typeof rawInput !== 'string') {
    return 'unknown';
  }

  let str = rawInput.trim();

  // Strip brackets from IPv6 URL formatting [2001:db8::1]:8080
  if (str.startsWith('[')) {
    const endBracket = str.indexOf(']');
    if (endBracket !== -1) {
      str = str.slice(1, endBracket);
    }
  } else if (str.includes('.') && str.includes(':') && !str.includes('::') && str.indexOf(':') === str.lastIndexOf(':')) {
    // IPv4 with port e.g. "192.168.1.1:8080"
    str = str.slice(0, str.indexOf(':'));
  }

  // Quick check for IPv4
  if (net.isIPv4(str)) {
    return str;
  }

  // Fast-path prefix check for standard ::ffff:w.x.y.z
  if (str.toLowerCase().startsWith('::ffff:')) {
    const suffix = str.slice(7);
    if (net.isIPv4(suffix)) {
      return suffix;
    }
  }

  // Parse as IPv6
  const hextets = expandIPv6ToHextets(str);
  if (!hextets) {
    return 'unknown';
  }

  // Check if it is IPv4-mapped IPv6 (::ffff:0:0/96 or ::ffff:w.x.y.z)
  const isIpv4Mapped =
    hextets[0] === 0 &&
    hextets[1] === 0 &&
    hextets[2] === 0 &&
    hextets[3] === 0 &&
    hextets[4] === 0 &&
    hextets[5] === 0xffff;

  if (isIpv4Mapped) {
    const o1 = (hextets[6] >> 8) & 0xff;
    const o2 = hextets[6] & 0xff;
    const o3 = (hextets[7] >> 8) & 0xff;
    const o4 = hextets[7] & 0xff;
    return `${o1}.${o2}.${o3}.${o4}`;
  }

  // Valid native IPv6 -> Group under canonical /64 prefix (upper 64 bits = first 4 hextets)
  const h0 = hextets[0].toString(16);
  const h1 = hextets[1].toString(16);
  const h2 = hextets[2].toString(16);
  const h3 = hextets[3].toString(16);

  return `${h0}:${h1}:${h2}:${h3}::/64`;
}

/**
 * Safely extracts client IP address from Express Request.
 * Respects Express application 'trust proxy' configuration:
 * - When trust proxy is active: Express safely resolves req.ip using reverse proxy rules.
 * - When trust proxy is disabled: req.ip falls back to direct connection socket address.
 * Never blindly parses client-controlled X-Forwarded-For headers directly.
 */
export function getClientIp(req: Request): string {
  if (!req) return '127.0.0.1';

  // Express automatically resolves trusted reverse-proxy chain via req.ip
  // only when 'trust proxy' is configured on the app.
  if (req.ip && typeof req.ip === 'string') {
    return req.ip;
  }

  if (req.socket?.remoteAddress && typeof req.socket.remoteAddress === 'string') {
    return req.socket.remoteAddress;
  }

  return '127.0.0.1';
}

/**
 * Extracts and normalizes client IP for security firewalls, WAF, rate limiters,
 * and anti-scraping sweepers.
 */
export function normalizeClientIp(req: Request): string {
  const rawIp = getClientIp(req);
  return normalizeIp(rawIp);
}

// ==========================================
// AURORA DESTINY AI — IP NORMALIZATION, RFC 5952 /64 SUBNETS & SPOOF DEFENSE
// Direct unit tests for ipUtils and integration tests for firewall, rate limiter, anti-scraping
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import { normalizeIp, expandIPv6ToHextets, getClientIp, normalizeClientIp } from '../src/server/ipUtils';
import { createRateLimiter, setRateLimitStore } from '../src/server/rateLimiter';
import { enterpriseSecurityFirewall } from '../src/server/securityFirewall';

test('🔒 IP Normalization & /64 Subnet Aggregation Suite', async (t) => {
  await t.test('1. IPv4 standard addresses remain unaltered', () => {
    assert.strictEqual(normalizeIp('203.0.113.195'), '203.0.113.195');
    assert.strictEqual(normalizeIp('  192.168.1.1  '), '192.168.1.1');
    assert.strictEqual(normalizeIp('10.0.0.1:8080'), '10.0.0.1');
  });

  await t.test('2. IPv4-mapped IPv6 notation is unmapped to canonical IPv4', () => {
    // Dotted-quad notation
    assert.strictEqual(normalizeIp('::ffff:203.0.113.195'), '203.0.113.195');
    assert.strictEqual(normalizeIp('::ffff:192.168.1.1'), '192.168.1.1');
    // Hexadecimal notation: 192.0.2.1 -> 0xc000:0x0201
    assert.strictEqual(normalizeIp('::ffff:c000:0201'), '192.0.2.1');
    assert.strictEqual(normalizeIp('::ffff:cb00:71c3'), '203.0.113.195');
  });

  await t.test('3. Full 8-part IPv6 expands and aggregates under /64 subnet', () => {
    const ip = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    assert.strictEqual(normalizeIp(ip), '2001:db8:85a3:0::/64');
  });

  await t.test('4. Compressed IPv6 with "::" correctly expands all missing zeros', () => {
    // 2001:db8::1 has 6 zero hextets between db8 and 1
    assert.strictEqual(normalizeIp('2001:db8::1'), '2001:db8:0:0::/64');
    assert.strictEqual(normalizeIp('2001:db8:85a3::1'), '2001:db8:85a3:0::/64');
    // IPv6 Loopback ::1
    assert.strictEqual(normalizeIp('::1'), '0:0:0:0::/64');
    // All zeros ::
    assert.strictEqual(normalizeIp('::'), '0:0:0:0::/64');
  });

  await t.test('5. Two addresses in the SAME /64 subnet collapse to identical normalized key', () => {
    // Both addresses belong to 2001:0db8:abcd:0012::/64
    const ipA = '2001:0db8:abcd:0012:0000:0000:0000:0001';
    const ipB = '2001:db8:abcd:12::ffff';
    const ipC = '2001:db8:abcd:12:dead:beef:cafe:babe';

    const normA = normalizeIp(ipA);
    const normB = normalizeIp(ipB);
    const normC = normalizeIp(ipC);

    assert.strictEqual(normA, '2001:db8:abcd:12::/64');
    assert.strictEqual(normA, normB);
    assert.strictEqual(normB, normC);
  });

  await t.test('6. Two addresses in DIFFERENT /64 subnets produce distinct keys', () => {
    const ipSubnet1 = '2001:db8:abcd:1::1';
    const ipSubnet2 = '2001:db8:abcd:2::1';

    const norm1 = normalizeIp(ipSubnet1);
    const norm2 = normalizeIp(ipSubnet2);

    assert.notStrictEqual(norm1, norm2);
    assert.strictEqual(norm1, '2001:db8:abcd:1::/64');
    assert.strictEqual(norm2, '2001:db8:abcd:2::/64');
  });

  await t.test('7. Malformed and invalid IP inputs return safe "unknown" without throwing', () => {
    assert.strictEqual(normalizeIp('not-an-ip'), 'unknown');
    assert.strictEqual(normalizeIp('999.999.999.999'), 'unknown');
    assert.strictEqual(normalizeIp('2001:::1'), 'unknown'); // multiple '::' invalid
    assert.strictEqual(normalizeIp(''), 'unknown');
    assert.strictEqual(normalizeIp(undefined), 'unknown');
    assert.strictEqual(normalizeIp(null), 'unknown');
  });

  await t.test('8. Anti-spoofing: Untrusted client headers are ignored when trust proxy is off', () => {
    const reqWithoutTrust: any = {
      ip: '198.51.100.25',
      socket: { remoteAddress: '198.51.100.25' },
      headers: {
        'x-forwarded-for': '203.0.113.99, 10.0.0.1',
        'x-real-ip': '203.0.113.99'
      }
    };

    const resolved = getClientIp(reqWithoutTrust);
    assert.strictEqual(resolved, '198.51.100.25', 'Must use req.ip resolved by server, not header spoof');
  });

  await t.test('9. Rate limiter integration: Collapses /64 requests into shared token bucket', async () => {
    const limiter = createRateLimiter({
      keyPrefix: 'test_integration_ipv6',
      windowMs: 60000,
      maxRequests: 5,
      message: 'Rate limit exceeded'
    });

    let recordedKey = '';
    const mockStore = {
      increment: async (key: string) => {
        recordedKey = key;
        return { count: 1, resetAt: Date.now() + 60000 };
      },
      reset: async () => {}
    };
    setRateLimitStore(mockStore as any);

    const req1: any = { ip: '2001:db8:1234:5678::1' };
    const res: any = { setHeader: () => {}, status: () => ({ json: () => {} }) };
    await limiter(req1, res, () => {});
    const key1 = recordedKey;

    const req2: any = { ip: '2001:db8:1234:5678:9abc:def0:1234:5678' };
    await limiter(req2, res, () => {});
    const key2 = recordedKey;

    assert.strictEqual(key1, key2, 'Both IPs in 2001:db8:1234:5678::/64 share identical rate limit bucket');
  });
});

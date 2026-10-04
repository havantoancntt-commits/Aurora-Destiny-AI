// ==========================================
// AURORA DESTINY AI — DISTRIBUTED RATE LIMITER
// Sliding-window protection for Auth, AI, Calculations & Admin APIs
// Supports Redis distributed backend with atomic sliding-window / TTL,
// with safe local fallback for development/ephemeral testing.
// ==========================================

import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyPrefix: string;
  isSensitiveEndpoint?: boolean;
}

export interface RateLimitResult {
  count: number;
  resetAt: number;
}

export interface IRateLimitStore {
  increment(key: string, windowMs: number, isSensitive?: boolean): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}

export class MemoryRateLimitStore implements IRateLimitStore {
  private store = new Map<string, number[]>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [k, timestamps] of this.store.entries()) {
        const valid = timestamps.filter(t => now - t < 3600 * 1000);
        if (valid.length === 0) {
          this.store.delete(k);
        } else {
          this.store.set(k, valid);
        }
      }
    }, 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  async increment(key: string, windowMs: number, isSensitive?: boolean): Promise<RateLimitResult> {
    if (
      process.env.NODE_ENV === 'production' &&
      (process.env.RATE_LIMIT_FAIL_CLOSED === 'true' || isSensitive) &&
      process.env.ALLOW_MEMORY_RATE_LIMITER_IN_PRODUCTION !== 'true'
    ) {
      throw new Error('Rate limiter service temporarily unavailable (distributed fail-closed policy active).');
    }

    const now = Date.now();
    const existing = this.store.get(key) || [];
    const valid = existing.filter(t => now - t < windowMs);
    valid.push(now);
    this.store.set(key, valid);

    const oldest = valid[0];
    const resetAt = oldest + windowMs;
    return { count: valid.length, resetAt };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export class RedisRateLimitStore implements IRateLimitStore {
  private client: Redis;
  private localFallback: MemoryRateLimitStore;
  private isConnected: boolean = false;

  constructor(redisUrlOrClient: string | Redis) {
    this.localFallback = new MemoryRateLimitStore();
    if (typeof redisUrlOrClient === 'string') {
      this.client = new Redis(redisUrlOrClient, {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        retryStrategy: () => null
      });
      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ [RateLimiter] Connected to distributed Redis rate-limiting backend.');
      });
      this.client.on('error', (err) => {
        this.isConnected = false;
        console.warn('⚠️ [RateLimiter] Redis connection warning, using resilient fallback:', err.message);
      });
      this.client.connect().catch((err) => {
        console.warn('⚠️ [RateLimiter] Redis initial connection failed:', err.message);
      });
    } else {
      this.client = redisUrlOrClient;
      this.isConnected = true;
    }
  }

  async increment(key: string, windowMs: number, isSensitive = false): Promise<RateLimitResult> {
    if (!this.isConnected) {
      const mustFailClosed =
        process.env.RATE_LIMIT_FAIL_CLOSED === 'true' ||
        (process.env.NODE_ENV === 'production' && (process.env.REDIS_REQUIRED_IN_PRODUCTION === 'true' || isSensitive));
      if (mustFailClosed) {
        throw new Error('Rate limiter service temporarily unavailable (distributed fail-closed policy active).');
      }
      return this.localFallback.increment(key, windowMs, isSensitive);
    }

    try {
      const now = Date.now();
      const redisKey = `ratelimit_sw:${key}`;
      
      // True Sliding Window Atomic Lua Script using Sorted Sets
      const luaScript = `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local clearBefore = now - window

        redis.call('ZREMRANGEBYSCORE', key, '-inf', clearBefore)
        local seq = redis.call('INCR', key .. ':seq')
        redis.call('ZADD', key, now, now .. ':' .. seq)
        local count = redis.call('ZCARD', key)
        redis.call('PEXPIRE', key, math.ceil(window))
        redis.call('PEXPIRE', key .. ':seq', math.ceil(window))

        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local resetAt = now + window
        if oldest and #oldest >= 2 then
          resetAt = tonumber(oldest[2]) + window
        end
        return {count, resetAt}
      `;

      const result = await this.client.eval(luaScript, 1, redisKey, now.toString(), windowMs.toString()) as [number, number];
      const count = Number(result[0]);
      const resetAt = Number(result[1]);

      return { count, resetAt };
    } catch (err: any) {
      console.warn('⚠️ [RateLimiter] Redis command failed:', err.message);
      const mustFailClosed =
        process.env.RATE_LIMIT_FAIL_CLOSED === 'true' ||
        (process.env.NODE_ENV === 'production' && (process.env.REDIS_REQUIRED_IN_PRODUCTION === 'true' || isSensitive));
      if (mustFailClosed) {
        throw new Error('Rate limiter service temporarily unavailable (distributed fail-closed policy active).');
      }
      return this.localFallback.increment(key, windowMs, isSensitive);
    }
  }

  async reset(key: string): Promise<void> {
    try {
      if (this.isConnected) {
        const redisKey = `ratelimit_sw:${key}`;
        await this.client.del(redisKey, `${redisKey}:seq`, `ratelimit:${key}`);
      }
    } catch {
      // ignore
    }
    await this.localFallback.reset(key);
  }
}

// Global active store selection
let activeStore: IRateLimitStore;
const rawRateLimitRedis = process.env.REDIS_URL;
const isRateLimitRedisConfigured = typeof rawRateLimitRedis === 'string' &&
  (rawRateLimitRedis.startsWith('redis://') || rawRateLimitRedis.startsWith('rediss://')) &&
  !rawRateLimitRedis.toLowerCase().includes('none');

if (isRateLimitRedisConfigured) {
  activeStore = new RedisRateLimitStore(rawRateLimitRedis);
} else {
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_REQUIRED_IN_PRODUCTION === 'true') {
    throw new Error('FATAL: REDIS_URL is strictly required in production when REDIS_REQUIRED_IN_PRODUCTION=true.');
  }
  activeStore = new MemoryRateLimitStore();
}

export function setRateLimitStore(store: IRateLimitStore): void {
  activeStore = store;
}

export function getRateLimitStore(): IRateLimitStore {
  return activeStore;
}

export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
      let rawIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (rawIp.startsWith('::ffff:')) {
        rawIp = rawIp.slice(7);
      }
      let normalizedIp = rawIp;
      if (rawIp.includes(':')) {
        const parts = rawIp.split(':');
        normalizedIp = parts.slice(0, 4).join(':') + '::/64';
      }

      const userId = req.user?.id;
      // For user-based actions, key on user ID if authenticated, else normalized IP
      const identifier = userId ? `u_${userId}` : `ip_${normalizedIp}`;
      const key = `${config.keyPrefix}:${identifier}`;

      const now = Date.now();
      const record = await activeStore.increment(key, config.windowMs, config.isSensitiveEndpoint);

      const remaining = Math.max(0, config.maxRequests - record.count);
      const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

      res.setHeader('RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('RateLimit-Remaining', remaining.toString());
      res.setHeader('RateLimit-Reset', resetSeconds.toString());

      if (record.count > config.maxRequests) {
        res.setHeader('Retry-After', resetSeconds.toString());
        return res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: config.message,
            retryAfterSeconds: resetSeconds,
            requestId: req.requestId
          }
        });
      }

      next();
    } catch (err: any) {
      if (err.message && err.message.includes('fail-closed policy active')) {
        return res.status(503).json({
          error: {
            code: 'RATE_LIMITER_FAIL_CLOSED',
            message: 'Dịch vụ kiểm soát tần suất tạm thời không khả dụng theo chính sách bảo vệ phân tán (fail-closed).',
            requestId: req.requestId
          }
        });
      }
      next(err);
    }
  };
}

// 1. Auth Rate Limiters (Brute force defense - Sensitive endpoints)
export const loginRateLimiter = createRateLimiter({
  keyPrefix: 'rl_login',
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.',
  isSensitiveEndpoint: true
});

export const registerRateLimiter = createRateLimiter({
  keyPrefix: 'rl_register',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  message: 'Giới hạn tạo tài khoản tối đa 5 lần mỗi giờ.',
  isSensitiveEndpoint: true
});

export const guestRateLimiter = createRateLimiter({
  keyPrefix: 'rl_guest',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Giới hạn tạo phiên khách tạm thời đạt mức tối đa. Vui lòng thử lại sau.'
});

// 2. AI Chat & Scenario Rate Limiters (Sensitive LLM endpoints)
export const aiChatRateLimiter = createRateLimiter({
  keyPrefix: 'rl_ai_chat',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 15,
  message: 'Tần suất gửi tin nhắn AI vượt quá mức cho phép (tối đa 15 tin nhắn/phút).',
  isSensitiveEndpoint: true
});

export const scenarioRateLimiter = createRateLimiter({
  keyPrefix: 'rl_scenario',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 15,
  message: 'Tần suất mô phỏng kịch bản vượt quá giới hạn (tối đa 15 kịch bản/phút).',
  isSensitiveEndpoint: true
});

// 3. Calculation Engine Rate Limiter (Core deterministic engine)
export const calculationRateLimiter = createRateLimiter({
  keyPrefix: 'rl_calc',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 25,
  message: 'Tần suất tính toán lá số vượt quá giới hạn cho phép.',
  isSensitiveEndpoint: true
});

// 4. Admin API Rate Limiter
export const adminRateLimiter = createRateLimiter({
  keyPrefix: 'rl_admin',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  message: 'Tần suất truy vấn quản trị viên vượt quá giới hạn (tối đa 60 yêu cầu/phút).'
});

// 5. PDF Staging & Download Rate Limiter
export const pdfRateLimiter = createRateLimiter({
  keyPrefix: 'rl_pdf',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 15,
  message: 'Tần suất xử lý hoặc tải tệp PDF vượt quá giới hạn cho phép (tối đa 15 yêu cầu/phút).'
});

// 6. Webhook Rate Limiter (Sensitive payment gateway ingestion)
export const webhookRateLimiter = createRateLimiter({
  keyPrefix: 'rl_webhook',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  message: 'Tần suất gửi webhook vượt quá giới hạn an toàn.',
  isSensitiveEndpoint: true
});


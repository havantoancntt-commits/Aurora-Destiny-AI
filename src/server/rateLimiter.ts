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
}

export interface RateLimitResult {
  count: number;
  resetAt: number;
}

export interface IRateLimitStore {
  increment(key: string, windowMs: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}

export class MemoryRateLimitStore implements IRateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [k, v] of this.store.entries()) {
        if (now > v.resetAt) {
          this.store.delete(k);
        }
      }
    }, 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  async increment(key: string, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    let record = this.store.get(key);
    if (!record || now > record.resetAt) {
      record = {
        count: 1,
        resetAt: now + windowMs
      };
      this.store.set(key, record);
    } else {
      record.count += 1;
    }
    return { count: record.count, resetAt: record.resetAt };
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
        connectTimeout: 3000
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

  async increment(key: string, windowMs: number): Promise<RateLimitResult> {
    if (!this.isConnected) {
      return this.localFallback.increment(key, windowMs);
    }

    try {
      const now = Date.now();
      const redisKey = `ratelimit:${key}`;
      
      // Atomic Lua script: Increment and set TTL if new key
      const luaScript = `
        local current = redis.call('INCR', KEYS[1])
        if current == 1 then
          redis.call('PEXPIRE', KEYS[1], ARGV[1])
        end
        local ttl = redis.call('PTTL', KEYS[1])
        return {current, ttl}
      `;

      const result = await this.client.eval(luaScript, 1, redisKey, windowMs.toString()) as [number, number];
      const count = result[0];
      const ttl = result[1] > 0 ? result[1] : windowMs;
      const resetAt = now + ttl;

      return { count, resetAt };
    } catch (err: any) {
      console.warn('⚠️ [RateLimiter] Redis command failed, falling back to in-memory window:', err.message);
      return this.localFallback.increment(key, windowMs);
    }
  }

  async reset(key: string): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.del(`ratelimit:${key}`);
      }
    } catch {
      // ignore
    }
    await this.localFallback.reset(key);
  }
}

// Global active store selection
let activeStore: IRateLimitStore;
if (process.env.REDIS_URL) {
  activeStore = new RedisRateLimitStore(process.env.REDIS_URL);
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
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userId = req.user?.id;
      // For user-based actions, key on user ID if authenticated, else IP
      const identifier = userId ? `u_${userId}` : `ip_${ip}`;
      const key = `${config.keyPrefix}:${identifier}`;

      const now = Date.now();
      const record = await activeStore.increment(key, config.windowMs);

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
    } catch (err) {
      next(err);
    }
  };
}

// 1. Auth Rate Limiters (Brute force defense)
export const loginRateLimiter = createRateLimiter({
  keyPrefix: 'rl_login',
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.'
});

export const registerRateLimiter = createRateLimiter({
  keyPrefix: 'rl_register',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  message: 'Giới hạn tạo tài khoản tối đa 5 lần mỗi giờ.'
});

export const guestRateLimiter = createRateLimiter({
  keyPrefix: 'rl_guest',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Giới hạn tạo phiên khách tạm thời đạt mức tối đa. Vui lòng thử lại sau.'
});

// 2. AI Chat & Scenario Rate Limiters
export const aiChatRateLimiter = createRateLimiter({
  keyPrefix: 'rl_ai_chat',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 15,
  message: 'Tần suất gửi tin nhắn AI vượt quá mức cho phép (tối đa 15 tin nhắn/phút).'
});

export const scenarioRateLimiter = createRateLimiter({
  keyPrefix: 'rl_scenario',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 15,
  message: 'Tần suất mô phỏng kịch bản vượt quá giới hạn (tối đa 15 kịch bản/phút).'
});

// 3. Calculation Engine Rate Limiter
export const calculationRateLimiter = createRateLimiter({
  keyPrefix: 'rl_calc',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 25,
  message: 'Tần suất tính toán lá số vượt quá giới hạn cho phép.'
});

// 4. Admin API Rate Limiter
export const adminRateLimiter = createRateLimiter({
  keyPrefix: 'rl_admin',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  message: 'Tần suất truy vấn quản trị viên vượt quá giới hạn (tối đa 60 yêu cầu/phút).'
});

// ==========================================
// AURORA DESTINY AI — MULTI-TIER RATE LIMITER
// Sliding-window protection for Auth, AI, Calculations & Admin APIs
// ==========================================

import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyPrefix: string;
}

interface WindowRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, WindowRecord>();

// Clean up expired buckets periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userId = req.user?.id;
    // For user-based actions, key on user ID if authenticated, else IP
    const identifier = userId ? `u_${userId}` : `ip_${ip}`;
    const key = `${config.keyPrefix}:${identifier}`;

    const now = Date.now();
    let record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      record = {
        count: 1,
        resetAt: now + config.windowMs
      };
      rateLimitStore.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, config.maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

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

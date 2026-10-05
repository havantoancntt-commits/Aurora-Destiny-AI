// ==========================================
// AURORA DESTINY AI — PRODUCTION FULL-STACK SERVER
// Hardened Architecture, Security, Durability & Deterministic Integrity
// ==========================================

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { ZodError } from 'zod';

const currentDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

import { repository } from './src/db/repository';
import {
  authMiddleware,
  requireAuth,
  requireAdmin,
  verifyProfileOwnershipAsync,
  registerUserAsync,
  loginUserAsync,
  createGuestSessionAsync,
  revokeSessionAsync,
  rotateRefreshTokenAsync,
  AuthResult,
  requestPasswordResetAsync,
  resetPasswordWithTokenAsync,
  bootstrapAdminIfConfiguredAsync
} from './src/server/auth';
import {
  loginRateLimiter,
  registerRateLimiter,
  guestRateLimiter,
  aiChatRateLimiter,
  scenarioRateLimiter,
  calculationRateLimiter,
  adminRateLimiter,
  pdfRateLimiter,
  webhookRateLimiter
} from './src/server/rateLimiter';
import {
  ProfileCreateSchema,
  ProfileUpdateSchema,
  HistoricalEventSchema,
  AiChatSchema,
  ScenarioEvaluateSchema,
  UserPreferencesSchema,
  FeatureFlagToggleSchema,
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  PatronCreateSchema,
  PaymentWebhookSchema
} from './src/schemas/validationSchemas';
import {
  createStorageProvider,
  getStorageProvider,
  setStorageProvider,
  generateSignedDownloadToken,
  verifySignedDownloadToken
} from './src/server/storageProvider';

import { runFullDestinyCalculation, CALCULATION_ENGINE_VERSION, ASTROLOGY_RULES_VERSION, ANALYSIS_MODEL_VERSION } from './src/engine/destinyEngine';
import { getDefaultAnalysisYear } from './src/engine/canonicalInput';
import { runBacktestAnalysis } from './src/engine/backtesting';
import { evaluateWhatIfScenario } from './src/engine/scenarios';
import { generateMultiAgentEnsemble, computeDailyDestiny } from './src/services/aiSynthesizer';
import { generateDestinyChatResponse, isCircuitBreakerOpen } from './src/services/geminiService';
import { DestinyAiPipeline } from './src/services/aiPipeline';
import { UserProfile, UserAccount } from './src/types/user';
import { enterpriseSecurityFirewall, getSecurityAnalytics } from './src/server/securityFirewall';
import {
  generateAlgorithmSignature,
  verifyAlgorithmSignature,
  antiScrapingSweeperMiddleware
} from './src/server/algorithmProtection';
import { telemetry } from './src/telemetry/telemetryService';
import { getCacheStatus } from './src/server/distributedCache';

// Extend Express Request type with type-safe properties
declare global {
  namespace Express {
    interface Request {
      cookies?: Record<string, string>;
      sessionToken?: string;
      requestId?: string;
      user?: UserAccount;
    }
  }
}

export class AppError extends Error {
  code: string;
  statusCode: number;
  constructor(message: string, code: string = 'BAD_REQUEST', statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Trust reverse proxy configurable by environment (defaults to 1 hop behind Cloud Run/Nginx)
const trustProxySetting = process.env.TRUST_PROXY
  ? (process.env.TRUST_PROXY === 'true' ? 'loopback, linklocal, uniquelocal' : (!isNaN(Number(process.env.TRUST_PROXY)) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY))
  : (process.env.NODE_ENV === 'production' ? 1 : 'loopback');
app.set('trust proxy', trustProxySetting);

// Request tracing: generate and bind unique request ID at the absolute start of request lifecycle
app.use((req: Request, res: Response, next: NextFunction) => {
  const incomingId = req.headers['x-request-id'];
  const validIncoming = typeof incomingId === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(incomingId);
  const reqId = validIncoming ? incomingId : `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  req.requestId = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
});

// Dedicated raw body parser for payment webhooks BEFORE global json parser
// Preserves authentic wire bytes for HMAC-SHA256 signature verification without double parsing
app.use('/api/patrons/webhook', express.raw({ type: '*/*', limit: '64kb' }));

// Security: parse JSON with strict size limit and retain rawBody buffer for cryptographic webhook verification
app.use(express.json({
  limit: '2mb',
  verify: (req: any, _res: any, buf: Buffer) => {
    req.rawBody = buf;
  }
}));

// Robust native cookie parser with defensive validation & malformed URI handling
app.use((req: Request, res: Response, next: NextFunction) => {
  req.cookies = {};
  if (req.headers.cookie) {
    // Defense against oversized Cookie header (max 8KB)
    if (req.headers.cookie.length > 8192) {
      return next();
    }
    const cookiePairs = req.headers.cookie.split(';');
    for (const cookieStr of cookiePairs) {
      const equalIndex = cookieStr.indexOf('=');
      if (equalIndex > 0) {
        const rawKey = cookieStr.slice(0, equalIndex).trim();
        const rawVal = cookieStr.slice(equalIndex + 1).trim();
        // Prevent prototype pollution or malicious property injection
        if (rawKey && rawKey !== '__proto__' && rawKey !== 'constructor' && rawKey !== 'prototype') {
          try {
            // First cookie occurrence takes precedence if duplicates exist
            if (req.cookies[rawKey] === undefined) {
              req.cookies[rawKey] = decodeURIComponent(rawVal);
            }
          } catch {
            // Safe fallback if decodeURIComponent throws on malformed percent encoding
            if (req.cookies[rawKey] === undefined) {
              req.cookies[rawKey] = rawVal;
            }
          }
        }
      }
    }
  }
  next();
});

// Helper for strict origin matching (Section XIX CSRF Specification)
export function isOriginAllowed(originHeader: string | undefined, hostHeader: string | undefined): boolean {
  if (!originHeader) return false;
  try {
    const originUrl = new URL(originHeader);
    const originStr = originUrl.origin;
    const isProd = process.env.NODE_ENV === 'production';

    // 1. Exact match against configured ALLOWED_ORIGINS (comma-separated list)
    const configuredOrigins = process.env.ALLOWED_ORIGINS;
    if (configuredOrigins) {
      const allowedList = configuredOrigins.split(',').map(s => s.trim()).filter(Boolean);
      if (allowedList.includes(originStr)) {
        return true;
      }
    }

    // 2. Same-origin match against current Host header
    if (hostHeader) {
      const cleanHost = hostHeader.trim();
      if (originUrl.host === cleanHost) {
        return true;
      }
    }

    // In production: reject any origin not explicitly allowlisted (no wildcards)
    if (isProd) {
      return false;
    }

    // In development / test environment only:
    if (
      originUrl.hostname === 'localhost' ||
      originUrl.hostname === '127.0.0.1' ||
      originStr === 'https://aistudio.google.com' ||
      originStr === 'https://ai.studio'
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// CSRF Defense for Cookie-authenticated state-changing requests
app.use((req: Request, res: Response, next: NextFunction) => {
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
  if (isMutating) {
    // When request carries explicit authentication headers (Authorization / x-session-token),
    // it cannot be forged by ambient cross-site requests (CSRF is not applicable)
    const hasExplicitAuthHeader = Boolean(
      req.headers.authorization ||
      req.headers['x-session-token'] ||
      req.headers['x-aurora-token']
    );
    if (hasExplicitAuthHeader) {
      return next();
    }

    const hasSessionCookie = Boolean(req.cookies && req.cookies['aurora_session']);
    
    // When relying on ambient browser cookie for authorization, verify origin/referrer
    if (hasSessionCookie) {
      let originHeader = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
      if (!originHeader && typeof req.headers.referer === 'string') {
        try {
          originHeader = new URL(req.headers.referer).origin;
        } catch {
          originHeader = undefined;
        }
      }
      const host = req.headers.host;

      if (!originHeader || !isOriginAllowed(originHeader, host)) {
        return res.status(403).json({
          error: {
            code: 'CSRF_ORIGIN_REJECTED',
            message: 'Yêu cầu bị từ chối do vi phạm quy tắc xác thực nguồn gốc (CSRF protection)',
            requestId: req.requestId
          }
        });
      }
    }
  }
  next();
});

// Enforce strict no-cache on all /api endpoints to prevent caching sensitive user data
app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Helper functions for secure HttpOnly cookie management
function setSessionCookie(res: Response, token: string): void {
  const req = (res as any).req as Request | undefined;
  const isHttps = Boolean(
    process.env.NODE_ENV === 'production' ||
    req?.secure ||
    req?.headers?.['x-forwarded-proto'] === 'https' ||
    req?.headers?.['x-forwarded-ssl'] === 'on' ||
    Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB)
  );
  res.cookie('aurora_session', token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax', // 'none' + secure enables iframe embedding in HTTPS/Cloud Run environments
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

function clearSessionCookie(res: Response): void {
  const req = (res as any).req as Request | undefined;
  const isHttps = Boolean(
    process.env.NODE_ENV === 'production' ||
    req?.secure ||
    req?.headers?.['x-forwarded-proto'] === 'https' ||
    req?.headers?.['x-forwarded-ssl'] === 'on' ||
    Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB)
  );
  res.clearCookie('aurora_session', {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/'
  });
}

// ----------------------------------------------------
// MIDDLEWARE: HARDENED SECURITY HEADERS
// ----------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content Security Policy - hardened for production while permitting development and AI Studio preview
  const isProd = process.env.NODE_ENV === 'production';
  const cspPolicy = isProd
    ? [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'self' https://aistudio.google.com https://ai.studio"
      ].join('; ')
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' ws: wss: https:",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'self' https://aistudio.google.com https://ai.studio"
      ].join('; ');

  res.setHeader('Content-Security-Policy', cspPolicy);

  const reqStart = Date.now();
  res.on('finish', () => {
    telemetry.recordHttpRequest(Date.now() - reqStart, res.statusCode >= 500);
  });

  next();
});

// ENTERPRISE HARDENED WAF & INTRUSION PREVENTION SHIELD
// Stops SQLi, NoSQL/Prototype Pollution, XSS, Path Traversal, and Scanners
app.use(enterpriseSecurityFirewall);

// Authentication middleware extracts user from bearer token or x-session-token
app.use(authMiddleware);

// ----------------------------------------------------
// 1. HEALTH & OBSERVABILITY (LIVENESS, READINESS & DIAGNOSTICS)
// ----------------------------------------------------
app.get('/api/health', async (req, res) => {
  const integrity = await repository.verifyDatabaseIntegrity();
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const circuitOpen = isCircuitBreakerOpen();

  const isHealthy = integrity.valid;
  const status = isHealthy ? (hasGeminiKey && !circuitOpen ? 'ok' : 'degraded') : 'error';
  const metrics = await repository.getMetrics();

  res.status(isHealthy ? 200 : 503).json({
    status,
    app: 'Aurora Destiny AI',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    checks: {
      application: { status: 'pass' },
      database: {
        status: integrity.valid ? 'pass' : 'fail',
        storageMode: metrics.storageMode || (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgresql://') || process.env.DATABASE_URL.startsWith('postgres://')) && !process.env.DATABASE_URL.toLowerCase().includes('none') ? 'postgresql_production_adapter' : 'durable_atomic_file_adapter'),
        integrityErrors: integrity.errors
      },
      ai: {
        status: hasGeminiKey ? (circuitOpen ? 'circuit_open_fallback_active' : 'pass') : 'unconfigured_deterministic_fallback_active',
        provider: 'google_genai'
      },
      configuration: { status: 'pass' }
    },
    engine: {
      calculationVersion: CALCULATION_ENGINE_VERSION,
      astrologyRulesVersion: ASTROLOGY_RULES_VERSION,
      analysisModelVersion: ANALYSIS_MODEL_VERSION
    }
  });
});

app.get(['/health', '/api/health/live'], (req, res) => {
  res.status(200).json({ status: 'healthy', process: 'alive', uptimeSeconds: Math.floor(process.uptime()) });
});

app.get(['/ready', '/api/health/ready'], async (req, res) => {
  const integrity = await repository.verifyDatabaseIntegrity();
  if (integrity.valid) {
    res.status(200).json({ status: 'ready', database: 'connected' });
  } else {
    res.status(503).json({ status: 'unavailable', reason: 'DATABASE_INTEGRITY_FAILED', errors: integrity.errors });
  }
});

app.get(['/health/database', '/api/health/database'], async (req, res) => {
  const integrity = await repository.verifyDatabaseIntegrity();
  const metrics = await repository.getMetrics();
  const isHealthy = integrity.valid;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    storageMode: metrics.storageMode || (process.env.DATABASE_URL && !process.env.DATABASE_URL.toLowerCase().includes('none') ? 'postgresql' : 'atomic_file'),
    errorCount: integrity.errors.length,
    errors: integrity.errors,
    latencyMs: metrics.dbLatencyMs || 0
  });
});

app.get(['/health/ai', '/api/health/ai'], (req, res) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const circuitOpen = isCircuitBreakerOpen();
  
  let status: 'healthy' | 'degraded' = 'healthy';
  let message = 'AI Provider online';
  if (!hasGeminiKey) {
    status = 'degraded';
    message = 'Deterministic fallback engine active (GEMINI_API_KEY unconfigured)';
  } else if (circuitOpen) {
    status = 'degraded';
    message = 'Circuit breaker open: deterministic fallback engine active';
  }

  // Gemini failure or lack of key never takes down the app — status is at worst degraded
  res.status(200).json({
    status,
    provider: 'google_genai',
    message,
    fallbackEngineReady: true,
    circuitBreakerOpen: circuitOpen
  });
});

app.get(['/health/storage', '/api/health/storage'], async (req, res) => {
  const metrics = await repository.getMetrics();
  res.status(200).json({
    status: 'healthy',
    mode: metrics.storageMode || 'durable_persistent',
    persisted: true
  });
});

app.get(['/health/integrity', '/api/health/integrity'], async (req, res) => {
  const integrity = await repository.verifyDatabaseIntegrity();
  res.status(integrity.valid ? 200 : 503).json({
    status: integrity.valid ? 'healthy' : 'unhealthy',
    valid: integrity.valid,
    checksum: integrity.checksum,
    errors: integrity.errors,
    verifiedAt: new Date().toISOString()
  });
});

app.get('/api/health/dependencies', async (req, res) => {
  const integrity = await repository.verifyDatabaseIntegrity();
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const circuitOpen = isCircuitBreakerOpen();
  const cacheStatus = getCacheStatus();
  const metrics = await repository.getMetrics();

  const dependencies = {
    application: {
      status: 'healthy',
      uptimeSeconds: Math.floor(process.uptime()),
      version: '2.5.0'
    },
    database: {
      status: integrity.valid ? 'healthy' : 'unhealthy',
      storageMode: metrics.storageMode || (process.env.DATABASE_URL && !process.env.DATABASE_URL.toLowerCase().includes('none') ? 'postgresql' : 'atomic_file'),
      errorCount: integrity.errors.length,
      latencyMs: metrics.dbLatencyMs
    },
    aiProvider: {
      status: hasGeminiKey ? (circuitOpen ? 'degraded_circuit_open' : 'healthy') : 'deterministic_fallback_active',
      provider: 'google_genai',
      fallbackEngineReady: true,
      circuitBreakerOpen: circuitOpen
    },
    cache: {
      status: cacheStatus.connected ? 'healthy' : 'degraded_local_memory',
      backend: cacheStatus.type,
      connected: cacheStatus.connected,
      hitRatio: metrics.cacheHitRatio
    },
    storage: {
      status: 'healthy',
      mode: 'durable_persistent'
    }
  };

  const allCrucialHealthy = dependencies.application.status === 'healthy' &&
    dependencies.database.status === 'healthy';

  res.status(allCrucialHealthy ? 200 : 503).json({
    status: allCrucialHealthy ? (circuitOpen || !hasGeminiKey ? 'degraded' : 'healthy') : 'unhealthy',
    timestamp: new Date().toISOString(),
    dependencies
  });
});

app.get('/api/metrics', requireAdmin, adminRateLimiter, async (req, res) => {
  const metrics = await repository.getMetrics();
  res.json({
    ...metrics,
    aiConfigured: !!process.env.GEMINI_API_KEY,
    circuitBreakerOpen: isCircuitBreakerOpen(),
    calculationEngineVersion: CALCULATION_ENGINE_VERSION
  });
});

// ----------------------------------------------------
// 2. AUTHENTICATION & SESSIONS
// ----------------------------------------------------
function determineClientType(req: Request): 'browser' | 'api' | 'mobile' {
  const headerType = req.headers['x-client-type'];
  if (headerType === 'mobile') return 'mobile';
  if (headerType === 'api') return 'api';
  if (headerType === 'browser') return 'browser';
  if (req.body && typeof req.body === 'object') {
    if (req.body.clientType === 'mobile') return 'mobile';
    if (req.body.clientType === 'api') return 'api';
    if (req.body.clientType === 'browser') return 'browser';
  }
  // Authorization Bearer or custom token header implies API client
  if (req.headers.authorization?.startsWith('Bearer ') || req.headers['x-session-token'] || req.headers['x-aurora-token']) {
    return 'api';
  }

  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isBrowserUA = userAgent.includes('mozilla') || userAgent.includes('chrome') || userAgent.includes('safari');

  // Real browser requests have browser UA AND browser security headers
  if (isBrowserUA && (req.headers['sec-ch-ua'] || req.headers['sec-fetch-dest'] === 'document' || req.headers['sec-fetch-dest'] === 'empty')) {
    return 'browser';
  }

  // If session cookie exists, client operates as browser
  if (req.cookies?.['aurora_session'] || req.headers.cookie?.includes('aurora_session')) {
    return 'browser';
  }

  // Non-browser / API / automated test requests
  return 'api';
}

export type AuthMode = 'BROWSER_PRODUCTION_AUTH' | 'SANDBOX_COMPATIBILITY_AUTH' | 'API_TOKEN_AUTH';

function determineAuthMode(req: Request, clientType: 'browser' | 'api' | 'mobile'): AuthMode {
  if (clientType === 'api' || clientType === 'mobile') {
    return 'API_TOKEN_AUTH';
  }

  // Explicit client request for sandbox compatibility (sandboxed iframe / cross-origin preview)
  const isSandboxHeader = req.headers['x-client-mode'] === 'sandbox' || req.headers['x-aurora-compat'] === 'sandbox';
  const isIframeOrCloudRun = Boolean(
    process.env.K_SERVICE ||
    process.env.CLOUD_RUN_JOB ||
    req.headers['sec-fetch-dest'] === 'empty' ||
    req.headers.referer?.includes('aistudio.google.com') ||
    req.headers.origin?.includes('aistudio.google.com')
  );
  const isSandboxEnv = process.env.AUTH_COMPATIBILITY_MODE === 'sandbox' || (process.env.NODE_ENV !== 'production' && isIframeOrCloudRun);

  if (isSandboxHeader || isSandboxEnv) {
    return 'SANDBOX_COMPATIBILITY_AUTH';
  }

  return 'BROWSER_PRODUCTION_AUTH';
}

function sendAuthResponse(
  req: Request,
  res: Response,
  result: AuthResult,
  message: string,
  clientType: 'browser' | 'api' | 'mobile',
  statusCode: number = 200
) {
  // Always set HttpOnly cookie as primary defense-in-depth
  setSessionCookie(res, result.token);

  const authMode = determineAuthMode(req, clientType);

  if (authMode === 'BROWSER_PRODUCTION_AUTH') {
    // PURE BROWSER PRODUCTION: HttpOnly Secure Cookie ONLY
    // NEVER expose long-lived or session credentials directly to JavaScript in response body
    return res.status(statusCode).json({
      user: result.user,
      sessionMode: 'cookie',
      authMode: 'BROWSER_PRODUCTION_AUTH',
      message
    });
  }

  if (authMode === 'SANDBOX_COMPATIBILITY_AUTH') {
    // SANDBOX COMPATIBILITY: Required for AI Studio iframe preview & cross-origin sandboxes
    // where third-party cookies are blocked by browser privacy policies
    return res.status(statusCode).json({
      user: result.user,
      token: result.token,
      accessToken: result.accessToken || result.token,
      sessionMode: 'sandbox',
      authMode: 'SANDBOX_COMPATIBILITY_AUTH',
      message
    });
  }

  // MOBILE / API MODE: Short-lived access token + refresh token
  return res.status(statusCode).json({
    user: result.user,
    token: result.token,
    accessToken: result.accessToken || result.token,
    refreshToken: result.refreshToken,
    expiresIn: result.expiresIn || 900,
    tokenType: 'Bearer',
    sessionMode: 'token',
    authMode: 'API_TOKEN_AUTH',
    message
  });
}

app.post('/api/auth/register', registerRateLimiter, async (req, res, next) => {
  try {
    const validated = RegisterSchema.parse(req.body);
    const clientType = determineClientType(req);
    const result = await registerUserAsync(validated.email, validated.password, validated.fullName, 'USER', clientType);
    
    await repository.logAudit({
      userId: result.user.id,
      action: 'USER_REGISTERED',
      resource: 'auth',
      status: 'SUCCESS',
      requestId: req.requestId
    });

    sendAuthResponse(req, res, result, 'Đăng ký tài khoản thành công', clientType, 201);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/login', loginRateLimiter, async (req, res, next) => {
  try {
    const validated = LoginSchema.parse(req.body);
    const clientType = determineClientType(req);
    // Session rotation: pass current session token if client had one (e.g. from guest session)
    const result = await loginUserAsync(validated.email, validated.password, req.sessionToken, clientType);

    await repository.logAudit({
      userId: result.user.id,
      action: 'USER_LOGIN',
      resource: 'auth',
      status: 'SUCCESS',
      requestId: req.requestId
    });

    sendAuthResponse(req, res, result, 'Đăng nhập thành công', clientType, 200);
  } catch (err) {
    next(err);
  }
});

// Refresh token rotation endpoint for Mobile/API mode
app.post('/api/auth/refresh', loginRateLimiter, async (req, res, next) => {
  try {
    const refreshToken = (req.body?.refreshToken || req.headers['x-refresh-token']) as string | undefined;
    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Yêu cầu mã làm mới (refreshToken) để cấp lại phiên làm việc.',
          requestId: req.requestId
        }
      });
    }

    const rotated = await rotateRefreshTokenAsync(refreshToken);
    res.json({
      success: true,
      token: rotated.accessToken,
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
      expiresIn: rotated.expiresIn,
      tokenType: 'Bearer'
    });
  } catch (err: any) {
    res.status(401).json({
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: err.message || 'Mã làm mới không hợp lệ hoặc đã hết hạn',
        requestId: req.requestId
      }
    });
  }
});

app.post('/api/auth/logout', requireAuth, async (req, res) => {
  const token = req.sessionToken;
  if (token) {
    await revokeSessionAsync(token);
  }
  clearSessionCookie(res);
  await repository.logAudit({
    userId: req.user!.id,
    action: 'USER_LOGOUT',
    resource: 'auth',
    status: 'SUCCESS',
    requestId: req.requestId
  });
  res.json({ success: true, message: 'Đăng xuất thành công' });
});

// Auto-provision isolated guest session for first-time visitors
app.post('/api/auth/guest', guestRateLimiter, async (req, res, next) => {
  try {
    const clientType = determineClientType(req);
    // If user already has an active registered session, preserve it and do not overwrite
    if (req.user && req.user.role !== 'GUEST') {
      const mode = determineAuthMode(req, clientType);
      if (mode === 'BROWSER_PRODUCTION_AUTH') {
        return res.json({ user: req.user, sessionMode: 'cookie', authMode: mode, message: 'Phiên đăng nhập hiện tại vẫn hợp lệ' });
      }
      return res.json({
        user: req.user,
        token: req.sessionToken,
        sessionMode: mode === 'SANDBOX_COMPATIBILITY_AUTH' ? 'sandbox' : 'token',
        authMode: mode,
        message: 'Phiên đăng nhập hiện tại vẫn hợp lệ'
      });
    }
    const result = await createGuestSessionAsync(clientType);
    sendAuthResponse(req, res, result, 'Khởi tạo phiên khách thành công', clientType, 200);
  } catch (err) {
    next(err);
  }
});

// Request Password Reset
app.post('/api/auth/forgot-password', loginRateLimiter, async (req, res, next) => {
  try {
    const validated = ForgotPasswordSchema.parse(req.body);
    const result = await requestPasswordResetAsync(validated.email);

    await repository.logAudit({
      userId: 'system',
      action: 'PASSWORD_RESET_REQUESTED',
      resource: 'auth',
      status: 'SUCCESS',
      requestId: req.requestId
    });

    // Constant message prevents email enumeration attack
    res.json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được xử lý thành công.',
      // In development / demo mode without external SMTP, return token for verification
      ...(process.env.NODE_ENV !== 'production' && result ? { debugToken: result.resetToken } : {})
    });
  } catch (err) {
    next(err);
  }
});

// Reset Password with Token
app.post('/api/auth/reset-password', loginRateLimiter, async (req, res, next) => {
  try {
    const validated = ResetPasswordSchema.parse(req.body);
    const success = await resetPasswordWithTokenAsync(validated.token, validated.newPassword);

    if (!success) {
      return res.status(400).json({
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'Mã khôi phục không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.',
          requestId: req.requestId
        }
      });
    }

    clearSessionCookie(res);
    res.json({
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công. Vui lòng đăng nhập lại với mật khẩu mới.'
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const prefs = await repository.getPreferences(req.user!.id);
    res.json({
      user: req.user,
      preferences: prefs || {
        theme: 'dark',
        language: 'vi',
        soundEnabled: true,
        autoSave: true,
        astronomyPrecision: 'HIGH'
      }
    });
  } catch (err: any) {
    console.warn('⚠️ [API] Failed to fetch preferences for /api/auth/me:', err.message);
    res.json({
      user: req.user,
      preferences: {
        theme: 'dark',
        language: 'vi',
        soundEnabled: true,
        autoSave: true,
        astronomyPrecision: 'HIGH'
      }
    });
  }
});

// ----------------------------------------------------
// 3. USER MANAGEMENT & GDPR COMPLIANCE
// ----------------------------------------------------
app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const prefs = await repository.getPreferences(req.user!.id);
    res.json({
      user: req.user,
      preferences: prefs || {
        theme: 'dark',
        language: 'vi',
        soundEnabled: true,
        autoSave: true,
        astronomyPrecision: 'HIGH'
      }
    });
  } catch (err: any) {
    console.warn('⚠️ [API] Failed to fetch preferences for /api/user:', err.message);
    res.json({
      user: req.user,
      preferences: {
        theme: 'dark',
        language: 'vi',
        soundEnabled: true,
        autoSave: true,
        astronomyPrecision: 'HIGH'
      }
    });
  }
});

app.post('/api/user/preferences', requireAuth, async (req, res, next) => {
  try {
    const validated = UserPreferencesSchema.parse(req.body);
    const updated = await repository.updatePreferences(req.user!.id, validated);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// GDPR Data Export: Complete user data portability bundle
app.get('/api/user/export', requireAuth, async (req, res) => {
  const data = await repository.getAllUserData(req.user!.id);
  if (!data) {
    return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy dữ liệu người dùng' } });
  }

  await repository.logAudit({
    userId: req.user!.id,
    action: 'USER_GDPR_DATA_EXPORT',
    resource: 'user',
    resourceId: req.user!.id,
    status: 'SUCCESS',
    requestId: req.requestId
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="aurora_user_data_${req.user!.id}.json"`);
  res.send(JSON.stringify(data, null, 2));
});

// Account Deletion: Complete cascade deletion of all user data
app.delete('/api/user/me', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const success = await repository.deleteUser(userId);

  await repository.logAudit({
    userId,
    action: 'USER_ACCOUNT_DELETED',
    resource: 'user',
    resourceId: userId,
    status: 'SUCCESS',
    requestId: req.requestId
  });

  res.json({ success, message: 'Tài khoản và toàn bộ dữ liệu liên quan đã được xóa hoàn toàn.' });
});

// ----------------------------------------------------
// 4. PROFILES (STRICT USER ISOLATION & TRANSACTION SAFETY)
// ----------------------------------------------------
const profileCreationMutexes = new Map<string, Promise<{ profile: UserProfile; calculation: any; idempotencyReplay?: boolean }>>();

app.get('/api/profiles', requireAuth, async (req, res, next) => {
  try {
    const profiles = await repository.getProfiles(req.user!.id);
    res.json(profiles || []);
  } catch (err: any) {
    next(err);
  }
});

app.get('/api/profiles/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await verifyProfileOwnershipAsync(req, res, id);
    if (!profile) return;
    res.json(profile);
  } catch (err: any) {
    next(err);
  }
});

app.post('/api/profiles', requireAuth, calculationRateLimiter, antiScrapingSweeperMiddleware, async (req, res, next) => {
  try {
    const validated = ProfileCreateSchema.parse(req.body);
    const userId = req.user!.id;
    const idempotencyKey = (
      req.headers['idempotency-key'] ||
      req.headers['x-idempotency-key'] ||
      validated.idempotencyKey ||
      validated.clientProfileId
    ) as string | undefined;

    const dedupeKey = idempotencyKey ? `${userId}:${idempotencyKey}` : null;

    // Check if an in-flight creation request with identical idempotencyKey is already executing
    if (dedupeKey && profileCreationMutexes.has(dedupeKey)) {
      const existingInFlight = await profileCreationMutexes.get(dedupeKey)!;
      return res.status(200).json({ ...existingInFlight, idempotencyReplay: true });
    }

    // Check if duplicate request has already been processed (Idempotency Replay)
    if (idempotencyKey) {
      const existingProfiles = await repository.getProfiles(userId);
      const duplicate = existingProfiles.find(
        p => p.idempotencyKey === idempotencyKey || p.clientProfileId === idempotencyKey
      );
      if (duplicate) {
        const existingCalc = await repository.getCalculation(duplicate.latestCalculationId || '');
        return res.status(200).json({ profile: duplicate, calculation: existingCalc, idempotencyReplay: true });
      }
    }

    const creationPromise = (async () => {
      // Atomic transaction for guest quota check, profile, calculation & initial backtest creation
      return await repository.runTransaction(async (repo) => {
        // Enforce guest quota atomically: role === 'GUEST' is single source of truth
        if (req.user!.role === 'GUEST') {
          const existingProfiles = await repo.getProfiles(userId);
          if (existingProfiles.length >= 2) {
            throw new AppError(
              'Phiên khách tạm thời giới hạn tối đa 2 hồ sơ lá số. Vui lòng đăng ký tài khoản chính thức miễn phí để tạo không giới hạn hồ sơ.',
              'GUEST_QUOTA_EXCEEDED',
              403
            );
          }
        }

        // Intra-transaction re-check to prevent race condition under concurrency
        if (idempotencyKey) {
          const currentProfiles = await repo.getProfiles(userId);
          const alreadyCreated = currentProfiles.find(
            p => p.idempotencyKey === idempotencyKey || p.clientProfileId === idempotencyKey
          );
          if (alreadyCreated) {
            const existingCalc = await repo.getCalculation(alreadyCreated.latestCalculationId || '');
            return { newProfile: alreadyCreated, calc: existingCalc, idempotencyReplay: true };
          }
        }

        const createdProfile: UserProfile = {
          id: `prof_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          userId,
          name: validated.name,
          isPrimary: validated.isPrimary || false,
          avatarSeed: validated.name.toLowerCase().replace(/\s+/g, '_'),
          birthData: validated.birthData,
          behavioralContext: validated.behavioralContext || {
            careerField: '',
            employmentStatus: '',
            financialGoal: '',
            relationshipStatus: '',
            topPriority: '',
            personalNotes: ''
          },
          idempotencyKey,
          clientProfileId: validated.clientProfileId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const computedCalc = runFullDestinyCalculation(createdProfile.birthData, createdProfile.id, 0);
        computedCalc.cryptographicSignature = generateAlgorithmSignature(computedCalc);
        createdProfile.latestCalculationId = computedCalc.id;

        const savedProfile = await repo.saveProfile(createdProfile);
        await repo.saveCalculation(computedCalc);

        const initialBt = runBacktestAnalysis([], computedCalc);
        await repo.saveBacktestResult(initialBt);

        return { newProfile: savedProfile, calc: computedCalc, idempotencyReplay: false };
      });
    })();

    if (dedupeKey) {
      profileCreationMutexes.set(dedupeKey, creationPromise.then(r => ({ profile: r.newProfile, calculation: r.calc, idempotencyReplay: r.idempotencyReplay })));
    }

    let result;
    try {
      result = await creationPromise;
    } finally {
      if (dedupeKey) {
        profileCreationMutexes.delete(dedupeKey);
      }
    }

    const { newProfile, calc, idempotencyReplay } = result;

    await repository.logAudit({
      userId,
      action: 'PROFILE_CREATED',
      resource: 'profile',
      resourceId: newProfile.id,
      status: 'SUCCESS',
      requestId: req.requestId
    });

    res.status(201).json({ profile: newProfile, calculation: calc });
  } catch (err) {
    next(err);
  }
});

app.put('/api/profiles/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await verifyProfileOwnershipAsync(req, res, id);
    if (!profile) return;

    const validated = ProfileUpdateSchema.parse(req.body);

    const updated = await repository.runTransaction(async (repo) => {
      const updatedProfile: UserProfile = {
        ...profile,
        ...validated,
        updatedAt: new Date().toISOString()
      };

      if (validated.birthData) {
        const events = await repo.getHistoricalEvents(id);
        const calc = runFullDestinyCalculation(validated.birthData, id, events.length);
        updatedProfile.latestCalculationId = calc.id;
        await repo.saveCalculation(calc);

        const bt = runBacktestAnalysis(events, calc);
        await repo.saveBacktestResult(bt);
      }

      await repo.saveProfile(updatedProfile);
      return updatedProfile;
    });

    await repository.logAudit({
      userId: req.user!.id,
      action: 'PROFILE_UPDATED',
      resource: 'profile',
      resourceId: id,
      status: 'SUCCESS',
      requestId: req.requestId
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/profiles/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const profile = await verifyProfileOwnershipAsync(req, res, id);
  if (!profile) return;

  const deleted = await repository.deleteProfile(id, req.user!.id);
  if (deleted) {
    await repository.logAudit({
      userId: req.user!.id,
      action: 'PROFILE_DELETED_CASCADE',
      resource: 'profile',
      resourceId: id,
      status: 'SUCCESS',
      requestId: req.requestId
    });
    res.json({ success: true, profileId: id });
  } else {
    res.status(500).json({ error: { code: 'DELETE_FAILED', message: 'Không thể xóa hồ sơ' } });
  }
});

// ----------------------------------------------------
// 5. CALCULATIONS (DETERMINISTIC SINGLE SOURCE OF TRUTH)
// Protected with Cryptographic Provenance & Anti-Scraping Sweeper
// ----------------------------------------------------
app.get(['/api/calculations/latest/:profileId', '/api/calculations/:profileId'], requireAuth, async (req, res) => {
  const { profileId } = req.params;
  const profile = await verifyProfileOwnershipAsync(req, res, profileId);
  if (!profile) return;

  let calc = await repository.getLatestCalculationForProfile(profileId);
  if (!calc) {
    const events = await repository.getHistoricalEvents(profileId);
    calc = runFullDestinyCalculation(profile.birthData, profile.id, events.length);
    calc.cryptographicSignature = generateAlgorithmSignature(calc);
    await repository.saveCalculation(calc);
  } else if (!calc.cryptographicSignature) {
    calc.cryptographicSignature = generateAlgorithmSignature(calc);
    await repository.saveCalculation(calc);
  }

  let bt = await repository.getBacktestResult(profileId);
  if (!bt) {
    const events = await repository.getHistoricalEvents(profileId);
    bt = runBacktestAnalysis(events, calc);
    await repository.saveBacktestResult(bt);
  }

  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);

  res.setHeader('X-Algorithm-Seal', calc.cryptographicSignature?.signature || 'unsealed');
  res.json({ calculation: calc, ensemble, backtest: bt });
});

app.post(['/api/calculations/recalculate/:profileId', '/api/calculations/recalculate'], requireAuth, calculationRateLimiter, antiScrapingSweeperMiddleware, async (req, res) => {
  const profileId = req.params.profileId || req.body?.profileId;
  if (!profileId) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Thiếu profileId' } });
    return;
  }
  const profile = await verifyProfileOwnershipAsync(req, res, profileId);
  if (!profile) return;

  const events = await repository.getHistoricalEvents(profileId);
  const calc = runFullDestinyCalculation(profile.birthData, profile.id, events.length);
  calc.cryptographicSignature = generateAlgorithmSignature(calc);
  await repository.saveCalculation(calc);

  const bt = runBacktestAnalysis(events, calc);
  await repository.saveBacktestResult(bt);

  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);

  await repository.logAudit({
    userId: req.user!.id,
    action: 'CALCULATION_RECOMPUTED',
    resource: 'calculation',
    resourceId: calc.id,
    status: 'SUCCESS',
    requestId: req.requestId
  });

  res.setHeader('X-Algorithm-Seal', calc.cryptographicSignature.signature);
  res.json({ calculation: calc, ensemble, backtest: bt });
});

// ----------------------------------------------------
// 6. HISTORICAL EVENTS & EMPIRICAL BACKTESTING
// ----------------------------------------------------
app.get('/api/events/:profileId', requireAuth, async (req, res) => {
  const { profileId } = req.params;
  const profile = await verifyProfileOwnershipAsync(req, res, profileId);
  if (!profile) return;

  const events = await repository.getHistoricalEvents(profileId);
  res.json(events);
});

app.post(['/api/events', '/api/backtests/event'], requireAuth, calculationRateLimiter, async (req, res, next) => {
  try {
    const validated = HistoricalEventSchema.parse(req.body);
    const profile = await verifyProfileOwnershipAsync(req, res, validated.profileId);
    if (!profile) return;

    // Atomic transaction for guest quota enforcement, event creation & backtest calculation
    const { event, updatedBt } = await repository.runTransaction(async (repo) => {
      // Enforce guest quota atomically: role === 'GUEST' is single source of truth
      if (req.user!.role === 'GUEST') {
        const existingEvents = await repo.getHistoricalEvents(validated.profileId);
        if (existingEvents.length >= 5) {
          throw new AppError(
            'Phiên khách tạm thời giới hạn tối đa 5 sự kiện đối chiếu. Vui lòng đăng ký tài khoản chính thức miễn phí để lưu trữ toàn bộ lịch sử.',
            'GUEST_EVENT_QUOTA_EXCEEDED',
            403
          );
        }
      }

      const createdEvent = {
        id: `evt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        ...validated,
        createdAt: new Date().toISOString()
      };

      await repo.addHistoricalEvent(createdEvent);

      const allEvents = await repo.getHistoricalEvents(validated.profileId);
      const calc = (await repo.getLatestCalculationForProfile(validated.profileId)) ||
        runFullDestinyCalculation(profile.birthData, profile.id, allEvents.length);

      const computedBt = runBacktestAnalysis(allEvents, calc);
      telemetry.recordBacktestRun();
      await repo.saveBacktestResult(computedBt);

      return { event: createdEvent, updatedBt: computedBt };
    });

    res.status(201).json({ event, backtestResult: updatedBt });
  } catch (err) {
    next(err);
  }
});

app.delete(['/api/events/:profileId/:eventId', '/api/backtests/event/:profileId/:eventId'], requireAuth, async (req, res) => {
  const { profileId, eventId } = req.params;
  const profile = await verifyProfileOwnershipAsync(req, res, profileId);
  if (!profile) return;

  const deleted = await repository.deleteHistoricalEvent(profileId, eventId);
  if (deleted) {
    const allEvents = await repository.getHistoricalEvents(profileId);
    const calc = (await repository.getLatestCalculationForProfile(profileId)) ||
      runFullDestinyCalculation(profile.birthData, profile.id, allEvents.length);
    const updatedBt = runBacktestAnalysis(allEvents, calc);
    telemetry.recordBacktestRun();
    await repository.saveBacktestResult(updatedBt);

    res.json({ success: true, backtestResult: updatedBt });
  } else {
    res.status(404).json({ error: { code: 'EVENT_NOT_FOUND', message: 'Sự kiện không tồn tại' } });
  }
});

app.get(['/api/backtest/:profileId', '/api/backtests/:profileId'], requireAuth, calculationRateLimiter, async (req, res) => {
  const { profileId } = req.params;
  const profile = await verifyProfileOwnershipAsync(req, res, profileId);
  if (!profile) return;

  const events = await repository.getHistoricalEvents(profileId);
  let bt = await repository.getBacktestResult(profileId);
  if (!bt) {
    const calc = (await repository.getLatestCalculationForProfile(profileId)) ||
      runFullDestinyCalculation(profile.birthData, profile.id, events.length);
    bt = runBacktestAnalysis(events, calc);
    await repository.saveBacktestResult(bt);
  }

  res.json({ events, result: bt });
});

// ----------------------------------------------------
// 7. MULTI-AGENT ENSEMBLE SYNTHESIS (GROUNDED)
// ----------------------------------------------------
app.get('/api/synthesis/:profileId', requireAuth, async (req, res) => {
  const { profileId } = req.params;
  const profile = await verifyProfileOwnershipAsync(req, res, profileId);
  if (!profile) return;

  const calc = (await repository.getLatestCalculationForProfile(profileId)) ||
    runFullDestinyCalculation(profile.birthData, profile.id, 0);

  const bt = (await repository.getBacktestResult(profileId)) ||
    runBacktestAnalysis(await repository.getHistoricalEvents(profileId), calc);

  const ensemble = generateMultiAgentEnsemble(profile, calc, bt.destinyConsistencyScore);
  res.json(ensemble);
});

// ----------------------------------------------------
// 8. SCENARIOS & WHAT-IF SIMULATOR (DETERMINISTIC)
// ----------------------------------------------------
app.post('/api/scenarios/evaluate', requireAuth, scenarioRateLimiter, async (req, res, next) => {
  try {
    const validated = ScenarioEvaluateSchema.parse(req.body);
    const profile = await verifyProfileOwnershipAsync(req, res, validated.profileId);
    if (!profile) return;

    let calc = await repository.getLatestCalculationForProfile(validated.profileId);
    if (!calc) {
      calc = runFullDestinyCalculation(profile.birthData, profile.id, 0);
      await repository.saveCalculation(calc);
    }

    const result = evaluateWhatIfScenario(validated.question, calc, validated.analysisYear);
    telemetry.recordScenarioRun();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// 9. DAILY DESTINY (DETERMINISTIC)
// ----------------------------------------------------
app.get('/api/daily/:profileId', requireAuth, async (req, res) => {
  const { profileId } = req.params;
  const profile = await verifyProfileOwnershipAsync(req, res, profileId);
  if (!profile) return;

  let calc = await repository.getLatestCalculationForProfile(profileId);
  if (!calc) {
    calc = runFullDestinyCalculation(profile.birthData, profile.id, 0);
    await repository.saveCalculation(calc);
  }

  const daily = computeDailyDestiny(calc);
  res.json(daily);
});

// ----------------------------------------------------
// 10. AI CONVERSATIONAL ASSISTANT (RESILIENT GEMINI + GROUNDED FALLBACK)
// ----------------------------------------------------
app.post('/api/ai/chat', requireAuth, aiChatRateLimiter, async (req, res, next) => {
  try {
    const validated = AiChatSchema.parse(req.body);
    const profile = await verifyProfileOwnershipAsync(req, res, validated.profileId);
    if (!profile) return;

    let calc = await repository.getLatestCalculationForProfile(validated.profileId);
    if (!calc) {
      calc = runFullDestinyCalculation(profile.birthData, profile.id, 0);
      await repository.saveCalculation(calc);
    }

    let bt = await repository.getBacktestResult(validated.profileId);
    if (!bt) {
      bt = runBacktestAnalysis([], calc);
      await repository.saveBacktestResult(bt);
    }

    // Save user message
    const userMsg = {
      id: `msg_u_${Date.now()}`,
      sender: 'user' as const,
      content: validated.message,
      timestamp: new Date().toISOString()
    };
    await repository.addChatMessage(validated.profileId, userMsg);

    const targetYear = validated.analysisYear || calc.analysisYear || getDefaultAnalysisYear(profile.birthData.timezoneOffset);

    // Call resilient Gemini service with explicit analysisYear
    const { content, confidenceScore, isFallback } = await generateDestinyChatResponse(
      validated.message,
      profile,
      calc,
      bt,
      { analysisYear: targetYear }
    );

    const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
    const aiStatus: 'AI_SUCCESS' | 'AI_FALLBACK' | 'AI_DEGRADED' | 'AI_UNAVAILABLE' = !hasApiKey
      ? 'AI_UNAVAILABLE'
      : isFallback
        ? 'AI_FALLBACK'
        : 'AI_SUCCESS';

    const currentTransit = calc.annualTransits.find(t => t.year === targetYear) || calc.annualTransits[0];

    const assistantMsg = {
      id: `msg_a_${Date.now()}`,
      sender: 'assistant' as const,
      content,
      timestamp: new Date().toISOString(),
      confidenceScore,
      aiStatus,
      isFallback,
      suggestedQuestions: [
        `Giai đoạn nào trong năm ${targetYear} có sóng năng lượng thuận lợi nhất?`,
        `Làm thế nào để ứng dụng Dụng Thần ${calc.bazi.favorableElements.join('/')} vào quản trị tài chính?`,
        'Điểm mù lớn nhất cần phòng tránh trong các quyết định lớn là gì?'
      ],
      groundedFacts: [
        `Bát Tự: Nhật Chủ ${calc.bazi.dayMaster} (${calc.bazi.dayMasterStrength}) - Cách Cục: ${calc.bazi.structureType}`,
        `Dụng Thần: ${calc.bazi.favorableElements.join(', ')} | Kỵ Thần: ${calc.bazi.unfavorableElements.join(', ')}`,
        `Tử Vi: Cung Mệnh tại ${calc.ziwei.palaces.life?.branch} - Cục: ${calc.ziwei.elementBureau}`,
        `Lưu Niên ${targetYear}: ` + (
          currentTransit
            ? `Sóng cơ hội ${currentTransit.opportunityWave ?? 0}% - Sóng thận trọng ${currentTransit.cautionWave ?? 0}%`
            : 'Chưa đủ dữ liệu sóng Lưu Niên'
        ),
        `Chỉ số Tương Hợp Lịch Sử: ${bt.destinyConsistencyScore}/100`
      ]
    };

    await repository.addChatMessage(validated.profileId, assistantMsg);
    res.json(assistantMsg);
  } catch (err) {
    next(err);
  }
});

// Retrieve conversation history for profile (strictly authenticated & isolated)
app.get('/api/ai/messages/:profileId', requireAuth, async (req, res) => {
  const { profileId } = req.params;
  const profile = await verifyProfileOwnershipAsync(req, res, profileId);
  if (!profile) return;

  const messages = await repository.getChatMessages(profileId);
  res.json(messages);
});

// Clear conversation history for profile
app.delete('/api/ai/messages/:profileId', requireAuth, async (req, res) => {
  const { profileId } = req.params;
  const profile = await verifyProfileOwnershipAsync(req, res, profileId);
  if (!profile) return;

  const cleared = await repository.clearChatMessages(profileId);
  await repository.logAudit({
    userId: req.user!.id,
    action: 'CHAT_HISTORY_CLEARED',
    resource: 'chat',
    resourceId: profileId,
    status: 'SUCCESS',
    requestId: req.requestId
  });
  res.json({ success: cleared });
});

// ----------------------------------------------------
// 10B. 13-STAGE MULTI-TIER AI REASONING PIPELINE
// ----------------------------------------------------
app.post('/api/ai/pipeline', requireAuth, aiChatRateLimiter, async (req, res, next) => {
  try {
    const validated = AiChatSchema.parse(req.body);
    const profile = await verifyProfileOwnershipAsync(req, res, validated.profileId);
    if (!profile) return;

    let calc = await repository.getLatestCalculationForProfile(validated.profileId);
    if (!calc) {
      calc = runFullDestinyCalculation(profile.birthData, profile.id, 0);
      await repository.saveCalculation(calc);
    }

    let bt = await repository.getBacktestResult(validated.profileId);
    if (!bt) {
      bt = runBacktestAnalysis([], calc);
      await repository.saveBacktestResult(bt);
    }

    const pipelineResult = await DestinyAiPipeline.execute({
      userQuestion: validated.message,
      profile,
      calculation: calc,
      backtest: bt,
      analysisYear: validated.analysisYear
    });

    res.json(pipelineResult);
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// 10C. ALGORITHM PROVENANCE & AUTHENTICITY VERIFICATION
// Cryptographic validation of calculation seals
// ----------------------------------------------------
app.post('/api/algorithm/verify-seal', (req, res) => {
  const calc = req.body;
  if (!calc || !calc.cryptographicSignature) {
    return res.status(400).json({
      valid: false,
      message: 'Thiếu thông tin chữ ký số hoặc con dấu mật mã bản quyền của thuật toán.'
    });
  }

  const isValid = verifyAlgorithmSignature(calc);
  return res.json({
    valid: isValid,
    signature: calc.cryptographicSignature.signature,
    sealTimestamp: calc.cryptographicSignature.sealTimestamp,
    issuer: calc.cryptographicSignature.issuer,
    algorithmHash: calc.cryptographicSignature.algorithmHash,
    intellectualPropertyOwner: 'Prof.TOAN & Huyen Phong Phat Dao',
    message: isValid
      ? 'Chữ ký mật mã hợp lệ. Toàn bộ thông số tinh bàn và tứ trụ được xác thực nguyên bản từ hệ thống độc quyền.'
      : 'CẢNH BÁO: Dữ liệu tính toán đã bị can thiệp, sai lệch cấu trúc hoặc không xuất phát từ lõi thuật toán chính thống.'
  });
});

// ----------------------------------------------------
// 11. AUDIT LOGS, ADMIN & POSTGRESQL MIGRATION
// ----------------------------------------------------
app.get('/api/admin/security-threats', requireAdmin, adminRateLimiter, (req, res) => {
  const analytics = getSecurityAnalytics();
  res.json(analytics);
});

app.get('/api/audit-logs', requireAdmin, adminRateLimiter, async (req, res) => {
  const logs = await repository.getAuditLogs(100);
  res.json(logs);
});

app.get('/api/feature-flags', async (req, res) => {
  res.json(await repository.getFeatureFlags());
});

app.post('/api/feature-flags/toggle', requireAdmin, adminRateLimiter, async (req, res, next) => {
  try {
    const validated = FeatureFlagToggleSchema.parse(req.body);
    const updated = await repository.toggleFeatureFlag(validated.key, validated.enabled);
    if (!updated) {
      return res.status(404).json({ error: { code: 'FLAG_NOT_FOUND', message: 'Feature flag not found' } });
    }
    res.json(await repository.getFeatureFlags());
  } catch (err) {
    next(err);
  }
});

// Admin PostgreSQL Migration Exporter (PHẦN 3)
app.get('/api/admin/export-sql', requireAdmin, adminRateLimiter, async (req, res) => {
  const ddl = await repository.exportToPostgresSql();
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="aurora_destiny_postgres_migration.sql"');
  res.send(ddl);
});

app.post('/api/admin/cleanup-sessions', requireAdmin, adminRateLimiter, async (req, res) => {
  const cleaned = await repository.cleanupExpiredSessions();
  res.json({ success: true, cleanedSessionsCount: cleaned });
});

// Dedicated scheduler / cron cleanup endpoint for serverless architectures (Vercel Cron / Cloud Scheduler)
app.post(['/api/system/cleanup', '/api/cron/cleanup'], async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = req.headers['x-cron-secret'] || req.headers.authorization?.replace('Bearer ', '');
  const isAuthorized = (cronSecret && headerSecret === cronSecret) || (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN'));

  if (!isAuthorized && process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED_CRON',
        message: 'Yêu cầu mã bí mật hoặc quyền quản trị viên để kích hoạt dọn dẹp hệ thống.',
        requestId: req.requestId
      }
    });
  }

  const cleaned = await repository.cleanupExpiredSessions();
  res.json({ success: true, cleanedSessionsCount: cleaned, timestamp: new Date().toISOString() });
});

// Privacy Export for Profile
app.get('/api/export/:profileId', requireAuth, async (req, res) => {
  const { profileId } = req.params;
  const profile = await verifyProfileOwnershipAsync(req, res, profileId);
  if (!profile) return;

  const calc = await repository.getLatestCalculationForProfile(profileId);
  const events = await repository.getHistoricalEvents(profileId);
  const bt = await repository.getBacktestResult(profileId);
  const messages = await repository.getChatMessages(profileId);
  const prefs = await repository.getPreferences(req.user!.id);

  const exportBundle = {
    app: 'Aurora Destiny AI',
    exportTimestamp: new Date().toISOString(),
    user: {
      id: req.user!.id,
      email: req.user!.email,
      fullName: req.user!.fullName,
      role: req.user!.role,
      subscriptionTier: req.user!.subscriptionTier
    },
    profile,
    calculation: calc,
    historicalEvents: events,
    backtestResult: bt,
    chatMessages: messages,
    preferences: prefs
  };

  await repository.logAudit({
    userId: req.user!.id,
    action: 'USER_DATA_EXPORTED',
    resource: 'profile',
    resourceId: profileId,
    status: 'SUCCESS',
    requestId: req.requestId
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="aurora_destiny_${profileId}.json"`);
  res.send(JSON.stringify(exportBundle, null, 2));
});

// ----------------------------------------------------
// 11B. NATIVE MOBILE PDF DOWNLOAD & STREAMING STAGING
// Durable, authenticated, tamper-proof staging using StorageProvider & HMAC-SHA256 tokens
// ----------------------------------------------------
const storageProvider = createStorageProvider();
setStorageProvider(storageProvider);

function sanitizePdfFileName(rawName: string | undefined): string {
  if (!rawName || typeof rawName !== 'string') return 'Sach_Ban_Menh_A4.pdf';
  // Strip control chars, CRLF, quotes, backslashes, path traversal
  const base = path.basename(rawName).replace(/[\r\n\0"';<>\\]/g, '').trim();
  const safe = base.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9.-]/g, '_').slice(0, 80);
  return safe.endsWith('.pdf') ? safe : `${safe}.pdf`;
}

// Stage a generated PDF for robust native mobile OS download
app.post(
  '/api/pdf/prepare-download',
  requireAuth,
  pdfRateLimiter,
  express.raw({ type: ['application/pdf', 'application/octet-stream'], limit: '15mb' }),
  async (req: Request, res: Response) => {
    let buffer: Buffer | null = null;
    if (Buffer.isBuffer(req.body) && req.body.length > 0) {
      buffer = req.body;
    } else if (typeof req.body === 'string' && req.body.length > 0) {
      buffer = Buffer.from(req.body, 'base64');
    }

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: { code: 'EMPTY_PAYLOAD', message: 'Không nhận được dữ liệu tệp PDF.' } });
    }

    // Verify PDF Magic Bytes (%PDF-)
    if (buffer.length < 5 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      return res.status(400).json({
        error: {
          code: 'MALFORMED_PDF',
          message: 'Dữ liệu không phải là tệp PDF hợp lệ.',
          requestId: req.requestId
        }
      });
    }

    // 256-bit entropy download token
    const downloadId = crypto.randomBytes(32).toString('hex');
    const safeFileName = sanitizePdfFileName(req.query.filename as string);

    // Save to durable storage (LocalDisk or Memory with atomic persistence)
    await storageProvider.save(downloadId, buffer, {
      fileName: safeFileName,
      userId: req.user?.id,
      maxDownloads: 5,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes TTL
      contentType: 'application/pdf'
    });

    const signedToken = generateSignedDownloadToken(downloadId, req.user?.id, 900);
    const downloadUrl = `/api/pdf/download/${downloadId}?token=${signedToken}&filename=${encodeURIComponent(safeFileName)}`;

    res.json({
      success: true,
      downloadUrl,
      id: downloadId,
      token: signedToken,
      size: buffer.length
    });
  }
);

// Stream the staged PDF with standard HTTP attachment headers for native mobile DownloadManager
app.get('/api/pdf/download/:id', pdfRateLimiter, async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.query.token as string | undefined;

  // 1. Path traversal & ID validation
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).json({
      error: { code: 'INVALID_FILE_ID', message: 'Mã định danh tệp không hợp lệ.', requestId: req.requestId }
    });
  }

  // 2. Security Authorization Verification: Signed Token or Session
  let authorized = false;
  let tokenUserId: string | undefined;

  if (token) {
    const verifiedToken = verifySignedDownloadToken(token);
    if (verifiedToken.valid && verifiedToken.payload && verifiedToken.payload.fileId === id) {
      authorized = true;
      tokenUserId = verifiedToken.payload.userId;
    } else if (verifiedToken.reason === 'EXPIRED_TOKEN') {
      return res.status(410).send(
        '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hết hạn</title></head><body style="font-family:sans-serif;background:#050814;color:#e2e8f0;text-align:center;padding:50px;"><h2>Liên kết tải tệp PDF đã hết hạn.</h2><p>Vui lòng quay lại ứng dụng và bấm "Tải File PDF Về Máy" để kết xuất bản mới.</p></body></html>'
      );
    }
  }

  if (!authorized) {
    // If not verified by signed HMAC token, user must be authenticated via session
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED_PDF_ACCESS', message: 'Yêu cầu đăng nhập hoặc mã token hợp lệ để tải tệp.', requestId: req.requestId }
      });
    }
  }

  // 3. Atomically consume download token BEFORE reading/streaming object
  // Enforces multi-instance atomic download limits and prevents race condition
  const consumeRes = await storageProvider.consumeDownload(id);

  if (!consumeRes.allowed) {
    if (consumeRes.reason === 'LIMIT_EXCEEDED') {
      return res.status(403).json({
        error: {
          code: 'DOWNLOAD_LIMIT_EXCEEDED',
          message: `Tệp đã đạt tối đa số lượt tải cho phép (tối đa ${consumeRes.maxDownloads} lần). Vui lòng kết xuất bản mới.`,
          requestId: req.requestId
        }
      });
    }
    return res.status(404).send(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hết hạn</title></head><body style="font-family:sans-serif;background:#050814;color:#e2e8f0;text-align:center;padding:50px;"><h2>Tệp PDF đã hết hạn lưu trữ hoặc đã vượt quá số lần tải.</h2><p>Vui lòng quay lại ứng dụng và bấm "Tải File PDF Về Máy" để kết xuất bản mới.</p></body></html>'
    );
  }

  // 4. Retrieve object data from atomic consumption result or storage fallback
  const staged = (consumeRes.data && consumeRes.metadata)
    ? { data: consumeRes.data, metadata: consumeRes.metadata }
    : await storageProvider.get(id);
  if (!staged) {
    return res.status(404).send(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Không tìm thấy</title></head><body style="font-family:sans-serif;background:#050814;color:#e2e8f0;text-align:center;padding:50px;"><h2>Không tìm thấy tệp tài liệu.</h2></body></html>'
    );
  }

  // 5. Verify ownership if file is associated with a specific user
  if (staged.metadata.userId) {
    const isOwner = (tokenUserId && tokenUserId === staged.metadata.userId) || (req.user && (req.user.id === staged.metadata.userId || req.user.role === 'SUPER_ADMIN'));
    if (!isOwner) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_PDF_ACCESS',
          message: 'Bạn không có quyền truy cập hoặc tải tệp tài liệu này.',
          requestId: req.requestId
        }
      });
    }
  }

  // 6. Stream data with standard security headers
  const safeFileName = sanitizePdfFileName(staged.metadata.fileName);
  const isView = req.query.view === '1';
  const asciiFileName = safeFileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const encodedFileName = encodeURIComponent(safeFileName);

  res.setHeader('Content-Type', staged.metadata.contentType || 'application/pdf');
  res.setHeader('Content-Length', staged.data.length.toString());

  if (isView) {
    res.setHeader('Content-Disposition', `inline; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`);
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return res.end(staged.data);
});

// ----------------------------------------------------
// 11B. ENTERPRISE SEO, SITEMAP, ROBOTS.TXT & SOCIAL CRAWLER ROUTES
// High-performance search engine indexing & rich snippets
// ----------------------------------------------------

app.get('/robots.txt', (req: Request, res: Response) => {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
  res.setHeader('X-Robots-Tag', 'all');

  if (fs.existsSync(robotsPath)) {
    return res.sendFile(robotsPath);
  }

  // Guaranteed resilient fallback
  const fallbackRobots = `User-agent: *\nAllow: /\nDisallow: /api/admin/\nDisallow: /api/auth/\n\nSitemap: https://auroradestiny.ai/sitemap.xml\n`;
  return res.send(fallbackRobots);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
  res.setHeader('X-Robots-Tag', 'all');

  if (fs.existsSync(sitemapPath)) {
    return res.sendFile(sitemapPath);
  }

  const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://auroradestiny.ai/</loc><lastmod>${new Date().toISOString()}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url></urlset>`;
  return res.send(fallbackSitemap);
});

app.get(['/manifest.webmanifest', '/manifest.json'], (req: Request, res: Response) => {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.webmanifest');
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  if (fs.existsSync(manifestPath)) {
    return res.sendFile(manifestPath);
  }
  return res.status(404).json({ error: 'Manifest not found' });
});

app.get('/og-image.svg', (req: Request, res: Response) => {
  const ogPath = path.join(process.cwd(), 'public', 'og-image.svg');
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

  if (fs.existsSync(ogPath)) {
    return res.sendFile(ogPath);
  }
  return res.status(404).send('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#050508"/><text x="50%" y="50%" fill="#ffffff" text-anchor="middle" font-size="40">Aurora Destiny AI</text></svg>');
});

app.get('/api/seo/metadata', (req: Request, res: Response) => {
  res.json({
    platform: 'Aurora Destiny AI',
    channel: 'Kênh Huyền Phong Phật Đạo',
    author: 'Giáo Sư - Prof.TOAN',
    email: 'havantoancntt@gmail.com',
    canonicalUrl: 'https://auroradestiny.ai/',
    sitemapUrl: 'https://auroradestiny.ai/sitemap.xml',
    robotsUrl: 'https://auroradestiny.ai/robots.txt',
    ogImageUrl: 'https://auroradestiny.ai/og-image.svg',
    title: 'Aurora Destiny AI — Luận Giải Bát Tự Tứ Trụ, Tử Vi Đẩu Số 108 Tinh Bàn & Siêu Trí Tuệ Nhân Tạo',
    keywords: [
      'Tử Vi Đẩu Số 108 Tinh Bàn',
      'Bát Tự Tứ Trụ',
      'Giờ Sinh Chân Mặt Trời',
      'Huyền Phong Phật Đạo',
      'Giáo Sư Prof TOAN',
      'Multi-Agent AI',
      '24 Tiết Khí VSOP87',
      'Dụng Thần Bát Tự',
      'Kiểm Chứng Ngược Lịch Sử'
    ],
    structuredDataTypes: [
      'WebApplication',
      'Organization',
      'WebSite',
      'BreadcrumbList',
      'FAQPage',
      'HowTo'
    ],
    status: 'OPTIMIZED_TOP_RANKING'
  });
});

// ----------------------------------------------------
// 11C. CELESTIAL HALL OF PATRONS (BIA VÀNG CÔNG ĐỨC THIÊN BÀN)
// Persistent ledger with verified audit trail, HMAC webhooks & anti-replay
// ----------------------------------------------------
const SEED_PATRONS = [
  {
    id: 'ptr_001',
    name: 'Phật Tử Diệu Tâm (TP. HCM)',
    tier: 'kim_cuong' as const,
    amount: 1000000,
    message: 'Kính chúc Kênh Huyền Phong Phật Đạo & Giáo Sư Prof.TOAN thân tâm an lạc, lan tỏa chánh tri kiến.',
    status: 'VERIFIED' as const,
    verificationType: 'DEMO_SAMPLE' as const,
    paymentReference: 'DEMO_REF_VCB_001',
    isAnonymous: false
  },
  {
    id: 'ptr_002',
    name: 'Cư Sĩ Trí Tuệ (Hà Nội)',
    tier: 'vang' as const,
    amount: 500000,
    message: 'Ủng hộ máy chủ AI phân tích Bát Tự & Tử Vi khoa học không mê tín dị đoan.',
    status: 'VERIFIED' as const,
    verificationType: 'DEMO_SAMPLE' as const,
    paymentReference: 'DEMO_REF_VCB_002',
    isAnonymous: false
  },
  {
    id: 'ptr_003',
    name: 'Bác Sĩ Nguyễn Hoàng (Đà Nẵng)',
    tier: 'vang' as const,
    amount: 500000,
    message: 'Tấm lòng tri ân thuật toán Giờ sinh chân mặt trời chuẩn xác đến từng phút.',
    status: 'VERIFIED' as const,
    verificationType: 'DEMO_SAMPLE' as const,
    paymentReference: 'DEMO_REF_VCB_003',
    isAnonymous: false
  },
  {
    id: 'ptr_004',
    name: 'Hữu Duyên Trí Thiện (Cần Thơ)',
    tier: 'bac' as const,
    amount: 200000,
    message: 'Mời Giáo Sư chén trà đàm đạo, chúc dự án trường tồn vươn tầm quốc tế.',
    status: 'VERIFIED' as const,
    verificationType: 'DEMO_SAMPLE' as const,
    paymentReference: 'DEMO_REF_VCB_004',
    isAnonymous: false
  },
  {
    id: 'ptr_005',
    name: 'Huynh Đệ Vô Danh (California, USA)',
    tier: 'kim_cuong' as const,
    amount: 2000000,
    message: 'Bảo trợ GPU máy chủ đa tác tử AI, phụng sự người Việt năm châu.',
    status: 'VERIFIED' as const,
    verificationType: 'DEMO_SAMPLE' as const,
    paymentReference: 'DEMO_REF_VCB_005',
    isAnonymous: true
  }
];

// Seed initial patrons into persistent store if empty
const isProd = process.env.NODE_ENV === 'production';
const shouldSeedDemo = process.env.ENABLE_DEMO_DATA === 'true' || (!isProd && process.env.ENABLE_DEMO_DATA !== 'false');

if (shouldSeedDemo) {
  (async () => {
    try {
      const existing = await repository.getPatrons({ limit: 1 });
      if (existing.length === 0) {
        for (const p of SEED_PATRONS) {
          await repository.createPatron(p);
        }
        console.log('🏛️ [Demo Fixtures] Initialized Celestial Hall of Patrons with verified demo records.');
      }
    } catch (err) {
      console.warn('Patron seed check deferred until DB readiness:', err);
    }
  })();
} else {
  console.log('🏛️ [Production Mode] Demo patron seeding disabled (ENABLE_DEMO_DATA !== true).');
}

app.get('/api/patrons', async (req: Request, res: Response) => {
  try {
    const rawList = await repository.getPatrons({ limit: 200 });
    const verifiedCount = rawList.filter(p => p.status === 'VERIFIED').length;
    const pendingCount = rawList.filter(p => p.status === 'PENDING').length;

    // Map into normalized format compatible with both frontend interfaces
    const patrons = rawList.map(p => ({
      id: p.id,
      name: p.name,
      location: p.isAnonymous ? 'Hữu duyên' : 'Toàn cầu',
      contribution: p.amount ? `${p.amount.toLocaleString('vi-VN')} VNĐ` : 'Tùy hỷ trợ duyên',
      tier: p.tier,
      amount: p.amount,
      message: p.message,
      note: p.message || '',
      sealHash: p.sealHash,
      status: p.status,
      verificationType: p.verificationType,
      date: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      isAnonymous: p.isAnonymous
    }));

    return res.json({
      status: 'success',
      totalCount: patrons.length,
      verifiedCount,
      pendingCount,
      patrons,
      notice: 'Chuẩn mực minh bạch Phật giáo: Danh vị ghi nhận trên Bia Vàng chỉ chuyển trạng thái ĐÃ XÁC THỰC sau khi đối soát sao kê/webhook thanh toán chính thức.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Lỗi truy xuất danh sách thí chủ', details: isProd ? undefined : err.message });
  }
});

app.post('/api/patrons', guestRateLimiter, async (req: Request, res: Response) => {
  try {
    const validated = PatronCreateSchema.parse(req.body);
    const message = validated.message || validated.note || 'Gieo duyên công đức trợ lực nền tảng';
    const isAnonymous = Boolean(validated.isAnonymous);
    const displayName = isAnonymous ? 'Thí Chủ Hữu Duyên (Ẩn danh)' : validated.name;

    const newPatron = await repository.createPatron({
      userId: req.user?.id,
      name: displayName,
      tier: validated.tier,
      amount: validated.amount,
      message,
      status: 'PENDING',
      verificationType: 'UNVERIFIED',
      isAnonymous
    });

    return res.status(201).json({
      status: 'PENDING',
      message: 'Nguyện vọng công đức đã được ghi nhận vào sổ bộ. Trạng thái: Chờ đối soát sao kê/webhook thanh toán để kích hoạt danh vị chính thức.',
      patron: {
        id: newPatron.id,
        name: newPatron.name,
        location: isAnonymous ? 'Hữu duyên' : (validated.location || 'Toàn cầu'),
        contribution: newPatron.amount ? `${newPatron.amount.toLocaleString('vi-VN')} VNĐ` : 'Tùy hỷ trợ duyên',
        note: newPatron.message,
        date: newPatron.createdAt.split('T')[0],
        sealHash: newPatron.sealHash,
        status: newPatron.status,
        verificationType: newPatron.verificationType
      }
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dữ liệu công đức không hợp lệ',
          details: err.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
        }
      });
    }
    return res.status(500).json({ error: 'Lỗi ghi nhận công đức', details: isProd ? undefined : err.message });
  }
});

// Secure Payment Webhook with Anti-Replay, Required HMAC Signature & Payment Reconciliation
// Pipeline: raw request body -> rate limiter -> HMAC verification -> constant-time comparison -> payload parsing -> schema validation -> business processing
app.post('/api/patrons/webhook', webhookRateLimiter, async (req: Request, res: Response) => {
  try {
    // 1. Signature MUST be present
    const signature = req.headers['x-aurora-signature'] as string | undefined;
    if (!signature) {
      return res.status(401).json({
        error: {
          code: 'SIGNATURE_MISSING',
          message: 'Thiếu chữ ký xác thực webhook (x-aurora-signature).'
        }
      });
    }

    // 2. Extract authentic raw body Buffer
    let rawBodyBuf: Buffer;
    if (Buffer.isBuffer(req.body)) {
      rawBodyBuf = req.body;
    } else if (Buffer.isBuffer((req as any).rawBody)) {
      rawBodyBuf = (req as any).rawBody;
    } else if (typeof req.body === 'string') {
      rawBodyBuf = Buffer.from(req.body, 'utf8');
    } else {
      return res.status(400).json({
        error: {
          code: 'EMPTY_BODY',
          message: 'Dữ liệu webhook không được để trống.'
        }
      });
    }

    if (rawBodyBuf.length === 0) {
      return res.status(400).json({
        error: {
          code: 'EMPTY_BODY',
          message: 'Dữ liệu webhook không được để trống.'
        }
      });
    }

    let webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || process.env.APP_SECRET;
    if (isProd) {
      if (!webhookSecret) {
        throw new Error('[FATAL SECURITY] PAYMENT_WEBHOOK_SECRET or APP_SECRET is strictly required in production.');
      }
    } else {
      webhookSecret = webhookSecret || 'aurora_patron_webhook_dev_secret_only';
    }

    // 3. Constant-time HMAC signature verification strictly on authentic raw body bytes
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBodyBuf)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return res.status(401).json({
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Chữ ký webhook không hợp lệ.'
        }
      });
    }

    // 4. Parse JSON strictly AFTER HMAC verification succeeds
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(rawBodyBuf.toString('utf8'));
    } catch {
      return res.status(400).json({
        error: {
          code: 'INVALID_JSON',
          message: 'Dữ liệu webhook không phải là JSON hợp lệ.'
        }
      });
    }

    // 5. Validate schema against parsed JSON
    const payload = PaymentWebhookSchema.parse(parsedBody);

    // 6. Anti-replay & Timestamp window check
    const now = Date.now();
    if (payload.timestamp > now + 60000) {
      return res.status(400).json({
        error: {
          code: 'FUTURE_TIMESTAMP',
          message: 'Thời gian webhook nằm trong tương lai không hợp lệ.'
        }
      });
    }
    if (now - payload.timestamp > 5 * 60 * 1000) {
      return res.status(400).json({
        error: {
          code: 'REPLAY_WINDOW_EXPIRED',
          message: 'Thời gian webhook vượt quá khung thời gian cho phép 5 phút.'
        }
      });
    }

    // 4. Verify patron exists
    const targetPatron = await repository.getPatronById(payload.patronId);
    if (!targetPatron) {
      return res.status(404).json({
        error: {
          code: 'PATRON_NOT_FOUND',
          message: 'Không tìm thấy hồ sơ thí chủ tương ứng.'
        }
      });
    }

    // 5. Payment Reconciliation: check if payment reference is already used by another patron
    const existingWithRef = await repository.getPatronByPaymentReference(payload.paymentReference);
    if (existingWithRef && existingWithRef.id !== payload.patronId) {
      return res.status(400).json({
        error: {
          code: 'DUPLICATE_PAYMENT_REFERENCE',
          message: 'Mã giao dịch này đã được ghi nhận cho một thí chủ khác.'
        }
      });
    }

    // 6. Payment Reconciliation: compare amount if patron has an expected amount
    if (targetPatron.amount !== undefined && targetPatron.amount !== null && targetPatron.amount > 0) {
      if (payload.amount < targetPatron.amount) {
        return res.status(400).json({
          error: {
            code: 'AMOUNT_MISMATCH',
            message: `Số tiền thanh toán (${payload.amount.toLocaleString('vi-VN')} VNĐ) nhỏ hơn số tiền đã đăng ký (${targetPatron.amount.toLocaleString('vi-VN')} VNĐ).`
          }
        });
      }
    }

    // 7. Atomic Idempotency & Database Transaction
    let txResult: { alreadyProcessed: boolean; payloadConflict?: boolean; verifiedPatron: any };
    try {
      txResult = await repository.runTransaction(async (txRepo) => {
        const payloadHash = crypto.createHash('sha256').update(rawBodyBuf).digest('hex');
        const existingEvent = await txRepo.getWebhookEvent(payload.idempotencyKey);
        
        if (existingEvent) {
          if (existingEvent.payloadHash !== payloadHash) {
            return { alreadyProcessed: true, payloadConflict: true, verifiedPatron: null };
          }
          return { alreadyProcessed: true, payloadConflict: false, verifiedPatron: null };
        }

        const isProcessed = await txRepo.isWebhookProcessed(payload.idempotencyKey);
        if (isProcessed) {
          return { alreadyProcessed: true, payloadConflict: false, verifiedPatron: null };
        }

        // Record webhook event for complete auditability
        await txRepo.recordWebhookEvent({
          id: `wh_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
          idempotencyKey: payload.idempotencyKey,
          provider: payload.provider,
          payloadHash,
          processedAt: new Date().toISOString()
        });

        // Update Patron to VERIFIED
        const verified = await txRepo.verifyPatron(payload.patronId, payload.paymentReference, 'WEBHOOK_VERIFIED');
        return { alreadyProcessed: false, verifiedPatron: verified };
      });
    } catch (txErr: any) {
      // Gracefully catch concurrent unique constraint violation (PostgreSQL 23505 or DUPLICATE_IDEMPOTENCY_KEY)
      if (
        txErr.code === '23505' || 
        String(txErr.message).includes('idempotency_key') ||
        String(txErr.message).includes('DUPLICATE_IDEMPOTENCY_KEY')
      ) {
        txResult = { alreadyProcessed: true, payloadConflict: false, verifiedPatron: await repository.getPatronById(payload.patronId) };
      } else {
        throw txErr;
      }
    }

    if (txResult.alreadyProcessed) {
      if (txResult.payloadConflict) {
        return res.status(409).json({
          error: {
            code: 'IDEMPOTENCY_KEY_PAYLOAD_MISMATCH',
            message: 'Idempotency key này đã được sử dụng với payload khác. Không được phép tái sử dụng key.'
          }
        });
      }
      return res.json({
        status: 'ALREADY_PROCESSED',
        idempotencyKey: payload.idempotencyKey,
        message: 'Giao dịch webhook này đã được xử lý trước đó.'
      });
    }

    return res.json({
      success: true,
      patronId: payload.patronId,
      status: 'VERIFIED',
      patron: txResult.verifiedPatron
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: {
          code: 'MALFORMED_WEBHOOK_PAYLOAD',
          message: 'Dữ liệu webhook không đúng định dạng',
          details: err.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
        }
      });
    }
    return res.status(500).json({ error: 'Lỗi xử lý webhook thanh toán', details: isProd ? undefined : err.message });
  }
});

// ----------------------------------------------------
// 12. CENTRALIZED ERROR HANDLING MIDDLEWARE
// ----------------------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        category: 'VALIDATION_ERROR',
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu đầu vào không hợp lệ',
        details: err.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message
        })),
        requestId: req.requestId
      }
    });
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  console.error(`[Error ${req.requestId}] ${req.method} ${req.originalUrl}:`, err?.message || err);

  let category = 'INTERNAL_ERROR';
  if (statusCode === 400) category = 'VALIDATION_ERROR';
  else if (statusCode === 401) category = 'AUTH_ERROR';
  else if (statusCode === 403) category = 'AUTHORIZATION_ERROR';
  else if (statusCode === 404) category = 'NOT_FOUND_ERROR';
  else if (statusCode === 409) category = 'CONFLICT_ERROR';
  else if (statusCode === 429) category = 'RATE_LIMIT_ERROR';
  else if (statusCode >= 502 && statusCode <= 504) category = 'UPSTREAM_SERVICE_ERROR';
  else if (err.code?.includes('DB_') || err.code?.includes('POSTGRES')) category = 'DATABASE_ERROR';
  else if (err.code?.includes('AI_')) category = 'AI_PROVIDER_ERROR';
  else if (err.code?.includes('CALC_')) category = 'CALCULATION_ERROR';

  const safeMessage = (statusCode === 500 && process.env.NODE_ENV === 'production')
    ? 'Đã xảy ra lỗi nội bộ hệ thống trong quá trình xử lý yêu cầu.'
    : (err.message || 'Đã xảy ra lỗi trong quá trình xử lý');

  res.status(statusCode).json({
    error: {
      category,
      code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
      message: safeMessage,
      requestId: req.requestId
    }
  });
});

// 404 Handler for undefined API routes (prevent falling through to HTML index.html)
// Mounted on app instance directly so it applies in both standalone and serverless environments
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      category: 'NOT_FOUND_ERROR',
      code: 'API_ENDPOINT_NOT_FOUND',
      message: `Đường dẫn API '${req.method} ${req.path}' không tồn tại trên hệ thống.`,
      requestId: req.requestId
    }
  });
});

// ----------------------------------------------------
// 12B. UNIFIED APPLICATION BOOTSTRAP & INITIALIZATION
// Synchronizes cold-start, environment validation, database migrations,
// admin bootstrapping and session cleanup across both Node.js & Serverless runtimes.
// ----------------------------------------------------
export function validateProductionConfig(): void {
  if (process.env.NODE_ENV === 'production') {
    const missingVars: string[] = [];
    const rawDbUrl = process.env.DATABASE_URL;
    const isPostgresUrl = typeof rawDbUrl === 'string' &&
      (rawDbUrl.startsWith('postgresql://') || rawDbUrl.startsWith('postgres://')) &&
      !rawDbUrl.toLowerCase().includes('none');

    if (!isPostgresUrl && process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION !== 'true') {
      missingVars.push('MISSING_DATABASE_URL: DATABASE_URL is strictly required for PostgreSQL in production (or set ALLOW_FILE_STORAGE_IN_PRODUCTION=true)');
    }

    if (process.env.REDIS_REQUIRED_IN_PRODUCTION === 'true') {
      const redisUrl = process.env.REDIS_URL;
      const isRedisUrl = typeof redisUrl === 'string' && (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://'));
      if (!isRedisUrl) {
        missingVars.push('MISSING_REDIS_URL: REDIS_URL is strictly required when REDIS_REQUIRED_IN_PRODUCTION=true');
      }
    }

    const secretKey = process.env.ALGORITHM_PROTECTION_SECRET || process.env.APP_SECRET || process.env.SESSION_SECRET;
    if (!secretKey || secretKey.length < 16) {
      missingVars.push('INSECURE_APP_SECRET: ALGORITHM_PROTECTION_SECRET or APP_SECRET or SESSION_SECRET (minimum 16 characters required)');
    }

    if (missingVars.length > 0) {
      console.error('🚨 [FATAL STARTUP] Critical production environment variable(s) missing or insecure:');
      missingVars.forEach(v => console.error(`   - ${v}`));
      throw new Error(`Critical environment variables missing or invalid in production: ${missingVars.join(', ')}`);
    }
  }
}

let isAppInitialized = false;
let appInitPromise: Promise<void> | null = null;
let appInitError: Error | null = null;

export async function ensureAppInitialized(): Promise<void> {
  if (isAppInitialized) return;
  if (appInitError) throw appInitError;

  if (!appInitPromise) {
    appInitPromise = (async () => {
      try {
        // 1. Validate critical environment variables in production
        validateProductionConfig();

        // 2. Ensure database repository is initialized & migrations ran
        if (repository.ensureInitialized) {
          await repository.ensureInitialized();
        }

        // 3. Dynamic Bootstrap Admin account if configured
        await bootstrapAdminIfConfiguredAsync();

        // 4. Initial cleanup of expired sessions on startup
        try {
          await repository.cleanupExpiredSessions();
        } catch (err) {
          console.error('[Session Cleanup Startup Error]', err);
        }

        isAppInitialized = true;
      } catch (err: any) {
        appInitPromise = null;
        appInitError = err;
        console.error('🚨 [Server Bootstrap] Critical failure during unified application initialization:', err.message);
        throw err;
      }
    })();
  }

  await appInitPromise;
}

// ----------------------------------------------------
// 13. VITE MIDDLEWARE & STATIC ASSETS
// ----------------------------------------------------
async function startServer() {
  await ensureAppInitialized();

  // Periodic expired session purge (every 15 minutes in persistent server environments)
  let cleanupInterval: NodeJS.Timeout | null = null;
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (!isServerless && process.env.DISABLE_BACKGROUND_CLEANUP !== 'true') {
    cleanupInterval = setInterval(async () => {
      try {
        await repository.cleanupExpiredSessions();
      } catch (err) {
        console.error('[Session Cleanup Error]', err);
      }
    }, 15 * 60 * 1000);
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const candidates = [
      path.join(process.cwd(), 'dist'),
      path.resolve(currentDir, 'dist'),
      path.resolve(currentDir, '.')
    ];
    const distPath = candidates.find(dir => fs.existsSync(path.join(dir, 'index.html'))) || candidates[0];
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Aurora Destiny AI Production Server active on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown handling (SIGTERM & SIGINT)
  let isShuttingDown = false;
  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log('🛑 [Shutdown] Received termination signal. Closing server cleanly...');

    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }

    server.close(async () => {
      console.log('✅ [Shutdown] HTTP connections closed.');
      if (repository.close) {
        try {
          await repository.close();
          console.log('✅ [Shutdown] Repository resources flushed and released.');
        } catch (closeErr) {
          console.error('⚠️ [Shutdown] Error closing repository:', closeErr);
        }
      }
      console.log('✅ [Shutdown] Process terminating cleanly.');
      process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown hangs
    setTimeout(() => {
      console.error('⚠️ [Shutdown] Graceful shutdown timed out after 10s. Forcing exit.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  return server;
}

export { app, startServer };
export default app;

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const isTest = process.env.NODE_ENV === 'test' || process.env.DISABLE_SERVER_LISTEN === 'true';

if (!isServerless && !isTest) {
  startServer().catch(err => {
    console.error('🚨 [Server Startup Error]', err);
    process.exit(1);
  });
}

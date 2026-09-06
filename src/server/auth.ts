// ==========================================
// AURORA DESTINY AI — AUTHENTICATION & AUTHORIZATION
// Multi-user isolation, durable sessions, PBKDF2 (100k rounds),
// timing-safe verification, RBAC, and dynamic admin bootstrap.
// ==========================================

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { repository } from '../db/repository';
import { UserAccount, UserRole, StoredSession } from '../types/user';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: UserAccount;
      requestId?: string;
      sessionToken?: string;
    }
  }
}

const DUMMY_SALT = 'aurora_dummy_salt_for_constant_time_comparison';
const DUMMY_HASH = crypto.pbkdf2Sync('dummy_pass', DUMMY_SALT, 100000, 64, 'sha512').toString('hex');

// Helper: Hash password securely with salt using PBKDF2 (100,000 rounds)
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512').toString('hex');
  return { hash: derived, salt: actualSalt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const { hash } = hashPassword(password, salt);
    const hashBuf = Buffer.from(hash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (hashBuf.length !== storedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(hashBuf, storedBuf);
  } catch {
    return false;
  }
}

// Generate secure cryptographically random session token
export function generateToken(): string {
  return `aurora_${crypto.randomBytes(32).toString('hex')}`;
}

// Create persistent session
export function createSession(userId: string, isGuest: boolean = false, durationMs?: number): { token: string; expiresAt: string } {
  // Default session duration: 7 days for registered users, 24 hours for guests
  const effectiveDuration = durationMs || (isGuest ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000);
  const token = generateToken();
  const now = Date.now();
  const expiresAt = now + effectiveDuration;

  const storedSession: StoredSession = {
    token,
    userId,
    expiresAt,
    createdAt: now,
    lastAccessedAt: now,
    isGuest
  };

  repository.saveSession(storedSession);

  return {
    token,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

export function getSessionUser(token: string): UserAccount | null {
  if (!token) return null;
  const session = repository.getSession(token);
  if (!session) return null;
  return repository.getUser(session.userId);
}

export function revokeSession(token: string): boolean {
  if (!token) return false;
  return repository.deleteSession(token);
}

export function registerUser(email: string, password: string, fullName: string, role: UserRole = 'USER'): { user: UserAccount; token: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = repository.getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('Email đã được đăng ký trong hệ thống');
  }

  const { hash, salt } = hashPassword(password);
  const passwordRecord = `${salt}:${hash}`;

  const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const newUser: UserAccount = {
    id: userId,
    email: normalizedEmail,
    fullName: fullName.trim(),
    role,
    subscriptionTier: 'Free',
    language: 'vi',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profilesCount: 0
  };

  const saved = repository.saveUser(newUser, passwordRecord);
  const { token } = createSession(saved.id, false);
  return { user: saved, token };
}

export function loginUser(email: string, password: string): { user: UserAccount; token: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = repository.getUserByEmail(normalizedEmail);

  // Constant-time execution prevents timing attacks leaking email presence
  if (!existing || !existing.passwordHash) {
    verifyPassword(password, DUMMY_HASH, DUMMY_SALT);
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const [salt, storedHash] = existing.passwordHash.split(':');
  if (!salt || !storedHash || !verifyPassword(password, storedHash, salt)) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  existing.lastLoginAt = new Date().toISOString();
  repository.saveUser(existing);

  const { token } = createSession(existing.id, false);
  const { passwordHash: _, ...cleanUser } = existing;
  return { user: cleanUser, token };
}

// Create an isolated guest session with strict limits
export function createGuestSession(): { user: UserAccount; token: string } {
  const guestId = `usr_guest_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const guestUser: UserAccount = {
    id: guestId,
    email: `guest_${guestId}@aurora.internal`,
    fullName: 'Khách Tham Quan',
    role: 'USER',
    subscriptionTier: 'Free',
    language: 'vi',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profilesCount: 0
  };

  const saved = repository.saveUser(guestUser);
  const { token } = createSession(saved.id, true);
  return { user: saved, token };
}

// Dynamic Bootstrap Admin - Only provisions if explicitly configured via environment variables
export function bootstrapAdminIfConfigured(): void {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPass) {
    console.log('ℹ️ [Security] Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD not configured.');
    return;
  }

  const existing = repository.getUserByEmail(adminEmail);
  const { hash, salt } = hashPassword(adminPass);
  const passwordRecord = `${salt}:${hash}`;

  if (existing) {
    existing.role = 'SUPER_ADMIN';
    existing.subscriptionTier = 'Enterprise';
    repository.saveUser(existing, passwordRecord);
    console.log(`🔒 [Security] Administrator account "${adminEmail}" synchronized.`);
  } else {
    const adminUser: UserAccount = {
      id: `usr_admin_${crypto.randomBytes(4).toString('hex')}`,
      email: adminEmail,
      fullName: 'Quản Trị Viên Hệ Thống',
      role: 'SUPER_ADMIN',
      subscriptionTier: 'Enterprise',
      language: 'vi',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      profilesCount: 0
    };
    repository.saveUser(adminUser, passwordRecord);
    console.log(`🔒 [Security] Bootstrapped administrator account "${adminEmail}".`);
  }
}

// Express Middleware: Extract user from Authorization or x-session-token header
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-session-token']) {
    token = String(req.headers['x-session-token']).trim();
  }

  if (token) {
    req.sessionToken = token;
    const user = getSessionUser(token);
    if (user) {
      req.user = user;
    }
  }

  next();
}

// Express Middleware: Require Authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Yêu cầu phiên đăng nhập để truy cập tài nguyên này',
        requestId: req.requestId
      }
    });
  }
  next();
}

// Express Middleware: Require Admin Role
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Yêu cầu đăng nhập',
        requestId: req.requestId
      }
    });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    repository.logAudit({
      userId: req.user.id,
      action: 'ADMIN_ACCESS_DENIED',
      resource: req.originalUrl,
      status: 'BLOCKED',
      requestId: req.requestId
    });

    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Bạn không có đặc quyền quản trị viên để thực hiện thao tác này',
        requestId: req.requestId
      }
    });
  }

  next();
}

// Helper: Verify profile ownership strictly
export function verifyProfileOwnership(req: Request, res: Response, profileId: string): any {
  if (!req.user) {
    res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Yêu cầu xác thực tài khoản',
        requestId: req.requestId
      }
    });
    return null;
  }

  const profile = repository.getProfile(profileId);
  if (!profile) {
    res.status(404).json({
      error: {
        code: 'PROFILE_NOT_FOUND',
        message: `Không tìm thấy hồ sơ với mã: ${profileId}`,
        requestId: req.requestId
      }
    });
    return null;
  }

  // Strict ownership check
  if (profile.userId !== req.user.id) {
    // Only SUPER_ADMIN can inspect with explicit audit trail
    if (req.user.role === 'SUPER_ADMIN') {
      repository.logAudit({
        userId: req.user.id,
        action: 'SUPER_ADMIN_CROSS_PROFILE_READ',
        resource: 'profile',
        resourceId: profileId,
        status: 'SUCCESS',
        requestId: req.requestId
      });
      return profile;
    }

    repository.logAudit({
      userId: req.user.id,
      action: 'CROSS_USER_PROFILE_ACCESS_BLOCKED',
      resource: 'profile',
      resourceId: profileId,
      status: 'BLOCKED',
      requestId: req.requestId
    });

    res.status(403).json({
      error: {
        code: 'FORBIDDEN_PROFILE_ACCESS',
        message: 'Bạn không có quyền truy cập hoặc chỉnh sửa hồ sơ này',
        requestId: req.requestId
      }
    });
    return null;
  }

  return profile;
}

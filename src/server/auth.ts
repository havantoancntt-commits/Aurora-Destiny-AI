// ==========================================
// AURORA DESTINY AI — AUTHENTICATION & AUTHORIZATION
// Multi-user isolation, secure session tokens & RBAC
// ==========================================

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { repository } from '../db/repository';
import { UserAccount, UserRole } from '../types/user';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: UserAccount;
      requestId?: string;
    }
  }
}

// Active session token store: token -> { userId, expiresAt }
interface ActiveSession {
  userId: string;
  expiresAt: number;
}
const sessionStore = new Map<string, ActiveSession>();

// Helper: Hash password securely with salt using PBKDF2
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(password, actualSalt, 10000, 64, 'sha512').toString('hex');
  return { hash: derived, salt: actualSalt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

// Generate secure random session token
export function generateToken(): string {
  return `aurora_${crypto.randomBytes(32).toString('hex')}`;
}

export function createSession(userId: string, durationMs: number = 7 * 24 * 60 * 60 * 1000): { token: string; expiresAt: string } {
  const token = generateToken();
  const expiresAt = Date.now() + durationMs;
  sessionStore.set(token, { userId, expiresAt });
  return {
    token,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

export function getSessionUser(token: string): UserAccount | null {
  if (!token) return null;
  const session = sessionStore.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessionStore.delete(token);
    return null;
  }
  return repository.getUser(session.userId);
}

export function registerUser(email: string, password: string, fullName: string, role: UserRole = 'USER'): { user: UserAccount; token: string } {
  const existing = repository.getUserByEmail(email);
  if (existing) {
    throw new Error('Email đã được đăng ký trong hệ thống');
  }

  const { hash, salt } = hashPassword(password);
  const passwordRecord = `${salt}:${hash}`;

  const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const newUser: UserAccount = {
    id: userId,
    email: email.toLowerCase().trim(),
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
  const { token } = createSession(saved.id);
  return { user: saved, token };
}

export function loginUser(email: string, password: string): { user: UserAccount; token: string } {
  const existing = repository.getUserByEmail(email);
  if (!existing || !existing.passwordHash) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const [salt, storedHash] = existing.passwordHash.split(':');
  if (!salt || !storedHash || !verifyPassword(password, storedHash, salt)) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  existing.lastLoginAt = new Date().toISOString();
  repository.saveUser(existing);

  const { token } = createSession(existing.id);
  const { passwordHash: _, ...cleanUser } = existing;
  return { user: cleanUser, token };
}

// Create an isolated guest session so every unique visitor has their own isolated profile state
export function createGuestSession(): { user: UserAccount; token: string } {
  const guestId = `usr_guest_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const guestUser: UserAccount = {
    id: guestId,
    email: `guest_${guestId}@aurora.internal`,
    fullName: 'Nhà Khám Phá Định Mệnh',
    role: 'USER',
    subscriptionTier: 'Free',
    language: 'vi',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profilesCount: 0
  };

  const saved = repository.saveUser(guestUser);
  const { token } = createSession(saved.id);
  return { user: saved, token };
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

  // Strict ownership check: Only owner or SUPER_ADMIN can access
  if (profile.userId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
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

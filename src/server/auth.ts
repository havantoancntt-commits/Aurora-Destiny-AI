// ==========================================
// AURORA DESTINY AI — AUTHENTICATION & AUTHORIZATION
// Multi-user isolation, durable sessions, PBKDF2 (100,000 rounds, SHA-512),
// timing-safe verification, RBAC, and dynamic admin bootstrap.
// 
// ARCHITECTURAL RATIONALE FOR PBKDF2:
// 1. Native Node.js crypto module integration without external C/C++ bindings (no node-gyp or prebuild issues on Alpine/Docker containers).
// 2. 100,000 rounds with HMAC-SHA-512 ensures FIPS-compliance and high computational cost against offline GPU/ASIC rainbow table brute-forcing.
// 3. Constant-time timing-safe comparisons via crypto.timingSafeEqual prevent side-channel timing attacks.
// 4. Zero third-party attack surface or native runtime memory leaks.
// ==========================================

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { promisify } from 'util';
import { repository } from '../db/repository';
import { UserAccount, UserRole, StoredSession } from '../types/user';

const pbkdf2Async = promisify(crypto.pbkdf2);

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

// Non-blocking async password hashing (prevents Node.js event loop starvation under concurrency)
export async function hashPasswordAsync(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = await pbkdf2Async(password, actualSalt, 100000, 64, 'sha512');
  return { hash: derived.toString('hex'), salt: actualSalt };
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

export async function verifyPasswordAsync(password: string, storedHash: string, salt: string): Promise<boolean> {
  try {
    const { hash } = await hashPasswordAsync(password, salt);
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

// Create persistent session (Async)
export async function createSessionAsync(userId: string, isGuest: boolean = false, durationMs?: number): Promise<{ token: string; expiresAt: string }> {
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

  await repository.saveSession(storedSession);

  return {
    token,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

// Create persistent session (Sync / Fire-and-forget fallback)
export function createSession(userId: string, isGuest: boolean = false, durationMs?: number): { token: string; expiresAt: string } {
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

  const savePromise = repository.saveSession(storedSession);
  if (savePromise && typeof savePromise.catch === 'function') {
    savePromise.catch((err: any) => console.error('[Session] Async save error:', err));
  }

  return {
    token,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

export async function getSessionUserAsync(token: string): Promise<UserAccount | null> {
  if (!token) return null;
  const session = await repository.getSession(token);
  if (!session) return null;
  return await repository.getUser(session.userId);
}

export function getSessionUser(token: string): UserAccount | null {
  if (!token) return null;
  const repoAny = repository as any;
  const session = repoAny.getSessionSync ? repoAny.getSessionSync(token) : null;
  if (!session) return null;
  return repoAny.getUserSync ? repoAny.getUserSync(session.userId) : null;
}

export async function revokeSessionAsync(token: string): Promise<boolean> {
  if (!token) return false;
  return await repository.deleteSession(token);
}

export function revokeSession(token: string): boolean {
  if (!token) return false;
  const repoAny = repository as any;
  if (repoAny.deleteSessionSync) return repoAny.deleteSessionSync(token);
  repository.deleteSession(token);
  return true;
}

export async function registerUserAsync(email: string, password: string, fullName: string, role: UserRole = 'USER'): Promise<{ user: UserAccount; token: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await repository.getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('Email đã được đăng ký trong hệ thống');
  }

  const { hash, salt } = await hashPasswordAsync(password);
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

  const saved = await repository.saveUser(newUser, passwordRecord);
  const { token } = await createSessionAsync(saved.id, false);
  return { user: saved, token };
}

export function registerUser(email: string, password: string, fullName: string, role: UserRole = 'USER'): { user: UserAccount; token: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const repoAny = repository as any;
  const existing = repoAny.getUserByEmailSync ? repoAny.getUserByEmailSync(normalizedEmail) : null;
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

  const saved = repoAny.saveUserSync ? repoAny.saveUserSync(newUser, passwordRecord) : newUser;
  const { token } = createSession(saved.id, false);
  return { user: saved, token };
}

export async function loginUserAsync(email: string, password: string, currentSessionToken?: string): Promise<{ user: UserAccount; token: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await repository.getUserByEmail(normalizedEmail);

  // Constant-time execution prevents timing attacks leaking email presence
  if (!existing || !existing.passwordHash) {
    await verifyPasswordAsync(password, DUMMY_HASH, DUMMY_SALT);
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const [salt, storedHash] = existing.passwordHash.split(':');
  if (!salt || !storedHash || !(await verifyPasswordAsync(password, storedHash, salt))) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  // Session rotation: revoke previous session token to prevent session fixation attacks
  if (currentSessionToken) {
    await repository.deleteSession(currentSessionToken);
  }

  existing.lastLoginAt = new Date().toISOString();
  await repository.saveUser(existing);

  const { token } = await createSessionAsync(existing.id, false);
  const { passwordHash: _, ...cleanUser } = existing;
  return { user: cleanUser, token };
}

export function loginUser(email: string, password: string, currentSessionToken?: string): { user: UserAccount; token: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const repoAny = repository as any;
  const existing = repoAny.getUserByEmailSync ? repoAny.getUserByEmailSync(normalizedEmail) : null;

  // Constant-time execution prevents timing attacks leaking email presence
  if (!existing || !existing.passwordHash) {
    verifyPassword(password, DUMMY_HASH, DUMMY_SALT);
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const [salt, storedHash] = existing.passwordHash.split(':');
  if (!salt || !storedHash || !verifyPassword(password, storedHash, salt)) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  // Session rotation: revoke previous session token to prevent session fixation attacks
  if (currentSessionToken) {
    if (repoAny.deleteSessionSync) {
      repoAny.deleteSessionSync(currentSessionToken);
    } else {
      repository.deleteSession(currentSessionToken);
    }
  }

  existing.lastLoginAt = new Date().toISOString();
  if (repoAny.saveUserSync) {
    repoAny.saveUserSync(existing);
  } else {
    repository.saveUser(existing);
  }

  const { token } = createSession(existing.id, false);
  const { passwordHash: _, ...cleanUser } = existing;
  return { user: cleanUser, token };
}

// Password Reset workflow (time-bound, single-use token) - Async
export async function requestPasswordResetAsync(email: string): Promise<{ resetToken: string; expiresAt: number } | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await repository.getUserByEmail(normalizedEmail);
  if (!user || user.isGuest) {
    // Constant-time dummy verification prevents account enumeration
    await verifyPasswordAsync('dummy_pass', DUMMY_HASH, DUMMY_SALT);
    return null;
  }
  const created = await repository.createPasswordReset(user.id);
  return { resetToken: created.token, expiresAt: created.expiresAt };
}

// Password Reset workflow (Sync fallback)
export function requestPasswordReset(email: string): { resetToken: string; expiresAt: number } | null {
  const normalizedEmail = email.toLowerCase().trim();
  const repoAny = repository as any;
  const user = repoAny.getUserByEmailSync ? repoAny.getUserByEmailSync(normalizedEmail) : null;
  if (!user || user.isGuest) {
    verifyPassword('dummy_pass', DUMMY_HASH, DUMMY_SALT);
    return null;
  }
  const created = repoAny.createPasswordResetSync ? repoAny.createPasswordResetSync(user.id) : null;
  if (!created) return null;
  return { resetToken: created.token, expiresAt: created.expiresAt };
}

export async function resetPasswordWithTokenAsync(token: string, newPassword: string): Promise<boolean> {
  const userId = await repository.verifyAndConsumePasswordReset(token);
  if (!userId) {
    return false;
  }
  const user = await repository.getUser(userId);
  if (!user) {
    return false;
  }

  const { hash, salt } = await hashPasswordAsync(newPassword);
  await repository.saveUser(user, `${salt}:${hash}`);
  // Invalidate all active sessions for this user upon password reset
  await repository.revokeUserSessions(userId);
  return true;
}

export function resetPasswordWithToken(token: string, newPassword: string): boolean {
  const repoAny = repository as any;
  const userId = repoAny.verifyAndConsumePasswordResetSync ? repoAny.verifyAndConsumePasswordResetSync(token) : null;
  if (!userId) {
    return false;
  }
  const user = repoAny.getUserSync ? repoAny.getUserSync(userId) : null;
  if (!user) {
    return false;
  }

  const { hash, salt } = hashPassword(newPassword);
  if (repoAny.saveUserSync) {
    repoAny.saveUserSync(user, `${salt}:${hash}`);
  } else {
    repository.saveUser(user, `${salt}:${hash}`);
  }
  // Invalidate all active sessions for this user upon password reset
  if (repoAny.revokeUserSessionsSync) {
    repoAny.revokeUserSessionsSync(userId);
  } else {
    repository.revokeUserSessions(userId);
  }
  return true;
}

// Create an isolated guest session with strict limits (Async)
export async function createGuestSessionAsync(): Promise<{ user: UserAccount; token: string }> {
  const guestId = `usr_guest_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const guestUser: UserAccount = {
    id: guestId,
    email: `guest_${guestId}@aurora.internal`,
    fullName: 'Khách Tham Quan',
    role: 'GUEST',
    subscriptionTier: 'Free',
    language: 'vi',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profilesCount: 0
  };

  const saved = await repository.saveUser(guestUser);
  const { token } = await createSessionAsync(saved.id, true);
  return { user: saved, token };
}

// Create an isolated guest session (Sync fallback)
export function createGuestSession(): { user: UserAccount; token: string } {
  const guestId = `usr_guest_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const guestUser: UserAccount = {
    id: guestId,
    email: `guest_${guestId}@aurora.internal`,
    fullName: 'Khách Tham Quan',
    role: 'GUEST',
    subscriptionTier: 'Free',
    language: 'vi',
    emailVerified: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    profilesCount: 0
  };

  const repoAny = repository as any;
  const saved = repoAny.saveUserSync ? repoAny.saveUserSync(guestUser) : guestUser;
  const { token } = createSession(saved.id, true);
  return { user: saved, token };
}

// Dynamic Bootstrap Admin (Async)
export async function bootstrapAdminIfConfiguredAsync(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPass) {
    console.log('ℹ️ [Security] Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD not configured.');
    return;
  }

  const existing = await repository.getUserByEmail(adminEmail);
  const { hash, salt } = await hashPasswordAsync(adminPass);
  const passwordRecord = `${salt}:${hash}`;

  if (existing) {
    if (process.env.ADMIN_BOOTSTRAP_FORCE === 'true') {
      existing.role = 'SUPER_ADMIN';
      existing.subscriptionTier = 'Enterprise';
      await repository.saveUser(existing, passwordRecord);
      console.log(`🔒 [Security] Administrator account "${adminEmail}" forcibly synchronized via ADMIN_BOOTSTRAP_FORCE.`);
    } else {
      console.log(`🔒 [Security] Administrator account "${adminEmail}" already provisioned. Skipping credential overwrite to preserve state across deployments (set ADMIN_BOOTSTRAP_FORCE=true to override).`);
    }
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
    await repository.saveUser(adminUser, passwordRecord);
    console.log(`🔒 [Security] Bootstrapped administrator account "${adminEmail}".`);
  }
}

// Dynamic Bootstrap Admin (Sync fallback)
export function bootstrapAdminIfConfigured(): void {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPass) {
    console.log('ℹ️ [Security] Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD not configured.');
    return;
  }

  const repoAny = repository as any;
  const existing = repoAny.getUserByEmailSync ? repoAny.getUserByEmailSync(adminEmail) : null;
  const { hash, salt } = hashPassword(adminPass);
  const passwordRecord = `${salt}:${hash}`;

  if (existing) {
    if (process.env.ADMIN_BOOTSTRAP_FORCE === 'true') {
      existing.role = 'SUPER_ADMIN';
      existing.subscriptionTier = 'Enterprise';
      if (repoAny.saveUserSync) {
        repoAny.saveUserSync(existing, passwordRecord);
      } else {
        repository.saveUser(existing, passwordRecord);
      }
      console.log(`🔒 [Security] Administrator account "${adminEmail}" forcibly synchronized via ADMIN_BOOTSTRAP_FORCE.`);
    } else {
      console.log(`🔒 [Security] Administrator account "${adminEmail}" already provisioned. Skipping credential overwrite to preserve state across deployments (set ADMIN_BOOTSTRAP_FORCE=true to override).`);
    }
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
    if (repoAny.saveUserSync) {
      repoAny.saveUserSync(adminUser, passwordRecord);
    } else {
      repository.saveUser(adminUser, passwordRecord);
    }
    console.log(`🔒 [Security] Bootstrapped administrator account "${adminEmail}".`);
  }
}

// Express Middleware: Extract user from Cookie, Authorization or x-session-token header
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token = '';

  // 1. Extract from parsed cookies or raw Cookie header
  if ((req as any).cookies && (req as any).cookies['aurora_session']) {
    token = (req as any).cookies['aurora_session'];
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)aurora_session=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  // 2. Fallback to Authorization Bearer or x-session-token header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-session-token']) {
      token = String(req.headers['x-session-token']).trim();
    }
  }

  if (token) {
    req.sessionToken = token;
    try {
      const user = await getSessionUserAsync(token);
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore lookup error
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
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
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
    await repository.logAudit({
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

// Helper: Verify profile ownership strictly (Async)
export async function verifyProfileOwnershipAsync(req: Request, res: Response, profileId: string): Promise<any> {
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

  const profile = await repository.getProfile(profileId);
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
      await repository.logAudit({
        userId: req.user.id,
        action: 'SUPER_ADMIN_CROSS_PROFILE_READ',
        resource: 'profile',
        resourceId: profileId,
        status: 'SUCCESS',
        requestId: req.requestId
      });
      return profile;
    }

    await repository.logAudit({
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

// Helper: Verify profile ownership strictly (Sync fallback)
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

  const repoAny = repository as any;
  const profile = repoAny.getProfileSync ? repoAny.getProfileSync(profileId) : null;
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
    if (req.user.role === 'SUPER_ADMIN') {
      if (repoAny.logAuditSync) {
        repoAny.logAuditSync({
          userId: req.user.id,
          action: 'SUPER_ADMIN_CROSS_PROFILE_READ',
          resource: 'profile',
          resourceId: profileId,
          status: 'SUCCESS',
          requestId: req.requestId
        });
      } else {
        repository.logAudit({
          userId: req.user.id,
          action: 'SUPER_ADMIN_CROSS_PROFILE_READ',
          resource: 'profile',
          resourceId: profileId,
          status: 'SUCCESS',
          requestId: req.requestId
        });
      }
      return profile;
    }

    if (repoAny.logAuditSync) {
      repoAny.logAuditSync({
        userId: req.user.id,
        action: 'CROSS_USER_PROFILE_ACCESS_BLOCKED',
        resource: 'profile',
        resourceId: profileId,
        status: 'BLOCKED',
        requestId: req.requestId
      });
    } else {
      repository.logAudit({
        userId: req.user.id,
        action: 'CROSS_USER_PROFILE_ACCESS_BLOCKED',
        resource: 'profile',
        resourceId: profileId,
        status: 'BLOCKED',
        requestId: req.requestId
      });
    }

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

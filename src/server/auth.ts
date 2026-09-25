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
import { UserAccount, UserRole, StoredSession, UserProfile } from '../types/user';

const pbkdf2Async = promisify(crypto.pbkdf2);

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: UserAccount;
      requestId?: string;
      sessionToken?: string;
      cookies?: Record<string, string>;
    }
  }
}

// Dev/Test helper interface for legacy synchronous repository calls
interface LegacySyncRepository {
  getUserSync?: (id: string) => UserAccount | null;
  getUserByEmailSync?: (email: string) => (UserAccount & { passwordHash?: string }) | null;
  saveUserSync?: (user: UserAccount, passwordRecord?: string) => UserAccount;
  getSessionSync?: (token: string) => StoredSession | null;
  deleteSessionSync?: (token: string) => boolean;
  createPasswordResetSync?: (userId: string) => { token: string; expiresAt: number } | null;
  verifyAndConsumePasswordResetSync?: (token: string) => string | null;
  revokeUserSessionsSync?: (userId: string) => void;
  getProfileSync?: (id: string) => UserProfile | null;
  logAuditSync?: (entry: unknown) => void;
}

function getSyncRepo(): LegacySyncRepository {
  return repository as unknown as LegacySyncRepository;
}

export const DEFAULT_PBKDF2_ROUNDS = 210000;
export const LEGACY_PBKDF2_ROUNDS = 100000;

const DUMMY_SALT = 'aurora_dummy_salt_for_constant_time_comparison';
const DUMMY_HASH = crypto.pbkdf2Sync('dummy_pass', DUMMY_SALT, DEFAULT_PBKDF2_ROUNDS, 64, 'sha512').toString('hex');

export interface PasswordHashResult {
  hash: string;
  salt: string;
  rounds: number;
  record: string;
}

// Helper: Hash password securely with salt using PBKDF2 (210,000 rounds per OWASP guidelines)
export function hashPassword(password: string, salt?: string, rounds: number = DEFAULT_PBKDF2_ROUNDS): PasswordHashResult {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(password, actualSalt, rounds, 64, 'sha512').toString('hex');
  return { hash: derived, salt: actualSalt, rounds, record: `v2:${rounds}:${actualSalt}:${derived}` };
}

// Non-blocking async password hashing (prevents Node.js event loop starvation under concurrency)
export async function hashPasswordAsync(password: string, salt?: string, rounds: number = DEFAULT_PBKDF2_ROUNDS): Promise<PasswordHashResult> {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = await pbkdf2Async(password, actualSalt, rounds, 64, 'sha512');
  const derivedHex = derived.toString('hex');
  return { hash: derivedHex, salt: actualSalt, rounds, record: `v2:${rounds}:${actualSalt}:${derivedHex}` };
}

export function parsePasswordRecord(storedRecord: string): { rounds: number; salt: string; hash: string; isVersion2: boolean } {
  if (storedRecord.startsWith('v2:')) {
    const parts = storedRecord.split(':');
    const rounds = parseInt(parts[1] || `${DEFAULT_PBKDF2_ROUNDS}`, 10) || DEFAULT_PBKDF2_ROUNDS;
    const salt = parts[2] || '';
    const hash = parts[3] || '';
    return { rounds, salt, hash, isVersion2: true };
  } else {
    const [salt, hash] = storedRecord.split(':');
    return { rounds: LEGACY_PBKDF2_ROUNDS, salt: salt || '', hash: hash || '', isVersion2: false };
  }
}

export function verifyPassword(password: string, storedHash: string, salt: string, rounds: number = DEFAULT_PBKDF2_ROUNDS): boolean {
  try {
    const { hash } = hashPassword(password, salt, rounds);
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

export async function verifyPasswordAsync(password: string, storedHash: string, salt: string, rounds: number = DEFAULT_PBKDF2_ROUNDS): Promise<boolean> {
  try {
    const { hash } = await hashPasswordAsync(password, salt, rounds);
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

// Short-lived access token and refresh token constants for Mobile/API mode
export const SHORT_LIVED_ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface ApiTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: 'Bearer';
}

export interface AuthResult {
  user: UserAccount;
  token: string; // Provided for setting cookies or API access
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  sessionMode: 'cookie' | 'token';
}

// Generate secure cryptographically random session token
export function generateToken(prefix: string = 'aurora_'): string {
  return `${prefix}${crypto.randomBytes(32).toString('hex')}`;
}

// Create persistent session (Async) for browser HttpOnly cookies
export async function createSessionAsync(userId: string, isGuest: boolean = false, durationMs?: number): Promise<{ token: string; expiresAt: string }> {
  const effectiveDuration = durationMs || (isGuest ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000);
  const token = generateToken('aurora_sess_');
  const now = Date.now();
  const expiresAt = now + effectiveDuration;

  const storedSession: StoredSession = {
    token,
    userId,
    expiresAt,
    createdAt: now,
    lastAccessedAt: now,
    isGuest,
    clientType: 'browser'
  };

  await repository.saveSession(storedSession);

  return {
    token,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

// Mutex map for atomic in-flight rotation deduplication
const refreshMutexes = new Map<string, Promise<ApiTokenPair>>();

// Create short-lived access token & refresh token pair for Mobile/API mode
export async function createApiSessionAsync(
  userId: string,
  isGuest: boolean = false,
  existingFamily?: string
): Promise<ApiTokenPair> {
  const tokenFamily = existingFamily || `fam_${crypto.randomBytes(16).toString('hex')}`;
  const accessToken = generateToken('aurora_at_');
  const refreshToken = generateToken('aurora_rt_');
  const now = Date.now();
  const accessDuration = isGuest ? 2 * 60 * 60 * 1000 : SHORT_LIVED_ACCESS_TOKEN_TTL_MS; // 15 min
  const refreshDuration = isGuest ? 24 * 60 * 60 * 1000 : REFRESH_TOKEN_TTL_MS; // 30 days

  // Save access token session
  await repository.saveSession({
    token: accessToken,
    userId,
    expiresAt: now + accessDuration,
    createdAt: now,
    lastAccessedAt: now,
    isGuest,
    clientType: 'api',
    refreshToken,
    tokenFamily
  });

  // Save refresh token session (stored securely in session repository)
  await repository.saveSession({
    token: refreshToken,
    userId,
    expiresAt: now + refreshDuration,
    createdAt: now,
    lastAccessedAt: now,
    isGuest,
    clientType: 'api',
    refreshToken: accessToken,
    tokenFamily
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: Math.floor(accessDuration / 1000),
    tokenType: 'Bearer'
  };
}

// Rotate refresh token with anti-replay detection and concurrent session safety
export async function rotateRefreshTokenAsync(
  refreshToken: string
): Promise<ApiTokenPair> {
  if (!refreshToken || typeof refreshToken !== 'string' || !refreshToken.startsWith('aurora_rt_')) {
    throw new Error('Mã làm mới không hợp lệ hoặc không đúng định dạng');
  }

  // Deduplicate near-simultaneous concurrent refresh calls with the exact same token
  if (refreshMutexes.has(refreshToken)) {
    return await refreshMutexes.get(refreshToken)!;
  }

  const rotationPromise = (async () => {
    const session = await repository.getSession(refreshToken);
    if (!session) {
      throw new Error('Mã làm mới không hợp lệ hoặc đã bị thu hồi');
    }

    // REPLAY ATTACK DETECTION: Token has already been used/revoked!
    if (session.revokedAt) {
      if (session.tokenFamily && (repository as any).revokeTokenFamily) {
        await (repository as any).revokeTokenFamily(session.tokenFamily);
      }
      throw new Error('Cảnh báo bảo mật: Phát hiện mã làm mới đã từng sử dụng (Replay Attack). Toàn bộ phiên đã bị thu hồi.');
    }

    if (Date.now() > session.expiresAt) {
      await repository.deleteSession(refreshToken);
      throw new Error('Mã làm mới đã hết hạn, vui lòng đăng nhập lại');
    }

    // Invalidate old access token if linked
    if (session.refreshToken) {
      await repository.deleteSession(session.refreshToken);
    }

    // Mark old refresh token as revoked immediately so subsequent reuse is caught as replay
    session.revokedAt = Date.now();
    await repository.saveSession(session);

    // Issue new pair (refresh token rotation under same token family)
    return await createApiSessionAsync(session.userId, !!session.isGuest, session.tokenFamily);
  })();

  refreshMutexes.set(refreshToken, rotationPromise);
  try {
    return await rotationPromise;
  } finally {
    refreshMutexes.delete(refreshToken);
  }
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
  if (!session || session.revokedAt) return null;
  if (Date.now() > session.expiresAt) {
    await repository.deleteSession(token);
    return null;
  }
  return await repository.getUser(session.userId);
}

export function getSessionUser(token: string): UserAccount | null {
  if (!token) return null;
  const syncRepo = getSyncRepo();
  const session = syncRepo.getSessionSync ? syncRepo.getSessionSync(token) : null;
  if (!session || session.revokedAt) return null;
  if (Date.now() > session.expiresAt) {
    if (syncRepo.deleteSessionSync) syncRepo.deleteSessionSync(token);
    return null;
  }
  return syncRepo.getUserSync ? syncRepo.getUserSync(session.userId) : null;
}

export async function revokeSessionAsync(token: string): Promise<boolean> {
  if (!token) return false;
  const session = await repository.getSession(token);
  if (session) {
    if (session.refreshToken) {
      await repository.deleteSession(session.refreshToken);
    }
    if (session.tokenFamily && (repository as any).revokeTokenFamily) {
      await (repository as any).revokeTokenFamily(session.tokenFamily);
    }
  }
  return await repository.deleteSession(token);
}

export function revokeSession(token: string): boolean {
  if (!token) return false;
  const syncRepo = getSyncRepo();
  if (syncRepo.deleteSessionSync) return syncRepo.deleteSessionSync(token);
  repository.deleteSession(token);
  return true;
}

export async function registerUserAsync(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = 'USER',
  clientType: 'browser' | 'api' | 'mobile' = 'browser'
): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await repository.getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('Email đã được đăng ký trong hệ thống');
  }

  const { record } = await hashPasswordAsync(password);
  const passwordRecord = record;

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

  if (clientType === 'api' || clientType === 'mobile') {
    const tokens = await createApiSessionAsync(saved.id, false);
    return {
      user: saved,
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      sessionMode: 'token'
    };
  }

  const { token } = await createSessionAsync(saved.id, false);
  return { user: saved, token, sessionMode: 'cookie' };
}

export function registerUser(email: string, password: string, fullName: string, role: UserRole = 'USER'): { user: UserAccount; token: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const syncRepo = getSyncRepo();
  const existing = syncRepo.getUserByEmailSync ? syncRepo.getUserByEmailSync(normalizedEmail) : null;
  if (existing) {
    throw new Error('Email đã được đăng ký trong hệ thống');
  }

  const { record } = hashPassword(password);
  const passwordRecord = record;

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

  const saved = syncRepo.saveUserSync ? syncRepo.saveUserSync(newUser, passwordRecord) : newUser;
  const { token } = createSession(saved.id, false);
  return { user: saved, token };
}

export async function loginUserAsync(
  email: string,
  password: string,
  currentSessionToken?: string,
  clientType: 'browser' | 'api' | 'mobile' = 'browser'
): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await repository.getUserByEmail(normalizedEmail);

  // Constant-time execution prevents timing attacks leaking email presence
  if (!existing || !existing.passwordHash) {
    await verifyPasswordAsync(password, DUMMY_HASH, DUMMY_SALT, DEFAULT_PBKDF2_ROUNDS);
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const parsed = parsePasswordRecord(existing.passwordHash);
  if (!parsed.salt || !parsed.hash || !(await verifyPasswordAsync(password, parsed.hash, parsed.salt, parsed.rounds))) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  // Seamless auto-upgrade legacy hashes or lower iterations to v2:210000
  let upgradedRecord: string | undefined;
  if (!parsed.isVersion2 || parsed.rounds < DEFAULT_PBKDF2_ROUNDS) {
    const upgraded = await hashPasswordAsync(password);
    upgradedRecord = upgraded.record;
  }

  // Session rotation: revoke previous session token to prevent session fixation attacks
  if (currentSessionToken) {
    await repository.deleteSession(currentSessionToken);
  }

  existing.lastLoginAt = new Date().toISOString();
  await repository.saveUser(existing, upgradedRecord);

  const { passwordHash: _, ...cleanUser } = existing;

  if (clientType === 'api' || clientType === 'mobile') {
    const tokens = await createApiSessionAsync(existing.id, false);
    return {
      user: cleanUser,
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      sessionMode: 'token'
    };
  }

  const { token } = await createSessionAsync(existing.id, false);
  return { user: cleanUser, token, sessionMode: 'cookie' };
}

export function loginUser(email: string, password: string, currentSessionToken?: string): { user: UserAccount; token: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const syncRepo = getSyncRepo();
  const existing = syncRepo.getUserByEmailSync ? syncRepo.getUserByEmailSync(normalizedEmail) : null;

  // Constant-time execution prevents timing attacks leaking email presence
  if (!existing || !existing.passwordHash) {
    verifyPassword(password, DUMMY_HASH, DUMMY_SALT, DEFAULT_PBKDF2_ROUNDS);
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const parsed = parsePasswordRecord(existing.passwordHash);
  if (!parsed.salt || !parsed.hash || !verifyPassword(password, parsed.hash, parsed.salt, parsed.rounds)) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  let upgradedRecord: string | undefined;
  if (!parsed.isVersion2 || parsed.rounds < DEFAULT_PBKDF2_ROUNDS) {
    const upgraded = hashPassword(password);
    upgradedRecord = upgraded.record;
  }

  // Session rotation: revoke previous session token to prevent session fixation attacks
  if (currentSessionToken) {
    if (syncRepo.deleteSessionSync) {
      syncRepo.deleteSessionSync(currentSessionToken);
    } else {
      repository.deleteSession(currentSessionToken);
    }
  }

  existing.lastLoginAt = new Date().toISOString();
  if (syncRepo.saveUserSync) {
    syncRepo.saveUserSync(existing, upgradedRecord);
  } else {
    repository.saveUser(existing, upgradedRecord);
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
  const syncRepo = getSyncRepo();
  const user = syncRepo.getUserByEmailSync ? syncRepo.getUserByEmailSync(normalizedEmail) : null;
  if (!user || user.isGuest) {
    verifyPassword('dummy_pass', DUMMY_HASH, DUMMY_SALT);
    return null;
  }
  const created = syncRepo.createPasswordResetSync ? syncRepo.createPasswordResetSync(user.id) : null;
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

  const { record } = await hashPasswordAsync(newPassword);
  await repository.runTransaction(async (txRepo) => {
    await txRepo.saveUser(user, record);
    // Invalidate all active sessions for this user upon password reset
    await txRepo.revokeUserSessions(userId);
  });
  return true;
}

export function resetPasswordWithToken(token: string, newPassword: string): boolean {
  const syncRepo = getSyncRepo();
  const userId = syncRepo.verifyAndConsumePasswordResetSync ? syncRepo.verifyAndConsumePasswordResetSync(token) : null;
  if (!userId) {
    return false;
  }
  const user = syncRepo.getUserSync ? syncRepo.getUserSync(userId) : null;
  if (!user) {
    return false;
  }

  const { hash, salt } = hashPassword(newPassword);
  if (syncRepo.saveUserSync) {
    syncRepo.saveUserSync(user, `${salt}:${hash}`);
  } else {
    repository.saveUser(user, `${salt}:${hash}`);
  }
  // Invalidate all active sessions for this user upon password reset
  if (syncRepo.revokeUserSessionsSync) {
    syncRepo.revokeUserSessionsSync(userId);
  } else {
    repository.revokeUserSessions(userId);
  }
  return true;
}

// Create an isolated guest session with strict limits (Async)
export async function createGuestSessionAsync(
  clientType: 'browser' | 'api' | 'mobile' = 'browser'
): Promise<AuthResult> {
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

  if (clientType === 'api' || clientType === 'mobile') {
    const tokens = await createApiSessionAsync(saved.id, true);
    return {
      user: saved,
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      sessionMode: 'token'
    };
  }

  const { token } = await createSessionAsync(saved.id, true);
  return { user: saved, token, sessionMode: 'cookie' };
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

  const syncRepo = getSyncRepo();
  const saved = syncRepo.saveUserSync ? syncRepo.saveUserSync(guestUser) : guestUser;
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

  const syncRepo = getSyncRepo();
  const existing = syncRepo.getUserByEmailSync ? syncRepo.getUserByEmailSync(adminEmail) : null;
  const { hash, salt } = hashPassword(adminPass);
  const passwordRecord = `${salt}:${hash}`;

  if (existing) {
    if (process.env.ADMIN_BOOTSTRAP_FORCE === 'true') {
      existing.role = 'SUPER_ADMIN';
      existing.subscriptionTier = 'Enterprise';
      if (syncRepo.saveUserSync) {
        syncRepo.saveUserSync(existing, passwordRecord);
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
    if (syncRepo.saveUserSync) {
      syncRepo.saveUserSync(adminUser, passwordRecord);
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
  if (req.cookies && req.cookies['aurora_session']) {
    token = req.cookies['aurora_session'];
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)aurora_session=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  // 2. Authorization Bearer header (Standard for REST API / CLI programmatic access)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  // 3. Custom session headers for iframe and cross-origin environments where cookies are restricted
  if (!token) {
    const customHeader = req.headers['x-session-token'] || req.headers['x-aurora-token'];
    if (typeof customHeader === 'string' && customHeader.trim()) {
      token = customHeader.trim();
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

// Helper: Verify profile ownership strictly (Sync fallback for dev/test)
export function verifyProfileOwnership(req: Request, res: Response, profileId: string): UserProfile | null {
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

  const syncRepo = getSyncRepo();
  const profile = (syncRepo.getProfileSync ? syncRepo.getProfileSync(profileId) : null) as UserProfile | null;
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
      if (syncRepo.logAuditSync) {
        syncRepo.logAuditSync({
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

    if (syncRepo.logAuditSync) {
      syncRepo.logAuditSync({
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

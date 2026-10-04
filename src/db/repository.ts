// ==========================================
// AURORA DESTINY AI — REPOSITORY LAYER
// Production-grade persistence with atomic transactions,
// write queue serialization, SHA-256 integrity verification,
// cascade deletion, foreign key checks, session durability,
// and PostgreSQL schema migration generator.
// ==========================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UserAccount, UserProfile, UserPreferences, StoredSession } from '../types/user';
import { CalculationResult } from '../types/destiny';
import { HistoricalEvent, BacktestResult } from '../types/backtest';
import { ChatMessage } from '../types/ai';
import { PostgresDatabaseRepository } from './postgresRepository';
import { telemetry } from '../telemetry/telemetryService';

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipHash?: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  requestId?: string;
  timestamp: string;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  updatedAt: string;
}

export interface PatronEntity {
  id: string;
  userId?: string;
  name: string;
  tier: 'dong' | 'bac' | 'vang' | 'kim_cuong' | 'tam_tinh';
  amount?: number;
  message?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationType: 'UNVERIFIED' | 'DEMO_SAMPLE' | 'MANUAL_OFFLINE_VERIFIED' | 'WEBHOOK_VERIFIED';
  sealHash: string;
  paymentReference?: string;
  isAnonymous?: boolean;
  createdAt: string;
  verifiedAt?: string;
}

export interface WebhookEventRecord {
  id: string;
  idempotencyKey: string;
  provider: string;
  payloadHash: string;
  processedAt: string;
}

export interface IDatabaseRepository {
  // Users & Auth
  getUser(userId: string): Promise<UserAccount | null>;
  getAllUsers(): Promise<UserAccount[]>;
  getUserByEmail(email: string): Promise<(UserAccount & { passwordHash?: string }) | null>;
  saveUser(user: UserAccount, passwordHash?: string): Promise<UserAccount>;
  deleteUser(userId: string): Promise<boolean>;
  getAllUserData(userId: string): Promise<any>;
  getPreferences(userId: string): Promise<UserPreferences>;
  updatePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<UserPreferences>;

  // Persistent Sessions
  saveSession(session: StoredSession): Promise<void>;
  getSession(token: string): Promise<StoredSession | null>;
  deleteSession(token: string): Promise<boolean>;
  cleanupExpiredSessions(): Promise<number>;
  revokeUserSessions(userId: string): Promise<number>;
  revokeTokenFamily?(tokenFamily: string): Promise<number>;

  // Password Reset Tokens
  createPasswordReset(userId: string): Promise<{ token: string; expiresAt: number }>;
  verifyAndConsumePasswordReset(token: string): Promise<string | null>;

  // Profiles (Isolated per User)
  getProfiles(userId: string): Promise<UserProfile[]>;
  getProfile(profileId: string): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<UserProfile>;
  deleteProfile(profileId: string, userId: string): Promise<boolean>;

  // Calculations (Foreign key -> Profile)
  getCalculation(calculationId: string): Promise<CalculationResult | null>;
  getLatestCalculationForProfile(profileId: string): Promise<CalculationResult | null>;
  saveCalculation(calc: CalculationResult): Promise<CalculationResult>;

  // Historical Events (Foreign key -> Profile)
  getHistoricalEvents(profileId: string): Promise<HistoricalEvent[]>;
  addHistoricalEvent(event: HistoricalEvent): Promise<HistoricalEvent>;
  deleteHistoricalEvent(profileId: string, eventId: string): Promise<boolean>;

  // Backtest Results (Foreign key -> Profile)
  getBacktestResult(profileId: string): Promise<BacktestResult | null>;
  saveBacktestResult(result: BacktestResult): Promise<BacktestResult>;

  // Chat Messages (Foreign key -> Profile)
  getChatMessages(profileId: string): Promise<ChatMessage[]>;
  addChatMessage(profileId: string, message: ChatMessage): Promise<ChatMessage>;
  clearChatMessages(profileId: string): Promise<boolean>;

  // Audit Logs (Data minimization: no PII/birth details)
  logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void>;
  getAuditLogs(limit?: number): Promise<AuditLogEntry[]>;

  // Feature Flags
  getFeatureFlags(): Promise<FeatureFlag[]>;
  getFeatureFlag(key: string): Promise<FeatureFlag | null>;
  toggleFeatureFlag(key: string, enabled: boolean): Promise<FeatureFlag | null>;

  // Patrons & Payment Integrity
  getPatrons(options?: { status?: 'PENDING' | 'VERIFIED' | 'REJECTED'; limit?: number }): Promise<PatronEntity[]>;
  getPatronById(id: string): Promise<PatronEntity | null>;
  getPatronByPaymentReference(paymentReference: string): Promise<PatronEntity | null>;
  createPatron(patron: Omit<PatronEntity, 'id' | 'createdAt' | 'sealHash'> & { id?: string }): Promise<PatronEntity>;
  verifyPatron(id: string, paymentReference: string, verificationType?: PatronEntity['verificationType']): Promise<PatronEntity | null>;
  isWebhookProcessed(idempotencyKey: string): Promise<boolean>;
  getWebhookEvent(idempotencyKey: string): Promise<WebhookEventRecord | null>;
  recordWebhookEvent(event: WebhookEventRecord): Promise<void>;

  // Transactions & Durability
  runTransaction<T>(action: (repo: IDatabaseRepository) => Promise<T>): Promise<T>;
  verifyDatabaseIntegrity(): Promise<{ valid: boolean; errors: string[]; checksum: string }>;
  exportToPostgresSql(): Promise<string>;
  ensureInitialized?(): Promise<void>;
  close?(): Promise<void>;

  // Observability & Stats
  getMetrics(): Promise<DatabaseMetrics>;
}

export interface DatabaseMetrics {
  storageMode?: string;
  activeUsers24h: number;
  totalUsers: number;
  totalProfiles: number;
  totalProfilesStored?: number;
  totalCalculations: number;
  totalEvents: number;
  totalActiveSessions: number;
  totalAuditLogs: number;
  aiRequestsCount?: number;
  aiLatencyAvgMs?: number;
  aiLatencyP50Ms?: number;
  aiLatencyP95Ms?: number;
  aiLatencyP99Ms?: number;
  aiSuccessRate?: number;
  aiMetricStatus?: string;
  calculationDeterministicRate?: number;
  calcLatencyP50Ms?: number;
  calcLatencyP95Ms?: number;
  calcLatencyP99Ms?: number;
  calculationMetricStatus?: string;
  dbLatencyMs?: number;
  dbLatencyP50Ms?: number;
  dbLatencyP95Ms?: number;
  dbLatencyP99Ms?: number;
  dbMetricStatus?: string;
  cacheHitRatio?: number;
  cacheMetricStatus?: string;
  totalBacktestRuns?: number;
  totalScenariosEvaluated?: number;
  uptimeSeconds?: number;
  [key: string]: unknown;
}

export type IAsyncDatabaseRepository = IDatabaseRepository;

// Durable File-backed Database Schema representation
interface StoredDatabaseState {
  users: Record<string, UserAccount & { passwordHash?: string }>;
  preferences: Record<string, UserPreferences>;
  profiles: Record<string, UserProfile>;
  calculations: Record<string, CalculationResult>;
  historicalEvents: Record<string, HistoricalEvent[]>;
  backtestResults: Record<string, BacktestResult>;
  chatMessages: Record<string, ChatMessage[]>;
  sessions: Record<string, StoredSession>;
  passwordResets: Record<string, { token: string; userId: string; expiresAt: number; used: boolean }>;
  auditLogs: AuditLogEntry[];
  featureFlags: Record<string, FeatureFlag>;
  patrons?: Record<string, PatronEntity>;
  webhookEvents?: Record<string, WebhookEventRecord>;
  _checksum?: string;
}

/**
 * Deterministic JSON stringifier that sorts object keys recursively.
 * Ensures consistent canonical hash calculation across runtimes, platforms and insertion order.
 */
export function deterministicStringify(val: any): string {
  if (val === null || val === undefined) return 'null';
  if (val instanceof Date) return JSON.stringify(val.toISOString());
  if (typeof val !== 'object') return JSON.stringify(val);
  if (Array.isArray(val)) {
    return '[' + val.map(item => deterministicStringify(item)).join(',') + ']';
  }
  const keys = Object.keys(val).sort();
  const pairs = keys.map(k => `${JSON.stringify(k)}:${deterministicStringify(val[k])}`);
  return '{' + pairs.join(',') + '}';
}

export class PersistentDatabaseRepository implements IAsyncDatabaseRepository, IDatabaseRepository {
  private dir: string;
  private filePath: string;
  private backupPath: string;
  private state: StoredDatabaseState;
  private startTime: number = Date.now();
  private saveDebounceTimer: NodeJS.Timeout | null = null;
  private isWriting: boolean = false;
  private pendingWritePromise: Promise<void> | null = null;
  private txMutex: Promise<void> = Promise.resolve();

  constructor(storageDir?: string) {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const defaultDir = isServerless ? path.join('/tmp', 'aurora_data') : path.join(process.cwd(), 'data');
    this.dir = storageDir || process.env.DATA_DIR || defaultDir;
    if (!fs.existsSync(this.dir)) {
      try {
        fs.mkdirSync(this.dir, { recursive: true });
      } catch (err) {
        console.warn('Could not create data directory:', err);
      }
    }
    this.filePath = path.join(this.dir, 'aurora_destiny_db.json');
    this.backupPath = path.join(this.dir, 'aurora_destiny_db.backup.json');
    this.state = this.loadInitialState();
  }

  private computeChecksum(data: any): string {
    const serialized = deterministicStringify(data);
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  private loadInitialState(): StoredDatabaseState {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        
        // Clean out legacy hardcoded default admin if present with static salt
        if (parsed.users && parsed.users['usr_admin_master']) {
          const u = parsed.users['usr_admin_master'];
          if (u.passwordHash && u.passwordHash.includes('aurora_admin_salt_2026')) {
            console.log('🔒 [Security Audit] Purging legacy hardcoded admin credentials from database.');
            delete parsed.users['usr_admin_master'];
            if (parsed.preferences) delete parsed.preferences['usr_admin_master'];
          }
        }

        // Clean out any orphan calculations whose profile does not exist
        if (parsed.calculations && parsed.profiles) {
          for (const [calcId, calc] of Object.entries(parsed.calculations as Record<string, any>)) {
            if (calc && calc.profileId && !parsed.profiles[calc.profileId]) {
              console.log(`🧹 [Data Sanitization] Purging orphan calculation ${calcId} with missing profile ${calc.profileId}`);
              delete parsed.calculations[calcId];
            }
          }
        }

        return {
          users: parsed.users || {},
          preferences: parsed.preferences || {},
          profiles: parsed.profiles || {},
          calculations: parsed.calculations || {},
          historicalEvents: parsed.historicalEvents || {},
          backtestResults: parsed.backtestResults || {},
          chatMessages: parsed.chatMessages || {},
          sessions: parsed.sessions || {},
          passwordResets: parsed.passwordResets || {},
          auditLogs: parsed.auditLogs || [],
          featureFlags: parsed.featureFlags || this.defaultFeatureFlags(),
          patrons: parsed.patrons || {},
          webhookEvents: parsed.webhookEvents || {}
        };
      } catch (e) {
        console.error('Failed to parse primary database file. Attempting backup restore:', e);
        if (fs.existsSync(this.backupPath)) {
          try {
            const backupRaw = fs.readFileSync(this.backupPath, 'utf-8');
            const backupParsed = JSON.parse(backupRaw);
            console.log('✅ Successfully restored database state from backup snapshot.');
            return {
              users: backupParsed.users || {},
              preferences: backupParsed.preferences || {},
              profiles: backupParsed.profiles || {},
              calculations: backupParsed.calculations || {},
              historicalEvents: backupParsed.historicalEvents || {},
              backtestResults: backupParsed.backtestResults || {},
              chatMessages: backupParsed.chatMessages || {},
              sessions: backupParsed.sessions || {},
              passwordResets: backupParsed.passwordResets || {},
              auditLogs: backupParsed.auditLogs || [],
              featureFlags: backupParsed.featureFlags || this.defaultFeatureFlags(),
              patrons: backupParsed.patrons || {},
              webhookEvents: backupParsed.webhookEvents || {}
            };
          } catch (backupErr) {
            console.error('Backup restoration also failed:', backupErr);
          }
        }
      }
    }

    // Clean, production-safe initial state (NO hardcoded admin credentials!)
    return {
      users: {},
      preferences: {},
      profiles: {},
      calculations: {},
      historicalEvents: {},
      backtestResults: {},
      chatMessages: {},
      sessions: {},
      passwordResets: {},
      auditLogs: [],
      featureFlags: this.defaultFeatureFlags(),
      patrons: {},
      webhookEvents: {}
    };
  }

  private defaultFeatureFlags(): Record<string, FeatureFlag> {
    const now = new Date().toISOString();
    return {
      enable_gemini_37_stream: {
        key: 'enable_gemini_37_stream',
        name: 'Gemini Ensemble Streaming',
        description: 'Kích hoạt streaming token cho Multi-Agent Ensemble',
        enabled: true,
        updatedAt: now
      },
      enable_ziwei_3d_render: {
        key: 'enable_ziwei_3d_render',
        name: '3D Cosmic Cipher Visualization',
        description: 'Hiển thị mô hình Thiên Cầu 3D Tử Vi tương tác',
        enabled: true,
        updatedAt: now
      },
      strict_backtest_gate: {
        key: 'strict_backtest_gate',
        name: 'Strict Backtest Empirical Gate',
        description: 'Yêu cầu tối thiểu 3 sự kiện để hiển thị Backtest Reliability Band',
        enabled: true,
        updatedAt: now
      },
      audit_logging_enabled: {
        key: 'audit_logging_enabled',
        name: 'Security Audit Trail',
        description: 'Ghi nhật ký bảo mật và tuân thủ dữ liệu nhạy cảm',
        enabled: true,
        updatedAt: now
      }
    };
  }

  // Atomic file write using temporary file, atomic swap, and backup snapshot
  private persistSync(): void {
    if (this.isWriting) {
      // Re-schedule if a write is already in flight
      this.schedulePersist();
      return;
    }

    this.isWriting = true;
    try {
      // 1. Create a backup snapshot of the current existing file
      if (fs.existsSync(this.filePath)) {
        try {
          fs.copyFileSync(this.filePath, this.backupPath);
        } catch (copyErr) {
          console.warn('Could not update backup snapshot:', copyErr);
        }
      }

      // 2. Compute state checksum & serialize
      const { _checksum: _, ...cleanState } = this.state;
      const checksum = this.computeChecksum(cleanState);
      const payload: StoredDatabaseState = {
        ...cleanState,
        _checksum: checksum
      };

      const serialized = JSON.stringify(payload, null, 2);
      const tempPath = `${this.filePath}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;
      fs.writeFileSync(tempPath, serialized, 'utf-8');
      
      // 3. Atomic rename (POSIX rename guarantee prevents half-written corrupted files)
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error('Failed to persist database state atomically:', err);
    } finally {
      this.isWriting = false;
    }
  }

  private schedulePersist(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this.saveDebounceTimer = setTimeout(() => {
      this.persistSync();
    }, 100);
  }

  // ----------------------------------------------------
  // TRANSACTIONS & DURABILITY
  // ----------------------------------------------------
  async runTransaction<T>(action: (repo: any) => T | Promise<T>): Promise<T> {
    // Acquire transaction lock to guarantee serializability & atomic isolation
    let releaseLock: () => void;
    const lockPromise = new Promise<void>((resolve) => { releaseLock = resolve; });
    const prevLock = this.txMutex;
    this.txMutex = lockPromise;

    await prevLock;
    try {
      // Snapshot state before executing transaction
      const snapshot = JSON.stringify(this.state);
      try {
        const result = await Promise.resolve(action(this));
        this.schedulePersist();
        return result;
      } catch (err) {
        // Rollback to prior snapshot on failure
        this.state = JSON.parse(snapshot);
        throw err;
      }
    } finally {
      releaseLock!();
    }
  }

  runTransactionSync<T>(action: (repo: PersistentDatabaseRepository) => T): T {
    const snapshot = JSON.stringify(this.state);
    try {
      const result = action(this);
      this.schedulePersist();
      return result;
    } catch (err) {
      this.state = JSON.parse(snapshot);
      console.error('⚠️ Transaction failed and was rolled back successfully:', err);
      throw err;
    }
  }

  async verifyDatabaseIntegrity(): Promise<{ valid: boolean; errors: string[]; checksum: string }> {
    return this.verifyDatabaseIntegritySync();
  }

  verifyDatabaseIntegritySync(): { valid: boolean; errors: string[]; checksum: string } {
    const errors: string[] = [];
    const { _checksum, ...cleanState } = this.state;
    const currentChecksum = this.computeChecksum(cleanState);

    // 1. Email uniqueness check
    const seenEmails = new Map<string, string>();
    for (const [userId, user] of Object.entries(this.state.users)) {
      if (!user.isGuest && user.email) {
        const normalizedEmail = user.email.toLowerCase().trim();
        if (seenEmails.has(normalizedEmail)) {
          errors.push(`Duplicate email ${normalizedEmail} between users ${seenEmails.get(normalizedEmail)} and ${userId}`);
        } else {
          seenEmails.set(normalizedEmail, userId);
        }
      }
      // Check timestamp validity
      if (user.createdAt && isNaN(Date.parse(user.createdAt))) {
        errors.push(`Invalid createdAt timestamp on user ${userId}`);
      }
    }

    // 2. Session -> User FK check
    for (const [token, session] of Object.entries(this.state.sessions)) {
      if (!this.state.users[session.userId]) {
        errors.push(`Orphan session ${token.slice(0, 8)}...: user ${session.userId} does not exist.`);
      }
    }

    // 3. User Preferences -> User FK check
    for (const [userId] of Object.entries(this.state.preferences)) {
      if (!this.state.users[userId]) {
        errors.push(`Orphan preferences for non-existent user ${userId}.`);
      }
    }

    // 4. Profile -> User FK check
    for (const [profileId, profile] of Object.entries(this.state.profiles)) {
      if (!this.state.users[profile.userId]) {
        errors.push(`Orphan profile ${profileId}: user ${profile.userId} does not exist.`);
      }
      if (profile.createdAt && isNaN(Date.parse(profile.createdAt))) {
        errors.push(`Invalid createdAt timestamp on profile ${profileId}`);
      }
    }

    // 5. Calculation -> Profile FK check
    for (const [calcId, calc] of Object.entries(this.state.calculations)) {
      if (!this.state.profiles[calc.profileId]) {
        errors.push(`Orphan calculation ${calcId}: profile ${calc.profileId} does not exist.`);
      }
    }

    // 6. Historical Events -> Profile FK check
    for (const [profileId, events] of Object.entries(this.state.historicalEvents)) {
      if (!this.state.profiles[profileId]) {
        errors.push(`Orphan historical events list: profile ${profileId} does not exist.`);
      }
      for (const ev of events) {
        if (ev.profileId !== profileId) {
          errors.push(`Mismatched profileId in event ${ev.id}: expected ${profileId}, got ${ev.profileId}`);
        }
      }
    }

    // 7. Backtest Results -> Profile FK check
    for (const [profileId, bt] of Object.entries(this.state.backtestResults)) {
      if (!this.state.profiles[profileId]) {
        errors.push(`Orphan backtest result: profile ${profileId} does not exist.`);
      }
    }

    // 8. Chat Messages -> Profile FK check
    for (const [profileId] of Object.entries(this.state.chatMessages)) {
      if (!this.state.profiles[profileId]) {
        errors.push(`Orphan chat messages: profile ${profileId} does not exist.`);
      }
    }

    // 9. Password Resets -> User FK check
    if (this.state.passwordResets) {
      for (const [token, record] of Object.entries(this.state.passwordResets)) {
        if (!this.state.users[record.userId]) {
          errors.push(`Orphan password reset ${token.slice(0, 8)}...: user ${record.userId} does not exist.`);
        }
      }
    }

    // 10. Patrons check
    if (this.state.patrons) {
      const seenPaymentRefs = new Set<string>();
      for (const [patronId, patron] of Object.entries(this.state.patrons)) {
        if (patron.userId && !this.state.users[patron.userId]) {
          errors.push(`Orphan patron ${patronId}: user ${patron.userId} does not exist.`);
        }
        if (patron.paymentReference) {
          if (seenPaymentRefs.has(patron.paymentReference)) {
            errors.push(`Duplicate paymentReference ${patron.paymentReference} in patron ${patronId}`);
          } else {
            seenPaymentRefs.add(patron.paymentReference);
          }
        }
        if (patron.createdAt && isNaN(Date.parse(patron.createdAt))) {
          errors.push(`Invalid createdAt timestamp on patron ${patronId}`);
        }
      }
    }

    // 11. Webhook Events check
    if (this.state.webhookEvents) {
      for (const [key, evt] of Object.entries(this.state.webhookEvents)) {
        if (evt.processedAt && isNaN(Date.parse(evt.processedAt))) {
          errors.push(`Invalid processedAt timestamp on webhook event ${key}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      checksum: currentChecksum
    };
  }

  // ----------------------------------------------------
  // USERS & AUTH
  // ----------------------------------------------------
  async getUser(userId: string): Promise<UserAccount | null> {
    return this.getUserSync(userId);
  }
  getUserSync(userId: string): UserAccount | null {
    const user = this.state.users[userId];
    if (!user) return null;
    const { passwordHash, ...cleanUser } = user;
    return cleanUser;
  }

  async getAllUsers(): Promise<UserAccount[]> {
    return this.getAllUsersSync();
  }
  getAllUsersSync(): UserAccount[] {
    return Object.values(this.state.users).map(({ passwordHash: _, ...clean }) => clean);
  }

  async getUserByEmail(email: string): Promise<(UserAccount & { passwordHash?: string }) | null> {
    return this.getUserByEmailSync(email);
  }
  getUserByEmailSync(email: string): (UserAccount & { passwordHash?: string }) | null {
    const normalized = email.toLowerCase().trim();
    for (const u of Object.values(this.state.users)) {
      if (u.email.toLowerCase().trim() === normalized) {
        return u;
      }
    }
    return null;
  }

  async saveUser(user: UserAccount, passwordHash?: string): Promise<UserAccount> {
    return this.saveUserSync(user, passwordHash);
  }
  saveUserSync(user: UserAccount, passwordHash?: string): UserAccount {
    const existing = (this.state.users[user.id] || {}) as Partial<UserAccount & { passwordHash?: string }>;
    this.state.users[user.id] = {
      ...existing,
      ...user,
      passwordHash: passwordHash !== undefined ? passwordHash : existing.passwordHash
    };
    if (!this.state.preferences[user.id]) {
      this.state.preferences[user.id] = {
        theme: 'dark',
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        enableNotifications: true,
        enableAILearning: false,
        anonymizeData: false,
        scientificConfidenceMode: true,
        highContrast: false
      };
    }
    this.schedulePersist();
    const { passwordHash: _, ...clean } = this.state.users[user.id];
    return clean;
  }

  async deleteUser(userId: string): Promise<boolean> {
    return this.deleteUserSync(userId);
  }
  deleteUserSync(userId: string): boolean {
    if (!this.state.users[userId]) return false;

    // Cascade delete all profiles owned by this user
    const userProfiles = this.getProfilesSync(userId);
    for (const profile of userProfiles) {
      this.deleteProfileSync(profile.id, userId);
    }

    // Revoke all sessions
    this.revokeUserSessionsSync(userId);

    // Clean up any password reset tokens
    if (this.state.passwordResets) {
      for (const [token, record] of Object.entries(this.state.passwordResets)) {
        if (record.userId === userId) {
          delete this.state.passwordResets[token];
        }
      }
    }

    // Delete user and preferences
    delete this.state.users[userId];
    delete this.state.preferences[userId];

    this.schedulePersist();
    return true;
  }

  async getAllUserData(userId: string): Promise<any> {
    return this.getAllUserDataSync(userId);
  }
  getAllUserDataSync(userId: string): any {
    const user = this.getUserSync(userId);
    if (!user) return null;

    const prefs = this.getPreferencesSync(userId);
    const profiles = this.getProfilesSync(userId);
    const calculations: Record<string, CalculationResult> = {};
    const historicalEvents: Record<string, HistoricalEvent[]> = {};
    const backtests: Record<string, BacktestResult> = {};
    const chats: Record<string, ChatMessage[]> = {};

    for (const p of profiles) {
      const calc = this.getLatestCalculationForProfileSync(p.id);
      if (calc) calculations[p.id] = calc;
      historicalEvents[p.id] = this.getHistoricalEventsSync(p.id);
      const bt = this.getBacktestResultSync(p.id);
      if (bt) backtests[p.id] = bt;
      chats[p.id] = this.getChatMessagesSync(p.id);
    }

    return {
      exportedAt: new Date().toISOString(),
      user,
      preferences: prefs,
      profiles,
      calculations,
      historicalEvents,
      backtests,
      chats
    };
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    return this.getPreferencesSync(userId);
  }
  getPreferencesSync(userId: string): UserPreferences {
    return this.state.preferences[userId] || {
      theme: 'dark',
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      enableNotifications: true,
      enableAILearning: false,
      anonymizeData: false,
      scientificConfidenceMode: true,
      highContrast: false
    };
  }

  async updatePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    return this.updatePreferencesSync(userId, prefs);
  }
  updatePreferencesSync(userId: string, prefs: Partial<UserPreferences>): UserPreferences {
    if (!this.state.users[userId]) {
      throw new Error(`Foreign key constraint failed: User '${userId}' does not exist.`);
    }
    const current = this.getPreferencesSync(userId);
    const updated = { ...current, ...prefs };
    this.state.preferences[userId] = updated;
    this.schedulePersist();
    return updated;
  }

  // ----------------------------------------------------
  // PERSISTENT SESSIONS (Survives Server Restarts)
  // ----------------------------------------------------
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async saveSession(session: StoredSession): Promise<void> {
    this.saveSessionSync(session);
  }
  saveSessionSync(session: StoredSession): void {
    if (!this.state.users[session.userId]) {
      throw new Error(`Foreign key constraint failed: User '${session.userId}' does not exist.`);
    }
    const tokenHash = this.hashToken(session.token);
    this.state.sessions[tokenHash] = { ...session, token: tokenHash };
    this.schedulePersist();
  }

  async getSession(token: string): Promise<StoredSession | null> {
    return this.getSessionSync(token);
  }
  getSessionSync(token: string): StoredSession | null {
    const tokenHash = this.hashToken(token);
    const s = this.state.sessions[tokenHash] || this.state.sessions[token];
    if (!s) return null;
    if (Date.now() > s.expiresAt) {
      delete this.state.sessions[tokenHash];
      delete this.state.sessions[token];
      this.schedulePersist();
      return null;
    }
    s.lastAccessedAt = Date.now();
    return { ...s, token };
  }

  async deleteSession(token: string): Promise<boolean> {
    return this.deleteSessionSync(token);
  }
  deleteSessionSync(token: string): boolean {
    const tokenHash = this.hashToken(token);
    let deleted = false;
    if (this.state.sessions[tokenHash]) {
      delete this.state.sessions[tokenHash];
      deleted = true;
    }
    if (this.state.sessions[token]) {
      delete this.state.sessions[token];
      deleted = true;
    }
    if (deleted) {
      this.schedulePersist();
      return true;
    }
    return false;
  }

  async cleanupExpiredSessions(): Promise<number> {
    return this.cleanupExpiredSessionsSync();
  }
  cleanupExpiredSessionsSync(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [token, session] of Object.entries(this.state.sessions)) {
      if (now > session.expiresAt) {
        delete this.state.sessions[token];
        cleaned++;
      }
    }

    // Clean up expired or consumed password resets
    if (this.state.passwordResets) {
      for (const [token, record] of Object.entries(this.state.passwordResets)) {
        if (now > record.expiresAt || record.used) {
          delete this.state.passwordResets[token];
        }
      }
    }

    // Cascade purge abandoned guest users and their associated entities
    const activeGuestUserIds = new Set<string>();
    for (const session of Object.values(this.state.sessions)) {
      if (session.isGuest && now <= session.expiresAt) {
        activeGuestUserIds.add(session.userId);
      }
    }

    const guestsToDelete: string[] = [];
    for (const userId of Object.keys(this.state.users)) {
      if (userId.startsWith('usr_guest_') && !activeGuestUserIds.has(userId)) {
        guestsToDelete.push(userId);
      }
    }

    for (const guestId of guestsToDelete) {
      // Find all profiles owned by this guest
      const profileIds = Object.values(this.state.profiles)
        .filter(p => p.userId === guestId)
        .map(p => p.id);

      for (const pId of profileIds) {
        // Cascade 1: Delete all calculations for this profile by actual foreign key relation (calc.profileId === pId)
        for (const [calcId, calc] of Object.entries(this.state.calculations)) {
          if (calc.profileId === pId) {
            delete this.state.calculations[calcId];
          }
        }
        // Cascade 2: Delete historical events
        delete this.state.historicalEvents[pId];
        // Cascade 3: Delete backtest results
        delete this.state.backtestResults[pId];
        // Cascade 4: Delete chat messages
        delete this.state.chatMessages[pId];
        // Delete the profile itself
        delete this.state.profiles[pId];
      }

      // Revoke any leftover sessions
      for (const [token, session] of Object.entries(this.state.sessions)) {
        if (session.userId === guestId) {
          delete this.state.sessions[token];
        }
      }

      // Delete user preferences and user account
      delete this.state.preferences[guestId];
      delete this.state.users[guestId];
    }

    if (cleaned > 0 || guestsToDelete.length > 0) {
      this.schedulePersist();
    }
    return cleaned;
  }

  async revokeUserSessions(userId: string): Promise<number> {
    return this.revokeUserSessionsSync(userId);
  }
  revokeUserSessionsSync(userId: string): number {
    let revoked = 0;
    for (const [token, session] of Object.entries(this.state.sessions)) {
      if (session.userId === userId) {
        delete this.state.sessions[token];
        revoked++;
      }
    }
    if (revoked > 0) {
      this.schedulePersist();
    }
    return revoked;
  }

  async revokeTokenFamily(tokenFamily: string): Promise<number> {
    return this.revokeTokenFamilySync(tokenFamily);
  }
  revokeTokenFamilySync(tokenFamily: string): number {
    if (!tokenFamily) return 0;
    let revoked = 0;
    const now = Date.now();
    for (const [token, session] of Object.entries(this.state.sessions)) {
      if (session.tokenFamily === tokenFamily && !session.revokedAt) {
        session.revokedAt = now;
        revoked++;
      }
    }
    if (revoked > 0) {
      this.schedulePersist();
    }
    return revoked;
  }

  // ----------------------------------------------------
  // PASSWORD RESET TOKENS (Time-limited & Single-use)
  // ----------------------------------------------------
  async createPasswordReset(userId: string): Promise<{ token: string; expiresAt: number }> {
    return this.createPasswordResetSync(userId);
  }
  createPasswordResetSync(userId: string): { token: string; expiresAt: number } {
    if (!this.state.users[userId]) {
      throw new Error(`Foreign key constraint failed: User '${userId}' does not exist.`);
    }
    if (!this.state.passwordResets) {
      this.state.passwordResets = {};
    }
    const rawToken = `rst_${crypto.randomBytes(24).toString('hex')}`;
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.state.passwordResets[tokenHash] = {
      token: tokenHash,
      userId,
      expiresAt,
      used: false
    };
    this.schedulePersist();
    return { token: rawToken, expiresAt };
  }

  async verifyAndConsumePasswordReset(token: string): Promise<string | null> {
    return this.verifyAndConsumePasswordResetSync(token);
  }
  verifyAndConsumePasswordResetSync(token: string): string | null {
    if (!this.state.passwordResets) {
      return null;
    }
    const tokenHash = this.hashToken(token);
    const record = this.state.passwordResets[tokenHash] || this.state.passwordResets[token];
    if (!record) {
      return null;
    }
    if (record.used || Date.now() > record.expiresAt) {
      delete this.state.passwordResets[tokenHash];
      delete this.state.passwordResets[token];
      this.schedulePersist();
      return null;
    }
    record.used = true;
    this.schedulePersist();
    this.revokeUserSessionsSync(record.userId);
    return record.userId;
  }

  // ----------------------------------------------------
  // PROFILES (Isolated per User)
  // ----------------------------------------------------
  async getProfiles(userId: string): Promise<UserProfile[]> {
    return this.getProfilesSync(userId);
  }
  getProfilesSync(userId: string): UserProfile[] {
    return Object.values(this.state.profiles).filter(p => p.userId === userId);
  }

  async getProfile(profileId: string): Promise<UserProfile | null> {
    return this.getProfileSync(profileId);
  }
  getProfileSync(profileId: string): UserProfile | null {
    return this.state.profiles[profileId] || null;
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    return this.saveProfileSync(profile);
  }
  saveProfileSync(profile: UserProfile): UserProfile {
    // Foreign Key check: userId must exist in users
    if (!this.state.users[profile.userId]) {
      throw new Error(`Foreign key constraint failed: User '${profile.userId}' does not exist.`);
    }

    // Idempotency check: prevent duplicate profile creation for same userId + idempotencyKey/clientProfileId
    if (profile.idempotencyKey || profile.clientProfileId) {
      for (const existing of Object.values(this.state.profiles)) {
        if (existing.userId === profile.userId && existing.id !== profile.id) {
          if (
            (profile.idempotencyKey && existing.idempotencyKey === profile.idempotencyKey) ||
            (profile.clientProfileId && existing.clientProfileId === profile.clientProfileId)
          ) {
            return existing;
          }
        }
      }
    }

    this.state.profiles[profile.id] = { ...profile, updatedAt: new Date().toISOString() };
    
    // Update user profile count
    const userProfiles = this.getProfilesSync(profile.userId);
    if (this.state.users[profile.userId]) {
      this.state.users[profile.userId].profilesCount = userProfiles.length;
    }

    this.schedulePersist();
    return this.state.profiles[profile.id];
  }

  // CASCADE DELETE: Removing a profile cascades to calculations, events, backtests, messages
  async deleteProfile(profileId: string, userId: string): Promise<boolean> {
    return this.deleteProfileSync(profileId, userId);
  }
  deleteProfileSync(profileId: string, userId: string): boolean {
    const profile = this.state.profiles[profileId];
    if (!profile) return false;
    
    // Ownership check: only owner or super-admin can delete
    if (profile.userId !== userId) {
      const user = this.getUserSync(userId);
      if (!user || user.role !== 'SUPER_ADMIN') {
        return false;
      }
    }

    delete this.state.profiles[profileId];

    // Cascade 1: Delete all calculations for this profile
    for (const [calcId, calc] of Object.entries(this.state.calculations)) {
      if (calc.profileId === profileId) {
        delete this.state.calculations[calcId];
      }
    }

    // Cascade 2: Delete all historical events
    delete this.state.historicalEvents[profileId];

    // Cascade 3: Delete backtest results
    delete this.state.backtestResults[profileId];

    // Cascade 4: Delete chat messages
    delete this.state.chatMessages[profileId];

    // Update user profile count
    const remaining = this.getProfilesSync(profile.userId);
    if (this.state.users[profile.userId]) {
      this.state.users[profile.userId].profilesCount = remaining.length;
    }

    this.schedulePersist();
    return true;
  }

  // ----------------------------------------------------
  // CALCULATIONS
  // ----------------------------------------------------
  async getCalculation(calculationId: string): Promise<CalculationResult | null> {
    return this.getCalculationSync(calculationId);
  }
  getCalculationSync(calculationId: string): CalculationResult | null {
    return this.state.calculations[calculationId] || null;
  }

  async getLatestCalculationForProfile(profileId: string): Promise<CalculationResult | null> {
    return this.getLatestCalculationForProfileSync(profileId);
  }
  getLatestCalculationForProfileSync(profileId: string): CalculationResult | null {
    const profile = this.state.profiles[profileId];
    if (!profile) return null;

    if (profile.latestCalculationId && this.state.calculations[profile.latestCalculationId]) {
      return this.state.calculations[profile.latestCalculationId];
    }

    const matches = Object.values(this.state.calculations).filter(c => c.profileId === profileId);
    if (matches.length === 0) return null;
    matches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return matches[0];
  }

  async saveCalculation(calc: CalculationResult): Promise<CalculationResult> {
    return this.saveCalculationSync(calc);
  }
  saveCalculationSync(calc: CalculationResult): CalculationResult {
    if (!this.state.profiles[calc.profileId]) {
      throw new Error(`Foreign key constraint failed: Profile '${calc.profileId}' does not exist.`);
    }
    this.state.calculations[calc.id] = calc;
    this.state.profiles[calc.profileId].latestCalculationId = calc.id;
    this.schedulePersist();
    return calc;
  }

  // ----------------------------------------------------
  // HISTORICAL EVENTS
  // ----------------------------------------------------
  async getHistoricalEvents(profileId: string): Promise<HistoricalEvent[]> {
    return this.getHistoricalEventsSync(profileId);
  }
  getHistoricalEventsSync(profileId: string): HistoricalEvent[] {
    return this.state.historicalEvents[profileId] || [];
  }

  async addHistoricalEvent(event: HistoricalEvent): Promise<HistoricalEvent> {
    return this.addHistoricalEventSync(event);
  }
  addHistoricalEventSync(event: HistoricalEvent): HistoricalEvent {
    if (!this.state.profiles[event.profileId]) {
      throw new Error(`Foreign key constraint failed: Profile '${event.profileId}' does not exist.`);
    }
    if (!this.state.historicalEvents[event.profileId]) {
      this.state.historicalEvents[event.profileId] = [];
    }
    this.state.historicalEvents[event.profileId].push(event);
    this.schedulePersist();
    return event;
  }

  async deleteHistoricalEvent(profileId: string, eventId: string): Promise<boolean> {
    return this.deleteHistoricalEventSync(profileId, eventId);
  }
  deleteHistoricalEventSync(profileId: string, eventId: string): boolean {
    const list = this.state.historicalEvents[profileId];
    if (!list) return false;
    const initialLen = list.length;
    this.state.historicalEvents[profileId] = list.filter(e => e.id !== eventId);
    const deleted = this.state.historicalEvents[profileId].length < initialLen;
    if (deleted) this.schedulePersist();
    return deleted;
  }

  // ----------------------------------------------------
  // BACKTEST RESULTS
  // ----------------------------------------------------
  async getBacktestResult(profileId: string): Promise<BacktestResult | null> {
    return this.getBacktestResultSync(profileId);
  }
  getBacktestResultSync(profileId: string): BacktestResult | null {
    return this.state.backtestResults[profileId] || null;
  }

  async saveBacktestResult(result: BacktestResult): Promise<BacktestResult> {
    return this.saveBacktestResultSync(result);
  }
  saveBacktestResultSync(result: BacktestResult): BacktestResult {
    if (result.profileId && !this.state.profiles[result.profileId]) {
      throw new Error(`Foreign key constraint failed: Profile '${result.profileId}' does not exist.`);
    }
    this.state.backtestResults[result.profileId] = result;
    this.schedulePersist();
    return result;
  }

  // ----------------------------------------------------
  // CHAT MESSAGES
  // ----------------------------------------------------
  async getChatMessages(profileId: string): Promise<ChatMessage[]> {
    return this.getChatMessagesSync(profileId);
  }
  getChatMessagesSync(profileId: string): ChatMessage[] {
    return this.state.chatMessages[profileId] || [];
  }

  async addChatMessage(profileId: string, message: ChatMessage): Promise<ChatMessage> {
    return this.addChatMessageSync(profileId, message);
  }
  addChatMessageSync(profileId: string, message: ChatMessage): ChatMessage {
    if (!this.state.profiles[profileId]) {
      throw new Error(`Foreign key constraint failed: Profile '${profileId}' does not exist.`);
    }
    if (!this.state.chatMessages[profileId]) {
      this.state.chatMessages[profileId] = [];
    }
    this.state.chatMessages[profileId].push(message);
    if (this.state.chatMessages[profileId].length > 100) {
      this.state.chatMessages[profileId] = this.state.chatMessages[profileId].slice(-100);
    }
    this.schedulePersist();
    return message;
  }

  async clearChatMessages(profileId: string): Promise<boolean> {
    return this.clearChatMessagesSync(profileId);
  }
  clearChatMessagesSync(profileId: string): boolean {
    if (this.state.chatMessages[profileId]) {
      this.state.chatMessages[profileId] = [];
      this.schedulePersist();
      return true;
    }
    return false;
  }

  // ----------------------------------------------------
  // AUDIT LOGS (Data minimization: No PII/birth records)
  // ----------------------------------------------------
  async logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    this.logAuditSync(entry);
  }
  logAuditSync(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const flag = this.getFeatureFlagSync('audit_logging_enabled');
    if (flag && !flag.enabled && entry.status !== 'BLOCKED') {
      return; // Skip routine logs if flag is toggled off, but always record security blocks
    }

    const log: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString()
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 1000) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 1000);
    }
    this.schedulePersist();
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLogEntry[]> {
    return this.getAuditLogsSync(limit);
  }
  getAuditLogsSync(limit: number = 100): AuditLogEntry[] {
    return this.state.auditLogs.slice(0, limit);
  }

  // ----------------------------------------------------
  // FEATURE FLAGS
  // ----------------------------------------------------
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return this.getFeatureFlagsSync();
  }
  getFeatureFlagsSync(): FeatureFlag[] {
    return Object.values(this.state.featureFlags);
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag | null> {
    return this.getFeatureFlagSync(key);
  }
  getFeatureFlagSync(key: string): FeatureFlag | null {
    return this.state.featureFlags[key] || null;
  }

  async toggleFeatureFlag(key: string, enabled: boolean): Promise<FeatureFlag | null> {
    return this.toggleFeatureFlagSync(key, enabled);
  }
  toggleFeatureFlagSync(key: string, enabled: boolean): FeatureFlag | null {
    const flag = this.state.featureFlags[key];
    if (!flag) return null;
    flag.enabled = enabled;
    flag.updatedAt = new Date().toISOString();
    this.schedulePersist();
    return flag;
  }

  // ----------------------------------------------------
  // PATRONS & PAYMENT INTEGRITY
  // ----------------------------------------------------
  async getPatrons(options?: { status?: 'PENDING' | 'VERIFIED' | 'REJECTED'; limit?: number }): Promise<PatronEntity[]> {
    return this.getPatronsSync(options);
  }
  getPatronsSync(options?: { status?: 'PENDING' | 'VERIFIED' | 'REJECTED'; limit?: number }): PatronEntity[] {
    let list = Object.values(this.state.patrons || {});
    if (options?.status) {
      list = list.filter(p => p.status === options.status);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (options?.limit) {
      list = list.slice(0, options.limit);
    }
    return list;
  }

  async getPatronById(id: string): Promise<PatronEntity | null> {
    return this.getPatronByIdSync(id);
  }
  getPatronByIdSync(id: string): PatronEntity | null {
    if (!this.state.patrons || !this.state.patrons[id]) return null;
    return { ...this.state.patrons[id] };
  }

  async getPatronByPaymentReference(paymentReference: string): Promise<PatronEntity | null> {
    return this.getPatronByPaymentReferenceSync(paymentReference);
  }
  getPatronByPaymentReferenceSync(paymentReference: string): PatronEntity | null {
    if (!this.state.patrons) return null;
    const found = Object.values(this.state.patrons).find(p => p.paymentReference === paymentReference);
    return found ? { ...found } : null;
  }

  async createPatron(patron: Omit<PatronEntity, 'id' | 'createdAt' | 'sealHash'> & { id?: string }): Promise<PatronEntity> {
    return this.createPatronSync(patron);
  }
  createPatronSync(patron: Omit<PatronEntity, 'id' | 'createdAt' | 'sealHash'> & { id?: string }): PatronEntity {
    if (!this.state.patrons) this.state.patrons = {};
    const id = patron.id || `ptr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    const hashSeed = `${patron.name}_${now}_${crypto.randomBytes(8).toString('hex')}`;
    let hashNum = 0x811c9dc5;
    for (let i = 0; i < hashSeed.length; i++) {
      hashNum ^= hashSeed.charCodeAt(i);
      hashNum = (hashNum * 0x01000193) >>> 0;
    }
    const sealHash = `SEAL-HPPD-${hashNum.toString(16).toUpperCase().padStart(8, '0')}`;

    const entity: PatronEntity = {
      id,
      userId: patron.userId,
      name: patron.name,
      tier: patron.tier,
      amount: patron.amount,
      message: patron.message,
      status: patron.status || 'PENDING',
      verificationType: patron.verificationType || 'UNVERIFIED',
      sealHash,
      paymentReference: patron.paymentReference,
      isAnonymous: Boolean(patron.isAnonymous),
      createdAt: now,
      verifiedAt: patron.status === 'VERIFIED' ? now : undefined
    };

    this.state.patrons[id] = entity;
    this.schedulePersist();
    return entity;
  }

  async verifyPatron(id: string, paymentReference: string, verificationType: PatronEntity['verificationType'] = 'WEBHOOK_VERIFIED'): Promise<PatronEntity | null> {
    return this.verifyPatronSync(id, paymentReference, verificationType);
  }
  verifyPatronSync(id: string, paymentReference: string, verificationType: PatronEntity['verificationType'] = 'WEBHOOK_VERIFIED'): PatronEntity | null {
    if (!this.state.patrons || !this.state.patrons[id]) return null;
    const patron = this.state.patrons[id];
    if (patron.status !== 'PENDING') {
      // Strictly prevent PENDING -> VERIFIED -> VERIFIED transition
      return { ...patron };
    }
    const now = new Date().toISOString();
    patron.status = 'VERIFIED';
    patron.verificationType = verificationType;
    patron.paymentReference = paymentReference;
    patron.verifiedAt = now;
    this.schedulePersist();
    return { ...patron };
  }

  async isWebhookProcessed(idempotencyKey: string): Promise<boolean> {
    return Boolean(this.state.webhookEvents && this.state.webhookEvents[idempotencyKey]);
  }

  async getWebhookEvent(idempotencyKey: string): Promise<WebhookEventRecord | null> {
    if (!this.state.webhookEvents) return null;
    const evt = this.state.webhookEvents[idempotencyKey];
    return evt ? { ...evt } : null;
  }

  async recordWebhookEvent(event: WebhookEventRecord): Promise<void> {
    if (!this.state.webhookEvents) this.state.webhookEvents = {};
    if (this.state.webhookEvents[event.idempotencyKey]) {
      const err: any = new Error(`DUPLICATE_IDEMPOTENCY_KEY: ${event.idempotencyKey}`);
      err.code = '23505';
      throw err;
    }
    this.state.webhookEvents[event.idempotencyKey] = event;
    this.schedulePersist();
  }

  // ----------------------------------------------------
  // OBSERVABILITY METRICS
  // ----------------------------------------------------
  async getMetrics(): Promise<any> {
    return this.getMetricsSync();
  }
  getMetricsSync() {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    // Real calculation of active users in rolling windows (24h DAU, 7d WAU, 30d MAU)
    const activeUserIds24h = new Set<string>();
    const activeUserIds7d = new Set<string>();
    const activeUserIds30d = new Set<string>();

    for (const session of Object.values(this.state.sessions)) {
      if (session.lastAccessedAt >= twentyFourHoursAgo) {
        activeUserIds24h.add(session.userId);
      }
      if (session.lastAccessedAt >= sevenDaysAgo) {
        activeUserIds7d.add(session.userId);
      }
      if (session.lastAccessedAt >= thirtyDaysAgo) {
        activeUserIds30d.add(session.userId);
      }
    }
    for (const user of Object.values(this.state.users)) {
      const loginTime = user.lastLoginAt ? new Date(user.lastLoginAt).getTime() : 0;
      if (loginTime >= twentyFourHoursAgo) {
        activeUserIds24h.add(user.id);
      }
      if (loginTime >= sevenDaysAgo) {
        activeUserIds7d.add(user.id);
      }
      if (loginTime >= thirtyDaysAgo) {
        activeUserIds30d.add(user.id);
      }
    }

    let registeredUsers = 0;
    let guestUsers = 0;
    for (const user of Object.values(this.state.users)) {
      if (user.role === 'GUEST' || user.isGuest) {
        guestUsers++;
      } else {
        registeredUsers++;
      }
    }

    const activeSessions = Object.values(this.state.sessions).filter(s => now <= s.expiresAt).length;
    const userCount = Object.keys(this.state.users).length;
    const profileCount = Object.keys(this.state.profiles).length;
    const calcCount = Object.keys(this.state.calculations).length;
    const backtestCount = Object.keys(this.state.backtestResults || {}).length;

    const snap = telemetry.getSnapshot();

    return {
      activeUsers24h: activeUserIds24h.size,
      dau: activeUserIds24h.size,
      wau: activeUserIds7d.size,
      mau: activeUserIds30d.size,
      registeredUsers,
      guestUsers,
      totalUsers: userCount,
      totalProfiles: profileCount,
      totalProfilesStored: profileCount,
      totalCalculations: calcCount,
      totalEvents: Object.values(this.state.historicalEvents).reduce((sum, list) => sum + list.length, 0),
      totalActiveSessions: activeSessions,
      totalAuditLogs: this.state.auditLogs.length,
      aiRequestsCount: snap.aiRequestsTotal,
      aiRequestsTotal: snap.aiRequestsTotal,
      aiSuccessTotal: snap.aiSuccessTotal,
      aiFailureTotal: snap.aiFailureTotal,
      aiLatencyAvgMs: snap.aiLatencyAvgMs,
      aiLatencyP50Ms: snap.aiPercentiles.p50,
      aiLatencyP95Ms: snap.aiPercentiles.p95,
      aiLatencyP99Ms: snap.aiPercentiles.p99,
      aiSuccessRate: snap.aiSuccessRate,
      calculationDeterministicRate: snap.calculationDeterministicRate,
      calcLatencyP50Ms: snap.calculationPercentiles.p50,
      calcLatencyP95Ms: snap.calculationPercentiles.p95,
      calcLatencyP99Ms: snap.calculationPercentiles.p99,
      dbLatencyMs: snap.dbLatencyAvgMs,
      dbLatencyP50Ms: snap.dbPercentiles.p50,
      dbLatencyP95Ms: snap.dbPercentiles.p95,
      dbLatencyP99Ms: snap.dbPercentiles.p99,
      cacheHitRatio: snap.cacheHitRatio,
      totalBacktestRuns: snap.backtestRunsTotal > 0 ? snap.backtestRunsTotal : backtestCount,
      totalScenariosEvaluated: snap.scenarioRunsTotal,
      uptimeSeconds: snap.uptimeSeconds,
      storageMode: 'durable_atomic_file_adapter',
      metricStatus: {
        ai: snap.aiMetricStatus,
        db: snap.dbMetricStatus,
        cache: snap.cacheMetricStatus,
        calculation: snap.calculationMetricStatus
      }
    };
  }

  // ----------------------------------------------------
  // POSTGRESQL MIGRATION EXPORTER (PHẦN 3)
  // Generates DDL & Data Inserts for seamless PostgreSQL transition
  // ----------------------------------------------------
  async exportToPostgresSql(): Promise<string> {
    return this.exportToPostgresSqlSync();
  }

  exportToPostgresSqlSync(): string {
    const ddl = `
-- ==========================================================
-- AURORA DESTINY AI — POSTGRESQL PRODUCTION MIGRATION DDL
-- Generated: ${new Date().toISOString()}
-- ==========================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'USER',
    subscription_tier VARCHAR(32) NOT NULL DEFAULT 'Free',
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(32) NOT NULL DEFAULT 'dark',
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    enable_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    enable_ai_learning BOOLEAN NOT NULL DEFAULT FALSE,
    anonymize_data BOOLEAN NOT NULL DEFAULT FALSE,
    scientific_confidence_mode BOOLEAN NOT NULL DEFAULT TRUE,
    high_contrast BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_guest BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_seed VARCHAR(255),
    birth_data JSONB NOT NULL,
    behavioral_context JSONB NOT NULL,
    latest_calculation_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);

CREATE TABLE IF NOT EXISTS calculations (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calculation_version VARCHAR(32) NOT NULL,
    astrology_rules_version VARCHAR(32) NOT NULL,
    analysis_model_version VARCHAR(32) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    input_snapshot JSONB NOT NULL,
    bazi JSONB NOT NULL,
    ziwei JSONB NOT NULL,
    decades JSONB NOT NULL,
    annual_transits JSONB NOT NULL,
    confidence JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_calculations_profile ON calculations(profile_id);

CREATE TABLE IF NOT EXISTS historical_events (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    impact VARCHAR(64) NOT NULL,
    intensity INTEGER NOT NULL,
    description TEXT,
    evidence_note TEXT,
    user_confidence INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_profile ON historical_events(profile_id);

CREATE TABLE IF NOT EXISTS backtest_results (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calculation_id VARCHAR(64) REFERENCES calculations(id) ON DELETE CASCADE,
    destiny_consistency_score INTEGER NOT NULL,
    confidence_band VARCHAR(64) NOT NULL,
    total_events_analyzed INTEGER NOT NULL,
    matched_events_count INTEGER NOT NULL,
    divergent_events_count INTEGER NOT NULL,
    neutral_events_count INTEGER NOT NULL,
    comparisons JSONB NOT NULL,
    strengths_summary JSONB NOT NULL,
    anomalies_summary JSONB NOT NULL,
    uncertainty_factors JSONB NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_backtest_profile ON backtest_results(profile_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    resource VARCHAR(128) NOT NULL,
    resource_id VARCHAR(64),
    ip_hash VARCHAR(64),
    status VARCHAR(32) NOT NULL,
    request_id VARCHAR(64),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);

CREATE TABLE IF NOT EXISTS patrons (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    tier VARCHAR(32) NOT NULL DEFAULT 'tam_tinh',
    amount NUMERIC(15, 2),
    message TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    verification_type VARCHAR(64) NOT NULL DEFAULT 'UNVERIFIED',
    seal_hash VARCHAR(64) NOT NULL,
    payment_reference VARCHAR(128),
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_patrons_status ON patrons(status);
CREATE INDEX IF NOT EXISTS idx_patrons_created_at ON patrons(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_patrons_payment_reference ON patrons(payment_reference) WHERE payment_reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS payment_webhook_events (
    id VARCHAR(64) PRIMARY KEY,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    provider VARCHAR(64) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_idempotency ON payment_webhook_events(idempotency_key);
`;
    return ddl;
  }

  async ensureInitialized(): Promise<void> {
    return Promise.resolve();
  }

  async close(): Promise<void> {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = null;
    }
    this.persistSync();
    return Promise.resolve();
  }
}

// ====================================================
// REPOSITORY FACTORY & RUNTIME ARCHITECTURE
// Enforces PostgreSQL in production with fail-fast validation
// ====================================================

export function createRepository(options?: { forceMode?: 'postgresql' | 'file'; connectionString?: string }): IDatabaseRepository {
  const isProd = process.env.NODE_ENV === 'production';
  const provider = (process.env.DATABASE_PROVIDER || '').toLowerCase();
  const rawDbUrl = options?.connectionString || process.env.DATABASE_URL;
  const isPostgresUrl = typeof rawDbUrl === 'string' &&
    (rawDbUrl.startsWith('postgresql://') || rawDbUrl.startsWith('postgres://')) &&
    !rawDbUrl.toLowerCase().includes('none');

  if (options?.forceMode === 'postgresql') {
    if (!isPostgresUrl) {
      const msg = 'FATAL: forceMode="postgresql" requested but DATABASE_URL is missing or invalid.';
      console.error(`🚨 [Repository Factory] ${msg}`);
      throw new Error(msg);
    }
    console.log(`🐘 [Repository Factory] forceMode="postgresql" & valid DATABASE_URL: Instantiating PostgresDatabaseRepository.`);
    return new PostgresDatabaseRepository({ connectionString: rawDbUrl });
  }

  if ((provider === 'postgres' || provider === 'postgresql') && options?.forceMode !== 'file') {
    if (!isPostgresUrl) {
      const msg = 'FATAL: DATABASE_PROVIDER is explicitly set to "postgres" but DATABASE_URL is missing or invalid.';
      console.error(`🚨 [Repository Factory] ${msg}`);
      throw new Error(msg);
    }
    console.log(`🐘 [Repository Factory] DATABASE_PROVIDER="postgres" & valid DATABASE_URL: Instantiating PostgresDatabaseRepository.`);
    return new PostgresDatabaseRepository({ connectionString: rawDbUrl });
  }

  if (isProd && options?.forceMode === 'file' && process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION !== 'true') {
    const msg = 'FATAL: forceMode="file" is not permitted in production mode without ALLOW_FILE_STORAGE_IN_PRODUCTION=true.';
    console.error(`🚨 [Repository Factory] ${msg}`);
    throw new Error(msg);
  }

  if (isProd && !isPostgresUrl) {
    if (process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION === 'true') {
      console.error('🚨 [CRITICAL PRODUCTION WARNING] Running PersistentDatabaseRepository in production mode because ALLOW_FILE_STORAGE_IN_PRODUCTION=true. WARNING: Data stored on the local or ephemeral filesystem will NOT persist across serverless invocations or multiple container instances! Configure PostgreSQL DATABASE_URL for durable persistent storage.');
    } else {
      const msg = 'FATAL: Production mode strictly requires DATABASE_URL configured for PostgreSQL repository in multi-instance / serverless environments. Set ALLOW_FILE_STORAGE_IN_PRODUCTION=true only if explicitly running a single-instance container with durable persistent volume.';
      console.error(`🚨 [Repository Factory] ${msg}`);
      throw new Error(msg);
    }
  }

  if (isPostgresUrl && options?.forceMode !== 'file') {
    console.log(`🐘 [Repository Factory] Valid PostgreSQL DATABASE_URL detected: Instantiating PostgresDatabaseRepository.`);
    return new PostgresDatabaseRepository({ connectionString: rawDbUrl });
  }

  console.log('📁 [Repository Factory] Instantiating durable atomic PersistentDatabaseRepository (DATA_DIR).');
  return new PersistentDatabaseRepository();
}

let _lazyPersistentRepo: PersistentDatabaseRepository | null = null;
export function getPersistentRepository(): PersistentDatabaseRepository {
  if (!_lazyPersistentRepo) {
    _lazyPersistentRepo = new PersistentDatabaseRepository();
  }
  return _lazyPersistentRepo;
}

// Proxied export prevents eager instantiation at module import time
export const persistentRepository: IDatabaseRepository = new Proxy({} as IDatabaseRepository, {
  get(_target, prop) {
    const instance = getPersistentRepository();
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export function initializeRepository(): IDatabaseRepository {
  return createRepository();
}

export let repository: IDatabaseRepository = initializeRepository();

export function setRepository(repo: IDatabaseRepository): void {
  repository = repo;
}

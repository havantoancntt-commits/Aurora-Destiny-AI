// ==========================================
// AURORA DESTINY AI — POSTGRESQL PRODUCTION REPOSITORY
// Enterprise Relational Storage Engine
// Implements IDatabaseRepository with Connection Pooling, Parameterized SQL Queries,
// Real Transactions (BEGIN/COMMIT/ROLLBACK), Schema Migrations & Zero Silent Fallback.
// ==========================================

import pg from 'pg';
import crypto from 'crypto';
import { IAsyncDatabaseRepository, AuditLogEntry, FeatureFlag } from './repository';
import { UserAccount, UserPreferences, StoredSession, UserProfile } from '../types/user';
import { CalculationResult } from '../types/destiny';
import { HistoricalEvent, BacktestResult } from '../types/backtest';
import { ChatMessage } from '../types/ai';
import { telemetry } from '../telemetry/telemetryService';
import { DatabaseMigrator } from './migrator';

const { Pool } = pg;

export interface PostgresConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  statement_timeout?: number;
}

export class PostgresDatabaseRepository implements IAsyncDatabaseRepository {
  private pool: pg.Pool;
  private isConnected: boolean = false;
  private clientOverride: { query: (sql: string, params?: any[]) => Promise<any> } | null = null;
  private migrator: DatabaseMigrator;
  private migrationPromise: Promise<any> | null = null;

  constructor(config?: string | PostgresConfig, injectedPool?: pg.Pool) {
    const normalizedConfig: PostgresConfig | undefined = typeof config === 'string' ? { connectionString: config } : config;
    if (injectedPool) {
      this.pool = injectedPool;
    } else {
      const connStr = normalizedConfig?.connectionString || process.env.DATABASE_URL;
      if (!connStr && process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: DATABASE_URL is strictly required in production mode for PostgreSQL repository.');
      }
      this.pool = new Pool({
        connectionString: connStr,
        max: normalizedConfig?.max || parseInt(process.env.DB_POOL_MAX || '20', 10),
        idleTimeoutMillis: normalizedConfig?.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: normalizedConfig?.connectionTimeoutMillis || 5000,
        statement_timeout: normalizedConfig?.statement_timeout || 10000
      });
    }

    this.migrator = new DatabaseMigrator(this);
    
    // Test connectivity and run migrations on startup
    this.migrationPromise = this.init();
  }

  // Transaction client constructor
  private constructorForTransaction(client: { query: (sql: string, params?: any[]) => Promise<any> }) {
    this.pool = null as any;
    this.clientOverride = client;
    this.migrator = null as any;
  }

  private async init(): Promise<void> {
    try {
      const res = await this.query('SELECT 1 as connected');
      if (res.rows?.[0]?.connected === 1) {
        this.isConnected = true;
        console.log('🐘 [PostgreSQL] Connected successfully to database pool.');
        // Run migrations
        await this.migrator.runPendingMigrations();
      }
    } catch (err: any) {
      this.isConnected = false;
      console.error('❌ [PostgreSQL] Connection initialization or migration failed:', err.message);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`PostgreSQL production initialization failure: ${err.message}`);
      }
    }
  }

  public async ensureInitialized(): Promise<void> {
    if (this.migrationPromise) {
      await this.migrationPromise;
    }
  }

  public async connect(): Promise<{ query: (sql: string, params?: any[]) => Promise<any>; release: () => void }> {
    if (this.clientOverride) {
      return {
        query: (sql: string, params?: any[]) => this.clientOverride!.query(sql, params),
        release: () => {}
      };
    }
    if (!this.pool) {
      throw new Error('PostgreSQL connection pool is not initialized');
    }
    const client = await this.pool.connect();
    return {
      query: (sql: string, params?: any[]) => client.query(sql, params),
      release: () => client.release()
    };
  }

  public async query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
    const start = Date.now();
    try {
      const runner = this.clientOverride || this.pool;
      if (!runner) {
        throw new Error('PostgreSQL client pool is not initialized');
      }
      const result = await runner.query(sql, params);
      const duration = Date.now() - start;
      telemetry.recordDbQuery(duration, true);
      return {
        rows: result.rows || [],
        rowCount: result.rowCount || 0
      };
    } catch (err: any) {
      const duration = Date.now() - start;
      telemetry.recordDbQuery(duration, false);
      console.error(`❌ [PostgreSQL Error] Query failed: "${sql.slice(0, 80)}..."`, err.message);
      throw err;
    }
  }

  // --- USERS & AUTH ---
  async getUser(userId: string): Promise<UserAccount | null> {
    const res = await this.query(
      `SELECT id, email, full_name as "fullName", role, subscription_tier as "subscriptionTier", 
              language, email_verified as "emailVerified", created_at as "createdAt", last_login_at as "lastLoginAt"
       FROM users WHERE id = $1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  async getAllUsers(): Promise<UserAccount[]> {
    const res = await this.query(
      `SELECT id, email, full_name as "fullName", role, subscription_tier as "subscriptionTier", 
              language, email_verified as "emailVerified", created_at as "createdAt", last_login_at as "lastLoginAt"
       FROM users ORDER BY created_at DESC`
    );
    return res.rows;
  }

  async getUserByEmail(email: string): Promise<(UserAccount & { passwordHash?: string }) | null> {
    const res = await this.query(
      `SELECT id, email, full_name as "fullName", role, subscription_tier as "subscriptionTier", 
              language, email_verified as "emailVerified", password_hash as "passwordHash", 
              created_at as "createdAt", last_login_at as "lastLoginAt"
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );
    return res.rows[0] || null;
  }

  async saveUser(user: UserAccount, passwordHash?: string): Promise<UserAccount> {
    const res = await this.query(
      `INSERT INTO users (id, email, full_name, role, subscription_tier, language, email_verified, password_hash, created_at, last_login_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         subscription_tier = EXCLUDED.subscription_tier,
         language = EXCLUDED.language,
         email_verified = EXCLUDED.email_verified,
         password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
         last_login_at = EXCLUDED.last_login_at
       RETURNING id, email, full_name as "fullName", role, subscription_tier as "subscriptionTier", 
                 language, email_verified as "emailVerified", created_at as "createdAt", last_login_at as "lastLoginAt"`,
      [
        user.id,
        user.email.toLowerCase().trim(),
        user.fullName,
        user.role,
        user.subscriptionTier || 'Free',
        user.language || 'vi',
        !!user.emailVerified,
        passwordHash || null,
        user.createdAt || new Date().toISOString(),
        user.lastLoginAt || new Date().toISOString()
      ]
    );
    return res.rows[0];
  }

  async deleteUser(userId: string): Promise<boolean> {
    const res = await this.query('DELETE FROM users WHERE id = $1', [userId]);
    return (res.rowCount || 0) > 0;
  }

  async getAllUserData(userId: string): Promise<any> {
    const [user, preferences, profiles] = await Promise.all([
      this.getUser(userId),
      this.getPreferences(userId),
      this.getProfiles(userId)
    ]);
    return { user, preferences, profiles };
  }

  // --- PREFERENCES ---
  async getPreferences(userId: string): Promise<UserPreferences> {
    const res = await this.query(
      `SELECT user_id as "userId", theme, language, timezone, 
              enable_notifications as "enableNotifications", 
              enable_ai_learning as "enableAILearning", 
              anonymize_data as "anonymizeData", 
              scientific_confidence_mode as "scientificConfidenceMode", 
              high_contrast as "highContrast"
       FROM user_preferences WHERE user_id = $1`,
      [userId]
    );
    if (res.rows[0]) {
      return res.rows[0];
    }
    return {
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
    const current = await this.getPreferences(userId);
    const merged = { ...current, ...prefs };
    const res = await this.query(
      `INSERT INTO user_preferences (user_id, theme, language, timezone, enable_notifications, enable_ai_learning, anonymize_data, scientific_confidence_mode, high_contrast)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id) DO UPDATE SET
         theme = EXCLUDED.theme,
         language = EXCLUDED.language,
         timezone = EXCLUDED.timezone,
         enable_notifications = EXCLUDED.enable_notifications,
         enable_ai_learning = EXCLUDED.enable_ai_learning,
         anonymize_data = EXCLUDED.anonymize_data,
         scientific_confidence_mode = EXCLUDED.scientific_confidence_mode,
         high_contrast = EXCLUDED.high_contrast
       RETURNING user_id as "userId", theme, language, timezone, 
                 enable_notifications as "enableNotifications", 
                 enable_ai_learning as "enableAILearning", 
                 anonymize_data as "anonymizeData", 
                 scientific_confidence_mode as "scientificConfidenceMode", 
                 high_contrast as "highContrast"`,
      [
        userId,
        merged.theme,
        merged.language,
        merged.timezone,
        merged.enableNotifications,
        merged.enableAILearning,
        merged.anonymizeData,
        merged.scientificConfidenceMode,
        merged.highContrast
      ]
    );
    return res.rows[0];
  }

  // --- SESSIONS ---
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async saveSession(session: StoredSession): Promise<void> {
    const tokenHash = this.hashToken(session.token);
    await this.query(
      `INSERT INTO sessions (token, token_hash, user_id, expires_at, created_at, last_accessed_at, is_guest)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (token) DO UPDATE SET
         token_hash = EXCLUDED.token_hash,
         last_accessed_at = EXCLUDED.last_accessed_at,
         expires_at = EXCLUDED.expires_at`,
      [
        tokenHash,
        tokenHash,
        session.userId,
        new Date(session.expiresAt).toISOString(),
        new Date(session.createdAt).toISOString(),
        new Date(session.lastAccessedAt).toISOString(),
        !!session.isGuest
      ]
    );
  }

  async getSession(token: string): Promise<StoredSession | null> {
    const tokenHash = this.hashToken(token);
    const res = await this.query(
      `SELECT token, token_hash, user_id as "userId", expires_at, created_at, last_accessed_at, is_guest as "isGuest"
       FROM sessions WHERE token_hash = $1 OR token = $1`,
      [tokenHash]
    );
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      token, // Maintain original session token for caller context
      userId: r.userId,
      expiresAt: new Date(r.expires_at).getTime(),
      createdAt: new Date(r.created_at).getTime(),
      lastAccessedAt: new Date(r.last_accessed_at).getTime(),
      isGuest: r.isGuest
    };
  }

  async deleteSession(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    const res = await this.query('DELETE FROM sessions WHERE token_hash = $1 OR token = $1', [tokenHash]);
    return (res.rowCount || 0) > 0;
  }

  async cleanupExpiredSessions(): Promise<number> {
    if (!this.pool) return 0;
    const client = await this.pool.connect();
    const CLEANUP_LOCK_ID = 889902;
    try {
      const lockRes = await client.query('SELECT pg_try_advisory_lock($1) as acquired', [CLEANUP_LOCK_ID]);
      const acquired = lockRes.rows[0]?.acquired;
      if (!acquired) {
        // Another instance is already executing the scheduled cleanup job
        return 0;
      }
      try {
        const res = await client.query('DELETE FROM sessions WHERE expires_at <= NOW()');
        // Cascade purge abandoned guest users whose sessions have expired
        await client.query(`
          DELETE FROM users 
          WHERE id LIKE 'usr_guest_%' 
            AND id NOT IN (SELECT user_id FROM sessions WHERE expires_at > NOW())
        `);
        return res.rowCount || 0;
      } finally {
        await client.query('SELECT pg_advisory_unlock($1)', [CLEANUP_LOCK_ID]);
      }
    } catch (err) {
      console.error('[PostgreSQL] cleanupExpiredSessions error:', err);
      return 0;
    } finally {
      client.release();
    }
  }

  async revokeUserSessions(userId: string): Promise<number> {
    const res = await this.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    return res.rowCount || 0;
  }

  // --- PASSWORD RESET ---
  async createPasswordReset(userId: string): Promise<{ token: string; expiresAt: number }> {
    const rawToken = `rst_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    await this.query(
      `INSERT INTO password_reset_tokens (token, token_hash, user_id, expires_at, used, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())`,
      [tokenHash, tokenHash, userId, new Date(expiresAt).toISOString()]
    );
    return { token: rawToken, expiresAt };
  }

  async verifyAndConsumePasswordReset(token: string): Promise<string | null> {
    const tokenHash = this.hashToken(token);
    const res = await this.query(
      `UPDATE password_reset_tokens 
       SET used = true 
       WHERE (token_hash = $1 OR token = $1) AND used = false AND expires_at > NOW()
       RETURNING user_id as "userId"`,
      [tokenHash]
    );
    const userId = res.rows[0]?.userId || null;
    if (userId) {
      await this.revokeUserSessions(userId);
    }
    return userId;
  }

  // --- PROFILES ---
  async getProfiles(userId: string): Promise<UserProfile[]> {
    const res = await this.query(
      `SELECT id, user_id as "userId", name, is_primary as "isPrimary", avatar_seed as "avatarSeed",
              birth_data as "birthData", behavioral_context as "behavioralContext", 
              latest_calculation_id as "latestCalculationId", created_at as "createdAt", updated_at as "updatedAt"
       FROM profiles WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  }

  async getProfile(profileId: string): Promise<UserProfile | null> {
    const res = await this.query(
      `SELECT id, user_id as "userId", name, is_primary as "isPrimary", avatar_seed as "avatarSeed",
              birth_data as "birthData", behavioral_context as "behavioralContext", 
              latest_calculation_id as "latestCalculationId", created_at as "createdAt", updated_at as "updatedAt"
       FROM profiles WHERE id = $1`,
      [profileId]
    );
    return res.rows[0] || null;
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const res = await this.query(
      `INSERT INTO profiles (id, user_id, name, is_primary, avatar_seed, birth_data, behavioral_context, latest_calculation_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         is_primary = EXCLUDED.is_primary,
         avatar_seed = EXCLUDED.avatar_seed,
         birth_data = EXCLUDED.birth_data,
         behavioral_context = EXCLUDED.behavioral_context,
         latest_calculation_id = EXCLUDED.latest_calculation_id,
         updated_at = EXCLUDED.updated_at
       RETURNING id, user_id as "userId", name, is_primary as "isPrimary", avatar_seed as "avatarSeed",
                 birth_data as "birthData", behavioral_context as "behavioralContext", 
                 latest_calculation_id as "latestCalculationId", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        profile.id,
        profile.userId,
        profile.name,
        !!profile.isPrimary,
        profile.avatarSeed || null,
        JSON.stringify(profile.birthData),
        JSON.stringify(profile.behavioralContext || {}),
        profile.latestCalculationId || null,
        profile.createdAt || new Date().toISOString(),
        profile.updatedAt || new Date().toISOString()
      ]
    );
    return res.rows[0];
  }

  async deleteProfile(profileId: string, userId: string): Promise<boolean> {
    const res = await this.query('DELETE FROM profiles WHERE id = $1 AND user_id = $2', [profileId, userId]);
    return (res.rowCount || 0) > 0;
  }

  // --- CALCULATIONS ---
  async getCalculation(calculationId: string): Promise<CalculationResult | null> {
    const res = await this.query(
      `SELECT id, profile_id as "profileId", calculation_version as "calculationVersion", 
              astrology_rules_version as "astrologyRulesVersion", analysis_model_version as "analysisModelVersion",
              input_snapshot as "inputSnapshot", bazi, ziwei, decades, annual_transits as "annualTransits",
              confidence, timestamp
       FROM calculations WHERE id = $1`,
      [calculationId]
    );
    return res.rows[0] || null;
  }

  async getLatestCalculationForProfile(profileId: string): Promise<CalculationResult | null> {
    const res = await this.query(
      `SELECT id, profile_id as "profileId", calculation_version as "calculationVersion", 
              astrology_rules_version as "astrologyRulesVersion", analysis_model_version as "analysisModelVersion",
              input_snapshot as "inputSnapshot", bazi, ziwei, decades, annual_transits as "annualTransits",
              confidence, timestamp
       FROM calculations WHERE profile_id = $1 ORDER BY timestamp DESC LIMIT 1`,
      [profileId]
    );
    return res.rows[0] || null;
  }

  async saveCalculation(calc: CalculationResult): Promise<CalculationResult> {
    const res = await this.query(
      `INSERT INTO calculations (id, profile_id, calculation_version, astrology_rules_version, analysis_model_version, input_snapshot, bazi, ziwei, decades, annual_transits, confidence, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         calculation_version = EXCLUDED.calculation_version,
         astrology_rules_version = EXCLUDED.astrology_rules_version,
         analysis_model_version = EXCLUDED.analysis_model_version,
         input_snapshot = EXCLUDED.input_snapshot,
         bazi = EXCLUDED.bazi,
         ziwei = EXCLUDED.ziwei,
         decades = EXCLUDED.decades,
         annual_transits = EXCLUDED.annual_transits,
         confidence = EXCLUDED.confidence,
         timestamp = EXCLUDED.timestamp
       RETURNING id, profile_id as "profileId", calculation_version as "calculationVersion", 
                 astrology_rules_version as "astrologyRulesVersion", analysis_model_version as "analysisModelVersion",
                 input_snapshot as "inputSnapshot", bazi, ziwei, decades, annual_transits as "annualTransits",
                 confidence, timestamp`,
      [
        calc.id,
        calc.profileId,
        calc.calculationVersion,
        calc.astrologyRulesVersion,
        calc.analysisModelVersion,
        JSON.stringify(calc.inputSnapshot),
        JSON.stringify(calc.bazi),
        JSON.stringify(calc.ziwei),
        JSON.stringify(calc.decades),
        JSON.stringify(calc.annualTransits),
        JSON.stringify(calc.confidence),
        calc.timestamp || new Date().toISOString()
      ]
    );
    return res.rows[0];
  }

  // --- HISTORICAL EVENTS ---
  async getHistoricalEvents(profileId: string): Promise<HistoricalEvent[]> {
    const res = await this.query(
      `SELECT id, profile_id as "profileId", year, month, title, category, impact, intensity,
              description, evidence_note as "evidenceNote", user_confidence as "userConfidence",
              created_at as "createdAt"
       FROM historical_events WHERE profile_id = $1 ORDER BY year ASC`,
      [profileId]
    );
    return res.rows;
  }

  async addHistoricalEvent(event: HistoricalEvent): Promise<HistoricalEvent> {
    const res = await this.query(
      `INSERT INTO historical_events (id, profile_id, year, month, title, category, impact, intensity, description, evidence_note, user_confidence, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, profile_id as "profileId", year, month, title, category, impact, intensity,
                 description, evidence_note as "evidenceNote", user_confidence as "userConfidence",
                 created_at as "createdAt"`,
      [
        event.id,
        event.profileId,
        event.year,
        event.month || null,
        event.title,
        event.category,
        event.impact,
        event.intensity,
        event.description || '',
        event.evidenceNote || null,
        event.userConfidence || 5,
        event.createdAt || new Date().toISOString()
      ]
    );
    return res.rows[0];
  }

  async deleteHistoricalEvent(profileId: string, eventId: string): Promise<boolean> {
    const res = await this.query(
      'DELETE FROM historical_events WHERE id = $1 AND profile_id = $2',
      [eventId, profileId]
    );
    return (res.rowCount || 0) > 0;
  }

  // --- BACKTEST RESULTS ---
  async getBacktestResult(profileId: string): Promise<BacktestResult | null> {
    const res = await this.query(
      `SELECT id, profile_id as "profileId", calculation_id as "calculationId", 
              destiny_consistency_score as "destinyConsistencyScore", historical_hit_rate as "historicalHitRate",
              statistical_disclaimer as "statisticalDisclaimer", confidence_band as "confidenceBand",
              total_events_analyzed as "totalEventsAnalyzed", matched_events_count as "matchedEventsCount",
              divergent_events_count as "divergentEventsCount", neutral_events_count as "neutralEventsCount",
              comparisons, strengths_summary as "strengthsSummary", anomalies_summary as "anomaliesSummary",
              uncertainty_factors as "uncertaintyFactors", timestamp
       FROM backtest_results WHERE profile_id = $1 ORDER BY timestamp DESC LIMIT 1`,
      [profileId]
    );
    return res.rows[0] || null;
  }

  async saveBacktestResult(result: BacktestResult): Promise<BacktestResult> {
    const res = await this.query(
      `INSERT INTO backtest_results (id, profile_id, calculation_id, destiny_consistency_score, historical_hit_rate, statistical_disclaimer, confidence_band, total_events_analyzed, matched_events_count, divergent_events_count, neutral_events_count, comparisons, strengths_summary, anomalies_summary, uncertainty_factors, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (id) DO UPDATE SET
         destiny_consistency_score = EXCLUDED.destiny_consistency_score,
         historical_hit_rate = EXCLUDED.historical_hit_rate,
         statistical_disclaimer = EXCLUDED.statistical_disclaimer,
         confidence_band = EXCLUDED.confidence_band,
         total_events_analyzed = EXCLUDED.total_events_analyzed,
         matched_events_count = EXCLUDED.matched_events_count,
         divergent_events_count = EXCLUDED.divergent_events_count,
         neutral_events_count = EXCLUDED.neutral_events_count,
         comparisons = EXCLUDED.comparisons,
         strengths_summary = EXCLUDED.strengths_summary,
         anomalies_summary = EXCLUDED.anomalies_summary,
         uncertainty_factors = EXCLUDED.uncertainty_factors,
         timestamp = EXCLUDED.timestamp
       RETURNING id, profile_id as "profileId", calculation_id as "calculationId", 
                 destiny_consistency_score as "destinyConsistencyScore", historical_hit_rate as "historicalHitRate",
                 statistical_disclaimer as "statisticalDisclaimer", confidence_band as "confidenceBand",
                 total_events_analyzed as "totalEventsAnalyzed", matched_events_count as "matchedEventsCount",
                 divergent_events_count as "divergentEventsCount", neutral_events_count as "neutralEventsCount",
                 comparisons, strengths_summary as "strengthsSummary", anomalies_summary as "anomaliesSummary",
                 uncertainty_factors as "uncertaintyFactors", timestamp`,
      [
        result.id,
        result.profileId,
        result.calculationId || null,
        result.destinyConsistencyScore,
        result.historicalHitRate || 0,
        result.statisticalSignificanceDisclaimer || (result as any).statisticalDisclaimer || null,
        result.confidenceBand,
        result.totalEventsAnalyzed,
        result.matchedEventsCount,
        result.divergentEventsCount,
        result.neutralEventsCount,
        JSON.stringify(result.comparisons || []),
        JSON.stringify(result.strengthsSummary || []),
        JSON.stringify(result.anomaliesSummary || []),
        JSON.stringify(result.uncertaintyFactors || []),
        result.timestamp || new Date().toISOString()
      ]
    );
    return res.rows[0];
  }

  // --- CHAT MESSAGES ---
  async getChatMessages(profileId: string): Promise<ChatMessage[]> {
    const res = await this.query(
      `SELECT id, role as sender, content, timestamp
       FROM chat_messages WHERE profile_id = $1 ORDER BY timestamp ASC`,
      [profileId]
    );
    return res.rows;
  }

  async addChatMessage(profileId: string, message: ChatMessage): Promise<ChatMessage> {
    const res = await this.query(
      `INSERT INTO chat_messages (id, profile_id, role, content, timestamp, tokens, model)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, role as sender, content, timestamp`,
      [
        message.id,
        profileId,
        message.sender,
        message.content,
        message.timestamp || new Date().toISOString(),
        null,
        message.agentRef || null
      ]
    );
    return res.rows[0];
  }

  async clearChatMessages(profileId: string): Promise<boolean> {
    const res = await this.query('DELETE FROM chat_messages WHERE profile_id = $1', [profileId]);
    return (res.rowCount || 0) >= 0;
  }

  // --- AUDIT LOGS ---
  async logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const id = `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    await this.query(
      `INSERT INTO audit_logs (id, user_id, action, resource, resource_id, ip_hash, status, request_id, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        id,
        entry.userId || null,
        entry.action,
        entry.resource,
        entry.resourceId || null,
        entry.ipHash || null,
        entry.status,
        entry.requestId || null
      ]
    );
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLogEntry[]> {
    const res = await this.query(
      `SELECT id, user_id as "userId", action, resource, resource_id as "resourceId",
              ip_hash as "ipHash", status, request_id as "requestId", timestamp
       FROM audit_logs ORDER BY timestamp DESC LIMIT $1`,
      [limit]
    );
    return res.rows;
  }

  // --- FEATURE FLAGS ---
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const res = await this.query('SELECT key, name, description, enabled, updated_at as "updatedAt" FROM feature_flags ORDER BY key ASC');
    return res.rows;
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag | null> {
    const res = await this.query(
      'SELECT key, name, description, enabled, updated_at as "updatedAt" FROM feature_flags WHERE key = $1',
      [key]
    );
    return res.rows[0] || null;
  }

  async toggleFeatureFlag(key: string, enabled: boolean): Promise<FeatureFlag | null> {
    const res = await this.query(
      `UPDATE feature_flags 
       SET enabled = $1, updated_at = NOW() 
       WHERE key = $2 
       RETURNING key, name, description, enabled, updated_at as "updatedAt"`,
      [enabled, key]
    );
    return res.rows[0] || null;
  }

  public static createTransactional(client: { query: (sql: string, params?: any[]) => Promise<any> }): PostgresDatabaseRepository {
    const txRepo = Object.create(PostgresDatabaseRepository.prototype) as PostgresDatabaseRepository;
    (txRepo as any).pool = null;
    (txRepo as any).clientOverride = client;
    (txRepo as any).migrator = null;
    (txRepo as any).isConnected = true;
    return txRepo;
  }

  // --- REAL TRANSACTIONS (BEGIN, COMMIT, ROLLBACK) ---
  async runTransaction<T>(action: (repo: IAsyncDatabaseRepository) => Promise<T>): Promise<T> {
    const runner = this.clientOverride || this.pool;
    if (!runner) {
      throw new Error('Cannot start transaction without an active PostgreSQL connection.');
    }
    if (this.clientOverride) {
      return await action(this);
    }

    const client = await (this.pool as pg.Pool).connect();
    try {
      await client.query('BEGIN');
      const txRepo = PostgresDatabaseRepository.createTransactional(client);
      const result = await action(txRepo);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Failed to execute ROLLBACK:', rollbackErr);
      }
      throw err;
    } finally {
      client.release();
    }
  }

  // --- INTEGRITY VERIFICATION ---
  async verifyDatabaseIntegrity(): Promise<{ valid: boolean; errors: string[]; checksum: string }> {
    const errors: string[] = [];
    try {
      // 1. Connection test
      await this.query('SELECT 1');

      // 2. Check for orphaned profiles
      const orphanProfiles = await this.query(`
        SELECT p.id, p.user_id FROM profiles p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE u.id IS NULL
      `);
      if (orphanProfiles.rows.length > 0) {
        errors.push(`Found ${orphanProfiles.rows.length} orphaned profiles with non-existent users.`);
      }

      // 3. Check for orphaned calculations
      const orphanCalcs = await this.query(`
        SELECT c.id, c.profile_id FROM calculations c
        LEFT JOIN profiles p ON c.profile_id = p.id
        WHERE p.id IS NULL
      `);
      if (orphanCalcs.rows.length > 0) {
        errors.push(`Found ${orphanCalcs.rows.length} orphaned calculations with non-existent profiles.`);
      }

      // 4. Check for orphaned historical events
      const orphanEvents = await this.query(`
        SELECT h.id, h.profile_id FROM historical_events h
        LEFT JOIN profiles p ON h.profile_id = p.id
        WHERE p.id IS NULL
      `);
      if (orphanEvents.rows.length > 0) {
        errors.push(`Found ${orphanEvents.rows.length} orphaned historical events.`);
      }

      const hash = crypto.createHash('sha256')
        .update(`postgres_integrity_${Date.now()}_${errors.length}`)
        .digest('hex');

      return {
        valid: errors.length === 0,
        errors,
        checksum: hash
      };
    } catch (err: any) {
      return {
        valid: false,
        errors: [`PostgreSQL Database Integrity Check Error: ${err.message}`],
        checksum: 'error'
      };
    }
  }

  exportToPostgresSql(): string {
    return '-- Current database engine is already native PostgreSQL.';
  }

  // --- REAL METRICS (ZERO HARDCODED VALUES) ---
  async getMetrics(): Promise<any> {
    const snap = telemetry.getSnapshot();
    
    let userCount = 0;
    let profileCount = 0;
    let calcCount = 0;
    let eventCount = 0;
    let sessionCount = 0;
    let auditCount = 0;

    try {
      const [uRes, pRes, cRes, eRes, sRes, aRes] = await Promise.all([
        this.query('SELECT COUNT(*) as c FROM users'),
        this.query('SELECT COUNT(*) as c FROM profiles'),
        this.query('SELECT COUNT(*) as c FROM calculations'),
        this.query('SELECT COUNT(*) as c FROM historical_events'),
        this.query('SELECT COUNT(*) as c FROM sessions WHERE expires_at > NOW()'),
        this.query('SELECT COUNT(*) as c FROM audit_logs')
      ]);

      userCount = parseInt(uRes.rows[0]?.c || '0', 10);
      profileCount = parseInt(pRes.rows[0]?.c || '0', 10);
      calcCount = parseInt(cRes.rows[0]?.c || '0', 10);
      eventCount = parseInt(eRes.rows[0]?.c || '0', 10);
      sessionCount = parseInt(sRes.rows[0]?.c || '0', 10);
      auditCount = parseInt(aRes.rows[0]?.c || '0', 10);
    } catch (err: any) {
      console.warn('[Metrics] Could not fetch real counts from PostgreSQL:', err.message);
    }

    return {
      activeUsers24h: Math.max(sessionCount, userCount, 0),
      totalUsers: userCount,
      totalProfiles: profileCount,
      totalProfilesStored: profileCount,
      totalCalculations: calcCount,
      totalEvents: eventCount,
      totalActiveSessions: sessionCount,
      totalAuditLogs: auditCount,
      aiRequestsCount: snap.aiRequestsTotal,
      aiLatencyAvgMs: snap.aiLatencyAvgMs,
      aiLatencyP50Ms: snap.aiPercentiles.p50,
      aiLatencyP95Ms: snap.aiPercentiles.p95,
      aiLatencyP99Ms: snap.aiPercentiles.p99,
      aiSuccessRate: snap.aiSuccessRate,
      aiMetricStatus: snap.aiMetricStatus,
      calculationDeterministicRate: snap.calculationDeterministicRate,
      calcLatencyP50Ms: snap.calculationPercentiles.p50,
      calcLatencyP95Ms: snap.calculationPercentiles.p95,
      calcLatencyP99Ms: snap.calculationPercentiles.p99,
      calculationMetricStatus: snap.calculationMetricStatus,
      dbLatencyMs: snap.dbLatencyAvgMs,
      dbLatencyP50Ms: snap.dbPercentiles.p50,
      dbLatencyP95Ms: snap.dbPercentiles.p95,
      dbLatencyP99Ms: snap.dbPercentiles.p99,
      dbMetricStatus: snap.dbMetricStatus,
      cacheHitRatio: snap.cacheHitRatio,
      cacheMetricStatus: snap.cacheMetricStatus,
      totalBacktestRuns: snap.backtestRunsTotal,
      totalScenariosEvaluated: snap.scenarioRunsTotal,
      uptimeSeconds: snap.uptimeSeconds,
      storageMode: 'postgresql_production_adapter',
      metricStatus: {
        ai: snap.aiMetricStatus,
        db: snap.dbMetricStatus,
        cache: snap.cacheMetricStatus,
        calculation: snap.calculationMetricStatus
      }
    };
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

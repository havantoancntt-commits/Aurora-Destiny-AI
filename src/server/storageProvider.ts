// ==========================================
// AURORA DESTINY AI — DURABLE OBJECT STORAGE PROVIDER
// Production Storage Abstraction for Staged Documents & PDFs
// Multi-instance / Serverless Safe with Atomic Download Limit Controls
// Supports PostgreSQL Durable Table Storage, LocalDisk & Memory
// Includes HMAC-SHA256 Signed Tokens with Constant-Time Verification
// ==========================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

export interface StoredFileMetadata {
  fileName: string;
  userId?: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: number;
  contentType: string;
  size: number;
  checksum: string;
}

export interface StoredFileResult {
  data: Buffer;
  metadata: StoredFileMetadata;
}

export interface ConsumeDownloadResult {
  allowed: boolean;
  downloadCount: number;
  maxDownloads: number;
  data?: Buffer;
  metadata?: StoredFileMetadata;
  reason?: 'EXPIRED' | 'LIMIT_EXCEEDED' | 'NOT_FOUND';
}

export interface IObjectStorageProvider {
  save(key: string, data: Buffer, metadata: Omit<StoredFileMetadata, 'checksum' | 'size' | 'downloadCount'>): Promise<void>;
  get(key: string): Promise<StoredFileResult | null>;
  delete(key: string): Promise<void>;
  consumeDownload(key: string): Promise<ConsumeDownloadResult>;
  incrementDownloadCount(key: string): Promise<number>; // Backward-compatible
  cleanupExpired(): Promise<number>;
}

// ----------------------------------------------------
// 1. LOCAL DISK STORAGE PROVIDER (DEV & SINGLE CONTAINER)
// ----------------------------------------------------
export class LocalDiskStorageProvider implements IObjectStorageProvider {
  private baseDir: string;
  private cleanupInterval: NodeJS.Timeout | null = null;
  // Per-key Mutex queue to serialize atomic operations in-process
  private keyLocks = new Map<string, Promise<any>>();

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), '.aurora_storage', 'staged_pdf');
    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true, mode: 0o700 });
      }
    } catch (err: any) {
      console.warn('⚠️ [Storage] Could not create storage directory, using system temp dir:', err.message);
      this.baseDir = path.join('/tmp', 'aurora_storage', 'staged_pdf');
      fs.mkdirSync(this.baseDir, { recursive: true, mode: 0o700 });
    }

    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    if (!isServerless) {
      this.cleanupInterval = setInterval(() => {
        this.cleanupExpired().catch(() => {});
      }, 3 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  public close(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private getFilePath(key: string): string {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
    return path.join(this.baseDir, `${safeKey}.bin`);
  }

  private getMetaPath(key: string): string {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
    return path.join(this.baseDir, `${safeKey}.meta.json`);
  }

  private async acquireKeyLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
    const currentLock = this.keyLocks.get(safeKey) || Promise.resolve();
    let resolveLock: () => void = () => {};
    const nextLock = new Promise<void>(res => { resolveLock = res; });
    this.keyLocks.set(safeKey, nextLock);

    try {
      await currentLock;
      return await fn();
    } finally {
      resolveLock();
      if (this.keyLocks.get(safeKey) === nextLock) {
        this.keyLocks.delete(safeKey);
      }
    }
  }

  async save(key: string, data: Buffer, meta: Omit<StoredFileMetadata, 'checksum' | 'size' | 'downloadCount'>): Promise<void> {
    return this.acquireKeyLock(key, async () => {
      const checksum = crypto.createHash('sha256').update(data).digest('hex');
      const fullMeta: StoredFileMetadata = {
        ...meta,
        checksum,
        size: data.length,
        downloadCount: 0
      };

      const filePath = this.getFilePath(key);
      const metaPath = this.getMetaPath(key);
      const tempFile = `${filePath}.tmp_${Date.now()}`;
      const tempMeta = `${metaPath}.tmp_${Date.now()}`;

      await fs.promises.writeFile(tempFile, data, { mode: 0o600 });
      await fs.promises.writeFile(tempMeta, JSON.stringify(fullMeta, null, 2), { mode: 0o600 });

      await fs.promises.rename(tempFile, filePath);
      await fs.promises.rename(tempMeta, metaPath);
    });
  }

  async get(key: string): Promise<StoredFileResult | null> {
    const filePath = this.getFilePath(key);
    const metaPath = this.getMetaPath(key);

    if (!fs.existsSync(filePath) || !fs.existsSync(metaPath)) {
      return null;
    }

    try {
      const metaContent = await fs.promises.readFile(metaPath, 'utf8');
      const metadata: StoredFileMetadata = JSON.parse(metaContent);

      if (Date.now() > metadata.expiresAt || metadata.downloadCount >= metadata.maxDownloads) {
        await this.delete(key);
        return null;
      }

      const data = await fs.promises.readFile(filePath);

      const currentChecksum = crypto.createHash('sha256').update(data).digest('hex');
      if (currentChecksum !== metadata.checksum) {
        console.error(`❌ [Storage] Checksum mismatch for file ${key}! Stored=${metadata.checksum}, Actual=${currentChecksum}`);
        await this.delete(key);
        return null;
      }

      return { data, metadata };
    } catch (err: any) {
      console.warn(`⚠️ [Storage] Failed to read ${key}:`, err.message);
      return null;
    }
  }

  async consumeDownload(key: string): Promise<ConsumeDownloadResult> {
    return this.acquireKeyLock(key, async () => {
      const metaPath = this.getMetaPath(key);
      const filePath = this.getFilePath(key);
      if (!fs.existsSync(metaPath) || !fs.existsSync(filePath)) {
        return { allowed: false, reason: 'NOT_FOUND', downloadCount: 0, maxDownloads: 0 };
      }

      try {
        const metaContent = await fs.promises.readFile(metaPath, 'utf8');
        const metadata: StoredFileMetadata = JSON.parse(metaContent);

        if (Date.now() > metadata.expiresAt) {
          await this.delete(key);
          return { allowed: false, reason: 'EXPIRED', downloadCount: metadata.downloadCount, maxDownloads: metadata.maxDownloads };
        }

        if (metadata.downloadCount >= metadata.maxDownloads) {
          await this.delete(key);
          return { allowed: false, reason: 'LIMIT_EXCEEDED', downloadCount: metadata.downloadCount, maxDownloads: metadata.maxDownloads };
        }

        // Read payload before state change / eviction
        const data = await fs.promises.readFile(filePath);

        // Atomically consume one download unit
        metadata.downloadCount += 1;
        const isLastAllowed = metadata.downloadCount >= metadata.maxDownloads;

        if (isLastAllowed) {
          // Last allowed download: evict immediately
          await this.delete(key);
        } else {
          const tempMeta = `${metaPath}.tmp_atomic_${Date.now()}`;
          await fs.promises.writeFile(tempMeta, JSON.stringify(metadata, null, 2), { mode: 0o600 });
          await fs.promises.rename(tempMeta, metaPath);
        }

        return {
          allowed: true,
          downloadCount: metadata.downloadCount,
          maxDownloads: metadata.maxDownloads,
          data,
          metadata
        };
      } catch (err: any) {
        console.warn(`⚠️ [Storage] consumeDownload error on ${key}:`, err.message);
        return { allowed: false, reason: 'NOT_FOUND', downloadCount: 0, maxDownloads: 0 };
      }
    });
  }

  async incrementDownloadCount(key: string): Promise<number> {
    const res = await this.consumeDownload(key);
    return res.allowed ? res.downloadCount : res.downloadCount;
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    const metaPath = this.getMetaPath(key);

    try {
      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
    } catch {}
    try {
      if (fs.existsSync(metaPath)) await fs.promises.unlink(metaPath);
    } catch {}
  }

  async cleanupExpired(): Promise<number> {
    let evicted = 0;
    try {
      const files = await fs.promises.readdir(this.baseDir);
      const now = Date.now();

      for (const file of files) {
        if (file.endsWith('.meta.json')) {
          const metaPath = path.join(this.baseDir, file);
          try {
            const content = await fs.promises.readFile(metaPath, 'utf8');
            const meta: StoredFileMetadata = JSON.parse(content);
            if (now > meta.expiresAt || meta.downloadCount >= meta.maxDownloads) {
              const key = file.replace('.meta.json', '');
              await this.delete(key);
              evicted++;
            }
          } catch {
            await fs.promises.unlink(metaPath).catch(() => {});
          }
        }
      }
    } catch (err: any) {
      console.warn('⚠️ [Storage] Cleanup scan error:', err.message);
    }
    return evicted;
  }
}

// ----------------------------------------------------
// 2. IN-MEMORY STORAGE PROVIDER (EPHEMERAL / TEST USE)
// ----------------------------------------------------
export class MemoryStorageProvider implements IObjectStorageProvider {
  private memoryStore = new Map<string, StoredFileResult>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired().catch(() => {});
    }, 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  async save(key: string, data: Buffer, meta: Omit<StoredFileMetadata, 'checksum' | 'size' | 'downloadCount'>): Promise<void> {
    const checksum = crypto.createHash('sha256').update(data).digest('hex');
    this.memoryStore.set(key, {
      data,
      metadata: {
        ...meta,
        checksum,
        size: data.length,
        downloadCount: 0
      }
    });
  }

  async get(key: string): Promise<StoredFileResult | null> {
    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.metadata.expiresAt || item.metadata.downloadCount >= item.metadata.maxDownloads) {
      this.memoryStore.delete(key);
      return null;
    }
    return item;
  }

  async consumeDownload(key: string): Promise<ConsumeDownloadResult> {
    const item = this.memoryStore.get(key);
    if (!item) {
      return { allowed: false, reason: 'NOT_FOUND', downloadCount: 0, maxDownloads: 0 };
    }
    if (Date.now() > item.metadata.expiresAt) {
      this.memoryStore.delete(key);
      return { allowed: false, reason: 'EXPIRED', downloadCount: item.metadata.downloadCount, maxDownloads: item.metadata.maxDownloads };
    }
    if (item.metadata.downloadCount >= item.metadata.maxDownloads) {
      this.memoryStore.delete(key);
      return { allowed: false, reason: 'LIMIT_EXCEEDED', downloadCount: item.metadata.downloadCount, maxDownloads: item.metadata.maxDownloads };
    }

    item.metadata.downloadCount += 1;
    const isLastAllowed = item.metadata.downloadCount >= item.metadata.maxDownloads;
    const data = item.data;
    const metadata = { ...item.metadata };

    if (isLastAllowed) {
      this.memoryStore.delete(key);
    }

    return {
      allowed: true,
      downloadCount: metadata.downloadCount,
      maxDownloads: metadata.maxDownloads,
      data,
      metadata
    };
  }

  async incrementDownloadCount(key: string): Promise<number> {
    const res = await this.consumeDownload(key);
    return res.downloadCount;
  }

  async delete(key: string): Promise<void> {
    this.memoryStore.delete(key);
  }

  async cleanupExpired(): Promise<number> {
    const now = Date.now();
    let evicted = 0;
    for (const [k, item] of this.memoryStore.entries()) {
      if (now > item.metadata.expiresAt || item.metadata.downloadCount >= item.metadata.maxDownloads) {
        this.memoryStore.delete(k);
        evicted++;
      }
    }
    return evicted;
  }
}

// ----------------------------------------------------
// 3. POSTGRESQL DURABLE OBJECT STORAGE PROVIDER
// (Production multi-instance / serverless durable tier)
// ----------------------------------------------------
export class PostgresObjectStorageProvider implements IObjectStorageProvider {
  private pool: pg.Pool;

  constructor(injectedPool?: pg.Pool) {
    if (injectedPool) {
      this.pool = injectedPool;
    } else if (globalThis.__aurora_pg_pool && !((globalThis.__aurora_pg_pool as any)._ending || (globalThis.__aurora_pg_pool as any).ended)) {
      this.pool = globalThis.__aurora_pg_pool;
    } else {
      const connStr = process.env.DATABASE_URL;
      if (!connStr && process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: DATABASE_URL is strictly required for PostgresObjectStorageProvider.');
      }
      this.pool = new pg.Pool({
        connectionString: connStr,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });
      globalThis.__aurora_pg_pool = this.pool;
    }
  }

  async save(key: string, data: Buffer, meta: Omit<StoredFileMetadata, 'checksum' | 'size' | 'downloadCount'>): Promise<void> {
    const checksum = crypto.createHash('sha256').update(data).digest('hex');
    const expiresAtDate = new Date(meta.expiresAt);

    await this.pool.query(
      `INSERT INTO staged_objects (
        id, file_name, user_id, data, content_type, size, checksum, download_count, max_downloads, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        file_name = EXCLUDED.file_name,
        data = EXCLUDED.data,
        content_type = EXCLUDED.content_type,
        size = EXCLUDED.size,
        checksum = EXCLUDED.checksum,
        download_count = 0,
        max_downloads = EXCLUDED.max_downloads,
        expires_at = EXCLUDED.expires_at;`,
      [
        key,
        meta.fileName,
        meta.userId || null,
        data,
        meta.contentType || 'application/pdf',
        data.length,
        checksum,
        meta.maxDownloads || 5,
        expiresAtDate
      ]
    );
  }

  async get(key: string): Promise<StoredFileResult | null> {
    const res = await this.pool.query(
      `SELECT id, file_name, user_id, data, content_type, size, checksum, download_count, max_downloads,
              EXTRACT(EPOCH FROM expires_at) * 1000 AS expires_at_ms
       FROM staged_objects
       WHERE id = $1 AND expires_at > NOW() AND download_count < max_downloads;`,
      [key]
    );

    if (!res.rows || res.rows.length === 0) {
      // Clean up any stale or limit-reached row
      await this.pool.query(
        `DELETE FROM staged_objects WHERE id = $1 AND (expires_at <= NOW() OR download_count >= max_downloads);`,
        [key]
      ).catch(() => {});
      return null;
    }

    const row = res.rows[0];
    const dataBuf = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data);

    // Verify checksum
    const calcChecksum = crypto.createHash('sha256').update(dataBuf).digest('hex');
    if (calcChecksum !== row.checksum) {
      console.error(`❌ [PostgresStorage] Checksum mismatch for object ${key}! Stored=${row.checksum}, Calc=${calcChecksum}`);
      await this.delete(key);
      return null;
    }

    return {
      data: dataBuf,
      metadata: {
        fileName: row.file_name,
        userId: row.user_id || undefined,
        downloadCount: Number(row.download_count),
        maxDownloads: Number(row.max_downloads),
        expiresAt: Math.round(Number(row.expires_at_ms)),
        contentType: row.content_type,
        size: Number(row.size),
        checksum: row.checksum
      }
    };
  }

  /**
   * Atomic check-and-consume using PostgreSQL row-level lock UPDATE
   * Guarantees zero race condition across multi-instance serverless functions
   */
  async consumeDownload(key: string): Promise<ConsumeDownloadResult> {
    const updateRes = await this.pool.query(
      `UPDATE staged_objects
       SET download_count = download_count + 1
       WHERE id = $1 AND expires_at > NOW() AND download_count < max_downloads
       RETURNING id, file_name, user_id, data, content_type, size, checksum, download_count, max_downloads,
                 EXTRACT(EPOCH FROM expires_at) * 1000 AS expires_at_ms;`,
      [key]
    );

    if (updateRes.rows && updateRes.rows.length > 0) {
      const row = updateRes.rows[0];
      const downloadCount = Number(row.download_count);
      const maxDownloads = Number(row.max_downloads);
      const dataBuf = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data);
      const metadata: StoredFileMetadata = {
        fileName: row.file_name,
        userId: row.user_id || undefined,
        downloadCount,
        maxDownloads,
        expiresAt: Math.round(Number(row.expires_at_ms)),
        contentType: row.content_type,
        size: Number(row.size),
        checksum: row.checksum
      };

      if (downloadCount >= maxDownloads) {
        // Last allowed download consumed: evict from DB immediately
        await this.delete(key).catch(() => {});
      }

      return {
        allowed: true,
        downloadCount,
        maxDownloads,
        data: dataBuf,
        metadata
      };
    }

    // Determine reason for failure
    const checkRes = await this.pool.query(
      `SELECT download_count, max_downloads, expires_at < NOW() AS is_expired
       FROM staged_objects WHERE id = $1;`,
      [key]
    );

    if (!checkRes.rows || checkRes.rows.length === 0) {
      return { allowed: false, reason: 'NOT_FOUND', downloadCount: 0, maxDownloads: 0 };
    }

    const checkRow = checkRes.rows[0];
    await this.delete(key).catch(() => {});
    if (checkRow.is_expired) {
      return { allowed: false, reason: 'EXPIRED', downloadCount: Number(checkRow.download_count), maxDownloads: Number(checkRow.max_downloads) };
    }

    return {
      allowed: false,
      reason: 'LIMIT_EXCEEDED',
      downloadCount: Number(checkRow.download_count),
      maxDownloads: Number(checkRow.max_downloads)
    };
  }

  async incrementDownloadCount(key: string): Promise<number> {
    const res = await this.consumeDownload(key);
    return res.downloadCount;
  }

  async delete(key: string): Promise<void> {
    await this.pool.query(`DELETE FROM staged_objects WHERE id = $1;`, [key]);
  }

  async cleanupExpired(): Promise<number> {
    const res = await this.pool.query(
      `DELETE FROM staged_objects WHERE expires_at < NOW() OR download_count >= max_downloads;`
    );
    return res.rowCount || 0;
  }
}

// ----------------------------------------------------
// 4. STORAGE PROVIDER FACTORY & SINGLETON
// ----------------------------------------------------
export function createStorageProvider(): IObjectStorageProvider {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasPg = Boolean(process.env.DATABASE_URL);
  const allowLocalFileInProd = Boolean(process.env.ALLOW_FILE_STORAGE_IN_PRODUCTION);

  if (hasPg && (isProduction || process.env.STORAGE_PROVIDER === 'postgres')) {
    return new PostgresObjectStorageProvider();
  }

  if (isProduction && !allowLocalFileInProd) {
    throw new Error(
      'FATAL [Storage]: Production mode strictly requires durable object storage (DATABASE_URL configured for PostgresObjectStorageProvider, or Cloud Object Storage)! LocalDiskStorageProvider is forbidden in production multi-instance/serverless.'
    );
  }

  return new LocalDiskStorageProvider();
}

let activeStorageProvider: IObjectStorageProvider | null = null;

export function setStorageProvider(provider: IObjectStorageProvider): void {
  activeStorageProvider = provider;
}

export function getStorageProvider(): IObjectStorageProvider {
  if (!activeStorageProvider) {
    activeStorageProvider = createStorageProvider();
  }
  return activeStorageProvider;
}

// ----------------------------------------------------
// 5. CRYPTOGRAPHIC SIGNED DOWNLOAD TOKEN (HMAC-SHA256)
// ----------------------------------------------------
function getSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    const secret = process.env.ALGORITHM_PROTECTION_SECRET || process.env.APP_SECRET;
    if (!secret) {
      throw new Error('[FATAL SECURITY] ALGORITHM_PROTECTION_SECRET or APP_SECRET is strictly required in production.');
    }
    return secret;
  }
  return process.env.ALGORITHM_PROTECTION_SECRET || process.env.APP_SECRET || 'aurora_destiny_signed_token_dev_key_only';
}

export interface SignedTokenPayload {
  fileId: string;
  userId?: string;
  expiresAt: number;
  issuedAt: number;
}

export function generateSignedDownloadToken(fileId: string, userId?: string, ttlSeconds = 600): string {
  const now = Date.now();
  const expiresAt = now + ttlSeconds * 1000;
  const payload: SignedTokenPayload = { fileId, userId, expiresAt, issuedAt: now };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifySignedDownloadToken(token: string): { valid: boolean; payload?: SignedTokenPayload; reason?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'MISSING_TOKEN' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'MALFORMED_TOKEN' };
  }

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSecret())
    .update(payloadB64)
    .digest('base64url');

  // Timing safe comparison
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, reason: 'INVALID_SIGNATURE' };
  }

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload: SignedTokenPayload = JSON.parse(jsonStr);

    if (!payload.fileId || typeof payload.fileId !== 'string') {
      return { valid: false, reason: 'INVALID_PAYLOAD_SCHEMA' };
    }
    if (typeof payload.expiresAt !== 'number' || isNaN(payload.expiresAt)) {
      return { valid: false, reason: 'INVALID_PAYLOAD_SCHEMA' };
    }
    if (Date.now() > payload.expiresAt) {
      return { valid: false, reason: 'EXPIRED_TOKEN' };
    }
    // Prevent future-dated token anomaly (> 48 hours in future)
    if (payload.expiresAt > Date.now() + 48 * 3600 * 1000) {
      return { valid: false, reason: 'INVALID_TOKEN_EXPIRY' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'INVALID_PAYLOAD' };
  }
}

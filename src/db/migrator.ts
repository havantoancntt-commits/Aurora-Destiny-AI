// ==========================================
// AURORA DESTINY AI — DATABASE MIGRATOR
// Enterprise Schema Versioning, Atomic Migrations & Locks
// ==========================================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface MigrationFile {
  version: number;
  name: string;
  sql: string;
  checksum: string;
}

export class DatabaseMigrator {
  private queryRunner: {
    query: (sql: string, params?: any[]) => Promise<any>;
  };
  private static readonly ADVISORY_LOCK_ID = 74291845;

  constructor(queryRunner: { query: (sql: string, params?: any[]) => Promise<any> }) {
    this.queryRunner = queryRunner;
  }

  public getMigrationFiles(): MigrationFile[] {
    const migrationsDir = path.join(process.cwd(), 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      return [];
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    return files.map(file => {
      const match = file.match(/^(\d+)_(.+)\.sql$/);
      const version = match ? parseInt(match[1], 10) : 0;
      const name = match ? match[2] : file;
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const checksum = crypto.createHash('sha256').update(sql.trim()).digest('hex');
      return { version, name, sql, checksum };
    });
  }

  public async runPendingMigrations(): Promise<{ applied: number; versions: number[] }> {
    let lockAcquired = false;
    try {
      // 0. Acquire distributed PostgreSQL advisory lock to prevent race conditions across pods/instances
      try {
        await this.queryRunner.query('SELECT pg_advisory_lock($1)', [DatabaseMigrator.ADVISORY_LOCK_ID]);
        lockAcquired = true;
      } catch (lockErr: any) {
        // Fallback for in-memory or environments where pg_advisory_lock is not supported
        console.warn('⚠️ [Migration] Advisory lock not supported by driver, proceeding with table-level atomic checks:', lockErr.message);
      }

      // 1. Ensure schema_migrations table exists with checksum tracking
      try {
        await this.queryRunner.query(`
          CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            checksum VARCHAR(64),
            applied_at TIMESTAMPTZ
          );
        `);
      } catch {
        // Table already exists or driver limitation
      }

      // Ensure checksum column exists in existing tables
      try {
        await this.queryRunner.query(`
          ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum VARCHAR(64);
        `);
      } catch {
        // Column may already exist or ALTER not supported by driver
      }

      // 2. Query already applied migration versions and checksums
      const existing = await this.queryRunner.query(`
        SELECT version, name, checksum FROM schema_migrations ORDER BY version ASC;
      `);
      const appliedMap = new Map<number, { name: string; checksum?: string }>();
      for (const r of existing.rows) {
        appliedMap.set(Number(r.version), { name: r.name, checksum: r.checksum });
      }

      const allMigrations = this.getMigrationFiles();
      const appliedVersions: number[] = [];

      for (const m of allMigrations) {
        const applied = appliedMap.get(m.version);
        if (applied) {
          // Verify immutable integrity: if checksum exists, verify file hasn't been altered post-migration
          if (applied.checksum) {
            if (applied.checksum !== m.checksum) {
              throw new Error(
                `CRITICAL: Migration integrity violation in version ${m.version} (${m.name})! ` +
                `Recorded checksum: ${applied.checksum}, Current file checksum: ${m.checksum}. ` +
                `Applied migrations are strictly immutable and cannot be modified.`
              );
            }
          } else {
            // Backfill checksum for legacy records
            await this.queryRunner.query(
              'UPDATE schema_migrations SET checksum = $1 WHERE version = $2',
              [m.checksum, m.version]
            );
          }
        } else {
          console.log(`🚀 [Migration] Applying migration ${m.version}: ${m.name}...`);
          
          // Execute migration SQL inside an atomic transaction
          await this.queryRunner.query('BEGIN');
          try {
            await this.queryRunner.query(m.sql);
            await this.queryRunner.query(
              'INSERT INTO schema_migrations (version, name, checksum, applied_at) VALUES ($1, $2, $3, NOW())',
              [m.version, m.name, m.checksum]
            );
            await this.queryRunner.query('COMMIT');
            appliedVersions.push(m.version);
            console.log(`✅ [Migration] Migration ${m.version} applied successfully.`);
          } catch (err) {
            await this.queryRunner.query('ROLLBACK');
            console.error(`❌ [Migration] Migration ${m.version} (${m.name}) failed! Rollback executed.`, err);
            throw err;
          }
        }
      }

      return { applied: appliedVersions.length, versions: appliedVersions };
    } finally {
      if (lockAcquired) {
        try {
          await this.queryRunner.query('SELECT pg_advisory_unlock($1)', [DatabaseMigrator.ADVISORY_LOCK_ID]);
        } catch {
          // Ignore unlock error on teardown
        }
      }
    }
  }

  public async getMigrationStatus(): Promise<{ currentVersion: number; totalMigrations: number; appliedVersions: number[] }> {
    try {
      const res = await this.queryRunner.query(`
        SELECT version FROM schema_migrations ORDER BY version ASC;
      `);
      const versions = res.rows.map((r: any) => Number(r.version));
      const allFiles = this.getMigrationFiles();
      return {
        currentVersion: versions.length > 0 ? Math.max(...versions) : 0,
        totalMigrations: allFiles.length,
        appliedVersions: versions
      };
    } catch {
      return { currentVersion: 0, totalMigrations: 0, appliedVersions: [] };
    }
  }
}

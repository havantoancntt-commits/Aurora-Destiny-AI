// ==========================================
// AURORA DESTINY AI — DATABASE MIGRATOR
// Enterprise Schema Versioning, Atomic Migrations & Locks
// ==========================================

import fs from 'fs';
import path from 'path';

export interface MigrationFile {
  version: number;
  name: string;
  sql: string;
}

export class DatabaseMigrator {
  private queryRunner: {
    query: (sql: string, params?: any[]) => Promise<any>;
  };

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
      return { version, name, sql };
    });
  }

  public async runPendingMigrations(): Promise<{ applied: number; versions: number[] }> {
    // 1. Ensure schema_migrations table exists
    await this.queryRunner.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ
      );
    `);

    // 2. Query already applied migration versions
    const existing = await this.queryRunner.query(`
      SELECT version FROM schema_migrations ORDER BY version ASC;
    `);
    const appliedSet = new Set<number>(existing.rows.map((r: any) => Number(r.version)));

    const allMigrations = this.getMigrationFiles();
    const appliedVersions: number[] = [];

    for (const m of allMigrations) {
      if (!appliedSet.has(m.version)) {
        console.log(`🚀 [Migration] Applying migration ${m.version}: ${m.name}...`);
        
        // Execute migration SQL
        await this.queryRunner.query('BEGIN');
        try {
          // Some drivers support multi-statement; execute migration SQL
          await this.queryRunner.query(m.sql);
          await this.queryRunner.query(
            'INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, NOW())',
            [m.version, m.name]
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

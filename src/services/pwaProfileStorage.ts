// ==========================================
// AURORA DESTINY AI — PWA DESTINY PROFILE VAULT & OFFLINE STORAGE
// Dual-Layer Architecture: IndexedDB with LocalStorage Fallback
// Provides zero-loss offline profile caching, chart caching,
// backup/restore JSON, and automatic background sync queue.
// ==========================================

import { UserProfile } from '../types/user';
import { CalculationResult } from '../types/destiny';
import { MultiAgentEnsemble } from '../types/ai';

const DB_NAME = 'aurora_pwa_destiny_db';
const DB_VERSION = 1;
const STORE_PROFILES = 'profiles';
const STORE_CALCULATIONS = 'calculations';
const STORE_ENSEMBLES = 'ensembles';
const STORE_SYNC_QUEUE = 'sync_queue';

export interface PwaStorageStats {
  storageType: 'indexeddb' | 'localstorage';
  profileCount: number;
  calculationCount: number;
  pendingSyncCount: number;
  estimatedBytes: number;
  isOfflineReady: boolean;
  lastBackupDate?: string;
}

export interface PwaBackupPayload {
  version: number;
  app: string;
  exportedAt: string;
  source: 'aurora-destiny-ai-pwa';
  profiles: UserProfile[];
  calculations?: Record<string, CalculationResult>;
}

export function normalizeProfileSignature(name: string, birthData: any): string {
  if (!name || !birthData) return '';
  const cleanName = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd');
  const day = birthData.solarDay ?? birthData.lunarDay ?? '';
  const month = birthData.solarMonth ?? birthData.lunarMonth ?? '';
  const year = birthData.solarYear ?? birthData.lunarYear ?? '';
  return `${cleanName}_${day}_${month}_${year}`;
}

class PwaProfileStorageService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private isIndexedDbAvailable = false;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.isIndexedDbAvailable = true;
    }
  }

  /**
   * Initializes or gets the IndexedDB database instance
   */
  private getDb(): Promise<IDBDatabase | null> {
    if (!this.isIndexedDbAvailable) return Promise.resolve(null);
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_PROFILES)) {
            const profileStore = db.createObjectStore(STORE_PROFILES, { keyPath: 'id' });
            profileStore.createIndex('updatedAt', 'updatedAt', { unique: false });
            profileStore.createIndex('isPrimary', 'isPrimary', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_CALCULATIONS)) {
            db.createObjectStore(STORE_CALCULATIONS, { keyPath: 'profileId' });
          }
          if (!db.objectStoreNames.contains(STORE_ENSEMBLES)) {
            db.createObjectStore(STORE_ENSEMBLES, { keyPath: 'profileId' });
          }
          if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
            db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
          }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('[PwaStorage] IndexedDB open error, falling back to localStorage');
          this.isIndexedDbAvailable = false;
          resolve(null);
        };
      } catch (err) {
        console.warn('[PwaStorage] IndexedDB initialization exception:', err);
        this.isIndexedDbAvailable = false;
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  // ==========================================
  // TOMBSTONE & PERMANENT PURGE REGISTRY
  // ==========================================
  private readonly TOMBSTONE_KEY = 'aurora_deleted_profile_ids';
  private readonly TOMBSTONE_SIGS_KEY = 'aurora_deleted_profile_signatures';
  private memoryDeletedIds = new Set<string>();
  private memoryDeletedSigs = new Set<string>();

  /**
   * Retrieves set of decisively deleted profile IDs
   */
  public getDeletedIds(): Set<string> {
    const combined = new Set<string>(this.memoryDeletedIds);
    try {
      const storage = this.getStorage();
      if (storage) {
        const raw = storage.getItem(this.TOMBSTONE_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            for (const id of arr) combined.add(String(id));
          }
        }
      }
    } catch {}
    return combined;
  }

  /**
   * Retrieves set of decisively deleted profile signatures (name + birth data)
   */
  public getDeletedSignatures(): Set<string> {
    const combined = new Set<string>(this.memoryDeletedSigs);
    try {
      const storage = this.getStorage();
      if (storage) {
        const raw = storage.getItem(this.TOMBSTONE_SIGS_KEY);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            for (const sig of arr) combined.add(String(sig));
          }
        }
      }
    } catch {}
    return combined;
  }

  /**
   * Records a deleted profile ID permanently
   */
  public addDeletedId(profileId: string): void {
    if (!profileId) return;
    this.memoryDeletedIds.add(profileId);
    try {
      const storage = this.getStorage();
      if (storage) {
        const current = this.getDeletedIds();
        current.add(profileId);
        storage.setItem(this.TOMBSTONE_KEY, JSON.stringify(Array.from(current)));
      }
    } catch {}
  }

  /**
   * Records a deleted profile by ID and birth signature
   */
  public recordDeletedProfile(profile: { id: string; name?: string; birthData?: any }): void {
    if (!profile) return;
    if (profile.id) {
      this.addDeletedId(profile.id);
    }
    if (profile.name && profile.birthData) {
      const sig = normalizeProfileSignature(profile.name, profile.birthData);
      if (sig) {
        this.memoryDeletedSigs.add(sig);
        try {
          const storage = this.getStorage();
          if (storage) {
            const current = this.getDeletedSignatures();
            current.add(sig);
            storage.setItem(this.TOMBSTONE_SIGS_KEY, JSON.stringify(Array.from(current)));
          }
        } catch {}
      }
    }
  }

  /**
   * Checks whether a profile ID or profile object has been marked as permanently deleted
   */
  public isDeleted(target: string | UserProfile | any): boolean {
    if (!target) return false;
    if (typeof target === 'string') {
      return this.getDeletedIds().has(target);
    }
    if (target.id && this.getDeletedIds().has(target.id)) {
      return true;
    }
    if (target.name && target.birthData) {
      const sig = normalizeProfileSignature(target.name, target.birthData);
      if (sig && this.getDeletedSignatures().has(sig)) {
        return true;
      }
    }
    return false;
  }

  // ==========================================
  // PROFILE OPERATIONS
  // ==========================================

  /**
   * Saves or updates a profile in offline storage
   */
  public async saveProfile(profile: UserProfile): Promise<void> {
    if (!profile || !profile.id) return;
    if (this.isDeleted(profile)) {
      console.warn(`[PwaStorage] Rejecting save of tombstoned profile: ${profile.id}`);
      return;
    }

    // 1. Always update localStorage mirror for instant synchronous recovery
    try {
      const localProfiles = this.getLocalStorageProfiles().filter((p) => !this.isDeleted(p));
      const existingIdx = localProfiles.findIndex((p) => p.id === profile.id);
      if (existingIdx >= 0) {
        localProfiles[existingIdx] = profile;
      } else {
        localProfiles.unshift(profile);
      }
      const storage = this.getStorage();
      if (storage) {
        storage.setItem('aurora_cached_profiles', JSON.stringify({
          version: 1,
          timestamp: Date.now(),
          profiles: localProfiles
        }));
      }
    } catch (e) {
      console.warn('[PwaStorage] LocalStorage profile mirror write error:', e);
    }

    // 2. Persist into IndexedDB for high capacity & durability
    const db = await this.getDb();
    if (db) {
      try {
        const tx = db.transaction(STORE_PROFILES, 'readwrite');
        tx.objectStore(STORE_PROFILES).put(profile);
        await new Promise<void>((res, rej) => {
          tx.oncomplete = () => res();
          tx.onerror = () => rej(tx.error);
        });
      } catch (e) {
        console.warn('[PwaStorage] IndexedDB saveProfile error:', e);
      }
    }
  }

  /**
   * Saves a full list of profiles
   */
  public async saveAllProfiles(profiles: UserProfile[]): Promise<void> {
    if (!Array.isArray(profiles)) return;
    const cleanList = profiles.filter((p) => p && p.id && !this.isDeleted(p));

    // LocalStorage sync
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem('aurora_cached_profiles', JSON.stringify({
          version: 1,
          timestamp: Date.now(),
          profiles: cleanList
        }));
      }
    } catch (e) {
      console.warn('[PwaStorage] LocalStorage saveAllProfiles error:', e);
    }

    // IndexedDB batch write
    const db = await this.getDb();
    if (db) {
      try {
        const tx = db.transaction(STORE_PROFILES, 'readwrite');
        const store = tx.objectStore(STORE_PROFILES);
        // Clear old store contents and write current clean list to avoid stale orphans
        store.clear();
        for (const p of cleanList) {
          store.put(p);
        }
        await new Promise<void>((res, rej) => {
          tx.oncomplete = () => res();
          tx.onerror = () => rej(tx.error);
        });
      } catch (e) {
        console.warn('[PwaStorage] IndexedDB saveAllProfiles error:', e);
      }
    }
  }

  /**
   * Retrieves all saved profiles from storage
   * Respects empty state (does NOT resurrect deleted profiles from localStorage)
   */
  public async getProfiles(): Promise<UserProfile[]> {
    const db = await this.getDb();
    if (db) {
      try {
        const tx = db.transaction(STORE_PROFILES, 'readonly');
        const store = tx.objectStore(STORE_PROFILES);
        const req = store.getAll();
        const profiles = await new Promise<UserProfile[]>((res, rej) => {
          req.onsuccess = () => res(req.result || []);
          req.onerror = () => rej(req.error);
        });

        // IndexedDB successfully executed: filter out any tombstoned profiles
        const filtered = (profiles || []).filter((p) => p && p.id && !this.isDeleted(p));
        return this.sortProfiles(filtered);
      } catch (e) {
        console.warn('[PwaStorage] IndexedDB getProfiles error, falling back to localStorage:', e);
      }
    }

    // Fallback to localStorage ONLY if IndexedDB failed or is completely unavailable
    const local = this.getLocalStorageProfiles().filter((p) => p && p.id && !this.isDeleted(p));
    return this.sortProfiles(local);
  }

  /**
   * Deletes a profile from offline storage definitively
   */
  public async deleteProfile(target: string | { id: string; name?: string; birthData?: any }): Promise<void> {
    const profileId = typeof target === 'string' ? target : target?.id;
    if (!profileId) return;

    // 1. Permanently register in tombstone blacklist (both ID and signature)
    if (typeof target === 'object' && target.name && target.birthData) {
      this.recordDeletedProfile(target);
    } else {
      this.addDeletedId(profileId);
      try {
        const existing = this.getLocalStorageProfiles().find((p) => p && p.id === profileId);
        if (existing) {
          this.recordDeletedProfile(existing);
        } else {
          const db = await this.getDb();
          if (db) {
            const tx = db.transaction(STORE_PROFILES, 'readonly');
            const req = tx.objectStore(STORE_PROFILES).get(profileId);
            const foundProfile = await new Promise<UserProfile | null>((resolve) => {
              req.onsuccess = () => resolve(req.result || null);
              req.onerror = () => resolve(null);
            });
            if (foundProfile) {
              this.recordDeletedProfile(foundProfile);
            }
          }
        }
      } catch {}
    }

    // 2. Comprehensive localStorage & sessionStorage sweep (Snapshot-based to avoid index shift)
    try {
      const storage = this.getStorage();
      if (storage) {
        // Standard PWA mirror update
        const local = this.getLocalStorageProfiles().filter((p) => p && p.id !== profileId && !this.isDeleted(p));
        storage.setItem('aurora_cached_profiles', JSON.stringify({
          version: 1,
          timestamp: Date.now(),
          profiles: local
        }));

        // Snapshot all existing keys first
        const allKeys: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k) allKeys.push(k);
        }

        // Deep-clean every key referencing profileId or profile lists
        for (const key of allKeys) {
          if (key === 'aurora_cached_profiles' || key.startsWith('aurora_cached_profiles')) {
            try {
              const raw = storage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.profiles)) {
                  parsed.profiles = parsed.profiles.filter((p: any) => p && p.id !== profileId && !this.isDeleted(p));
                  storage.setItem(key, JSON.stringify(parsed));
                } else if (Array.isArray(parsed)) {
                  const filtered = parsed.filter((p: any) => p && p.id !== profileId && !this.isDeleted(p));
                  storage.setItem(key, JSON.stringify(filtered));
                }
              }
            } catch {}
          } else if (key.includes(profileId)) {
            storage.removeItem(key);
          }
        }
      }

      // Sweep sessionStorage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const sessKeys: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k) sessKeys.push(k);
        }
        for (const k of sessKeys) {
          if (k.includes(profileId)) sessionStorage.removeItem(k);
        }
      }
    } catch (e) {
      console.warn('[PwaStorage] LocalStorage profile removal error:', e);
    }

    // 3. Remove definitively from all IndexedDB stores
    const db = await this.getDb();
    if (db) {
      try {
        // Step 3a: First query all profiles to find any matching tombstones or signature
        const existingProfiles: UserProfile[] = await new Promise((res) => {
          try {
            const readTx = db.transaction(STORE_PROFILES, 'readonly');
            const req = readTx.objectStore(STORE_PROFILES).getAll();
            req.onsuccess = () => res(req.result || []);
            req.onerror = () => res([]);
          } catch {
            res([]);
          }
        });

        // Step 3b: In a write transaction, delete target profileId and any tombstoned ghosts
        const tx = db.transaction([STORE_PROFILES, STORE_CALCULATIONS, STORE_ENSEMBLES, STORE_SYNC_QUEUE], 'readwrite');
        const profileStore = tx.objectStore(STORE_PROFILES);
        const calcStore = tx.objectStore(STORE_CALCULATIONS);
        const ensembleStore = tx.objectStore(STORE_ENSEMBLES);
        const syncStore = tx.objectStore(STORE_SYNC_QUEUE);

        profileStore.delete(profileId);
        calcStore.delete(profileId);
        ensembleStore.delete(profileId);
        syncStore.delete(profileId);

        for (const p of existingProfiles) {
          if (p && (p.id === profileId || this.isDeleted(p))) {
            profileStore.delete(p.id);
            calcStore.delete(p.id);
            ensembleStore.delete(p.id);
            syncStore.delete(p.id);
          }
        }

        await new Promise<void>((res, rej) => {
          tx.oncomplete = () => res();
          tx.onerror = () => rej(tx.error);
        });
      } catch (e) {
        console.warn('[PwaStorage] IndexedDB deleteProfile error:', e);
      }
    }
  }

  /**
   * Toggle pinned status for quick access
   */
  public async togglePinProfile(profileId: string): Promise<UserProfile[]> {
    const profiles = await this.getProfiles();
    const updated = profiles.map((p) => {
      if (p.id === profileId) {
        return { ...p, isPinned: !p.isPinned, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    await this.saveAllProfiles(updated);
    return updated;
  }

  /**
   * Update profile tag / category
   */
  public async updateProfileTag(profileId: string, tag: string, notes?: string): Promise<UserProfile[]> {
    const profiles = await this.getProfiles();
    const updated = profiles.map((p) => {
      if (p.id === profileId) {
        return {
          ...p,
          tag,
          notes: notes !== undefined ? notes : p.notes,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    await this.saveAllProfiles(updated);
    return updated;
  }

  // ==========================================
  // CALCULATION & ENSEMBLE CACHING
  // ==========================================

  public async saveCalculation(profileId: string, calculation: CalculationResult): Promise<void> {
    if (!profileId || !calculation) return;

    // Cache to localStorage
    try {
      sessionStorage.setItem(`aurora_calc_${profileId}`, JSON.stringify(calculation));
    } catch {}

    const db = await this.getDb();
    if (db) {
      try {
        const tx = db.transaction(STORE_CALCULATIONS, 'readwrite');
        tx.objectStore(STORE_CALCULATIONS).put({
          profileId,
          calculation,
          savedAt: Date.now()
        });
      } catch (e) {
        console.warn('[PwaStorage] IndexedDB saveCalculation error:', e);
      }
    }
  }

  public async getCalculation(profileId: string): Promise<CalculationResult | null> {
    // Check sessionStorage fast cache first
    try {
      const fast = sessionStorage.getItem(`aurora_calc_${profileId}`);
      if (fast) return JSON.parse(fast);
    } catch {}

    const db = await this.getDb();
    if (db) {
      try {
        const tx = db.transaction(STORE_CALCULATIONS, 'readonly');
        const req = tx.objectStore(STORE_CALCULATIONS).get(profileId);
        const res = await new Promise<any>((resolve) => {
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (res?.calculation) return res.calculation;
      } catch {}
    }
    return null;
  }

  // ==========================================
  // BACKUP & RESTORE
  // ==========================================

  /**
   * Exports all profiles and calculations into an encrypted/formatted JSON file
   */
  public async exportBackup(): Promise<string> {
    const profiles = await this.getProfiles();
    const calculations: Record<string, CalculationResult> = {};

    const db = await this.getDb();
    if (db) {
      try {
        const tx = db.transaction(STORE_CALCULATIONS, 'readonly');
        const store = tx.objectStore(STORE_CALCULATIONS);
        const req = store.getAll();
        const records = await new Promise<any[]>((res) => {
          req.onsuccess = () => res(req.result || []);
          req.onerror = () => res([]);
        });
        for (const item of records) {
          if (item?.profileId && item?.calculation) {
            calculations[item.profileId] = item.calculation;
          }
        }
      } catch {}
    }

    const payload: PwaBackupPayload = {
      version: 1,
      app: 'Aurora Destiny AI',
      exportedAt: new Date().toISOString(),
      source: 'aurora-destiny-ai-pwa',
      profiles,
      calculations
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Imports backup data from JSON string and safely merges without overwriting
   */
  public async importBackup(jsonString: string): Promise<{ importedCount: number; profiles: UserProfile[] }> {
    try {
      const data: PwaBackupPayload = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.profiles)) {
        throw new Error('Định dạng tệp sao lưu không hợp lệ.');
      }

      const existingProfiles = await this.getProfiles();
      const existingIdMap = new Map(existingProfiles.map((p) => [p.id, p]));

      let addedCount = 0;
      const mergedList = [...existingProfiles];

      for (const imported of data.profiles) {
        if (!imported.name || !imported.birthData) continue;

        if (existingIdMap.has(imported.id)) {
          // If already exists, update if imported is newer
          const idx = mergedList.findIndex((p) => p.id === imported.id);
          if (idx >= 0) {
            mergedList[idx] = { ...mergedList[idx], ...imported };
          }
        } else {
          // New profile
          mergedList.push(imported);
          addedCount++;
        }

        // Import calculation if available
        if (data.calculations && data.calculations[imported.id]) {
          await this.saveCalculation(imported.id, data.calculations[imported.id]);
        }
      }

      await this.saveAllProfiles(mergedList);
      return { importedCount: addedCount, profiles: this.sortProfiles(mergedList) };
    } catch (err: any) {
      throw new Error(err.message || 'Không thể nhập tệp sao lưu.');
    }
  }

  // ==========================================
  // STORAGE STATS & HEALTH
  // ==========================================

  public async getStorageStats(): Promise<PwaStorageStats> {
    const profiles = await this.getProfiles();
    let calculationCount = 0;
    let pendingSyncCount = 0;

    const db = await this.getDb();
    if (db) {
      try {
        const tx = db.transaction([STORE_CALCULATIONS, STORE_SYNC_QUEUE], 'readonly');
        const calcCountReq = tx.objectStore(STORE_CALCULATIONS).count();
        const syncCountReq = tx.objectStore(STORE_SYNC_QUEUE).count();
        calculationCount = await new Promise<number>((r) => {
          calcCountReq.onsuccess = () => r(calcCountReq.result);
          calcCountReq.onerror = () => r(0);
        });
        pendingSyncCount = await new Promise<number>((r) => {
          syncCountReq.onsuccess = () => r(syncCountReq.result);
          syncCountReq.onerror = () => r(0);
        });
      } catch {}
    }

    const estimatedBytes = JSON.stringify(profiles).length * 2 + calculationCount * 15000;

    return {
      storageType: this.isIndexedDbAvailable ? 'indexeddb' : 'localstorage',
      profileCount: profiles.length,
      calculationCount,
      pendingSyncCount,
      estimatedBytes,
      isOfflineReady: true
    };
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  private getStorage(): Storage | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) return (globalThis as any).localStorage;
    } catch {}
    return null;
  }

  private getLocalStorageProfiles(): UserProfile[] {
    try {
      const storage = this.getStorage();
      if (!storage) return [];
      const profileMap = new Map<string, UserProfile>();

      const keysToScan: string[] = ['aurora_cached_profiles', 'aurora_cached_profiles_guest'];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.startsWith('aurora_cached_profiles') && !keysToScan.includes(k)) {
          keysToScan.push(k);
        }
      }

      for (const k of keysToScan) {
        const raw = storage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const list: UserProfile[] = Array.isArray(parsed?.profiles)
              ? parsed.profiles
              : (Array.isArray(parsed) ? parsed : []);
            for (const p of list) {
              if (p && p.id && !this.isDeleted(p)) {
                profileMap.set(p.id, p);
              }
            }
          } catch {}
        }
      }
      return Array.from(profileMap.values());
    } catch {}
    return [];
  }

  private sortProfiles(profiles: UserProfile[]): UserProfile[] {
    return [...profiles].sort((a, b) => {
      // 1. Pinned profiles first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // 2. Primary profile next
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      // 3. Most recently updated
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }
}

export const pwaProfileStorage = new PwaProfileStorageService();

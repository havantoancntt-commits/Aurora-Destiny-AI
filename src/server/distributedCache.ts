// ==========================================
// AURORA DESTINY AI — DISTRIBUTED CACHING ENGINE
// Production-grade Distributed Cache (Redis backend + LRU/TTL Memory Fallback)
// Automatically reports hits/misses to TelemetryService
// ==========================================

import Redis from 'ioredis';
import { telemetry } from '../telemetry/telemetryService';

export interface IDistributedCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryCacheStore implements IDistributedCache {
  private store = new Map<string, { value: any; expiresAt: number }>();
  private cleanupInterval: NodeJS.Timeout;
  private readonly maxItems: number;

  constructor(maxItems: number = 1000) {
    this.maxItems = maxItems;
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.store.entries()) {
        if (now > item.expiresAt) {
          this.store.delete(key);
        }
      }
    }, 60 * 1000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) {
      telemetry.recordCacheMiss();
      return null;
    }
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      telemetry.recordCacheMiss();
      return null;
    }
    telemetry.recordCacheHit();
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    // Evict oldest if capacity reached
    if (this.store.size >= this.maxItems) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export class RedisCacheStore implements IDistributedCache {
  private client: Redis;
  private localFallback: MemoryCacheStore;
  private isConnected: boolean = false;
  private prefix: string = 'aurora_cache:';

  constructor(redisUrlOrClient: string | Redis) {
    this.localFallback = new MemoryCacheStore(1000);
    if (typeof redisUrlOrClient === 'string') {
      this.client = new Redis(redisUrlOrClient, {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        retryStrategy: () => null
      });
      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ [DistributedCache] Connected to Redis caching backend.');
      });
      this.client.on('error', (err) => {
        this.isConnected = false;
        console.warn('⚠️ [DistributedCache] Redis connection warning, using in-memory fallback:', err.message);
      });
      this.client.connect().catch((err) => {
        console.warn('⚠️ [DistributedCache] Redis initial connection failed:', err.message);
      });
    } else {
      this.client = redisUrlOrClient;
      this.isConnected = true;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      return this.localFallback.get<T>(key);
    }

    try {
      const raw = await this.client.get(this.prefix + key);
      if (!raw) {
        telemetry.recordCacheMiss();
        return null;
      }
      telemetry.recordCacheHit();
      return JSON.parse(raw) as T;
    } catch (err: any) {
      console.warn('⚠️ [DistributedCache] Redis GET failed, checking fallback:', err.message);
      return this.localFallback.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    // Keep local cache updated
    await this.localFallback.set(key, value, ttlSeconds);

    if (!this.isConnected) return;

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.client.set(this.prefix + key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(this.prefix + key, serialized);
      }
    } catch (err: any) {
      console.warn('⚠️ [DistributedCache] Redis SET failed:', err.message);
    }
  }

  async delete(key: string): Promise<void> {
    await this.localFallback.delete(key);
    if (!this.isConnected) return;
    try {
      await this.client.del(this.prefix + key);
    } catch {
      // ignore error
    }
  }

  async clear(): Promise<void> {
    await this.localFallback.clear();
    if (!this.isConnected) return;
    try {
      const keys = await this.client.keys(this.prefix + '*');
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch {
      // ignore error
    }
  }
}

// Global active cache instance
let activeCache: IDistributedCache;

export function initCache(): IDistributedCache {
  if (!activeCache) {
    const rawRedis = process.env.REDIS_URL;
    const isRedisUrl = typeof rawRedis === 'string' &&
      (rawRedis.startsWith('redis://') || rawRedis.startsWith('rediss://')) &&
      !rawRedis.toLowerCase().includes('none');

    if (isRedisUrl) {
      activeCache = new RedisCacheStore(rawRedis);
    } else {
      if (process.env.NODE_ENV === 'production' && process.env.REDIS_REQUIRED_IN_PRODUCTION === 'true') {
        throw new Error('FATAL: REDIS_URL is strictly required in production when REDIS_REQUIRED_IN_PRODUCTION=true.');
      }
      activeCache = new MemoryCacheStore();
    }
  }
  return activeCache;
}

export function getCache(): IDistributedCache {
  if (!activeCache) {
    return initCache();
  }
  return activeCache;
}

export function setCache(cache: IDistributedCache): void {
  activeCache = cache;
}

/**
 * Redis Cache Service
 * Handles multi-layer caching with TTL
 */

import { createClient, RedisClientType } from 'redis';

export type CacheType = 'translations' | 'books' | 'passage' | 'audio' | 'search' | 'daily_verse';

const CACHE_TTL: Record<CacheType, number> = {
  translations: 24 * 60 * 60, // 24 hours
  books: 7 * 24 * 60 * 60, // 7 days
  passage: 7 * 24 * 60 * 60, // 7 days
  audio: 24 * 60 * 60, // 24 hours
  search: 60 * 60, // 1 hour
  daily_verse: 24 * 60 * 60 // 24 hours
};

export class CacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => {
      console.error('[CacheService] Redis error:', err);
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.isConnected = true;
      console.log('[CacheService] Connected to Redis');
    } catch (error) {
      console.warn('[CacheService] Redis connection failed, using fallback:', error);
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async get<T>(key: string, type: CacheType): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const cached = await this.client.get(key);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`[CacheService] Get error for ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, type: CacheType): Promise<void> {
    if (!this.isConnected) return;

    try {
      const ttl = CACHE_TTL[type];
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`[CacheService] Set error for ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`[CacheService] Del error for ${key}:`, error);
    }
  }

  async clearPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error(`[CacheService] Clear pattern error for ${pattern}:`, error);
    }
  }

  // Convenience methods for common cache keys
  getCacheKey(resource: string, params: Record<string, string>): string {
    const paramStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    return `bible:${resource}:${paramStr}`;
  }
}

export const cacheService = new CacheService();
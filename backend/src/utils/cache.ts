/**
 * Redis Caching Utility
 *
 * Provides Redis caching functionality for operating status data.
 * Implements graceful degradation - if Redis fails, falls back to direct DB queries.
 *
 * @module utils/cache
 */

import Redis from 'ioredis';
import type { OperatingStatusResponse } from '../services/operatingStatus.service';

// Redis client instance
let redisClient: Redis | null = null;

// Cache configuration
const CACHE_CONFIG = {
  TTL: parseInt(process.env.REDIS_TTL || '300', 10), // 5 minutes default
  KEY_PREFIX: 'operating-status:',
  CONNECT_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

/**
 * Initialize Redis client with retry logic
 *
 * @returns Promise<Redis | null> - Redis client or null if connection fails
 */
export async function connectRedis(): Promise<Redis | null> {
  // Already connected
  if (redisClient && redisClient.status === 'ready') {
    return redisClient;
  }

  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = new Redis(redisUrl, {
      connectTimeout: CACHE_CONFIG.CONNECT_TIMEOUT,
      maxRetriesPerRequest: CACHE_CONFIG.RETRY_ATTEMPTS,
      retryStrategy: (times) => {
        if (times > CACHE_CONFIG.RETRY_ATTEMPTS) {
          console.error('[Redis] Max retry attempts reached. Giving up.');
          return null;
        }
        const delay = Math.min(times * CACHE_CONFIG.RETRY_DELAY, 5000);
        console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms...`);
        return delay;
      },
      enableReadyCheck: true,
      lazyConnect: false
    });

    // Error event handler
    redisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });

    // Ready event handler
    redisClient.on('ready', () => {
      console.log('[Redis] Connected successfully');
    });

    // Reconnecting event handler
    redisClient.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
    });

    // Wait for connection
    await redisClient.ping();

    return redisClient;
  } catch (error) {
    console.error('[Redis] Failed to connect:', error);
    redisClient = null;
    return null;
  }
}

/**
 * Gracefully disconnect Redis client
 *
 * @returns Promise<void>
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('[Redis] Disconnected successfully');
    } catch (error) {
      console.error('[Redis] Error during disconnect:', error);
      // Force close on error
      redisClient.disconnect();
    } finally {
      redisClient = null;
    }
  }
}

/**
 * Generate cache key for operating status
 *
 * @param centerId - Center ID
 * @param date - Date string (optional, for future date queries)
 * @returns Cache key string
 */
function getCacheKey(centerId: number, date?: string): string {
  const dateKey = date ? `:${date}` : '';
  return `${CACHE_CONFIG.KEY_PREFIX}${centerId}${dateKey}`;
}

/**
 * Cache operating status data
 *
 * @param centerId - Center ID
 * @param data - Operating status data to cache
 * @param ttl - Time to live in seconds (optional, defaults to CACHE_CONFIG.TTL)
 * @param date - Date string for cache key (optional)
 * @returns Promise<boolean> - True if cached successfully, false otherwise
 */
export async function cacheOperatingStatus(
  centerId: number,
  data: OperatingStatusResponse,
  ttl: number = CACHE_CONFIG.TTL,
  date?: string
): Promise<boolean> {
  try {
    // Ensure Redis is connected
    const client = await connectRedis();

    if (!client) {
      console.warn('[Cache] Redis not available, skipping cache write');
      return false;
    }

    const key = getCacheKey(centerId, date);
    const serialized = JSON.stringify(data);

    await client.setex(key, ttl, serialized);

    console.log(`[Cache] Cached operating status for center ${centerId} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error('[Cache] Failed to cache data:', error);
    return false;
  }
}

/**
 * Retrieve cached operating status data
 *
 * @param centerId - Center ID
 * @param date - Date string for cache key (optional)
 * @returns Promise<OperatingStatusResponse | null> - Cached data or null if not found/error
 */
export async function getCachedOperatingStatus(
  centerId: number,
  date?: string
): Promise<OperatingStatusResponse | null> {
  try {
    // Ensure Redis is connected
    const client = await connectRedis();

    if (!client) {
      console.warn('[Cache] Redis not available, skipping cache read');
      return null;
    }

    const key = getCacheKey(centerId, date);
    const cached = await client.get(key);

    if (!cached) {
      console.log(`[Cache] Cache miss for center ${centerId}`);
      return null;
    }

    console.log(`[Cache] Cache hit for center ${centerId}`);
    return JSON.parse(cached) as OperatingStatusResponse;
  } catch (error) {
    console.error('[Cache] Failed to retrieve cached data:', error);
    return null;
  }
}

/**
 * Invalidate cached operating status
 *
 * Used when center operating hours or holidays are updated manually.
 *
 * @param centerId - Center ID
 * @param date - Date string for cache key (optional)
 * @returns Promise<boolean> - True if invalidated successfully, false otherwise
 */
export async function invalidateOperatingStatusCache(
  centerId: number,
  date?: string
): Promise<boolean> {
  try {
    // Ensure Redis is connected
    const client = await connectRedis();

    if (!client) {
      console.warn('[Cache] Redis not available, skipping cache invalidation');
      return false;
    }

    const key = getCacheKey(centerId, date);
    const deleted = await client.del(key);

    if (deleted > 0) {
      console.log(`[Cache] Invalidated cache for center ${centerId}`);
      return true;
    }

    console.log(`[Cache] No cache to invalidate for center ${centerId}`);
    return false;
  } catch (error) {
    console.error('[Cache] Failed to invalidate cache:', error);
    return false;
  }
}

/**
 * Clear all operating status caches
 *
 * Used for maintenance or bulk updates.
 *
 * @returns Promise<number> - Number of keys deleted
 */
export async function clearAllOperatingStatusCaches(): Promise<number> {
  try {
    // Ensure Redis is connected
    const client = await connectRedis();

    if (!client) {
      console.warn('[Cache] Redis not available, skipping cache clear');
      return 0;
    }

    const pattern = `${CACHE_CONFIG.KEY_PREFIX}*`;
    const keys = await client.keys(pattern);

    if (keys.length === 0) {
      console.log('[Cache] No caches to clear');
      return 0;
    }

    const deleted = await client.del(...keys);
    console.log(`[Cache] Cleared ${deleted} operating status caches`);
    return deleted;
  } catch (error) {
    console.error('[Cache] Failed to clear caches:', error);
    return 0;
  }
}

/**
 * Get Redis client health status
 *
 * @returns Object with connection status and latency
 */
export async function getRedisHealth(): Promise<{
  connected: boolean;
  latency: number | null;
}> {
  try {
    const client = await connectRedis();

    if (!client) {
      return { connected: false, latency: null };
    }

    const start = Date.now();
    await client.ping();
    const latency = Date.now() - start;

    return { connected: true, latency };
  } catch (error) {
    return { connected: false, latency: null };
  }
}

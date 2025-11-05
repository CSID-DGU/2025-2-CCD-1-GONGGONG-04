/**
 * Redis Caching Utility
 *
 * Provides Redis caching functionality for operating status and recommendation data.
 * Implements graceful degradation - if Redis fails, falls back to direct DB queries.
 *
 * Sprint 2 - Task 4.2.1-4.2.2: Redis 캐싱 구현
 *
 * @module utils/cache
 */

import Redis from 'ioredis';
import * as crypto from 'crypto';
import type { OperatingStatusResponse } from '../services/operatingStatus.service';
import type { RecommendationResult } from '../services/recommendationService';
import logger from './logger';

// Redis client instance
let redisClient: Redis | null = null;

// Cache configuration
const CACHE_CONFIG = {
  TTL: parseInt(process.env.REDIS_TTL || '300', 10), // 5 minutes default
  OPERATING_STATUS_PREFIX: 'operating-status:',
  RECOMMENDATION_PREFIX: 'recommendation:',
  CENTER_DATA_PREFIX: 'center:',
  CONNECT_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  RECOMMENDATION_TTL: 300, // 5 minutes for recommendations
  CENTER_DATA_TTL: 86400, // 24 hours for center data
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
      retryStrategy: times => {
        if (times > CACHE_CONFIG.RETRY_ATTEMPTS) {
          logger.error('[Redis] Max retry attempts reached. Giving up.');
          return null;
        }
        const delay = Math.min(times * CACHE_CONFIG.RETRY_DELAY, 5000);
        logger.info(`[Redis] Retry attempt ${times}, waiting ${delay}ms...`);
        return delay;
      },
      enableReadyCheck: true,
      lazyConnect: false,
    });

    // Error event handler
    redisClient.on('error', err => {
      logger.error('[Redis] Connection error:', err.message);
    });

    // Ready event handler
    redisClient.on('ready', () => {
      logger.info('[Redis] Connected successfully');
    });

    // Reconnecting event handler
    redisClient.on('reconnecting', () => {
      logger.info('[Redis] Reconnecting...');
    });

    // Wait for connection
    await redisClient.ping();

    return redisClient;
  } catch (error) {
    logger.error('[Redis] Failed to connect:', error);
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
      logger.info('[Redis] Disconnected successfully');
    } catch (error) {
      logger.error('[Redis] Error during disconnect:', error);
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
  return `${CACHE_CONFIG.OPERATING_STATUS_PREFIX}${centerId}${dateKey}`;
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
  date?: string,
): Promise<boolean> {
  try {
    // Ensure Redis is connected
    const client = await connectRedis();

    if (!client) {
      logger.warn('[Cache] Redis not available, skipping cache write');
      return false;
    }

    const key = getCacheKey(centerId, date);
    const serialized = JSON.stringify(data);

    await client.setex(key, ttl, serialized);

    logger.info(`[Cache] Cached operating status for center ${centerId} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    logger.error('[Cache] Failed to cache data:', error);
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
  date?: string,
): Promise<OperatingStatusResponse | null> {
  try {
    // Ensure Redis is connected
    const client = await connectRedis();

    if (!client) {
      logger.warn('[Cache] Redis not available, skipping cache read');
      return null;
    }

    const key = getCacheKey(centerId, date);
    const cached = await client.get(key);

    if (!cached) {
      logger.info(`[Cache] Cache miss for center ${centerId}`);
      return null;
    }

    logger.info(`[Cache] Cache hit for center ${centerId}`);
    return JSON.parse(cached) as OperatingStatusResponse;
  } catch (error) {
    logger.error('[Cache] Failed to retrieve cached data:', error);
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
  date?: string,
): Promise<boolean> {
  try {
    // Ensure Redis is connected
    const client = await connectRedis();

    if (!client) {
      logger.warn('[Cache] Redis not available, skipping cache invalidation');
      return false;
    }

    const key = getCacheKey(centerId, date);
    const deleted = await client.del(key);

    if (deleted > 0) {
      logger.info(`[Cache] Invalidated cache for center ${centerId}`);
      return true;
    }

    logger.info(`[Cache] No cache to invalidate for center ${centerId}`);
    return false;
  } catch (error) {
    logger.error('[Cache] Failed to invalidate cache:', error);
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
      logger.warn('[Cache] Redis not available, skipping cache clear');
      return 0;
    }

    const pattern = `${CACHE_CONFIG.OPERATING_STATUS_PREFIX}*`;
    const keys = await client.keys(pattern);

    if (keys.length === 0) {
      logger.info('[Cache] No caches to clear');
      return 0;
    }

    const deleted = await client.del(...keys);
    logger.info(`[Cache] Cleared ${deleted} operating status caches`);
    return deleted;
  } catch (error) {
    logger.error('[Cache] Failed to clear caches:', error);
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
  } catch {
    return { connected: false, latency: null };
  }
}

// ============================================================================
// RECOMMENDATION CACHING FUNCTIONS (Sprint 2 - Task 4.2.2)
// ============================================================================

/**
 * Generate normalized hash for recommendation parameters
 *
 * Creates a deterministic hash for caching recommendation results.
 * Normalizes parameters to ensure cache hits regardless of parameter order.
 *
 * @param latitude - User latitude
 * @param longitude - User longitude
 * @param userProfile - User profile (optional)
 * @param maxDistance - Maximum search distance
 * @param limit - Maximum number of recommendations
 * @returns MD5 hash string
 */
export function generateRecommendationCacheKey(
  latitude: number,
  longitude: number,
  userProfile?: unknown,
  maxDistance: number = 10,
  limit: number = 5,
): string {
  // Normalize parameters
  const normalized = {
    lat: latitude.toFixed(4), // 4 decimal places (~11m precision)
    lng: longitude.toFixed(4),
    profile: userProfile ? JSON.stringify(sortObjectKeys(userProfile)) : null,
    dist: maxDistance,
    limit,
  };

  // Generate hash
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify(normalized))
    .digest('hex')
    .substring(0, 16); // Use first 16 characters

  return `${CACHE_CONFIG.RECOMMENDATION_PREFIX}${hash}`;
}

/**
 * Sort object keys recursively for deterministic serialization
 *
 * @param obj - Object to sort
 * @returns Sorted object
 */
function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys).sort();
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((sorted: Record<string, unknown>, key) => {
        sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
        return sorted;
      }, {});
  }
  return obj;
}

/**
 * Cache recommendation results
 *
 * @param latitude - User latitude
 * @param longitude - User longitude
 * @param recommendations - Recommendation results to cache
 * @param userProfile - User profile (optional)
 * @param maxDistance - Maximum search distance
 * @param limit - Maximum number of recommendations
 * @param ttl - Time to live in seconds (default: 5 minutes)
 * @returns Promise<boolean> - True if cached successfully
 */
export async function cacheRecommendations(
  latitude: number,
  longitude: number,
  recommendations: RecommendationResult[],
  userProfile?: unknown,
  maxDistance: number = 10,
  limit: number = 5,
  ttl: number = CACHE_CONFIG.RECOMMENDATION_TTL,
): Promise<boolean> {
  try {
    const client = await connectRedis();

    if (!client) {
      logger.warn('[Cache] Redis not available, skipping recommendation cache write');
      return false;
    }

    const key = generateRecommendationCacheKey(latitude, longitude, userProfile, maxDistance, limit);
    const serialized = JSON.stringify({
      recommendations,
      cachedAt: new Date().toISOString(),
      ttl,
    });

    await client.setex(key, ttl, serialized);

    logger.info(`[Cache] Cached recommendations (lat: ${latitude.toFixed(4)}, lng: ${longitude.toFixed(4)}, TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    logger.error('[Cache] Failed to cache recommendations:', error);
    return false;
  }
}

/**
 * Retrieve cached recommendation results
 *
 * @param latitude - User latitude
 * @param longitude - User longitude
 * @param userProfile - User profile (optional)
 * @param maxDistance - Maximum search distance
 * @param limit - Maximum number of recommendations
 * @returns Promise<RecommendationResult[] | null> - Cached recommendations or null
 */
export async function getCachedRecommendations(
  latitude: number,
  longitude: number,
  userProfile?: unknown,
  maxDistance: number = 10,
  limit: number = 5,
): Promise<RecommendationResult[] | null> {
  try {
    const client = await connectRedis();

    if (!client) {
      logger.warn('[Cache] Redis not available, skipping recommendation cache read');
      return null;
    }

    const key = generateRecommendationCacheKey(latitude, longitude, userProfile, maxDistance, limit);
    const cached = await client.get(key);

    if (!cached) {
      logger.info(`[Cache] Recommendation cache miss (lat: ${latitude.toFixed(4)}, lng: ${longitude.toFixed(4)})`);
      return null;
    }

    const parsed = JSON.parse(cached);
    logger.info(`[Cache] Recommendation cache hit (cached at: ${parsed.cachedAt})`);
    return parsed.recommendations as RecommendationResult[];
  } catch (error) {
    logger.error('[Cache] Failed to retrieve cached recommendations:', error);
    return null;
  }
}

/**
 * Invalidate recommendation cache by pattern
 *
 * Used when center data is updated and recommendations need to be recalculated.
 *
 * @param _centerId - Center ID (optional, if provided only invalidates caches containing this center)
 * @returns Promise<number> - Number of keys deleted
 */
export async function invalidateRecommendationCache(_centerId?: bigint): Promise<number> {
  try {
    const client = await connectRedis();

    if (!client) {
      logger.warn('[Cache] Redis not available, skipping recommendation cache invalidation');
      return 0;
    }

    const pattern = `${CACHE_CONFIG.RECOMMENDATION_PREFIX}*`;
    const keys = await client.keys(pattern);

    if (keys.length === 0) {
      logger.info('[Cache] No recommendation caches to invalidate');
      return 0;
    }

    // If centerId is provided, filter keys (requires checking cache content)
    // For now, we invalidate all recommendation caches for simplicity
    const deleted = await client.del(...keys);
    logger.info(`[Cache] Invalidated ${deleted} recommendation caches`);
    return deleted;
  } catch (error) {
    logger.error('[Cache] Failed to invalidate recommendation cache:', error);
    return 0;
  }
}

/**
 * Cache center data
 *
 * Caches full center data including staff, programs, operating hours.
 *
 * @param centerId - Center ID
 * @param centerData - Full center data object
 * @param ttl - Time to live in seconds (default: 24 hours)
 * @returns Promise<boolean> - True if cached successfully
 */
export async function cacheCenterData(
  centerId: bigint,
  centerData: unknown,
  ttl: number = CACHE_CONFIG.CENTER_DATA_TTL,
): Promise<boolean> {
  try {
    const client = await connectRedis();

    if (!client) {
      logger.warn('[Cache] Redis not available, skipping center data cache write');
      return false;
    }

    const key = `${CACHE_CONFIG.CENTER_DATA_PREFIX}${centerId.toString()}`;
    const serialized = JSON.stringify({
      data: centerData,
      cachedAt: new Date().toISOString(),
    });

    await client.setex(key, ttl, serialized);

    logger.info(`[Cache] Cached center data for center ${centerId} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    logger.error('[Cache] Failed to cache center data:', error);
    return false;
  }
}

/**
 * Retrieve cached center data
 *
 * @param centerId - Center ID
 * @returns Promise<unknown | null> - Cached center data or null
 */
export async function getCachedCenterData(centerId: bigint): Promise<unknown | null> {
  try {
    const client = await connectRedis();

    if (!client) {
      logger.warn('[Cache] Redis not available, skipping center data cache read');
      return null;
    }

    const key = `${CACHE_CONFIG.CENTER_DATA_PREFIX}${centerId.toString()}`;
    const cached = await client.get(key);

    if (!cached) {
      logger.info(`[Cache] Center data cache miss for center ${centerId}`);
      return null;
    }

    const parsed = JSON.parse(cached);
    logger.info(`[Cache] Center data cache hit for center ${centerId} (cached at: ${parsed.cachedAt})`);
    return parsed.data;
  } catch (error) {
    logger.error('[Cache] Failed to retrieve cached center data:', error);
    return null;
  }
}

/**
 * Invalidate center data cache
 *
 * @param centerId - Center ID
 * @returns Promise<boolean> - True if invalidated successfully
 */
export async function invalidateCenterDataCache(centerId: bigint): Promise<boolean> {
  try {
    const client = await connectRedis();

    if (!client) {
      logger.warn('[Cache] Redis not available, skipping center data cache invalidation');
      return false;
    }

    const key = `${CACHE_CONFIG.CENTER_DATA_PREFIX}${centerId.toString()}`;
    const deleted = await client.del(key);

    if (deleted > 0) {
      logger.info(`[Cache] Invalidated center data cache for center ${centerId}`);
      // Also invalidate related recommendation caches
      await invalidateRecommendationCache(centerId);
      return true;
    }

    logger.info(`[Cache] No center data cache to invalidate for center ${centerId}`);
    return false;
  } catch (error) {
    logger.error('[Cache] Failed to invalidate center data cache:', error);
    return false;
  }
}

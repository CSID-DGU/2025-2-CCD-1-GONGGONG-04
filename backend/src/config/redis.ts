/**
 * Redis Client Configuration
 *
 * Sprint 1: 지도 기반 센터 검색
 * Task: Redis caching setup for center search API
 *
 * Features:
 * - Redis connection with automatic reconnection
 * - Connection pooling and timeout handling
 * - Error handling and logging
 * - Cache TTL management
 */

import Redis from 'ioredis';
import config from './index';

let redisClient: Redis | null = null;

/**
 * Get Redis client instance (singleton pattern)
 *
 * @returns {Redis} Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Reconnect when encountering READONLY error
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    redisClient.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err);
    });

    redisClient.on('ready', () => {
      console.log('[Redis] Client ready');
    });

    redisClient.on('close', () => {
      console.log('[Redis] Connection closed');
    });
  }

  return redisClient;
}

/**
 * Close Redis connection (for graceful shutdown)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('[Redis] Connection closed gracefully');
  }
}

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  CENTER_SEARCH: 300, // 5 minutes for center search results
  OPERATING_STATUS: 300, // 5 minutes for operating status
  CENTER_DETAIL: 600, // 10 minutes for center detail
  RECOMMENDATIONS: 300, // 5 minutes for recommendations
} as const;

/**
 * Cache key generators
 */
export const CACHE_KEYS = {
  centerSearch: (lat: number, lng: number, radius: number) =>
    `centers:lat:${lat}:lng:${lng}:radius:${radius}`,
  operatingStatus: (centerId: number, date: string) => `operating_status:${centerId}:${date}`,
  centerDetail: (centerId: number) => `center:${centerId}`,
  recommendations: (userId: number | null, sessionId: string | null, params: string) =>
    userId
      ? `recommendations:user:${userId}:${params}`
      : `recommendations:session:${sessionId}:${params}`,
} as const;

export default getRedisClient;

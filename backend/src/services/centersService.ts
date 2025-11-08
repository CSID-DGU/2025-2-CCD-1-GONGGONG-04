/**
 * Centers Service
 *
 * Sprint 1: 지도 기반 센터 검색
 * Day 1: Backend API Implementation
 *
 * Features:
 * - Get centers within radius using SPATIAL INDEX
 * - Redis caching with 5-minute TTL
 * - Distance calculation using Haversine formula
 * - Walk time calculation (80m per minute)
 * - Operating status integration
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { getRedisClient, CACHE_KEYS, CACHE_TTL } from '../config/redis';
import { calculateDistance } from './distance.service';
import {
  calculateOperatingStatus,
  OperatingStatus,
} from './operatingStatus.service';
import { CacheError, DatabaseError, InvalidCoordinatesError, InvalidRadiusError } from '../utils/errors';
import logger from '../utils/logger';
import { getRadiusInMeters, getRadiusDisplay } from '../utils/radius';
import { calculateWalkTime as calculateWalkTimeUtil } from '../utils/distance';

const prisma = new PrismaClient();
const redis = getRedisClient();

/**
 * Operating status type
 */
type OperatingStatusType = 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'HOLIDAY' | 'TEMP_CLOSED' | 'NO_INFO';

/**
 * Center search data interface
 */
export interface CenterSearchData {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance: number;
  walkTime: string;
  operatingStatus: OperatingStatusType;
  closingTime?: string;
  nextOpenDate?: string;
  avgRating: number;
  reviewCount: number;
  centerType: string;
  roadAddress: string;
  phoneNumber?: string;
}

/**
 * Center search response interface
 */
export interface CenterSearchResponse {
  centers: CenterSearchData[];
  total: number;
  radius?: string;
  userLocation?: {
    lat: number;
    lng: number;
  };
  hasMore?: boolean;
  nextOffset?: number | null;
}

/**
 * Raw center data from database
 */
interface RawCenterData {
  id: bigint;
  center_name: string;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
  center_type: string;
  road_address: string;
  phone_number: string | null;
  avg_rating: Prisma.Decimal;
  review_count: number;
}


/**
 * Get centers within radius
 *
 * Business Logic:
 * 1. Check Redis cache first
 * 2. If cache miss, query database using SPATIAL INDEX
 * 3. Calculate distance and walk time for each center
 * 4. Get operating status for each center
 * 5. Save to Redis cache with 5-minute TTL
 * 6. Return processed data
 *
 * @param lat - User latitude
 * @param lng - User longitude
 * @param radius - Search radius string ('10', '30', '50', '100', 'all')
 * @param offset - Pagination offset (default: 0)
 * @param limit - Results per page (default: 50)
 * @returns Promise<CenterSearchResponse> - Centers within radius
 */
export async function getCentersWithinRadius(
  lat: number,
  lng: number,
  radius: string = '50',
  offset: number = 0,
  limit: number = 50,
): Promise<CenterSearchResponse> {
  const startTime = Date.now();

  // Validate input parameters
  if (!lat || !lng) {
    throw new InvalidCoordinatesError('위도와 경도는 필수입니다', { lat, lng });
  }

  if (lat < -90 || lat > 90) {
    throw new InvalidCoordinatesError('위도는 -90에서 90 사이여야 합니다', { lat });
  }

  if (lng < -180 || lng > 180) {
    throw new InvalidCoordinatesError('경도는 -180에서 180 사이여야 합니다', { lng });
  }

  const validRadius = ['10', '30', '50', '100', 'all'];
  if (!validRadius.includes(radius)) {
    throw new InvalidRadiusError('반경은 10, 30, 50, 100, all 중 하나여야 합니다', { radius });
  }

  // 1. Check Redis cache
  const cacheKey = CACHE_KEYS.centerSearch(lat, lng, radius);
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const duration = Date.now() - startTime;
      logger.info(`[Center Search] Cache HIT - ${duration}ms`);
      return JSON.parse(cached);
    }
  } catch (err) {
    // Log cache error but continue with database query (graceful degradation)
    const cacheError = new CacheError('Redis 캐시 조회 실패', 'get');
    logger.error('[Center Search] Redis get error:', {
      error: cacheError,
      originalError: err,
    });
    // Continue with database query if cache fails
  }

  logger.info('[Center Search] Cache MISS - querying database');

  // 2. Query database using SPATIAL INDEX
  // Convert radius from km to meters using utility
  const radiusMeters = getRadiusInMeters(radius);

  let centers: RawCenterData[];
  try {
    centers = await prisma.$queryRaw<RawCenterData[]>`
      SELECT
        id,
        center_name,
        latitude,
        longitude,
        center_type,
        road_address,
        phone_number,
        avg_rating,
        review_count
      FROM centers
      WHERE
        is_active = 1
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND ST_Distance_Sphere(
          POINT(longitude, latitude),
          POINT(${lng}, ${lat})
        ) <= ${radiusMeters}
      ORDER BY ST_Distance_Sphere(
        POINT(longitude, latitude),
        POINT(${lng}, ${lat})
      ) ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
  } catch (err) {
    logger.error('[Center Search] Database query failed:', err);
    throw new DatabaseError(
      '센터 검색 중 데이터베이스 오류가 발생했습니다',
      'QUERY_FAILED',
    );
  }

  // 3. Process each center
  const processedCenters: CenterSearchData[] = [];

  for (const center of centers) {
    if (!center.latitude || !center.longitude) {
      continue;
    }

    // Calculate distance using Haversine formula
    const centerLat = parseFloat(center.latitude.toString());
    const centerLng = parseFloat(center.longitude.toString());
    const distanceKm = calculateDistance(lat, lng, centerLat, centerLng);
    const distanceMeters = distanceKm * 1000;

    // Calculate walk time using utility
    const walkTime = calculateWalkTimeUtil(distanceMeters);

    // Get operating status
    let operatingStatus: OperatingStatusType = 'NO_INFO';
    let closingTime: string | undefined;
    let nextOpenDate: string | undefined;

    try {
      const centerId = Number(center.id);
      const statusResult = await calculateOperatingStatus(centerId);

      operatingStatus = statusResult.current_status.status as OperatingStatusType;

      // Extract closing time if OPEN or CLOSING_SOON
      if (
        operatingStatus === 'OPEN' ||
        operatingStatus === 'CLOSING_SOON'
      ) {
        const match = statusResult.current_status.message.match(/~(\d{2}:\d{2})/);
        if (match) {
          closingTime = match[1];
        }
      }

      // Extract next open date if CLOSED or HOLIDAY
      if (statusResult.next_open && statusResult.next_open.date) {
        nextOpenDate = statusResult.next_open.date;
      }
    } catch (err) {
      logger.warn(`[Center Search] Failed to get operating status for center ${center.id}:`, err);
      // Continue with NO_INFO status (graceful degradation)
    }

    processedCenters.push({
      id: Number(center.id),
      name: center.center_name,
      latitude: centerLat,
      longitude: centerLng,
      distance: Math.round(distanceMeters),
      walkTime,
      operatingStatus,
      closingTime,
      nextOpenDate,
      avgRating: parseFloat(center.avg_rating.toString()),
      reviewCount: center.review_count,
      centerType: center.center_type,
      roadAddress: center.road_address,
      phoneNumber: center.phone_number || undefined,
    });
  }

  const response: CenterSearchResponse = {
    centers: processedCenters,
    total: processedCenters.length,
    radius: getRadiusDisplay(radius),
    userLocation: { lat, lng },
    hasMore: processedCenters.length === limit,
    nextOffset: processedCenters.length === limit ? offset + limit : null,
  };

  // 4. Save to Redis cache with 5-minute TTL
  try {
    await redis.setex(
      cacheKey,
      CACHE_TTL.CENTER_SEARCH,
      JSON.stringify(response),
    );
  } catch (err) {
    // Log cache error but continue (graceful degradation)
    const cacheError = new CacheError('Redis 캐시 저장 실패', 'set');
    logger.error('[Center Search] Redis set error:', {
      error: cacheError,
      originalError: err,
    });
    // Continue without caching - request still succeeds
  }

  const duration = Date.now() - startTime;
  logger.info(`[Center Search] Database query completed - ${duration}ms`);

  return response;
}

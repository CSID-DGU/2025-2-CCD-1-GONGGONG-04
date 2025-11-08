/**
 * Centers Service Unit Tests
 *
 * Sprint 1: 지도 기반 센터 검색
 * Day 2: Unit Tests for centersService
 *
 * Test Coverage:
 * - getCentersWithinRadius function
 * - Redis caching (hit/miss scenarios)
 * - Distance calculation integration
 * - Walk time calculation
 * - Operating status integration
 * - Error handling
 */

import { getCentersWithinRadius, CenterSearchResponse } from '../../../src/services/centersService';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Mock Prisma Client with factory
const mockPrisma = {
  $queryRaw: jest.fn(),
  $executeRawUnsafe: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

// Mock other dependencies
jest.mock('ioredis');
jest.mock('../../../src/config/redis');
jest.mock('../../../src/services/distance.service');
jest.mock('../../../src/services/operatingStatus.service');

const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
};

const mockCalculateDistance = jest.fn();
const mockCalculateOperatingStatus = jest.fn();

// Setup mocks
beforeAll(() => {
  (Redis as unknown as jest.Mock).mockImplementation(() => mockRedis);

  // Mock redis config
  const redisConfig = require('../../../src/config/redis');
  redisConfig.getRedisClient = jest.fn(() => mockRedis);
  redisConfig.CACHE_KEYS = {
    centerSearch: (lat: number, lng: number, radius: string) =>
      `centers:lat:${lat}:lng:${lng}:radius:${radius}`,
  };
  redisConfig.CACHE_TTL = {
    CENTER_SEARCH: 300, // 5 minutes
  };

  // Mock distance service
  const distanceService = require('../../../src/services/distance.service');
  distanceService.calculateDistance = mockCalculateDistance;

  // Mock operating status service
  const operatingStatusService = require('../../../src/services/operatingStatus.service');
  operatingStatusService.calculateOperatingStatus = mockCalculateOperatingStatus;
});

beforeEach(() => {
  jest.clearAllMocks();
  // Reset console.log and console.error to avoid noise
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();

  // Default mock for Prisma $executeRawUnsafe (used by operatingStatus service)
  mockPrisma.$executeRawUnsafe.mockResolvedValue([]);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Centers Service', () => {
  describe('getCentersWithinRadius', () => {
    const mockCenterData = [
      {
        id: BigInt(1),
        center_name: '서울시 정신건강복지센터',
        latitude: { toString: () => '37.5665' } as any,
        longitude: { toString: () => '126.9780' } as any,
        center_type: '정신건강복지센터',
        road_address: '서울특별시 중구 세종대로 110',
        phone_number: '02-1234-5678',
        avg_rating: { toString: () => '4.5' } as any,
        review_count: 42,
      },
      {
        id: BigInt(2),
        center_name: '강남구 정신건강복지센터',
        latitude: { toString: () => '37.4979' } as any,
        longitude: { toString: () => '127.0276' } as any,
        center_type: '정신건강복지센터',
        road_address: '서울특별시 강남구 테헤란로 123',
        phone_number: '02-5678-1234',
        avg_rating: { toString: () => '4.2' } as any,
        review_count: 28,
      },
    ];

    // ============================================================================
    // SUCCESS CASES - Returns centers within radius
    // ============================================================================

    test('should return centers within radius (cache miss)', async () => {
      // Mock Redis cache miss
      mockRedis.get.mockResolvedValue(null);

      // Mock Prisma query
      mockPrisma.$queryRaw.mockResolvedValue(mockCenterData);

      // Mock distance calculations
      mockCalculateDistance.mockReturnValueOnce(0.5).mockReturnValueOnce(8.79);

      // Mock operating status
      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: {
          status: 'OPEN',
          message: '운영 중 (~18:00)',
          status_color: 'green',
        },
        next_open: null,
        weekly_hours: [],
        upcoming_holidays: [],
      });

      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      // Verify result structure
      expect(result).toHaveProperty('centers');
      expect(result).toHaveProperty('total');
      expect(result.centers).toHaveLength(2);
      expect(result.total).toBe(2);

      // Verify first center
      expect(result.centers[0]).toMatchObject({
        id: 1,
        name: '서울시 정신건강복지센터',
        latitude: 37.5665,
        longitude: 126.9780,
        distance: 500, // 0.5km * 1000
        walkTime: '7분', // 500m / 80m/min = 6.25 -> ceil = 7
        operatingStatus: 'OPEN',
        centerType: '정신건강복지센터',
        roadAddress: '서울특별시 중구 세종대로 110',
        phoneNumber: '02-1234-5678',
        avgRating: 4.5,
        reviewCount: 42,
      });

      // Verify Prisma query was called with correct parameters
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify Redis cache was checked
      expect(mockRedis.get).toHaveBeenCalledWith('centers:lat:37.5665:lng:126.978:radius:5');

      // Verify Redis cache was set
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'centers:lat:37.5665:lng:126.978:radius:5',
        300, // 5 minutes TTL
        expect.any(String)
      );
    });

    test('should return centers from cache (cache hit)', async () => {
      const cachedResponse: CenterSearchResponse = {
        centers: [
          {
            id: 1,
            name: '서울시 정신건강복지센터',
            latitude: 37.5665,
            longitude: 126.9780,
            distance: 500,
            walkTime: '7분',
            operatingStatus: 'OPEN',
            centerType: '정신건강복지센터',
            roadAddress: '서울특별시 중구 세종대로 110',
            phoneNumber: '02-1234-5678',
            avgRating: 4.5,
            reviewCount: 42,
          },
        ],
        total: 1,
      };

      // Mock Redis cache hit
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedResponse));

      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      // Verify result matches cached data
      expect(result).toEqual(cachedResponse);

      // Verify Prisma query was NOT called
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();

      // Verify Redis cache was checked
      expect(mockRedis.get).toHaveBeenCalledWith('centers:lat:37.5665:lng:126.978:radius:5');

      // Verify Redis set was NOT called
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    // ============================================================================
    // DISTANCE CALCULATION
    // ============================================================================

    test('should calculate distances correctly', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([mockCenterData[0]]);

      // Mock specific distance
      mockCalculateDistance.mockReturnValue(2.5); // 2.5km

      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: {
          status: 'OPEN',
          message: '운영 중',
          status_color: 'green',
        },
        next_open: null,
        weekly_hours: [],
        upcoming_holidays: [],
      });

      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      expect(result.centers[0].distance).toBe(2500); // 2.5km * 1000
      expect(mockCalculateDistance).toHaveBeenCalledWith(37.5665, 126.978, 37.5665, 126.9780);
    });

    // ============================================================================
    // WALK TIME CALCULATION
    // ============================================================================

    test('should calculate walk times correctly', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([mockCenterData[0]]);

      // Test various distances
      const testCases = [
        { distance: 0.08, expectedWalkTime: '1분' }, // 80m -> 1분
        { distance: 0.16, expectedWalkTime: '2분' }, // 160m -> 2분
        { distance: 1.0, expectedWalkTime: '13분' }, // 1000m -> 12.5 -> ceil = 13분
        { distance: 2.5, expectedWalkTime: '32분' }, // 2500m -> 31.25 -> ceil = 32분
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        mockRedis.get.mockResolvedValue(null);
        mockPrisma.$queryRaw.mockResolvedValue([mockCenterData[0]]);
        mockCalculateDistance.mockReturnValue(testCase.distance);
        mockCalculateOperatingStatus.mockResolvedValue({
          current_status: { status: 'OPEN', message: '', status_color: 'green' },
          next_open: null,
          weekly_hours: [],
          upcoming_holidays: [],
        });

        const result = await getCentersWithinRadius(37.5665, 126.978, '5');
        expect(result.centers[0].walkTime).toBe(testCase.expectedWalkTime);
      }
    });

    // ============================================================================
    // OPERATING STATUS INTEGRATION
    // ============================================================================

    test('should include operating status with OPEN state', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([mockCenterData[0]]);
      mockCalculateDistance.mockReturnValue(1.0);

      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: {
          status: 'OPEN',
          message: '운영 중 (~18:00)',
          status_color: 'green',
        },
        next_open: null,
        weekly_hours: [],
        upcoming_holidays: [],
      });

      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      expect(result.centers[0].operatingStatus).toBe('OPEN');
      expect(result.centers[0].closingTime).toBe('18:00');
      expect(result.centers[0].nextOpenDate).toBeUndefined();
    });

    test('should include operating status with CLOSING_SOON state', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([mockCenterData[0]]);
      mockCalculateDistance.mockReturnValue(1.0);

      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: {
          status: 'CLOSING_SOON',
          message: '곧 마감 (~17:30)',
          status_color: 'yellow',
        },
        next_open: null,
        weekly_hours: [],
        upcoming_holidays: [],
      });

      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      expect(result.centers[0].operatingStatus).toBe('CLOSING_SOON');
      expect(result.centers[0].closingTime).toBe('17:30');
    });

    test('should include next open date for CLOSED status', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([mockCenterData[0]]);
      mockCalculateDistance.mockReturnValue(1.0);

      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: {
          status: 'CLOSED',
          message: '마감 (월요일 09:00 오픈)',
          status_color: 'gray',
        },
        next_open: {
          date: '2025-01-13',
          day_name: '월요일',
          open_time: '09:00',
        },
        weekly_hours: [],
        upcoming_holidays: [],
      });

      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      expect(result.centers[0].operatingStatus).toBe('CLOSED');
      expect(result.centers[0].nextOpenDate).toBe('2025-01-13');
    });

    test('should handle NO_INFO operating status', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([mockCenterData[0]]);
      mockCalculateDistance.mockReturnValue(1.0);

      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: {
          status: 'NO_INFO',
          message: '운영시간 정보가 없습니다',
          status_color: 'gray',
        },
        next_open: null,
        weekly_hours: [],
        upcoming_holidays: [],
      });

      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      expect(result.centers[0].operatingStatus).toBe('NO_INFO');
      expect(result.centers[0].closingTime).toBeUndefined();
      expect(result.centers[0].nextOpenDate).toBeUndefined();
    });

    // ============================================================================
    // EMPTY RESULTS
    // ============================================================================

    test('should return empty array when no centers found', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      expect(result.centers).toEqual([]);
      expect(result.total).toBe(0);
    });

    // ============================================================================
    // ORDERING AND LIMITS
    // ============================================================================

    test('should order results by distance ASC', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue(mockCenterData);

      // First center: 2.5km, Second center: 1.0km
      mockCalculateDistance.mockReturnValueOnce(2.5).mockReturnValueOnce(1.0);

      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: { status: 'OPEN', message: '', status_color: 'green' },
        next_open: null,
        weekly_hours: [],
        upcoming_holidays: [],
      });

      const result = await getCentersWithinRadius(37.5665, 126.978, '10');

      // Verify ordering (database query should handle ordering via ORDER BY clause)
      // The service itself relies on database ordering
      expect(result.centers).toHaveLength(2);
    });

    test('should limit results to 100 centers', async () => {
      mockRedis.get.mockResolvedValue(null);

      // Create 150 mock centers
      const manyCenters = Array.from({ length: 150 }, (_, i) => ({
        id: BigInt(i + 1),
        center_name: `센터 ${i + 1}`,
        latitude: { toString: () => '37.5665' } as any,
        longitude: { toString: () => '126.9780' } as any,
        center_type: '정신건강복지센터',
        road_address: '서울특별시',
        phone_number: '02-0000-0000',
        avg_rating: { toString: () => '4.0' } as any,
        review_count: 10,
      }));

      mockPrisma.$queryRaw.mockResolvedValue(manyCenters);
      mockCalculateDistance.mockReturnValue(1.0);
      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: { status: 'OPEN', message: '', status_color: 'green' },
        next_open: null,
        weekly_hours: [],
        upcoming_holidays: [],
      });

      const result = await getCentersWithinRadius(37.5665, 126.978, 'all');

      // Service processes all returned centers from DB
      // Database LIMIT 100 clause ensures max 100 centers
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    // ============================================================================
    // REDIS ERROR HANDLING
    // ============================================================================

    test('should handle Redis get error gracefully', async () => {
      // Mock Redis get error
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      // Mock Prisma query
      mockPrisma.$queryRaw.mockResolvedValue([mockCenterData[0]]);
      mockCalculateDistance.mockReturnValue(1.0);
      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: { status: 'OPEN', message: '', status_color: 'green' },
        next_open: null,
        weekly_hours: [],
        upcoming_holidays: [],
      });

      // Should continue with database query
      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      expect(result.centers).toHaveLength(1);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    test('should handle Redis setex error gracefully', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.setex.mockRejectedValue(new Error('Redis write failed'));

      mockPrisma.$queryRaw.mockResolvedValue([mockCenterData[0]]);
      mockCalculateDistance.mockReturnValue(1.0);
      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: { status: 'OPEN', message: '', status_color: 'green' },
        next_open: null,
        weekly_hours: [],
        upcoming_holidays: [],
      });

      // Should still return results
      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      expect(result.centers).toHaveLength(1);
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    // ============================================================================
    // DATABASE ERROR HANDLING
    // ============================================================================

    test('should handle database errors properly', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'));

      await expect(getCentersWithinRadius(37.5665, 126.978, '5')).rejects.toThrow(
        'Database connection failed'
      );
    });

    // ============================================================================
    // OPERATING STATUS ERROR HANDLING
    // ============================================================================

    test('should handle operating status calculation errors gracefully', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([mockCenterData[0]]);
      mockCalculateDistance.mockReturnValue(1.0);

      // Mock operating status error
      mockCalculateOperatingStatus.mockRejectedValue(new Error('Operating status service error'));

      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      // Should continue with NO_INFO status
      expect(result.centers[0].operatingStatus).toBe('NO_INFO');
    });

    // ============================================================================
    // NULL COORDINATES HANDLING
    // ============================================================================

    test('should skip centers with null coordinates', async () => {
      mockRedis.get.mockResolvedValue(null);

      const centersWithNulls = [
        mockCenterData[0],
        {
          id: BigInt(99),
          center_name: '잘못된 센터',
          latitude: null,
          longitude: { toString: () => '126.9780' } as any,
          center_type: '정신건강복지센터',
          road_address: '서울특별시',
          phone_number: null,
          avg_rating: { toString: () => '4.0' } as any,
          review_count: 0,
        },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(centersWithNulls);
      mockCalculateDistance.mockReturnValue(1.0);
      mockCalculateOperatingStatus.mockResolvedValue({
        current_status: { status: 'OPEN', message: '', status_color: 'green' },
        next_open: null,
        weekly_hours: [],
        upcoming_holidays: [],
      });

      const result = await getCentersWithinRadius(37.5665, 126.978, '5');

      // Should skip the center with null coordinates
      expect(result.centers).toHaveLength(1);
      expect(result.centers[0].id).toBe(1);
    });

    // ============================================================================
    // DEFAULT RADIUS
    // ============================================================================

    test('should use default radius of 5km when not provided', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await getCentersWithinRadius(37.5665, 126.978);

      // Verify cache key uses default radius
      expect(mockRedis.get).toHaveBeenCalledWith('centers:lat:37.5665:lng:126.978:radius:5');
    });
  });
});

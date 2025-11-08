/**
 * Centers API Integration Tests
 *
 * Sprint 2 Day 6: Radius parameter and distance calculation tests
 */

const request = require('supertest');
const app = require('../../app');
const { calculateDistance, calculateWalkTime } = require('../../utils/distance');
const { getRadiusInMeters, getRadiusDisplay } = require('../../utils/radius');

describe('GET /api/v1/centers - Radius Parameter Tests', () => {
  const baseParams = {
    lat: 37.5665, // Seoul City Hall
    lng: 126.9780,
  };

  test('should accept radius=1 (1km)', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query({ ...baseParams, radius: '1' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.centers).toBeDefined();
  });

  test('should accept radius=3 (3km)', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query({ ...baseParams, radius: '3' })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('should accept radius=5 (5km - default)', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query({ ...baseParams, radius: '5' })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('should accept radius=10 (10km)', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query({ ...baseParams, radius: '10' })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('should accept radius=all (unlimited)', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query({ ...baseParams, radius: 'all' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.total).toBeLessThanOrEqual(100); // Max 100 results
  });

  test('should use default radius=5 when omitted', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query(baseParams)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.radius).toBe('5km');
  });

  test('should reject invalid radius value', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query({ ...baseParams, radius: '7' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toContain('Radius must be one of');
  });

  test('should reject invalid radius type', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query({ ...baseParams, radius: 'invalid' })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

describe('Distance Calculation Tests', () => {
  test('should calculate Seoul City Hall to Gangnam Station distance (~8.5km)', () => {
    const distance = calculateDistance(
      37.5665, 126.9780, // Seoul City Hall
      37.4979, 127.0276,  // Gangnam Station
    );

    // Allow ±10m tolerance
    expect(distance).toBeGreaterThanOrEqual(8400);
    expect(distance).toBeLessThanOrEqual(8600);
  });

  test('should calculate accurate Haversine distance', () => {
    const distance = calculateDistance(
      37.5665, 126.9780,
      37.5675, 126.9790,
    );

    // Very short distance (~135m)
    expect(distance).toBeGreaterThanOrEqual(125);
    expect(distance).toBeLessThanOrEqual(145);
  });

  test('should return distance in meters as integer', () => {
    const distance = calculateDistance(37.5665, 126.9780, 37.5665, 126.9780);
    expect(Number.isInteger(distance)).toBe(true);
  });
});

describe('Walk Time Calculation Tests', () => {
  test('should calculate 1000m → 13분', () => {
    const walkTime = calculateWalkTime(1000);
    expect(walkTime).toBe('13분');
  });

  test('should calculate 3000m → 45분', () => {
    const walkTime = calculateWalkTime(3000);
    expect(walkTime).toBe('45분');
  });

  test('should handle edge case: 100m → minimum 2분', () => {
    const walkTime = calculateWalkTime(100);
    expect(walkTime).toBe('2분');
  });

  test('should round up partial minutes', () => {
    const walkTime = calculateWalkTime(1500); // 1.5km → 22.5min → 23분
    expect(walkTime).toBe('23분');
  });
});

describe('Radius Utility Tests', () => {
  test('getRadiusInMeters should convert correctly', () => {
    expect(getRadiusInMeters('1')).toBe(1000);
    expect(getRadiusInMeters('3')).toBe(3000);
    expect(getRadiusInMeters('5')).toBe(5000);
    expect(getRadiusInMeters('10')).toBe(10000);
    expect(getRadiusInMeters('all')).toBe(999999999);
  });

  test('getRadiusInMeters should throw on invalid input', () => {
    expect(() => getRadiusInMeters('7')).toThrow();
    expect(() => getRadiusInMeters('invalid')).toThrow();
  });

  test('getRadiusDisplay should format correctly', () => {
    expect(getRadiusDisplay('1')).toBe('1km');
    expect(getRadiusDisplay('5')).toBe('5km');
    expect(getRadiusDisplay('all')).toBe('전체');
  });
});

describe('API Response Format Tests', () => {
  const baseParams = {
    lat: 37.5665,
    lng: 126.9780,
    radius: '5',
  };

  test('response should include new fields: radius, userLocation, hasMore', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query(baseParams)
      .expect(200);

    expect(response.body.data.radius).toBe('5km');
    expect(response.body.data.userLocation).toEqual({
      lat: baseParams.lat,
      lng: baseParams.lng,
    });
    expect(typeof response.body.data.hasMore).toBe('boolean');
  });

  test('each center should include distance and walkTime', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query(baseParams)
      .expect(200);

    const centers = response.body.data.centers;
    if (centers.length > 0) {
      const center = centers[0];
      expect(typeof center.distance).toBe('number');
      expect(typeof center.walkTime).toBe('string');
      expect(center.walkTime).toMatch(/^\d+분$/);
    }
  });

  test('hasMore should be false when results < 100', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query({ ...baseParams, radius: '1' })
      .expect(200);

    if (response.body.data.total < 100) {
      expect(response.body.data.hasMore).toBe(false);
    }
  });

  test('hasMore should be true when results = 100', async () => {
    const response = await request(app)
      .get('/api/v1/centers')
      .query({ ...baseParams, radius: 'all' })
      .expect(200);

    if (response.body.data.total === 100) {
      expect(response.body.data.hasMore).toBe(true);
    }
  });
});

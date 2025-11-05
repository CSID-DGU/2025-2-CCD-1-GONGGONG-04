const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Import app - adjust path based on your project structure
// Since the main app might be in index.js or app.js, we'll need to create a test helper
// For now, assuming app is exported from a testable module

describe('GET /api/v1/centers/:id/staff', () => {
  let testCenterId: bigint;

  beforeAll(async () => {
    // Create a test center
    const center = await prisma.center.create({
      data: {
        centerName: 'Test Mental Health Center',
        centerType: '정신건강복지센터',
        roadAddress: '서울특별시 테스트구 테스트로 123',
        latitude: 37.5665,
        longitude: 126.978,
        isActive: true,
      },
    });
    testCenterId = center.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.centerStaff.deleteMany({
      where: { centerId: testCenterId },
    });
    await prisma.center.delete({
      where: { id: testCenterId },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean staff data before each test
    await prisma.centerStaff.deleteMany({
      where: { centerId: testCenterId },
    });
  });

  describe('Success cases', () => {
    it('should return staff data when center has staff', async () => {
      // Arrange: Create test staff data
      await prisma.centerStaff.createMany({
        data: [
          {
            centerId: testCenterId,
            staffType: '정신건강의학과 전문의',
            staffCount: 2,
            description: null,
          },
          {
            centerId: testCenterId,
            staffType: '임상심리사',
            staffCount: 3,
            description: '청소년 상담 전문',
          },
          {
            centerId: testCenterId,
            staffType: '사회복지사',
            staffCount: 5,
            description: null,
          },
        ],
      });

      // Act: Make API request
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/staff`)
        .expect(200);

      // Assert: Verify response structure and data
      expect(response.body).toEqual({
        success: true,
        data: {
          center_id: Number(testCenterId),
          staff: expect.arrayContaining([
            {
              staff_type: '정신건강의학과 전문의',
              staff_count: 2,
              description: null,
            },
            {
              staff_type: '임상심리사',
              staff_count: 3,
              description: '청소년 상담 전문',
            },
            {
              staff_type: '사회복지사',
              staff_count: 5,
              description: null,
            },
          ]),
          total_staff: 10,
          has_data: true,
        },
      });

      expect(response.body.data.staff).toHaveLength(3);
    });

    it('should return empty staff data when center has no staff', async () => {
      // Act: Make API request
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/staff`)
        .expect(200);

      // Assert: Verify empty state
      expect(response.body).toEqual({
        success: true,
        data: {
          center_id: Number(testCenterId),
          staff: [],
          total_staff: 0,
          has_data: false,
        },
      });
    });
  });

  describe('Error cases', () => {
    it('should return 400 for invalid center ID (non-numeric)', async () => {
      const response = await request(global.app).get('/api/v1/centers/invalid/staff').expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('Invalid center ID'),
        }),
      });
    });

    it('should return 400 for invalid center ID (negative)', async () => {
      const response = await request(global.app).get('/api/v1/centers/-1/staff').expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('Invalid center ID'),
        }),
      });
    });

    it('should return 404 for non-existent center', async () => {
      const nonExistentId = 999999;

      const response = await request(global.app)
        .get(`/api/v1/centers/${nonExistentId}/staff`)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('not found'),
        }),
      });
    });
  });

  describe('Data integrity', () => {
    it('should correctly calculate total staff count', async () => {
      // Arrange: Create varied staff counts
      await prisma.centerStaff.createMany({
        data: [
          {
            centerId: testCenterId,
            staffType: '의사',
            staffCount: 10,
          },
          {
            centerId: testCenterId,
            staffType: '간호사',
            staffCount: 15,
          },
          {
            centerId: testCenterId,
            staffType: '상담사',
            staffCount: 25,
          },
        ],
      });

      // Act
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/staff`)
        .expect(200);

      // Assert: Total should be 50
      expect(response.body.data.total_staff).toBe(50);
    });

    it('should preserve null descriptions', async () => {
      // Arrange
      await prisma.centerStaff.create({
        data: {
          centerId: testCenterId,
          staffType: '의사',
          staffCount: 5,
          description: null,
        },
      });

      // Act
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/staff`)
        .expect(200);

      // Assert
      expect(response.body.data.staff[0].description).toBeNull();
    });
  });
});

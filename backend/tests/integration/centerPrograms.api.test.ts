const request = require('supertest');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('GET /api/v1/centers/:id/programs', () => {
  let testCenterId: bigint;

  beforeAll(async () => {
    // Create a test center
    const center = await prisma.center.create({
      data: {
        centerName: 'Test Mental Health Center for Programs',
        centerType: '정신건강복지센터',
        roadAddress: '서울특별시 테스트구 테스트로 456',
        latitude: 37.5665,
        longitude: 126.978,
        isActive: true,
      },
    });
    testCenterId = center.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.centerProgram.deleteMany({
      where: { centerId: testCenterId },
    });
    await prisma.center.delete({
      where: { id: testCenterId },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean program data before each test
    await prisma.centerProgram.deleteMany({
      where: { centerId: testCenterId },
    });
  });

  describe('Success cases', () => {
    it('should return program data when center has programs', async () => {
      // Arrange: Create test programs
      await prisma.centerProgram.createMany({
        data: [
          {
            centerId: testCenterId,
            programName: '직장인 스트레스 관리 프로그램',
            programType: '집단 상담',
            targetGroup: '직장인',
            description: '주 1회, 8회기 프로그램',
            isOnlineAvailable: true,
            isFree: true,
            capacity: 12,
            durationMinutes: 90,
            isActive: true,
          },
          {
            centerId: testCenterId,
            programName: '청소년 마음건강 프로그램',
            programType: '집단 상담',
            targetGroup: '청소년',
            description: '또래 관계, 학업 스트레스 상담',
            isOnlineAvailable: false,
            isFree: true,
            capacity: 10,
            durationMinutes: 60,
            isActive: true,
          },
        ],
      });

      // Act
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .expect(200);

      // Assert
      expect(response.body).toMatchObject({
        success: true,
        data: {
          center_id: Number(testCenterId),
          programs: expect.arrayContaining([
            expect.objectContaining({
              program_name: '직장인 스트레스 관리 프로그램',
              program_type: '집단 상담',
              target_group: '직장인',
              is_online_available: true,
              is_free: true,
              capacity: 12,
              duration_minutes: 90,
            }),
            expect.objectContaining({
              program_name: '청소년 마음건강 프로그램',
              target_group: '청소년',
              is_online_available: false,
            }),
          ]),
          total_count: 2,
          has_data: true,
          pagination: {
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      });
    });

    it('should return empty data when center has no programs', async () => {
      // Act
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: {
          center_id: Number(testCenterId),
          programs: [],
          total_count: 0,
          has_data: false,
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        },
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(async () => {
      // Create diverse programs for filtering tests
      await prisma.centerProgram.createMany({
        data: [
          {
            centerId: testCenterId,
            programName: '온라인 직장인 상담',
            targetGroup: '직장인',
            isOnlineAvailable: true,
            isFree: true,
            isActive: true,
          },
          {
            centerId: testCenterId,
            programName: '오프라인 직장인 상담',
            targetGroup: '직장인',
            isOnlineAvailable: false,
            isFree: true,
            isActive: true,
          },
          {
            centerId: testCenterId,
            programName: '청소년 무료 상담',
            targetGroup: '청소년',
            isOnlineAvailable: true,
            isFree: true,
            isActive: true,
          },
          {
            centerId: testCenterId,
            programName: '청소년 유료 심화 상담',
            targetGroup: '청소년',
            isOnlineAvailable: true,
            isFree: false,
            feeAmount: 30000,
            isActive: true,
          },
        ],
      });
    });

    it('should filter by target_group', async () => {
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .query({ target_group: '직장인' })
        .expect(200);

      expect(response.body.data.programs).toHaveLength(2);
      expect(response.body.data.programs.every((p: any) => p.target_group === '직장인')).toBe(true);
    });

    it('should filter by is_online', async () => {
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .query({ is_online: 'true' })
        .expect(200);

      expect(response.body.data.programs).toHaveLength(3);
      expect(response.body.data.programs.every((p: any) => p.is_online_available === true)).toBe(
        true
      );
    });

    it('should filter by is_free', async () => {
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .query({ is_free: 'false' })
        .expect(200);

      expect(response.body.data.programs).toHaveLength(1);
      expect(response.body.data.programs[0].is_free).toBe(false);
      expect(response.body.data.programs[0].fee_amount).toBe(30000);
    });

    it('should apply multiple filters', async () => {
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .query({
          target_group: '청소년',
          is_online: 'true',
          is_free: 'true',
        })
        .expect(200);

      expect(response.body.data.programs).toHaveLength(1);
      expect(response.body.data.programs[0]).toMatchObject({
        program_name: '청소년 무료 상담',
        target_group: '청소년',
        is_online_available: true,
        is_free: true,
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      // Create 15 programs for pagination tests
      const programs = Array.from({ length: 15 }, (_, i) => ({
        centerId: testCenterId,
        programName: `프로그램 ${i + 1}`,
        programType: '집단 상담',
        targetGroup: '전체',
        isFree: true,
        isActive: true,
      }));

      await prisma.centerProgram.createMany({ data: programs });
    });

    it('should return first page with default limit (10)', async () => {
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .expect(200);

      expect(response.body.data.programs).toHaveLength(10);
      expect(response.body.data.pagination).toEqual({
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      });
    });

    it('should return second page correctly', async () => {
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .query({ page: '2', limit: '10' })
        .expect(200);

      expect(response.body.data.programs).toHaveLength(5);
      expect(response.body.data.pagination).toEqual({
        total: 15,
        page: 2,
        limit: 10,
        totalPages: 2,
      });
    });

    it('should respect custom limit', async () => {
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .query({ limit: '5' })
        .expect(200);

      expect(response.body.data.programs).toHaveLength(5);
      expect(response.body.data.pagination).toEqual({
        total: 15,
        page: 1,
        limit: 5,
        totalPages: 3,
      });
    });

    it('should handle limit exceeding total count', async () => {
      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .query({ limit: '100' })
        .expect(200);

      expect(response.body.data.programs).toHaveLength(15);
      expect(response.body.data.pagination.totalPages).toBe(1);
    });
  });

  describe('Error cases', () => {
    it('should return 400 for invalid center ID', async () => {
      const response = await request(global.app)
        .get('/api/v1/centers/invalid/programs')
        .expect(400);

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
        .get(`/api/v1/centers/${nonExistentId}/programs`)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('not found'),
        }),
      });
    });
  });

  describe('Active filtering', () => {
    it('should only return active programs', async () => {
      // Create both active and inactive programs
      await prisma.centerProgram.createMany({
        data: [
          {
            centerId: testCenterId,
            programName: '활성 프로그램',
            isActive: true,
          },
          {
            centerId: testCenterId,
            programName: '비활성 프로그램',
            isActive: false,
          },
        ],
      });

      const response = await request(global.app)
        .get(`/api/v1/centers/${testCenterId}/programs`)
        .expect(200);

      expect(response.body.data.programs).toHaveLength(1);
      expect(response.body.data.programs[0].program_name).toBe('활성 프로그램');
    });
  });
});

const {
  getPrismaClient,
  cleanupDatabase,
  closePrismaConnection,
  createTestCenter
} = require('../helpers/prisma');

describe('Center Model Tests', () => {
  let prisma;

  beforeAll(() => {
    prisma = getPrismaClient();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closePrismaConnection();
  });

  describe('Center Creation', () => {
    test('should create a center with required fields', async () => {
      const centerData = {
        centerName: '서울정신건강센터',
        centerType: '정신건강복지센터',
        roadAddress: '서울시 강남구 테헤란로 123',
        latitude: 37.5665,
        longitude: 126.9780,
        isActive: true
      };

      const center = await prisma.center.create({
        data: centerData
      });

      expect(center).toBeDefined();
      expect(center.id).toBeDefined();
      expect(center.centerName).toBe(centerData.centerName);
      expect(center.centerType).toBe(centerData.centerType);
      expect(center.roadAddress).toBe(centerData.roadAddress);
      expect(parseFloat(center.latitude)).toBe(centerData.latitude);
      expect(parseFloat(center.longitude)).toBe(centerData.longitude);
      expect(center.isActive).toBe(true);
      expect(center.createdAt).toBeInstanceOf(Date);
      expect(center.updatedAt).toBeInstanceOf(Date);
    });

    test('should create a center with helper function', async () => {
      const center = await createTestCenter();

      expect(center).toBeDefined();
      expect(center.id).toBeDefined();
      expect(center.centerName).toContain('Test Center');
      expect(center.isActive).toBe(true);
    });

    test('should create a center with optional fields', async () => {
      const centerData = {
        centerName: '부산정신건강센터',
        centerType: '정신건강복지센터',
        roadAddress: '부산시 해운대구 마린시티 456',
        latitude: 35.1796,
        longitude: 129.0756,
        isActive: true,
        jibunAddress: '부산시 해운대구 우동 456',
        phoneNumber: '051-123-4567',
        businessContent: '부산지역 정신건강 지원센터',
        operatingOrgName: '부산시',
        managingOrgName: '부산시 정신건강복지센터',
        managingOrgPhone: '051-999-8888'
      };

      const center = await prisma.center.create({
        data: centerData
      });

      expect(center.jibunAddress).toBe(centerData.jibunAddress);
      expect(center.phoneNumber).toBe(centerData.phoneNumber);
      expect(center.businessContent).toBe(centerData.businessContent);
      expect(center.operatingOrgName).toBe(centerData.operatingOrgName);
      expect(center.managingOrgName).toBe(centerData.managingOrgName);
      expect(center.managingOrgPhone).toBe(centerData.managingOrgPhone);
    });

    test('should fail to create center without required fields', async () => {
      await expect(
        prisma.center.create({
          data: {
            centerName: '불완전한센터'
            // missing required fields
          }
        })
      ).rejects.toThrow();
    });

    test('should create multiple centers', async () => {
      await createTestCenter({ centerName: '서울센터' });
      await createTestCenter({ centerName: '부산센터' });
      await createTestCenter({ centerName: '대구센터' });

      const centers = await prisma.center.findMany();
      expect(centers).toHaveLength(3);
    });
  });

  describe('Center Reading', () => {
    test('should find center by centerId', async () => {
      const createdCenter = await createTestCenter();

      const foundCenter = await prisma.center.findUnique({
        where: { id: createdCenter.id }
      });

      expect(foundCenter).toBeDefined();
      expect(foundCenter.id).toBe(createdCenter.id);
      expect(foundCenter.centerName).toBe(createdCenter.centerName);
    });

    test('should return null for non-existent center', async () => {
      const center = await prisma.center.findUnique({
        where: { id: 999999 }
      });

      expect(center).toBeNull();
    });

    test('should find multiple centers', async () => {
      await createTestCenter({ centerName: 'Center A' });
      await createTestCenter({ centerName: 'Center B' });
      await createTestCenter({ centerName: 'Center C' });

      const centers = await prisma.center.findMany();

      expect(centers).toHaveLength(3);
    });

    test('should filter centers by type', async () => {
      await createTestCenter({ centerName: 'Type A1', centerType: 'Type A' });
      await createTestCenter({ centerName: 'Type A2', centerType: 'Type A' });
      await createTestCenter({ centerName: 'Type B1', centerType: 'Type B' });

      const typeACenters = await prisma.center.findMany({
        where: { centerType: 'Type A' }
      });

      expect(typeACenters).toHaveLength(2);
      typeACenters.forEach(center => {
        expect(center.centerType).toBe('Type A');
      });
    });

    test('should filter active centers', async () => {
      await createTestCenter({ centerName: 'Active 1', isActive: true });
      await createTestCenter({ centerName: 'Active 2', isActive: true });
      await createTestCenter({ centerName: 'Inactive', isActive: false });

      const activeCenters = await prisma.center.findMany({
        where: { isActive: true }
      });

      expect(activeCenters).toHaveLength(2);
      activeCenters.forEach(center => {
        expect(center.isActive).toBe(true);
      });
    });

    test('should search centers by name', async () => {
      await createTestCenter({ centerName: '서울정신건강센터' });
      await createTestCenter({ centerName: '서울상담센터' });
      await createTestCenter({ centerName: '부산정신건강센터' });

      const seoulCenters = await prisma.center.findMany({
        where: {
          centerName: {
            contains: '서울'
          }
        }
      });

      expect(seoulCenters).toHaveLength(2);
      seoulCenters.forEach(center => {
        expect(center.centerName).toContain('서울');
      });
    });
  });

  describe('Center Updating', () => {
    test('should update center name', async () => {
      const center = await createTestCenter({ centerName: 'Old Name' });
      const newName = 'New Name';

      const updatedCenter = await prisma.center.update({
        where: { id: center.id },
        data: { centerName: newName }
      });

      expect(updatedCenter.centerName).toBe(newName);
      expect(updatedCenter.updatedAt.getTime()).toBeGreaterThanOrEqual(center.updatedAt.getTime());
    });

    test('should update center status', async () => {
      const center = await createTestCenter({ isActive: true });

      const updatedCenter = await prisma.center.update({
        where: { id: center.id },
        data: { isActive: false }
      });

      expect(updatedCenter.isActive).toBe(false);
    });

    test('should update multiple fields', async () => {
      const center = await createTestCenter();

      const updatedCenter = await prisma.center.update({
        where: { id: center.id },
        data: {
          centerName: 'Updated Name',
          phoneNumber: '02-9999-8888',
          businessContent: 'Updated business content',
          operatingOrgName: 'Updated Organization'
        }
      });

      expect(updatedCenter.centerName).toBe('Updated Name');
      expect(updatedCenter.phoneNumber).toBe('02-9999-8888');
      expect(updatedCenter.businessContent).toBe('Updated business content');
      expect(updatedCenter.operatingOrgName).toBe('Updated Organization');
    });

    test('should update coordinates', async () => {
      const center = await createTestCenter({
        latitude: 37.5665,
        longitude: 126.9780
      });

      const updatedCenter = await prisma.center.update({
        where: { id: center.id },
        data: {
          latitude: 35.1796,
          longitude: 129.0756
        }
      });

      expect(parseFloat(updatedCenter.latitude)).toBe(35.1796);
      expect(parseFloat(updatedCenter.longitude)).toBe(129.0756);
    });

    test('should fail to update non-existent center', async () => {
      await expect(
        prisma.center.update({
          where: { id: 999999 },
          data: { centerName: 'Should Fail' }
        })
      ).rejects.toThrow();
    });
  });

  describe('Center Deletion', () => {
    test('should delete center', async () => {
      const center = await createTestCenter();

      const deletedCenter = await prisma.center.delete({
        where: { id: center.id }
      });

      expect(deletedCenter.id).toBe(center.id);

      const foundCenter = await prisma.center.findUnique({
        where: { id: center.id }
      });

      expect(foundCenter).toBeNull();
    });

    test('should fail to delete non-existent center', async () => {
      await expect(
        prisma.center.delete({
          where: { id: 999999 }
        })
      ).rejects.toThrow();
    });

    test('should delete multiple centers', async () => {
      await createTestCenter({ centerName: 'Delete 1' });
      await createTestCenter({ centerName: 'Delete 2' });
      await createTestCenter({ centerName: 'Delete 3' });

      const result = await prisma.center.deleteMany({
        where: {
          centerName: {
            contains: 'Delete'
          }
        }
      });

      expect(result.count).toBe(3);
    });

    test('should soft delete by setting isActive to false', async () => {
      const center = await createTestCenter({ isActive: true });

      const deactivatedCenter = await prisma.center.update({
        where: { id: center.id },
        data: { isActive: false }
      });

      expect(deactivatedCenter.isActive).toBe(false);

      const stillExists = await prisma.center.findUnique({
        where: { id: center.id }
      });

      expect(stillExists).toBeDefined();
    });
  });

  describe('Center with Operating Hours Relationship', () => {
    test('should create center with operating hours', async () => {
      const center = await prisma.center.create({
        data: {
          centerName: '영업시간센터',
          centerType: 'Test Type',
          roadAddress: 'Test Address',
          latitude: 37.5665,
          longitude: 126.9780,
          isActive: true,
          operatingHours: {
            create: [
              {
                dayOfWeek: 1, // Monday
                openTime: new Date('1970-01-01T09:00:00Z'),
                closeTime: new Date('1970-01-01T18:00:00Z'),
                isOpen: true,
                isHoliday: false
              },
              {
                dayOfWeek: 2, // Tuesday
                openTime: new Date('1970-01-01T09:00:00Z'),
                closeTime: new Date('1970-01-01T18:00:00Z'),
                isOpen: true,
                isHoliday: false
              }
            ]
          }
        },
        include: {
          operatingHours: true
        }
      });

      expect(center.operatingHours).toBeDefined();
      expect(center.operatingHours).toHaveLength(2);
      expect(center.operatingHours[0].dayOfWeek).toBe(1);
      expect(center.operatingHours[0].isOpen).toBe(true);
      expect(center.operatingHours[0].openTime).toBeInstanceOf(Date);
    });

    test('should find center with operating hours', async () => {
      const createdCenter = await prisma.center.create({
        data: {
          centerName: '조회센터',
          centerType: 'Test Type',
          roadAddress: 'Test Address',
          latitude: 37.5665,
          longitude: 126.9780,
          isActive: true,
          operatingHours: {
            create: {
              dayOfWeek: 1,
              openTime: new Date('1970-01-01T09:00:00Z'),
              closeTime: new Date('1970-01-01T18:00:00Z'),
              isOpen: true,
              isHoliday: false
            }
          }
        }
      });

      const centerWithHours = await prisma.center.findUnique({
        where: { id: createdCenter.id },
        include: { operatingHours: true }
      });

      expect(centerWithHours.operatingHours).toBeDefined();
      expect(centerWithHours.operatingHours).toHaveLength(1);
    });
  });

  describe('Center with Programs Relationship', () => {
    test('should create center with programs', async () => {
      const center = await prisma.center.create({
        data: {
          centerName: '프로그램센터',
          centerType: 'Test Type',
          roadAddress: 'Test Address',
          latitude: 37.5665,
          longitude: 126.9780,
          isActive: true,
          programs: {
            create: [
              {
                programName: '심리상담 프로그램',
                description: '개인 심리상담',
                isActive: true
              },
              {
                programName: '집단치료 프로그램',
                description: '집단 심리치료',
                isActive: true
              }
            ]
          }
        },
        include: {
          programs: true
        }
      });

      expect(center.programs).toBeDefined();
      expect(center.programs).toHaveLength(2);
      expect(center.programs[0].programName).toBe('심리상담 프로그램');
    });
  });
});

const {
  getPrismaClient,
  cleanupDatabase,
  closePrismaConnection,
  createTestUser,
} = require('../helpers/prisma');

describe('User Model Tests', () => {
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

  describe('User Creation', () => {
    test('should create a user with required fields', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashed_password_123',
        nickname: 'TestUser',
        gender: 'M',
        userType: 'GENERAL',
        status: 'ACTIVE',
        emailVerified: true,
      };

      const user = await prisma.user.create({
        data: userData,
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.nickname).toBe(userData.nickname);
      expect(user.gender).toBe(userData.gender);
      expect(user.userType).toBe(userData.userType);
      expect(user.status).toBe(userData.status);
      expect(user.emailVerified).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    test('should create a user with helper function', async () => {
      const user = await createTestUser();

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toContain('@example.com');
      expect(user.userType).toBe('GENERAL');
      expect(user.status).toBe('ACTIVE');
    });

    test('should create a user with optional fields', async () => {
      const userData = {
        email: 'optional@example.com',
        passwordHash: 'hashed_password',
        nickname: 'OptionalUser',
        gender: 'F',
        userType: 'GENERAL',
        status: 'ACTIVE',
        emailVerified: false,
        phone: '010-1234-5678',
        birthYear: 1990,
      };

      const user = await prisma.user.create({
        data: userData,
      });

      expect(user.phone).toBe(userData.phone);
      expect(user.birthYear).toBe(userData.birthYear);
      expect(user.emailVerified).toBe(false);
    });

    test('should fail to create user without required fields', async () => {
      await expect(
        prisma.user.create({
          data: {
            email: 'incomplete@example.com',
            // missing required fields
          },
        })
      ).rejects.toThrow();
    });

    test('should fail to create user with duplicate email', async () => {
      const email = 'duplicate@example.com';

      await createTestUser({ email });

      await expect(createTestUser({ email })).rejects.toThrow();
    });
  });

  describe('User Reading', () => {
    test('should find user by userId', async () => {
      const createdUser = await createTestUser();

      const foundUser = await prisma.user.findUnique({
        where: { id: createdUser.id },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe(createdUser.email);
    });

    test('should find user by email', async () => {
      const email = 'findme@example.com';
      await createTestUser({ email });

      const foundUser = await prisma.user.findUnique({
        where: { email },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(email);
    });

    test('should return null for non-existent user', async () => {
      const user = await prisma.user.findUnique({
        where: { id: 999999 },
      });

      expect(user).toBeNull();
    });

    test('should find multiple users', async () => {
      await createTestUser({ email: 'user1@example.com' });
      await createTestUser({ email: 'user2@example.com' });
      await createTestUser({ email: 'user3@example.com' });

      const users = await prisma.user.findMany();

      expect(users).toHaveLength(3);
    });

    test('should filter users by status', async () => {
      await createTestUser({ email: 'active@example.com', status: 'ACTIVE' });
      await createTestUser({ email: 'inactive@example.com', status: 'INACTIVE' });
      await createTestUser({ email: 'deleted@example.com', status: 'DELETED' });

      const activeUsers = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
      });

      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].status).toBe('ACTIVE');
    });
  });

  describe('User Updating', () => {
    test('should update user nickname', async () => {
      const user = await createTestUser({ nickname: 'OldNickname' });
      const newNickname = 'NewNickname';

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { nickname: newNickname },
      });

      expect(updatedUser.nickname).toBe(newNickname);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
    });

    test('should update user status', async () => {
      const user = await createTestUser({ status: 'ACTIVE' });

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { status: 'INACTIVE' },
      });

      expect(updatedUser.status).toBe('INACTIVE');
    });

    test('should update multiple fields', async () => {
      const user = await createTestUser();

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          nickname: 'UpdatedNickname',
          phone: '010-9999-9999',
          emailVerified: true,
          birthYear: 1995,
        },
      });

      expect(updatedUser.nickname).toBe('UpdatedNickname');
      expect(updatedUser.phone).toBe('010-9999-9999');
      expect(updatedUser.emailVerified).toBe(true);
      expect(updatedUser.birthYear).toBe(1995);
    });

    test('should fail to update non-existent user', async () => {
      await expect(
        prisma.user.update({
          where: { id: 999999 },
          data: { nickname: 'ShouldFail' },
        })
      ).rejects.toThrow();
    });
  });

  describe('User Deletion', () => {
    test('should delete user', async () => {
      const user = await createTestUser();

      const deletedUser = await prisma.user.delete({
        where: { id: user.id },
      });

      expect(deletedUser.id).toBe(user.id);

      const foundUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(foundUser).toBeNull();
    });

    test('should fail to delete non-existent user', async () => {
      await expect(
        prisma.user.delete({
          where: { id: 999999 },
        })
      ).rejects.toThrow();
    });

    test('should delete multiple users', async () => {
      await createTestUser({ email: 'delete1@example.com' });
      await createTestUser({ email: 'delete2@example.com' });
      await createTestUser({ email: 'delete3@example.com' });

      const result = await prisma.user.deleteMany({
        where: {
          email: {
            contains: 'delete',
          },
        },
      });

      expect(result.count).toBe(3);
    });
  });

  describe('User with Profile Relationship', () => {
    test('should create user with profile', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'withprofile@example.com',
          passwordHash: 'hashed_password',
          nickname: 'ProfileUser',
          gender: 'M',
          userType: 'GENERAL',
          status: 'ACTIVE',
          emailVerified: true,
          profile: {
            create: {
              addressSido: 'Seoul',
              addressSigungu: 'Gangnam',
              ageGroup: 'AGE_30s',
              preferOnline: false,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      expect(user.profile).toBeDefined();
      expect(user.profile.addressSido).toBe('Seoul');
      expect(user.profile.addressSigungu).toBe('Gangnam');
      expect(user.profile.ageGroup).toBe('AGE_30s');
    });

    test('should find user with profile', async () => {
      const createdUser = await prisma.user.create({
        data: {
          email: 'findprofile@example.com',
          passwordHash: 'hashed_password',
          nickname: 'FindProfile',
          gender: 'F',
          userType: 'GENERAL',
          status: 'ACTIVE',
          emailVerified: true,
          profile: {
            create: {
              addressSido: 'Busan',
              addressSigungu: 'Haeundae',
              ageGroup: 'AGE_20s',
            },
          },
        },
      });

      const userWithProfile = await prisma.user.findUnique({
        where: { id: createdUser.id },
        include: { profile: true },
      });

      expect(userWithProfile.profile).toBeDefined();
      expect(userWithProfile.profile.addressSido).toBe('Busan');
      expect(userWithProfile.profile.addressSigungu).toBe('Haeundae');
    });
  });
});

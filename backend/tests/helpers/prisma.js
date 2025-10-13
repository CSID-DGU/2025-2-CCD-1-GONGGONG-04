const { PrismaClient } = require('@prisma/client');

let prisma;

/**
 * Get Prisma Client instance
 * @returns {PrismaClient}
 */
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
    });
  }
  return prisma;
}

/**
 * Clean up all test data from database
 * @returns {Promise<void>}
 */
async function cleanupDatabase() {
  const prisma = getPrismaClient();

  // Delete in reverse order of dependencies
  await prisma.$transaction([
    // Review related
    prisma.reviewReaction.deleteMany(),
    prisma.reviewImage.deleteMany(),
    prisma.review.deleteMany(),

    // User related
    prisma.userAssessment.deleteMany(),
    prisma.userFavorite.deleteMany(),
    prisma.userSession.deleteMany(),
    prisma.userProfile.deleteMany(),

    // Center related
    prisma.recommendation.deleteMany(),
    prisma.centerTag.deleteMany(),
    prisma.centerProgram.deleteMany(),
    prisma.centerStaff.deleteMany(),
    prisma.centerHoliday.deleteMany(),
    prisma.centerOperatingHour.deleteMany(),
    prisma.center.deleteMany(),

    // Content
    prisma.content.deleteMany(),
    prisma.contentCategory.deleteMany(),

    // Logs
    prisma.pageView.deleteMany(),
    prisma.searchLog.deleteMany(),
    prisma.auditLog.deleteMany(),

    // Admin
    prisma.adminUser.deleteMany(),

    // Master data
    prisma.tag.deleteMany(),
    prisma.selfAssessmentTemplate.deleteMany(),
    prisma.stagingCentersRaw.deleteMany(),
    prisma.staffType.deleteMany(),
    prisma.centerType.deleteMany(),

    // Users (last)
    prisma.user.deleteMany()
  ]);
}

/**
 * Close Prisma connection
 * @returns {Promise<void>}
 */
async function closePrismaConnection() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/**
 * Create test user
 * @param {Object} data - User data
 * @returns {Promise<Object>} Created user
 */
async function createTestUser(data = {}) {
  const prisma = getPrismaClient();

  const defaultData = {
    email: `test-${Date.now()}@example.com`,
    passwordHash: 'hashed_password',
    nickname: 'Test User',
    gender: 'N',
    userType: 'GENERAL',
    status: 'ACTIVE',
    emailVerified: true
  };

  return await prisma.user.create({
    data: { ...defaultData, ...data }
  });
}

/**
 * Create test center
 * @param {Object} data - Center data
 * @returns {Promise<Object>} Created center
 */
async function createTestCenter(data = {}) {
  const prisma = getPrismaClient();

  const defaultData = {
    centerName: `Test Center ${Date.now()}`,
    centerType: 'Test Type',
    roadAddress: 'Test Address',
    latitude: 37.5665,
    longitude: 126.9780,
    isActive: true
  };

  return await prisma.center.create({
    data: { ...defaultData, ...data }
  });
}

module.exports = {
  getPrismaClient,
  cleanupDatabase,
  closePrismaConnection,
  createTestUser,
  createTestCenter
};

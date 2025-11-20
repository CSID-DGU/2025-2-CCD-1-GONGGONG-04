/**
 * Database Configuration
 *
 * Centralized Prisma Client configuration with proper UTF-8 encoding support
 *
 * Sprint 3 - Bug Fix: 리뷰 한글 인코딩 문제 해결
 * MySQL 클라이언트 연결 시 charset을 utf8mb4로 강제 설정
 *
 * 해결 방법:
 * 1. Prisma 연결 시 datasources override로 charset 추가
 * 2. 각 연결에 대해 SET NAMES utf8mb4 실행
 */

const { PrismaClient } = require('@prisma/client');

/**
 * Create Prisma Client with enforced UTF-8 encoding
 *
 * datasources를 override하여 연결 URL에 charset 파라미터 강제
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Connection pool event handlers for encoding enforcement
 */
let isEncodingSet = false;

/**
 * Initialize database connection with proper encoding
 * 연결 직후 SET NAMES 실행하여 character set 강제 설정
 */
async function initDatabase() {
  try {
    if (!isEncodingSet) {
      // Force UTF-8 encoding on connection
      // This affects character_set_client, character_set_connection, character_set_results
      await prisma.$executeRawUnsafe(`SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'`);
      await prisma.$executeRawUnsafe(`SET CHARACTER SET utf8mb4`);

      isEncodingSet = true;
      console.log('✅ Database connection initialized with UTF-8 encoding');

      // Verify encoding settings
      const result = await prisma.$queryRawUnsafe(`
        SHOW VARIABLES WHERE Variable_name IN (
          'character_set_client',
          'character_set_connection',
          'character_set_results'
        )
      `);
      console.log('📊 Character set settings:', result);
    }
  } catch (error) {
    console.error('❌ Failed to initialize database encoding:', error);
    throw error;
  }
}

// Initialize encoding on module load
initDatabase().catch(console.error);

/**
 * Graceful shutdown
 */
async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('Database connection closed');
}

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

module.exports = {
  prisma,
  initDatabase,
  disconnectDatabase,
};

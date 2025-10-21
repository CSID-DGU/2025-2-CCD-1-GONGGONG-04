const { getPrismaClient } = require('./prisma');

/**
 * Test data factory for creating realistic test centers
 */

/**
 * Seed test centers with comprehensive data
 * @returns {Promise<Array>} Array of created center objects
 */
async function seedTestCenters() {
  const prisma = getPrismaClient();

  // Create test centers with realistic Seoul coordinates
  const centers = [
    {
      centerName: '서울시 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 중구 세종대로 110',
      jibunAddress: '서울특별시 중구 태평로1가 31',
      phoneNumber: '02-3444-9934',
      latitude: 37.5665, // Seoul City Hall
      longitude: 126.9780,
      businessContent: '정신건강 상담 및 치료 지원, 자살예방 프로그램 운영',
      isActive: true
    },
    {
      centerName: '강남구 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 강남구 테헤란로 211',
      jibunAddress: '서울특별시 강남구 역삼동 679-5',
      phoneNumber: '02-3442-7582',
      latitude: 37.4979, // Gangnam Station area
      longitude: 127.0276,
      businessContent: '우울증, 불안장애 상담 및 치료 연계',
      isActive: true
    },
    {
      centerName: '마포구 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 마포구 월드컵로 212',
      jibunAddress: null, // Test null jibun_address
      phoneNumber: null, // Test null phone_number
      latitude: 37.5665,
      longitude: 126.9018,
      businessContent: null, // Test null business_content
      isActive: true
    },
    {
      centerName: '송파구 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 송파구 올림픽로 326',
      jibunAddress: '서울특별시 송파구 신천동 7-29',
      phoneNumber: '02-2147-3650',
      latitude: 37.5145, // Jamsil area
      longitude: 127.1060,
      businessContent: '정신질환 조기발견, 상담 및 사례관리',
      isActive: true
    }
  ];

  const createdCenters = [];

  for (const centerData of centers) {
    const center = await prisma.center.create({
      data: centerData
    });
    createdCenters.push(center);
  }

  return createdCenters;
}

/**
 * Seed test reviews for centers
 * @param {Array} centers - Array of center objects
 * @param {Object} user - User object who created reviews
 * @returns {Promise<Array>} Array of created review objects
 */
async function seedTestReviews(centers, user) {
  const prisma = getPrismaClient();

  if (!centers || centers.length === 0 || !user) {
    return [];
  }

  const reviews = [];

  // Add reviews to first center (서울시 정신건강복지센터)
  const center1Reviews = [
    {
      centerId: centers[0].id,
      userId: user.id,
      rating: 5,
      reviewText: '정말 친절하고 전문적인 상담을 받았습니다.',
      visitDate: new Date('2024-01-15'),
      isAnonymous: false
    },
    {
      centerId: centers[0].id,
      userId: user.id,
      rating: 4,
      reviewText: '시설이 깨끗하고 좋았어요.',
      visitDate: new Date('2024-02-20'),
      isAnonymous: true
    }
  ];

  // Add reviews to second center (강남구 정신건강복지센터)
  const center2Reviews = [
    {
      centerId: centers[1].id,
      userId: user.id,
      rating: 5,
      reviewText: '우울증 상담 받고 많은 도움이 되었습니다.',
      visitDate: new Date('2024-01-10'),
      isAnonymous: false
    }
  ];

  const allReviews = [...center1Reviews, ...center2Reviews];

  for (const reviewData of allReviews) {
    const review = await prisma.review.create({
      data: reviewData
    });
    reviews.push(review);
  }

  return reviews;
}

/**
 * Seed test favorites for centers
 * @param {Array} centers - Array of center objects
 * @param {Object} user - User object who favorited centers
 * @returns {Promise<Array>} Array of created favorite objects
 */
async function seedTestFavorites(centers, user) {
  const prisma = getPrismaClient();

  if (!centers || centers.length === 0 || !user) {
    return [];
  }

  const favorites = [];

  // User favorites first two centers
  for (let i = 0; i < Math.min(2, centers.length); i++) {
    const favorite = await prisma.userFavorite.create({
      data: {
        userId: user.id,
        centerId: centers[i].id
      }
    });
    favorites.push(favorite);
  }

  return favorites;
}

/**
 * Seed comprehensive test data including centers, reviews, and favorites
 * @returns {Promise<Object>} Object containing all created test data
 */
async function seedComprehensiveTestData() {
  const prisma = getPrismaClient();

  // Create test user first
  const user = await prisma.user.create({
    data: {
      email: `integration-test-${Date.now()}@example.com`,
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', // Mock hash
      nickname: 'Integration Test User',
      gender: 'M',
      ageGroup: '30s',
      userType: 'GENERAL',
      status: 'ACTIVE',
      emailVerified: true
    }
  });

  // Seed centers
  const centers = await seedTestCenters();

  // Seed reviews
  const reviews = await seedTestReviews(centers, user);

  // Seed favorites
  const favorites = await seedTestFavorites(centers, user);

  return {
    user,
    centers,
    reviews,
    favorites
  };
}

/**
 * Calculate expected distance between two coordinates using Haversine formula
 * This matches the MySQL calculate_distance function
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {number} Distance in kilometers (rounded to 2 decimals)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(2));
}

module.exports = {
  seedTestCenters,
  seedTestReviews,
  seedTestFavorites,
  seedComprehensiveTestData,
  calculateDistance
};

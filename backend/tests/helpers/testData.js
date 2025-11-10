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
      longitude: 126.978,
      businessContent: '정신건강 상담 및 치료 지원, 자살예방 프로그램 운영',
      isActive: true,
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
      isActive: true,
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
      isActive: true,
    },
    {
      centerName: '송파구 정신건강복지센터',
      centerType: '정신건강복지센터',
      roadAddress: '서울특별시 송파구 올림픽로 326',
      jibunAddress: '서울특별시 송파구 신천동 7-29',
      phoneNumber: '02-2147-3650',
      latitude: 37.5145, // Jamsil area
      longitude: 127.106,
      businessContent: '정신질환 조기발견, 상담 및 사례관리',
      isActive: true,
    },
  ];

  const createdCenters = [];

  for (const centerData of centers) {
    const center = await prisma.center.create({
      data: centerData,
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
      title: '전문적이고 따뜻한 상담',
      content: '정말 친절하고 전문적인 상담을 받았습니다. 처음 방문했을 때 긴장했지만 상담사 선생님께서 편안한 분위기를 만들어주셔서 마음을 열고 이야기할 수 있었어요.',
      visitDate: new Date('2024-01-15'),
      isVerified: true,
      helpfulCount: 12,
    },
    {
      centerId: centers[0].id,
      userId: user.id,
      rating: 4,
      title: '깨끗한 시설',
      content: '시설이 깨끗하고 좋았어요. 대기 공간도 편안하고 프라이버시가 잘 보호되는 구조입니다.',
      visitDate: new Date('2024-02-20'),
      helpfulCount: 8,
    },
    {
      centerId: centers[0].id,
      userId: user.id,
      rating: 5,
      title: '접근성이 좋아요',
      content: '시청역에서 가까워서 찾아가기 편했습니다. 직장인이라 퇴근 후에 방문했는데 위치가 정말 좋아요.',
      visitDate: new Date('2024-03-05'),
      helpfulCount: 5,
    },
    {
      centerId: centers[0].id,
      userId: user.id,
      rating: 3,
      title: '대기시간이 조금 길어요',
      content: '상담은 만족스러웠지만 예약 시간보다 30분 정도 늦게 시작했어요. 바쁜 시간대라 그런 것 같긴 한데, 시간 여유를 두고 가시는 게 좋을 것 같습니다.',
      visitDate: new Date('2024-03-18'),
      helpfulCount: 15,
    },
    {
      centerId: centers[0].id,
      userId: user.id,
      rating: 5,
      title: '프로그램이 다양해요',
      content: '개인 상담 외에도 집단 프로그램이 다양하게 운영되고 있어서 좋았습니다. 스트레스 관리 프로그램에 참여했는데 많은 도움이 되었어요.',
      visitDate: new Date('2024-04-10'),
      isVerified: true,
      helpfulCount: 10,
    },
  ];

  // Add reviews to second center (강남구 정신건강복지센터)
  const center2Reviews = [
    {
      centerId: centers[1].id,
      userId: user.id,
      rating: 5,
      title: '우울증 상담 전문적이에요',
      content: '우울증 상담 받고 많은 도움이 되었습니다. 약물 치료가 필요한 경우 병원 연계도 해주시고, 지속적인 관리를 받을 수 있어서 좋았어요.',
      visitDate: new Date('2024-01-10'),
      isVerified: true,
      helpfulCount: 20,
    },
    {
      centerId: centers[1].id,
      userId: user.id,
      rating: 4,
      title: '강남역 근처라 편리합니다',
      content: '직장이 강남이라 점심시간에 다녀올 수 있어서 좋았어요. 예약제로 운영되어서 대기 시간도 거의 없었습니다.',
      visitDate: new Date('2024-02-14'),
      helpfulCount: 6,
    },
    {
      centerId: centers[1].id,
      userId: user.id,
      rating: 5,
      title: '직장인 프로그램 추천',
      content: '직장인 대상 저녁 프로그램이 있어서 참여했습니다. 같은 고민을 가진 분들과 이야기 나누면서 위안을 받았어요.',
      visitDate: new Date('2024-03-22'),
      helpfulCount: 14,
    },
    {
      centerId: centers[1].id,
      userId: user.id,
      rating: 4,
      title: '불안장애 상담 좋았어요',
      content: '불안 증상으로 힘들어하다가 방문했는데, 인지행동치료 기법을 알려주셔서 많은 도움이 되었습니다. 꾸준히 다니려고 합니다.',
      visitDate: new Date('2024-04-05'),
      isVerified: true,
      helpfulCount: 11,
    },
    {
      centerId: centers[1].id,
      userId: user.id,
      rating: 3,
      title: '주차가 불편해요',
      content: '상담은 좋았는데 주차 공간이 협소해서 아쉬웠습니다. 대중교통 이용을 권장하시더라고요.',
      visitDate: new Date('2024-04-20'),
      helpfulCount: 9,
    },
  ];

  // Add reviews to third center (마포구 정신건강복지센터)
  const center3Reviews = [
    {
      centerId: centers[2].id,
      userId: user.id,
      rating: 4,
      title: '친절한 상담',
      content: '처음 정신건강센터를 방문하는 거라 많이 긴장했는데, 직원분들이 친절하게 안내해주셔서 좋았습니다.',
      visitDate: new Date('2024-02-01'),
      helpfulCount: 7,
    },
    {
      centerId: centers[2].id,
      userId: user.id,
      rating: 5,
      title: '청년 프로그램 만족스러워요',
      content: '20-30대 청년 대상 프로그램이 있어서 참여했는데 또래 친구들을 만날 수 있어서 좋았어요. 사회적 고립감이 많이 해소되었습니다.',
      visitDate: new Date('2024-02-28'),
      isVerified: true,
      helpfulCount: 18,
    },
    {
      centerId: centers[2].id,
      userId: user.id,
      rating: 4,
      title: '상담료 부담 없어요',
      content: '무료로 상담받을 수 있어서 경제적 부담이 없었습니다. 청년들에게 정말 필요한 서비스인 것 같아요.',
      visitDate: new Date('2024-03-15'),
      helpfulCount: 13,
    },
    {
      centerId: centers[2].id,
      userId: user.id,
      rating: 3,
      title: '전화 연결이 어려워요',
      content: '예약 전화가 잘 안 받으셔서 여러 번 시도했어요. 온라인 예약 시스템이 있으면 더 좋을 것 같습니다.',
      visitDate: new Date('2024-03-28'),
      helpfulCount: 22,
    },
  ];

  // Add reviews to fourth center (송파구 정신건강복지센터)
  const center4Reviews = [
    {
      centerId: centers[3].id,
      userId: user.id,
      rating: 5,
      title: '가족 상담도 가능해요',
      content: '가족 문제로 힘들어서 방문했는데, 가족 상담 프로그램이 있어서 큰 도움이 되었습니다. 부모님과 함께 상담받을 수 있어서 좋았어요.',
      visitDate: new Date('2024-01-20'),
      isVerified: true,
      helpfulCount: 16,
    },
    {
      centerId: centers[3].id,
      userId: user.id,
      rating: 4,
      title: '잠실 근처라 접근성 좋아요',
      content: '잠실역에서 가깝고 버스도 많이 다녀서 찾아가기 편했습니다. 센터도 넓고 쾌적했어요.',
      visitDate: new Date('2024-02-25'),
      helpfulCount: 5,
    },
    {
      centerId: centers[3].id,
      userId: user.id,
      rating: 5,
      title: '조기 발견 프로그램',
      content: '정신질환 조기 발견 프로그램에 참여했는데, 전문적인 검사와 상담을 무료로 받을 수 있어서 감사했습니다.',
      visitDate: new Date('2024-03-10'),
      isVerified: true,
      helpfulCount: 19,
    },
    {
      centerId: centers[3].id,
      userId: user.id,
      rating: 4,
      title: '사례관리 서비스 좋아요',
      content: '단순 상담뿐만 아니라 지속적인 사례관리를 해주셔서 장기적으로 도움을 받을 수 있었습니다.',
      visitDate: new Date('2024-04-01'),
      helpfulCount: 12,
    },
    {
      centerId: centers[3].id,
      userId: user.id,
      rating: 2,
      title: '예약이 너무 밀려있어요',
      content: '예약하려고 했는데 한 달 이상 기다려야 한다고 하셔서 아쉬웠습니다. 급한 경우 다른 센터도 알아보셔야 할 것 같아요.',
      visitDate: new Date('2024-04-15'),
      helpfulCount: 28,
    },
  ];

  const allReviews = [
    ...center1Reviews,
    ...center2Reviews,
    ...center3Reviews,
    ...center4Reviews,
  ];

  for (const reviewData of allReviews) {
    const review = await prisma.review.create({
      data: reviewData,
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
        centerId: centers[i].id,
      },
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
      emailVerified: true,
    },
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
    favorites,
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
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(2));
}

module.exports = {
  seedTestCenters,
  seedTestReviews,
  seedTestFavorites,
  seedComprehensiveTestData,
  calculateDistance,
};

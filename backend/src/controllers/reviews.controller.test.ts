/**
 * Reviews Controller Integration Tests
 *
 * Tests for review listing API endpoint including:
 * - Success cases (200)
 * - Sort options (latest, helpful, rating_desc, rating_asc)
 * - Pagination
 * - Error cases (404)
 *
 * @module controllers/reviews.controller.test
 */

import request from 'supertest';
import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import reviewsRouter from '../routes/reviews.routes';

const prisma = new PrismaClient();
let app: Express;

// Test data
let testCenterId: number;
let testUserId: number;
let testReviewIds: number[] = [];

/**
 * Setup test app
 */
beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/api', reviewsRouter);
});

/**
 * Create test data before all tests
 */
beforeEach(async () => {
  // Clean up existing test data
  await prisma.review.deleteMany({
    where: {
      user: {
        email: { contains: 'test-review-' },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: { contains: 'test-review-' },
    },
  });

  await prisma.center.deleteMany({
    where: {
      centerName: { contains: 'Test Review Center' },
    },
  });

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test-review-user@example.com',
      passwordHash: 'hashed_password',
      nickname: 'Test Reviewer',
    },
  });
  testUserId = Number(testUser.id);

  // Create test center
  const testCenter = await prisma.center.create({
    data: {
      centerName: 'Test Review Center',
      centerType: 'Mental Health Center',
      roadAddress: '123 Test St, Seoul',
      latitude: 37.5665,
      longitude: 126.978,
    },
  });
  testCenterId = Number(testCenter.id);

  // Create test reviews with different ratings and timestamps
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        centerId: testCenter.id,
        userId: testUser.id,
        rating: 5,
        title: 'Excellent service',
        content: 'Very professional and helpful staff.',
        visitDate: new Date('2025-01-15'),
        helpfulCount: 10,
        status: 'ACTIVE',
        createdAt: new Date('2025-01-16T10:00:00Z'),
      },
    }),
    prisma.review.create({
      data: {
        centerId: testCenter.id,
        userId: testUser.id,
        rating: 4,
        title: 'Good experience',
        content: 'Overall satisfied with the service.',
        visitDate: new Date('2025-01-14'),
        helpfulCount: 5,
        status: 'ACTIVE',
        createdAt: new Date('2025-01-15T10:00:00Z'),
      },
    }),
    prisma.review.create({
      data: {
        centerId: testCenter.id,
        userId: testUser.id,
        rating: 3,
        title: 'Average',
        content: 'Nothing special but okay.',
        visitDate: new Date('2025-01-13'),
        helpfulCount: 2,
        status: 'ACTIVE',
        createdAt: new Date('2025-01-14T10:00:00Z'),
      },
    }),
    prisma.review.create({
      data: {
        centerId: testCenter.id,
        userId: testUser.id,
        rating: 2,
        title: 'Disappointing',
        content: 'Expected more from this center.',
        visitDate: new Date('2025-01-12'),
        helpfulCount: 1,
        status: 'ACTIVE',
        createdAt: new Date('2025-01-13T10:00:00Z'),
      },
    }),
  ]);

  testReviewIds = reviews.map(r => Number(r.id));
});

/**
 * Clean up test data after all tests
 */
afterEach(async () => {
  await prisma.review.deleteMany({
    where: {
      user: {
        email: { contains: 'test-review-' },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: { contains: 'test-review-' },
    },
  });

  await prisma.center.deleteMany({
    where: {
      centerName: { contains: 'Test Review Center' },
    },
  });
});

/**
 * Disconnect Prisma after all tests
 */
afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * Test Suite: GET /api/centers/:id/reviews
 */
describe('GET /api/centers/:id/reviews', () => {
  /**
   * Test: Success - Review listing with default parameters
   */
  test('should return reviews with default pagination (200)', async () => {
    const response = await request(app).get(`/api/centers/${testCenterId}/reviews`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('center_id', testCenterId);
    expect(response.body).toHaveProperty('reviews');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body).toHaveProperty('summary');

    // Check reviews array
    expect(Array.isArray(response.body.reviews)).toBe(true);
    expect(response.body.reviews.length).toBe(4);

    // Check first review structure
    const firstReview = response.body.reviews[0];
    expect(firstReview).toHaveProperty('id');
    expect(firstReview).toHaveProperty('rating');
    expect(firstReview).toHaveProperty('title');
    expect(firstReview).toHaveProperty('content');
    expect(firstReview).toHaveProperty('visit_date');
    expect(firstReview).toHaveProperty('helpful_count');
    expect(firstReview).toHaveProperty('unhelpful_count');
    expect(firstReview).toHaveProperty('created_at');
    expect(firstReview).toHaveProperty('updated_at');
    expect(firstReview).toHaveProperty('user');
    expect(firstReview).toHaveProperty('is_my_review');
    expect(firstReview).toHaveProperty('my_reaction');

    // Check user structure
    expect(firstReview.user).toHaveProperty('id');
    expect(firstReview.user).toHaveProperty('nickname');
    expect(firstReview.user).toHaveProperty('avatar_url');

    // Check pagination structure
    expect(response.body.pagination).toHaveProperty('current_page', 1);
    expect(response.body.pagination).toHaveProperty('total_pages', 1);
    expect(response.body.pagination).toHaveProperty('total_count', 4);
    expect(response.body.pagination).toHaveProperty('limit', 10);
    expect(response.body.pagination).toHaveProperty('has_prev', false);
    expect(response.body.pagination).toHaveProperty('has_next', false);

    // Check summary structure
    expect(response.body.summary).toHaveProperty('avg_rating');
    expect(response.body.summary).toHaveProperty('total_reviews', 4);
    expect(response.body.summary).toHaveProperty('rating_distribution');
    expect(response.body.summary.rating_distribution).toHaveProperty('5', 1);
    expect(response.body.summary.rating_distribution).toHaveProperty('4', 1);
    expect(response.body.summary.rating_distribution).toHaveProperty('3', 1);
    expect(response.body.summary.rating_distribution).toHaveProperty('2', 1);
    expect(response.body.summary.rating_distribution).toHaveProperty('1', 0);
  });

  /**
   * Test: Sort by latest (default)
   */
  test('should sort reviews by latest (created_at DESC)', async () => {
    const response = await request(app).get(`/api/centers/${testCenterId}/reviews?sort=latest`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(4);

    // Check descending order by created_at
    const createdDates = response.body.reviews.map((r: any) => new Date(r.created_at).getTime());
    for (let i = 0; i < createdDates.length - 1; i++) {
      expect(createdDates[i]).toBeGreaterThanOrEqual(createdDates[i + 1]);
    }

    // First review should have title "Excellent service" (most recent)
    expect(response.body.reviews[0].title).toBe('Excellent service');
  });

  /**
   * Test: Sort by helpful
   */
  test('should sort reviews by helpful count (helpful_count DESC)', async () => {
    const response = await request(app).get(`/api/centers/${testCenterId}/reviews?sort=helpful`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(4);

    // Check descending order by helpful_count
    const helpfulCounts = response.body.reviews.map((r: any) => r.helpful_count);
    for (let i = 0; i < helpfulCounts.length - 1; i++) {
      expect(helpfulCounts[i]).toBeGreaterThanOrEqual(helpfulCounts[i + 1]);
    }

    // First review should have highest helpful_count (10)
    expect(response.body.reviews[0].helpful_count).toBe(10);
    expect(response.body.reviews[0].title).toBe('Excellent service');
  });

  /**
   * Test: Sort by rating descending
   */
  test('should sort reviews by rating descending (rating DESC)', async () => {
    const response = await request(app).get(
      `/api/centers/${testCenterId}/reviews?sort=rating_desc`,
    );

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(4);

    // Check descending order by rating
    const ratings = response.body.reviews.map((r: any) => r.rating);
    for (let i = 0; i < ratings.length - 1; i++) {
      expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i + 1]);
    }

    // First review should have highest rating (5)
    expect(response.body.reviews[0].rating).toBe(5);
  });

  /**
   * Test: Sort by rating ascending
   */
  test('should sort reviews by rating ascending (rating ASC)', async () => {
    const response = await request(app).get(`/api/centers/${testCenterId}/reviews?sort=rating_asc`);

    expect(response.status).toBe(200);
    expect(response.body.reviews.length).toBe(4);

    // Check ascending order by rating
    const ratings = response.body.reviews.map((r: any) => r.rating);
    for (let i = 0; i < ratings.length - 1; i++) {
      expect(ratings[i]).toBeLessThanOrEqual(ratings[i + 1]);
    }

    // First review should have lowest rating (2)
    expect(response.body.reviews[0].rating).toBe(2);
  });

  /**
   * Test: Pagination
   */
  test('should paginate reviews correctly', async () => {
    // Get first page with limit 2
    const page1Response = await request(app).get(
      `/api/centers/${testCenterId}/reviews?page=1&limit=2`,
    );

    expect(page1Response.status).toBe(200);
    expect(page1Response.body.reviews.length).toBe(2);
    expect(page1Response.body.pagination).toEqual({
      current_page: 1,
      total_pages: 2,
      total_count: 4,
      limit: 2,
      has_prev: false,
      has_next: true,
    });

    // Get second page
    const page2Response = await request(app).get(
      `/api/centers/${testCenterId}/reviews?page=2&limit=2`,
    );

    expect(page2Response.status).toBe(200);
    expect(page2Response.body.reviews.length).toBe(2);
    expect(page2Response.body.pagination).toEqual({
      current_page: 2,
      total_pages: 2,
      total_count: 4,
      limit: 2,
      has_prev: true,
      has_next: false,
    });

    // Ensure different reviews on each page
    const page1Ids = page1Response.body.reviews.map((r: any) => r.id);
    const page2Ids = page2Response.body.reviews.map((r: any) => r.id);
    expect(page1Ids).not.toEqual(page2Ids);
  });

  /**
   * Test: Error - Center not found (404)
   */
  test('should return 404 when center does not exist', async () => {
    const nonExistentCenterId = 999999;
    const response = await request(app).get(`/api/centers/${nonExistentCenterId}/reviews`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('센터를 찾을 수 없습니다');
  });

  /**
   * Test: Error - Invalid sort option (400)
   */
  test('should return 400 for invalid sort option', async () => {
    const response = await request(app).get(
      `/api/centers/${testCenterId}/reviews?sort=invalid_sort`,
    );

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'VALIDATION');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('details');
  });

  /**
   * Test: Error - Invalid center ID (400)
   */
  test('should return 400 for invalid center ID format', async () => {
    const response = await request(app).get('/api/centers/invalid/reviews');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'VALIDATION');
    expect(response.body).toHaveProperty('message');
  });
});

/**
 * Test Suite: POST /api/centers/:id/reviews
 */
describe('POST /api/centers/:id/reviews', () => {
  const authToken = `user_${testUserId}`;

  /**
   * Test: Success - Create review (201)
   */
  test('should create a new review (201)', async () => {
    // Create a new user to avoid duplicate review conflict
    const newUser = await prisma.user.create({
      data: {
        email: 'test-review-new@example.com',
        passwordHash: 'hashed_password',
        nickname: 'New Reviewer',
      },
    });

    const response = await request(app)
      .post(`/api/centers/${testCenterId}/reviews`)
      .set('Authorization', `Bearer user_${Number(newUser.id)}`)
      .send({
        rating: 5,
        title: 'Amazing experience',
        content: 'The counseling was very helpful and professional.',
        visit_date: '2025-01-20',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('rating', 5);
    expect(response.body).toHaveProperty('title', 'Amazing experience');
    expect(response.body).toHaveProperty(
      'content',
      'The counseling was very helpful and professional.',
    );
    expect(response.body).toHaveProperty('helpful_count', 0);
    expect(response.body).toHaveProperty('unhelpful_count', 0);
    expect(response.body).toHaveProperty('is_my_review', true);
    expect(response.body).toHaveProperty('my_reaction', null);

    // Verify center rating was updated
    const updatedCenter = await prisma.center.findUnique({
      where: { id: BigInt(testCenterId) },
      select: { avgRating: true, reviewCount: true },
    });

    expect(updatedCenter?.reviewCount).toBe(5); // 4 existing + 1 new
  });

  /**
   * Test: Error - Unauthenticated (401)
   */
  test('should return 401 when not authenticated', async () => {
    const response = await request(app).post(`/api/centers/${testCenterId}/reviews`).send({
      rating: 5,
      content: 'Great service',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  /**
   * Test: Error - Invalid rating (400)
   */
  test('should return 400 for invalid rating', async () => {
    const response = await request(app)
      .post(`/api/centers/${testCenterId}/reviews`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        rating: 6, // Invalid rating > 5
        content: 'Great service but rating is invalid',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'VALIDATION');
  });

  /**
   * Test: Error - Content too short (400)
   */
  test('should return 400 for content too short', async () => {
    const response = await request(app)
      .post(`/api/centers/${testCenterId}/reviews`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        rating: 5,
        content: 'Short', // < 10 characters
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'VALIDATION');
  });

  /**
   * Test: Error - Duplicate review (409)
   */
  test('should return 409 when user already reviewed this center', async () => {
    const response = await request(app)
      .post(`/api/centers/${testCenterId}/reviews`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        rating: 5,
        content: 'Trying to create duplicate review',
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error', 'CONFLICT');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('이미 이 센터에 리뷰를 작성하셨습니다');
  });

  /**
   * Test: Error - Center not found (404)
   */
  test('should return 404 when center does not exist', async () => {
    const nonExistentCenterId = 999999;
    const response = await request(app)
      .post(`/api/centers/${nonExistentCenterId}/reviews`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        rating: 5,
        content: 'Review for non-existent center',
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});

/**
 * Test Suite: PUT /api/reviews/:id
 */
describe('PUT /api/reviews/:id', () => {
  let ownReviewId: number;
  const authToken = `user_${testUserId}`;

  beforeEach(async () => {
    ownReviewId = testReviewIds[0]; // Use first review as own review
  });

  /**
   * Test: Success - Update review (200)
   */
  test('should update own review within 7 days (200)', async () => {
    const response = await request(app)
      .put(`/api/reviews/${ownReviewId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        rating: 5,
        title: 'Updated title',
        content: 'Updated content with more details about the service.',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', ownReviewId);
    expect(response.body).toHaveProperty('rating', 5);
    expect(response.body).toHaveProperty('title', 'Updated title');
    expect(response.body).toHaveProperty(
      'content',
      'Updated content with more details about the service.',
    );
  });

  /**
   * Test: Error - Unauthenticated (401)
   */
  test('should return 401 when not authenticated', async () => {
    const response = await request(app).put(`/api/reviews/${ownReviewId}`).send({
      content: 'Trying to update without auth',
    });

    expect(response.status).toBe(401);
  });

  /**
   * Test: Error - Not owner (403)
   */
  test('should return 403 when trying to update another user review', async () => {
    const otherUserId = 99999;
    const response = await request(app)
      .put(`/api/reviews/${ownReviewId}`)
      .set('Authorization', `Bearer user_${otherUserId}`)
      .send({
        content: 'Trying to update someone elses review',
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'FORBIDDEN');
  });

  /**
   * Test: Error - Review not found (404)
   */
  test('should return 404 when review does not exist', async () => {
    const nonExistentReviewId = 999999;
    const response = await request(app)
      .put(`/api/reviews/${nonExistentReviewId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'Trying to update non-existent review',
      });

    expect(response.status).toBe(404);
  });

  /**
   * Test: Error - 7-day limit exceeded (403)
   * Note: This test requires creating an old review
   */
  test('should return 403 when trying to update review after 7 days', async () => {
    // Create a review with old created_at date
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 8); // 8 days ago

    const oldReview = await prisma.review.create({
      data: {
        centerId: BigInt(testCenterId),
        userId: BigInt(testUserId),
        rating: 3,
        content: 'Old review from 8 days ago',
        status: 'ACTIVE',
        createdAt: oldDate,
      },
    });

    const response = await request(app)
      .put(`/api/reviews/${Number(oldReview.id)}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'Trying to update old review',
      });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'FORBIDDEN');
    expect(response.body.message).toContain('7일 이내에만 수정할 수 있습니다');
  });
});

/**
 * Test Suite: DELETE /api/reviews/:id
 */
describe('DELETE /api/reviews/:id', () => {
  let ownReviewId: number;
  const authToken = `user_${testUserId}`;

  beforeEach(async () => {
    ownReviewId = testReviewIds[0];
  });

  /**
   * Test: Success - Delete review (204)
   */
  test('should delete own review (204)', async () => {
    const response = await request(app)
      .delete(`/api/reviews/${ownReviewId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    // Verify review is soft deleted
    const deletedReview = await prisma.review.findUnique({
      where: { id: BigInt(ownReviewId) },
      select: { status: true },
    });

    expect(deletedReview?.status).toBe('DELETED');

    // Verify center rating was recalculated (excluding deleted review)
    const updatedCenter = await prisma.center.findUnique({
      where: { id: BigInt(testCenterId) },
      select: { reviewCount: true },
    });

    expect(updatedCenter?.reviewCount).toBe(3); // 4 - 1 deleted
  });

  /**
   * Test: Error - Unauthenticated (401)
   */
  test('should return 401 when not authenticated', async () => {
    const response = await request(app).delete(`/api/reviews/${ownReviewId}`);

    expect(response.status).toBe(401);
  });

  /**
   * Test: Error - Not owner (403)
   */
  test('should return 403 when trying to delete another user review', async () => {
    const otherUserId = 99999;
    const response = await request(app)
      .delete(`/api/reviews/${ownReviewId}`)
      .set('Authorization', `Bearer user_${otherUserId}`);

    expect(response.status).toBe(403);
  });

  /**
   * Test: Error - Review not found (404)
   */
  test('should return 404 when review does not exist', async () => {
    const nonExistentReviewId = 999999;
    const response = await request(app)
      .delete(`/api/reviews/${nonExistentReviewId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
  });
});

/**
 * Test Suite: POST /api/reviews/:id/reactions
 */
describe('POST /api/reviews/:id/reactions', () => {
  let targetReviewId: number;
  const authToken = `user_${testUserId}`;

  beforeEach(async () => {
    targetReviewId = testReviewIds[0];

    // Clean up existing reactions
    await prisma.reviewReaction.deleteMany({
      where: {
        reviewId: BigInt(targetReviewId),
        userId: BigInt(testUserId),
      },
    });
  });

  /**
   * Test: Success - Add helpful reaction (200)
   */
  test('should add helpful reaction (200)', async () => {
    const response = await request(app)
      .post(`/api/reviews/${targetReviewId}/reactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        reaction: 'helpful',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('review_id', targetReviewId);
    expect(response.body).toHaveProperty('helpful_count');
    expect(response.body).toHaveProperty('unhelpful_count');
    expect(response.body).toHaveProperty('my_reaction', 'HELPFUL');
  });

  /**
   * Test: Success - Change reaction from helpful to unhelpful (200)
   */
  test('should change reaction from helpful to unhelpful (200)', async () => {
    // First, add helpful reaction
    await request(app)
      .post(`/api/reviews/${targetReviewId}/reactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reaction: 'helpful' });

    // Then, change to unhelpful
    const response = await request(app)
      .post(`/api/reviews/${targetReviewId}/reactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reaction: 'unhelpful' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('my_reaction', 'UNHELPFUL');
  });

  /**
   * Test: Success - Remove reaction (200)
   */
  test('should remove reaction when reaction is null (200)', async () => {
    // First, add helpful reaction
    await request(app)
      .post(`/api/reviews/${targetReviewId}/reactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reaction: 'helpful' });

    // Then, remove reaction
    const response = await request(app)
      .post(`/api/reviews/${targetReviewId}/reactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reaction: null });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('my_reaction', null);
  });

  /**
   * Test: Error - Unauthenticated (401)
   */
  test('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .post(`/api/reviews/${targetReviewId}/reactions`)
      .send({ reaction: 'helpful' });

    expect(response.status).toBe(401);
  });

  /**
   * Test: Error - Review not found (404)
   */
  test('should return 404 when review does not exist', async () => {
    const nonExistentReviewId = 999999;
    const response = await request(app)
      .post(`/api/reviews/${nonExistentReviewId}/reactions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reaction: 'helpful' });

    expect(response.status).toBe(404);
  });
});

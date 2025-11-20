/**
 * Reviews Service
 *
 * Handles business logic for review operations including:
 * - Review listing with pagination and sorting
 * - Rating statistics calculation
 * - User-specific review information (is_my_review, my_reaction)
 *
 * @module services/reviews
 */

import { Prisma } from '@prisma/client';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors';
// Sprint 3 - Bug Fix: 중앙화된 Prisma 클라이언트 사용 (UTF-8 인코딩 강제)
const { prisma } = require('../config/database');

/**
 * Sort options for review listing
 */
export type SortOption = 'latest' | 'helpful' | 'rating_desc' | 'rating_asc';

/**
 * Fetch reviews parameters
 */
export interface FetchReviewsParams {
  page: number;
  limit: number;
  sort: SortOption;
  userId?: number; // Optional authenticated user ID
}

/**
 * Review with user information
 */
export interface ReviewWithUser {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  visit_date: Date | null;
  helpful_count: number;
  unhelpful_count: number;
  created_at: Date;
  updated_at: Date;
  user: {
    id: number;
    nickname: string;
    avatar_url: string | null;
  };
  is_my_review: boolean;
  my_reaction: 'HELPFUL' | 'UNHELPFUL' | null;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  limit: number;
  has_prev: boolean;
  has_next: boolean;
}

/**
 * Rating distribution by star rating
 */
export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

/**
 * Review summary statistics
 */
export interface ReviewSummary {
  avg_rating: number;
  total_reviews: number;
  rating_distribution: RatingDistribution;
}

/**
 * Complete review fetch response
 */
export interface ReviewFetchResponse {
  center_id: number;
  reviews: ReviewWithUser[];
  pagination: PaginationInfo;
  summary: ReviewSummary;
}

/**
 * Get sort order clause based on sort option
 *
 * @param sort - Sort option
 * @returns Prisma orderBy clause
 */
function getSortOrder(sort: SortOption): Prisma.ReviewOrderByWithRelationInput[] {
  switch (sort) {
    case 'latest':
      return [{ createdAt: 'desc' }];
    case 'helpful':
      return [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];
    case 'rating_desc':
      return [{ rating: 'desc' }, { createdAt: 'desc' }];
    case 'rating_asc':
      return [{ rating: 'asc' }, { createdAt: 'desc' }];
    default:
      return [{ createdAt: 'desc' }];
  }
}

/**
 * Calculate rating distribution from reviews
 *
 * @param centerId - Center ID
 * @returns Rating distribution object
 */
async function calculateRatingDistribution(centerId: number): Promise<RatingDistribution> {
  const distribution = await prisma.review.groupBy({
    by: ['rating'],
    where: {
      centerId: BigInt(centerId),
      status: 'ACTIVE',
    },
    _count: {
      rating: true,
    },
  });

  const result: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  distribution.forEach(item => {
    const rating = item.rating as 1 | 2 | 3 | 4 | 5;
    result[rating] = item._count.rating;
  });

  return result;
}

/**
 * Get user's reaction for a specific review
 *
 * @param reviewId - Review ID
 * @param userId - User ID
 * @returns Reaction type or null
 */
async function getUserReaction(
  reviewId: number,
  userId: number,
): Promise<'HELPFUL' | 'UNHELPFUL' | null> {
  const reaction = await prisma.reviewReaction.findFirst({
    where: {
      reviewId: BigInt(reviewId),
      userId: BigInt(userId),
      reactionType: { in: ['HELPFUL', 'UNHELPFUL'] },
    },
    select: {
      reactionType: true,
    },
  });

  return reaction ? (reaction.reactionType as 'HELPFUL' | 'UNHELPFUL') : null;
}

/**
 * Fetch reviews for a center with pagination and sorting
 *
 * Business Logic:
 * - Only returns reviews with status = 'ACTIVE'
 * - Includes user information (nickname, avatar)
 * - Calculates is_my_review (if userId provided)
 * - Calculates my_reaction (if userId provided)
 * - Returns pagination metadata
 * - Returns rating summary statistics
 *
 * @param centerId - Center ID
 * @param params - Fetch parameters (page, limit, sort, userId)
 * @returns Promise<ReviewFetchResponse> - Reviews with pagination and summary
 * @throws NotFoundError if center does not exist
 */
export async function fetchReviews(
  centerId: number,
  params: FetchReviewsParams,
): Promise<ReviewFetchResponse> {
  const { page, limit, sort, userId } = params;

  // 1. Verify center exists
  const center = await prisma.center.findUnique({
    where: { id: BigInt(centerId) },
    select: { id: true },
  });

  if (!center) {
    throw new NotFoundError(`센터를 찾을 수 없습니다. (ID: ${centerId})`);
  }

  // 2. Count total ACTIVE reviews for pagination
  const totalCount = await prisma.review.count({
    where: {
      centerId: BigInt(centerId),
      status: 'ACTIVE',
    },
  });

  // 3. Calculate pagination
  const totalPages = Math.ceil(totalCount / limit);
  const offset = (page - 1) * limit;

  // 4. Fetch reviews with user information
  const reviews = await prisma.review.findMany({
    where: {
      centerId: BigInt(centerId),
      status: 'ACTIVE',
    },
    select: {
      id: true,
      rating: true,
      title: true,
      content: true,
      visitDate: true,
      helpfulCount: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          nickname: true,
          // Note: avatar_url not in User model yet, defaulting to null
        },
      },
      reactions: {
        select: {
          reactionType: true,
        },
      },
    },
    orderBy: getSortOrder(sort),
    skip: offset,
    take: limit,
  });

  // 5. Calculate is_my_review, my_reaction, and unhelpful_count for each review
  const reviewsWithUserInfo: ReviewWithUser[] = await Promise.all(
    reviews.map(async review => {
      const isMyReview = userId ? Number(review.userId) === userId : false;
      const myReaction = userId ? await getUserReaction(Number(review.id), userId) : null;

      // Calculate unhelpful_count from reactions
      const unhelpfulCount = review.reactions.filter(r => r.reactionType === 'UNHELPFUL').length;

      return {
        id: Number(review.id),
        rating: review.rating,
        title: review.title,
        content: review.content,
        visit_date: review.visitDate,
        helpful_count: review.helpfulCount,
        unhelpful_count: unhelpfulCount,
        created_at: review.createdAt,
        updated_at: review.updatedAt,
        user: {
          id: Number(review.user.id),
          nickname: review.user.nickname,
          avatar_url: null, // TODO: Add avatar_url to User model
        },
        is_my_review: isMyReview,
        my_reaction: myReaction,
      };
    }),
  );

  // 6. Calculate rating statistics
  const [avgRatingResult, ratingDistribution] = await Promise.all([
    prisma.review.aggregate({
      where: {
        centerId: BigInt(centerId),
        status: 'ACTIVE',
      },
      _avg: {
        rating: true,
      },
    }),
    calculateRatingDistribution(centerId),
  ]);

  const avgRating = avgRatingResult._avg.rating || 0;

  // 7. Build response
  const response: ReviewFetchResponse = {
    center_id: centerId,
    reviews: reviewsWithUserInfo,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_count: totalCount,
      limit,
      has_prev: page > 1,
      has_next: page < totalPages,
    },
    summary: {
      avg_rating: Math.round(avgRating * 100) / 100, // Round to 2 decimals
      total_reviews: totalCount,
      rating_distribution: ratingDistribution,
    },
  };

  return response;
}

/**
 * Create review data interface
 */
export interface CreateReviewData {
  rating: number;
  title?: string;
  content: string;
  visit_date?: Date;
}

/**
 * Update review data interface (partial)
 */
export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
  visit_date?: Date;
}

/**
 * Recalculate and update center rating
 *
 * @param centerId - Center ID
 * @returns Updated avg_rating and review_count
 */
async function recalculateCenterRating(
  centerId: number,
): Promise<{ avgRating: number; reviewCount: number }> {
  const [avgRatingResult, reviewCount] = await Promise.all([
    prisma.review.aggregate({
      where: {
        centerId: BigInt(centerId),
        status: 'ACTIVE',
      },
      _avg: {
        rating: true,
      },
    }),
    prisma.review.count({
      where: {
        centerId: BigInt(centerId),
        status: 'ACTIVE',
      },
    }),
  ]);

  const avgRating = avgRatingResult._avg.rating || 0;

  // Update centers table
  await prisma.center.update({
    where: { id: BigInt(centerId) },
    data: {
      avgRating: Math.round(avgRating * 100) / 100,
      reviewCount: reviewCount,
    },
  });

  return {
    avgRating: Math.round(avgRating * 100) / 100,
    reviewCount,
  };
}

/**
 * Create review with rating update
 *
 * Business Logic:
 * - Check for duplicate review (UNIQUE constraint on user_id + center_id + status)
 * - Create review
 * - Recalculate center rating
 * - Transaction for atomicity
 *
 * @param userId - User ID
 * @param centerId - Center ID
 * @param data - Review data
 * @returns Promise<ReviewWithUser> - Created review with user info
 * @throws NotFoundError if center does not exist
 * @throws ConflictError if user already reviewed this center
 */
export async function createReviewWithRatingUpdate(
  userId: number,
  centerId: number,
  data: CreateReviewData,
): Promise<ReviewWithUser> {
  // 1. Verify center exists
  const center = await prisma.center.findUnique({
    where: { id: BigInt(centerId) },
    select: { id: true },
  });

  if (!center) {
    throw new NotFoundError(`센터를 찾을 수 없습니다. (ID: ${centerId})`);
  }

  // 2. Check for duplicate review (ACTIVE status only)
  const existingReview = await prisma.review.findFirst({
    where: {
      userId: BigInt(userId),
      centerId: BigInt(centerId),
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  if (existingReview) {
    throw new ConflictError('이미 이 센터에 리뷰를 작성하셨습니다.', Number(existingReview.id));
  }

  // 3. Create review and update rating in transaction
  const createdReview = await prisma.$transaction(async tx => {
    // Create review
    const review = await tx.review.create({
      data: {
        userId: BigInt(userId),
        centerId: BigInt(centerId),
        rating: data.rating,
        title: data.title || null,
        content: data.content,
        visitDate: data.visit_date || null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        visitDate: true,
        helpfulCount: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    // Recalculate center rating
    await recalculateCenterRating(centerId);

    return review;
  });

  // 4. Format response
  return {
    id: Number(createdReview.id),
    rating: createdReview.rating,
    title: createdReview.title,
    content: createdReview.content,
    visit_date: createdReview.visitDate,
    helpful_count: createdReview.helpfulCount,
    unhelpful_count: 0,
    created_at: createdReview.createdAt,
    updated_at: createdReview.updatedAt,
    user: {
      id: Number(createdReview.user.id),
      nickname: createdReview.user.nickname,
      avatar_url: null,
    },
    is_my_review: true,
    my_reaction: null,
  };
}

/**
 * Update review with rating update
 *
 * Business Logic:
 * - Verify ownership (review.user_id === userId)
 * - Check 7-day edit limit (created_at + 7 days > now)
 * - Update review
 * - Recalculate rating only if rating changed
 * - Transaction for atomicity
 *
 * @param reviewId - Review ID
 * @param userId - User ID
 * @param data - Update data (partial)
 * @returns Promise<ReviewWithUser> - Updated review with user info
 * @throws NotFoundError if review does not exist
 * @throws ForbiddenError if not owner or 7-day limit exceeded
 */
export async function updateReviewWithRatingUpdate(
  reviewId: number,
  userId: number,
  data: UpdateReviewData,
): Promise<ReviewWithUser> {
  // 1. Fetch review and verify ownership
  const existingReview = await prisma.review.findUnique({
    where: { id: BigInt(reviewId) },
    select: {
      id: true,
      userId: true,
      centerId: true,
      rating: true,
      createdAt: true,
      status: true,
    },
  });

  if (!existingReview) {
    throw new NotFoundError(`리뷰를 찾을 수 없습니다. (ID: ${reviewId})`);
  }

  if (Number(existingReview.userId) !== userId) {
    throw new ForbiddenError('본인의 리뷰만 수정할 수 있습니다.');
  }

  if (existingReview.status !== 'ACTIVE') {
    throw new ForbiddenError('삭제된 리뷰는 수정할 수 없습니다.');
  }

  // 2. Check 7-day limit
  const now = new Date();
  const createdAt = new Date(existingReview.createdAt);
  const daysSinceCreation = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceCreation > 7) {
    throw new ForbiddenError('리뷰는 작성 후 7일 이내에만 수정할 수 있습니다.');
  }

  // 3. Update review and rating in transaction
  const updatedReview = await prisma.$transaction(async tx => {
    // Update review
    const review = await tx.review.update({
      where: { id: BigInt(reviewId) },
      data: {
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.title !== undefined && { title: data.title || null }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.visit_date !== undefined && { visitDate: data.visit_date || null }),
      },
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        visitDate: true,
        helpfulCount: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        reactions: {
          select: {
            reactionType: true,
          },
        },
      },
    });

    // Recalculate center rating only if rating changed
    if (data.rating !== undefined && data.rating !== existingReview.rating) {
      await recalculateCenterRating(Number(existingReview.centerId));
    }

    return review;
  });

  // 4. Calculate unhelpful_count
  const unhelpfulCount = updatedReview.reactions.filter(r => r.reactionType === 'UNHELPFUL').length;

  // 5. Format response
  return {
    id: Number(updatedReview.id),
    rating: updatedReview.rating,
    title: updatedReview.title,
    content: updatedReview.content,
    visit_date: updatedReview.visitDate,
    helpful_count: updatedReview.helpfulCount,
    unhelpful_count: unhelpfulCount,
    created_at: updatedReview.createdAt,
    updated_at: updatedReview.updatedAt,
    user: {
      id: Number(updatedReview.user.id),
      nickname: updatedReview.user.nickname,
      avatar_url: null,
    },
    is_my_review: true,
    my_reaction: null,
  };
}

/**
 * Delete review with rating update (Soft Delete)
 *
 * Business Logic:
 * - Verify ownership (review.user_id === userId)
 * - Soft delete (status = 'DELETED', deleted_at = NOW())
 * - Recalculate center rating (exclude DELETED reviews)
 * - Transaction for atomicity
 *
 * @param reviewId - Review ID
 * @param userId - User ID
 * @returns Promise<void>
 * @throws NotFoundError if review does not exist
 * @throws ForbiddenError if not owner
 */
export async function deleteReviewWithRatingUpdate(
  reviewId: number,
  userId: number,
): Promise<void> {
  // 1. Fetch review and verify ownership
  const existingReview = await prisma.review.findUnique({
    where: { id: BigInt(reviewId) },
    select: {
      id: true,
      userId: true,
      centerId: true,
      status: true,
    },
  });

  if (!existingReview) {
    throw new NotFoundError(`리뷰를 찾을 수 없습니다. (ID: ${reviewId})`);
  }

  if (Number(existingReview.userId) !== userId) {
    throw new ForbiddenError('본인의 리뷰만 삭제할 수 있습니다.');
  }

  if (existingReview.status === 'DELETED') {
    throw new NotFoundError('이미 삭제된 리뷰입니다.');
  }

  // 2. Soft delete and update rating in transaction
  await prisma.$transaction(async tx => {
    // Soft delete (no deletedAt field in schema, only status change)
    await tx.review.update({
      where: { id: BigInt(reviewId) },
      data: {
        status: 'DELETED',
      },
    });

    // Recalculate center rating (exclude DELETED reviews)
    await recalculateCenterRating(Number(existingReview.centerId));
  });
}

/**
 * Reaction upsert response
 */
export interface ReactionUpsertResponse {
  review_id: number;
  helpful_count: number;
  unhelpful_count: number;
  my_reaction: 'HELPFUL' | 'UNHELPFUL' | null;
}

/**
 * Upsert review reaction
 *
 * Business Logic:
 * - If reaction is null: DELETE existing reaction
 * - If reaction exists: UPDATE reaction_type
 * - If reaction doesn't exist: INSERT new reaction
 * - Recalculate helpful_count, unhelpful_count
 * - UPSERT pattern in MySQL
 *
 * @param userId - User ID
 * @param reviewId - Review ID
 * @param reactionType - 'HELPFUL' | 'UNHELPFUL' | null
 * @returns Promise<ReactionUpsertResponse> - Updated counts and my_reaction
 * @throws NotFoundError if review does not exist
 */
export async function upsertReaction(
  userId: number,
  reviewId: number,
  reactionType: 'HELPFUL' | 'UNHELPFUL' | null,
): Promise<ReactionUpsertResponse> {
  // 1. Verify review exists
  const review = await prisma.review.findUnique({
    where: { id: BigInt(reviewId) },
    select: { id: true, status: true },
  });

  if (!review || review.status !== 'ACTIVE') {
    throw new NotFoundError(`리뷰를 찾을 수 없습니다. (ID: ${reviewId})`);
  }

  // 2. Handle reaction UPSERT or DELETE
  if (reactionType === null) {
    // Delete existing reaction (delete all reactions for this user and review)
    await prisma.reviewReaction.deleteMany({
      where: {
        userId: BigInt(userId),
        reviewId: BigInt(reviewId),
      },
    });
  } else {
    // Delete existing reactions first (since PK is composite with reactionType)
    await prisma.reviewReaction.deleteMany({
      where: {
        userId: BigInt(userId),
        reviewId: BigInt(reviewId),
      },
    });

    // Then create new reaction
    await prisma.reviewReaction.create({
      data: {
        userId: BigInt(userId),
        reviewId: BigInt(reviewId),
        reactionType: reactionType,
      },
    });
  }

  // 3. Recalculate helpful_count and unhelpful_count
  const [helpfulCount, unhelpfulCount] = await Promise.all([
    prisma.reviewReaction.count({
      where: {
        reviewId: BigInt(reviewId),
        reactionType: 'HELPFUL',
      },
    }),
    prisma.reviewReaction.count({
      where: {
        reviewId: BigInt(reviewId),
        reactionType: 'UNHELPFUL',
      },
    }),
  ]);

  // 4. Update review counts
  await prisma.review.update({
    where: { id: BigInt(reviewId) },
    data: {
      helpfulCount: helpfulCount,
    },
  });

  // 5. Get user's current reaction
  const myReaction = await getUserReaction(reviewId, userId);

  return {
    review_id: reviewId,
    helpful_count: helpfulCount,
    unhelpful_count: unhelpfulCount,
    my_reaction: myReaction,
  };
}

/**
 * Reviews API Client
 *
 * Sprint 4: Review and Rating System
 * HTTP client functions for review-related API endpoints
 */

import type {
  ReviewsResponse,
  Review,
  ReviewFormData,
  ReactionType,
  ReactionResponse,
  SortOption,
} from '@/types/review';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Fetch reviews for a center with pagination and sorting
 * @param centerId - Center ID
 * @param sortBy - Sort option (latest, helpful, rating_desc, rating_asc)
 * @param page - Page number (default 1)
 * @param limit - Items per page (default 10)
 * @returns Promise<ReviewsResponse>
 */
export async function fetchReviews(
  centerId: number,
  sortBy: SortOption = 'latest',
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort: sortBy,
  });

  const response = await fetch(`${API_BASE_URL}/centers/${centerId}/reviews?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new review for a center
 * @param centerId - Center ID
 * @param data - Review form data
 * @param token - JWT authentication token
 * @returns Promise<Review>
 */
export async function createReview(
  centerId: number,
  data: ReviewFormData,
  token: string
): Promise<Review> {
  const response = await fetch(`${API_BASE_URL}/centers/${centerId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create review');
  }

  return response.json();
}

/**
 * Update an existing review
 * @param reviewId - Review ID
 * @param data - Partial review form data
 * @param token - JWT authentication token
 * @returns Promise<Review>
 */
export async function updateReview(
  reviewId: number,
  data: Partial<ReviewFormData>,
  token: string
): Promise<Review> {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update review');
  }

  return response.json();
}

/**
 * Delete a review (soft delete)
 * @param reviewId - Review ID
 * @param token - JWT authentication token
 * @returns Promise<void>
 */
export async function deleteReview(reviewId: number, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete review');
  }
}

/**
 * Add or update a reaction to a review
 * @param reviewId - Review ID
 * @param reaction - Reaction type ('helpful' | 'unhelpful' | null for cancel)
 * @param token - JWT authentication token
 * @returns Promise<ReactionResponse>
 */
export async function addReaction(
  reviewId: number,
  reaction: ReactionType | null,
  token: string
): Promise<ReactionResponse> {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reaction }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add reaction');
  }

  return response.json();
}

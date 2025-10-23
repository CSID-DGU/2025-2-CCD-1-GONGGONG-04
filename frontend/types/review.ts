/**
 * Review Types
 *
 * Sprint 4: Review and Rating System
 * TypeScript type definitions for review-related data structures
 */

/**
 * 리뷰 객체
 */
export interface Review {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  visit_date: string | null;
  helpful_count: number;
  unhelpful_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    nickname: string;
    avatar_url: string | null;
  };
  is_my_review: boolean;
  my_reaction: 'helpful' | 'unhelpful' | null;
}

/**
 * 페이지네이션 정보
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
 * 평점 요약 통계
 */
export interface RatingSummary {
  avg_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
}

/**
 * 리뷰 목록 API 응답
 */
export interface ReviewsResponse {
  reviews: Review[];
  pagination: PaginationInfo;
  summary: RatingSummary;
}

/**
 * 리뷰 작성/수정 폼 데이터
 */
export interface ReviewFormData {
  rating: number;
  title?: string | null;
  content: string;
  visit_date?: string | null;
}

/**
 * 정렬 옵션
 */
export type SortOption = 'latest' | 'helpful' | 'rating_desc' | 'rating_asc';

/**
 * 반응 타입
 */
export type ReactionType = 'helpful' | 'unhelpful';

/**
 * 반응 API 응답
 */
export interface ReactionResponse {
  review_id: number;
  helpful_count: number;
  unhelpful_count: number;
  my_reaction: ReactionType | null;
}

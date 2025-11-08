/**
 * Custom Hooks
 * 커스텀 훅 모음
 */

// Sprint 3: 자가진단 훅
export {
  useTemplates,
  useTemplate,
  useAssessmentResult,
  useAssessmentHistory,
  useLatestAssessment,
  useSubmitAssessment,
  useDeleteAssessment,
  assessmentKeys,
} from './useAssessments';

// Sprint 3: 센터 의료진/프로그램 조회 훅
export { useCenterStaff } from './useCenterStaff';
export { useCenterPrograms } from './useCenterPrograms';

// Sprint 2: 운영 상태 조회 훅
export { useOperatingStatus } from './useOperatingStatus';

// Sprint 2: 추천 시스템 훅
export {
  useRecommendations,
  useCachedRecommendations,
  invalidateRecommendationCache,
  getRecommendationCacheKey,
} from './useRecommendations';

// Sprint 4: 리뷰 훅
export { useReviews } from './useReviews';
export { useReviewMutation } from './useReviewMutation';
export { useReviewReaction } from './useReviewReaction';

// 유틸리티 훅
export { useClipboard } from './useClipboard';
export { useMobile } from './use-mobile';
export { useToast, toast } from './use-toast';

// Sprint 1: Kakao Map SDK 훅
export { useKakaoMapSDK } from './useKakaoMapSDK';
export type { UseKakaoMapSDKReturn } from './useKakaoMapSDK';

// Sprint 2: Geolocation 훅
export { useGeolocation } from './useGeolocation';
export type { UseGeolocationReturn } from './useGeolocation';

// Sprint 2 - Day 9: Address Search 훅
export { useDebounce } from './useDebounce';
export { useAddressSearch } from './useAddressSearch';
export type { UseAddressSearchReturn } from './useAddressSearch';

// Sprint 2 - Day 10: Infinite Scroll 훅
export { useInfiniteScroll } from './useInfiniteScroll';
export type {
  UseInfiniteScrollOptions,
  UseInfiniteScrollReturn,
} from './useInfiniteScroll';

// Sprint 1: 센터 데이터 패칭 훅 (지도용)
export { useCenterData, useCentersQuery } from './useCenterData';
export type { UseCenterDataParams } from './useCenterData';

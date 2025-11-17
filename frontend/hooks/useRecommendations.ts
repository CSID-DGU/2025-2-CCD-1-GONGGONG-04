/**
 * useRecommendations Hook
 * 센터 추천 요청 및 결과 관리 훅
 *
 * Sprint 2 - Task 4.3.2
 *
 * @description
 * TanStack Query useMutation을 사용한 센터 추천 훅
 * - POST 요청으로 추천 계산
 * - 실패 시 자동 재시도 (3회, exponential backoff)
 * - 성공 시 캐시 저장 (5분)
 * - Toast를 통한 에러 표시
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRecommendations,
  getRecommendationsByAssessment,
  getHybridRecommendations,
  type RecommendationRequest,
  type RecommendationResponse,
  type AssessmentRecommendationRequest,
  type AssessmentRecommendationResponse,
  type HybridRecommendationRequest,
  type HybridRecommendationResponse,
  type CenterRecommendation,
  RecommendationApiError,
} from '@/lib/api/recommendations';
import { useToast } from '@/hooks/use-toast';

/**
 * useRecommendations 훅 옵션
 */
export interface UseRecommendationsOptions {
  /**
   * 성공 콜백
   * @param data - 추천 결과 응답
   */
  onSuccess?: (data: RecommendationResponse) => void;

  /**
   * 에러 콜백
   * @param error - 에러 객체
   */
  onError?: (error: RecommendationApiError) => void;

  /**
   * Toast 에러 표시 여부 (기본: true)
   */
  showErrorToast?: boolean;

  /**
   * 재시도 횟수 (기본: 3회)
   */
  retryCount?: number;

  /**
   * 캐시 TTL (밀리초, 기본: 300000ms = 5분)
   */
  cacheTTL?: number;
}

/**
 * 센터 추천 요청 훅
 *
 * @param options - 훅 옵션
 * @returns TanStack Query Mutation 결과
 *
 * @example
 * ```tsx
 * const { mutate, data, isLoading, error } = useRecommendations({
 *   onSuccess: (data) => {
 *     console.log('추천 결과:', data.data.recommendations);
 *   },
 *   onError: (error) => {
 *     console.error('추천 실패:', error.message);
 *   },
 * });
 *
 * // 추천 요청
 * const handleGetRecommendations = () => {
 *   mutate({
 *     latitude: 37.5665,
 *     longitude: 126.9780,
 *     userProfile: {
 *       symptoms: ['우울감', '불안'],
 *       ageGroup: '20대',
 *     },
 *     maxDistance: 10,
 *     limit: 5,
 *   });
 * };
 *
 * // 로딩 상태
 * if (isLoading) return <Skeleton />;
 *
 * // 에러 상태
 * if (error) return <ErrorMessage error={error} />;
 *
 * // 성공 상태
 * if (data) return <RecommendationList recommendations={data.data.recommendations} />;
 * ```
 */
export function useRecommendations(options: UseRecommendationsOptions = {}) {
  const {
    onSuccess,
    onError,
    showErrorToast = true,
    retryCount = 3,
    cacheTTL = 300000, // 5분
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    // Mutation 함수
    mutationFn: (request: RecommendationRequest) => getRecommendations(request),

    // 재시도 설정 (3회, exponential backoff)
    retry: retryCount,
    retryDelay: (attemptIndex) => {
      // 2초 → 4초 → 8초 (최대 10초)
      const delay = Math.min(1000 * 2 ** attemptIndex, 10000);
      return delay;
    },

    // 성공 시 처리
    onSuccess: (data, variables) => {
      // 캐시에 결과 저장 (5분)
      const cacheKey = getRecommendationCacheKey(
        variables.latitude,
        variables.longitude,
        variables.userProfile,
        variables.maxDistance,
        variables.limit
      );

      queryClient.setQueryData(cacheKey, data, {
        updatedAt: Date.now(),
      });

      // 캐시 만료 시간 설정 (TanStack Query v5: cacheTime → gcTime)
      queryClient.setQueryDefaults(cacheKey, {
        staleTime: cacheTTL,
        gcTime: cacheTTL,
      });

      // 커스텀 성공 콜백 실행
      if (onSuccess) {
        onSuccess(data);
      }

      // 성공 Toast (선택적)
      // toast({
      //   title: '추천 완료',
      //   description: `${data.data.totalCount}개의 센터를 추천합니다`,
      // });
    },

    // 에러 시 처리
    onError: (error: Error) => {
      const apiError =
        error instanceof RecommendationApiError
          ? error
          : new RecommendationApiError(error.message, 500, 'UNKNOWN_ERROR');

      // 커스텀 에러 콜백 실행
      if (onError) {
        onError(apiError);
      }

      // Toast 에러 표시
      if (showErrorToast) {
        // 에러 타입에 따라 다른 메시지 표시
        let title = '추천 실패';
        let description = apiError.message;

        if (apiError.code === 'VALIDATION_ERROR') {
          title = '입력값 오류';
          if (apiError.details && apiError.details.length > 0) {
            description = apiError.details.map((d) => d.message).join('\n');
          }
        } else if (apiError.code === 'NOT_FOUND') {
          title = '검색 결과 없음';
          description = '검색 반경을 넓혀서 다시 시도해주세요';
        } else if (apiError.code === 'NETWORK_ERROR') {
          title = '네트워크 오류';
          description = '인터넷 연결을 확인해주세요';
        } else if (apiError.statusCode >= 500) {
          title = '서버 오류';
          description = '잠시 후 다시 시도해주세요';
        }

        toast({
          variant: 'destructive',
          title,
          description,
        });
      }
    },
  });

  return mutation;
}

/**
 * 추천 캐시 키 생성 함수
 *
 * @param latitude - 위도
 * @param longitude - 경도
 * @param userProfile - 사용자 프로필
 * @param maxDistance - 최대 거리
 * @param limit - 최대 추천 개수
 * @returns 쿼리 키
 */
export function getRecommendationCacheKey(
  latitude: number,
  longitude: number,
  userProfile?: RecommendationRequest['userProfile'],
  maxDistance: number = 10,
  limit: number = 5
): [string, Record<string, any>] {
  return [
    'recommendations',
    {
      latitude: parseFloat(latitude.toFixed(4)), // 4자리 반올림 (~11m 정밀도)
      longitude: parseFloat(longitude.toFixed(4)),
      userProfile: userProfile ? sortObjectKeys(userProfile) : null,
      maxDistance,
      limit,
    },
  ];
}

/**
 * 객체 키 정렬 함수 (캐시 키 일관성 보장)
 *
 * @param obj - 정렬할 객체
 * @returns 정렬된 객체
 */
function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys).sort();
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((sorted: any, key) => {
        sorted[key] = sortObjectKeys(obj[key]);
        return sorted;
      }, {});
  }

  return obj;
}

// ============================================
// 추가 유틸리티 훅
// ============================================

/**
 * 추천 결과를 캐시에서 조회하는 훅
 *
 * @param request - 추천 요청 파라미터
 * @returns 캐시된 추천 결과 (없으면 undefined)
 *
 * @example
 * ```tsx
 * const cachedRecommendations = useCachedRecommendations({
 *   latitude: 37.5665,
 *   longitude: 126.9780,
 * });
 *
 * if (cachedRecommendations) {
 *   // 캐시된 결과 사용
 *   return <RecommendationList recommendations={cachedRecommendations.data.recommendations} />;
 * } else {
 *   // 새로운 추천 요청
 *   return <RecommendationForm />;
 * }
 * ```
 */
export function useCachedRecommendations(
  request: RecommendationRequest
): RecommendationResponse | undefined {
  const queryClient = useQueryClient();

  const cacheKey = getRecommendationCacheKey(
    request.latitude,
    request.longitude,
    request.userProfile,
    request.maxDistance,
    request.limit
  );

  return queryClient.getQueryData<RecommendationResponse>(cacheKey);
}

/**
 * 추천 캐시 무효화 함수
 *
 * @description
 * 특정 위치 또는 모든 추천 캐시를 무효화합니다.
 * 센터 정보가 업데이트되었을 때 호출하면 좋습니다.
 *
 * @example
 * ```tsx
 * const queryClient = useQueryClient();
 *
 * // 모든 추천 캐시 무효화
 * invalidateRecommendationCache(queryClient);
 *
 * // 특정 위치의 추천 캐시만 무효화
 * invalidateRecommendationCache(queryClient, { latitude: 37.5665, longitude: 126.9780 });
 * ```
 */
export function invalidateRecommendationCache(
  queryClient: ReturnType<typeof useQueryClient>,
  location?: { latitude: number; longitude: number }
) {
  if (location) {
    // 특정 위치의 캐시만 무효화
    const cacheKey = getRecommendationCacheKey(location.latitude, location.longitude);
    queryClient.invalidateQueries({ queryKey: cacheKey });
  } else {
    // 모든 추천 캐시 무효화
    queryClient.invalidateQueries({ queryKey: ['recommendations'] });
  }
}

// ============================================
// Sprint 3 - Task 3.5.1: Assessment 기반 추천
// ============================================

/**
 * useAssessmentRecommendations 훅 옵션
 */
export interface UseAssessmentRecommendationsOptions {
  /**
   * 성공 콜백
   * @param data - 추천 결과 응답
   */
  onSuccess?: (data: AssessmentRecommendationResponse) => void;

  /**
   * 에러 콜백
   * @param error - 에러 객체
   */
  onError?: (error: RecommendationApiError) => void;

  /**
   * Toast 에러 표시 여부 (기본: true)
   */
  showErrorToast?: boolean;

  /**
   * 재시도 횟수 (기본: 2회)
   */
  retryCount?: number;

  /**
   * 캐시 TTL (밀리초, 기본: 300000ms = 5분)
   */
  cacheTTL?: number;

  /**
   * 쿼리 활성화 여부 (기본: 위치 정보가 있을 때 자동 활성화)
   */
  enabled?: boolean;
}

/**
 * Assessment 기반 센터 추천 요청 훅
 *
 * Sprint 3 - Task 3.5.1
 *
 * @param assessmentId - Assessment ID (필수)
 * @param location - 사용자 위치 정보 (lat, lng 필수, maxDistance, limit 선택)
 * @param authToken - 인증 토큰 (MVP: "user_{id}" 형식)
 * @param options - 훅 옵션
 * @returns TanStack Query 결과
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useAssessmentRecommendations(
 *   123, // assessmentId
 *   { lat: 37.5665, lng: 126.9780, maxDistance: 10, limit: 5 },
 *   'user_456',
 *   {
 *     onSuccess: (data) => {
 *       console.log('추천 결과:', data.data.recommendations);
 *     },
 *     onError: (error) => {
 *       console.error('추천 실패:', error.message);
 *     },
 *   }
 * );
 *
 * // 로딩 상태
 * if (isLoading) return <Skeleton />;
 *
 * // 에러 상태
 * if (error) return <ErrorMessage error={error} />;
 *
 * // 성공 상태
 * if (data) return <RecommendationList recommendations={data.data.recommendations} />;
 * ```
 */
export function useAssessmentRecommendations(
  assessmentId: number,
  location: AssessmentRecommendationRequest | null,
  authToken: string,
  options: UseAssessmentRecommendationsOptions = {}
) {
  const {
    onSuccess,
    onError,
    showErrorToast = true,
    retryCount = 2,
    cacheTTL = 300000, // 5분
    enabled: enabledOption,
  } = options;

  const { toast } = useToast();

  // 위치 정보가 있을 때만 쿼리 실행
  const hasLocation = location !== null && typeof location.lat === 'number' && typeof location.lng === 'number';
  const enabled = enabledOption !== undefined ? enabledOption : hasLocation;

  const query = useQuery({
    // 쿼리 키
    queryKey: getAssessmentRecommendationCacheKey(assessmentId, location),

    // 쿼리 함수
    queryFn: async () => {
      if (!location) {
        throw new RecommendationApiError(
          '위치 정보가 필요합니다',
          400,
          'LOCATION_REQUIRED'
        );
      }

      return getRecommendationsByAssessment(assessmentId, location, authToken);
    },

    // 쿼리 활성화 조건
    enabled,

    // 재시도 설정
    retry: retryCount,
    retryDelay: (attemptIndex) => {
      // 2초 → 4초 (최대 5초)
      const delay = Math.min(1000 * 2 ** attemptIndex, 5000);
      return delay;
    },

    // 캐싱 설정
    staleTime: cacheTTL,
    gcTime: cacheTTL,

    // 성공 시 처리
    onSuccess: (data) => {
      // 커스텀 성공 콜백 실행
      if (onSuccess) {
        onSuccess(data);
      }
    },

    // 에러 시 처리
    onError: (error: Error) => {
      const apiError =
        error instanceof RecommendationApiError
          ? error
          : new RecommendationApiError(error.message, 500, 'UNKNOWN_ERROR');

      // 커스텀 에러 콜백 실행
      if (onError) {
        onError(apiError);
      }

      // Toast 에러 표시
      if (showErrorToast) {
        // 에러 타입에 따라 다른 메시지 표시
        let title = '추천 실패';
        let description = apiError.message;

        if (apiError.code === 'VALIDATION_ERROR') {
          title = '입력값 오류';
          if (apiError.details && apiError.details.length > 0) {
            description = apiError.details.map((d) => d.message).join('\n');
          }
        } else if (apiError.code === 'UNAUTHORIZED') {
          title = '인증 오류';
          description = '로그인이 필요합니다';
        } else if (apiError.code === 'ASSESSMENT_NOT_FOUND') {
          title = '진단 결과 없음';
          description = '진단 결과를 찾을 수 없습니다';
        } else if (apiError.code === 'NETWORK_ERROR') {
          title = '네트워크 오류';
          description = '인터넷 연결을 확인해주세요';
        } else if (apiError.statusCode >= 500) {
          title = '서버 오류';
          description = '잠시 후 다시 시도해주세요';
        }

        toast({
          variant: 'destructive',
          title,
          description,
        });
      }
    },
  });

  return query;
}

/**
 * Assessment 추천 캐시 키 생성 함수
 *
 * @param assessmentId - Assessment ID
 * @param location - 위치 정보
 * @returns 쿼리 키
 */
export function getAssessmentRecommendationCacheKey(
  assessmentId: number,
  location: AssessmentRecommendationRequest | null
): [string, Record<string, any>] {
  if (!location) {
    return ['assessment-recommendations', { assessmentId, location: null }];
  }

  return [
    'assessment-recommendations',
    {
      assessmentId,
      lat: parseFloat(location.lat.toFixed(4)), // 4자리 반올림 (~11m 정밀도)
      lng: parseFloat(location.lng.toFixed(4)),
      maxDistance: location.maxDistance || 10,
      limit: location.limit || 5,
    },
  ];
}

/**
 * Assessment 추천 캐시 무효화 함수
 *
 * @param queryClient - Query Client 인스턴스
 * @param assessmentId - Assessment ID (선택, 지정하지 않으면 모든 assessment 추천 무효화)
 */
export function invalidateAssessmentRecommendationCache(
  queryClient: ReturnType<typeof useQueryClient>,
  assessmentId?: number
) {
  if (assessmentId) {
    // 특정 assessment의 추천 캐시만 무효화
    queryClient.invalidateQueries({
      queryKey: ['assessment-recommendations', { assessmentId }],
    });
  } else {
    // 모든 assessment 추천 캐시 무효화
    queryClient.invalidateQueries({
      queryKey: ['assessment-recommendations'],
    });
  }
}

// ============================================
// Sprint 5 - Phase 2: 하이브리드 추천 시스템
// ============================================

/**
 * useHybridRecommendations 훅 옵션
 */
export interface UseHybridRecommendationsOptions {
  /**
   * 성공 콜백
   * @param data - 하이브리드 추천 결과 응답
   */
  onSuccess?: (data: HybridRecommendationResponse) => void;

  /**
   * 에러 콜백
   * @param error - 에러 객체
   */
  onError?: (error: RecommendationApiError) => void;

  /**
   * Toast 에러 표시 여부 (기본: true)
   */
  showErrorToast?: boolean;

  /**
   * 재시도 횟수 (기본: 2회)
   */
  retryCount?: number;

  /**
   * 캐시 TTL (밀리초, 기본: 300000ms = 5분)
   */
  cacheTTL?: number;

  /**
   * 쿼리 활성화 여부 (기본: 위치 정보가 있을 때 자동 활성화)
   */
  enabled?: boolean;
}

/**
 * 하이브리드 센터 추천 요청 훅
 *
 * Sprint 5 - Phase 2 하이브리드 추천 시스템
 *
 * @description
 * 규칙 기반(70%) + 의미론적 검색(30%)을 결합한 하이브리드 추천 훅
 * - userQuery가 있으면 하이브리드 모드 (규칙 + 임베딩)
 * - userQuery가 없으면 Fallback 모드 (규칙 기반만 사용)
 * - LLM 실패 시 자동 Fallback 처리
 * - TanStack Query 기반 캐싱 (5분)
 *
 * @param request - 하이브리드 추천 요청 파라미터 (latitude, longitude 필수, userQuery 선택)
 * @param options - 훅 옵션
 * @returns TanStack Query 결과
 *
 * @example
 * ```tsx
 * // userQuery 포함 (하이브리드 모드)
 * const { data, isLoading, error, refetch } = useHybridRecommendations(
 *   {
 *     latitude: 37.5665,
 *     longitude: 126.9780,
 *     userQuery: '우울증 상담이 필요해요',
 *     assessmentId: 123,
 *     maxDistance: 10,
 *     limit: 5,
 *   },
 *   {
 *     onSuccess: (data) => {
 *       console.log('알고리즘:', data.data.metadata.algorithm); // 'hybrid'
 *       console.log('Fallback:', data.data.metadata.fallbackMode); // false
 *     },
 *   }
 * );
 *
 * // userQuery 없음 (규칙 기반만 사용)
 * const { data, isLoading } = useHybridRecommendations(
 *   {
 *     latitude: 37.5665,
 *     longitude: 126.9780,
 *     assessmentId: 123,
 *     maxDistance: 10,
 *     limit: 5,
 *   },
 *   {
 *     onSuccess: (data) => {
 *       console.log('Fallback 모드:', data.data.metadata.fallbackMode); // true
 *     },
 *   }
 * );
 *
 * // 로딩 상태
 * if (isLoading) return <Skeleton />;
 *
 * // 에러 상태
 * if (error) return <ErrorMessage error={error} />;
 *
 * // 성공 상태 (메타데이터 확인)
 * if (data) {
 *   const { algorithm, fallbackMode, weights } = data.data.metadata;
 *   return (
 *     <>
 *       <p>알고리즘: {algorithm}</p>
 *       <p>Fallback 모드: {fallbackMode ? '예' : '아니오'}</p>
 *       <p>가중치: 규칙 {weights.rule * 100}% / 임베딩 {weights.embedding * 100}%</p>
 *       <RecommendationList recommendations={data.data.recommendations} />
 *     </>
 *   );
 * }
 * ```
 */
export function useHybridRecommendations(
  request: HybridRecommendationRequest | null,
  options: UseHybridRecommendationsOptions = {}
) {
  const {
    onSuccess,
    onError,
    showErrorToast = true,
    retryCount = 2,
    cacheTTL = 300000, // 5분
    enabled: enabledOption,
  } = options;

  const { toast } = useToast();

  // 위치 정보가 있을 때만 쿼리 실행
  const hasLocation =
    request !== null &&
    typeof request.latitude === 'number' &&
    typeof request.longitude === 'number';
  const enabled = enabledOption !== undefined ? enabledOption : hasLocation;

  const query = useQuery({
    // 쿼리 키
    queryKey: getHybridRecommendationCacheKey(request),

    // 쿼리 함수
    queryFn: async () => {
      if (!request) {
        throw new RecommendationApiError(
          '위치 정보가 필요합니다',
          400,
          'LOCATION_REQUIRED'
        );
      }

      return getHybridRecommendations(request);
    },

    // 쿼리 활성화 조건
    enabled,

    // 재시도 설정
    retry: retryCount,
    retryDelay: (attemptIndex) => {
      // 2초 → 4초 (최대 5초)
      const delay = Math.min(1000 * 2 ** attemptIndex, 5000);
      return delay;
    },

    // 캐싱 설정
    staleTime: cacheTTL,
    gcTime: cacheTTL,

    // 성공 시 처리
    // @ts-ignore - TanStack Query v5 타입 이슈 (onSuccess는 deprecated되었지만 여전히 작동)
    onSuccess: (data: HybridRecommendationResponse) => {
      // 커스텀 성공 콜백 실행
      if (onSuccess) {
        onSuccess(data);
      }
    },

    // 에러 시 처리
    // @ts-ignore - TanStack Query v5 타입 이슈 (onError는 deprecated되었지만 여전히 작동)
    onError: (error: Error) => {
      const apiError =
        error instanceof RecommendationApiError
          ? error
          : new RecommendationApiError(error.message, 500, 'UNKNOWN_ERROR');

      // 커스텀 에러 콜백 실행
      if (onError) {
        onError(apiError);
      }

      // Toast 에러 표시
      if (showErrorToast) {
        // 에러 타입에 따라 다른 메시지 표시
        let title = '추천 실패';
        let description = apiError.message;

        if (apiError.code === 'VALIDATION_ERROR' || apiError.code === 'INVALID_INPUT') {
          title = '입력값 오류';
          if (apiError.details && apiError.details.length > 0) {
            description = apiError.details.map((d) => d.message).join('\n');
          }
        } else if (apiError.code === 'NOT_FOUND') {
          title = '검색 결과 없음';
          description = '검색 반경을 넓혀서 다시 시도해주세요';
        } else if (apiError.code === 'NETWORK_ERROR') {
          title = '네트워크 오류';
          description = '인터넷 연결을 확인해주세요';
        } else if (apiError.statusCode >= 500) {
          title = '서버 오류';
          description = '잠시 후 다시 시도해주세요';
        }

        toast({
          variant: 'destructive',
          title,
          description,
        });
      }
    },
  });

  return query;
}

/**
 * 하이브리드 추천 캐시 키 생성 함수
 *
 * @param request - 하이브리드 추천 요청 파라미터
 * @returns 쿼리 키
 */
export function getHybridRecommendationCacheKey(
  request: HybridRecommendationRequest | null
): [string, Record<string, any>] {
  if (!request) {
    return ['hybrid-recommendations', { request: null }];
  }

  return [
    'hybrid-recommendations',
    {
      latitude: parseFloat(request.latitude.toFixed(4)), // 4자리 반올림 (~11m 정밀도)
      longitude: parseFloat(request.longitude.toFixed(4)),
      userQuery: request.userQuery || null,
      assessmentId: request.assessmentId || null,
      specialties: request.specialties ? sortObjectKeys(request.specialties) : null,
      preferredDays: request.preferredDays ? sortObjectKeys(request.preferredDays) : null,
      preferredTimes: request.preferredTimes ? sortObjectKeys(request.preferredTimes) : null,
      maxDistance: request.maxDistance || 10,
      limit: request.limit || 10,
      weights: request.weights ? sortObjectKeys(request.weights) : null,
    },
  ];
}

/**
 * 하이브리드 추천 캐시 무효화 함수
 *
 * @param queryClient - Query Client 인스턴스
 * @param location - 위치 정보 (선택, 지정하지 않으면 모든 하이브리드 추천 무효화)
 */
export function invalidateHybridRecommendationCache(
  queryClient: ReturnType<typeof useQueryClient>,
  location?: { latitude: number; longitude: number }
) {
  if (location) {
    // 특정 위치의 하이브리드 추천 캐시만 무효화
    queryClient.invalidateQueries({
      queryKey: ['hybrid-recommendations', { latitude: location.latitude, longitude: location.longitude }],
    });
  } else {
    // 모든 하이브리드 추천 캐시 무효화
    queryClient.invalidateQueries({
      queryKey: ['hybrid-recommendations'],
    });
  }
}

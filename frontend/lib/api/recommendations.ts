/**
 * Recommendations API Client
 * 센터 추천 API 클라이언트
 *
 * Sprint 2 - Task 4.3.1
 */

/**
 * API Base URL 결정
 */
const getApiBaseUrl = (): string => {
  const isServer = typeof window === 'undefined';
  const isDevelopment = process.env.NODE_ENV === 'development';

  const envBaseUrl = (
    (isServer ? process.env.API_BASE_URL : undefined) ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL
  );

  if (envBaseUrl) {
    return envBaseUrl.replace(/\/$/, '');
  }

  if (isServer) {
    return isDevelopment
      ? 'http://localhost:8080/api/v1'
      : 'http://backend:8080/api/v1';
  }

  return 'http://localhost:8080/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// ============================================
// 타입 정의
// ============================================

/**
 * 사용자 프로필 (추천 입력용)
 */
export interface UserProfile {
  /** 증상 목록 (최대 10개) */
  symptoms?: string[];

  /** 선호 카테고리 */
  preferredCategory?: string;

  /** 연령대 */
  ageGroup?: '아동' | '청소년' | '20대' | '30대' | '40대' | '50대' | '60대 이상' | '성인';

  /** 온라인 상담 선호 */
  preferOnline?: boolean;

  /** 무료 프로그램 선호 */
  preferFree?: boolean;
}

/**
 * 추천 요청 파라미터
 */
export interface RecommendationRequest {
  /** 사용자 위도 (필수) */
  latitude: number;

  /** 사용자 경도 (필수) */
  longitude: number;

  /** 사용자 프로필 (선택) */
  userProfile?: UserProfile;

  /** 최대 반경 (km, 기본값: 10km) */
  maxDistance?: number;

  /** 최대 추천 개수 (기본값: 5개) */
  limit?: number;

  /** 세션 ID (로그 저장용, 선택) */
  sessionId?: string;

  /** 사용자 ID (로그 저장용, 선택) */
  userId?: string;
}

/**
 * 센터 추천 결과
 */
export interface CenterRecommendation {
  /** 센터 ID */
  centerId: string;

  /** 센터명 */
  centerName: string;

  /** 총점 (0-100) */
  totalScore: number;

  /** 세부 점수 */
  scores: {
    /** 거리 점수 (0-100) */
    distance: number;

    /** 운영 시간 점수 (0-100) */
    operating: number;

    /** 전문성 점수 (0-100) */
    specialty: number;

    /** 프로그램 매칭 점수 (0-100) */
    program: number;
  };

  /** 추천 이유 (상위 3개) */
  reasons: string[];

  /** 센터 기본 정보 */
  center: {
    /** 도로명 주소 */
    roadAddress: string;

    /** 전화번호 */
    phoneNumber: string | null;

    /** 거리 (미터) */
    distance: number;

    /** 도보 시간 (예: "12분", "1시간 5분") */
    walkTime: string;
  };
}

/**
 * 추천 API 응답
 */
export interface RecommendationResponse {
  /** 성공 여부 */
  success: boolean;

  /** 추천 데이터 */
  data: {
    /** 추천 센터 목록 */
    recommendations: CenterRecommendation[];

    /** 총 추천 개수 */
    totalCount: number;

    /** 검색 조건 */
    searchCriteria: {
      latitude: number;
      longitude: number;
      maxDistance: number;
      limit: number;
    };
  };
}

/**
 * API 에러 응답
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      path: string;
      message: string;
    }>;
  };
}

// ============================================
// 에러 클래스
// ============================================

/**
 * 추천 API 에러 클래스
 */
export class RecommendationApiError extends Error {
  statusCode: number;
  code?: string;
  details?: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'RecommendationApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// ============================================
// API 함수
// ============================================

/**
 * 센터 추천 요청
 *
 * @param request - 추천 요청 파라미터
 * @returns 추천 센터 목록
 * @throws RecommendationApiError
 *
 * @example
 * ```typescript
 * const recommendations = await getRecommendations({
 *   latitude: 37.5665,
 *   longitude: 126.9780,
 *   userProfile: {
 *     symptoms: ['우울감', '불안'],
 *     preferredCategory: '개인상담',
 *     ageGroup: '20대',
 *   },
 *   maxDistance: 10,
 *   limit: 5,
 * });
 *
 * console.log(recommendations.data.recommendations);
 * // [{ centerId: '1', centerName: '...', totalScore: 85.5, ... }]
 * ```
 */
export async function getRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  try {
    // URL 구성
    const url = `${API_BASE_URL}/recommendations`;

    // API 요청
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      // 추천은 실시간 데이터이므로 캐싱 비활성화
      cache: 'no-store',
    });

    // 에러 처리
    if (!response.ok) {
      // 400: 입력값 검증 오류
      if (response.status === 400) {
        const errorData: ApiErrorResponse = await response.json();

        throw new RecommendationApiError(
          errorData.error.message || '입력값이 올바르지 않습니다',
          400,
          errorData.error.code,
          errorData.error.details
        );
      }

      // 404: 검색 반경 내 센터 없음
      if (response.status === 404) {
        throw new RecommendationApiError(
          '검색 반경 내에 센터가 없습니다',
          404,
          'NOT_FOUND'
        );
      }

      // 500: 서버 오류
      if (response.status >= 500) {
        throw new RecommendationApiError(
          '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
          response.status,
          'SERVER_ERROR'
        );
      }

      // 기타 에러
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: '알 수 없는 오류가 발생했습니다',
        },
      }));

      throw new RecommendationApiError(
        errorData.error.message,
        response.status,
        errorData.error.code
      );
    }

    // 성공 응답 파싱
    const responseBody: RecommendationResponse = await response.json();

    // 응답 검증
    if (!responseBody.success || !responseBody.data) {
      throw new RecommendationApiError(
        '올바르지 않은 응답 형식입니다',
        500,
        'INVALID_RESPONSE'
      );
    }

    return responseBody;

  } catch (error) {
    // RecommendationApiError는 그대로 throw
    if (error instanceof RecommendationApiError) {
      throw error;
    }

    // 네트워크 에러 처리
    if (error instanceof TypeError) {
      // fetch 실패 (네트워크 연결 오류)
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new RecommendationApiError(
          '네트워크 연결을 확인해주세요',
          0,
          'NETWORK_ERROR'
        );
      }

      // JSON 파싱 오류
      if (error.message.includes('JSON')) {
        throw new RecommendationApiError(
          '서버 응답을 처리할 수 없습니다',
          500,
          'PARSE_ERROR'
        );
      }
    }

    // 기타 예상치 못한 에러
    throw new RecommendationApiError(
      '일시적인 오류가 발생했습니다. 다시 시도해주세요',
      500,
      'UNEXPECTED_ERROR'
    );
  }
}

/**
 * 추천 요청 입력값 검증
 *
 * @param request - 추천 요청 파라미터
 * @returns 검증 결과
 */
export function validateRecommendationRequest(
  request: RecommendationRequest
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 필수 필드 검증
  if (typeof request.latitude !== 'number') {
    errors.push('위도(latitude)는 필수입니다');
  } else if (request.latitude < -90 || request.latitude > 90) {
    errors.push('위도는 -90 ~ 90 사이여야 합니다');
  }

  if (typeof request.longitude !== 'number') {
    errors.push('경도(longitude)는 필수입니다');
  } else if (request.longitude < -180 || request.longitude > 180) {
    errors.push('경도는 -180 ~ 180 사이여야 합니다');
  }

  // 선택 필드 검증
  if (request.maxDistance !== undefined) {
    if (request.maxDistance < 1 || request.maxDistance > 50) {
      errors.push('최대 거리는 1 ~ 50km 사이여야 합니다');
    }
  }

  if (request.limit !== undefined) {
    if (request.limit < 1 || request.limit > 20) {
      errors.push('최대 추천 개수는 1 ~ 20개 사이여야 합니다');
    }
  }

  // UserProfile 검증
  if (request.userProfile) {
    const { symptoms } = request.userProfile;

    if (symptoms && symptoms.length > 10) {
      errors.push('증상은 최대 10개까지 선택할 수 있습니다');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

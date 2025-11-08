/**
 * Kakao Local API Client
 *
 * Sprint 2 - Day 9: 주소 검색
 *
 * @description
 * Kakao Geocoding API를 사용한 주소 검색 기능
 *
 * API 문서:
 * https://developers.kakao.com/docs/latest/ko/local/dev-guide
 */

import type { Address, KakaoAddressResponse } from '@/types/address';

/**
 * Kakao Local API Base URL
 */
const KAKAO_API_BASE_URL = 'https://dapi.kakao.com/v2/local';

/**
 * Get Kakao REST API 키 (런타임에 읽기)
 */
function getKakaoRestKey(): string | undefined {
  return process.env.NEXT_PUBLIC_KAKAO_REST_KEY;
}

/**
 * 주소 검색 API 에러 클래스
 */
export class AddressSearchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AddressSearchError';
  }
}

/**
 * 주소 검색 (Kakao Geocoding API)
 *
 * @param query - 검색할 주소 문자열
 * @returns Promise<Address[]> - 검색된 주소 목록
 *
 * @throws {AddressSearchError} API 키가 없거나 요청 실패 시
 *
 * @example
 * ```typescript
 * const addresses = await searchAddress('서울특별시 강남구 역삼동');
 * console.log(addresses[0].roadAddress); // "서울특별시 강남구 테헤란로 123"
 * ```
 */
export async function searchAddress(query: string): Promise<Address[]> {
  // 빈 쿼리 검증 (API 키 체크 전에 수행)
  if (!query || query.trim().length === 0) {
    return [];
  }

  // API 키 검증 (런타임에 읽기)
  const KAKAO_REST_KEY = getKakaoRestKey();
  if (!KAKAO_REST_KEY || KAKAO_REST_KEY === 'YOUR_KAKAO_REST_API_KEY_HERE') {
    throw new AddressSearchError(
      'Kakao REST API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.',
      undefined,
      undefined
    );
  }

  try {
    // Kakao Local API 호출
    const response = await fetch(
      `${KAKAO_API_BASE_URL}/search/address.json?query=${encodeURIComponent(query.trim())}`,
      {
        method: 'GET',
        headers: {
          Authorization: `KakaoAK ${KAKAO_REST_KEY}`,
        },
      }
    );

    // HTTP 에러 처리
    if (!response.ok) {
      throw new AddressSearchError(
        '주소 검색에 실패했습니다',
        response.status,
        await response.text()
      );
    }

    // 응답 파싱
    const data: KakaoAddressResponse = await response.json();

    // 결과가 없으면 빈 배열 반환
    if (!data.documents || data.documents.length === 0) {
      return [];
    }

    // Kakao 응답 → Address 타입 변환
    return data.documents.map((doc) => ({
      addressName: doc.address_name,
      roadAddress: doc.road_address?.address_name,
      buildingName: doc.road_address?.building_name,
      x: parseFloat(doc.x),
      y: parseFloat(doc.y),
    }));
  } catch (error) {
    // AddressSearchError는 그대로 throw
    if (error instanceof AddressSearchError) {
      throw error;
    }

    // 기타 에러는 AddressSearchError로 래핑
    throw new AddressSearchError(
      '주소 검색 중 오류가 발생했습니다',
      undefined,
      error
    );
  }
}

/**
 * 키워드로 장소 검색 (향후 확장용)
 *
 * @param keyword - 검색할 키워드
 * @param options - 검색 옵션 (좌표, 반경 등)
 * @returns Promise<Place[]> - 검색된 장소 목록
 *
 * @example
 * ```typescript
 * const places = await searchPlaceByKeyword('정신건강복지센터', {
 *   x: 127.0276,
 *   y: 37.4979,
 *   radius: 5000
 * });
 * ```
 */
export async function searchPlaceByKeyword(
  keyword: string,
  options?: {
    x?: number;
    y?: number;
    radius?: number;
  }
): Promise<unknown[]> {
  // TODO: Sprint 추후 구현
  // https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword
  console.warn('searchPlaceByKeyword not implemented yet', keyword, options);
  return [];
}

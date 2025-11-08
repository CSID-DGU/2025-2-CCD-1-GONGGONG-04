/**
 * Address types for Kakao Geocoding API
 *
 * Sprint 2 - Day 9: 주소 검색
 *
 * @description
 * Type definitions for address search functionality using Kakao Local API
 */

/**
 * Address data from Kakao Geocoding API
 */
export interface Address {
  /**
   * 전체 주소 (지번 주소)
   * @example "서울특별시 강남구 역삼동 123-45"
   */
  addressName: string;

  /**
   * 도로명 주소 (선택적)
   * @example "서울특별시 강남구 테헤란로 123"
   */
  roadAddress?: string;

  /**
   * 경도 (longitude)
   * @example 127.0276
   */
  x: number;

  /**
   * 위도 (latitude)
   * @example 37.4979
   */
  y: number;

  /**
   * 건물명 (선택적)
   * @example "역삼빌딩"
   */
  buildingName?: string;
}

/**
 * Kakao Geocoding API response structure
 */
export interface KakaoAddressResponse {
  /**
   * 메타 정보
   */
  meta: {
    /**
     * 검색된 문서 수
     */
    total_count: number;

    /**
     * 현재 페이지에 노출된 문서 수
     */
    pageable_count: number;

    /**
     * 마지막 페이지 여부
     */
    is_end: boolean;
  };

  /**
   * 검색 결과 문서 목록
   */
  documents: Array<{
    /**
     * 전체 지번 주소
     */
    address_name: string;

    /**
     * 도로명 주소 정보
     */
    road_address?: {
      /**
       * 전체 도로명 주소
       */
      address_name: string;

      /**
       * 건물명
       */
      building_name?: string;
    };

    /**
     * X 좌표값 (경도)
     */
    x: string;

    /**
     * Y 좌표값 (위도)
     */
    y: string;
  }>;
}

/**
 * AddressSearchBar 컴포넌트 Props
 */
export interface AddressSearchBarProps {
  /**
   * 주소 선택 시 호출되는 콜백
   * @param address - 선택된 주소 정보
   */
  onSelect: (address: Address) => void;

  /**
   * 초기 검색어 (선택적)
   */
  defaultQuery?: string;

  /**
   * placeholder 텍스트 (선택적)
   * @default "주소를 입력하세요"
   */
  placeholder?: string;

  /**
   * 컴포넌트 비활성화 여부
   */
  disabled?: boolean;

  /**
   * 추가 className
   */
  className?: string;
}

/**
 * SuggestionList 컴포넌트 Props
 */
export interface SuggestionListProps {
  /**
   * 주소 제안 목록
   */
  suggestions: Address[];

  /**
   * 주소 선택 핸들러
   * @param address - 선택된 주소
   */
  onSelect: (address: Address) => void;

  /**
   * 로딩 상태
   */
  isLoading?: boolean;

  /**
   * 에러 메시지
   */
  error?: string;
}

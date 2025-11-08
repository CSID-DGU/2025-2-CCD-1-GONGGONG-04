/**
 * useAddressSearch Hook
 *
 * Sprint 2 - Day 9: 주소 검색
 *
 * @description
 * Kakao Geocoding API를 사용한 주소 검색 훅 (TanStack Query)
 *
 * Features:
 * - 자동 디바운싱 (300ms)
 * - 5분 캐싱 (staleTime)
 * - 2글자 이상일 때만 검색
 * - 로딩/에러 상태 관리
 */

import { useQuery } from '@tanstack/react-query';
import { searchAddress } from '@/lib/api/kakao';
import { useDebounce } from './useDebounce';
import type { Address } from '@/types/address';

/**
 * useAddressSearch 반환 타입
 */
export interface UseAddressSearchReturn {
  /**
   * 검색된 주소 목록
   */
  addresses: Address[];

  /**
   * 로딩 상태
   */
  isLoading: boolean;

  /**
   * 에러 상태
   */
  isError: boolean;

  /**
   * 에러 객체
   */
  error: Error | null;

  /**
   * 데이터가 비어있는지 여부
   */
  isEmpty: boolean;

  /**
   * 검색 가능한 쿼리인지 여부 (2글자 이상)
   */
  isSearchable: boolean;
}

/**
 * 주소 검색 훅
 *
 * @param query - 검색할 주소 문자열
 * @param options - 추가 옵션
 * @param options.debounceMs - 디바운스 시간 (기본값: 300ms)
 * @param options.minQueryLength - 최소 검색 글자 수 (기본값: 2)
 * @param options.enabled - 검색 활성화 여부 (기본값: true)
 * @returns UseAddressSearchReturn - 주소 검색 결과 및 상태
 *
 * @example
 * ```typescript
 * function AddressSearchBar() {
 *   const [query, setQuery] = useState('');
 *   const { addresses, isLoading, isEmpty } = useAddressSearch(query);
 *
 *   return (
 *     <div>
 *       <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *       {isLoading && <p>검색 중...</p>}
 *       {isEmpty && <p>검색 결과가 없습니다</p>}
 *       {addresses.map(addr => <div key={addr.addressName}>{addr.roadAddress}</div>)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAddressSearch(
  query: string,
  options?: {
    debounceMs?: number;
    minQueryLength?: number;
    enabled?: boolean;
  }
): UseAddressSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    enabled = true,
  } = options || {};

  // 디바운스된 쿼리
  const debouncedQuery = useDebounce(query.trim(), debounceMs);

  // 검색 가능 여부
  const isSearchable = debouncedQuery.length >= minQueryLength;

  // TanStack Query 사용
  const {
    data: addresses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['address', debouncedQuery],
    queryFn: () => searchAddress(debouncedQuery),
    enabled: enabled && isSearchable, // 2글자 이상일 때만 검색
    staleTime: 5 * 60 * 1000, // 5분 캐싱
    gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션
    retry: 1, // 실패 시 1번만 재시도
    retryDelay: 1000, // 재시도 간격 1초
  });

  return {
    addresses,
    isLoading,
    isError,
    error: error as Error | null,
    isEmpty: !isLoading && addresses.length === 0 && isSearchable,
    isSearchable,
  };
}

/**
 * useDebounce Hook
 *
 * Sprint 2 - Day 9: 주소 검색
 *
 * @description
 * 입력값을 지연시켜 반환하는 훅 (검색 최적화용)
 *
 * @example
 * ```typescript
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebounce(searchQuery, 300);
 *
 * // debouncedQuery는 300ms 후에만 업데이트됨
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     searchAddress(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 * ```
 */

import { useEffect, useState } from 'react';

/**
 * 값을 디바운스하여 반환
 *
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (밀리초, 기본값: 300ms)
 * @returns 디바운스된 값
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay 후에 값 업데이트
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 클린업: 새로운 value가 들어오면 이전 타이머 취소
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

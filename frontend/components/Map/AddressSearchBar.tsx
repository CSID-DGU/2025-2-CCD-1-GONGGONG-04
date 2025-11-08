/**
 * AddressSearchBar Component
 *
 * Sprint 2 - Day 9: 주소 검색
 *
 * @description
 * Kakao Geocoding API를 사용한 주소 검색바
 *
 * Features:
 * - 자동완성 (debounce 300ms)
 * - 검색 결과 드롭다운
 * - 주소 선택 시 콜백 호출
 * - 로딩/에러 상태 표시
 * - 키보드 네비게이션 (Enter, Esc)
 * - WCAG AA 접근성 준수
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SuggestionList, EmptySuggestionList } from './SuggestionList';
import { useAddressSearch } from '@/hooks/useAddressSearch';
import type { AddressSearchBarProps, Address } from '@/types/address';
import { cn } from '@/lib/utils';

/**
 * 주소 검색바 컴포넌트
 *
 * @example
 * ```tsx
 * <AddressSearchBar
 *   onSelect={(address) => {
 *     // 지도 이동
 *     const center = new kakao.maps.LatLng(address.y, address.x);
 *     map.panTo(center);
 *
 *     // 센터 검색
 *     searchCenters(address.y, address.x);
 *   }}
 *   placeholder="주소를 입력하세요"
 * />
 * ```
 */
export function AddressSearchBar({
  onSelect,
  defaultQuery = '',
  placeholder = '주소를 입력하세요',
  disabled = false,
  className,
}: AddressSearchBarProps) {
  // State
  const [query, setQuery] = useState(defaultQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 주소 검색 (TanStack Query)
  const { addresses, isLoading, isError, error, isEmpty, isSearchable } =
    useAddressSearch(query);

  /**
   * 주소 선택 핸들러
   */
  const handleSelect = (address: Address) => {
    // 부모 컴포넌트에 전달
    onSelect(address);

    // UI 초기화
    setQuery(address.roadAddress || address.addressName);
    setShowSuggestions(false);

    // 입력창 포커스 해제
    inputRef.current?.blur();
  };

  /**
   * 입력값 변경 핸들러
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // 2글자 이상이면 자동완성 표시
    if (value.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  /**
   * 입력창 초기화
   */
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  /**
   * 키보드 이벤트 핸들러
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Esc 키로 자동완성 닫기
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }

    // Enter 키로 첫 번째 결과 선택
    if (e.key === 'Enter' && addresses.length > 0 && showSuggestions) {
      e.preventDefault();
      handleSelect(addresses[0]);
    }
  };

  /**
   * 외부 클릭 시 자동완성 닫기
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * 검색 결과가 있을 때 자동완성 표시
   */
  useEffect(() => {
    if (addresses.length > 0 && query.trim().length >= 2) {
      setShowSuggestions(true);
    }
  }, [addresses, query]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* 검색 입력창 */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
          aria-hidden="true"
        />

        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'pl-10 pr-10 h-11',
            'focus:ring-2 focus:ring-lavender-500 focus:border-lavender-500'
          )}
          aria-label="주소 검색"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="address-suggestions"
        />

        {/* 초기화 버튼 */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-gray-400 hover:text-gray-600',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-lavender-500 rounded-full'
            )}
            aria-label="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 자동완성 결과 */}
      {showSuggestions && isSearchable && (
        <>
          {/* 로딩 또는 결과 표시 */}
          {isLoading || addresses.length > 0 ? (
            <SuggestionList
              suggestions={addresses}
              onSelect={handleSelect}
              isLoading={isLoading}
              error={isError ? error?.message : undefined}
            />
          ) : (
            // 검색 결과 없음
            isEmpty && <EmptySuggestionList />
          )}
        </>
      )}
    </div>
  );
}

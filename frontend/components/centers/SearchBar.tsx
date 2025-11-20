/**
 * SearchBar Component
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 센터 검색을 위한 검색바 컴포넌트
 * - 디바운스 검색 (300ms)
 * - 검색 초기화 버튼
 * - 접근성 준수
 *
 * Features:
 * - Debounced search input (300ms delay)
 * - Clear button when search text exists
 * - Search icon for visual clarity
 * - Accessibility: WCAG AA compliant
 * - Keyboard navigation support
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * SearchBar Props
 */
export interface SearchBarProps {
  /** 검색어 변경 콜백 (디바운스 적용됨) */
  onSearchChange: (query: string) => void;
  /** 초기 검색어 (선택사항) */
  defaultValue?: string;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 디바운스 지연 시간 (밀리초, 기본값: 300ms) */
  debounceDelay?: number;
}

/**
 * SearchBar 컴포넌트
 *
 * @example
 * ```tsx
 * <SearchBar
 *   onSearchChange={(query) => console.log('Search:', query)}
 *   placeholder="센터명, 주소로 검색..."
 * />
 * ```
 */
export function SearchBar({
  onSearchChange,
  defaultValue = '',
  placeholder = '센터명, 주소로 검색...',
  className,
  debounceDelay = 300,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const debouncedValue = useDebounce(inputValue, debounceDelay);

  /**
   * 디바운스된 값이 변경되면 부모 컴포넌트에 알림
   */
  useEffect(() => {
    onSearchChange(debouncedValue);
  }, [debouncedValue, onSearchChange]);

  /**
   * 입력값 변경 핸들러
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  /**
   * 검색어 초기화 핸들러
   */
  const handleClear = () => {
    setInputValue('');
    onSearchChange('');
  };

  /**
   * 초기화 버튼 키보드 핸들러
   */
  const handleClearKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClear();
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* 검색 아이콘 */}
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
        aria-hidden="true"
      />

      {/* 검색 입력 필드 */}
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn(
          'h-11 pl-10',
          inputValue && 'pr-10', // 텍스트가 있을 때 초기화 버튼 공간 확보
        )}
        aria-label="센터 검색"
        aria-describedby="search-description"
      />

      {/* 접근성을 위한 숨김 설명 */}
      <span id="search-description" className="sr-only">
        센터명 또는 주소로 검색하세요. 검색 결과는 자동으로 업데이트됩니다.
      </span>

      {/* 초기화 버튼 (텍스트가 있을 때만 표시) */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          onKeyDown={handleClearKeyDown}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'flex items-center justify-center',
            'w-5 h-5 rounded-full',
            'text-neutral-500 hover:text-neutral-700',
            'hover:bg-neutral-100',
            'transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500',
          )}
          aria-label="검색어 지우기"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

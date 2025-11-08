/**
 * SuggestionList Component
 *
 * Sprint 2 - Day 9: 주소 검색
 *
 * @description
 * 주소 검색 자동완성 결과 리스트
 *
 * Features:
 * - 도로명 주소 우선 표시
 * - 지번 주소 보조 표시
 * - 로딩/에러/빈 상태 처리
 * - 키보드 네비게이션 지원
 * - WCAG AA 접근성 준수
 */

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import type { SuggestionListProps } from '@/types/address';
import { cn } from '@/lib/utils';

/**
 * 주소 제안 리스트 컴포넌트
 *
 * @example
 * ```tsx
 * <SuggestionList
 *   suggestions={addresses}
 *   onSelect={(address) => {
 *     map.panTo(new kakao.maps.LatLng(address.y, address.x));
 *   }}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function SuggestionList({
  suggestions,
  onSelect,
  isLoading,
  error,
}: SuggestionListProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg z-50 mt-1">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-lavender-500" />
          <span className="ml-2 text-sm text-gray-600">주소 검색 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg z-50 mt-1">
        <div className="px-4 py-3 text-sm text-red-600">
          <p className="font-medium">검색 실패</p>
          <p className="mt-1 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  // 결과가 없을 때
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg max-h-64 overflow-y-auto z-50 mt-1"
      role="listbox"
      aria-label="주소 검색 결과"
    >
      {suggestions.map((address, index) => (
        <SuggestionItem
          key={`${address.addressName}-${index}`}
          address={address}
          onSelect={onSelect}
          index={index}
        />
      ))}
    </div>
  );
}

/**
 * 주소 제안 아이템 컴포넌트
 */
interface SuggestionItemProps {
  address: {
    addressName: string;
    roadAddress?: string;
    buildingName?: string;
  };
  onSelect: (address: any) => void;
  index: number;
}

function SuggestionItem({ address, onSelect, index }: SuggestionItemProps) {
  const handleClick = () => {
    onSelect(address);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter 키로 선택
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(address);
    }
  };

  return (
    <div
      role="option"
      aria-selected={false}
      tabIndex={0}
      className={cn(
        'px-4 py-3 cursor-pointer border-b last:border-b-0',
        'hover:bg-lavender-50 focus:bg-lavender-50 focus:outline-none',
        'transition-colors duration-150'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* 도로명 주소 (우선 표시) */}
      {address.roadAddress ? (
        <>
          <p className="font-medium text-gray-900 text-sm">
            {address.roadAddress}
            {address.buildingName && (
              <span className="ml-2 text-xs text-lavender-600">
                ({address.buildingName})
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{address.addressName}</p>
        </>
      ) : (
        // 지번 주소만 있을 때
        <p className="font-medium text-gray-900 text-sm">
          {address.addressName}
        </p>
      )}
    </div>
  );
}

/**
 * 빈 상태 컴포넌트 (검색 결과 없음)
 */
export function EmptySuggestionList() {
  return (
    <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg z-50 mt-1">
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-gray-500">검색 결과가 없습니다</p>
        <p className="mt-1 text-xs text-gray-400">
          다른 주소로 검색해보세요
        </p>
      </div>
    </div>
  );
}

/**
 * CenterListItem Component
 *
 * Sprint 2 - Day 10: 센터 리스트 뷰
 *
 * @description
 * 센터 목록의 개별 카드 컴포넌트
 *
 * Features:
 * - 운영 상태 뱃지
 * - 거리 및 도보 시간 표시
 * - 평점 및 리뷰 개수
 * - 전화번호 (클릭 시 전화 걸기)
 * - 클릭 시 지도 이동
 * - 하이라이트 상태 지원
 */

'use client';

import React from 'react';
import { MapPin, Phone, Star, Clock } from 'lucide-react';
import { OperatingStatusBadge } from './OperatingStatusBadge';
import { RatingDisplay } from './RatingDisplay';
import type { CenterListItemProps } from '@/types/center';
import { cn } from '@/lib/utils';

/**
 * 센터 리스트 아이템 컴포넌트
 *
 * @example
 * ```tsx
 * <CenterListItem
 *   center={centerData}
 *   onSelect={(center) => {
 *     map.panTo(new kakao.maps.LatLng(center.latitude, center.longitude));
 *   }}
 *   isHighlighted={selectedCenterId === centerData.id}
 * />
 * ```
 */
export function CenterListItem({
  center,
  onSelect,
  isHighlighted = false,
  className,
}: CenterListItemProps) {
  /**
   * 카드 클릭 핸들러
   */
  const handleClick = () => {
    if (onSelect) {
      onSelect(center);
    }
  };

  /**
   * 전화번호 클릭 핸들러
   */
  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지

    if (center.phoneNumber) {
      window.location.href = `tel:${center.phoneNumber}`;
    }
  };

  /**
   * 거리 포맷팅 (미터 → km)
   */
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'border-b border-gray-200 p-4 cursor-pointer',
        'hover:bg-lavender-50 transition-colors duration-150',
        'focus:outline-none focus:bg-lavender-50',
        isHighlighted && 'bg-lavender-100 border-l-4 border-l-lavender-500',
        className
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${center.name} 센터 상세 보기`}
    >
      {/* Header: 센터 이름 + 운영 상태 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-base leading-tight flex-1">
          {center.name}
        </h3>
        <OperatingStatusBadge
          status={center.operatingStatus}
          closingTime={center.closingTime}
          nextOpenDate={center.nextOpenDate}
        />
      </div>

      {/* 센터 유형 */}
      <p className="text-sm text-gray-600 mb-2">{center.centerType}</p>

      {/* 거리 + 도보 시간 */}
      <div className="flex items-center gap-1 text-sm text-gray-700 mb-2">
        <MapPin size={14} className="text-lavender-600" />
        <span className="font-medium">{formatDistance(center.distance)}</span>
        <span className="text-gray-500">·</span>
        <Clock size={14} className="text-gray-500" />
        <span>{center.walkTime}</span>
      </div>

      {/* 평점 + 리뷰 개수 */}
      {center.reviewCount > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <RatingDisplay rating={center.avgRating} showValue size="sm" />
          <span className="text-xs text-gray-500">
            ({center.reviewCount.toLocaleString()}개 리뷰)
          </span>
        </div>
      )}

      {/* 주소 */}
      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
        {center.roadAddress}
      </p>

      {/* 전화번호 */}
      {center.phoneNumber && (
        <button
          type="button"
          onClick={handlePhoneClick}
          className={cn(
            'flex items-center gap-1.5 text-sm text-lavender-600',
            'hover:text-lavender-700 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-lavender-500 rounded px-1 -mx-1'
          )}
          aria-label={`${center.name} 전화걸기`}
        >
          <Phone size={14} />
          <span>{center.phoneNumber}</span>
        </button>
      )}
    </div>
  );
}

/**
 * 센터 리스트 아이템 스켈레톤 (로딩 상태)
 */
export function CenterListItemSkeleton() {
  return (
    <div className="border-b border-gray-200 p-4 animate-pulse">
      {/* 이름 + 상태 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="h-5 bg-gray-300 rounded w-2/3"></div>
        <div className="h-6 bg-gray-300 rounded w-16"></div>
      </div>

      {/* 센터 유형 */}
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>

      {/* 거리 정보 */}
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>

      {/* 평점 */}
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>

      {/* 주소 */}
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>

      {/* 전화번호 */}
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}

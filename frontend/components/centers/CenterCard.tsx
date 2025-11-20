/**
 * CenterCard Component
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 센터 정보를 카드 형태로 표시하는 컴포넌트
 * - list variant: 목록 페이지용 (hover 효과, 상세 정보 포함)
 * - map variant: 지도 마커 팝업용 (간결한 정보)
 *
 * Features:
 * - 운영 상태 뱃지 (OperatingStatusBadge 재사용)
 * - 평점 및 리뷰 수 표시
 * - 거리 및 도보 시간
 * - 센터 유형 및 주소
 * - 접근성: WCAG AA 준수
 * - 키보드 네비게이션 지원
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Star } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CenterMarkerData } from '@/lib/api/centers';

/**
 * CenterCard Props
 */
export interface CenterCardProps {
  /** 센터 데이터 */
  center: CenterMarkerData;
  /** 카드 변형 타입 */
  variant?: 'list' | 'map';
  /** 추가 CSS 클래스 */
  className?: string;
  /** 클릭 핸들러 (선택사항, 기본: 상세 페이지 이동) */
  onClick?: (center: CenterMarkerData) => void;
}

/**
 * 운영 상태별 뱃지 설정
 */
const getOperatingStatusBadge = (
  status: CenterMarkerData['operatingStatus']
): { variant: 'operating' | 'closed' | 'outline'; label: string } => {
  switch (status) {
    case 'OPEN':
      return { variant: 'operating', label: '운영 중' };
    case 'CLOSING_SOON':
      return { variant: 'operating', label: '마감 임박' };
    case 'CLOSED':
      return { variant: 'closed', label: '마감' };
    case 'HOLIDAY':
      return { variant: 'closed', label: '휴무' };
    case 'TEMP_CLOSED':
      return { variant: 'closed', label: '임시 휴무' };
    case 'NO_INFO':
    default:
      return { variant: 'outline', label: '정보 없음' };
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

/**
 * 주소 truncate (list variant)
 */
const truncateAddress = (address: string, maxLength: number = 50): string => {
  if (address.length <= maxLength) return address;
  return `${address.slice(0, maxLength)}...`;
};

/**
 * CenterCard 컴포넌트
 *
 * @example
 * ```tsx
 * // List variant (목록 페이지)
 * <CenterCard center={centerData} variant="list" />
 *
 * // Map variant (지도 팝업)
 * <CenterCard
 *   center={centerData}
 *   variant="map"
 *   onClick={(center) => handleMarkerClick(center)}
 * />
 * ```
 */
export function CenterCard({
  center,
  variant = 'list',
  className,
  onClick,
}: CenterCardProps) {
  const router = useRouter();

  const statusBadge = getOperatingStatusBadge(center.operatingStatus);
  const isListVariant = variant === 'list';

  /**
   * 카드 클릭 핸들러
   */
  const handleClick = () => {
    if (onClick) {
      onClick(center);
    } else {
      // 기본 동작: 상세 페이지로 이동
      router.push(`/centers/${center.id}`);
    }
  };

  /**
   * 키보드 이벤트 핸들러
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      className={cn(
        'cursor-pointer transition-all duration-200',
        // List variant: hover effect with translateY
        isListVariant && 'hover:-translate-y-1 hover:shadow-hover',
        // Map variant: no hover transform
        !isListVariant && 'hover:shadow-card',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${center.name} 센터 상세 보기`}
    >
      {/* Header: 센터 이름 + 운영 상태 */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h3 text-neutral-900 font-semibold leading-tight flex-1">
            {center.name}
          </h3>
          <Badge
            variant={statusBadge.variant}
            className="shrink-0"
            aria-label={`운영 상태: ${statusBadge.label}`}
          >
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>

      {/* Content: 센터 정보 */}
      <CardContent className="space-y-3">
        {/* 센터 유형 */}
        <p className="text-small text-neutral-600">{center.centerType}</p>

        {/* 거리 + 도보 시간 */}
        <div className="flex items-center gap-2 text-small text-neutral-700">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-lavender-600" aria-hidden="true" />
            <span className="font-medium">{formatDistance(center.distance)}</span>
          </div>
          <span className="text-neutral-400">·</span>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-neutral-500" aria-hidden="true" />
            <span>{center.walkTime}</span>
          </div>
        </div>

        {/* 평점 + 리뷰 개수 */}
        {center.reviewCount > 0 && (
          <div className="flex items-center gap-2" role="img" aria-label={`별점 ${center.avgRating.toFixed(1)}점, ${center.reviewCount}개 리뷰`}>
            <Star
              size={16}
              className="fill-yellow-400 text-yellow-400"
              aria-hidden="true"
            />
            <span className="text-small font-medium text-neutral-900">
              {center.avgRating.toFixed(1)}
            </span>
            <span className="text-small text-neutral-500">
              ({center.reviewCount.toLocaleString()}개 리뷰)
            </span>
          </div>
        )}

        {/* 주소 (list variant에만 표시) */}
        {isListVariant && (
          <p className="text-small text-neutral-600 line-clamp-1">
            {truncateAddress(center.roadAddress)}
          </p>
        )}

        {/* 전화번호 (map variant에만 표시) */}
        {!isListVariant && center.phoneNumber && (
          <p className="text-small text-neutral-600">{center.phoneNumber}</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * CenterCard 스켈레톤 (로딩 상태)
 *
 * @example
 * ```tsx
 * <CenterCardSkeleton variant="list" />
 * ```
 */
export function CenterCardSkeleton({
  variant = 'list',
  className,
}: {
  variant?: 'list' | 'map';
  className?: string;
}) {
  const isListVariant = variant === 'list';

  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* 센터 이름 스켈레톤 */}
          <div className="h-6 bg-neutral-200 rounded w-2/3"></div>
          {/* 상태 뱃지 스켈레톤 */}
          <div className="h-6 bg-neutral-200 rounded w-16"></div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 센터 유형 */}
        <div className="h-4 bg-neutral-200 rounded w-1/3"></div>

        {/* 거리 정보 */}
        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>

        {/* 평점 */}
        <div className="h-4 bg-neutral-200 rounded w-1/3"></div>

        {/* 주소 (list variant) */}
        {isListVariant && <div className="h-4 bg-neutral-200 rounded w-full"></div>}

        {/* 전화번호 (map variant) */}
        {!isListVariant && <div className="h-4 bg-neutral-200 rounded w-2/3"></div>}
      </CardContent>
    </Card>
  );
}

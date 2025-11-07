/**
 * MarkerInfoPopup 컴포넌트
 *
 * 지도 마커 클릭 시 표시되는 센터 정보 팝업 카드
 * - 센터 기본 정보 (이름, 주소, 전화번호)
 * - 운영 상태 배지
 * - 평점 및 리뷰 수
 * - 거리 및 도보 시간
 * - 상세보기/길찾기 액션 버튼
 *
 * @component
 */

'use client';

import * as React from 'react';
import { X, MapPin, Phone, Navigation } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OperatingStatusBadge } from './OperatingStatusBadge';
import { RatingDisplay } from './RatingDisplay';
import { CenterMarkerData } from '@/lib/api/centers';
import { cn } from '@/lib/utils';

/**
 * MarkerInfoPopup Props
 */
export interface MarkerInfoPopupProps {
  /** 센터 데이터 */
  center: CenterMarkerData;
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 상세보기 핸들러 */
  onNavigate: (centerId: number) => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 거리를 포맷팅합니다
 * @param meters - 미터 단위 거리
 * @returns 포맷팅된 거리 문자열 (예: "750m", "1.2km")
 */
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  if (meters < 10000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.round(meters / 1000)}km`;
}

/**
 * MarkerInfoPopup 컴포넌트
 *
 * @example
 * ```tsx
 * <MarkerInfoPopup
 *   center={centerData}
 *   onClose={() => setSelectedCenter(null)}
 *   onNavigate={(id) => router.push(`/centers/${id}`)}
 * />
 * ```
 */
export function MarkerInfoPopup({
  center,
  onClose,
  onNavigate,
  className,
}: MarkerInfoPopupProps) {
  /**
   * 상세보기 버튼 클릭 핸들러
   */
  const handleNavigate = () => {
    onNavigate(center.id);
  };

  /**
   * 전화걸기 핸들러
   */
  const handleCall = () => {
    if (center.phoneNumber) {
      window.location.href = `tel:${center.phoneNumber.replace(/-/g, '')}`;
    }
  };

  /**
   * 길찾기 핸들러 (향후 구현)
   */
  const handleDirections = () => {
    // TODO: 카카오맵 길찾기 연동
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://maps.apple.com/?daddr=${center.latitude},${center.longitude}`
      : `https://map.kakao.com/link/to/${center.name},${center.latitude},${center.longitude}`;

    window.open(url, '_blank');
  };

  return (
    <Card
      className={cn(
        'w-full max-w-sm shadow-lg border-neutral-200',
        'sm:max-w-md',
        className
      )}
      role="dialog"
      aria-labelledby="popup-title"
      aria-describedby="popup-description"
    >
      {/* 헤더: 센터명 + 닫기 버튼 */}
      <CardHeader className="relative pb-3">
        <h3
          id="popup-title"
          className="text-h3 font-semibold text-neutral-900 pr-8"
        >
          {center.name}
        </h3>

        {/* 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8"
          aria-label="팝업 닫기"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardHeader>

      {/* 본문: 센터 정보 */}
      <CardContent className="space-y-3" id="popup-description">
        {/* 운영 상태 */}
        <div>
          <OperatingStatusBadge
            status={center.operatingStatus}
            closingTime={center.closingTime}
            nextOpenDate={center.nextOpenDate}
          />
        </div>

        {/* 평점 및 리뷰 */}
        <div>
          <RatingDisplay
            rating={center.avgRating}
            reviewCount={center.reviewCount}
            size="md"
          />
        </div>

        {/* 거리 및 도보 시간 */}
        <div className="flex items-center gap-1.5 text-small text-neutral-600">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          <span>
            {formatDistance(center.distance)} · 도보 {center.walkTime}
          </span>
        </div>

        {/* 주소 */}
        <div className="text-small text-neutral-700">
          <p>{center.roadAddress}</p>
        </div>

        {/* 전화번호 (있는 경우만 표시) */}
        {center.phoneNumber && (
          <button
            onClick={handleCall}
            className="flex items-center gap-1.5 text-small text-lavender-500 hover:text-lavender-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500 focus-visible:ring-offset-2 rounded"
            aria-label={`전화하기: ${center.phoneNumber}`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>{center.phoneNumber}</span>
          </button>
        )}
      </CardContent>

      {/* 푸터: 액션 버튼 */}
      <CardFooter className="flex gap-2 pt-4">
        {/* 상세보기 버튼 */}
        <Button
          variant="default"
          onClick={handleNavigate}
          className="flex-1"
          aria-label={`${center.name} 상세 정보 보기`}
        >
          상세보기
        </Button>

        {/* 길찾기 버튼 */}
        <Button
          variant="outline"
          onClick={handleDirections}
          className="flex-1 gap-1.5"
          aria-label={`${center.name} 길찾기`}
        >
          <Navigation className="h-4 w-4" aria-hidden="true" />
          길찾기
        </Button>
      </CardFooter>
    </Card>
  );
}

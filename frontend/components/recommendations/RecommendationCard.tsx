'use client';

/**
 * RecommendationCard Component
 *
 * Sprint 2 - Task 4.3.3
 * 추천 센터 카드 컴포넌트
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
  Navigation,
  Briefcase,
  Calendar,
  Heart,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import type { CenterRecommendation } from '@/lib/api/recommendations';

export interface RecommendationCardProps {
  /** 추천 센터 데이터 */
  recommendation: CenterRecommendation;

  /** 순위 (1부터 시작) */
  rank: number;

  /** 클릭 이벤트 핸들러 */
  onClick?: (centerId: string) => void;

  /** 즐겨찾기 추가 핸들러 */
  onFavoriteClick?: (centerId: string) => void;

  /** 즐겨찾기 여부 */
  isFavorite?: boolean;
}

/**
 * 점수에 따른 배지 색상 및 레이블
 */
function getScoreBadge(score: number): { variant: 'lavender' | 'success' | 'warning' | 'secondary'; label: string } {
  if (score >= 90) return { variant: 'lavender', label: '최우수' };
  if (score >= 80) return { variant: 'success', label: '우수' };
  if (score >= 70) return { variant: 'warning', label: '양호' };
  return { variant: 'secondary', label: '보통' };
}

/**
 * 거리 포맷 (미터 → km/m)
 */
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.round(meters)}m`;
}

/**
 * 전화번호 포맷 (하이픈 추가)
 */
function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '번호 없음';

  // 이미 하이픈이 있으면 그대로 반환
  if (phone.includes('-')) return phone;

  // 서울 지역번호: 02-XXXX-XXXX
  if (phone.startsWith('02')) {
    if (phone.length === 9) {
      return `${phone.slice(0, 2)}-${phone.slice(2, 5)}-${phone.slice(5)}`;
    }
    if (phone.length === 10) {
      return `${phone.slice(0, 2)}-${phone.slice(2, 6)}-${phone.slice(6)}`;
    }
  }

  // 기타 지역번호: 0XX-XXXX-XXXX 또는 0XX-XXX-XXXX
  if (phone.length === 10) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  }

  return phone;
}

export function RecommendationCard({
  recommendation,
  rank,
  onClick,
  onFavoriteClick,
  isFavorite = false,
}: RecommendationCardProps) {
  const [isScoreOpen, setIsScoreOpen] = useState(false);

  const scoreBadge = getScoreBadge(recommendation.totalScore);

  const handleCardClick = () => {
    if (onClick) {
      onClick(recommendation.centerId);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteClick) {
      onFavoriteClick(recommendation.centerId);
    }
  };

  return (
    <Card
      className="rounded-card shadow-soft hover:shadow-card transition-all cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        {/* 순위 및 총점 */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            {/* 순위 배지 */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lavender-100 text-lavender-700 font-bold text-h3">
              {rank}
            </div>

            {/* 센터명 */}
            <div>
              <h3 className="text-h3 font-bold text-neutral-900 line-clamp-1">
                {recommendation.centerName}
              </h3>
              <p className="text-caption text-neutral-500 mt-0.5">
                {formatDistance(recommendation.center.distance)} • {recommendation.center.walkTime}
              </p>
            </div>
          </div>

          {/* 총점 배지 */}
          <Badge variant={scoreBadge.variant} className="text-body-sm font-semibold shrink-0">
            {recommendation.totalScore}점 • {scoreBadge.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 추천 이유 */}
        <div className="space-y-2">
          <h4 className="text-body-sm font-semibold text-neutral-700 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-lavender-600" />
            추천 이유
          </h4>
          <ul className="space-y-1.5 pl-5 list-disc marker:text-lavender-600">
            {recommendation.reasons.map((reason, index) => (
              <li key={index} className="text-body text-neutral-600">
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* 센터 정보 */}
        <div className="space-y-2">
          {/* 주소 */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
            <p className="text-body text-neutral-600 line-clamp-2">
              {recommendation.center.roadAddress}
            </p>
          </div>

          {/* 전화번호 */}
          {recommendation.center.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-neutral-500 shrink-0" />
              <a
                href={`tel:${recommendation.center.phoneNumber}`}
                onClick={(e) => e.stopPropagation()}
                className="text-body text-lavender-600 hover:text-lavender-700 hover:underline"
              >
                {formatPhoneNumber(recommendation.center.phoneNumber)}
              </a>
            </div>
          )}
        </div>

        {/* 세부 점수 (접을 수 있음) */}
        <Collapsible open={isScoreOpen} onOpenChange={setIsScoreOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-body-sm text-neutral-600 hover:text-neutral-900"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="flex items-center gap-1.5">
                <ChevronDown className={`h-4 w-4 transition-transform ${isScoreOpen ? 'rotate-180' : ''}`} />
                세부 점수 보기
              </span>
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3 space-y-2">
            {/* 거리 점수 */}
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-neutral-600 flex items-center gap-1.5">
                <Navigation className="h-4 w-4 text-lavender-600" />
                거리
              </span>
              <span className="text-body-sm font-semibold text-neutral-900">
                {recommendation.scores.distance}점
              </span>
            </div>

            {/* 운영 시간 점수 */}
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-neutral-600 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-lavender-600" />
                운영 시간
              </span>
              <span className="text-body-sm font-semibold text-neutral-900">
                {recommendation.scores.operating}점
              </span>
            </div>

            {/* 전문성 점수 */}
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-neutral-600 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-lavender-600" />
                전문성
              </span>
              <span className="text-body-sm font-semibold text-neutral-900">
                {recommendation.scores.specialty}점
              </span>
            </div>

            {/* 프로그램 점수 */}
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-neutral-600 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-lavender-600" />
                프로그램
              </span>
              <span className="text-body-sm font-semibold text-neutral-900">
                {recommendation.scores.program}점
              </span>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter className="pt-4 gap-2">
        {/* 상세 정보 버튼 */}
        <Button
          asChild
          variant="lavender"
          size="default"
          className="flex-1"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <Link href={`/centers/${recommendation.centerId}`}>
            상세 정보 보기
          </Link>
        </Button>

        {/* 즐겨찾기 버튼 */}
        <Button
          variant="outline"
          size="icon"
          className={isFavorite ? 'text-lavender-600 border-lavender-600' : ''}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가'}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </CardFooter>
    </Card>
  );
}

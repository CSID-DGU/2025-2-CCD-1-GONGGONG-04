/**
 * AssessmentRecommendationHeader Component
 *
 * Sprint 3 - Task 3.5.1: 진단 기반 추천 페이지
 *
 * 진단 기반 추천 헤더 컴포넌트
 * - 진단 정보 표시 (심각도, 총점, 일시)
 * - 추천 이유 표시
 * - 위치 변경 버튼
 */

'use client';

import React from 'react';
import { Calendar, MapPin, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import type { SeverityCode, UrgencyLevel } from '@/lib/api/assessments';

export interface AssessmentRecommendationHeaderProps {
  /** 진단 정보 */
  assessment: {
    /** 진단 ID */
    assessmentId: number;

    /** 총점 */
    totalScore: number;

    /** 심각도 코드 */
    severityCode: SeverityCode;

    /** 완료 일시 */
    completedAt: string;

    /** 결과 해석 */
    interpretation: {
      title: string;
      description: string;
      urgency: UrgencyLevel;
    };
  };

  /** 검색된 위치 정보 */
  location?: {
    lat: number;
    lng: number;
  } | null;

  /** 위치 변경 버튼 핸들러 */
  onChangeLocation: () => void;

  /** 추천 센터 개수 */
  recommendationCount?: number;
}

/**
 * 심각도별 배지 설정
 */
function getSeverityBadge(severity: SeverityCode): {
  variant: 'success' | 'warning' | 'destructive';
  label: string;
  icon: React.ReactNode;
} {
  switch (severity) {
    case 'LOW':
      return {
        variant: 'success',
        label: '낮음',
        icon: <CheckCircle className="h-4 w-4" />,
      };
    case 'MID':
      return {
        variant: 'warning',
        label: '중등도',
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    case 'HIGH':
      return {
        variant: 'destructive',
        label: '높음',
        icon: <AlertCircle className="h-4 w-4" />,
      };
  }
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

export function AssessmentRecommendationHeader({
  assessment,
  location,
  onChangeLocation,
  recommendationCount = 0,
}: AssessmentRecommendationHeaderProps) {
  const severityBadge = getSeverityBadge(assessment.severityCode);

  return (
    <Card className="rounded-card shadow-soft border-lavender-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-h2 font-bold text-neutral-900">
              진단 기반 맞춤 센터 추천
            </h1>
            <p className="text-body text-neutral-600">
              자가진단 결과를 바탕으로 가까운 정신건강 센터를 추천해드립니다
            </p>
          </div>

          {/* 위치 변경 버튼 */}
          <Button
            variant="outline"
            size="default"
            onClick={onChangeLocation}
            className="shrink-0"
          >
            <MapPin className="h-4 w-4 mr-2" />
            위치 변경
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 진단 정보 */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* 심각도 배지 */}
          <Badge
            variant={severityBadge.variant}
            className="text-body-sm font-semibold py-1.5 px-3"
          >
            {severityBadge.icon}
            <span className="ml-1.5">심각도: {severityBadge.label}</span>
          </Badge>

          {/* 총점 */}
          <div className="flex items-center gap-1.5 text-body-sm text-neutral-600">
            <span className="font-medium">총점</span>
            <span className="font-bold text-neutral-900">{assessment.totalScore}점</span>
          </div>

          {/* 진단 일시 */}
          <div className="flex items-center gap-1.5 text-body-sm text-neutral-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(assessment.completedAt)}</span>
          </div>
        </div>

        {/* 결과 해석 */}
        <div className="rounded-lg bg-lavender-50 p-4 space-y-2">
          <h2 className="text-body font-semibold text-lavender-900">
            {assessment.interpretation.title}
          </h2>
          <p className="text-body-sm text-lavender-700 leading-relaxed">
            {assessment.interpretation.description}
          </p>
        </div>

        {/* 추천 결과 요약 */}
        {location && recommendationCount > 0 && (
          <div className="flex items-center gap-2 text-body-sm text-neutral-600">
            <MapPin className="h-4 w-4 text-lavender-600" />
            <span>
              현재 위치 기준 <span className="font-bold text-neutral-900">{recommendationCount}개</span>의
              센터를 찾았습니다
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

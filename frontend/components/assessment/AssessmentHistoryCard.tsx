/**
 * AssessmentHistoryCard Component
 *
 * Sprint 3 - Task 3.5.2: 진단 이력 페이지
 *
 * 진단 이력 카드 컴포넌트
 * - 진단 일시, 총점, 심각도 배지 표시
 * - "결과 다시 보기" 버튼
 * - "추천 보기" 버튼
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, FileText, TrendingUp, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SeverityCode } from '@/lib/api/assessments';

export interface AssessmentHistoryCardProps {
  /** 진단 ID */
  assessmentId: number;

  /** 템플릿명 */
  templateName: string;

  /** 총점 */
  totalScore: number;

  /** 심각도 코드 */
  severityCode: SeverityCode;

  /** 완료 일시 */
  completedAt: string;

  /** 카드 클릭 핸들러 (선택사항) */
  onClick?: () => void;
}

/**
 * 심각도별 배지 설정
 */
function getSeverityBadge(severity: SeverityCode): {
  variant: 'success' | 'warning' | 'destructive';
  label: string;
  color: string;
} {
  switch (severity) {
    case 'LOW':
      return {
        variant: 'success',
        label: '낮음',
        color: 'text-green-700',
      };
    case 'MID':
      return {
        variant: 'warning',
        label: '중등도',
        color: 'text-yellow-700',
      };
    case 'HIGH':
      return {
        variant: 'destructive',
        label: '높음',
        color: 'text-red-700',
      };
  }
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const formattedDate = `${year}.${month}.${day} ${hours}:${minutes}`;

  // 오늘이면 "오늘" 표시
  if (diffDays === 0) {
    return `오늘 ${hours}:${minutes}`;
  }

  // 어제면 "어제" 표시
  if (diffDays === 1) {
    return `어제 ${hours}:${minutes}`;
  }

  // 7일 이내면 "N일 전" 표시
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }

  return formattedDate;
}

/**
 * 총점에 따른 진행률 색상
 */
function getScoreColor(score: number, maxScore: number = 40): string {
  const percentage = (score / maxScore) * 100;

  if (percentage <= 37.5) {
    // LOW (0-15점, 40점 만점 기준)
    return 'bg-green-500';
  } else if (percentage <= 72.5) {
    // MID (16-29점)
    return 'bg-yellow-500';
  } else {
    // HIGH (30-40점)
    return 'bg-red-500';
  }
}

export function AssessmentHistoryCard({
  assessmentId,
  templateName,
  totalScore,
  severityCode,
  completedAt,
  onClick,
}: AssessmentHistoryCardProps) {
  const severityBadge = getSeverityBadge(severityCode);
  const formattedDate = formatDate(completedAt);
  const scorePercentage = (totalScore / 40) * 100; // K-10 기준 40점 만점

  return (
    <Card
      className="rounded-card shadow-soft hover:shadow-card transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          {/* 템플릿명 */}
          <div className="flex-1">
            <h3 className="text-h3 font-bold text-neutral-900 line-clamp-1">
              {templateName}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <Calendar className="h-4 w-4 text-neutral-500" />
              <p className="text-body-sm text-neutral-600">{formattedDate}</p>
            </div>
          </div>

          {/* 심각도 배지 */}
          <Badge variant={severityBadge.variant} className="text-body-sm font-semibold shrink-0">
            {severityBadge.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* 총점 및 진행률 바 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-body-sm font-medium text-neutral-700 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              총점
            </span>
            <span className={`text-h3 font-bold ${severityBadge.color}`}>
              {totalScore}점
            </span>
          </div>

          {/* 진행률 바 */}
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${getScoreColor(totalScore)} transition-all rounded-full`}
              style={{ width: `${scorePercentage}%` }}
              role="progressbar"
              aria-valuenow={totalScore}
              aria-valuemin={0}
              aria-valuemax={40}
              aria-label="진단 점수"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 gap-2 flex-col sm:flex-row">
        {/* 결과 다시 보기 버튼 */}
        <Button
          asChild
          variant="outline"
          size="default"
          className="w-full sm:flex-1"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <Link href={`/assessment/result/${assessmentId}`}>
            <FileText className="h-4 w-4 mr-2" />
            결과 다시 보기
          </Link>
        </Button>

        {/* 추천 보기 버튼 */}
        <Button
          asChild
          variant="lavender"
          size="default"
          className="w-full sm:flex-1"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <Link href={`/recommendations/from-assessment/${assessmentId}`}>
            <MapPin className="h-4 w-4 mr-2" />
            추천 보기
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

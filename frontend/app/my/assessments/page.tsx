/**
 * Assessment History Page
 *
 * Sprint 3 - Task 3.5.2: 진단 이력 페이지
 *
 * 사용자의 자가진단 이력을 조회하고 표시하는 페이지
 * - 진단 이력 목록 표시
 * - 페이지네이션
 * - 빈 상태 처리
 * - 로딩 및 에러 상태 처리
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AssessmentHistoryCard } from '@/components/assessment/AssessmentHistoryCard';
import { EmptyHistory } from '@/components/assessment/EmptyHistory';
import { useAssessmentHistory } from '@/hooks/useAssessments';
import type { SeverityCode } from '@/lib/api/assessments';

/**
 * 진단 이력 카드 스켈레톤
 */
function AssessmentHistoryCardSkeleton() {
  return (
    <div className="rounded-card shadow-soft border border-neutral-200 p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

/**
 * 진단 이력 목록 스켈레톤
 */
function HistoryListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <AssessmentHistoryCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function AssessmentHistoryPage() {
  const router = useRouter();

  // 상태 관리
  const [page, setPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState<SeverityCode | 'ALL'>('ALL');
  const limit = 10;

  // 진단 이력 조회
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useAssessmentHistory(
    {
      page,
      limit,
      ...(severityFilter !== 'ALL' && { severityCode: severityFilter }),
    },
    {
      // 로그인되지 않은 경우 쿼리 비활성화할 수 있음
      enabled: true,
    }
  );

  /**
   * 뒤로 가기
   */
  const handleGoBack = () => {
    router.back();
  };

  /**
   * 심각도 필터 변경
   */
  const handleSeverityFilterChange = (value: string) => {
    setSeverityFilter(value as SeverityCode | 'ALL');
    setPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  /**
   * 페이지 변경
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * 로딩 중
   */
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* 헤더 스켈레톤 */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-32" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* 목록 스켈레톤 */}
          <HistoryListSkeleton />
        </div>
      </div>
    );
  }

  /**
   * 에러 발생
   */
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* 뒤로 가기 버튼 */}
          <Button variant="ghost" onClick={handleGoBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            뒤로 가기
          </Button>

          {/* 에러 메시지 */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>진단 이력을 불러올 수 없습니다</AlertTitle>
            <AlertDescription>
              {error.message || '알 수 없는 오류가 발생했습니다'}
            </AlertDescription>
          </Alert>

          <Button variant="lavender" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  /**
   * 데이터 없음
   */
  const assessments = historyData?.assessments || [];
  const hasAssessments = assessments.length > 0;
  const totalPages = historyData?.totalPages || 0;
  const summary = historyData?.summary;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* 뒤로 가기 버튼 */}
        <Button variant="ghost" onClick={handleGoBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          뒤로 가기
        </Button>

        {/* 헤더 */}
        <div className="space-y-4">
          <div>
            <h1 className="text-h1 font-bold text-neutral-900">
              진단 이력
            </h1>
            <p className="text-body text-neutral-600 mt-2">
              나의 자가진단 기록을 확인하고 관리할 수 있습니다
            </p>
          </div>

          {/* 요약 통계 */}
          {summary && summary.total > 0 && (
            <div className="flex gap-4 p-4 bg-lavender-50 rounded-lg border border-lavender-200">
              <div className="flex items-center gap-2">
                <span className="text-body-sm font-medium text-lavender-700">전체</span>
                <span className="text-h3 font-bold text-lavender-900">{summary.total}</span>
              </div>
              <div className="h-6 w-px bg-lavender-200" />
              <div className="flex items-center gap-2">
                <span className="text-body-sm font-medium text-green-700">낮음</span>
                <span className="text-h3 font-bold text-green-900">{summary.bySeverity.LOW}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-body-sm font-medium text-yellow-700">중등도</span>
                <span className="text-h3 font-bold text-yellow-900">{summary.bySeverity.MID}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-body-sm font-medium text-red-700">높음</span>
                <span className="text-h3 font-bold text-red-900">{summary.bySeverity.HIGH}</span>
              </div>
            </div>
          )}

          {/* 필터 */}
          {hasAssessments && (
            <div className="flex items-center justify-between">
              <p className="text-body-sm text-neutral-600">
                총 <span className="font-bold text-neutral-900">{historyData.total}</span>개의 진단 기록
              </p>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-500" />
                <Select value={severityFilter} onValueChange={handleSeverityFilterChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="전체 보기" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체 보기</SelectItem>
                    <SelectItem value="LOW">낮음</SelectItem>
                    <SelectItem value="MID">중등도</SelectItem>
                    <SelectItem value="HIGH">높음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* 진단 이력 목록 또는 빈 상태 */}
        {hasAssessments ? (
          <div className="space-y-4">
            {/* 진단 카드 목록 */}
            <div className="grid grid-cols-1 gap-4">
              {assessments.map((assessment: any) => (
                <AssessmentHistoryCard
                  key={assessment.assessmentId}
                  assessmentId={assessment.assessmentId}
                  templateName={assessment.templateName}
                  totalScore={assessment.totalScore}
                  severityCode={assessment.severityCode}
                  completedAt={assessment.completedAt}
                  onClick={() => router.push(`/assessment/result/${assessment.assessmentId}`)}
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  이전
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <Button
                        key={pageNumber}
                        variant={page === pageNumber ? 'lavender' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-2 text-neutral-500">...</span>}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyHistory />
        )}
      </div>
    </div>
  );
}

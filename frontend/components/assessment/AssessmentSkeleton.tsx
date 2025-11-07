/**
 * AssessmentSkeleton Component
 * 자가진단 페이지 로딩 스켈레톤
 *
 * Sprint 3 - Task 3.3.2
 *
 * @description
 * 자가진단 페이지 로딩 중 표시되는 스켈레톤 UI
 * - 헤더 영역 스켈레톤
 * - 진행률 표시 영역 스켈레톤
 * - 질문 카드 스켈레톤
 * - 네비게이션 버튼 스켈레톤
 */

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ============================================
// AssessmentSkeleton Component
// ============================================

/**
 * 자가진단 페이지 로딩 스켈레톤 컴포넌트
 *
 * @example
 * ```tsx
 * {isLoading && <AssessmentSkeleton />}
 * ```
 */
export const AssessmentSkeleton: React.FC = () => {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8" role="status" aria-label="자가진단 로딩 중">
      {/* 헤더 스켈레톤 */}
      <div className="mb-8">
        {/* 제목 */}
        <Skeleton className="h-10 w-3/4 mb-3" />

        {/* 설명 */}
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-2/3 mb-4" />

        {/* 예상 소요 시간 */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* 진행률 스켈레톤 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* 질문 카드 스켈레톤 */}
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          {/* 질문 번호 배지 */}
          <Skeleton className="h-8 w-8 rounded-full mb-3" />

          {/* 질문 텍스트 */}
          <Skeleton className="h-7 w-full mb-2" />
          <Skeleton className="h-7 w-4/5" />
        </CardHeader>

        <CardContent>
          {/* 옵션들 */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 min-h-[44px]"
              >
                <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                <Skeleton className="h-5 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 네비게이션 버튼 스켈레톤 */}
      <div className="flex items-center justify-between gap-4 mt-6">
        <Skeleton className="h-12 w-[120px] rounded-md" />
        <Skeleton className="h-12 w-[120px] rounded-md" />
      </div>

      {/* 스크린 리더용 숨김 텍스트 */}
      <span className="sr-only">자가진단 템플릿을 불러오는 중입니다...</span>
    </div>
  );
};

AssessmentSkeleton.displayName = 'AssessmentSkeleton';

export default AssessmentSkeleton;

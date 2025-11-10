/**
 * Assessment Result Page
 * 자가진단 결과 페이지
 *
 * Sprint 3 - Task 3.2.4
 *
 * @route /assessment/result/[id]
 *
 * @example
 * `/assessment/result/123` - 진단 ID 123번 결과 조회
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssessmentResult } from '@/hooks/useAssessmentResult';
import { useAssessmentStore } from '@/store/assessmentStore';
import { ScoreSection } from '@/components/assessment/ScoreSection';
import { InterpretationSection } from '@/components/assessment/InterpretationSection';
import { RecommendationCTA } from '@/components/assessment/RecommendationCTA';
import { EmergencyContactBanner } from '@/components/assessment/EmergencyContactBanner';
import { AssessmentErrorAlert, ErrorType } from '@/components/assessment/AssessmentErrorAlert';

// ============================================
// Loading Skeleton
// ============================================

function ResultSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6 max-w-3xl">
      {/* Header Skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-5 w-32 mx-auto" />
      </div>

      {/* Score Section Skeleton */}
      <div className="border-2 rounded-lg p-6 space-y-6">
        <Skeleton className="h-10 w-40 mx-auto" />
        <Skeleton className="h-16 w-32 mx-auto" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>

      {/* Interpretation Skeleton */}
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full" />
      </div>

      {/* CTA Skeleton */}
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

/**
 * 에러 타입 결정 함수
 */
function getErrorType(error: unknown): ErrorType {
  if (!error) return 'unknown';

  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'network';
  }
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return 'not_found';
  }
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
    return 'unauthorized';
  }
  if (errorMessage.includes('500') || errorMessage.includes('server')) {
    return 'server';
  }

  return 'unknown';
}

// ============================================
// Not Found State
// ============================================

function NotFoundState() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 max-w-3xl px-4">
      <AssessmentErrorAlert
        type="not_found"
        message="요청하신 진단 결과가 존재하지 않거나 삭제되었습니다."
        showRetry
        onRetry={() => router.push('/assessment')}
      />

      <div className="flex justify-center gap-4 mt-6">
        <Button onClick={() => router.push('/assessments/history')} variant="default">
          진단 이력 보기
        </Button>
        <Button variant="outline" onClick={() => router.push('/assessment')}>
          새 진단 시작
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function AssessmentResultPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;
  const assessmentId = parseInt(id, 10);

  // Store에서 제출 직후의 결과 확인 (익명 사용자)
  const { currentResult: storeResult } = useAssessmentStore();

  // API로부터 데이터 로딩 (인증된 사용자 또는 재방문)
  // store에 결과가 있으면 API 호출 skip
  const { data: apiResult, isLoading, error, refetch } = useAssessmentResult(assessmentId);

  // store 결과 우선, 없으면 API 결과 사용
  const result = storeResult || apiResult;

  // 로딩 상태 (store에 결과가 없을 때만)
  if (isLoading && !storeResult) {
    return <ResultSkeleton />;
  }

  // 에러 상태 (store에 결과가 없을 때만)
  if (error && !storeResult) {
    const errorType = getErrorType(error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : '진단 결과를 불러오는 중 오류가 발생했습니다.';

    return (
      <div className="container mx-auto py-8 max-w-3xl px-4">
        <AssessmentErrorAlert
          type={errorType}
          message={errorMessage}
          showRetry
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // 데이터 없음
  if (!result) {
    return <NotFoundState />;
  }

  // HIGH 심각도 확인
  const isHighSeverity = result.severityCode === 'HIGH';

  // 날짜 포맷팅
  const completedDate = new Date(result.completedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-3xl px-4">
      {/* 긴급 연락처 배너 (HIGH 심각도만) */}
      {isHighSeverity && result.interpretation.contactInfo && (
        <EmergencyContactBanner show={true} contactInfo={result.interpretation.contactInfo} />
      )}

      {/* 헤더 */}
      <div className="text-center space-y-4">
        <h1 className="text-h1 font-bold text-neutral-900">진단 결과</h1>
        <p className="text-body text-neutral-600" aria-label={`진단 완료일: ${completedDate}`}>
          {completedDate}
        </p>
      </div>

      {/* 점수 섹션 */}
      <ScoreSection
        totalScore={result.totalScore}
        severityCode={result.severityCode}
        maxScore={result.maxScore}
      />

      {/* 해석 섹션 */}
      <InterpretationSection interpretation={result.interpretation} />

      {/* 추천 CTA */}
      <RecommendationCTA assessmentId={assessmentId} severityCode={result.severityCode} />

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => router.push('/assessments/history')}
          className="w-full sm:w-auto"
        >
          이전 진단 기록 보기
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push('/assessment')}
          className="w-full sm:w-auto"
        >
          다시 진단하기
        </Button>
      </div>
    </div>
  );
}

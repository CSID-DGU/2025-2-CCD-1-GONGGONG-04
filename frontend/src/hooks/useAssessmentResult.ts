/**
 * useAssessmentResult Hook
 * 자가진단 결과 조회를 위한 커스텀 훅
 *
 * Sprint 3 - Task 3.2.4
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useAssessmentResult(assessmentId);
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorState />;
 * if (!data) return <NotFoundState />;
 * return <ResultPage result={data} />;
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { getAssessmentResult, type AssessmentResult } from '@/lib/api/assessments';

/**
 * 자가진단 결과 조회 훅
 *
 * @param assessmentId - 진단 ID
 * @returns TanStack Query 결과 객체
 */
export function useAssessmentResult(assessmentId: number) {
  return useQuery<AssessmentResult>({
    queryKey: ['assessmentResult', assessmentId],
    queryFn: () => getAssessmentResult(assessmentId),
    enabled: !!assessmentId && assessmentId > 0,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    retry: 1, // 실패 시 1회 재시도
  });
}

/**
 * useAssessments Hooks
 * 자가진단 TanStack Query 훅
 *
 * Sprint 3 - Task 3.2.1
 *
 * @description
 * 자가진단 시스템용 React Query 훅 모음
 * - 템플릿 조회
 * - 진단 제출
 * - 결과 조회
 * - 이력 관리
 */

'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  getActiveTemplates,
  getTemplateById,
  submitAssessment,
  getAssessmentResult,
  getMyAssessments,
  type AssessmentTemplate,
  type SubmitAssessmentRequest,
  type AssessmentResult,
  type SubmitAssessmentResponse,
} from '@/lib/api/assessments';
import { useToast } from '@/hooks/use-toast';

// ============================================
// Query Keys
// ============================================

/**
 * Assessment Query Keys
 *
 * @description
 * 쿼리 키 구조를 중앙화하여 캐시 무효화 및 관리 용이
 */
export const assessmentKeys = {
  /** 모든 평가 쿼리 */
  all: ['assessments'] as const,

  /** 모든 템플릿 */
  templates: () => [...assessmentKeys.all, 'templates'] as const,

  /** 특정 템플릿 */
  template: (id: number) => [...assessmentKeys.all, 'template', id] as const,

  /** 모든 결과 */
  results: () => [...assessmentKeys.all, 'results'] as const,

  /** 특정 결과 */
  result: (id: number) => [...assessmentKeys.all, 'result', id] as const,

  /** 진단 이력 */
  history: (filters?: GetHistoryParams) =>
    [...assessmentKeys.all, 'history', filters] as const,

  /** 최근 진단 */
  latest: (templateCode?: string) =>
    [...assessmentKeys.all, 'latest', templateCode] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * 활성화된 템플릿 목록 조회 훅
 *
 * @returns TanStack Query result
 *
 * @example
 * ```tsx
 * const { data: templates, isLoading, error } = useTemplates();
 *
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <ul>
 *     {templates?.map(template => (
 *       <li key={template.id}>{template.name}</li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useTemplates(
  options?: Omit<UseQueryOptions<AssessmentTemplate[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AssessmentTemplate[], Error>({
    queryKey: assessmentKeys.templates(),
    queryFn: getActiveTemplates,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    ...options,
  });
}

/**
 * 특정 템플릿 상세 조회 훅
 *
 * @param id - 템플릿 ID
 * @param options - Query options
 * @returns TanStack Query result
 *
 * @example
 * ```tsx
 * const { data: template, isLoading } = useTemplate(1);
 *
 * if (!template) return null;
 *
 * return (
 *   <div>
 *     <h1>{template.name}</h1>
 *     <p>{template.description}</p>
 *     <p>질문 수: {template.questionCount}개</p>
 *   </div>
 * );
 * ```
 */
export function useTemplate(
  id: number,
  options?: Omit<UseQueryOptions<AssessmentTemplate, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AssessmentTemplate, Error>({
    queryKey: assessmentKeys.template(id),
    queryFn: () => getTemplateById(id),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    enabled: !!id, // id가 있을 때만 실행
    ...options,
  });
}

/**
 * 진단 결과 조회 훅
 *
 * @param id - 진단 ID
 * @param options - Query options
 * @returns TanStack Query result
 *
 * @example
 * ```tsx
 * const { data: result, isLoading } = useAssessmentResult(123);
 *
 * if (!result) return null;
 *
 * return (
 *   <div>
 *     <h2>총점: {result.totalScore}</h2>
 *     <Badge>{result.severityCode}</Badge>
 *     <p>{result.interpretation.description}</p>
 *   </div>
 * );
 * ```
 */
export function useAssessmentResult(
  id: number,
  options?: Omit<UseQueryOptions<AssessmentResult, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AssessmentResult, Error>({
    queryKey: assessmentKeys.result(id),
    queryFn: () => getAssessmentResult(id),
    staleTime: 1000 * 60 * 10, // 10분 (결과는 변하지 않음)
    gcTime: 1000 * 60 * 30, // 30분
    enabled: !!id,
    ...options,
  });
}

/**
 * 진단 이력 조회 훅
 *
 * @param params - 조회 파라미터
 * @param options - Query options
 * @returns TanStack Query result
 *
 * @example
 * ```tsx
 * const { data: history, isLoading } = useAssessmentHistory({
 *   page: 1,
 *   limit: 10,
 *   severityCode: 'MID',
 * });
 *
 * if (!history) return null;
 *
 * return (
 *   <div>
 *     <p>총 {history.total}개</p>
 *     <ul>
 *       {history.assessments.map(assessment => (
 *         <li key={assessment.assessmentId}>
 *           {assessment.templateName} - {assessment.totalScore}점
 *         </li>
 *       ))}
 *     </ul>
 *   </div>
 * );
 * ```
 */
export function useAssessmentHistory(
  options?: Omit<UseQueryOptions<AssessmentResult[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AssessmentResult[], Error>({
    queryKey: assessmentKeys.all,
    queryFn: () => getMyAssessments(),
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 5, // 5분
    ...options,
  });
}

/**
 * 최근 진단 결과 조회 훅
 *
 * @param templateCode - 템플릿 코드 (선택)
 * @param options - Query options
 * @returns TanStack Query result
 *
 * @example
 * ```tsx
 * const { data: latestResult } = useLatestAssessment('K10_V1');
 *
 * if (latestResult) {
 *   return <p>최근 진단: {latestResult.completedAt}</p>;
 * }
 *
 * return <p>아직 진단 이력이 없습니다</p>;
 * ```
 */
export function useLatestAssessment(
  options?: Omit<UseQueryOptions<AssessmentResult | null, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AssessmentResult | null, Error>({
    queryKey: assessmentKeys.all,
    queryFn: async () => {
      const results = await getMyAssessments();
      return results.length > 0 ? results[0] : null;
    },
    staleTime: 1000 * 60 * 2, // 2분
    gcTime: 1000 * 60 * 5, // 5분
    ...options,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * useSubmitAssessment 훅 옵션
 */
export interface UseSubmitAssessmentOptions {
  /** 성공 콜백 */
  onSuccess?: (data: AssessmentResult) => void;

  /** 에러 콜백 */
  onError?: (error: Error) => void;

  /** Toast 성공 메시지 표시 여부 (기본: true) */
  showSuccessToast?: boolean;

  /** Toast 에러 메시지 표시 여부 (기본: true) */
  showErrorToast?: boolean;
}

/**
 * 자가진단 제출 훅
 *
 * @param options - 훅 옵션
 * @returns TanStack Query Mutation result
 *
 * @example
 * ```tsx
 * const { mutate: submitAssessment, isPending, error } = useSubmitAssessment({
 *   onSuccess: (result) => {
 *     router.push(`/assessment/result/${result.assessmentId}`);
 *   },
 * });
 *
 * const handleSubmit = () => {
 *   submitAssessment({
 *     templateId: 1,
 *     answers: [
 *       { questionNumber: 1, selectedOption: 2 },
 *       { questionNumber: 2, selectedOption: 3 },
 *     ],
 *   });
 * };
 *
 * return (
 *   <Button onClick={handleSubmit} disabled={isPending}>
 *     {isPending ? '제출 중...' : '제출하기'}
 *   </Button>
 * );
 * ```
 */
export function useSubmitAssessment(options: UseSubmitAssessmentOptions = {}) {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitAssessmentRequest) => submitAssessment(data),

    onSuccess: (result) => {
      // 캐시 무효화 (이력 및 최근 진단)
      queryClient.invalidateQueries({ queryKey: assessmentKeys.history() });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.latest() });

      // 결과 캐시 설정
      queryClient.setQueryData(
        assessmentKeys.result(result.assessmentId),
        result
      );

      // 성공 콜백
      if (onSuccess) {
        onSuccess(result);
      }

      // 성공 Toast
      if (showSuccessToast) {
        toast({
          title: '진단 완료',
          description: '자가진단이 완료되었습니다',
        });
      }
    },

    onError: (error: Error) => {
      const apiError =
        error instanceof Error
          ? error
          : new Error(error.message, 500, 'UNKNOWN_ERROR');

      // 에러 콜백
      if (onError) {
        onError(apiError);
      }

      // 에러 Toast
      if (showErrorToast) {
        let title = '진단 제출 실패';
        let description = apiError.message;

        if (apiError.code === 'VALIDATION_ERROR' && apiError.details) {
          description = apiError.details.map((d) => d.message).join('\n');
        } else if (apiError.code === 'NETWORK_ERROR') {
          title = '네트워크 오류';
          description = '인터넷 연결을 확인해주세요';
        } else if (apiError.statusCode >= 500) {
          title = '서버 오류';
          description = '잠시 후 다시 시도해주세요';
        }

        toast({
          variant: 'destructive',
          title,
          description,
        });
      }
    },
  });
}

/**
 * useDeleteAssessment 훅 옵션
 */
export interface UseDeleteAssessmentOptions {
  /** 성공 콜백 */
  onSuccess?: () => void;

  /** 에러 콜백 */
  onError?: (error: Error) => void;

  /** Toast 성공 메시지 표시 여부 (기본: true) */
  showSuccessToast?: boolean;

  /** Toast 에러 메시지 표시 여부 (기본: true) */
  showErrorToast?: boolean;
}

/**
 * 진단 결과 삭제 훅
 *
 * @param options - 훅 옵션
 * @returns TanStack Query Mutation result
 *
 * @example
 * ```tsx
 * const { mutate: deleteResult, isPending } = useDeleteAssessment({
 *   onSuccess: () => {
 *     console.log('삭제 완료');
 *   },
 * });
 *
 * const handleDelete = (assessmentId: number) => {
 *   if (confirm('정말 삭제하시겠습니까?')) {
 *     deleteResult(assessmentId);
 *   }
 * };
 *
 * return (
 *   <Button
 *     variant="destructive"
 *     onClick={() => handleDelete(123)}
 *     disabled={isPending}
 *   >
 *     삭제
 *   </Button>
 * );
 * ```
 */
export function useDeleteAssessment(options: UseDeleteAssessmentOptions = {}) {
  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // TODO: Implement deleteAssessment API
      throw new Error('Delete assessment not implemented');
    },

    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: assessmentKeys.history() });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.latest() });

      // 성공 콜백
      if (onSuccess) {
        onSuccess();
      }

      // 성공 Toast
      if (showSuccessToast) {
        toast({
          title: '삭제 완료',
          description: '진단 결과가 삭제되었습니다',
        });
      }
    },

    onError: (error: Error) => {
      const apiError =
        error instanceof Error
          ? error
          : new Error(error.message, 500, 'UNKNOWN_ERROR');

      // 에러 콜백
      if (onError) {
        onError(apiError);
      }

      // 에러 Toast
      if (showErrorToast) {
        toast({
          variant: 'destructive',
          title: '삭제 실패',
          description: apiError.message,
        });
      }
    },
  });
}

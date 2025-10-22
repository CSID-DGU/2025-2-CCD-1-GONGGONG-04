/**
 * useOperatingStatus Hook
 * 센터 운영 상태 조회 및 실시간 업데이트 훅
 *
 * @description
 * TanStack Query를 사용한 센터 운영 상태 조회 훅
 * - 60초마다 자동 업데이트
 * - 페이지 포커스 시 즉시 업데이트
 * - 에러 핸들링 및 재시도 로직
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchOperatingStatus } from '@/lib/api/centers';
import { OperatingStatusResponse } from '@/types/operatingStatus';
import { useToast } from '@/hooks/use-toast';

/**
 * useOperatingStatus 훅 옵션
 */
export interface UseOperatingStatusOptions {
  /** 쿼리 활성화 여부 (기본: true) */
  enabled?: boolean;
  /** 자동 업데이트 간격 (밀리초, 기본: 60000ms = 60초) */
  refetchInterval?: number;
  /** 성공 콜백 */
  onSuccess?: (data: OperatingStatusResponse) => void;
  /** 에러 콜백 */
  onError?: (error: Error) => void;
  /** Toast 에러 표시 여부 (기본: true) */
  showErrorToast?: boolean;
}

/**
 * 센터 운영 상태 조회 훅
 *
 * @param centerId - 센터 ID
 * @param options - 훅 옵션
 * @returns TanStack Query 결과
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useOperatingStatus(1, {
 *   refetchInterval: 60000,
 *   onSuccess: (data) => console.log('Updated:', data.status),
 * });
 *
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorFallback />;
 *
 * return <OperatingStatusBadge status={data.status} />;
 * ```
 */
export function useOperatingStatus(
  centerId: number,
  options: UseOperatingStatusOptions = {}
) {
  const {
    enabled = true,
    refetchInterval = 60000, // 60초
    onSuccess,
    onError,
    showErrorToast = true,
  } = options;

  const { toast } = useToast();

  // TanStack Query 설정
  const query = useQuery({
    // 쿼리 키: centerId가 변경되면 새로운 쿼리 실행
    queryKey: ['operating-status', centerId],

    // 쿼리 함수
    queryFn: () => fetchOperatingStatus(centerId),

    // 쿼리 활성화 여부
    enabled,

    // 데이터가 stale로 간주되는 시간 (30초)
    // 이 시간이 지나면 다음 refetch 시 새로운 데이터를 가져옴
    staleTime: 30000,

    // 자동 refetch 간격 (60초)
    refetchInterval,

    // 페이지 포커스 시 자동 refetch
    refetchOnWindowFocus: true,

    // 마운트 시 자동 refetch
    refetchOnMount: true,

    // 재연결 시 자동 refetch
    refetchOnReconnect: true,

    // 재시도 설정
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // 성공 콜백 처리
  useEffect(() => {
    if (query.data && onSuccess) {
      onSuccess(query.data);
    }
  }, [query.data, onSuccess]);

  // 에러 콜백 및 Toast 표시
  useEffect(() => {
    if (query.error) {
      // 커스텀 에러 콜백 실행
      if (onError) {
        onError(query.error as Error);
      }

      // Toast 에러 표시
      if (showErrorToast) {
        toast({
          variant: 'destructive',
          title: '운영 상태 조회 실패',
          description: (query.error as Error).message || '운영 상태를 불러오는데 실패했습니다.',
        });
      }
    }
  }, [query.error, onError, showErrorToast, toast]);

  // 페이지 가시성 변경 시 즉시 업데이트
  useEffect(() => {
    const handleVisibilityChange = () => {
      // 페이지가 다시 보일 때 즉시 refetch
      if (!document.hidden && enabled) {
        query.refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, query]);

  return query;
}

/**
 * 운영 상태 쿼리 키 생성 함수
 *
 * @param centerId - 센터 ID
 * @returns 쿼리 키
 */
export function getOperatingStatusQueryKey(centerId: number) {
  return ['operating-status', centerId];
}

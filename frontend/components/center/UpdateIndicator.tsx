'use client';

/**
 * UpdateIndicator 컴포넌트
 * 실시간 업데이트 상태 표시기
 *
 * @description
 * 운영 상태의 마지막 업데이트 시간과 현재 업데이트 진행 상태를 표시
 * - 마지막 업데이트 시간 표시 (상대 시간)
 * - 업데이트 진행 중 표시 (스피너)
 * - 자동 업데이트 간격 표시
 */

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { RefreshCw } from 'lucide-react';

/**
 * UpdateIndicator Props
 */
export interface UpdateIndicatorProps {
  /** 마지막 업데이트 시간 (ISO 8601 형식) */
  lastUpdate: string;
  /** 현재 업데이트 진행 중 여부 */
  isRefetching: boolean;
  /** 자동 업데이트 간격 (초, 선택) */
  refetchInterval?: number;
  /** 컴팩트 모드 (간단한 표시) */
  compact?: boolean;
}

/**
 * 실시간 업데이트 상태 표시 컴포넌트
 *
 * @example
 * ```tsx
 * const { data, isRefetching } = useOperatingStatus(centerId);
 *
 * return (
 *   <UpdateIndicator
 *     lastUpdate={data?.currentTime}
 *     isRefetching={isRefetching}
 *     refetchInterval={60}
 *   />
 * );
 * ```
 */
export function UpdateIndicator({
  lastUpdate,
  isRefetching,
  refetchInterval = 60,
  compact = false,
}: UpdateIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState<string>('');

  // 상대 시간 업데이트 (매 분마다)
  useEffect(() => {
    const updateRelativeTime = () => {
      try {
        const updateTime = new Date(lastUpdate);
        const relative = formatDistanceToNow(updateTime, {
          addSuffix: true,
          locale: ko,
        });
        setRelativeTime(relative);
      } catch (error) {
        console.error('Failed to format update time:', error);
        setRelativeTime('방금 전');
      }
    };

    // 초기 업데이트
    updateRelativeTime();

    // 1분마다 업데이트
    const intervalId = setInterval(updateRelativeTime, 60000);

    return () => clearInterval(intervalId);
  }, [lastUpdate]);

  // 컴팩트 모드
  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-2 text-small text-neutral-500"
        aria-live="polite"
        aria-atomic="true"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin text-lavender-500' : ''}`}
          aria-hidden="true"
        />
        <span>{isRefetching ? '업데이트 중...' : relativeTime}</span>
      </div>
    );
  }

  // 전체 모드
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-lg border border-neutral-200"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* 업데이트 아이콘 */}
      <div className="flex-shrink-0">
        <RefreshCw
          className={`h-4 w-4 transition-all duration-300 ${
            isRefetching
              ? 'animate-spin text-lavender-500'
              : 'text-neutral-400'
          }`}
          aria-hidden="true"
        />
      </div>

      {/* 업데이트 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-small font-medium text-neutral-700">
            {isRefetching ? '업데이트 중' : '마지막 업데이트'}
          </span>
          {!isRefetching && (
            <span className="text-small text-neutral-500">{relativeTime}</span>
          )}
        </div>

        {/* 자동 업데이트 간격 표시 */}
        {refetchInterval && !isRefetching && (
          <p className="text-caption text-neutral-400 mt-0.5">
            {refetchInterval}초마다 자동 업데이트
          </p>
        )}
      </div>

      {/* 업데이트 진행 상태 (스크린 리더용) */}
      {isRefetching && (
        <span className="sr-only">운영 상태 업데이트 진행 중입니다</span>
      )}
    </div>
  );
}

/**
 * 간단한 업데이트 시간 표시 컴포넌트
 *
 * @param props - 컴포넌트 Props
 * @param props.lastUpdate - 마지막 업데이트 시간 (ISO 8601)
 *
 * @example
 * ```tsx
 * <UpdateTime lastUpdate={data.currentTime} />
 * ```
 */
export function UpdateTime({ lastUpdate }: { lastUpdate: string }) {
  const [relativeTime, setRelativeTime] = useState<string>('');

  useEffect(() => {
    const updateRelativeTime = () => {
      try {
        const updateTime = new Date(lastUpdate);
        const relative = formatDistanceToNow(updateTime, {
          addSuffix: true,
          locale: ko,
        });
        setRelativeTime(relative);
      } catch (error) {
        console.error('Failed to format update time:', error);
        setRelativeTime('방금 전');
      }
    };

    updateRelativeTime();
    const intervalId = setInterval(updateRelativeTime, 60000);

    return () => clearInterval(intervalId);
  }, [lastUpdate]);

  return (
    <span className="text-caption text-neutral-400" aria-live="polite">
      {relativeTime} 업데이트
    </span>
  );
}

/**
 * EmptyState Component
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * 빈 결과 상태 표시 컴포넌트
 * - 검색 결과 없음
 * - 필터 결과 없음
 * - 즐겨찾기 없음 등
 *
 * @see context/only-read-frontend/공통_UI_UX_가이드라인.md (5.4, 11.5)
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /** 아이콘 (emoji 또는 React 컴포넌트) */
  icon?: React.ReactNode;
  /** 제목 (상황 설명) */
  title: string;
  /** 설명 (해결 방법 제시) */
  description?: string | string[];
  /** 액션 버튼 (다음 액션 유도) */
  action?: React.ReactNode;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * EmptyState Component
 *
 * @example
 * ```tsx
 * // 검색 결과 없음
 * <EmptyState
 *   icon="🔍"
 *   title="검색 결과가 없습니다"
 *   description={[
 *     "검색어를 다시 확인해주세요",
 *     "다른 키워드로 검색해보세요"
 *   ]}
 *   action={
 *     <Button variant="outline" onClick={onReset}>
 *       전체 센터 보기
 *     </Button>
 *   }
 * />
 *
 * // 즐겨찾기 없음
 * <EmptyState
 *   icon="⭐"
 *   title="즐겨찾기한 센터가 없습니다"
 *   description="자주 찾는 센터를 즐겨찾기에 추가해보세요"
 *   action={
 *     <Button variant="primary" onClick={onGoToCenters}>
 *       센터 찾아보기
 *     </Button>
 *   }
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  // Description을 배열로 정규화
  const descriptionLines = Array.isArray(description) ? description : description ? [description] : [];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      {icon && (
        <div className="mb-4 text-4xl" aria-hidden="true">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-h3 font-semibold text-neutral-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {descriptionLines.length > 0 && (
        <div className="text-body text-neutral-600 mb-6 space-y-1">
          {descriptionLines.length === 1 ? (
            <p>{descriptionLines[0]}</p>
          ) : (
            <ul className="list-none space-y-1">
              {descriptionLines.map((line, index) => (
                <li key={index}>• {line}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Action Button */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/**
 * Preset EmptyState Variants
 *
 * 자주 사용되는 EmptyState 패턴을 preset으로 제공
 */
export const EmptyStatePresets = {
  /**
   * 검색 결과 없음
   */
  NoSearchResults: ({ onReset }: { onReset?: () => void }) => (
    <EmptyState
      icon="🔍"
      title="검색 결과가 없습니다"
      description={[
        '검색어를 다시 확인해주세요',
        '다른 키워드로 검색해보세요',
      ]}
      action={
        onReset && (
          <Button variant="outline" onClick={onReset}>
            전체 센터 보기
          </Button>
        )
      }
    />
  ),

  /**
   * 필터 결과 없음
   */
  NoFilterResults: ({ onResetFilters }: { onResetFilters?: () => void }) => (
    <EmptyState
      icon="🔍"
      title="필터 조건에 맞는 센터가 없습니다"
      description="다른 조건으로 검색해보세요"
      action={
        onResetFilters && (
          <Button variant="outline" onClick={onResetFilters}>
            필터 초기화
          </Button>
        )
      }
    />
  ),

  /**
   * 즐겨찾기 없음
   */
  NoBookmarks: ({ onGoToCenters }: { onGoToCenters?: () => void }) => (
    <EmptyState
      icon="⭐"
      title="즐겨찾기한 센터가 없습니다"
      description="자주 찾는 센터를 즐겨찾기에 추가해보세요"
      action={
        onGoToCenters && (
          <Button variant="default" onClick={onGoToCenters}>
            센터 찾아보기
          </Button>
        )
      }
    />
  ),

  /**
   * 일반적인 데이터 없음
   */
  NoData: ({ message, onAction }: { message?: string; onAction?: () => void }) => (
    <EmptyState
      icon="📭"
      title={message || '데이터가 없습니다'}
      description="나중에 다시 시도해주세요"
      action={
        onAction && (
          <Button variant="outline" onClick={onAction}>
            새로고침
          </Button>
        )
      }
    />
  ),
};

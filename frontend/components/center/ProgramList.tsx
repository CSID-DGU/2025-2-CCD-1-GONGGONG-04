'use client';

/**
 * 마음이음 - 프로그램 목록 컴포넌트
 *
 * Sprint 3: 통합 정보 제공 - 프로그램 목록 표시
 *
 * @description 센터의 프로그램 목록을 표시하는 컴포넌트
 */

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronDown } from 'lucide-react';
import { ProgramCard } from './ProgramCard';
import type { Program } from '@/types/center';

/**
 * 프로그램 목록 Props
 */
export interface ProgramListProps {
  /** 프로그램 목록 */
  programs: Program[];
  /** 데이터 존재 여부 */
  hasData: boolean;
  /** 프로그램 클릭 이벤트 핸들러 */
  onProgramClick: (program: Program) => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 프로그램 목록 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <ProgramList
 *   programs={programList}
 *   hasData={true}
 *   onProgramClick={handleProgramClick}
 * />
 *
 * // 빈 상태
 * <ProgramList
 *   programs={[]}
 *   hasData={false}
 *   onProgramClick={handleProgramClick}
 * />
 * ```
 */
export const ProgramList: React.FC<ProgramListProps> = ({
  programs,
  hasData,
  onProgramClick,
  className,
}) => {
  const [showAll, setShowAll] = useState(false);

  // 초기에는 5개만 표시, 더보기 클릭 시 전체 표시
  const displayedPrograms = showAll ? programs : programs.slice(0, 5);
  const hasMore = programs.length > 5;

  // 빈 상태 처리
  if (!hasData) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12 px-4 text-center bg-neutral-50 rounded-lg',
          className
        )}
      >
        <BookOpen
          className="h-12 w-12 text-neutral-300 mb-4"
          aria-hidden="true"
        />
        <p className="text-body text-neutral-500">
          제공 중인 프로그램이 없습니다
        </p>
        <p className="text-body-sm text-neutral-400 mt-2">
          센터에 직접 문의해 주세요
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid gap-4 md:grid-cols-2">
        {displayedPrograms.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            onClick={() => onProgramClick(program)}
          />
        ))}
      </div>

      {hasMore && !showAll && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="gap-2"
            aria-label="프로그램 더보기"
          >
            더보기
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
};

ProgramList.displayName = 'ProgramList';

/**
 * 마음이음 - 프로그램 카드 컴포넌트
 *
 * Sprint 3: 통합 정보 제공 - 프로그램 정보 표시
 *
 * @description 개별 프로그램 정보를 카드 형식으로 표시하는 컴포넌트
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import type { Program } from '@/types/center';

/**
 * 프로그램 카드 Props
 */
export interface ProgramCardProps {
  /** 프로그램 정보 */
  program: Program;
  /** 클릭 이벤트 핸들러 */
  onClick: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 프로그램 카드 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <ProgramCard
 *   program={program}
 *   onClick={() => handleProgramClick(program)}
 * />
 * ```
 */
export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  onClick,
  className,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'cursor-pointer transition-all duration-300 hover:shadow-md hover:border-lavender-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-500 focus-visible:ring-offset-2',
        className
      )}
      aria-label={`${program.program_name} 프로그램 상세 보기`}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {program.is_online_available && (
            <Badge
              variant="default"
              className="bg-green-100 text-green-700 hover:bg-green-100"
            >
              온라인
            </Badge>
          )}
          {program.is_free ? (
            <Badge
              variant="default"
              className="bg-blue-100 text-blue-700 hover:bg-blue-100"
            >
              무료
            </Badge>
          ) : (
            program.fee_amount !== null && (
              <Badge
                variant="default"
                className="bg-orange-100 text-orange-700 hover:bg-orange-100"
              >
                유료 {program.fee_amount.toLocaleString()}원
              </Badge>
            )
          )}
        </div>
        <CardTitle className="text-h4 text-neutral-900 line-clamp-2">
          {program.program_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-body-sm text-neutral-600">
          <span>유형: {program.program_type}</span>
          <span className="text-neutral-300">|</span>
          <span>대상: {program.target_group}</span>
        </div>

        {(program.capacity !== null || program.duration_minutes !== null) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-body-sm text-neutral-600 pt-1">
            {program.capacity !== null && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>정원 {program.capacity}명</span>
              </div>
            )}
            {program.duration_minutes !== null && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>{program.duration_minutes}분</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

ProgramCard.displayName = 'ProgramCard';

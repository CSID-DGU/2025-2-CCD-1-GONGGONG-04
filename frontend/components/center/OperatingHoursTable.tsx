/**
 * 마음이음 - 운영시간 테이블 컴포넌트
 *
 * Sprint 2: 통합 정보 제공 - 실시간 운영 상태 표시
 *
 * @description 센터의 요일별 운영시간을 테이블로 표시하는 컴포넌트
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OperatingHour } from '@/types/operatingStatus';

/**
 * 운영시간 테이블 Props
 */
export interface OperatingHoursTableProps {
  /** 요일별 운영시간 목록 */
  operatingHours: OperatingHour[];
  /** 현재 요일 (0=일요일, 6=토요일) */
  currentDayOfWeek?: number;
  /** 컴팩트 모드 (좁은 간격) */
  compact?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 운영시간 테이블 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <OperatingHoursTable operatingHours={hours} />
 *
 * // 현재 요일 강조
 * <OperatingHoursTable
 *   operatingHours={hours}
 *   currentDayOfWeek={new Date().getDay()}
 * />
 *
 * // 컴팩트 모드
 * <OperatingHoursTable
 *   operatingHours={hours}
 *   compact
 * />
 * ```
 */
export const OperatingHoursTable: React.FC<OperatingHoursTableProps> = ({
  operatingHours,
  currentDayOfWeek,
  compact = false,
  className,
}) => {
  // 요일 순서대로 정렬 (일요일부터 토요일까지)
  const sortedHours = React.useMemo(() => {
    return [...operatingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }, [operatingHours]);

  return (
    <div className={cn('overflow-hidden rounded-lg border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">요일</TableHead>
            <TableHead>운영시간</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHours.map((hour) => {
            const isCurrentDay = currentDayOfWeek === hour.dayOfWeek;

            return (
              <TableRow
                key={hour.dayOfWeek}
                className={cn(
                  isCurrentDay &&
                    'bg-lavender-50 hover:bg-lavender-50 border-l-4 border-l-lavender-500'
                )}
              >
                <TableCell
                  className={cn(
                    compact ? 'py-2' : 'py-3',
                    'font-medium',
                    isCurrentDay && 'text-lavender-700 font-semibold'
                  )}
                >
                  {hour.dayName}
                  {isCurrentDay && (
                    <span className="sr-only"> (오늘)</span>
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    compact ? 'py-2' : 'py-3',
                    isCurrentDay && 'text-lavender-700'
                  )}
                >
                  {hour.isOpen ? (
                    <span>
                      {hour.openTime} ~ {hour.closeTime}
                    </span>
                  ) : (
                    <span className="text-neutral-500">휴무</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

OperatingHoursTable.displayName = 'OperatingHoursTable';

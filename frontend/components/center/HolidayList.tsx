'use client';

/**
 * 마음이음 - 휴무일 목록 컴포넌트
 *
 * Sprint 2: 통합 정보 제공 - 실시간 운영 상태 표시
 *
 * @description 센터의 휴무일 목록을 표시하는 컴포넌트
 */

import * as React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle } from 'lucide-react';
import type { Holiday } from '@/types/operatingStatus';
import { holidayTypeLabels } from '@/types/operatingStatus';

/**
 * 휴무일 목록 Props
 */
export interface HolidayListProps {
  /** 휴무일 목록 */
  holidays: Holiday[];
  /** 표시할 최대 항목 수 (기본값: 5) */
  maxItems?: number;
  /** 휴무일 타입 표시 여부 (기본값: true) */
  showType?: boolean;
  /** 빈 목록 메시지 */
  emptyMessage?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 휴무일 타입별 배지 색상
 */
const holidayTypeBadgeVariants: Record<Holiday['type'], 'default' | 'secondary' | 'destructive'> = {
  public: 'default',
  regular: 'secondary',
  temporary: 'destructive',
};

/**
 * 휴무일 목록 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <HolidayList holidays={holidays} />
 *
 * // 최대 3개만 표시
 * <HolidayList holidays={holidays} maxItems={3} />
 *
 * // 타입 표시 없이
 * <HolidayList holidays={holidays} showType={false} />
 * ```
 */
export const HolidayList: React.FC<HolidayListProps> = ({
  holidays,
  maxItems = 5,
  showType = true,
  emptyMessage = '등록된 휴무일이 없습니다',
  className,
}) => {
  const [showAll, setShowAll] = React.useState(false);

  // 날짜순 정렬 (가까운 날짜부터)
  const sortedHolidays = React.useMemo(() => {
    return [...holidays].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [holidays]);

  // 표시할 휴무일 목록
  const displayedHolidays = showAll
    ? sortedHolidays
    : sortedHolidays.slice(0, maxItems);

  const hasMore = sortedHolidays.length > maxItems;

  // 날짜 포맷팅 함수
  const formatHolidayDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'M월 d일 (EEE)', { locale: ko });
    } catch {
      return dateString;
    }
  };

  // 빈 상태
  if (holidays.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-8 text-center',
          className
        )}
      >
        <Calendar className="h-12 w-12 text-neutral-400 mb-3" aria-hidden="true" />
        <p className="text-body text-neutral-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <ul className="space-y-2" role="list">
        {displayedHolidays.map((holiday, index) => (
          <li
            key={`${holiday.date}-${index}`}
            className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar
                className="h-4 w-4 text-neutral-500 flex-shrink-0"
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-body font-medium text-neutral-900">
                  {holiday.name}
                </span>
                <span className="text-small text-neutral-600">
                  {formatHolidayDate(holiday.date)}
                </span>
              </div>
            </div>

            {showType && (
              <Badge
                variant={holidayTypeBadgeVariants[holiday.type]}
                className="flex-shrink-0"
              >
                {holidayTypeLabels[holiday.type]}
              </Badge>
            )}
          </li>
        ))}
      </ul>

      {hasMore && !showAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(true)}
          className="w-full"
        >
          더보기 ({sortedHolidays.length - maxItems}개 더 있음)
        </Button>
      )}

      {showAll && hasMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(false)}
          className="w-full"
        >
          접기
        </Button>
      )}
    </div>
  );
};

HolidayList.displayName = 'HolidayList';

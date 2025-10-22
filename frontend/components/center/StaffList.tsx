/**
 * 마음이음 - 의료진 현황 컴포넌트
 *
 * Sprint 3: 통합 정보 제공 - 의료진 현황 표시
 *
 * @description 센터의 의료진 구성을 표시하는 컴포넌트
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope } from 'lucide-react';
import type { Staff } from '@/types/center';

/**
 * 의료진 현황 Props
 */
export interface StaffListProps {
  /** 의료진 목록 */
  staff: Staff[];
  /** 총 의료진 수 */
  totalStaff: number;
  /** 데이터 존재 여부 */
  hasData: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 의료진 현황 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <StaffList
 *   staff={staffList}
 *   totalStaff={12}
 *   hasData={true}
 * />
 *
 * // 빈 상태
 * <StaffList
 *   staff={[]}
 *   totalStaff={0}
 *   hasData={false}
 * />
 * ```
 */
export const StaffList: React.FC<StaffListProps> = ({
  staff,
  totalStaff,
  hasData,
  className,
}) => {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-h3 text-neutral-900">
            의료진 현황
          </CardTitle>
          {hasData && totalStaff > 0 && (
            <Badge variant="secondary" className="text-body-sm">
              총 {totalStaff}명
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Stethoscope
              className="h-12 w-12 text-neutral-300 mb-4"
              aria-hidden="true"
            />
            <p className="text-body text-neutral-500">
              의료진 정보가 없습니다
            </p>
            <p className="text-body-sm text-neutral-400 mt-2">
              센터에 문의하여 정보를 확인해주세요
            </p>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {staff.map((staffMember, index) => (
              <li
                key={`${staffMember.staff_type}-${index}`}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                role="listitem"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-neutral-900 truncate">
                    {staffMember.staff_type}
                  </p>
                  {staffMember.description && (
                    <p className="text-body-sm text-neutral-600 mt-1">
                      {staffMember.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant="default"
                  className="shrink-0 bg-lavender-100 text-lavender-700 hover:bg-lavender-200"
                  aria-label={`${staffMember.staff_type} ${staffMember.staff_count}명`}
                >
                  {staffMember.staff_count}명
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

StaffList.displayName = 'StaffList';

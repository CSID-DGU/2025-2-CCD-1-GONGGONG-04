'use client';

/**
 * Center Staff Section
 * 센터 의료진 현황 섹션 - Client Component
 */

import { useCenterStaff } from '@/hooks';
import { StaffList } from '@/components/center';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface CenterStaffSectionProps {
  centerId: number;
}

export function CenterStaffSection({ centerId }: CenterStaffSectionProps) {
  const { data: staffData, isLoading, error } = useCenterStaff(centerId);

  // 로딩 상태
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-h3 flex items-center gap-2">
            <Users className="w-5 h-5" aria-hidden="true" />
            의료진 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return null; // 에러 발생 시 섹션 숨김
  }

  // 데이터 없음
  if (!staffData) {
    return null;
  }

  return (
    <section>
      <h2 className="text-h2 mb-4">의료진 현황</h2>
      <StaffList
        staff={staffData.staff}
        totalStaff={staffData.total_staff}
        hasData={staffData.has_data}
      />
    </section>
  );
}

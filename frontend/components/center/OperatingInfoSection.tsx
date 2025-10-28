/**
 * OperatingInfoSection 컴포넌트
 * 센터 운영 정보 통합 섹션 (클라이언트 컴포넌트)
 *
 * @description
 * 센터의 실시간 운영 상태, 운영시간, 휴무일 정보를 통합 표시
 * - useOperatingStatus 훅으로 실시간 데이터 조회
 * - 60초마다 자동 업데이트
 * - 로딩/에러 상태 처리
 */

'use client';

import { useOperatingStatus } from '@/hooks/useOperatingStatus';
import {
  OperatingStatusBadge,
  OperatingHoursTable,
  HolidayList,
  OperatingInfoSectionSkeleton,
} from '@/components/center';
import { UpdateIndicator } from '@/components/center/UpdateIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * OperatingInfoSection Props
 */
export interface OperatingInfoSectionProps {
  /** 센터 ID */
  centerId: number;
  /** 센터 이름 (헤더용) */
  centerName?: string;
}

/**
 * 센터 운영 정보 통합 섹션
 *
 * @example
 * ```tsx
 * <OperatingInfoSection centerId={1} centerName="마음이음센터" />
 * ```
 */
export function OperatingInfoSection({
  centerId,
  centerName,
}: OperatingInfoSectionProps) {
  // 운영 상태 조회 (60초마다 자동 업데이트)
  const { data, isLoading, error, refetch, isRefetching } = useOperatingStatus(
    centerId,
    {
      refetchInterval: 60000, // 60초
      showErrorToast: false, // 에러 토스트는 UI에서 별도 처리
    }
  );

  // 로딩 상태
  if (isLoading) {
    return <OperatingInfoSectionSkeleton />;
  }

  // 에러 상태
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
            <div className="space-y-2">
              <h3 className="text-h3 text-neutral-900">
                운영 정보를 불러올 수 없습니다
              </h3>
              <p className="text-body text-neutral-600">
                {(error as Error).message || '일시적인 오류가 발생했습니다.'}
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 데이터 없음 (센터 운영 정보 미등록)
  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <Clock className="h-12 w-12 text-neutral-300" aria-hidden="true" />
            <div className="space-y-2">
              <h3 className="text-h3 text-neutral-900">운영 정보가 없습니다</h3>
              <p className="text-body text-neutral-600">
                센터의 운영 정보가 아직 등록되지 않았습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-h2 text-neutral-900">운영 정보</h2>
        <UpdateIndicator
          lastUpdate={new Date().toISOString()}
          isRefetching={isRefetching}
          refetchInterval={60}
          compact
        />
      </div>

      {/* 현재 운영 상태 배지 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h3 text-neutral-900 mb-2">현재 운영 상태</h3>
              <p className="text-small text-neutral-500">
                {new Date().toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                기준
              </p>
            </div>
            <OperatingStatusBadge
              status={data.current_status.status}
              message={data.current_status.message}
              size="lg"
            />
          </div>

          {/* 다음 오픈 일시 (마감 시에만 표시) */}
          {data.next_open?.date && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <p className="text-small text-neutral-600">
                <span className="font-medium">다음 운영일:</span>{' '}
                {data.next_open.day_name} {data.next_open.open_time && `(${data.next_open.open_time})`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 운영시간 테이블 */}
      {data.weekly_hours && data.weekly_hours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-h3 flex items-center gap-2">
              <Clock className="w-5 h-5" aria-hidden="true" />
              요일별 운영시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OperatingHoursTable operatingHours={data.weekly_hours} />
          </CardContent>
        </Card>
      )}

      {/* 휴무일 목록 */}
      {data.upcoming_holidays && data.upcoming_holidays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-h3 flex items-center gap-2">
              <Calendar className="w-5 h-5" aria-hidden="true" />
              휴무일 안내
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HolidayList
              holidays={data.upcoming_holidays}
              maxItems={5}
              showType
            />
          </CardContent>
        </Card>
      )}

      {/* 업데이트 정보 (전체 버전) */}
      <UpdateIndicator
        lastUpdate={new Date().toISOString()}
        isRefetching={isRefetching}
        refetchInterval={60}
      />
    </div>
  );
}

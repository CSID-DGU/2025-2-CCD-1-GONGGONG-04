/**
 * OperatingStatusSkeleton 컴포넌트
 * 운영 상태 로딩 스켈레톤
 *
 * @description
 * 운영 상태 컴포넌트들의 로딩 상태를 표시하는 스켈레톤 컴포넌트
 * - OperatingStatusBadge 스켈레톤
 * - OperatingHoursTable 스켈레톤
 * - HolidayList 스켈레톤
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 운영 상태 배지 스켈레톤
 *
 * @example
 * ```tsx
 * {isLoading ? <OperatingStatusBadgeSkeleton /> : <OperatingStatusBadge />}
 * ```
 */
export function OperatingStatusBadgeSkeleton() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full">
      <Skeleton className="h-4 w-4 rounded-full" aria-label="상태 아이콘 로딩 중" />
      <Skeleton className="h-4 w-16" aria-label="상태 텍스트 로딩 중" />
    </div>
  );
}

/**
 * 운영시간 테이블 스켈레톤
 *
 * @example
 * ```tsx
 * {isLoading ? <OperatingHoursTableSkeleton /> : <OperatingHoursTable />}
 * ```
 */
export function OperatingHoursTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">
          <Skeleton className="h-6 w-24" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" aria-busy="true" aria-label="운영시간 로딩 중">
          {/* 7일치 스켈레톤 행 */}
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b last:border-b-0 border-neutral-200"
            >
              {/* 요일 */}
              <Skeleton className="h-5 w-12" />

              {/* 운영시간 */}
              <Skeleton className="h-5 w-28" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 휴무일 목록 스켈레톤
 *
 * @param props - 컴포넌트 Props
 * @param props.itemCount - 스켈레톤 항목 개수 (기본: 5)
 *
 * @example
 * ```tsx
 * {isLoading ? <HolidayListSkeleton /> : <HolidayList />}
 * ```
 */
export function HolidayListSkeleton({ itemCount = 5 }: { itemCount?: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">
          <Skeleton className="h-6 w-20" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" aria-busy="true" aria-label="휴무일 목록 로딩 중">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg"
            >
              {/* 날짜 아이콘 */}
              <Skeleton className="h-5 w-5 rounded" />

              <div className="flex-1 space-y-2">
                {/* 날짜 */}
                <Skeleton className="h-5 w-32" />

                {/* 휴무일 이름 */}
                <Skeleton className="h-4 w-24" />
              </div>

              {/* 타입 배지 */}
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 운영 정보 섹션 전체 스켈레톤
 *
 * @description
 * 운영 상태 배지 + 운영시간 테이블 + 휴무일 목록 전체 스켈레톤
 *
 * @example
 * ```tsx
 * {isLoading ? <OperatingInfoSectionSkeleton /> : <OperatingInfoSection />}
 * ```
 */
export function OperatingInfoSectionSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="운영 정보 로딩 중">
      {/* 섹션 제목 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* 운영시간 테이블 */}
      <OperatingHoursTableSkeleton />

      {/* 휴무일 목록 */}
      <HolidayListSkeleton itemCount={3} />
    </div>
  );
}

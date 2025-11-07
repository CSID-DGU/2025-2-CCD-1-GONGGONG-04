/**
 * MapSkeleton 컴포넌트
 *
 * 지도 로딩 중 표시되는 스켈레톤 UI 컴포넌트
 * 지도 영역의 레이아웃을 미리 표시하여 CLS(Cumulative Layout Shift) 방지
 *
 * @component
 * @example
 * const { isLoaded } = useKakaoMapSDK();
 * if (!isLoaded) return <MapSkeleton />;
 */

import { cn } from '@/lib/utils';

/**
 * MapSkeleton Props
 */
interface MapSkeletonProps {
  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

export function MapSkeleton({ className }: MapSkeletonProps) {
  return (
    <div
      className={cn(
        'relative w-full h-full bg-neutral-100 rounded-lg overflow-hidden',
        className
      )}
      role="status"
      aria-label="지도 로딩 중"
    >
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]" />

      {/* 중앙 로딩 표시 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
        {/* 스피너 */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-neutral-300 border-t-lavender-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-lavender-500"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
        </div>

        {/* 로딩 텍스트 */}
        <div className="space-y-2 text-center">
          <p className="text-body text-neutral-700 font-medium">
            지도를 불러오는 중입니다
          </p>
          <p className="text-small text-neutral-500">잠시만 기다려주세요</p>
        </div>
      </div>

      {/* 상단 컨트롤 스켈레톤 */}
      <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
        <div className="flex-1 h-12 bg-white/80 rounded-lg animate-pulse" />
        <div className="w-12 h-12 bg-white/80 rounded-lg animate-pulse" />
      </div>

      {/* 우측 컨트롤 스켈레톤 */}
      <div className="absolute top-20 right-4 space-y-2">
        <div className="w-10 h-10 bg-white/80 rounded-lg animate-pulse" />
        <div className="w-10 h-10 bg-white/80 rounded-lg animate-pulse" />
      </div>

      {/* 하단 정보 카드 스켈레톤 */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/80 rounded-lg p-4 space-y-3 animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-3/4" />
          <div className="h-3 bg-neutral-200 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-8 bg-neutral-200 rounded flex-1" />
            <div className="h-8 bg-neutral-200 rounded flex-1" />
          </div>
        </div>
      </div>

      {/* 스크린 리더 전용 텍스트 */}
      <span className="sr-only">
        지도 로딩 중입니다. 잠시만 기다려주세요.
      </span>
    </div>
  );
}

/**
 * shimmer 애니메이션을 위한 Tailwind 설정 추가 필요:
 *
 * // tailwind.config.ts
 * keyframes: {
 *   shimmer: {
 *     '0%': { backgroundPosition: '-200% 0' },
 *     '100%': { backgroundPosition: '200% 0' },
 *   },
 * },
 * animation: {
 *   shimmer: 'shimmer 2s ease-in-out infinite',
 * },
 */

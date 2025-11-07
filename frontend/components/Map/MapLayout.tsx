/**
 * MapLayout 컴포넌트
 *
 * 지도 페이지의 반응형 레이아웃을 관리하는 컴포넌트
 * - 모바일: 전체 화면 지도 (헤더 + 탭바 제외)
 * - 태블릿/데스크톱: 헤더 제외한 전체 화면
 * - 최대 너비 1280px, 중앙 정렬
 *
 * @component
 * @example
 * <MapLayout>
 *   <KakaoMapView />
 * </MapLayout>
 */

import { cn } from '@/lib/utils';

/**
 * MapLayout Props
 */
interface MapLayoutProps {
  /**
   * 지도 컴포넌트 (children)
   */
  children: React.ReactNode;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

export function MapLayout({ children, className }: MapLayoutProps) {
  return (
    <div
      className={cn(
        // 기본 레이아웃
        'w-full mx-auto',

        // 높이 설정
        // 모바일: calc(100vh - 112px) - 헤더(64px) + 탭바(48px)
        // 태블릿/데스크톱: calc(100vh - 64px) - 헤더만
        'h-[calc(100vh-112px)] md:h-[calc(100vh-64px)]',

        // 최대 너비 제한 (데스크톱)
        'max-w-[1280px]',

        // Safe Area 대응 (iOS notch, 하단 탭바)
        'pb-safe-bottom',

        className
      )}
    >
      {/* 지도 컨테이너 */}
      <div className="relative w-full h-full">
        {children}
      </div>
    </div>
  );
}

/**
 * MapLayoutWithSidebar 컴포넌트
 *
 * 사이드바와 지도를 함께 표시하는 레이아웃 (데스크톱 전용)
 * 모바일/태블릿에서는 사이드바를 바텀시트로 표시
 *
 * @example
 * <MapLayoutWithSidebar sidebar={<FilterPanel />}>
 *   <KakaoMapView />
 * </MapLayoutWithSidebar>
 */
interface MapLayoutWithSidebarProps {
  /**
   * 지도 컴포넌트
   */
  children: React.ReactNode;

  /**
   * 사이드바 컴포넌트 (필터, 리스트 등)
   */
  sidebar: React.ReactNode;

  /**
   * 사이드바 위치 (기본값: left)
   */
  sidebarPosition?: 'left' | 'right';

  /**
   * 사이드바 너비 (데스크톱) (기본값: 320px)
   */
  sidebarWidth?: string;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

export function MapLayoutWithSidebar({
  children,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = '320px',
  className,
}: MapLayoutWithSidebarProps) {
  return (
    <div
      className={cn(
        // 기본 레이아웃
        'w-full mx-auto max-w-[1280px]',

        // 높이 설정
        'h-[calc(100vh-112px)] md:h-[calc(100vh-64px)]',

        // Flexbox 레이아웃 (데스크톱)
        'flex flex-col lg:flex-row',

        // Safe Area
        'pb-safe-bottom',

        className
      )}
    >
      {/* 사이드바 (데스크톱만 표시) */}
      <aside
        className={cn(
          // 데스크톱에서만 표시
          'hidden lg:block',

          // 사이드바 너비
          'flex-shrink-0',

          // 스크롤
          'overflow-y-auto',

          // 스타일
          'bg-white border-r border-neutral-200',

          // 위치에 따른 순서
          sidebarPosition === 'right' && 'order-2'
        )}
        style={{ width: sidebarWidth }}
      >
        {sidebar}
      </aside>

      {/* 지도 영역 */}
      <div className="relative flex-1 w-full h-full">
        {children}
      </div>

      {/* 모바일/태블릿: 사이드바를 바텀시트로 표시 */}
      <div className="lg:hidden">
        {/* 바텀시트 구현은 별도 컴포넌트로 분리 예정 */}
      </div>
    </div>
  );
}

/**
 * MapLayoutSplit 컴포넌트
 *
 * 지도와 리스트를 좌우 또는 상하로 분할 표시하는 레이아웃
 * - 모바일: 상하 분할 또는 토글
 * - 태블릿: 좌우 50:50 분할
 * - 데스크톱: 좌우 60:40 분할
 *
 * @example
 * <MapLayoutSplit list={<CenterList />}>
 *   <KakaoMapView />
 * </MapLayoutSplit>
 */
interface MapLayoutSplitProps {
  /**
   * 지도 컴포넌트
   */
  children: React.ReactNode;

  /**
   * 리스트 컴포넌트
   */
  list: React.ReactNode;

  /**
   * 분할 방향 (기본값: horizontal)
   * - horizontal: 좌우 분할 (태블릿/데스크톱)
   * - vertical: 상하 분할 (모바일)
   */
  splitDirection?: 'horizontal' | 'vertical';

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

export function MapLayoutSplit({
  children,
  list,
  splitDirection = 'horizontal',
  className,
}: MapLayoutSplitProps) {
  return (
    <div
      className={cn(
        // 기본 레이아웃
        'w-full mx-auto max-w-[1280px]',

        // 높이 설정
        'h-[calc(100vh-112px)] md:h-[calc(100vh-64px)]',

        // Flexbox 레이아웃
        'flex',
        splitDirection === 'horizontal'
          ? 'flex-col md:flex-row' // 모바일: 세로, 태블릿+: 가로
          : 'flex-col', // 항상 세로

        // Safe Area
        'pb-safe-bottom',

        className
      )}
    >
      {/* 지도 영역 */}
      <div
        className={cn(
          'relative',

          // 반응형 크기
          splitDirection === 'horizontal'
            ? [
                'h-1/2 md:h-full', // 모바일: 50%, 태블릿+: 100%
                'w-full md:w-1/2 lg:w-3/5', // 모바일: 100%, 태블릿: 50%, 데스크톱: 60%
              ]
            : 'h-1/2 w-full' // 세로 분할: 50%
        )}
      >
        {children}
      </div>

      {/* 리스트 영역 */}
      <div
        className={cn(
          'relative overflow-y-auto',

          // 반응형 크기
          splitDirection === 'horizontal'
            ? [
                'h-1/2 md:h-full', // 모바일: 50%, 태블릿+: 100%
                'w-full md:w-1/2 lg:w-2/5', // 모바일: 100%, 태블릿: 50%, 데스크톱: 40%
              ]
            : 'h-1/2 w-full', // 세로 분할: 50%

          // 스타일
          'bg-white border-t md:border-t-0 md:border-l border-neutral-200'
        )}
      >
        {list}
      </div>
    </div>
  );
}

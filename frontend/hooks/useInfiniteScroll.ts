/**
 * useInfiniteScroll Hook
 *
 * Sprint 2 - Day 10: 센터 리스트 뷰
 *
 * @description
 * Intersection Observer API를 사용한 무한 스크롤 훅
 *
 * @example
 * ```typescript
 * const { ref, inView } = useInfiniteScroll({
 *   onIntersect: () => fetchNextPage(),
 *   enabled: hasNextPage && !isFetchingNextPage,
 *   threshold: 0.5,
 *   rootMargin: '100px',
 * });
 *
 * return (
 *   <>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={ref}>Loading...</div>
 *   </>
 * );
 * ```
 */

import { useEffect, useRef, useState } from 'react';

/**
 * useInfiniteScroll 옵션
 */
export interface UseInfiniteScrollOptions {
  /**
   * 교차 시 호출되는 콜백
   */
  onIntersect?: () => void;

  /**
   * 옵저버 활성화 여부
   * @default true
   */
  enabled?: boolean;

  /**
   * 교차 감지 임계값 (0.0 ~ 1.0)
   * @default 0.5
   */
  threshold?: number;

  /**
   * root의 여백 (교차 영역 확장)
   * @default '0px'
   * @example '100px' - 요소가 100px 전에 감지됨
   */
  rootMargin?: string;

  /**
   * root 엘리먼트 (스크롤 컨테이너)
   * @default null (viewport)
   */
  root?: Element | null;
}

/**
 * useInfiniteScroll 반환 타입
 */
export interface UseInfiniteScrollReturn {
  /**
   * 관찰 대상 엘리먼트에 연결할 ref
   */
  ref: React.RefObject<HTMLDivElement>;

  /**
   * 현재 교차 상태
   */
  inView: boolean;
}

/**
 * Intersection Observer 기반 무한 스크롤 훅
 *
 * @param options - 무한 스크롤 옵션
 * @returns UseInfiniteScrollReturn - ref와 교차 상태
 */
export function useInfiniteScroll(
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const {
    onIntersect,
    enabled = true,
    threshold = 0.5,
    rootMargin = '0px',
    root = null,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // 비활성화 상태면 early return
    if (!enabled) {
      setInView(false);
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    // Intersection Observer 생성
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isIntersecting = entry.isIntersecting;

        setInView(isIntersecting);

        // 교차 시 콜백 호출
        if (isIntersecting && onIntersect) {
          onIntersect();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    // 엘리먼트 관찰 시작
    observer.observe(element);

    // 클린업: 관찰 중지
    return () => {
      observer.disconnect();
    };
  }, [enabled, threshold, rootMargin, root, onIntersect]);

  return {
    ref,
    inView,
  };
}

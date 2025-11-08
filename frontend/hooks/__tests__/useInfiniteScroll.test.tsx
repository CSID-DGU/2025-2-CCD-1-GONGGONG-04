/**
 * useInfiniteScroll Hook Tests
 *
 * Sprint 2 - Day 10: 센터 리스트 뷰
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, render } from '@testing-library/react';
import { useInfiniteScroll } from '../useInfiniteScroll';
import React from 'react';

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Set<Element>;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    this.elements = new Set();
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Test helper: 교차 상태 시뮬레이션
  triggerIntersection(isIntersecting: boolean) {
    const entries: IntersectionObserverEntry[] = Array.from(this.elements).map(
      (element) => ({
        isIntersecting,
        target: element,
        intersectionRatio: isIntersecting ? 1 : 0,
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      })
    );

    this.callback(entries, this as any);
  }
}

let mockObserver: MockIntersectionObserver | null = null;

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    // IntersectionObserver Mock 설정
    global.IntersectionObserver = vi.fn((callback) => {
      mockObserver = new MockIntersectionObserver(callback);
      return mockObserver as any;
    }) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockObserver = null;
  });

  // Test helper component
  function TestComponent({
    options,
    onInViewChange,
  }: {
    options?: Parameters<typeof useInfiniteScroll>[0];
    onInViewChange?: (inView: boolean) => void;
  }) {
    const { ref, inView } = useInfiniteScroll(options);
    React.useEffect(() => {
      onInViewChange?.(inView);
    }, [inView, onInViewChange]);
    return <div ref={ref} data-testid="target" />;
  }

  it('ref를 반환한다', () => {
    const { result } = renderHook(() => useInfiniteScroll());

    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull(); // 초기 상태
  });

  it('초기 inView 상태는 false이다', () => {
    const { result } = renderHook(() => useInfiniteScroll());

    expect(result.current.inView).toBe(false);
  });

  it('요소가 교차하면 inView가 true가 된다', async () => {
    const onInViewChange = vi.fn();
    render(<TestComponent onInViewChange={onInViewChange} />);

    // 교차 상태 시뮬레이션
    if (mockObserver) {
      mockObserver.triggerIntersection(true);
    }

    await waitFor(() => {
      expect(onInViewChange).toHaveBeenCalledWith(true);
    });
  });

  it('onIntersect 콜백이 호출된다', async () => {
    const onIntersect = vi.fn();
    render(<TestComponent options={{ onIntersect }} />);

    // 교차 시뮬레이션
    if (mockObserver) {
      mockObserver.triggerIntersection(true);
    }

    await waitFor(() => {
      expect(onIntersect).toHaveBeenCalled();
    });
  });

  it('enabled가 false면 onIntersect가 호출되지 않는다', async () => {
    const onIntersect = vi.fn();

    const { result } = renderHook(() =>
      useInfiniteScroll({ onIntersect, enabled: false })
    );

    // ref에 가상 엘리먼트 할당
    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    // 재렌더링
    const { rerender } = renderHook(() =>
      useInfiniteScroll({ onIntersect, enabled: false })
    );
    rerender();

    // 교차 시뮬레이션
    if (mockObserver) {
      mockObserver.triggerIntersection(true);
    }

    // onIntersect가 호출되지 않아야 함
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onIntersect).not.toHaveBeenCalled();
  });

  it('enabled가 false면 inView가 false로 설정된다', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({ enabled: false })
    );

    expect(result.current.inView).toBe(false);
  });

  it('threshold 옵션이 적용된다', () => {
    render(<TestComponent options={{ threshold: 0.8 }} />);

    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.8,
      })
    );
  });

  it('rootMargin 옵션이 적용된다', () => {
    render(<TestComponent options={{ rootMargin: '100px' }} />);

    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '100px',
      })
    );
  });

  it('root 옵션이 적용된다', () => {
    const rootElement = document.createElement('div');
    render(<TestComponent options={{ root: rootElement }} />);

    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        root: rootElement,
      })
    );
  });

  it('컴포넌트 언마운트 시 observer를 disconnect한다', () => {
    const { unmount } = render(<TestComponent />);

    // observer가 생성되었는지 확인
    expect(mockObserver).not.toBeNull();

    const disconnectSpy = vi.spyOn(mockObserver as any, 'disconnect');

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});

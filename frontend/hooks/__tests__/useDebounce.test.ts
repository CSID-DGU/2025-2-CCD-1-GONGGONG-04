/**
 * useDebounce Hook Tests
 *
 * Sprint 2 - Day 9: 주소 검색
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('초기값을 즉시 반환한다', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));

    expect(result.current).toBe('initial');
  });

  it('값이 변경되어도 지연 시간 전에는 이전 값을 유지한다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBe('first');

    // 값 변경
    rerender({ value: 'second' });

    // 아직 딜레이 전이므로 이전 값 유지
    expect(result.current).toBe('first');
  });

  it('지연 시간 후에 새로운 값으로 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    // 값 변경
    rerender({ value: 'second' });

    // 300ms 경과
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('second');
  });

  it('연속된 값 변경 시 마지막 값만 적용된다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    // 연속으로 값 변경
    rerender({ value: 'second' });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: 'third' });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: 'fourth' });

    // 마지막 변경 시점부터 300ms 후
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('fourth');
  });

  it('커스텀 지연 시간을 적용할 수 있다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });

    // 400ms 경과 (500ms 미만)
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe('first');

    // 추가 100ms 경과 (총 500ms)
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('second');
  });

  it('숫자 타입도 디바운스할 수 있다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 100 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });

  it('객체 타입도 디바운스할 수 있다', () => {
    const obj1 = { name: 'first' };
    const obj2 = { name: 'second' };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: obj1 } }
    );

    expect(result.current).toBe(obj1);

    rerender({ value: obj2 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(obj2);
  });

  it('컴포넌트 언마운트 시 타이머를 정리한다', () => {
    const { unmount } = renderHook(() => useDebounce('value', 300));

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

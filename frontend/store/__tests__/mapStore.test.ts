/**
 * MapStore Unit Tests
 *
 * Sprint 2 - Day 8
 */

import { renderHook, act } from '@testing-library/react';
import { useMapStore } from '../mapStore';

describe('MapStore', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    const { result } = renderHook(() => useMapStore());
    act(() => {
      result.current.reset();
    });
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useMapStore());

    expect(result.current.radius).toBe('5');
    expect(result.current.currentLocation).toBeNull();
    expect(result.current.map).toBeNull();
    expect(result.current.view).toBe('map');
    expect(result.current.showCircle).toBe(true);
  });

  it('should set radius correctly', () => {
    const { result } = renderHook(() => useMapStore());

    act(() => {
      result.current.setRadius('10');
    });

    expect(result.current.radius).toBe('10');
  });

  it('should set current location correctly', () => {
    const { result } = renderHook(() => useMapStore());

    act(() => {
      result.current.setCurrentLocation({ lat: 37.5665, lng: 126.978 });
    });

    expect(result.current.currentLocation).toEqual({
      lat: 37.5665,
      lng: 126.978,
    });
  });

  it('should toggle circle visibility', () => {
    const { result } = renderHook(() => useMapStore());

    const initialState = result.current.showCircle;

    act(() => {
      result.current.toggleCircle();
    });

    expect(result.current.showCircle).toBe(!initialState);
  });

  it('should set view mode correctly', () => {
    const { result } = renderHook(() => useMapStore());

    act(() => {
      result.current.setView('list');
    });

    expect(result.current.view).toBe('list');
  });

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useMapStore());

    // 상태 변경
    act(() => {
      result.current.setRadius('10');
      result.current.setView('list');
      result.current.setCurrentLocation({ lat: 37.5665, lng: 126.978 });
    });

    // 리셋
    act(() => {
      result.current.reset();
    });

    expect(result.current.radius).toBe('5');
    expect(result.current.view).toBe('map');
    expect(result.current.currentLocation).toBeNull();
  });
});

/**
 * useGeolocation Hook Tests
 *
 * Geolocation API 훅의 단위 테스트
 *
 * - 초기 상태 검증
 * - 위치 요청 로딩 상태
 * - 위치 획득 성공 처리
 * - 에러 처리 (PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT)
 * - Geolocation API 미지원 환경
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGeolocation } from '../useGeolocation';

describe('useGeolocation', () => {
  let mockGeolocation: {
    getCurrentPosition: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock navigator.geolocation
    mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };

    // Navigator 객체에 geolocation 주입
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() => useGeolocation());

      expect(result.current.position).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(typeof result.current.requestLocation).toBe('function');
    });
  });

  describe('위치 요청', () => {
    it('requestLocation 호출 시 loading 상태가 true가 되어야 함', () => {
      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.requestLocation();
      });

      expect(result.current.loading).toBe(true);
    });

    it('getCurrentPosition이 올바른 옵션으로 호출되어야 함', () => {
      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.requestLocation();
      });

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  });

  describe('위치 획득 성공', () => {
    it('위치 획득 성공 시 position이 업데이트되어야 함', async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 37.5665,
          longitude: 126.978,
          accuracy: 50,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        result.current.requestLocation();
      });

      expect(result.current.position).toEqual(mockPosition);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('에러 처리', () => {
    it('PERMISSION_DENIED 에러를 올바르게 처리해야 함', async () => {
      const mockError: GeolocationPositionError = {
        code: 1,
        message: 'User denied Geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        result.current.requestLocation();
      });

      expect(result.current.error?.code).toBe(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.position).toBeNull();
    });

    it('POSITION_UNAVAILABLE 에러를 올바르게 처리해야 함', async () => {
      const mockError: GeolocationPositionError = {
        code: 2,
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        result.current.requestLocation();
      });

      expect(result.current.error?.code).toBe(2);
      expect(result.current.loading).toBe(false);
    });

    it('TIMEOUT 에러를 올바르게 처리해야 함', async () => {
      const mockError: GeolocationPositionError = {
        code: 3,
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        result.current.requestLocation();
      });

      expect(result.current.error?.code).toBe(3);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Geolocation API 미지원', () => {
    it('Geolocation API가 없을 때 에러를 반환해야 함', async () => {
      // navigator.geolocation 제거
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        result.current.requestLocation();
      });

      expect(result.current.error?.code).toBe(2);
      expect(result.current.error?.message).toContain('지원되지 않는');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('상태 초기화', () => {
    it('위치 재요청 시 이전 에러가 초기화되어야 함', async () => {
      // 첫 번째 요청: 에러
      const mockError: GeolocationPositionError = {
        code: 1,
        message: 'Denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        result.current.requestLocation();
      });

      expect(result.current.error).not.toBeNull();

      // 두 번째 요청: 성공
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 37.5665,
          longitude: 126.978,
          accuracy: 50,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
        success(mockPosition);
      });

      await act(async () => {
        result.current.requestLocation();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.position).toEqual(mockPosition);
    });
  });
});

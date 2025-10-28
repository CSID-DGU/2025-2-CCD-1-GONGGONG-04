/**
 * useCenterStaff Hook Tests
 * 센터 의료진 현황 조회 훅 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useCenterStaff } from '../useCenterStaff';
import * as centersApi from '@/lib/api/centers';
import { StaffResponse } from '@/types/center';

// API 모킹
vi.mock('@/lib/api/centers');

// 테스트용 데이터
const mockStaffResponse: StaffResponse = {
  center_id: 1,
  staff: [
    {
      staff_type: '정신건강의학과 전문의',
      staff_count: 2,
      description: null,
    },
    {
      staff_type: '임상심리사',
      staff_count: 3,
      description: '청소년 상담 전문',
    },
  ],
  total_staff: 5,
  has_data: true,
};

// QueryClient 래퍼
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useCenterStaff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('centerId가 제공되면 의료진 데이터를 조회한다', async () => {
    vi.mocked(centersApi.getCenterStaff).mockResolvedValue(mockStaffResponse);

    const { result } = renderHook(() => useCenterStaff(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(centersApi.getCenterStaff).toHaveBeenCalledWith(1);
    expect(result.current.data).toEqual(mockStaffResponse);
  });

  it('centerId가 null일 경우 쿼리가 비활성화된다', () => {
    vi.mocked(centersApi.getCenterStaff).mockResolvedValue(mockStaffResponse);

    const { result } = renderHook(() => useCenterStaff(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(centersApi.getCenterStaff).not.toHaveBeenCalled();
  });

  it('API 호출이 실패하면 에러를 반환한다', async () => {
    const error = new Error('Failed to fetch staff');
    vi.mocked(centersApi.getCenterStaff).mockRejectedValue(error);

    const { result } = renderHook(() => useCenterStaff(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('centerId가 다르면 별도의 쿼리로 동작한다', async () => {
    vi.mocked(centersApi.getCenterStaff).mockResolvedValue(mockStaffResponse);

    const { result: result1 } = renderHook(() => useCenterStaff(1), {
      wrapper: createWrapper(),
    });

    const { result: result2 } = renderHook(() => useCenterStaff(2), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
      expect(result2.current.isSuccess).toBe(true);
    });

    // 각각 독립적으로 API 호출됨
    expect(centersApi.getCenterStaff).toHaveBeenCalledWith(1);
    expect(centersApi.getCenterStaff).toHaveBeenCalledWith(2);
  });

  it('데이터를 성공적으로 캐싱한다', async () => {
    vi.mocked(centersApi.getCenterStaff).mockResolvedValue(mockStaffResponse);

    const { result, rerender } = renderHook(() => useCenterStaff(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const firstCallCount = vi.mocked(centersApi.getCenterStaff).mock.calls.length;

    // 재렌더링해도 캐시된 데이터 사용 (staleTime 내)
    rerender();

    // API 호출 횟수가 증가하지 않음 (캐시 사용)
    expect(vi.mocked(centersApi.getCenterStaff).mock.calls.length).toBe(firstCallCount);
  });

  it('로딩 상태를 올바르게 반환한다', async () => {
    vi.mocked(centersApi.getCenterStaff).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockStaffResponse), 100);
        })
    );

    const { result } = renderHook(() => useCenterStaff(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isSuccess).toBe(true);
  });
});

/**
 * useCenterPrograms Hook Tests
 * 센터 프로그램 목록 조회 훅 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useCenterPrograms } from '../useCenterPrograms';
import * as centersApi from '@/lib/api/centers';
import { ProgramResponse } from '@/types/center';

// API 모킹
vi.mock('@/lib/api/centers');

// 테스트용 데이터
const mockProgramResponse: ProgramResponse = {
  center_id: 1,
  programs: [
    {
      id: 1,
      program_name: '직장인 스트레스 관리 프로그램',
      program_type: '집단 상담',
      target_group: '직장인',
      description: '주 1회, 8회기 프로그램',
      is_online_available: true,
      is_free: true,
      fee_amount: null,
      capacity: 12,
      duration_minutes: 90,
    },
  ],
  total_count: 1,
  has_data: true,
  pagination: {
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
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

describe('useCenterPrograms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('centerId가 제공되면 프로그램 데이터를 조회한다', async () => {
    vi.mocked(centersApi.getCenterPrograms).mockResolvedValue(
      mockProgramResponse
    );

    const { result } = renderHook(() => useCenterPrograms(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(centersApi.getCenterPrograms).toHaveBeenCalledWith(1, undefined);
    expect(result.current.data).toEqual(mockProgramResponse);
  });

  it('centerId가 null일 경우 쿼리가 비활성화된다', () => {
    vi.mocked(centersApi.getCenterPrograms).mockResolvedValue(
      mockProgramResponse
    );

    const { result } = renderHook(() => useCenterPrograms(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(centersApi.getCenterPrograms).not.toHaveBeenCalled();
  });

  it('필터를 포함하여 프로그램을 조회한다', async () => {
    vi.mocked(centersApi.getCenterPrograms).mockResolvedValue(
      mockProgramResponse
    );

    const filters = {
      target_group: '직장인',
      is_online: true,
      is_free: true,
    };

    const { result } = renderHook(() => useCenterPrograms(1, filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(centersApi.getCenterPrograms).toHaveBeenCalledWith(1, filters);
  });

  it('필터가 다르면 별도의 쿼리로 동작한다', async () => {
    vi.mocked(centersApi.getCenterPrograms).mockResolvedValue(
      mockProgramResponse
    );

    const filters1 = { target_group: '직장인' };
    const filters2 = { target_group: '청소년' };

    const { result: result1 } = renderHook(
      () => useCenterPrograms(1, filters1),
      {
        wrapper: createWrapper(),
      }
    );

    const { result: result2 } = renderHook(
      () => useCenterPrograms(1, filters2),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
      expect(result2.current.isSuccess).toBe(true);
    });

    // 각각 독립적으로 API 호출됨
    expect(centersApi.getCenterPrograms).toHaveBeenCalledWith(1, filters1);
    expect(centersApi.getCenterPrograms).toHaveBeenCalledWith(1, filters2);
  });

  it('API 호출이 실패하면 에러를 반환한다', async () => {
    const error = new Error('Failed to fetch programs');
    vi.mocked(centersApi.getCenterPrograms).mockRejectedValue(error);

    const { result } = renderHook(() => useCenterPrograms(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('데이터를 성공적으로 캐싱한다', async () => {
    vi.mocked(centersApi.getCenterPrograms).mockResolvedValue(
      mockProgramResponse
    );

    const { result, rerender } = renderHook(() => useCenterPrograms(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const firstCallCount = vi.mocked(centersApi.getCenterPrograms).mock.calls
      .length;

    // 재렌더링해도 캐시된 데이터 사용 (staleTime 내)
    rerender();

    // API 호출 횟수가 증가하지 않음 (캐시 사용)
    expect(vi.mocked(centersApi.getCenterPrograms).mock.calls.length).toBe(
      firstCallCount
    );
  });

  it('로딩 상태를 올바르게 반환한다', async () => {
    vi.mocked(centersApi.getCenterPrograms).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockProgramResponse), 100);
        })
    );

    const { result } = renderHook(() => useCenterPrograms(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it('필터가 undefined일 때도 정상 작동한다', async () => {
    vi.mocked(centersApi.getCenterPrograms).mockResolvedValue(
      mockProgramResponse
    );

    const { result } = renderHook(() => useCenterPrograms(1, undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(centersApi.getCenterPrograms).toHaveBeenCalledWith(1, undefined);
  });
});

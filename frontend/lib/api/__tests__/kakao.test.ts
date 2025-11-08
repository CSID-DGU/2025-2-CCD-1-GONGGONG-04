/**
 * Kakao API Client Tests
 *
 * Sprint 2 - Day 9: 주소 검색
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchAddress, AddressSearchError } from '../kakao';
import type { KakaoAddressResponse } from '@/types/address';

// Mock fetch
global.fetch = vi.fn();

// Store original env
const originalEnv = process.env.NEXT_PUBLIC_KAKAO_REST_KEY;

describe('searchAddress', () => {
  const mockApiKey = 'test_api_key_12345';

  beforeEach(() => {
    // Reset fetch mock
    vi.clearAllMocks();
    // Always set a valid API key by default
    process.env.NEXT_PUBLIC_KAKAO_REST_KEY = mockApiKey;
  });

  afterEach(() => {
    vi.resetAllMocks();
    // Restore original env
    process.env.NEXT_PUBLIC_KAKAO_REST_KEY = originalEnv;
  });

  it('주소 검색 성공 시 Address 배열을 반환한다', async () => {
    const mockResponse: KakaoAddressResponse = {
      meta: {
        total_count: 1,
        pageable_count: 1,
        is_end: true,
      },
      documents: [
        {
          address_name: '서울특별시 강남구 역삼동 123-45',
          road_address: {
            address_name: '서울특별시 강남구 테헤란로 123',
            building_name: '역삼빌딩',
          },
          x: '127.0276',
          y: '37.4979',
        },
      ],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await searchAddress('서울특별시 강남구 역삼동');

    expect(result).toEqual([
      {
        addressName: '서울특별시 강남구 역삼동 123-45',
        roadAddress: '서울특별시 강남구 테헤란로 123',
        buildingName: '역삼빌딩',
        x: 127.0276,
        y: 37.4979,
      },
    ]);
  });

  it('도로명 주소가 없는 경우에도 정상 처리한다', async () => {
    const mockResponse: KakaoAddressResponse = {
      meta: {
        total_count: 1,
        pageable_count: 1,
        is_end: true,
      },
      documents: [
        {
          address_name: '서울특별시 강남구 역삼동 123-45',
          x: '127.0276',
          y: '37.4979',
        },
      ],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await searchAddress('서울 강남구');

    expect(result).toEqual([
      {
        addressName: '서울특별시 강남구 역삼동 123-45',
        roadAddress: undefined,
        buildingName: undefined,
        x: 127.0276,
        y: 37.4979,
      },
    ]);
  });

  it('검색 결과가 없으면 빈 배열을 반환한다', async () => {
    const mockResponse: KakaoAddressResponse = {
      meta: {
        total_count: 0,
        pageable_count: 0,
        is_end: true,
      },
      documents: [],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await searchAddress('존재하지않는주소12345');

    expect(result).toEqual([]);
  });

  it('빈 문자열 입력 시 빈 배열을 반환한다', async () => {
    const result = await searchAddress('');

    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('공백만 있는 문자열 입력 시 빈 배열을 반환한다', async () => {
    const result = await searchAddress('   ');

    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('API 키가 없으면 AddressSearchError를 throw한다', async () => {
    // Explicitly remove API key for this test
    const temp = process.env.NEXT_PUBLIC_KAKAO_REST_KEY;
    delete process.env.NEXT_PUBLIC_KAKAO_REST_KEY;

    await expect(searchAddress('서울')).rejects.toThrow(AddressSearchError);
    await expect(searchAddress('서울')).rejects.toThrow(
      'Kakao REST API 키가 설정되지 않았습니다'
    );

    // Restore for subsequent tests
    process.env.NEXT_PUBLIC_KAKAO_REST_KEY = temp;
  });

  it('API 키가 기본값이면 AddressSearchError를 throw한다', async () => {
    // Temporarily set to default value
    const temp = process.env.NEXT_PUBLIC_KAKAO_REST_KEY;
    process.env.NEXT_PUBLIC_KAKAO_REST_KEY = 'YOUR_KAKAO_REST_API_KEY_HERE';

    await expect(searchAddress('서울')).rejects.toThrow(AddressSearchError);

    // Restore
    process.env.NEXT_PUBLIC_KAKAO_REST_KEY = temp;
  });

  it('HTTP 에러 시 AddressSearchError를 throw한다', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    await expect(searchAddress('서울')).rejects.toThrow(AddressSearchError);
    await expect(searchAddress('서울')).rejects.toThrow('주소 검색에 실패했습니다');
  });

  it('네트워크 에러 시 AddressSearchError를 throw한다', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    await expect(searchAddress('서울')).rejects.toThrow(AddressSearchError);
    await expect(searchAddress('서울')).rejects.toThrow(
      '주소 검색 중 오류가 발생했습니다'
    );
  });

  it('올바른 API 요청 URL과 헤더를 사용한다', async () => {
    const mockResponse: KakaoAddressResponse = {
      meta: { total_count: 0, pageable_count: 0, is_end: true },
      documents: [],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await searchAddress('서울특별시');

    expect(fetch).toHaveBeenCalledWith(
      'https://dapi.kakao.com/v2/local/search/address.json?query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C',
      {
        method: 'GET',
        headers: {
          Authorization: `KakaoAK ${mockApiKey}`,
        },
      }
    );
  });

  it('특수문자가 포함된 주소도 올바르게 인코딩한다', async () => {
    const mockResponse: KakaoAddressResponse = {
      meta: { total_count: 0, pageable_count: 0, is_end: true },
      documents: [],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    await searchAddress('서울 강남구 테헤란로 123');

    expect(fetch).toHaveBeenCalled();
    const callUrl = (fetch as any).mock.calls[0][0];
    expect(callUrl).toContain('query=');
    expect(callUrl).toContain('%20'); // 공백이 인코딩되었는지 확인
  });

  it('여러 검색 결과를 올바르게 변환한다', async () => {
    const mockResponse: KakaoAddressResponse = {
      meta: {
        total_count: 2,
        pageable_count: 2,
        is_end: true,
      },
      documents: [
        {
          address_name: '서울특별시 강남구 역삼동 123-45',
          road_address: {
            address_name: '서울특별시 강남구 테헤란로 123',
          },
          x: '127.0276',
          y: '37.4979',
        },
        {
          address_name: '서울특별시 강남구 역삼동 678-90',
          road_address: {
            address_name: '서울특별시 강남구 테헤란로 456',
          },
          x: '127.0300',
          y: '37.5000',
        },
      ],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await searchAddress('서울 강남구');

    expect(result).toHaveLength(2);
    expect(result[0].x).toBe(127.0276);
    expect(result[1].x).toBe(127.03);
  });
});

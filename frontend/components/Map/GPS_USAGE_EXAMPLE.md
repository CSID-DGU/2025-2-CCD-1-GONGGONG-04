# GPS 위치 기능 사용 예시

Sprint 2 Day 7에서 구현된 GPS 위치 기능의 통합 사용 예시입니다.

## 파일 구조

```
frontend/
├── hooks/
│   ├── useGeolocation.ts               # GPS 위치 훅
│   ├── __tests__/
│   │   └── useGeolocation.test.ts      # 단위 테스트 (9개 테스트 통과)
│   └── index.ts                        # Export 추가됨
├── components/
│   ├── LocationPermissionDialog.tsx    # 위치 권한 다이얼로그
│   └── Map/
│       ├── CurrentLocationMarker.tsx   # 현재 위치 마커
│       └── index.ts                    # Export 추가됨
└── types/
    └── geolocation.ts                  # 타입 정의
```

## 기본 사용법

### 1. 단순 위치 요청

```tsx
'use client';

import { useGeolocation } from '@/hooks';
import { LocationPermissionDialog } from '@/components/LocationPermissionDialog';

export default function MapPage() {
  const { position, error, loading, requestLocation } = useGeolocation();

  return (
    <div>
      {/* 위치 권한 다이얼로그 */}
      <LocationPermissionDialog
        open={!position && !error}
        onAllow={requestLocation}
        onDeny={() => console.log('주소 검색으로 전환')}
        error={error}
      />

      {/* 위치 정보 표시 */}
      {loading && <p>위치를 가져오는 중...</p>}
      {position && (
        <div>
          <p>위도: {position.coords.latitude}</p>
          <p>경도: {position.coords.longitude}</p>
          <p>정확도: ±{Math.round(position.coords.accuracy)}m</p>
        </div>
      )}
      {error && <p>오류: {error.message}</p>}
    </div>
  );
}
```

## 지도 통합 예시

### 2. Kakao Map + GPS 위치 마커

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useKakaoMapSDK, useGeolocation } from '@/hooks';
import {
  KakaoMapView,
  MapSkeleton,
  CurrentLocationMarker
} from '@/components/Map';
import { LocationPermissionDialog } from '@/components/LocationPermissionDialog';

export default function MapWithGPS() {
  const { isLoaded, isError } = useKakaoMapSDK();
  const { position, error, loading, requestLocation } = useGeolocation();
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [searchMode, setSearchMode] = useState<'gps' | 'address'>('gps');

  // 자동으로 위치 권한 요청 (옵션)
  useEffect(() => {
    if (isLoaded && searchMode === 'gps') {
      requestLocation();
    }
  }, [isLoaded, searchMode, requestLocation]);

  // 지도 로딩 중
  if (!isLoaded || isError) {
    return <MapSkeleton />;
  }

  return (
    <div className="relative h-screen w-full">
      {/* 위치 권한 다이얼로그 */}
      <LocationPermissionDialog
        open={searchMode === 'gps' && !position && !error}
        onAllow={requestLocation}
        onDeny={() => setSearchMode('address')}
        error={error}
      />

      {/* 지도 */}
      <KakaoMapView
        center={
          position
            ? {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }
            : { lat: 37.5665, lng: 126.978 } // 서울시청 기본값
        }
        level={3}
        onMapReady={setMap}
      >
        {/* 현재 위치 마커 (GPS 모드) */}
        {searchMode === 'gps' && position && map && (
          <CurrentLocationMarker
            map={map}
            position={position}
            showAccuracyFeedback
          />
        )}
      </KakaoMapView>

      {/* 검색 모드 전환 버튼 */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setSearchMode('gps')}
          className={`px-4 py-2 rounded ${
            searchMode === 'gps'
              ? 'bg-lavender-500 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          현재 위치
        </button>
        <button
          onClick={() => setSearchMode('address')}
          className={`px-4 py-2 rounded ${
            searchMode === 'address'
              ? 'bg-lavender-500 text-white'
              : 'bg-white text-gray-700'
          }`}
        >
          주소 검색
        </button>
      </div>
    </div>
  );
}
```

## 고급 사용법

### 3. 위치 기반 센터 검색

```tsx
'use client';

import { useGeolocation } from '@/hooks';
import { useCenterData } from '@/hooks';
import { CenterMarkers } from '@/components/Map';

export default function NearbycentersMap() {
  const { position, requestLocation } = useGeolocation();

  // 현재 위치 기반 센터 검색 (5km 반경)
  const { data: centers, isLoading } = useCenterData({
    lat: position?.coords.latitude,
    lng: position?.coords.longitude,
    radius: 5000, // 5km
    enabled: !!position,
  });

  return (
    <div>
      <button onClick={requestLocation}>현재 위치에서 센터 찾기</button>

      {position && (
        <p>
          현재 위치: {position.coords.latitude.toFixed(4)},
          {position.coords.longitude.toFixed(4)}
        </p>
      )}

      {isLoading && <p>센터 검색 중...</p>}

      {centers && (
        <div>
          <p>주변 센터 {centers.length}개 발견</p>
          {/* 센터 목록 표시 */}
        </div>
      )}
    </div>
  );
}
```

## 에러 처리 패턴

### 4. 에러별 UI 분기

```tsx
'use client';

import { useGeolocation } from '@/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LocationErrorHandling() {
  const { position, error, requestLocation } = useGeolocation();

  // 에러 코드별 처리
  const getErrorUI = () => {
    if (!error) return null;

    switch (error.code) {
      case 1: // PERMISSION_DENIED
        return (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              위치 권한이 거부되었습니다.
              <br />
              브라우저 설정 &gt; 개인정보 보호 &gt; 위치 권한에서 허용해주세요.
            </AlertDescription>
          </Alert>
        );

      case 2: // POSITION_UNAVAILABLE
        return (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              GPS 신호를 찾을 수 없습니다. 주소 검색을 이용해주세요.
            </AlertDescription>
          </Alert>
        );

      case 3: // TIMEOUT
        return (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              위치 요청 시간이 초과되었습니다.
              <button
                onClick={requestLocation}
                className="ml-2 text-lavender-600 underline"
              >
                다시 시도
              </button>
            </AlertDescription>
          </Alert>
        );

      default:
        return null;
    }
  };

  return <div>{getErrorUI()}</div>;
}
```

## 타입 정의 활용

### 5. 정확도 레벨 사용

```tsx
import { getAccuracyLevel } from '@/types/geolocation';

function AccuracyBadge({ accuracy }: { accuracy: number }) {
  const level = getAccuracyLevel(accuracy);

  const colorClass = {
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }[level.color];

  return (
    <div className={`px-3 py-1 rounded-full border ${colorClass}`}>
      {level.message} (±{Math.round(accuracy)}m)
    </div>
  );
}
```

## 테스트

### 6. Hook 테스트 예시

```typescript
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useGeolocation } from '@/hooks';

describe('useGeolocation in real app', () => {
  it('should handle permission grant flow', async () => {
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

    // Mock geolocation
    const mockGetCurrentPosition = vi.fn((success) => {
      success(mockPosition);
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    // Act: Request location
    await act(async () => {
      result.current.requestLocation();
    });

    // Assert: Position obtained
    expect(result.current.position).toEqual(mockPosition);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
```

## 브라우저 호환성

### 지원 브라우저
- Chrome 5+
- Firefox 3.5+
- Safari 5+
- Edge 12+
- iOS Safari 3.2+
- Android Browser 2.1+

### 미지원 환경 처리
```tsx
const { error } = useGeolocation();

if (error?.code === 2 && error?.message.includes('지원되지 않는')) {
  return (
    <Alert>
      현재 브라우저는 위치 서비스를 지원하지 않습니다.
      최신 브라우저로 업데이트해주세요.
    </Alert>
  );
}
```

## 성능 최적화

### Geolocation 옵션 조정

```typescript
// useGeolocation.ts에서 옵션 커스터마이징
navigator.geolocation.getCurrentPosition(
  successCallback,
  errorCallback,
  {
    enableHighAccuracy: true,  // GPS 사용 (배터리 소모 증가)
    timeout: 10000,             // 10초 타임아웃
    maximumAge: 300000,         // 5분 캐시 (재요청 시 빠름)
  }
);
```

### 추천 설정
- **정확도 우선**: `enableHighAccuracy: true`, `maximumAge: 0`
- **배터리 절약**: `enableHighAccuracy: false`, `maximumAge: 600000` (10분)
- **균형**: `enableHighAccuracy: true`, `maximumAge: 300000` (5분) ✅ 기본값

## 참고 자료

- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Kakao Maps JavaScript API](https://apis.map.kakao.com/web/)
- 프로젝트 문서: `context/공통_UI_UX_가이드라인.md`

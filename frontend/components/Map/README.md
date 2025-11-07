# Map Components - Kakao Map SDK Integration

Sprint 1 Day 3: Kakao Map SDK 통합 및 지도 기반 검색 구현

## 개요

Kakao Maps JavaScript SDK를 사용하여 지도 기반 센터 검색 기능을 제공합니다.

## 구성 요소

### 1. TypeScript 타입 선언 (`types/kakao.maps.d.ts`)

Kakao Maps API의 TypeScript 타입 정의를 제공합니다.

- `kakao.maps.Map`: 지도 객체
- `kakao.maps.LatLng`: 좌표 객체
- `kakao.maps.Marker`: 마커 객체
- `kakao.maps.InfoWindow`: 정보창 객체
- 기타 지도 관련 클래스 및 인터페이스

### 2. SDK 로딩 훅 (`hooks/useKakaoMapSDK.ts`)

Kakao Map SDK를 동적으로 로드하고 상태를 관리합니다.

```typescript
const { isLoaded, isError, error } = useKakaoMapSDK();
```

**반환값:**
- `isLoaded`: SDK 로딩 완료 여부
- `isError`: 에러 발생 여부
- `error`: 에러 객체 (있을 경우)

**특징:**
- 자동 스크립트 태그 생성 및 삽입
- 중복 로딩 방지
- 클린업 처리
- SSR 호환

### 3. 컴포넌트

#### MapSkeleton

지도 로딩 중 표시되는 스켈레톤 UI입니다.

```tsx
<MapSkeleton className="w-full h-screen" />
```

**특징:**
- Shimmer 애니메이션
- 로딩 스피너 및 메시지
- 스켈레톤 UI (검색바, 컨트롤, 정보 카드)
- 접근성 지원 (role="status", aria-label)

#### KakaoMapView

Kakao Map을 렌더링하는 메인 컴포넌트입니다.

```tsx
<KakaoMapView
  center={{ lat: 37.5665, lng: 126.978 }}
  level={12}
  onMapLoad={(map) => {
    // 지도 로드 완료 후 처리
    console.log('지도 준비 완료', map);
  }}
  className="w-full h-full"
/>
```

**Props:**
- `center`: 지도 초기 중심 좌표 (기본값: 서울시청)
- `level`: 지도 확대/축소 레벨 (1-14, 기본값: 12)
- `onMapLoad`: 지도 로드 완료 콜백
- `className`: 추가 CSS 클래스

**특징:**
- 자동 SDK 로딩 및 초기화
- 에러 처리 (에러 UI 표시)
- 윈도우 리사이즈 대응
- 클린업 처리

#### MapLayout

지도 페이지의 반응형 레이아웃 컴포넌트입니다.

```tsx
<MapLayout>
  <KakaoMapView />
</MapLayout>
```

**특징:**
- 반응형 높이 설정
  - 모바일: `calc(100vh - 112px)` (헤더 64px + 탭바 48px)
  - 태블릿/데스크톱: `calc(100vh - 64px)` (헤더만)
- 최대 너비 1280px, 중앙 정렬
- Safe Area 대응 (iOS notch, 하단 홈 인디케이터)

**추가 레이아웃 옵션:**

1. **MapLayoutWithSidebar**: 사이드바 + 지도

```tsx
<MapLayoutWithSidebar
  sidebar={<FilterPanel />}
  sidebarPosition="left"
  sidebarWidth="320px"
>
  <KakaoMapView />
</MapLayoutWithSidebar>
```

2. **MapLayoutSplit**: 지도 + 리스트 분할

```tsx
<MapLayoutSplit
  list={<CenterList />}
  splitDirection="horizontal"
>
  <KakaoMapView />
</MapLayoutSplit>
```

## 환경 설정

### 1. Kakao Map API 키 발급

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. 플랫폼 추가: Web (사이트 도메인 등록)
4. JavaScript 키 복사

### 2. 환경 변수 설정

`frontend/.env.local` 파일에 API 키를 추가합니다:

```bash
NEXT_PUBLIC_KAKAO_MAP_KEY=YOUR_KAKAO_MAP_API_KEY_HERE
```

**주의:**
- `NEXT_PUBLIC_` 접두사는 필수입니다 (클라이언트에서 접근 가능하도록)
- API 키는 절대 Git에 커밋하지 마세요 (`.env.local`은 `.gitignore`에 포함)

## 페이지 구조

### `/map` 페이지

```
frontend/app/map/
├── page.tsx              # 서버 컴포넌트 (메타데이터, SEO)
└── MapPageClient.tsx     # 클라이언트 컴포넌트 (지도 로직)
```

**page.tsx:**
- 서버 컴포넌트
- 메타데이터 설정 (title, description, OG tags)
- SEO 최적화

**MapPageClient.tsx:**
- 클라이언트 컴포넌트 (`'use client'`)
- 지도 초기화 및 상태 관리
- 사용자 인터랙션 처리

## 사용 예시

### 기본 지도 표시

```tsx
'use client';

import { KakaoMapView, MapLayout } from '@/components/Map';

export default function MapPage() {
  return (
    <MapLayout>
      <KakaoMapView
        center={{ lat: 37.5665, lng: 126.978 }}
        level={12}
      />
    </MapLayout>
  );
}
```

### 마커 추가

```tsx
'use client';

import { useState } from 'react';
import { KakaoMapView, MapLayout } from '@/components/Map';

export default function MapPage() {
  const [map, setMap] = useState<kakao.maps.Map | null>(null);

  const handleMapLoad = (loadedMap: kakao.maps.Map) => {
    setMap(loadedMap);

    // 마커 생성
    const markerPosition = new kakao.maps.LatLng(37.5665, 126.978);
    const marker = new kakao.maps.Marker({
      position: markerPosition,
      map: loadedMap,
    });

    // 인포윈도우 생성
    const infowindow = new kakao.maps.InfoWindow({
      content: '<div style="padding:5px;">서울시청</div>',
    });

    // 마커 클릭 이벤트
    kakao.maps.event.addListener(marker, 'click', () => {
      infowindow.open(loadedMap, marker);
    });
  };

  return (
    <MapLayout>
      <KakaoMapView onMapLoad={handleMapLoad} />
    </MapLayout>
  );
}
```

### 현재 위치 표시

```tsx
'use client';

import { useEffect, useState } from 'react';
import { KakaoMapView, MapLayout } from '@/components/Map';

export default function MapPage() {
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [currentPosition, setCurrentPosition] = useState({
    lat: 37.5665,
    lng: 126.978,
  });

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  const handleMapLoad = (loadedMap: kakao.maps.Map) => {
    setMap(loadedMap);

    // 현재 위치 마커
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(
        currentPosition.lat,
        currentPosition.lng
      ),
      map: loadedMap,
    });
  };

  return (
    <MapLayout>
      <KakaoMapView
        center={currentPosition}
        level={3}
        onMapLoad={handleMapLoad}
      />
    </MapLayout>
  );
}
```

## 테스트 방법

### 1. 개발 서버 실행

```bash
cd frontend
pnpm run dev
```

### 2. 브라우저에서 확인

http://localhost:3000/map 접속

### 3. 테스트 체크리스트

- [ ] 지도가 정상적으로 로드되는가?
- [ ] 로딩 스켈레톤이 표시되는가?
- [ ] 에러 발생 시 에러 UI가 표시되는가?
- [ ] 지도 드래그/줌이 정상 작동하는가?
- [ ] 윈도우 리사이즈 시 지도가 재조정되는가?
- [ ] 모바일/태블릿/데스크톱 반응형이 정상 작동하는가?
- [ ] 개발자 콘솔에 에러가 없는가?

### 4. 디버깅

**지도가 표시되지 않는 경우:**

1. API 키 확인
   ```bash
   # .env.local 파일 확인
   cat frontend/.env.local
   ```

2. 콘솔 에러 확인
   - 브라우저 개발자 도구 > Console 탭
   - "Kakao Map API 키가 설정되지 않았습니다" 에러 확인

3. 네트워크 요청 확인
   - 개발자 도구 > Network 탭
   - `dapi.kakao.com` 요청 상태 확인

4. 도메인 등록 확인
   - Kakao Developers 콘솔에서 사이트 도메인 등록 확인
   - 로컬 개발: `http://localhost:3000` 등록

## 다음 단계 (Day 4-5)

- [ ] 센터 마커 표시 기능
- [ ] 마커 클러스터링
- [ ] 센터 정보 인포윈도우
- [ ] 현재 위치 버튼
- [ ] 지도 이동 시 센터 목록 업데이트
- [ ] 검색 기능 통합
- [ ] 필터 패널 통합

## 트러블슈팅

### API 키 관련

**문제:** "Kakao Map API 키가 설정되지 않았습니다"

**해결:**
1. `.env.local` 파일이 존재하는지 확인
2. `NEXT_PUBLIC_KAKAO_MAP_KEY` 값이 올바른지 확인
3. 개발 서버 재시작

### 도메인 등록 관련

**문제:** "APIKEY_VALIDATION_ERROR"

**해결:**
1. Kakao Developers 콘솔 접속
2. 플랫폼 > Web 설정
3. 사이트 도메인에 `http://localhost:3000` 추가

### SSR 관련

**문제:** "window is not defined"

**해결:**
- `KakaoMapView` 컴포넌트는 이미 `'use client'` 지시어를 사용합니다
- 부모 컴포넌트에서도 `'use client'`가 필요한 경우 추가

## 참고 문서

- [Kakao Maps API 문서](https://apis.map.kakao.com/web/)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [프로젝트 UI/UX 가이드라인](../../../context/only-read-frontend/공통_UI_UX_가이드라인.md)

# Layout 컴포넌트

공통 레이아웃 및 네비게이션 컴포넌트 모음

## 컴포넌트 목록

### MainLayout.tsx
전체 페이지 레이아웃을 관리하는 컨테이너 컴포넌트

**주요 기능**:
- 상단 헤더 (제목, 뒤로가기 버튼)
- 하단 네비게이션 바
- 반응형 디자인 (모바일, 태블릿, 데스크탑)
- Safe Area 대응 (iOS notch, 홈 인디케이터)
- 접근성 표준 준수 (WCAG AA)

**사용 예시**:
```tsx
import MainLayout from '@/components/layout/MainLayout';

<MainLayout
  title="센터 찾기"
  showBackButton={true}
  showBottomNav={true}
>
  <YourPageContent />
</MainLayout>
```

### BottomNavigation.tsx
하단 고정 네비게이션 바

**탭 구성**:
- 지도 검색 (Map)
- 센터 목록 (Centers)
- 자가진단 (Assessment)

## 개발 가이드

### 색상
- 배경: `bg-white`
- 테두리: `border-neutral-200`
- 텍스트: `text-neutral-900`
- 활성 상태: `lavender-500`

### 타이포그래피
- 제목: `text-h2` (24px/600)

### 접근성
- 모든 인터랙티브 요소에 `aria-label` 제공
- 시맨틱 HTML 사용 (`header`, `main`, `nav`)
- 키보드 네비게이션 지원

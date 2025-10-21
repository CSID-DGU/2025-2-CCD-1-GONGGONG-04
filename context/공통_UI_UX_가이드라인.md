# 마음이음 (MindConnect) 공통 UI/UX 가이드라인

> 모든 화면 개발 시 공통으로 적용되는 UI/UX 규칙 및 패턴

## 목차
1. [브랜드 아이덴티티 및 디자인 원칙](#1-브랜드-아이덴티티-및-디자인-원칙)
2. [색상 시스템](#2-색상-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [네비게이션 패턴](#4-네비게이션-패턴)
5. [에러 처리 및 예외 상황](#5-에러-처리-및-예외-상황)
6. [사용자 피드백 시스템](#6-사용자-피드백-시스템)
7. [반응형 디자인](#7-반응형-디자인)
8. [터치/마우스 인터랙션](#8-터치마우스-인터랙션)
9. [접근성 (Accessibility)](#9-접근성-accessibility)
10. [애니메이션 및 트랜지션](#10-애니메이션-및-트랜지션)
11. [데이터 표시 규칙](#11-데이터-표시-규칙)
12. [성능 및 최적화](#12-성능-및-최적화)
13. [컴포넌트 재사용 규칙](#13-컴포넌트-재사용-규칙)

---

## 1. 브랜드 아이덴티티 및 디자인 원칙

### 1.1 핵심 가치
- **신뢰**: 정확한 정보와 안정적인 서비스 제공
- **접근성**: 누구나 쉽게 사용할 수 있는 직관적 인터페이스
- **따뜻함**: 정신건강 서비스의 특성을 고려한 부드럽고 친근한 톤
- **전문성**: 공공 서비스로서의 신뢰도와 전문성 유지

### 1.2 디자인 철학
- **직관적**: 학습 곡선 없이 즉시 이해 가능한 UI
- **모던**: 현대적이고 깔끔한 인터페이스
- **절제된 감성**: 과도하게 귀엽거나 캐주얼하지 않은 균형잡힌 디자인
- **정보 우선**: 장식보다 정보 전달에 집중

### 1.3 톤앤매너

#### 시각적 톤
- **색상**: 부드러운 lavender 계열의 차분한 색감
- **형태**: 둥근 모서리(8-12px)로 친근함 표현
- **공간**: 여유있는 여백으로 편안함 제공

#### 텍스트 톤
- **존댓말 사용**: "~하세요", "~해주세요"
- **간결한 안내**: 불필요한 수식어 최소화
- **긍정적 표현**: 부정적 단어 대신 긍정적 대안 사용
  - ❌ "잘못된 입력입니다"
  - ✅ "다시 확인해주세요"

---

## 2. 색상 시스템

### 2.1 브랜드 색상

#### 메인 색상 (Lavender)
```css
lavender-500: #A855F7  /* 메인 브랜드 색상 - Primary 버튼, 강조 */
lavender-600: #9333EA  /* 호버/액티브 상태 */
lavender-400: #C084FC  /* 그라디언트 시작점 */
lavender-100: #F3E8FF  /* 연한 배경, 선택 상태 */
```

**사용 규칙**:
- Primary 액션 버튼: `lavender-500` 기본, `lavender-600` 호버
- 선택/활성 상태 배경: `lavender-100`
- 브랜드 강조 요소: 그라디언트 활용 (`.gradient-lavender`)

### 2.2 시맨틱 색상

```css
/* 운영 상태 */
status-operating: #10B981   /* 초록 - 현재 운영 중 */
status-closed: #9CA3AF      /* 회색 - 운영 종료 */
status-emergency: #EF4444   /* 빨강 - 긴급/위험 */
status-warning: #F59E0B     /* 주황 - 경고/주의 */
```

**사용 규칙**:
- 운영 중: `status-operating` 배지 + "운영 중" 텍스트
- 운영 종료: `status-closed` 배지 + 반투명 처리
- 에러/긴급: `status-emergency` 배경 + 흰색 텍스트
- 경고: `status-warning` 배경 + 어두운 텍스트

### 2.3 중립 색상

```css
neutral-900: #111827  /* 제목, 본문 텍스트 */
neutral-600: #4B5563  /* 보조 텍스트 */
neutral-400: #9CA3AF  /* 비활성 텍스트 */
neutral-200: #E5E7EB  /* 구분선, 테두리 */
neutral-100: #F3F4F6  /* 배경, 카드 */
neutral-50: #F9FAFB   /* 페이지 배경 */
```

### 2.4 색상 사용 원칙

#### 계층 구조
1. **Primary (lavender-500)**: 주요 액션, 브랜드 강조
2. **Semantic**: 상태 표시 (운영, 에러, 경고)
3. **Neutral**: 텍스트, 배경, 구조

#### 접근성
- **텍스트 대비**: 최소 4.5:1 (WCAG AA 준수)
- **큰 텍스트 대비**: 최소 3:1 (18pt 이상)
- **색상만으로 정보 전달 금지**: 아이콘, 텍스트 병행 사용

#### 금지 사항
- ❌ 흰 배경에 연한 회색 텍스트 (대비 부족)
- ❌ 빨강-초록만으로 상태 구분 (색맹 고려)
- ❌ 3개 이상 색상 동시 사용 (혼란 방지)

---

## 3. 타이포그래피

### 3.1 폰트 계층

| 레벨 | 클래스 | 크기/두께 | 용도 | 예시 |
|------|--------|-----------|------|------|
| H1 | `text-h1` | 28px / 700 | 페이지 최상단 제목 | "정신건강복지센터 찾기" |
| H2 | `text-h2` | 24px / 600 | 섹션 제목 | "내 주변 센터", "검색 결과" |
| H3 | `text-h3` | 20px / 600 | 카드 제목, 컴포넌트 제목 | "강남구정신건강복지센터" |
| Body | `text-body` | 16px / 400 | 본문, 설명 | 센터 설명, 안내 문구 |
| Small | `text-small` | 14px / 400 | 보조 정보 | 운영시간, 거리 정보 |
| Caption | `text-caption` | 12px / 400 | 라벨, 캡션 | 태그, 상태 배지 |

### 3.2 폰트 패밀리

```css
/* 우선순위 */
font-family:
  'Pretendard',        /* Primary - 한글 최적화 */
  'Noto Sans KR',      /* Fallback - 구글 폰트 */
  -apple-system,       /* iOS/macOS 시스템 폰트 */
  BlinkMacSystemFont,  /* macOS */
  sans-serif;          /* 기본 sans-serif */
```

**로딩 최적화**:
```html
<!-- Pretendard preload -->
<link rel="preload" href="/fonts/Pretendard.woff2" as="font" type="font/woff2" crossorigin>
```

### 3.3 가독성 규칙

#### 행간 (Line Height)
```css
H1-H3: 1.2  /* 제목은 좁게 */
Body: 1.6   /* 본문은 넓게 */
Small/Caption: 1.4
```

#### 문단 너비
- **최대 너비**: 640px (한글 기준 약 40자)
- **모바일**: 화면 너비 - 좌우 여백 (32px)
- **이유**: 눈의 이동 거리 최소화, 가독성 향상

#### 자간 (Letter Spacing)
```css
H1: -0.02em  /* 큰 제목은 좁게 */
Body: 0      /* 본문은 기본값 */
Caption: 0.01em  /* 작은 텍스트는 넓게 */
```

### 3.4 사용 예시

```tsx
// 페이지 제목
<h1 className="text-h1 text-neutral-900">정신건강복지센터 찾기</h1>

// 섹션 제목
<h2 className="text-h2 text-neutral-800 mb-4">검색 결과</h2>

// 카드 제목
<h3 className="text-h3 text-neutral-900">강남구정신건강복지센터</h3>

// 본문
<p className="text-body text-neutral-700">
  우울증, 스트레스 상담 전문 센터입니다.
</p>

// 보조 정보
<span className="text-small text-neutral-600">750m · 도보 10분</span>

// 라벨
<label className="text-caption text-neutral-500">센터 유형</label>
```

---

## 4. 네비게이션 패턴

### 4.1 전역 네비게이션

#### 모바일 - 하단 탭바
```
┌─────────────────────────────────┐
│                                 │
│         페이지 콘텐츠             │
│                                 │
├─────────────────────────────────┤
│ [홈] [지도] [추천] [정보] [MY]   │ ← 하단 고정
└─────────────────────────────────┘
```

**구조**:
- 높이: 56px + Safe Area
- 아이콘 크기: 24x24px
- 활성 탭: lavender-500 + 볼드 라벨
- 비활성 탭: neutral-400 + 아이콘만

**규칙**:
- 5개 항목 고정 (추가 항목은 더보기 메뉴 활용)
- 뱃지 표시 가능 (MY 탭 - 즐겨찾기 개수)
- 현재 페이지 하이라이트 필수

#### 데스크톱 - 상단 네비게이션
```
┌──────────────────────────────────────────────────────┐
│ 로고 | 지도로 찾기 | 맞춤 추천 | 정신건강 정보 | [검색] [MY] │
└──────────────────────────────────────────────────────┘
```

**구조**:
- 높이: 64px
- 최대 너비: 1280px (중앙 정렬)
- 우측: 검색, 마이페이지 아이콘

### 4.2 페이지 전환 규칙

#### 전체 페이지 이동
**사용처**:
- 센터 상세 페이지
- 정보 콘텐츠 (게시글, 아티클)
- 마이페이지

**동작**:
- 브라우저 히스토리 추가
- 뒤로가기 가능
- URL 변경

#### 모달 (Dialog)
**사용처**:
- 로그인/회원가입
- 확인 대화상자
- 공유하기

**동작**:
- 배경 딤(dim) 처리
- ESC로 닫기
- 외부 클릭 닫기 (선택적)
- 히스토리 추가 안 함

#### 바텀시트 (Sheet)
**사용처**:
- 필터 패널
- 정렬 옵션
- 빠른 액션 메뉴

**동작**:
- 하단에서 올라오는 애니메이션
- 드래그로 닫기 가능
- 배경 딤 처리
- 모바일 최적화

### 4.3 뒤로가기 동작

#### 브라우저 뒤로가기
```
페이지 A → 페이지 B → [뒤로가기] → 페이지 A
```

#### 모달 내 뒤로가기
```
페이지 → 모달 열림 → [뒤로가기] → 모달 닫힘 (페이지 유지)
```

#### 폼 작성 중 뒤로가기
```
폼 입력 중 → [뒤로가기] 클릭 → 확인 팝업 표시

"작성 중인 내용이 사라집니다.
 계속하시겠습니까?"
[취소] [나가기]
```

**구현 예시**:
```tsx
const handleBack = () => {
  if (hasUnsavedChanges) {
    if (confirm('작성 중인 내용이 사라집니다. 계속하시겠습니까?')) {
      router.back();
    }
  } else {
    router.back();
  }
};
```

### 4.4 딥링크 지원

#### URL 구조
```
/center/{id}           → 센터 상세 페이지
/search?q={keyword}    → 검색 결과
/map?lat={lat}&lng={lng}&zoom={z}  → 지도 위치
/info/{category}/{id}  → 정보 콘텐츠
```

#### 공유 기능
- 모든 주요 페이지는 고유 URL 제공
- URL 복사 시 자동으로 클립보드에 저장
- SNS 공유 시 메타 태그 최적화

---

## 5. 에러 처리 및 예외 상황

### 5.1 네트워크 에러

#### 오프라인 상태
```
┌─────────────────────────────────┐
│ ⚠️ 인터넷 연결을 확인해주세요      │ ← 상단 배너 (status-warning)
└─────────────────────────────────┘
```

**동작**:
- 화면 상단에 고정 배너 표시
- 즐겨찾기 센터는 캐시에서 표시 (기본 정보만)
- 온라인 복구 시 자동 새로고침
- "다시 시도" 버튼 제공

**구현**:
```tsx
// 오프라인 감지
useEffect(() => {
  const handleOffline = () => setIsOffline(true);
  const handleOnline = () => {
    setIsOffline(false);
    refetchData(); // 자동 새로고침
  };

  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);
}, []);
```

#### API 오류
```
┌─────────────────────────────────┐
│    ⚠️                            │
│  일시적인 오류가 발생했습니다       │
│  잠시 후 다시 시도해주세요          │
│                                 │
│  [다시 시도]  [홈으로]            │
└─────────────────────────────────┘
```

**재시도 로직**:
- 자동 재시도: 3회 (3초 간격)
- 3회 실패 시 에러 화면 표시
- 사용자 수동 재시도 가능

**구현**:
```tsx
const fetchWithRetry = async (url: string, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};
```

### 5.2 입력값 검증

#### 검증 규칙
```tsx
// 검색어
const validateSearch = (query: string) => {
  if (query.length < 1) return '검색어를 입력해주세요';
  if (query.length > 50) return '검색어는 50자 이내로 입력해주세요';
  if (/[<>'"]/g.test(query)) return '특수문자는 사용할 수 없습니다';
  return null; // 유효함
};
```

#### 오류 표시
```
┌─────────────────────────────────┐
│ 검색어 입력                       │
│ [                            ]  │
│ ❌ 검색어는 50자 이내로 입력해주세요 │ ← 빨간색, 3초 후 자동 사라짐
└─────────────────────────────────┘
```

**위치**: 입력 필드 하단
**색상**: `status-emergency` (빨간색)
**표시 시간**: 3초 (자동 사라짐) 또는 입력 수정 시

### 5.3 권한 에러

#### 위치 권한
```
┌─────────────────────────────────┐
│    📍                            │
│  위치 기반 서비스를 사용하려면      │
│  권한이 필요합니다                 │
│                                 │
│  [설정으로 이동]  [취소]          │
└─────────────────────────────────┘
```

**재요청 규칙**:
- 거부 후 3일 간 재요청 안 함
- 기능 사용 시도 시에만 안내
- "다시 보지 않기" 옵션 제공 금지 (항상 재요청 가능)

### 5.4 빈 결과 (Empty State)

#### 검색 결과 없음
```
┌─────────────────────────────────┐
│         🔍                       │
│    검색 결과가 없습니다            │
│                                 │
│  • 검색어를 다시 확인해주세요       │
│  • 다른 키워드로 검색해보세요       │
│                                 │
│    [전체 센터 보기]               │
└─────────────────────────────────┘
```

#### 즐겨찾기 없음
```
┌─────────────────────────────────┐
│         ⭐                       │
│   즐겨찾기한 센터가 없습니다        │
│                                 │
│  자주 찾는 센터를 즐겨찾기에        │
│  추가해보세요                     │
│                                 │
│    [센터 찾아보기]                │
└─────────────────────────────────┘
```

**구성 요소**:
- 아이콘 (시각적 표현)
- 제목 (상황 설명)
- 해결 방법 제시
- CTA 버튼 (다음 액션 유도)

---

## 6. 사용자 피드백 시스템

### 6.1 로딩 상태

#### 스켈레톤 UI
**사용처**: 센터 리스트, 상세 정보, 카드 그리드

**표시 타이밍**:
- 0.3초 이후 표시 (깜빡임 방지)
- 0.3초 이내 로딩 완료 시 스켈레톤 생략

**디자인**:
- 실제 레이아웃과 동일한 구조
- 배경: `neutral-200`
- 애니메이션: 반짝이는 그라디언트 효과

```tsx
// 카드 스켈레톤 예시
<div className="animate-pulse">
  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
</div>
```

#### 스피너
**사용처**:
- 전체 화면 로딩: 중앙 배치, 크기 48px
- 부분 로딩: 해당 영역 내, 크기 24px
- 버튼 로딩: 버튼 내부, 크기 16px

**색상**: `lavender-500`

#### 프로그레스 바
**사용처**:
- 무한 스크롤 하단
- 파일 업로드
- 단계별 프로세스

### 6.2 액션 피드백

#### 즐겨찾기 토글
**추가 시**:
```
별 아이콘 애니메이션 (0.3초)
  ☆ → 회전 + 확대 → ★

하단 토스트 (2초):
"즐겨찾기에 추가되었습니다"
```

**삭제 시**:
```
하단 토스트 (5초):
"즐겨찾기에서 삭제되었습니다  [실행취소]"
```

**실행취소**:
- 5초 내 클릭 시 삭제 취소
- 5초 경과 시 토스트 자동 사라짐

#### 복사 완료
```
중앙 토스트 (1.5초):
"✓ 클립보드에 복사되었습니다"
```

**특징**:
- 화면 중앙 하단에 표시
- 1.5초 후 자동 사라짐
- 체크마크 아이콘 포함

#### 저장 완료
```
하단 토스트 (2초):
"✓ 저장되었습니다"
```

### 6.3 안내 메시지

#### 툴팁 (첫 방문자)
```
순차 표시:
1. "검색어를 입력하거나 현재 위치를 사용하세요" (검색바)
2. "필터로 원하는 조건의 센터를 찾아보세요" (필터 버튼)
3. "센터를 클릭하면 상세 정보를 볼 수 있어요" (지도 마커)

각 툴팁:
- 화살표로 대상 지정
- [다음] 버튼으로 이동
- [다시 보지 않기] 체크박스
- [건너뛰기] 버튼
```

**재표시**:
- 마이페이지 > 도움말에서 언제든 다시 볼 수 있음
- localStorage에 상태 저장

#### 인라인 도움말
```
[?] 아이콘 → 호버/클릭 시 툴팁 표시

예시:
"운영 중" [?]
→ "현재 시간 기준으로 운영 중인 센터입니다"
```

---

## 7. 반응형 디자인

### 7.1 브레이크포인트

```css
/* Tailwind breakpoints */
default: 320px   /* 모바일 세로 (기본) */
sm: 640px        /* 모바일 가로, 작은 태블릿 */
md: 768px        /* 태블릿 */
lg: 1024px       /* 데스크톱 */
xl: 1280px       /* 큰 데스크톱 */
2xl: 1536px      /* 초대형 화면 */
```

### 7.2 레이아웃 변화

#### 모바일 (320-767px)
```
┌─────────────────┐
│   검색바        │
├─────────────────┤
│                 │
│   지도 또는     │ ← 토글 전환
│   리스트        │
│                 │
├─────────────────┤
│  하단 탭바      │
└─────────────────┘
```

**특징**:
- 단일 컬럼 레이아웃
- 지도/리스트 토글 전환
- 바텀시트 형태 필터
- 전체 화면 활용

#### 태블릿 (768-1023px)
```
┌─────────────────────────────────┐
│         상단 네비게이션           │
├──────────────┬──────────────────┤
│              │                  │
│    지도      │     리스트       │ ← 2단 분할
│              │                  │
└──────────────┴──────────────────┘
```

**특징**:
- 2컬럼 레이아웃 (지도 + 리스트)
- 모달 형태 필터
- 카드 2열 그리드

#### 데스크톱 (1024px+)
```
┌─────────────────────────────────────────┐
│            상단 네비게이션               │
├────────┬──────────────┬─────────────────┤
│ 사이드 │              │                 │
│ 바     │    지도      │     리스트      │ ← 3단 분할
│ (필터) │              │                 │
└────────┴──────────────┴─────────────────┘
```

**특징**:
- 3컬럼 레이아웃
- 사이드 패널 필터 (항상 표시)
- 카드 3열 그리드
- 최대 너비 1280px

### 7.3 모바일 우선 설계

#### 기본 원칙
```tsx
// 모바일 기본 → 큰 화면 추가
<div className="text-body md:text-h3 lg:text-h2">

// ❌ 잘못된 예시
<div className="text-h2 md:text-body">  // 큰 화면부터 정의
```

#### 터치 타겟
- **최소 크기**: 44x44px (Apple HIG, Android Material 권장)
- **간격**: 최소 8px
- **적용 대상**: 버튼, 링크, 체크박스, 라디오 버튼

```tsx
// 유틸리티 클래스 활용
<button className="touch-target">  // 최소 44x44px 보장
```

#### Safe Area 대응
```css
/* iOS notch, 하단 탭바 영역 */
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

**적용 대상**:
- 상단 헤더
- 하단 탭바
- 전체 화면 모달

---

## 8. 터치/마우스 인터랙션

### 8.1 터치 인터랙션 (모바일)

#### 기본 제스처
```
탭 (Tap): 선택, 클릭
더블 탭 (Double Tap): 지도 줌 인
롱 프레스 (Long Press): 컨텍스트 메뉴, 주소 표시
스와이프 (Swipe): 카드 삭제, 페이지 전환
핀치 (Pinch): 지도 줌 인/아웃
드래그 (Drag): 지도 이동, 바텀시트 조절
```

#### 스와이프 액션
```
┌─────────────────────────────────┐
│  센터 카드                       │
│  ← 왼쪽으로 스와이프              │
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│ 센터 카드        │ [♡ 즐겨찾기] │
└─────────────────────────────────┘
```

**구현 가이드**:
- 스와이프 거리: 최소 60px
- 애니메이션: 0.3초
- 복원: 터치 끝나면 원위치

#### 당겨서 새로고침
```
리스트 최상단에서 아래로 당김
       ↓
   🔄 스피너 표시
       ↓
   데이터 새로고침
```

**활성화 조건**:
- 스크롤 위치 = 0 (최상단)
- 당김 거리: 최소 80px

#### 전화 바로 걸기
```tsx
// 전화번호 링크
<a href="tel:02-1234-5678" className="text-body text-lavender-500">
  📞 02-1234-5678
</a>
```

**동작**: 탭 시 네이티브 다이얼러 앱 실행

#### 길찾기 연동
```tsx
// iOS: Apple Maps
// Android: Google Maps
const openMaps = (lat: number, lng: number) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const url = isIOS
    ? `maps://maps.apple.com/?daddr=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url);
};
```

### 8.2 마우스 인터랙션 (데스크톱)

#### 호버 효과
```css
/* 카드 */
.card {
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);  /* .hover-lift */
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

/* 버튼 */
.button:hover {
  filter: brightness(0.9);
}

/* 링크 */
.link:hover {
  text-decoration: underline;
}
```

#### 우클릭 메뉴
```tsx
<div onContextMenu={(e) => {
  e.preventDefault();
  showContextMenu([
    { label: '새 탭에서 열기', action: openNewTab },
    { label: '링크 복사', action: copyLink },
    { label: '공유하기', action: share }
  ]);
}}>
```

**적용 대상**:
- 센터 카드
- 지도 마커
- 링크

#### 키보드 단축키
```
/ : 검색창 포커스
Esc : 모달/패널 닫기
Tab : 다음 요소로 이동
Shift + Tab : 이전 요소로 이동
Enter : 선택/실행
Space : 체크박스 토글
Arrow Keys : 리스트 탐색
```

**구현**:
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === '/' && !isInputFocused) {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 8.3 포커스 관리

#### 포커스 링 스타일
```css
.focus-ring:focus-visible {
  outline: 2px solid #A855F7;  /* lavender-500 */
  outline-offset: 2px;
  border-radius: 4px;
}

/* 마우스 클릭 시 포커스 링 숨김 */
.focus-ring:focus:not(:focus-visible) {
  outline: none;
}
```

#### 포커스 순서
```
Tab Index 규칙:
1. 자연스러운 DOM 순서 따르기
2. tabindex="0": 포커스 가능하게 만들기
3. tabindex="-1": 프로그래밍 방식으로만 포커스
4. tabindex="1+": 사용 금지 (순서 혼란)
```

#### 모달 포커스 트랩
```tsx
// 모달 열릴 때
useEffect(() => {
  if (isOpen) {
    const firstFocusable = modalRef.current?.querySelector('button, [href], input');
    firstFocusable?.focus();

    // 모달 내부로 포커스 제한
    document.body.style.overflow = 'hidden';
  }
}, [isOpen]);
```

---

## 9. 접근성 (Accessibility)

### 9.1 키보드 네비게이션

#### 기본 원칙
- **모든 인터랙티브 요소**: 키보드로 접근 가능
- **포커스 표시**: 항상 시각적으로 명확하게
- **논리적 순서**: Tab 이동 순서가 시각적 순서와 일치

#### 포커스 가능 요소
```tsx
// 버튼
<button className="focus-ring">클릭</button>

// 커스텀 버튼 (div 사용 시)
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  className="focus-ring"
>
  클릭
</div>
```

### 9.2 ARIA 속성

#### 필수 ARIA 패턴
```tsx
// 버튼
<button aria-label="검색">
  <SearchIcon />
</button>

// 링크
<a href="/center/123" aria-label="강남구정신건강복지센터 상세보기">
  자세히 보기
</a>

// 상태 표시
<div role="status" aria-live="polite">
  검색 결과 {count}개
</div>

// 로딩
<div role="alert" aria-live="assertive" aria-busy="true">
  로딩 중...
</div>

// 탭
<div role="tablist">
  <button role="tab" aria-selected={isActive} aria-controls="panel-1">
    탭 1
  </button>
</div>

// 체크박스
<input
  type="checkbox"
  aria-checked={checked}
  aria-label="주차 가능 필터"
/>
```

#### ARIA Live Regions
```tsx
// 검색 결과 업데이트
<div aria-live="polite" aria-atomic="true">
  {count}개의 센터를 찾았습니다
</div>

// 에러 메시지
<div role="alert" aria-live="assertive">
  ❌ 검색어를 입력해주세요
</div>
```

**차이점**:
- `polite`: 현재 작업 끝난 후 알림 (검색 결과)
- `assertive`: 즉시 알림 (에러, 경고)

### 9.3 색상 대비

#### WCAG AA 기준
```
일반 텍스트 (16px 미만): 최소 4.5:1
큰 텍스트 (18pt+ 또는 14pt+ 볼드): 최소 3:1
UI 요소 (버튼, 입력 필드): 최소 3:1
```

#### 검증 도구
```bash
# npm 패키지
npm install --save-dev axe-core @axe-core/react

# 개발 중 자동 검사
import { axe } from '@axe-core/react';
if (process.env.NODE_ENV !== 'production') {
  axe(React, ReactDOM, 1000);
}
```

#### 색상만으로 정보 전달 금지
```tsx
// ❌ 나쁜 예
<div className="text-status-operating">운영 중</div>

// ✅ 좋은 예
<div className="text-status-operating">
  <CheckIcon aria-hidden="true" /> 운영 중
</div>
```

### 9.4 스크린 리더 지원

#### 대체 텍스트
```tsx
// 이미지
<img src="/logo.png" alt="마음이음 로고" />

// 장식용 이미지 (alt 비우기)
<img src="/decoration.png" alt="" aria-hidden="true" />

// 아이콘
<HeartIcon aria-label="즐겨찾기" />

// 배경 이미지 (CSS)
<div
  className="bg-hero"
  role="img"
  aria-label="정신건강 상담 센터"
/>
```

#### 숨김 콘텐츠
```tsx
// 스크린 리더 전용 텍스트
<span className="sr-only">
  새 창에서 열림
</span>

// 스크린 리더에서 숨김
<div aria-hidden="true">
  <DecorativeIcon />
</div>
```

```css
/* sr-only 클래스 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

#### 랜드마크 역할
```tsx
<header role="banner">
  <nav role="navigation" aria-label="메인 네비게이션">
    {/* 네비게이션 */}
  </nav>
</header>

<main role="main">
  <section aria-labelledby="search-heading">
    <h2 id="search-heading">센터 검색</h2>
    {/* 검색 콘텐츠 */}
  </section>
</main>

<aside role="complementary" aria-label="필터">
  {/* 필터 옵션 */}
</aside>

<footer role="contentinfo">
  {/* 푸터 */}
</footer>
```

---

## 10. 애니메이션 및 트랜지션

### 10.1 타이밍 기준

```css
/* 기본 트랜지션 */
transition: all 0.3s ease;

/* 빠른 피드백 */
transition: all 0.15s ease;  /* 버튼 클릭, 호버 */

/* 복잡한 애니메이션 */
transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);  /* 모달, 페이지 전환 */

/* 레이아웃 변화 */
transition: all 0.4s ease-in-out;  /* 사이드바, 아코디언 */
```

### 10.2 이징 함수

```css
/* Material Design Easing */
ease: cubic-bezier(0.25, 0.1, 0.25, 1);           /* 기본 */
ease-in: cubic-bezier(0.42, 0, 1, 1);             /* 시작 느리게 */
ease-out: cubic-bezier(0, 0, 0.58, 1);            /* 끝 느리게 */
ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);      /* 양끝 느리게 */

/* 커스텀 (추천) */
cubic-bezier(0.4, 0, 0.2, 1);  /* Material 표준 */
```

### 10.3 공통 애니메이션

#### 페이드 인/아웃
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease;
}
```

#### 슬라이드 업 (바텀시트)
```css
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.slide-up {
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### 호버 리프트 효과
```css
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

#### 스켈레톤 반짝임
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 50%,
    #f3f4f6 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

#### 즐겨찾기 애니메이션
```css
@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(1.1); }
  75% { transform: scale(1.2); }
}

.heart-beat {
  animation: heartBeat 0.3s ease;
}
```

### 10.4 로딩 애니메이션

#### 스피너
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

#### 프로그레스 바
```css
@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-bar {
  animation: progress 1.5s ease-in-out infinite;
}
```

#### 스켈레톤 표시 타이밍
```tsx
const [showSkeleton, setShowSkeleton] = useState(false);

useEffect(() => {
  // 0.3초 후에만 스켈레톤 표시 (깜빡임 방지)
  const timer = setTimeout(() => {
    if (isLoading) setShowSkeleton(true);
  }, 300);

  return () => clearTimeout(timer);
}, [isLoading]);
```

### 10.5 모션 감소 대응

```css
/* 사용자가 모션 감소 선호 시 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**적용**:
- 모든 애니메이션 비활성화
- 전환 효과 최소화
- 접근성 향상 (멀미, 전정기관 장애 고려)

---

## 11. 데이터 표시 규칙

### 11.1 날짜/시간 포맷

#### 운영시간
```
형식: HH:MM
예시: 09:00~18:00

특수 케이스:
- 24시간 운영: "24시간 운영"
- 휴무일: "휴무"
- 미정: "운영시간 문의 필요"
```

#### 상대적 시간
```
방금 전           (0~1분)
5분 전           (1~59분)
1시간 전         (1~23시간)
어제             (24~48시간)
2일 전           (2~6일)
1주일 전         (7~13일)
2주일 전         (14~29일)
YYYY.MM.DD       (30일 이상)

구현:
const formatRelativeTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  // ... 계속
};
```

#### 실시간 운영 상태
```tsx
const OperatingStatus = ({ hours }: { hours: string }) => {
  const now = new Date();
  const [startHour, endHour] = parseHours(hours);
  const isOperating = now.getHours() >= startHour && now.getHours() < endHour;

  if (isOperating) {
    return (
      <Badge className="badge-operating">
        🕐 운영 중 (~{endHour}:00)
      </Badge>
    );
  }

  return (
    <Badge className="badge-closed">
      마감 (내일 {startHour}:00 오픈)
    </Badge>
  );
};
```

### 11.2 거리 표시

```
규칙:
- 1km 미만: m 단위 (750m)
- 1km 이상: km 단위, 소수점 1자리 (1.2km)
- 10km 이상: km 단위, 정수 (12km)

예시:
350m
750m
1.2km
2.5km
15km

구현:
const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  if (meters < 10000) return `${(meters / 1000).toFixed(1)}km`;
  return `${Math.round(meters / 1000)}km`;
};
```

#### 도보 시간 추가
```
형식: 거리 · 도보 시간
예시: 750m · 도보 10분

계산 기준:
- 평균 보행 속도: 4km/h (분당 67m)
- 반올림: 5분 단위

const estimateWalkTime = (meters: number) => {
  const minutes = Math.round(meters / 67 / 5) * 5;
  return `도보 ${minutes}분`;
};
```

### 11.3 전화번호 포맷

```
규칙:
- 서울: 02-XXXX-XXXX
- 지역: 0XX-XXX(X)-XXXX
- 휴대폰: 010-XXXX-XXXX

예시:
02-1234-5678
031-123-4567
010-1234-5678

구현:
const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('02')) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  return cleaned.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
};
```

#### 링크화
```tsx
<a
  href={`tel:${phoneNumber.replace(/-/g, '')}`}
  className="text-lavender-500 hover:underline"
>
  📞 {formatPhoneNumber(phoneNumber)}
</a>
```

### 11.4 주소 표시

```
전체 주소:
서울특별시 강남구 테헤란로 123, 4층

약식 주소 (카드):
서울 강남구 테헤란로 123

최소 주소 (뱃지):
강남구

우편번호 포함:
(06234) 서울특별시 강남구 테헤란로 123
```

### 11.5 빈 상태 처리

#### 텍스트 규칙
```
긍정적 표현:
❌ "데이터가 없습니다"
✅ "아직 등록된 센터가 없습니다"

해결책 제시:
❌ "검색 결과가 없습니다"
✅ "검색 결과가 없습니다. 다른 키워드로 검색해보세요"

행동 유도:
"첫 번째 센터를 즐겨찾기에 추가해보세요"
```

#### 구조
```tsx
<EmptyState
  icon="🔍"
  title="검색 결과가 없습니다"
  description="검색어를 다시 확인하거나 다른 키워드로 시도해보세요"
  action={
    <Button variant="primary">전체 센터 보기</Button>
  }
/>
```

---

## 12. 성능 및 최적화

### 12.1 디바운싱/스로틀링

#### 검색 입력 (디바운싱)
```tsx
import { useDebouncedValue } from '@/hooks/useDebounce';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchAutocomplete(debouncedQuery);
    }
  }, [debouncedQuery]);
};
```

**타이밍**: 300ms

#### 지도 이동 (스로틀링)
```tsx
import { useThrottle } from '@/hooks/useThrottle';

const MapComponent = () => {
  const handleMapMove = useThrottle((newBounds) => {
    fetchCentersInBounds(newBounds);
  }, 1000);
};
```

**타이밍**: 1000ms (1초)

#### 무한 스크롤 (스로틀링)
```tsx
const handleScroll = useThrottle(() => {
  const scrollBottom = window.innerHeight + window.scrollY;
  const threshold = document.body.offsetHeight - 300;

  if (scrollBottom >= threshold && !isLoading && hasMore) {
    loadMore();
  }
}, 200);
```

**타이밍**: 200ms

### 12.2 이미지 최적화

#### Next.js Image 컴포넌트
```tsx
import Image from 'next/image';

<Image
  src="/images/center-photo.jpg"
  alt="센터 사진"
  width={400}
  height={300}
  loading="lazy"  // 지연 로딩
  placeholder="blur"  // 블러 플레이스홀더
  quality={85}  // 품질 (기본 75)
/>
```

#### 반응형 이미지
```tsx
<Image
  src="/images/hero.jpg"
  alt="히어로 이미지"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority  // LCP 이미지는 우선 로딩
/>
```

#### 외부 이미지 도메인 설정
```js
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### 12.3 폰트 최적화

#### Preload
```html
<!-- _document.tsx -->
<link
  rel="preload"
  href="/fonts/Pretendard-Regular.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

#### 폰트 Display 전략
```css
@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard.woff2') format('woff2');
  font-display: swap;  /* FOIT 방지 */
  font-weight: 400;
  font-style: normal;
}
```

**전략**:
- `swap`: 폴백 폰트 먼저 표시 (권장)
- `optional`: 100ms 내 로딩 실패 시 폴백 사용

### 12.4 코드 스플리팅

#### 동적 import
```tsx
import dynamic from 'next/dynamic';

// 지도 컴포넌트 (무거움)
const MapComponent = dynamic(() => import('@/components/Map'), {
  loading: () => <MapSkeleton />,
  ssr: false,  // 서버 렌더링 제외
});

// 모달 컴포넌트
const LoginModal = dynamic(() => import('@/components/LoginModal'));
```

#### 라우트 기반 스플리팅
```tsx
// Next.js는 pages/ 디렉토리 기준 자동 스플리팅
// pages/map.tsx → 별도 번들
// pages/center/[id].tsx → 별도 번들
```

### 12.5 Lighthouse 성능 목표

```yaml
Performance: >= 90
Accessibility: >= 95
Best Practices: >= 90
SEO: >= 95

Core Web Vitals:
  LCP (Largest Contentful Paint): < 2.5s
  FID (First Input Delay): < 100ms
  CLS (Cumulative Layout Shift): < 0.1
```

#### LCP 개선
- Hero 이미지 우선 로딩 (`priority`)
- 폰트 preload
- Critical CSS 인라인화

#### FID 개선
- JavaScript 번들 크기 최소화
- 코드 스플리팅
- 긴 작업 분할 (requestIdleCallback)

#### CLS 개선
- 이미지 크기 명시 (width, height)
- 폰트 display: swap
- 동적 콘텐츠 공간 예약

---

## 13. 컴포넌트 재사용 규칙

### 13.1 shadcn 기본 컴포넌트

#### 그대로 사용
```tsx
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet } from '@/components/ui/sheet';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { RadioGroup } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Tooltip } from '@/components/ui/tooltip';
```

**원칙**: shadcn 기본 스타일로 충분한 경우 수정 없이 사용

### 13.2 커스터마이징 필요 컴포넌트

#### Button
```tsx
// components/ui/button.tsx 수정
const buttonVariants = cva(
  "base-styles",
  {
    variants: {
      variant: {
        default: "bg-neutral-900",
        primary: "bg-lavender-500 hover:bg-lavender-600",
        secondary: "bg-white border border-neutral-200",
        lavender: "bg-gradient-to-r from-lavender-400 to-lavender-600",
        operating: "bg-status-operating",
        emergency: "bg-status-emergency",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-6 text-lg",
        touch: "h-[44px] px-6 py-2",  // 모바일 터치 최적화
      },
    },
  }
);
```

**사용**:
```tsx
<Button variant="lavender" size="touch">
  검색
</Button>
```

#### Card
```tsx
// components/ui/card.tsx 수정
<Card className="rounded-card shadow-soft hover:shadow-card transition-shadow">
  {children}
</Card>
```

**커스텀 클래스**:
```css
.rounded-card {
  border-radius: 12px;
}

.shadow-soft {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.shadow-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

#### Badge
```tsx
// components/ui/badge.tsx 수정
const badgeVariants = cva(
  "base-styles",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-900",
        operating: "badge-operating",
        closed: "badge-closed",
        emergency: "bg-status-emergency/10 text-status-emergency",
      },
    },
  }
);
```

```css
.badge-operating {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-closed {
  background: rgba(156, 163, 175, 0.1);
  color: #6B7280;
}
```

### 13.3 커스텀 합성 컴포넌트

#### CenterCard
```tsx
// components/custom/CenterCard.tsx
interface CenterCardProps {
  center: Center;
  onFavorite: (id: string) => void;
}

export const CenterCard = ({ center, onFavorite }: CenterCardProps) => (
  <Card className="hover:shadow-card">
    <CardHeader>
      <div className="flex justify-between items-start">
        <Badge variant={center.isOperating ? 'operating' : 'closed'}>
          {center.operatingStatus}
        </Badge>
        <Button variant="ghost" size="sm" onClick={() => onFavorite(center.id)}>
          <HeartIcon />
        </Button>
      </div>
      <CardTitle className="text-h3">{center.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-small text-neutral-600">
        📍 {center.distance} · {center.walkTime}
      </p>
      <p className="text-small text-neutral-600">
        📞 {center.phone}
      </p>
    </CardContent>
  </Card>
);
```

#### SearchBar
```tsx
// components/custom/SearchBar.tsx
export const SearchBar = () => (
  <div className="relative">
    <Input
      placeholder="센터명, 지역, 증상을 검색하세요"
      className="pl-10"
    />
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" />
    <Button variant="ghost" size="sm" className="absolute right-2">
      <FilterIcon />
    </Button>
  </div>
);
```

#### OperatingStatus
```tsx
// components/custom/OperatingStatus.tsx
export const OperatingStatus = ({ hours }: { hours: string }) => {
  const { isOperating, closingTime, nextOpenTime } = useOperatingHours(hours);

  if (isOperating) {
    return (
      <Badge variant="operating">
        🕐 운영 중 (~{closingTime})
      </Badge>
    );
  }

  return (
    <Badge variant="closed">
      마감 ({nextOpenTime} 오픈)
    </Badge>
  );
};
```

### 13.4 유틸리티 클래스

```css
/* styles/utilities.css */

/* 그라디언트 */
.gradient-lavender {
  background: linear-gradient(135deg, #C084FC 0%, #A855F7 100%);
}

.gradient-lavender-soft {
  background: linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%);
}

/* 호버 효과 */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* 터치 타겟 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 포커스 링 */
.focus-ring:focus-visible {
  outline: 2px solid #A855F7;
  outline-offset: 2px;
  border-radius: 4px;
}

/* 텍스트 그라디언트 */
.text-gradient {
  background: linear-gradient(135deg, #C084FC 0%, #A855F7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Safe Area */
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

**사용 예시**:
```tsx
<button className="gradient-lavender hover-lift touch-target focus-ring">
  검색
</button>

<h1 className="text-h1 text-gradient">
  마음이음
</h1>
```

---

## 체크리스트

### 개발 전 확인
- [ ] 브랜드 색상 시스템 확인 (lavender 계열)
- [ ] 타이포그래피 계층 파악 (H1~Caption)
- [ ] 반응형 브레이크포인트 확인 (320px/768px/1024px)
- [ ] 접근성 요구사항 검토 (WCAG AA)

### 개발 중 확인
- [ ] 모든 텍스트 한국어로 작성
- [ ] 터치 타겟 최소 44x44px
- [ ] 색상 대비 WCAG AA 준수
- [ ] 키보드 네비게이션 지원
- [ ] aria-label 제공
- [ ] 로딩 상태 표시 구현
- [ ] 에러 처리 로직 구현
- [ ] 모바일 Safe Area 대응

### 배포 전 확인
- [ ] Lighthouse 성능 점수 90+ (Performance)
- [ ] Lighthouse 접근성 점수 95+ (Accessibility)
- [ ] 이미지 최적화 (next/image)
- [ ] 폰트 preload
- [ ] 코드 스플리팅 적용
- [ ] 디바운싱/스로틀링 적용
- [ ] 스크린 리더 테스트
- [ ] 키보드만으로 전체 기능 사용 가능

---

## 참고 문서

- [상세 인터랙션 및 UI/UX 명세](./상세%20인터랙션%20및%20UI&UX%20명세.md)
- [스타일가이드](./스타일가이드.md)
- [PRD](./PRD.md)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-01-XX
**담당**: 프론트엔드 팀

# 마음이음 (MindConnect)

정신건강증진센터 통합 검색 및 추천 플랫폼

![GitHub last commit](https://img.shields.io/github/last-commit/username/mindconnect)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-18+-green.svg)

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)

## 🎯 프로젝트 개요

### 비전
**"모든 시민이 쉽고 빠르게 필요한 정신건강 서비스를 찾고 연결될 수 있는 통합 플랫폼"**

### 미션
- 분산된 정신건강증진센터 정보를 하나의 플랫폼으로 통합
- 개인 맞춤형 센터 추천으로 적절한 서비스 매칭
- 정신건강 서비스에 대한 진입장벽 낮추기

### 해결하는 문제
- 🔍 흩어진 센터 정보로 인한 검색 어려움
- 🎯 개인 상황에 맞는 적절한 센터 선택의 어려움
- 🚪 정신건강 서비스에 대한 심리적 진입장벽

## ✨ 주요 기능

### 🗺️ 지도 기반 센터 검색
- 현재 위치 기반 주변 센터 표시
- 반경 설정 및 지역별 필터링
- 센터별 상세 정보 팝업

### 🎯 개인 맞춤 추천 시스템
- 규칙 기반 필터링 (위치, 운영시간, 센터구분)
- 사용자 선호도 설정에 따른 매칭
- 우선순위 기반 센터 정렬

### 📊 통합 정보 제공
- **실시간 운영 상태 표시** (Sprint 2) ⭐ NEW
  - 6가지 상태: 운영중, 마감임박, 마감, 공휴일, 임시휴무, 정보없음
  - 60초 자동 갱신 및 페이지 포커스 시 즉시 업데이트
  - 주간 운영시간 테이블 (현재 요일 강조)
  - 휴무일 캘린더 (공휴일, 정기휴무, 임시휴무)
  - 다음 운영일 자동 계산 (14일 범위)
  - Redis 캐싱으로 빠른 응답 (<100ms)
- 센터별 운영시간, 업무내용, 전문분야
- 이용 후기 및 평점 시스템
- 센터 연락처 및 위치 정보

### ⭐ 센터 관리
- 자주 찾는 센터 즐겨찾기
- 빠른 접근을 위한 즐겨찾기 목록
- 최근 본 센터 기록

### 📚 정신건강 정보
- 기본적인 정신건강 정보 제공
- 자가진단 체크리스트
- 응급 상황 대처 가이드

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: shadcn/ui
- **상태관리**: Zustand (전역 상태), TanStack Query (서버 상태)
- **스타일링**: Tailwind CSS
- **지도 API**: 네이버 지도 API / 카카오 지도 API
- **폼 관리**: React Hook Form + Zod

### Backend
- **Framework**: Express.js
- **Database**: MySQL (센터 정보), Redis (캐싱, 5분 TTL)
- **ORM**: Prisma
- **API**: RESTful API
- **인증**: JWT 토큰 기반
- **날짜/시간**: date-fns + date-fns-tz (Asia/Seoul 타임존)
- **스케줄러**: node-cron (공휴일 자동 동기화)

### Infrastructure
- **Hosting**: Vercel (Frontend), AWS EC2 (Backend)
- **Database**: AWS RDS (MySQL)
- **CDN**: Vercel Edge Network
- **모니터링**: Google Analytics, Sentry
- **CI/CD**: GitHub Actions

## 📖 API 문서

### Sprint 2: 실시간 운영 상태 API

#### GET `/api/v1/centers/:id/operating-status`
센터의 실시간 운영 상태를 조회합니다.

**응답 예시**:
```json
{
  "centerId": 1,
  "status": "OPEN",
  "statusColor": "green",
  "message": "운영 중",
  "currentTime": "2025-10-24T14:30:00+09:00",
  "operatingHours": [
    { "dayOfWeek": 0, "dayName": "일요일", "openTime": "10:00", "closeTime": "18:00", "isOpen": true }
  ],
  "holidays": [
    { "date": "2025-01-01", "name": "신정", "type": "public" }
  ],
  "nextOpenDate": "2025-10-25",
  "responseTime": 45
}
```

**상태 코드**:
- `200`: 정상 조회 (캐시 여부는 `X-Cache` 헤더로 확인)
- `400`: 잘못된 센터 ID
- `404`: 센터를 찾을 수 없음
- `500`: 서버 내부 오류

**캐싱**:
- Redis 캐시 TTL: 5분
- 응답 헤더 `X-Cache`: `HIT` (캐시) / `MISS` (새 조회)

**상세 문서**: [backend/docs/API.md](backend/docs/API.md)

## 🚀 시작하기

### 전체 환경 실행 (Docker Compose)
```bash
# 전체 환경 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 환경 종료
docker-compose down
```

### 개발 환경 설정

**1. Frontend 실행**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

**2. Backend 실행**
```bash
cd backend
npm install

# 환경 변수 설정
cp .env.example .env

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 서버 시작
npm run dev
# → http://localhost:5000
```

**3. Storybook 실행**
```bash
cd frontend
npm run storybook
# → http://localhost:6006
```

## 🧪 테스트

### Frontend 테스트
```bash
cd frontend

# 단위 테스트 (Vitest)
npm test

# E2E 테스트 (Playwright)
npm run test:e2e

# 성능 감사 (Lighthouse)
npm run audit:lighthouse

# 접근성 감사
npm run audit:a11y
```

### Backend 테스트
```bash
cd backend

# 단위 + 통합 테스트 (Jest)
npm test

# 커버리지 확인
npm run test:coverage

# 코드 품질 체크
npm run lint
npx tsc --noEmit
```

## 📂 프로젝트 구조

```
마음이음/
├── frontend/              # Next.js 프론트엔드
│   ├── app/              # Next.js App Router
│   ├── components/       # React 컴포넌트
│   │   └── center/       # 센터 관련 컴포넌트
│   │       ├── OperatingStatusBadge.tsx
│   │       ├── OperatingHoursTable.tsx
│   │       └── HolidayList.tsx
│   ├── hooks/            # 커스텀 훅
│   │   └── useOperatingStatus.ts
│   └── types/            # TypeScript 타입 정의
│
├── backend/              # Express 백엔드
│   ├── src/
│   │   ├── controllers/  # API 컨트롤러
│   │   │   └── operatingStatus.controller.ts
│   │   ├── services/     # 비즈니스 로직
│   │   │   ├── operatingStatus.service.ts
│   │   │   └── holiday.service.ts
│   │   ├── cron/         # 스케줄 작업
│   │   │   └── holidaySync.ts
│   │   └── utils/        # 유틸리티
│   │       └── cache.ts
│   └── tests/            # 테스트 파일
│
├── context/              # 프로젝트 문서
│   ├── PRD.md
│   ├── Database_design.md
│   ├── 공통_UI_UX_가이드라인.md
│   └── 컴포넌트_API.md
│
└── claudedocs/           # 개발 문서
    └── feature-plans/
        └── 통합_정보_제공/
            └── sprint_2/
```

## 📝 라이선스

MIT License

## 👥 기여

기여를 환영합니다! Pull Request를 보내주세요.

---

**마지막 업데이트**: 2025-10-24 (Sprint 2 완료)
**버전**: MVP Phase 1

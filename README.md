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

#### 📦 프로덕션 환경
**최적화된 빌드로 안정적인 운영**

```bash
# 1. 전체 환경 시작
docker compose -f docker-compose.prod.yml up -d

# 2. 로그 확인
docker compose -f docker-compose.prod.yml logs -f

# 3. 환경 종료 (데이터는 보존됨)
docker compose -f docker-compose.prod.yml down

# 4. 소스코드 수정 후 재시작 (이미지 재빌드 + 변경사항 반영)
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# 5. 특정 서비스만 재빌드
docker compose -f docker-compose.prod.yml up -d --build backend  # 또는 frontend
```

**특정 서비스만 빌드/재시작**:
```bash
# 백엔드만 캐시 없이 빌드
docker compose -f docker-compose.prod.yml build --no-cache backend

# 백엔드만 재시작
docker compose -f docker-compose.prod.yml up -d backend

# 프론트엔드만 캐시 없이 빌드 후 재시작
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

**주의사항**:
- ✅ `docker compose down`: 컨테이너만 종료, **DB 데이터는 유지됨** (volume 보존)
- ⚠️ `docker compose down -v`: 컨테이너 + volume 삭제, **DB 데이터 삭제됨** (절대 사용 금지)
- 🔄 소스코드 변경 시 반드시 `--build` 플래그로 재빌드 필요
- 🚀 `--no-cache`: Docker 빌드 캐시를 사용하지 않고 처음부터 빌드 (의존성 문제 해결 시 유용)

#### 🚀 개발 환경 (권장)
**소스코드 변경 시 자동 반영 + Hot Reload**

```bash
# 개발 환경 실행
docker compose -f docker-compose.dev.yml up -d

# 로그 확인
docker compose -f docker-compose.dev.yml logs -f

# 환경 종료
docker compose -f docker-compose.dev.yml down
```

**특징**:
- ✅ 소스코드 수정 시 자동 반영 (이미지 재빌드 불필요)
- ✅ Backend: nodemon으로 파일 변경 감지 → 자동 재시작
- ✅ Frontend: Next.js Fast Refresh → 브라우저 자동 새로고침

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

## 💾 데이터베이스 관리

### 프로덕션 환경 데이터베이스 초기화

#### 0️⃣ 사전 준비 (Migration 파일 확인)
**Prisma 디렉토리가 자동으로 마운트됩니다**

```bash
# 백엔드 컨테이너에서 migration 파일 존재 확인
docker compose -f docker-compose.prod.yml exec backend ls -la prisma/migrations

# ✅ docker-compose.prod.yml에 이미 설정됨:
# volumes:
#   - ./backend/prisma:/app/prisma:ro  (읽기 전용)
#
# 따라서 호스트의 migration 파일이 자동으로 컨테이너에 반영됩니다.
```

#### 1️⃣ 신규 배포 (처음 설정)
**안전하게 스키마 적용 + 초기 데이터 삽입**

```bash
# 1. 백엔드 컨테이너 접속
docker compose -f docker-compose.prod.yml exec backend sh

# 2. Prisma 마이그레이션 적용 (프로덕션용)
npx prisma migrate deploy

# 3. Seed 데이터 삽입
node prisma/seeds/assessmentTemplates.seed.js
node prisma/seeds/k10-assessment-template.seed.js

# 4. 컨테이너에서 나가기
exit
```

#### 2️⃣ 스키마 변경사항 적용 (마이그레이션만)
**기존 데이터 유지하면서 스키마만 업데이트**

```bash
# 백엔드 컨테이너에서 실행
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

#### 3️⃣ 완전 초기화 (⚠️ 모든 데이터 삭제)
**데이터베이스를 완전히 초기화하고 처음부터 다시 설정**

```bash
# ⚠️ 경고: 모든 데이터가 영구적으로 삭제됩니다!
# 프로덕션 환경에서는 절대 사용하지 마세요!

# 1. 백엔드 컨테이너 접속
docker compose -f docker-compose.prod.yml exec backend sh

# 2. 데이터베이스 완전 초기화
npx prisma migrate reset --force

# 3. Seed 데이터 재삽입
node prisma/seeds/assessmentTemplates.seed.js
node prisma/seeds/k10-assessment-template.seed.js

exit
```

#### 4️⃣ Prisma Client 재생성
**스키마 변경 후 TypeScript 타입 동기화**

```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma generate
```

### 개발 환경 데이터베이스 관리

```bash
# 개발 환경 백엔드 컨테이너 접속
docker compose -f docker-compose.dev.yml exec backend sh

# 개발용 마이그레이션 (자동으로 DB 스키마 적용)
npx prisma migrate dev

# Seed 데이터 삽입
node prisma/seeds/assessmentTemplates.seed.js
node prisma/seeds/k10-assessment-template.seed.js

# Prisma Studio (DB GUI)
npx prisma studio
# → http://localhost:5555

exit
```

### 주의사항

**프로덕션 환경**:
- ✅ `prisma migrate deploy`: 안전 (프로덕션 전용)
- ⚠️ `prisma migrate dev`: 절대 사용 금지 (개발 전용)
- 🚨 `prisma migrate reset`: 모든 데이터 삭제 (절대 사용 금지)

**개발 환경**:
- ✅ `prisma migrate dev`: 스키마 변경 + 자동 적용
- ✅ `prisma migrate reset`: 완전 초기화 가능

**데이터 보존**:
- `docker compose down`: 데이터 유지 (volume 보존)
- `docker compose down -v`: 데이터 삭제 (volume 삭제)

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

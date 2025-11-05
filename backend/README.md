# MindConnect Backend

마음이음 (MindConnect) - 정신건강 관련 공공기관 통합 검색 및 추천 플랫폼 Backend API

## 🚀 기술 스택

- **Framework**: Express.js 4.18+ (TypeScript 지원)
- **Database**: MySQL 8.0+ (Docker)
- **Cache**: Redis 7+ (Docker, 5분 TTL)
- **ORM**: Prisma 5.0+
- **Authentication**: JWT + bcrypt (향후 구현 예정)
- **API Documentation**: Swagger/OpenAPI 3.0
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **Container**: Docker & Docker Compose
- **Testing**: Jest + Supertest

## 📁 프로젝트 구조

```
backend/
├── src/
│   ├── config/           # 설정 파일
│   │   ├── sentry.ts     # Sentry 에러 추적 설정
│   │   └── prometheus.ts # Prometheus 메트릭 설정
│   ├── routes/           # API 라우트
│   │   ├── recommendation.routes.js  # 추천 시스템 라우트
│   │   └── selfAssessment.routes.js  # 자가진단 라우트
│   ├── controllers/      # 비즈니스 로직
│   │   ├── recommendationController.js  # 추천 컨트롤러
│   │   └── selfAssessmentController.js  # 자가진단 컨트롤러
│   ├── services/         # 비즈니스 서비스
│   │   └── scoring/      # 점수 계산 모듈 (11개)
│   ├── middlewares/      # 미들웨어
│   │   ├── auth.middleware.ts   # JWT 인증
│   │   └── errorHandler.ts      # 에러 핸들링
│   ├── utils/            # 유틸리티 함수
│   │   ├── cache.ts      # Redis 캐싱 (5분 TTL)
│   │   └── logger.js     # Winston 로거
│   ├── app.js            # Express 앱 설정
│   └── index.js          # 서버 엔트리포인트
├── tests/                # 테스트 파일
│   ├── unit/             # 단위 테스트
│   └── integration/      # 통합 테스트
├── docs/                 # API 문서
│   └── API.md            # REST API 문서 (997줄)
├── Dockerfile            # Docker 이미지 설정
├── docker-compose.yml    # Docker Compose 설정
├── package.json          # 프로젝트 의존성
└── .env.example          # 환경 변수 예제
```

## 🛠️ 시작하기

### 1. 환경 설정

```bash
# .env.example을 .env로 복사
cp .env.example .env

# .env 파일에서 필요한 환경 변수 수정
```

### 2. Docker로 실행

```bash
# Docker 컨테이너 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f backend

# 컨테이너 상태 확인
docker-compose ps
```

### 3. 로컬 개발 환경 (Docker 없이)

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (nodemon)
pnpm dev

# 프로덕션 서버 실행
pnpm start
```

## 🔗 API 엔드포인트

서버가 실행되면 다음 URL에서 접근할 수 있습니다:

- **서버**: http://localhost:8080
- **API Base**: http://localhost:8080/api/v1
- **Swagger 문서**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/health
- **Readiness Check**: http://localhost:8080/ready
- **Prometheus 메트릭**: http://localhost:8080/metrics

### 주요 API 엔드포인트 (Sprint 2)

#### 추천 시스템
- `POST /api/v1/recommendations` - 규칙 기반 센터 추천
  - 사용자 프로필 기반 맞춤 추천
  - 11개 점수 계산 모듈 (거리, 전문성, 접근성 등)
  - 최대 10개 센터 추천
  - 자세한 내용: [API 문서](docs/API.md)

#### 자가진단
- `GET /api/v1/self-assessments/templates` - 진단 템플릿 목록
- `GET /api/v1/self-assessments/templates/:id` - 템플릿 상세
- `POST /api/v1/self-assessments/sessions` - 진단 세션 시작
- `POST /api/v1/self-assessments/sessions/:id/answers` - 답변 제출
- `POST /api/v1/self-assessments/sessions/:id/complete` - 진단 완료

자세한 API 스펙은 [docs/API.md](docs/API.md) 참조

## 🏥 Health Check

```bash
# Health check
curl http://localhost:8080/health

# Readiness check
curl http://localhost:8080/ready
```

응답 예시:
```json
{
  "status": "ok",
  "timestamp": "2025-10-13T14:56:56.113Z",
  "uptime": 186.81784091,
  "environment": "development"
}
```

## 🐳 Docker 명령어

```bash
# 컨테이너 시작
docker-compose up -d

# 컨테이너 중지
docker-compose down

# 컨테이너 재시작
docker-compose restart

# 로그 확인
docker-compose logs -f backend

# 컨테이너 상태 확인
docker-compose ps

# 볼륨 삭제 포함 전체 정리
docker-compose down -v
```

## 📊 데이터베이스

### MySQL 접속 정보
- **Host**: localhost
- **Port**: 3307 (로컬에서 접근 시)
- **Database**: mindconnect
- **User**: mindconnect_user
- **Password**: mindconnect_pass (프로덕션에서는 변경 필요)

### Prisma 명령어
```bash
# Prisma Client 생성
pnpm prisma:generate

# 마이그레이션 실행
pnpm prisma:migrate

# Prisma Studio 실행
pnpm prisma:studio
```

## 💾 Redis

### Redis 접속 정보
- **Host**: localhost
- **Port**: 6380 (로컬에서 접근 시)

## 🔐 환경 변수

주요 환경 변수 (.env 파일):

```env
# Server
NODE_ENV=development
PORT=8080

# Database
DATABASE_URL=mysql://mindconnect_user:mindconnect_pass@mysql:3306/mindconnect

# Redis Cache
REDIS_URL=redis://redis:6379
REDIS_TTL=300  # 5분 (초 단위)

# Authentication
JWT_SECRET=your_jwt_secret_key_change_me

# CORS
CORS_ORIGIN=http://localhost:3000

# Sentry (Sprint 2)
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENABLED=true  # production에서만 true 권장
SENTRY_TRACES_SAMPLE_RATE=1.0
SENTRY_PROFILES_SAMPLE_RATE=1.0
APP_VERSION=1.0.0

# Prometheus (Sprint 2)
METRICS_ENABLED=true
```

## 📊 모니터링 (Sprint 2)

### Prometheus 메트릭

서버가 실행되면 http://localhost:8080/metrics에서 메트릭을 확인할 수 있습니다.

#### 수집되는 메트릭 (6개)
1. **http_request_duration_seconds** - HTTP 요청 응답 시간 (히스토그램)
2. **http_requests_total** - HTTP 요청 총 횟수 (카운터)
3. **active_sessions** - 활성 세션 수 (게이지)
4. **recommendation_score_distribution** - 추천 점수 분포 (히스토그램)
5. **cache_hit_rate** - 캐시 히트율 (게이지)
6. **database_query_duration_seconds** - DB 쿼리 응답 시간 (히스토그램)

### Grafana 대시보드

대시보드 접속: http://localhost:3001
- Username: admin
- Password: admin

#### 대시보드 구성 (10개 패널)
1. 요청 응답 시간 (P50, P95, P99)
2. 초당 요청 수 (RPS)
3. HTTP 상태 코드 분포
4. 추천 API 응답 시간
5. 캐시 히트율
6. DB 쿼리 성능
7. 활성 사용자 수
8. 에러율
9. 추천 점수 분포
10. 시스템 리소스 (CPU, 메모리)

### Sentry 에러 추적

#### 주요 기능
- **실시간 에러 추적**: 프로덕션 에러 자동 캡처
- **성능 모니터링**: API 응답 시간 추적 (traces)
- **프로파일링**: 성능 병목 지점 분석
- **민감 정보 제거**: 자동으로 password, token 등 필터링

#### 설정 방법
1. [Sentry.io](https://sentry.io)에서 프로젝트 생성
2. DSN 복사
3. `.env` 파일에 `SENTRY_DSN` 설정
4. `SENTRY_ENABLED=true` 설정 (프로덕션만 권장)

#### 에러 캡처 예시
```javascript
const { captureError } = require('./config/sentry');

try {
  // ...
} catch (error) {
  captureError(error, { operation: 'recommendation', centerId: '123' });
  throw error;
}
```

### 알림 규칙 (10개)
1. API 응답 시간 > 3초
2. 에러율 > 1%
3. 캐시 히트율 < 80%
4. DB 쿼리 시간 > 2초
5. 5xx 에러 발생
6. 메모리 사용률 > 85%
7. CPU 사용률 > 80%
8. 디스크 사용률 > 90%
9. 추천 API 실패율 > 5%
10. 동시 접속 > 100명

## 🧪 테스트

```bash
# 테스트 실행 (추후 구현)
pnpm test

# 코드 린트
pnpm lint

# 코드 포맷팅
pnpm format
```

## 📝 API 개발 가이드

### 새로운 라우트 추가

1. `src/routes/` 폴더에 라우트 파일 생성
2. `src/controllers/` 폴더에 컨트롤러 생성
3. `src/app.js`에 라우트 등록

예시:
```javascript
// src/routes/example.routes.js
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/v1/example:
 *   get:
 *     summary: Example endpoint
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/example', (req, res) => {
  res.json({ message: 'Example' });
});

module.exports = router;

// src/app.js에 등록
const exampleRoutes = require('./routes/example.routes');
app.use(`${config.api.prefix}/example`, exampleRoutes);
```

## 🚨 문제 해결

### 포트 충돌
MySQL이나 Redis 포트가 이미 사용 중인 경우 `docker-compose.yml`에서 포트를 변경하세요.

### 컨테이너 로그 확인
```bash
docker-compose logs backend
docker-compose logs mysql
docker-compose logs redis
```

### 컨테이너 재빌드
```bash
docker-compose build --no-cache
docker-compose up -d
```

## 📄 라이선스

MIT License

## 👥 팀

MindConnect Team

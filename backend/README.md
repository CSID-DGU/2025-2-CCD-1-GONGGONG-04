# MindConnect Backend

마음이음 (MindConnect) - 정신건강 관련 공공기관 통합 검색 및 추천 플랫폼 Backend API

## 🚀 기술 스택

- **Framework**: Express.js 4.18+
- **Database**: MySQL 8.0+ (Docker)
- **Cache**: Redis 7+ (Docker)
- **ORM**: Prisma 5.0+
- **Authentication**: JWT + bcrypt
- **API Documentation**: Swagger/OpenAPI 3.0
- **Container**: Docker & Docker Compose

## 📁 프로젝트 구조

```
backend/
├── src/
│   ├── config/           # 설정 파일
│   ├── routes/           # API 라우트
│   ├── controllers/      # 비즈니스 로직
│   ├── middlewares/      # 미들웨어
│   ├── utils/            # 유틸리티 함수
│   ├── app.js            # Express 앱 설정
│   └── index.js          # 서버 엔트리포인트
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
NODE_ENV=development
PORT=8080
DATABASE_URL=mysql://mindconnect_user:mindconnect_pass@mysql:3306/mindconnect
REDIS_URL=redis://redis:6379
JWT_SECRET=your_jwt_secret_key_change_me
CORS_ORIGIN=http://localhost:3000
```

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

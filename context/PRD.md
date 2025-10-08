# Product Brief & PRD: 정신건강 관련 공공기관 통합 웹서비스 플랫폼

## 1. Product Brief (제품 개요)

### 1.1 제품명
**마음이음** (MindConnect) - 정신건강 관련 공공기관 통합 검색 및 추천 플랫폼

### 1.2 제품 비전
"모든 시민이 쉽고 빠르게 필요한 정신건강 서비스를 찾고 연결될 수 있는 통합 플랫폼"

### 1.3 제품 미션
- 분산된 정신건강 관련 공공기관 정보를 하나의 플랫폼으로 통합
- 개인 맞춤형 센터 추천으로 적절한 서비스 매칭
- 정신건강 서비스에 대한 진입장벽 낮추기

---

## 2. Product Requirements Document (PRD)

### 2.1 제품의 목적

#### 2.1.1 비즈니스 목적
- **사회적 가치 창출**: 정신건강 서비스 접근성 향상으로 사회적 문제 해결 기여
- **공공데이터 활용**: 정부의 공공데이터 활용 정책에 부응하는 서비스 개발
- **서비스 격차 해소**: 정보 불균형으로 인한 정신건강 서비스 사각지대 해소
- **공적 자원 효율성 증대**: 기존 공공기관 활용도 제고

#### 2.1.2 사용자 문제 해결
- 흩어진 센터 정보로 인한 검색 어려움 해결
- 개인 상황에 맞는 적절한 센터 선택의 어려움 해결
- 정신건강 서비스에 대한 심리적 진입장벽 완화
- 실시간 운영 상태 확인을 통한 시간 낭비 방지

### 2.2 추진 배경

#### 2.2.1 사회적 배경
- 정신건강 문제가 사회적 이슈로 대두
- 정신건강 관련 공공기관 정보의 분산
- 사용자 맞춤형 정보 제공 시스템 부재
- 사용자 친화적 통합 플랫폼 부족

#### 2.2.2 기술적 필요성
- 디지털 헬스케어 시장의 지속적 성장
- 공공데이터 활용 서비스 개발 정책 확대
- 위치 기반 기술 및 API 기술의 발전
- 개인 맞춤형 기술의 고도화

#### 2.2.3 선행사례 분석
**국가정신건강정보포털**
- 국립정신건강센터와 대한신경정신의학회 공동 개발
- 단순 정보 제공 중심으로 맞춤형 추천 기능 부재
- 실시간 통합 플랫폼으로서의 한계 존재

**차별점 및 개선점**
- 공공데이터 기반의 신뢰성 있는 정보 제공
- 지도 기반 검색 및 길찾기 시스템 개선
- 사용자 선호도 + 자가진단 기반 맞춤형 추천
- 통합된 정신건강 관련 공공기관 정보와 이용후기 플랫폼

### 2.3 대상 사용자

#### 2.3.1 주요 타겟 사용자
**Primary Users (핵심 사용자)**
- 20-40대 직장인: 스트레스, 번아웃 관리가 필요한 그룹
- 대학생 및 청년층: 진로, 대인관계 고민이 있는 그룹
- 육아맘: 산후우울증, 육아스트레스 관련 도움이 필요한 그룹

**Secondary Users (보조 사용자)**
- 노인층: 우울, 치매 예방 프로그램이 필요한 그룹
- 보호자/가족: 가족 구성원을 위한 센터를 찾는 그룹
- 의료/복지 관계자: 환자 연계를 위한 정보가 필요한 전문가

#### 2.3.2 사용자 페르소나
1. **김직장 (35세, 회사원)**
   - 니즈: 퇴근 후 이용 가능한 센터, 직장인 프로그램
   - 페인포인트: 운영시간 정보 부족, 예약 시스템 부재

2. **이대학 (23세, 대학생)**
   - 니즈: 무료/저렴한 상담, 또래 집단 프로그램
   - 페인포인트: 센터별 프로그램 정보 파악 어려움

3. **박엄마 (32세, 육아맘)**
   - 니즈: 아이 동반 가능 센터, 온라인 상담
   - 페인포인트: 육아 중 방문 어려움, 정보 검색 시간 부족

### 2.4 핵심 기능

#### 2.4.1 Core Features (핵심 기능)
1. **지도 기반 센터 검색**
   - 현재 위치 기반 주변 센터 표시
   - 반경 설정 (1km, 3km, 5km, 10km) 및 지역별 필터링
   - 센터별 상세 정보 팝업
   - 길찾기 연동 (네이버/카카오맵)

2. **규칙 기반 추천 시스템**
   - 간단한 필터링 기반 추천 (위치, 운영시간, 센터구분)
   - 자가진단 연동 (10-15문항)
   - 사용자 선호도 설정에 따른 매칭
   - 우선순위 기반 센터 정렬
   - 추천 이유 설명 제공

3. **통합 정보 제공**
   - 센터별 운영시간, 업무내용, 전문분야
   - **실시간 운영 상태 표시** (운영중/마감)
   - 이용 후기 및 평점 시스템
   - 센터 연락처 및 위치 정보
   - 의료진 현황 표시

4. **센터 즐겨찾기**
   - 자주 찾는 센터 저장 (로컬 스토리지 기반)
   - 빠른 접근을 위한 즐겨찾기 목록

5. **정신건강 정보 콘텐츠**
   - 기본적인 정신건강 정보 제공
   - 자가진단 체크리스트
   - 응급 상황 대처 가이드

### 2.5 데이터 구조 및 활용

#### 2.5.1 공공데이터 활용 (전국건강증진센터표준데이터)
**주요 데이터 필드:**
| 칼럼명 | nullable | 설명 |
|------|------|------|
| 건강증진센터명 | False | 센터 고유 명칭 |
| 건강증진센터구분 | False | 센터 분류 |
| 소재지도로명주소 | False | 도로명 주소 |
| 소재지지번주소 | True | 지번 주소 |
| 위도/경도 좌표 | True | GPS 좌표 |
| 건강증진업무내용 | True | 프로그램/업무 설명 |
| 운영시간 (시작/종료) | True | 운영 시간 |
| 휴무일정보 | True | 휴무일 |
| 건물면적 | True | 시설 규모 |
| 의료진 현황 | True | 전문 인력 수 |
| 운영기관 정보 및 연락처 | True | 연락처 |

#### 2.5.2 데이터베이스 설계
```sql
-- 센터 정보 테이블
centers (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  road_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  business_content TEXT,
  open_time TIME,
  close_time TIME,
  holiday_info TEXT,
  staff_count INT,
  tags VARCHAR(255),
  is_operating BOOLEAN GENERATED,
  last_updated DATETIME
)

-- 사용자 프로필 테이블
user_profiles (
  id INT PRIMARY KEY,
  problem VARCHAR(100),
  severity TINYINT,
  prefer_online BOOLEAN,
  avail_after_6pm BOOLEAN,
  age_group VARCHAR(20),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  free_text TEXT,
  created_at TIMESTAMP
)

-- 추천 로그 테이블
recommendations_log (
  log_id INT PRIMARY KEY,
  user_id INT,
  center_id INT,
  score DOUBLE,
  rule_score DOUBLE,
  sim_score DOUBLE,
  reason TEXT,
  recommended_at TIMESTAMP
)

-- 즐겨찾기 테이블
favorites (
  user_id INT,
  center_id INT,
  created_at TIMESTAMP
)
```

### 2.6 기술 스택

#### 2.6.1 Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: shadcn/ui
- **상태관리**: Zustand (전역 상태), TanStack Query (서버 상태)
- **스타일링**: Tailwind CSS
- **지도 API**: Kakao Map API (1순위) / Naver Map API (2순위)
- **폼 관리**: React Hook Form + Zod

#### 2.6.2 Backend
- **Framework**: Express.js 4.18+
- **Database**: MySQL 8.0+ 
- **ORM**: Prisma 5.0+
- **API**: RESTful API
- **인증**: JWT + bcrypt
- **API 문서화**: Swagger/OpenAPI 3.0

#### 2.6.3 추천 시스템
- **Phase 1 (MVP)**: 규칙 기반 필터링 (JavaScript 로직)
  - 거리점수, 운영중점수, 전문성점수, 프로그램매칭점수 계산
  - 가중치 기반 총점 계산 (초기 가중치: 거리 0.35, 운영 0.25, 전문성 0.2, 프로그램 0.2)
  - 설명가능한 추천 이유 제공

- **Phase 3 (고도화)**: LLM API 통합
  - OpenAI GPT-4 또는 Claude API
  - 임베딩 기반 의미적 유사도 계산
  - 하이브리드 추천 (규칙 + 임베딩)

#### 2.6.4 Infrastructure & Container
- **컨테이너화**: 
  - Docker 24.0+
  - Docker Compose 2.20+
  - Multi-stage build를 통한 이미지 최적화
- **컨테이너 레지스트리**:
  - AWS ECR (Elastic Container Registry)
  - Docker Hub (개발/테스트용)
- **오케스트레이션**:
  - 개발/스테이징: Docker Compose
  - 운영: AWS ECS 또는 Kubernetes (향후 확장 시)
- **Hosting**: 
  - Frontend: Vercel 또는 Docker Container
  - Backend: AWS ECS on EC2 / AWS Fargate
- **Database**: AWS RDS MySQL
- **CDN**: CloudFront
- **모니터링**: 
  - 컨테이너: Docker Stats, cAdvisor
  - 애플리케이션: Grafana/Prometheus (성능), Sentry (에러)
  - 로그: ELK Stack (Elasticsearch, Logstash, Kibana)
- **CI/CD**: GitHub Actions + Docker Build

### 2.7 개발 환경

#### 2.7.1 Docker 기반 개발 환경
**로컬 개발 환경 구성**
```yaml
# docker-compose.yml 구조
services:
  frontend:
    - Next.js 애플리케이션
    - 포트: 3000
    - 핫 리로딩 지원
  
  backend:
    - Express.js API 서버
    - 포트: 8080
    - nodemon을 통한 자동 재시작
  
  mysql:
    - MySQL 8.0 데이터베이스
    - 포트: 3306
    - 볼륨 마운트로 데이터 영속성 보장
  
  redis:
    - Redis 캐시 서버
    - 포트: 6379
    - 세션 및 캐싱용
  
  nginx:
    - 리버스 프록시
    - 포트: 80
    - 로드 밸런싱 (운영 환경)
```

**Docker 이미지 전략**
- **Base Images**:
  - Frontend: node:18-alpine (경량화)
  - Backend: node:18-alpine
  - Database: mysql:8.0
  - Cache: redis:7-alpine
- **이미지 크기 최적화**:
  - Multi-stage build 활용
  - 불필요한 dev dependencies 제거
  - 레이어 캐싱 최적화

#### 2.7.2 하드웨어 환경
**개발/스테이징 서버**
- AWS EC2 t3.medium (Docker Host)
- CPU: 2 vCPU, RAM: 4GB
- 저장공간: 50GB SSD
- Docker & Docker Compose 설치

**운영 서버**
- AWS ECS 클러스터
- Task Definition: 
  - Frontend: 1 vCPU, 2GB RAM
  - Backend: 2 vCPU, 4GB RAM
- Auto Scaling 설정
- AWS Application Load Balancer

#### 2.7.3 개발 도구
- **VCS**: Git + GitHub
- **브랜치 전략**: Git Flow
- **패키지 매니저**: pnpm 8.0+
- **코드 품질**: ESLint + Prettier + Husky
- **테스팅**: 
  - 단위 테스트: Jest
  - 통합 테스트: Supertest
  - E2E 테스트: Cypress (Docker 환경에서 실행)
- **컨테이너 관리**: 
  - Docker Desktop (로컬)
  - Portainer (개발 서버 모니터링)

### 2.8 컨테이너화 전략

#### 2.8.1 Docker 구성
**Frontend Dockerfile 구조**
```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

**Backend Dockerfile 구조**
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 8080
CMD ["node", "dist/server.js"]
```

#### 2.8.2 Docker Compose 환경별 구성
**개발 환경 (docker-compose.dev.yml)**
- 볼륨 마운트로 코드 변경사항 실시간 반영
- 디버깅 포트 노출
- 개발용 환경변수 설정

**스테이징 환경 (docker-compose.staging.yml)**
- 프로덕션과 유사한 구성
- 성능 테스트용 리소스 제한
- 로그 수집 설정

**프로덕션 환경 (docker-compose.prod.yml)**
- 최적화된 이미지 사용
- 보안 강화 설정
- 헬스체크 및 재시작 정책

#### 2.8.3 컨테이너 보안
- **이미지 스캔**: Trivy를 통한 취약점 검사
- **비밀 관리**: 
  - Docker Secrets (Swarm mode)
  - AWS Secrets Manager 연동
- **네트워크 격리**: 
  - 서비스별 네트워크 분리
  - 최소 권한 원칙 적용
- **런타임 보안**:
  - 읽기 전용 파일시스템
  - Non-root 사용자 실행
  - 리소스 제한 설정

### 2.9 개발 일정

#### 2.9.1 Phase 1: 기반 환경 구축 (9월 3주차 ~ 10월 2주차)
- Week 1: 프로젝트 초기화, Docker 환경 설정
- Week 2: 데이터 수집 및 분석, 공공데이터 정제
- Week 3: UI/UX 설계, 와이어프레임 제작
- Week 4: 데이터베이스 설계 및 Docker Compose 구성

#### 2.9.2 Phase 2: 기능 개발 (10월 3주차 ~ 11월)
- Week 5: 지도 시스템 (Kakao Map API 연동, 마커 표시)
- Week 6-7: 추천 및 리뷰 시스템
  - 규칙 기반 추천 알고리즘 구현
  - 자가진단 도구 개발 (10-15문항)
  - 추천 시스템 알고리즘 고도화
  - **정신건강 정보 콘텐츠**: 자가진단 체크리스트 통합
- Week 8-9: 필터링 검색 및 센터 상세 정보
  - 센터 검색 개발 (이름, 지역, 키워드)
  - 고급 필터링 구현
  - 실시간 운영 상태 로직 구현
  - **정신건강 정보 콘텐츠**: 기본 정신건강 정보 페이지 구축
- Week 10: 사용자 관리 및 콘텐츠 완성
  - 회원가입/로그인 시스템
  - **정신건강 정보 콘텐츠**: 응급 상황 대처 가이드 추가
  - 정보 콘텐츠 페이지 최종 통합
  - Docker 이미지 빌드 및 최적화

#### 2.9.3 Phase 3: 최적화 및 배포 (12월 초)
- Week 11: 성능 최적화 및 배포
  - 컨테이너 이미지 최적화
  - 데이터베이스 쿼리 최적화
  - AWS ECS 배포 및 도메인 연결
  - CI/CD 파이프라인 구축

### 2.10 배포 프로세스

#### 2.10.1 CI/CD 파이프라인
**GitHub Actions Workflow**
1. **코드 푸시/PR**
   - 자동 테스트 실행
   - 코드 품질 검사 (ESLint, Prettier)
   
2. **Docker 빌드**
   - Multi-stage build 실행
   - 이미지 태깅 (git commit hash)
   - 취약점 스캔 (Trivy)
   
3. **레지스트리 푸시**
   - AWS ECR로 이미지 푸시
   - 태그 관리 (latest, staging, production)
   
4. **배포**
   - ECS Task Definition 업데이트
   - Rolling update 실행
   - 헬스체크 확인

#### 2.10.2 환경별 배포 전략
**개발 환경**
- 자동 배포 (main 브랜치 푸시 시)
- Docker Compose로 로컬 환경 재현

**스테이징 환경**
- PR 머지 시 자동 배포
- 프로덕션과 동일한 컨테이너 구성
- 성능 테스트 실행

**프로덕션 환경**
- 수동 승인 후 배포
- Blue-Green 배포 전략
- 롤백 계획 수립

### 2.11 구현 방법론

#### 2.11.1 지도 기반 검색 시스템
**목적**: 사용자 위치 기반 직관적 센터 탐색

**주요 동작 흐름**:
1. 사용자 위치 수집 (GPS 또는 수동 입력)
2. 반경/행정구역 필터로 Geo-query 수행
3. 필터 적용 (센터구분, 운영시간 등)
4. 지도 마커 및 리스트 표시
5. 마커 클릭 시 상세 정보 팝업

**추가 구현 고려사항**:
- 마커 클러스터링 (성능 최적화)
- SSG/SSR로 SEO 최적화
- 오프라인 모드 대비 UX

#### 2.11.2 규칙 기반 추천 시스템 (MVP → 고도화)
**MVP 파이프라인**:
1. 사용자 입력: 자가진단 체크리스트
2. 후보 추출: 규칙 필터
3. 점수화: 거리, 운영중, 전문성, 프로그램 매칭
4. 가중합 정렬
5. 결과 반환 + 추천 이유 설명

**고도화 (임베딩 도입)**:
- OpenAI Embedding API 또는 sentence-transformers
- 벡터DB (Qdrant/Milvus/Pinecone)
- 하이브리드 점수: α * sim_score + β * rule_score

#### 2.11.3 실시간 운영 상태 판별
**판별 로직 우선순위**:
1. 센터 표준 데이터 운영시간
2. 센터 제공 당일 공지
3. 센터 실시간 API (있을 경우)
4. 관리자 수동 업데이트

**예외 처리**:
- 공휴일/임시휴무 반영
- 불명확한 경우 "운영 여부 불확실" 표시

### 2.12 비기능적 요구사항

#### 2.12.1 성능
- 페이지 로딩 시간: 3초 이내
- 지도 렌더링: 2초 이내
- API 응답시간: 1초 이내
- 동시 접속자: 약 50명
- Lighthouse 점수: 90점 이상
- 가용성: 99.5% 이상 업타임 목표
- **컨테이너 성능**:
  - 컨테이너 시작 시간: 30초 이내
  - 메모리 사용량: Frontend 512MB, Backend 1GB 이내
  - CPU 사용률: 평균 50% 이하

#### 2.12.2 보안 및 개인정보보호
- HTTPS 적용
- 개인정보 암호화 저장
- 개인정보보호법 준수
- 민감정보 최소 수집 원칙
- OWASP Top 10 보안 취약점 대응
- JWT + bcrypt 인증
- **컨테이너 보안**:
  - 정기적인 이미지 취약점 스캔
  - 최소 권한 컨테이너 실행
  - 시크릿 관리 시스템 적용

#### 2.12.3 접근성
- KWCAG 2.1 준수
- 스크린리더 지원
- 키보드 네비게이션
- 고대비 모드 지원

#### 2.12.4 호환성
- 브라우저: Chrome 90+, Safari 14+, Firefox 90+, Edge 90+
- 모바일: iOS 12+, Android 8.0+
- 반응형: 320px ~ 2560px
- **컨테이너 호환성**:
  - Docker Engine 20.10+
  - Docker Compose 2.0+

### 2.13 모니터링 및 로깅 (추후 작업)

#### 2.13.1 컨테이너 모니터링
**메트릭 수집**
- **cAdvisor**: 컨테이너 리소스 사용량 모니터링
- **Prometheus**: 메트릭 수집 및 저장
- **Grafana**: 시각화 대시보드
  - 컨테이너 CPU/메모리 사용률
  - 네트워크 I/O
  - 디스크 사용량

**헬스체크**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

#### 2.13.2 로그 관리
**로그 수집 아키텍처**
- **Fluentd/Fluent Bit**: 컨테이너 로그 수집
- **Elasticsearch**: 로그 저장 및 인덱싱
- **Kibana**: 로그 검색 및 분석
- **로그 레벨**: DEBUG(개발), INFO(스테이징), ERROR(프로덕션)

**로그 보관 정책**
- 개발: 7일
- 스테이징: 30일
- 프로덕션: 90일

### 2.14 리스크 및 대응 방안

| 리스크 | 영향도 | 발생가능성 | 대응 방안 |
|--------|--------|------------|-----------|
| 공공데이터 품질 이슈 | 높음 | 중간 | 데이터 정제 프로세스, 주기적 업데이트 |
| 데이터 인코딩 문제 | 중간 | 높음 | UTF-8 변환, 데이터 검증 로직 |
| 개인정보 유출 | 매우 높음 | 낮음 | 보안 강화, 최소 정보 수집 |
| 센터 정보 변경 | 중간 | 중간 | 정기적 데이터 업데이트 체계 구축 |
| API 비용 초과 | 중간 | 중간 | 사용량 모니터링, 월 100달러 예산 관리 |
| **컨테이너 장애** | 높음 | 낮음 | 자동 재시작, 헬스체크, 롤백 전략 |
| **이미지 취약점** | 높음 | 중간 | 정기 스캔, 베이스 이미지 업데이트 |
| **리소스 부족** | 중간 | 중간 | Auto-scaling, 리소스 모니터링 |

### 2.15 기대효과

본 프로젝트는 분산된 정신건강 관련 공공기관 정보를 통합하여 접근성을 획기적으로 개선하고자 한다. 

**기술적 효과**:
- Next.js 14와 Express.js 기반 현대적 웹 기술 활용
- Docker를 통한 일관된 개발/배포 환경 구축
- 마이크로서비스 아키텍처로 확장성 확보
- 컨테이너 오케스트레이션으로 고가용성 달성
- 고성능이면서 유지보수가 용이한 시스템 구축
- 반응형 웹 디자인으로 일관된 사용자 경험 제공

**사회적 효과**:
- 정신건강 서비스 정보 격차 해소
- 취약계층의 서비스 이용 활성화
- 국가 정신건강 정책 효과성 제고
- 국민의 정신건강 증진과 삶의 질 향상

**향후 확장 가능성**:
- AI 기반 고도화
- 예약 시스템 연동
- 원격 상담 서비스 확장
- 포괄적 정신건강 플랫폼으로 발전

### 2.16 이해관계자

- **개발팀**: Frontend/Backend 개발자, DevOps 엔지니어
- **디자인**: UI/UX 디자이너
- **데이터**: 공공데이터포털
- **인프라**: 클라우드 아키텍트
- **자문**: 정신건강 전문가
- **최종 사용자**: 일반 시민

### 2.17 부록

#### 2.17.1 참고 자료
- 공공데이터포털 전국건강증진센터표준데이터
- Next.js 14 공식 문서
- Docker 공식 문서
- Docker Compose 베스트 프랙티스
- AWS ECS/ECR 가이드
- shadcn/ui 컴포넌트 라이브러리
- 보건복지부 정신건강 정책 가이드라인
- 국가정신건강정보포털 분석 자료

#### 2.17.2 용어 정의
- **정신건강증진센터**: 지역사회 정신건강 서비스 제공 기관
- **규칙 기반 추천**: 사전 정의된 규칙에 따른 필터링 추천
- **LLM**: Large Language Model (대규모 언어 모델)
- **MVP**: 최소 기능 제품 (Minimum Viable Product)
- **임베딩**: 텍스트를 벡터로 변환하는 기술
- **SSR/SSG**: Server Side Rendering / Static Site Generation
- **Docker**: 애플리케이션 컨테이너화 플랫폼
- **Docker Compose**: 멀티 컨테이너 Docker 애플리케이션 정의 및 실행 도구
- **ECS**: Elastic Container Service (AWS 컨테이너 오케스트레이션 서비스)
- **ECR**: Elastic Container Registry (AWS 컨테이너 이미지 저장소)
- **Multi-stage Build**: 도커 이미지 크기 최적화를 위한 빌드 전략
- **Blue-Green Deployment**: 무중단 배포 전략

#### 2.17.3 Docker Compose 예제 구성
```yaml
# docker-compose.yml 전체 예제
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=mysql://user:password@mysql:3306/mindconnect
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mysql
      - redis
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=mindconnect
      - MYSQL_USER=user
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/prisma/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  mysql_data:
  redis_data:
```

---

*이 PRD는 프로젝트 진행 상황에 따라 지속적으로 업데이트됩니다.*
*Docker 및 컨테이너화 전략은 개발 효율성과 배포 안정성을 위해 도입되었습니다.*
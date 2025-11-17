# 마음이음 (MindConnect) 배포 가이드

AWS EC2 서버에 Docker를 사용한 프로덕션 배포 가이드입니다.

---

## 📋 목차
1. [배포 아키텍처](#배포-아키텍처)
2. [사전 준비사항](#사전-준비사항)
3. [EC2 서버 초기 설정](#ec2-서버-초기-설정)
4. [환경변수 설정](#환경변수-설정)
5. [배포 실행](#배포-실행)
6. [배포 확인](#배포-확인)
7. [트러블슈팅](#트러블슈팅)
8. [운영 및 모니터링](#운영-및-모니터링)

---

## 🏗️ 배포 아키텍처

### 시스템 구성

```
인터넷 (Port 80)
    ↓
AWS EC2 인스턴스
    ↓
[Nginx Container] (:80)
    ├─ /api/* → [Backend Container] (:8080)
    │              ↓
    │          [MySQL Container] (:3306)
    │          [Redis Container] (:6379)
    │          [Qdrant Container] (:6333)
    │
    └─ /* → [Frontend Container] (:3000)
```

### 포트 매핑

| 서비스 | 내부 포트 | 외부 노출 | 설명 |
|--------|----------|----------|------|
| Nginx | 80 | ✅ 외부 노출 | Reverse Proxy |
| Frontend | 3000 | ❌ 내부 전용 | Next.js App |
| Backend | 8080 | ❌ 내부 전용 | Express API |
| MySQL | 3306 | ❌ 내부 전용 | 데이터베이스 |
| Redis | 6379 | ❌ 내부 전용 | 캐시 |
| Qdrant | 6333, 6334 | ❌ 내부 전용 | 벡터 DB |

### 라우팅 규칙

- `http://[EC2-IP]/api/*` → Backend API 요청
- `http://[EC2-IP]/*` → Frontend 페이지 요청

---

## 🔧 사전 준비사항

### 1. AWS EC2 인스턴스

#### 권장 사양
- **인스턴스 타입**: t3.medium 이상 (2 vCPU, 4GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **스토리지**: 30GB 이상
- **보안 그룹**:
  - HTTP (80) 인바운드 허용
  - SSH (22) 인바운드 허용 (본인 IP만)

#### Security Group 설정 예시

| 타입 | 프로토콜 | 포트 범위 | 소스 | 설명 |
|-----|---------|----------|------|------|
| HTTP | TCP | 80 | 0.0.0.0/0 | 웹 트래픽 |
| SSH | TCP | 22 | [본인 IP]/32 | SSH 접속 |

### 2. 로컬 환경

- Git 설치
- 프로젝트 소스 코드 접근 권한
- AWS EC2 접속용 .pem 키 파일

---

## 🚀 EC2 서버 초기 설정

### 1. EC2 인스턴스 접속

```bash
# SSH를 통한 EC2 접속 (로컬에서 실행)
ssh -i /path/to/your-key.pem ubuntu@[EC2-PUBLIC-IP]
```

### 2. 시스템 패키지 업데이트

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Docker 설치

```bash
# Docker 설치 스크립트
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker 버전 확인
docker --version

# 현재 사용자를 docker 그룹에 추가 (sudo 없이 docker 실행)
sudo usermod -aG docker $USER

# 재로그인하여 그룹 변경사항 적용
exit
# 다시 SSH 접속
ssh -i /path/to/your-key.pem ubuntu@[EC2-PUBLIC-IP]

# Docker 실행 권한 확인
docker ps
```

### 4. Docker Compose 설치

```bash
# Docker Compose V2 설치 (Docker Desktop에 포함)
sudo apt install docker-compose-plugin -y

# 버전 확인
docker compose version
```

### 5. Git 설치 및 프로젝트 클론

```bash
# Git 설치
sudo apt install git -y

# 프로젝트 클론
cd ~
git clone https://github.com/your-username/mindconnect.git
# 또는 Private Repository인 경우 Personal Access Token 사용
# git clone https://[TOKEN]@github.com/your-username/mindconnect.git

cd mindconnect
```

---

## ⚙️ 환경변수 설정

### 1. Frontend 환경변수 설정

```bash
cd ~/mindconnect/frontend

# .env.production 파일 편집
nano .env.production
```

#### 수정 필요 항목

```bash
# EC2 퍼블릭 IP로 변경
NEXT_PUBLIC_SITE_URL=http://13.124.xxx.xxx

# 나머지는 기본값 유지
NEXT_PUBLIC_API_BASE_URL=/api/v1
NODE_ENV=production
NEXT_PUBLIC_KAKAO_MAP_KEY=8233861a0e854db767f08eb010554907
NEXT_PUBLIC_KAKAO_REST_KEY=e468ddab4353aa3f34c6f567d61c4c96
```

**저장**: `Ctrl + O` → Enter → `Ctrl + X`

### 2. Backend 환경변수 설정

```bash
cd ~/mindconnect/backend

# .env.example을 복사하여 .env 생성
cp .env.example .env

# .env 파일 편집
nano .env
```

#### 필수 수정 항목

```bash
# 프로덕션 모드 설정
NODE_ENV=production

# 데이터베이스 비밀번호 변경 (강력한 비밀번호 사용)
DATABASE_URL="mysql://mindconnect_user:STRONG_DB_PASSWORD@mysql:3306/mindconnect"
MYSQL_ROOT_PASSWORD=STRONG_ROOT_PASSWORD
MYSQL_PASSWORD=STRONG_DB_PASSWORD

# JWT 비밀키 변경 (32자 이상 무작위 문자열)
JWT_SECRET=GENERATE_STRONG_SECRET_KEY_HERE_32_CHARS_MIN

# CORS 설정 (EC2 퍼블릭 IP)
CORS_ORIGIN=http://13.124.xxx.xxx

# Kakao API 키 (실제 키로 변경)
KAKAO_API_KEY=실제_카카오_REST_API_키

# OpenAI API 키 (실제 키로 변경)
OPENAI_API_KEY=sk-실제_OpenAI_API_키

# 로그 레벨 (프로덕션에서는 info 권장)
LOG_LEVEL=info

# Redis 비밀번호 설정 (선택사항, 권장)
REDIS_PASSWORD=STRONG_REDIS_PASSWORD
```

**저장**: `Ctrl + O` → Enter → `Ctrl + X`

### 3. 강력한 비밀번호/비밀키 생성 방법

```bash
# JWT Secret 생성 (32자)
openssl rand -base64 32

# MySQL 비밀번호 생성
openssl rand -base64 16

# Redis 비밀번호 생성
openssl rand -base64 16
```

---

## 🚢 배포 실행

### 1. Docker 이미지 빌드 및 컨테이너 실행

```bash
cd ~/mindconnect

# 프로덕션 환경으로 실행
docker compose -f docker-compose.prod.yml up -d --build
```

**옵션 설명**:
- `-f docker-compose.prod.yml`: 프로덕션 설정 파일 사용
- `up`: 컨테이너 시작
- `-d`: 백그라운드 실행 (detached mode)
- `--build`: 이미지 재빌드

### 2. 컨테이너 상태 확인

```bash
# 모든 컨테이너 상태 확인
docker compose -f docker-compose.prod.yml ps

# 실행 중인 컨테이너만 확인
docker ps
```

**정상 상태 예시**:
```
NAME                          STATUS
mindconnect-nginx-prod        Up (healthy)
mindconnect-frontend-prod     Up
mindconnect-backend-prod      Up (healthy)
mindconnect-mysql-prod        Up (healthy)
mindconnect-redis-prod        Up (healthy)
mindconnect-qdrant-prod       Up (healthy)
```

### 3. 컨테이너 로그 확인

```bash
# 전체 서비스 로그 확인
docker compose -f docker-compose.prod.yml logs

# 특정 서비스 로그만 확인
docker compose -f docker-compose.prod.yml logs nginx
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend

# 실시간 로그 확인 (-f: follow)
docker compose -f docker-compose.prod.yml logs -f backend
```

### 4. 데이터베이스 마이그레이션 실행

```bash
# Backend 컨테이너 내부로 진입
docker exec -it mindconnect-backend-prod sh

# Prisma 마이그레이션 실행
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate

# 컨테이너에서 나가기
exit
```

---

## ✅ 배포 확인

### 1. 헬스 체크

```bash
# EC2 서버에서 확인
curl http://localhost/nginx-health  # Nginx 헬스 체크
curl http://localhost/api/v1/health # Backend 헬스 체크
```

### 2. 브라우저 접속 확인

로컬 컴퓨터 브라우저에서:

```
http://[EC2-PUBLIC-IP]             → Frontend 메인 페이지
http://[EC2-PUBLIC-IP]/api/v1/health → Backend 헬스 체크
```

### 3. API 동작 확인

```bash
# 센터 목록 조회 테스트
curl http://[EC2-PUBLIC-IP]/api/v1/centers?page=1&limit=10
```

---

## 🔍 트러블슈팅

### 1. 컨테이너가 시작되지 않을 때

```bash
# 컨테이너 로그 확인
docker compose -f docker-compose.prod.yml logs [서비스명]

# 모든 컨테이너 중지 및 재시작
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

### 2. Frontend가 Backend에 연결되지 않을 때

#### 원인 1: 환경변수 오류
```bash
# Frontend 컨테이너 환경변수 확인
docker exec mindconnect-frontend-prod printenv | grep NEXT_PUBLIC_API_BASE_URL

# 올바른 값: NEXT_PUBLIC_API_BASE_URL=/api/v1
```

#### 원인 2: Nginx 설정 오류
```bash
# Nginx 설정 파일 확인
docker exec mindconnect-nginx-prod cat /etc/nginx/nginx.conf

# Nginx 로그 확인
docker compose -f docker-compose.prod.yml logs nginx
```

### 3. Backend 헬스 체크 실패

```bash
# Backend 로그 확인
docker compose -f docker-compose.prod.yml logs backend

# MySQL 연결 확인
docker exec -it mindconnect-backend-prod sh
curl http://mysql:3306  # MySQL 접속 확인
exit
```

### 4. MySQL 연결 오류

```bash
# MySQL 컨테이너 상태 확인
docker compose -f docker-compose.prod.yml ps mysql

# MySQL 로그 확인
docker compose -f docker-compose.prod.yml logs mysql

# MySQL 직접 접속 테스트
docker exec -it mindconnect-mysql-prod mysql -u mindconnect_user -p
# 비밀번호 입력 후
SHOW DATABASES;
USE mindconnect;
SHOW TABLES;
exit
```

### 5. 포트 80 접속 불가

#### Security Group 확인
1. AWS EC2 콘솔 접속
2. 인스턴스 → Security Groups
3. Inbound Rules에 HTTP (80) 포트 허용 확인

#### 방화벽 확인
```bash
# UFW 방화벽 상태 확인
sudo ufw status

# 80 포트 허용 (필요시)
sudo ufw allow 80/tcp
```

---

## 🛠️ 운영 및 모니터링

### 1. 컨테이너 재시작

```bash
# 전체 컨테이너 재시작
docker compose -f docker-compose.prod.yml restart

# 특정 서비스만 재시작
docker compose -f docker-compose.prod.yml restart backend
```

### 2. 컨테이너 중지 및 제거

```bash
# 컨테이너 중지 (볼륨 유지)
docker compose -f docker-compose.prod.yml down

# 컨테이너 및 볼륨 완전 제거 (⚠️ 데이터 손실 주의!)
docker compose -f docker-compose.prod.yml down -v
```

### 3. 로그 관리

```bash
# 로그 파일 위치
docker volume inspect mindconnect-prod_nginx_logs

# 오래된 로그 정리 (디스크 공간 확보)
docker system prune -a --volumes
```

### 4. 코드 업데이트 배포

```bash
cd ~/mindconnect

# 최신 코드 가져오기
git pull origin main

# 컨테이너 재빌드 및 재시작
docker compose -f docker-compose.prod.yml up -d --build

# 데이터베이스 마이그레이션 (필요시)
docker exec -it mindconnect-backend-prod npx prisma migrate deploy
```

### 5. 데이터베이스 백업

```bash
# MySQL 데이터베이스 백업
docker exec mindconnect-mysql-prod mysqldump \
  -u root -p[ROOT_PASSWORD] mindconnect > backup_$(date +%Y%m%d_%H%M%S).sql

# 백업 파일 AWS S3에 업로드 (선택사항)
aws s3 cp backup_*.sql s3://your-bucket/backups/
```

### 6. 리소스 모니터링

```bash
# 컨테이너 리소스 사용량 확인
docker stats

# 디스크 사용량 확인
df -h

# Docker 디스크 사용량 확인
docker system df
```

---

## 📌 자주 사용하는 명령어

```bash
# 컨테이너 상태 확인
docker compose -f docker-compose.prod.yml ps

# 로그 실시간 확인
docker compose -f docker-compose.prod.yml logs -f

# 컨테이너 재시작
docker compose -f docker-compose.prod.yml restart [서비스명]

# 컨테이너 내부 진입
docker exec -it mindconnect-backend-prod sh

# 환경변수 확인
docker exec mindconnect-backend-prod printenv
```

---

## 🔐 보안 체크리스트

- [ ] `.env` 파일에 강력한 비밀번호 설정
- [ ] JWT Secret 변경 (32자 이상)
- [ ] CORS_ORIGIN을 특정 도메인/IP로 제한
- [ ] Security Group에서 불필요한 포트 차단
- [ ] SSH 접속을 본인 IP만 허용
- [ ] MySQL root 비밀번호 변경
- [ ] Redis 비밀번호 설정
- [ ] 정기적인 시스템 패키지 업데이트
- [ ] 데이터베이스 정기 백업 설정

---

## 📞 문제 발생 시

1. **컨테이너 로그 확인**: `docker compose -f docker-compose.prod.yml logs`
2. **헬스 체크 실행**: `curl http://localhost/api/v1/health`
3. **환경변수 검증**: `.env` 파일 및 `.env.production` 확인
4. **Security Group 확인**: AWS 콘솔에서 포트 80 허용 여부 확인
5. **GitHub Issues**: 프로젝트 저장소에 이슈 등록

---

**배포 완료!** 🎉

이제 `http://[EC2-PUBLIC-IP]`로 접속하여 마음이음 서비스를 사용할 수 있습니다.

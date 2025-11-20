# 센터 임베딩 생성용 더미 데이터 삽입 가이드

## 📋 개요

LLM 임베딩 생성을 위해 **8개 정신건강복지센터**에 대한 풍부한 더미 데이터를 생성합니다.

### 생성되는 데이터

**센터 기본 정보**:
- 센터명, 센터 유형, 주소, 위도/경도
- **풍부한 business_content** (300-500자): 센터 소개, 전문 분야, 제공 서비스 상세 설명
- other_info: 부가 정보 (24시간 상담, 주차, 온라인 지원 등)
- 전화번호, 운영 기관

**프로그램 정보** (센터당 3-5개):
- 24시간 위기상담, 우울증 치료, 중독 재활, 청년 상담 등
- 각 프로그램별 대상, 설명, 운영 방식, 소요 시간

**운영 시간**:
- 월~금: 09:00-18:00
- 토~일: 휴무

**인력 정보**:
- 정신건강의학과 전문의, 임상심리사, 정신건강사회복지사

## 🚀 실행 방법

### 1. MySQL 컨테이너 실행 확인

```bash
# 프로젝트 루트에서
docker-compose -f docker-compose.dev.yml ps
```

### 2. SQL 파일 실행

```bash
# 프로젝트 루트에서
docker-compose -f docker-compose.dev.yml exec -T mysql \
  mysql -umindconnect_user -pmindconnect_pass mindconnect \
  < backend/scripts/seed_centers_for_embedding_v2.sql
```

**예상 출력**:
```
id  center_name                    content_length  program_count  staff_count
1   서울시 정신건강복지센터         456            5              3
2   강남구 정신건강복지센터         423            4              3
3   마포구 정신건강복지센터         445            5              3
4   용산구 정신건강복지센터         478            4              3
5   성북구 정신건강복지센터         434            4              3
6   광진구 정신건강복지센터         441            4              3
7   중랑구 정신건강복지센터         429            4              3
8   은평구 정신건강복지센터         452            4              3

status
데이터 삽입 완료!
```

### 3. 데이터 확인

```bash
# 센터 정보 확인
docker-compose -f docker-compose.dev.yml exec -T mysql \
  mysql -umindconnect_user -pmindconnect_pass -D mindconnect \
  -e "SELECT id, center_name, CHAR_LENGTH(business_content) as content_length FROM centers;"

# 프로그램 개수 확인
docker-compose -f docker-compose.dev.yml exec -T mysql \
  mysql -umindconnect_user -pmindconnect_pass -D mindconnect \
  -e "SELECT center_id, COUNT(*) as program_count FROM center_programs GROUP BY center_id;"

# 특정 센터의 상세 정보 확인
docker-compose -f docker-compose.dev.yml exec -T mysql \
  mysql -umindconnect_user -pmindconnect_pass -D mindconnect \
  -e "SELECT center_name, business_content FROM centers WHERE id = 1\G"
```

## 📊 생성될 임베딩 텍스트 예시

### 서울시 정신건강복지센터 (센터 ID: 1)

```
서울시 정신건강복지센터

유형: 정신건강복지센터

서울시민의 정신건강 증진을 위한 통합 서비스를 제공하는 광역 정신건강복지센터입니다.
우울증, 불안장애, 조현병, 양극성장애 등 다양한 정신질환에 대한 전문 상담과 치료 연계
서비스를 제공합니다. 24시간 위기상담 핫라인을 운영하며, 자살 위기 개입 및 사후관리
프로그램을 진행합니다. 직장인 스트레스 관리, 청년 정신건강 지원, 노인 우울증 예방
프로그램 등 생애주기별 맞춤형 서비스를 제공하며...

24시간 상담 가능, 주차 가능, 장애인 편의시설 완비, 온라인 상담 지원

제공 프로그램:
- 24시간 위기상담 핫라인 (대상: 전체): 자살 위기, 정신건강 응급 상황에 대한 24시간 전화 상담...
- 직장인 마음건강 집단상담 (대상: 성인(직장인)): 직장 내 스트레스, 번아웃, 대인관계 어려움을...
- 청년 우울·불안 자조모임 (대상: 청년(20-39세)): 우울증, 불안장애를 경험하는 청년들이...
- 노인 우울증 예방 프로그램 (대상: 노인(65세 이상)): 독거노인, 은퇴 후 우울감을...
- 정신장애인 사회복귀 훈련 (대상: 정신장애인): 조현병, 양극성장애 등 중증 정신질환을...

위치: 서울특별시 중구 세종대로 110
```

**총 텍스트 길이**: 약 1,000-1,500자 (임베딩에 충분한 정보량)

## ✅ 임베딩 생성 준비 완료 체크리스트

- [ ] MySQL 컨테이너 실행 중
- [ ] SQL 파일 실행 완료
- [ ] 8개 센터 데이터 확인 (각 센터당 3-5개 프로그램)
- [ ] business_content 길이 확인 (300-500자)
- [ ] Qdrant 컨테이너 실행 중
- [ ] OPENAI_API_KEY 환경 변수 설정

## 🎯 다음 단계

1. **Qdrant 초기화**:
   ```bash
   cd backend
   node src/scripts/initQdrant.js
   ```

2. **센터 임베딩 배치 실행**:
   ```bash
   cd backend
   node src/cron/centerEmbeddingBatch.js
   ```

3. **임베딩 결과 확인**:
   - Qdrant Web UI: http://localhost:6333/dashboard
   - 컬렉션 "centers" 확인
   - 8개 벡터 삽입 확인

## 📝 참고사항

- **데이터 특징**: 각 센터는 지역 특성을 반영한 전문 서비스 제공
  - 강남구: 직장인 번아웃, 스트레스 관리
  - 마포구: 청소년 상담, 중독 치료
  - 용산구: PTSD, 외국인 상담
  - 광진구: 청년 정신건강
  - 은평구: 노인 정신건강

- **임베딩 품질**: 풍부한 텍스트로 의미있는 의미론적 검색 가능

- **비용**: OpenAI API 호출 비용 (8개 센터 × 약 1,500자 ≈ $0.01-0.02)

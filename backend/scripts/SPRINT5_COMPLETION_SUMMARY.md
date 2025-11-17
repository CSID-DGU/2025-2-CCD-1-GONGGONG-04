# Sprint 5 완료 요약: Qdrant Vector DB 통합 및 임베딩 생성

## 📋 작업 개요

**목표**: 8개 센터에 대한 풍부한 임베딩 데이터 생성 및 Qdrant Vector DB 저장

**완료일**: 2025-01-16
**소요 시간**: 약 5초 (배치 작업)
**API 비용**: ~8,000 토큰 (OpenAI text-embedding-3-large)

---

## ✅ 완료된 작업

### 1. 데이터 품질 개선
- **문제**: 기존 센터 데이터의 business_content가 5-12자로 너무 짧음, 프로그램 데이터 0개
- **해결**: 풍부한 더미 데이터 생성 SQL 스크립트 작성
  - 각 센터별 300-500자 상세 설명
  - 총 33개 프로그램 (센터당 3-5개)
  - 운영시간, 인력 정보 추가

### 2. SQL 스크립트 생성 및 실행
**파일**: `backend/scripts/seed_centers_for_embedding.sql`

**실행 결과**:
```
✅ 8개 센터 삽입
✅ 33개 프로그램 삽입
✅ 56개 운영시간 삽입 (센터당 7개: 월-일)
✅ 24개 인력 정보 삽입 (센터당 3명)
```

### 3. 배치 스크립트 수정
**파일**: `backend/src/cron/centerEmbeddingBatch.js`

**주요 수정사항**:
- 존재하지 않는 필드 참조 제거 (`description`, `targetGroup`, `specialization`)
- 실제 DB 스키마 필드 사용 (`businessContent`, `centerType`, `otherInfo`)
- BigInt → Number 변환 (Prisma BigInt 직렬화 이슈 해결)

### 4. Qdrant 설정 수정
**파일**: `backend/src/config/qdrant.js`

**변경사항**:
```javascript
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY || undefined,
  checkCompatibility: false  // ✅ 버전 체크 비활성화 (1.7.4 구버전 사용)
});
```

### 5. Vector DB Service API 수정
**파일**: `backend/src/services/vectorDB.service.js`

**문제**: Qdrant client 1.15.1 vs server 1.7.4 API 형식 불일치
**해결**: 구버전 API 형식으로 변경

**변경 전** (신버전 형식):
```javascript
await qdrantClient.upsert(COLLECTION_NAME, {
  wait: true,
  points: [{ id: String(id), vector, payload }]
});
```

**변경 후** (구버전 형식):
```javascript
await qdrantClient.upsert(COLLECTION_NAME, {
  wait: true,
  batch: {
    ids: [id],  // Number ID 사용
    vectors: [vector],
    payloads: [{ ...payload, updatedAt: new Date().toISOString() }]
  }
});
```

### 6. 임베딩 배치 작업 실행
**실행 결과**:
```
✅ 8개 센터 임베딩 생성 성공
✅ 총 토큰 수: ~8,000 (센터당 900-1,100 토큰)
✅ 임베딩 차원: 3072 (text-embedding-3-large)
✅ 소요 시간: 5초
✅ 실패: 0건
```

**센터별 토큰 사용량**:
| 센터 | 토큰 수 | 텍스트 길이 |
|------|--------|-----------|
| 서울시 정신건강복지센터 | 1,105 | 1,090자 |
| 강남구 정신건강복지센터 | 969 | 960자 |
| 마포구 정신건강복지센터 | 1,111 | 1,091자 |
| 용산구 정신건강복지센터 | 972 | 978자 |
| 성북구 정신건강복지센터 | 925 | 915자 |
| 광진구 정신건강복지센터 | 1,040 | 990자 |
| 중랑구 정신건강복지센터 | 964 | 940자 |
| 은평구 정신건강복지센터 | 991 | 985자 |

### 7. Qdrant Vector DB 검증
**컬렉션 정보**:
```json
{
  "status": "green",
  "vectors_count": 8,
  "points_count": 8,
  "config": {
    "params": {
      "vectors": {
        "size": 3072,
        "distance": "Cosine"
      }
    }
  }
}
```

### 8. 의미론적 검색 테스트
**테스트 쿼리**: "우울증 상담이 필요해요"

**검색 결과** (Top 3):
1. **서울시 정신건강복지센터** - 유사도 42.63%
   - 5개 프로그램 (24시간 위기상담, 직장인 상담, 청년 자조모임, 노인 우울증 예방, 사회복귀 훈련)
2. **강남구 정신건강복지센터** - 유사도 40.99%
   - 4개 프로그램 (직장인 번아웃, 청년 자살예방, 가족교육, 스트레스 관리)
3. **성북구 정신건강복지센터** - 유사도 39.46%
   - 4개 프로그램 (아동청소년 상담, 직장인 마음건강, 여성 우울, 노인 정신건강)

---

## 🔧 기술적 이슈 및 해결

### Issue 1: 데이터 부족
- **증상**: 기존 센터 데이터 business_content 5-12자, 프로그램 0개
- **원인**: 초기 시드 데이터가 최소한의 정보만 포함
- **해결**: 300-500자 상세 설명 + 33개 프로그램 더미 데이터 생성

### Issue 2: 스키마 불일치
- **증상**: `description`, `targetGroup` 필드 참조 에러
- **원인**: 배치 스크립트가 존재하지 않는 필드 참조
- **해결**: 실제 스키마 필드로 변경 (`businessContent`, `centerType`, `otherInfo`)

### Issue 3: BigInt 직렬화
- **증상**: "Do not know how to serialize a BigInt"
- **원인**: Prisma의 `center.id`가 BigInt 타입, JSON 직렬화 불가
- **해결**: `Number(center.id)` 변환 추가

### Issue 4: Qdrant API 버전 불일치
- **증상**: "Bad Request - Format error in JSON body"
- **원인**: Qdrant client 1.15.1 vs server 1.7.4 API 형식 차이
- **해결**: 구버전 `batch` 형식으로 API 호출 변경

---

## 📊 생성된 임베딩 텍스트 예시

### 서울시 정신건강복지센터
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
- 24시간 위기상담 핫라인 (대상: 전체): 자살 위기, 정신건강 응급 상황에 대한...
- 직장인 마음건강 집단상담 (대상: 성인(직장인)): 직장 내 스트레스, 번아웃...
- 청년 우울·불안 자조모임 (대상: 청년(20-39세)): 우울증, 불안장애를 경험하는...
- 노인 우울증 예방 프로그램 (대상: 노인(65세 이상)): 독거노인, 은퇴 후 우울감을...
- 정신장애인 사회복귀 훈련 (대상: 정신장애인): 조현병, 양극성장애 등...

위치: 서울특별시 중구 세종대로 110
```

**총 길이**: 1,090자
**임베딩 토큰**: 1,105개
**벡터 차원**: 3,072

---

## 📁 관련 파일

### 생성된 파일
- `backend/scripts/seed_centers_for_embedding.sql` - 센터 더미 데이터 SQL
- `backend/scripts/README_SEED_CENTERS.md` - 실행 가이드
- `backend/test_semantic_search.js` - 의미론적 검색 테스트 스크립트
- `backend/scripts/SPRINT5_COMPLETION_SUMMARY.md` - 이 문서

### 수정된 파일
- `backend/src/cron/centerEmbeddingBatch.js` - 스키마 필드 수정, BigInt 변환
- `backend/src/config/qdrant.js` - 버전 체크 비활성화
- `backend/src/services/vectorDB.service.js` - API 형식 수정 (batch 형식)

---

## 🚀 다음 단계

### 즉시 진행 가능
1. ✅ **의미론적 검색 API 엔드포인트 구현**
   - `POST /api/v1/recommendations/hybrid`
   - 규칙 기반 + 의미론적 검색 결합
   - 통합 테스트 17개 실행 가능

2. ✅ **Redis 캐싱 활성화**
   - 임베딩 API 호출 캐싱 (5분 TTL)
   - 비용 절감 효과

3. ✅ **벡터 검색 최적화**
   - 임계값 조정 (현재 0.5 → 0.3-0.4 권장)
   - 필터링 조건 추가 (지역, 센터 유형 등)

### 장기 개선 사항
1. **Qdrant 버전 업그레이드**
   - 현재: 1.7.4 (2023년 버전)
   - 최신: 1.15.1 (2025년 버전)
   - 장점: 최신 API 지원, 성능 개선

2. **임베딩 모델 평가**
   - 현재: text-embedding-3-large (3072차원)
   - 대안: text-embedding-3-small (1536차원, 비용 1/2)

3. **배치 작업 스케줄링**
   - 매일 02:00 AM 자동 실행 (cron)
   - 신규/수정 센터 자동 임베딩 생성

---

## 💰 비용 분석

### OpenAI API 비용
- **모델**: text-embedding-3-large
- **가격**: $0.00013 / 1K tokens
- **사용량**: ~8,000 tokens
- **총 비용**: ~$0.001 (약 1.3원)

### 예상 운영 비용
- **센터 100개**: ~$0.125/batch (약 170원)
- **월 1회 업데이트**: ~$1.50/year (약 2,000원/년)

---

## ✅ 검증 체크리스트

- [x] 8개 센터 데이터 삽입 완료
- [x] 33개 프로그램 데이터 삽입 완료
- [x] Qdrant 컬렉션 생성 완료 (3072차원, Cosine)
- [x] 8개 센터 임베딩 생성 및 저장 완료
- [x] 의미론적 검색 정상 작동 확인
- [x] 유사도 점수 검증 (40-42% 범위)
- [x] BigInt 직렬화 이슈 해결
- [x] Qdrant API 버전 호환성 해결
- [ ] Redis 캐싱 활성화 (선택사항)
- [ ] 하이브리드 추천 API 구현 (다음 단계)
- [ ] 통합 테스트 17개 실행 (다음 단계)

---

## 🔍 문제 해결 참고

### Qdrant 연결 확인
```bash
curl http://localhost:6333/collections/centers
```

### 벡터 검색 테스트
```bash
cd backend
export OPENAI_API_KEY="your-api-key"
node test_semantic_search.js
```

### 배치 작업 재실행
```bash
cd backend
export OPENAI_API_KEY="your-api-key"
node src/cron/centerEmbeddingBatch.js
```

### Qdrant Web UI
```
http://localhost:6333/dashboard
```

---

**작성자**: Claude (AI Assistant)
**작성일**: 2025-01-16
**프로젝트**: 마음이음 (MindConnect) - Sprint 5

# MindConnect API Documentation

> **정신건강 관련 공공기관 통합 검색 및 추천 플랫폼 API**

**Base URL**: `http://localhost:8080/api/v1`
**API Version**: 1.0.0
**Last Updated**: 2025-01-05

---

## 📋 목차

### Sprint 1: 기본 기능
1. [Self-Assessment (자가진단)](#self-assessment)
   - [템플릿 조회](#get-template)
   - [자가진단 제출](#submit-assessment)
2. [Legacy Recommendations (추천 - 구버전)](#legacy-recommendations)
   - [센터 추천 계산 (Legacy)](#calculate-recommendations-legacy)

### Sprint 2: 규칙 기반 추천 시스템 (신규)
3. [Recommendations v2 (추천 시스템 v2)](#recommendations-v2)
   - [POST /api/v1/recommendations](#post-apiv1recommendations)
   - [요청 스키마](#요청-스키마)
   - [응답 스키마](#응답-스키마)
   - [에러 코드](#에러-코드)
   - [사용 예시](#사용-예시)
   - [성능 및 제한사항](#성능-및-제한사항)

---

# Sprint 1: 기본 기능

## Self-Assessment

### GET 템플릿 조회 {#get-template}

자가진단 템플릿과 질문 목록을 조회합니다.

**Endpoint**: `GET /self-assessments/templates/:templateId`

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| templateId | integer | Yes | 템플릿 ID (path parameter) |

**Request Example**:
```http
GET /api/v1/self-assessments/templates/2 HTTP/1.1
Host: localhost:8080
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "templateId": 2,
    "templateName": "우울증 자가진단 (PHQ-9)",
    "templateType": "depression",
    "description": "PHQ-9 기반 우울증 자가진단 도구",
    "questions": [
      {
        "id": 1,
        "questionText": "기분이 가라앉거나 우울하거나 희망이 없다고 느꼈다",
        "questionOrder": 1,
        "options": [
          { "value": 0, "label": "전혀 그렇지 않다" },
          { "value": 1, "label": "며칠 동안" },
          { "value": 2, "label": "일주일 이상" },
          { "value": 3, "label": "거의 매일" }
        ]
      }
    ],
    "scoringRules": {
      "totalPoints": 27,
      "calculation": "sum"
    },
    "version": "1.0"
  }
}
```

---

### POST 자가진단 제출 {#submit-assessment}

사용자의 자가진단 답변을 제출하고 채점 결과를 받습니다.

**Endpoint**: `POST /self-assessments/submit`

**Request Body**:
```json
{
  "sessionId": "test-session-123",
  "templateId": 2,
  "answers": [
    { "questionId": 1, "selectedOption": 2 },
    { "questionId": 2, "selectedOption": 1 }
  ]
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "assessmentId": 1,
    "templateName": "우울증 자가진단 (PHQ-9)",
    "totalScore": 15,
    "maxScore": 27,
    "severity": "MID",
    "result": {
      "message": "중간 수준의 우울감이 있습니다",
      "recommendation": "전문가 상담 권장"
    },
    "assessedAt": "2025-10-31T03:53:41.000Z"
  }
}
```

---

## Legacy Recommendations

### POST 센터 추천 계산 (Legacy) {#calculate-recommendations-legacy}

> ⚠️ **Deprecated**: 이 API는 Sprint 1 버전입니다. Sprint 2의 [새로운 추천 API](#post-apiv1recommendations)를 사용하는 것을 권장합니다.

사용자의 위치와 자가진단 결과를 기반으로 맞춤형 센터를 추천합니다.

**Endpoint**: `POST /recommendations/calculate`

**Request Body**:
```json
{
  "sessionId": "test-session-123",
  "location": {
    "latitude": 37.5665,
    "longitude": 126.9780
  },
  "filters": {
    "maxDistance": 50
  },
  "assessmentId": 1
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "totalCount": 2,
    "recommendations": [
      {
        "centerId": 1,
        "centerName": "서울시 정신건강복지센터",
        "distanceKm": 0.5,
        "totalScore": 85.5,
        "scores": {
          "distance": 30,
          "operating": 25,
          "specialty": 20,
          "program": 10.5
        }
      }
    ]
  }
}
```

---

# Sprint 2: 규칙 기반 추천 시스템 (신규)

## Recommendations v2

### 개요

Sprint 2 추천 시스템은 사용자의 위치와 선호도 프로필을 기반으로 최적의 정신건강 센터를 추천합니다.

**주요 기능**:
- 거리 기반 필터링 (최대 50km)
- 11개 평가 모듈을 통한 규칙 기반 스코어링
- 맞춤형 추천 (연령, 고민, 예산, 선호 시간 등)
- 실시간 운영 상태 확인
- Redis 캐싱 (5분 TTL)
- Prometheus 메트릭 수집
- Sentry 에러 추적

---

### POST /api/v1/recommendations {#post-apiv1recommendations}

사용자 위치와 프로필을 기반으로 추천 센터 목록을 반환합니다.

**Endpoint**: `POST /api/v1/recommendations`
**Content-Type**: `application/json`
**Response Format**: `application/json`

---

## 요청 스키마

### Request Body

```json
{
  "latitude": 37.5665,
  "longitude": 126.9780,
  "userProfile": {
    "age": 25,
    "concerns": ["불안", "우울"],
    "preferredProgramTypes": ["개인상담", "집단상담"],
    "budget": "무료",
    "preferredTimes": ["평일 오전", "주말 오후"],
    "transportation": "도보",
    "accessibility": true,
    "parkingNeeded": false
  },
  "maxDistance": 5000,
  "limit": 10
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|-----|------|------|--------|------|
| `latitude` | number | ✅ | - | 사용자 위도 (-90 ~ 90) |
| `longitude` | number | ✅ | - | 사용자 경도 (-180 ~ 180) |
| `userProfile` | object | ❌ | null | 사용자 선호도 프로필 |
| `userProfile.age` | number | ❌ | - | 나이 (10 ~ 100) |
| `userProfile.concerns` | string[] | ❌ | [] | 주요 고민 (최대 5개) |
| `userProfile.preferredProgramTypes` | string[] | ❌ | [] | 선호 프로그램 (최대 5개) |
| `userProfile.budget` | string | ❌ | - | 예산 ("무료", "유료") |
| `userProfile.preferredTimes` | string[] | ❌ | [] | 선호 시간대 (최대 3개) |
| `userProfile.transportation` | string | ❌ | - | 이동수단 ("도보", "대중교통", "자가용") |
| `userProfile.accessibility` | boolean | ❌ | false | 장애인 편의시설 필요 |
| `userProfile.parkingNeeded` | boolean | ❌ | false | 주차 필요 여부 |
| `maxDistance` | number | ❌ | 10000 | 최대 거리 (m, 최대 50000) |
| `limit` | number | ❌ | 10 | 최대 결과 수 (최대 50) |

### 선호 시간대 옵션

- `"평일 오전"` (09:00-12:00)
- `"평일 오후"` (14:00-18:00)
- `"평일 저녁"` (18:00-21:00)
- `"주말 오전"` (09:00-12:00)
- `"주말 오후"` (14:00-18:00)

### 이동수단 옵션

- `"도보"`: 1.5km 이내 센터 선호
- `"대중교통"`: 5km 이내 센터 선호
- `"자가용"`: 10km 이내 센터 선호

---

## 응답 스키마

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "totalCount": 15,
    "returnedCount": 10,
    "recommendations": [
      {
        "centerId": 123,
        "name": "서울시립 정신건강복지센터",
        "address": "서울특별시 중구 세종대로 110",
        "phone": "02-1234-5678",
        "distance": 1234.56,
        "coordinates": {
          "latitude": 37.5665,
          "longitude": 126.9780
        },
        "operatingStatus": {
          "status": "OPEN",
          "statusText": "운영중",
          "nextOpenDate": null,
          "isHoliday": false
        },
        "rating": {
          "averageRating": 4.5,
          "totalReviews": 128
        },
        "programs": [
          {
            "programId": 45,
            "name": "개인상담",
            "description": "1:1 심리상담 프로그램",
            "isFree": true,
            "targetAudience": "성인"
          }
        ],
        "scores": {
          "totalScore": 85.4,
          "normalizedScore": 8.5,
          "details": {
            "distance": {
              "score": 95.0,
              "weight": 0.25,
              "weightedScore": 23.75,
              "reason": "매우 가까운 거리 (1.2km)"
            },
            "operatingStatus": {
              "score": 100.0,
              "weight": 0.15,
              "weightedScore": 15.0,
              "reason": "현재 운영중"
            },
            "programMatch": {
              "score": 80.0,
              "weight": 0.15,
              "weightedScore": 12.0,
              "reason": "개인상담 프로그램 제공"
            },
            "rating": {
              "score": 90.0,
              "weight": 0.10,
              "weightedScore": 9.0,
              "reason": "평균 평점 4.5점 (128개 리뷰)"
            },
            "budget": {
              "score": 100.0,
              "weight": 0.10,
              "weightedScore": 10.0,
              "reason": "무료 프로그램 제공"
            },
            "accessibility": {
              "score": 100.0,
              "weight": 0.08,
              "weightedScore": 8.0,
              "reason": "장애인 편의시설 완비"
            },
            "parking": {
              "score": 80.0,
              "weight": 0.07,
              "weightedScore": 5.6,
              "reason": "주차 가능 (20대)"
            },
            "timeMatch": {
              "score": 70.0,
              "weight": 0.05,
              "weightedScore": 3.5,
              "reason": "평일 오전 운영"
            },
            "concernMatch": {
              "score": 60.0,
              "weight": 0.03,
              "weightedScore": 1.8,
              "reason": "불안, 우울 관련 프로그램 보유"
            },
            "ageMatch": {
              "score": 100.0,
              "weight": 0.01,
              "weightedScore": 1.0,
              "reason": "성인 대상 프로그램"
            },
            "transportation": {
              "score": 90.0,
              "weight": 0.01,
              "weightedScore": 0.9,
              "reason": "도보 접근 가능"
            }
          }
        }
      }
    ],
    "metadata": {
      "requestLocation": {
        "latitude": 37.5665,
        "longitude": 126.9780
      },
      "maxDistance": 5000,
      "hasUserProfile": true,
      "timestamp": "2025-01-05T10:30:00.000Z",
      "processingTimeMs": 245
    }
  }
}
```

### 응답 필드 설명

#### 최상위 필드

| 필드 | 타입 | 설명 |
|-----|------|------|
| `success` | boolean | 요청 성공 여부 |
| `data` | object | 응답 데이터 객체 |

#### data 객체

| 필드 | 타입 | 설명 |
|-----|------|------|
| `totalCount` | number | 거리 내 전체 센터 수 |
| `returnedCount` | number | 실제 반환된 센터 수 |
| `recommendations` | array | 추천 센터 배열 (점수 내림차순) |
| `metadata` | object | 요청 메타데이터 |

#### recommendations 배열 항목

| 필드 | 타입 | 설명 |
|-----|------|------|
| `centerId` | number | 센터 고유 ID |
| `name` | string | 센터 이름 |
| `address` | string | 주소 |
| `phone` | string | 전화번호 |
| `distance` | number | 사용자로부터의 거리 (m) |
| `coordinates` | object | 센터 좌표 (latitude, longitude) |
| `operatingStatus` | object | 운영 상태 정보 |
| `rating` | object | 평점 정보 |
| `programs` | array | 제공 프로그램 목록 |
| `scores` | object | 점수 상세 정보 |

#### operatingStatus 객체

| 필드 | 타입 | 설명 |
|-----|------|------|
| `status` | string | 상태 코드 (OPEN, CLOSED, CLOSING_SOON, HOLIDAY, TEMP_CLOSED, NO_INFO) |
| `statusText` | string | 상태 한글 텍스트 |
| `nextOpenDate` | string\|null | 다음 운영일 (ISO 8601) |
| `isHoliday` | boolean | 휴무일 여부 |

#### scores 객체

| 필드 | 타입 | 설명 |
|-----|------|------|
| `totalScore` | number | 총점 (0-100) |
| `normalizedScore` | number | 정규화 점수 (0-10) |
| `details` | object | 11개 평가 모듈별 점수 상세 |

#### 평가 모듈 가중치

| 모듈 | 가중치 | 설명 |
|-----|--------|------|
| `distance` | 0.25 | 거리 기반 점수 (최우선) |
| `operatingStatus` | 0.15 | 운영 상태 점수 |
| `programMatch` | 0.15 | 프로그램 매칭도 |
| `rating` | 0.10 | 사용자 평점 |
| `budget` | 0.10 | 예산 매칭도 |
| `accessibility` | 0.08 | 접근성 점수 |
| `parking` | 0.07 | 주차 가능 여부 |
| `timeMatch` | 0.05 | 시간대 매칭도 |
| `concernMatch` | 0.03 | 고민 매칭도 |
| `ageMatch` | 0.01 | 연령 매칭도 |
| `transportation` | 0.01 | 교통 편의성 |

---

## 에러 코드

### 400 Bad Request - 입력 검증 실패

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터 검증에 실패했습니다.",
    "details": [
      {
        "field": "latitude",
        "message": "위도는 -90 ~ 90 사이여야 합니다.",
        "received": 100
      }
    ]
  }
}
```

**발생 상황**:
- 필수 필드 누락 (latitude, longitude)
- 좌표 범위 초과 (latitude: -90~90, longitude: -180~180)
- maxDistance 범위 초과 (최대 50000m)
- limit 범위 초과 (최대 50)
- concerns 개수 초과 (최대 5개)
- preferredProgramTypes 개수 초과 (최대 5개)
- preferredTimes 개수 초과 (최대 3개)

### 404 Not Found - 센터 없음

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "요청하신 조건에 맞는 센터를 찾을 수 없습니다.",
    "details": {
      "searchRadius": 5000,
      "centersFound": 0
    }
  }
}
```

**발생 상황**:
- 지정된 반경 내 센터가 없을 때
- 데이터베이스에 센터 데이터가 없을 때

### 500 Internal Server Error - 서버 오류

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    "details": {
      "timestamp": "2025-01-05T10:30:00.000Z",
      "requestId": "req-abc123"
    }
  }
}
```

**발생 상황**:
- 데이터베이스 연결 실패
- Redis 캐시 오류
- 예기치 못한 서버 오류

### HTTP 상태 코드 요약

| 상태 코드 | 설명 | Error Code |
|----------|------|------------|
| 200 | 성공 | - |
| 400 | 입력 검증 실패 | VALIDATION_ERROR |
| 404 | 센터 없음 | NOT_FOUND |
| 429 | 요청 한도 초과 | RATE_LIMIT_EXCEEDED |
| 500 | 서버 오류 | INTERNAL_ERROR |

---

## 사용 예시

### cURL 예시

#### 1. 기본 요청 (위치만 제공)

```bash
curl -X POST http://localhost:8080/api/v1/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.5665,
    "longitude": 126.9780
  }'
```

#### 2. 프로필 포함 요청

```bash
curl -X POST http://localhost:8080/api/v1/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.5665,
    "longitude": 126.9780,
    "userProfile": {
      "age": 28,
      "concerns": ["불안", "우울"],
      "preferredProgramTypes": ["개인상담"],
      "budget": "무료",
      "preferredTimes": ["평일 오전"],
      "transportation": "대중교통",
      "accessibility": false,
      "parkingNeeded": true
    },
    "maxDistance": 5000,
    "limit": 10
  }'
```

#### 3. 장애인 편의시설 필수 요청

```bash
curl -X POST http://localhost:8080/api/v1/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.5665,
    "longitude": 126.9780,
    "userProfile": {
      "accessibility": true,
      "parkingNeeded": true
    },
    "maxDistance": 10000
  }'
```

---

### JavaScript/TypeScript 예시

#### 1. Fetch API (JavaScript)

```javascript
async function getRecommendations(latitude, longitude, userProfile = null) {
  try {
    const response = await fetch('http://localhost:8080/api/v1/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
        userProfile,
        maxDistance: 5000,
        limit: 10,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.data.recommendations;
  } catch (error) {
    console.error('추천 API 호출 실패:', error);
    throw error;
  }
}

// 사용 예시
const recommendations = await getRecommendations(37.5665, 126.9780, {
  age: 25,
  concerns: ['불안'],
  budget: '무료',
});

console.log(`추천 센터 ${recommendations.length}개 발견`);
recommendations.forEach((center) => {
  console.log(`- ${center.name} (${center.distance.toFixed(0)}m, 점수: ${center.scores.normalizedScore})`);
});
```

#### 2. TypeScript with Types

```typescript
interface UserProfile {
  age?: number;
  concerns?: string[];
  preferredProgramTypes?: string[];
  budget?: '무료' | '유료';
  preferredTimes?: string[];
  transportation?: '도보' | '대중교통' | '자가용';
  accessibility?: boolean;
  parkingNeeded?: boolean;
}

interface RecommendationRequest {
  latitude: number;
  longitude: number;
  userProfile?: UserProfile | null;
  maxDistance?: number;
  limit?: number;
}

interface Center {
  centerId: number;
  name: string;
  address: string;
  phone: string;
  distance: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  operatingStatus: {
    status: string;
    statusText: string;
    nextOpenDate: string | null;
    isHoliday: boolean;
  };
  rating: {
    averageRating: number;
    totalReviews: number;
  };
  programs: Array<{
    programId: number;
    name: string;
    description: string;
    isFree: boolean;
    targetAudience: string;
  }>;
  scores: {
    totalScore: number;
    normalizedScore: number;
    details: Record<string, {
      score: number;
      weight: number;
      weightedScore: number;
      reason: string;
    }>;
  };
}

async function getRecommendations(
  request: RecommendationRequest
): Promise<Center[]> {
  try {
    const response = await fetch('http://localhost:8080/api/v1/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.data.recommendations;
  } catch (error) {
    console.error('추천 API 호출 실패:', error);
    throw error;
  }
}

// 사용 예시
const centers = await getRecommendations({
  latitude: 37.5665,
  longitude: 126.9780,
  userProfile: {
    age: 28,
    concerns: ['불안', '우울'],
    preferredProgramTypes: ['개인상담'],
    budget: '무료',
    preferredTimes: ['평일 오전'],
    transportation: '대중교통',
  },
  maxDistance: 5000,
  limit: 10,
});

console.log(`추천 센터 ${centers.length}개 발견`);
```

#### 3. React Hook 예시

```typescript
import { useState, useEffect } from 'react';

function useRecommendations(latitude: number, longitude: number, userProfile: UserProfile | null) {
  const [recommendations, setRecommendations] = useState<Center[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      setError(null);

      try {
        const centers = await getRecommendations({
          latitude,
          longitude,
          userProfile,
          maxDistance: 5000,
          limit: 10,
        });

        setRecommendations(centers);
      } catch (err) {
        setError(err instanceof Error ? err.message : '추천 센터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    }

    if (latitude && longitude) {
      fetchRecommendations();
    }
  }, [latitude, longitude, userProfile]);

  return { recommendations, loading, error };
}

// 컴포넌트에서 사용
function RecommendationList() {
  const { recommendations, loading, error } = useRecommendations(
    37.5665,
    126.9780,
    { age: 25, concerns: ['불안'] }
  );

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <ul>
      {recommendations.map((center) => (
        <li key={center.centerId}>
          {center.name} - {center.distance.toFixed(0)}m (점수: {center.scores.normalizedScore})
        </li>
      ))}
    </ul>
  );
}
```

---

## 성능 및 제한사항

### 응답 시간

| 시나리오 | 목표 응답 시간 | 설명 |
|---------|--------------|------|
| 캐시 히트 | < 100ms | Redis에서 즉시 반환 |
| 캐시 미스 (간단) | < 1초 | userProfile 없음, 거리 기반만 |
| 캐시 미스 (복잡) | < 3초 | userProfile 포함, 11개 모듈 평가 |
| 타임아웃 | 10초 | 10초 초과 시 504 Gateway Timeout |

### Rate Limiting

현재 버전에서는 **IP당 분당 100회** 요청 제한이 적용됩니다.

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

**초과 시 응답**:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
    "retryAfter": 60
  }
}
```

### 데이터 제한사항

| 항목 | 제한 | 이유 |
|-----|------|------|
| maxDistance | 50km | 현실적인 접근 거리 고려 |
| limit | 50개 | 페이지 로딩 성능 및 UX |
| concerns | 5개 | 명확한 고민 식별 |
| preferredProgramTypes | 5개 | 프로그램 우선순위 명확화 |
| preferredTimes | 3개 | 시간대 매칭 정확도 |

### 캐싱 전략

- **캐시 키**: `recommendations:{lat}:{lng}:{profile_hash}`
- **TTL**: 5분 (300초)
- **캐시 무효화**: 센터 정보 변경, 운영시간 업데이트 시

**캐시 히트율 모니터링**:

```bash
# Prometheus 메트릭
recommendation_cache_hit_miss_total{result="hit"}
recommendation_cache_hit_miss_total{result="miss"}
```

### 모니터링

#### Prometheus 메트릭

API 성능은 다음 메트릭으로 모니터링됩니다:

```
# 요청 수
recommendation_requests_total{method="POST",status="200",has_profile="true"}

# 응답 시간 (P50, P95, P99)
recommendation_duration_seconds_bucket

# 활성 요청 수
active_recommendations

# 결과 수 분포
recommendation_result_count_bucket

# 캐시 히트율
recommendation_cache_hit_miss_total{result="hit"}
```

#### Grafana 대시보드

- URL: `http://localhost:3001`
- 대시보드: "MindConnect Recommendation API"
- 패널: 10개 (요청률, 응답시간, 에러율, 캐시, CPU, 메모리 등)

#### Sentry 에러 추적

- 모든 500 에러는 Sentry로 자동 전송
- 사용자 컨텍스트, 요청 정보, 스택 트레이스 포함
- 민감 정보(token, password) 자동 필터링

---

## 📊 공통 에러 응답 형식

모든 API 에러는 다음 형식을 따릅니다:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": {}
  }
}
```

---

## 변경 이력

### v1.0.0 (2025-01-05) - Sprint 2

**규칙 기반 추천 시스템 v2 출시**

- ✅ POST `/api/v1/recommendations` 엔드포인트 추가
- ✅ 거리 기반 필터링 (최대 50km)
- ✅ 11개 평가 모듈 구현 (거리, 운영상태, 프로그램, 평점 등)
- ✅ Redis 캐싱 (5분 TTL)
- ✅ Prometheus 메트릭 수집
- ✅ Sentry 에러 추적
- ✅ 입력 검증 (Zod 스키마)

**평가 모듈 가중치**:

| 모듈 | 가중치 |
|-----|--------|
| 거리 | 0.25 |
| 운영상태 | 0.15 |
| 프로그램매칭 | 0.15 |
| 평점 | 0.10 |
| 예산 | 0.10 |
| 접근성 | 0.08 |
| 주차 | 0.07 |
| 시간대 | 0.05 |
| 고민매칭 | 0.03 |
| 연령 | 0.01 |
| 교통 | 0.01 |

**알려진 제한사항**:

- 인증 미지원 (향후 추가 예정)
- 페이지네이션 미지원 (limit으로만 제한)
- 정렬 옵션 고정 (점수 내림차순만)

### v0.1.0 (2025-10-31) - Sprint 1

**초기 릴리스**

- ✅ Self-Assessment API (자가진단)
- ✅ Legacy Recommendations API (기본 추천)

---

## 추가 참고 자료

### 관련 문서

- **Swagger UI**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)
- **Grafana Dashboard**: [http://localhost:3001](http://localhost:3001)
- **Prometheus Metrics**: [http://localhost:8080/metrics](http://localhost:8080/metrics)
- **Health Check**: [http://localhost:8080/health](http://localhost:8080/health)

### 소스 코드

- **Controller**: `backend/src/controllers/recommendationController.ts`
- **Service**: `backend/src/services/scoring/*.ts`
- **Routes**: `backend/src/routes/recommendation.routes.js`
- **Metrics**: `backend/src/utils/metrics.ts`
- **Sentry**: `backend/src/config/sentry.ts`

### 지원

- **이슈 리포트**: GitHub Issues
- **개발 문의**: contact@mindconnect.com
- **API 상태**: [http://localhost:8080/health](http://localhost:8080/health)

---

**문서 버전**: 1.0.0
**마지막 업데이트**: 2025-01-05
**담당자**: MindConnect Backend Team

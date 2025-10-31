# MindConnect API Documentation

## 📚 Sprint 1: 규칙 기반 추천 시스템 API

**Base URL**: `http://localhost:8080/api/v1`

**API 버전**: 1.0.0

---

## 📋 목차

1. [Self-Assessment (자가진단)](#self-assessment)
   - [템플릿 조회](#get-template)
   - [자가진단 제출](#submit-assessment)
2. [Recommendations (추천)](#recommendations)
   - [센터 추천 계산](#calculate-recommendations)

---

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

## Recommendations

### POST 센터 추천 계산 {#calculate-recommendations}

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

## 📊 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

---

**Last Updated**: 2025-10-31  
**API Version**: 1.0.0

# Recommendation API Grafana Dashboard

> **Sprint 2 - Task 4.4.2**: Grafana 대시보드 및 알림 규칙

이 디렉토리는 규칙 기반 추천 시스템의 성능 모니터링을 위한 Grafana 대시보드와 알림 규칙을 포함합니다.

---

## 📁 파일 구조

```
monitoring/grafana/dashboards/
├── recommendation-dashboard.json  # Grafana 대시보드 정의
├── alert-rules.yml               # Prometheus 알림 규칙
└── README.md                      # 이 파일
```

---

## 📊 대시보드 개요

### 패널 구성 (총 10개)

#### 1. API 성능 메트릭 (4개 패널)
- **Recommendation Requests Rate** (시계열)
  - 초당 요청 수 (req/s)
  - 상태 코드별 분류 (200, 400, 500)
  - 프로필 포함 여부별 분류

- **P95 Response Time** (게이지)
  - 95 퍼센타일 응답 시간
  - 임계값: 2초 (노란색), 5초 (빨간색)

- **Response Time Percentiles** (시계열)
  - P50, P95, P99 응답 시간 추이

- **Error Rate** (게이지)
  - 에러 비율 (%)
  - 임계값: 1% (노란색), 5% (빨간색)

#### 2. 스코어링 모듈 성능 (1개 패널)
- **Scoring Module Performance** (막대 그래프)
  - 모듈별 P95 실행 시간
  - 모듈: distance, operating, specialty, program

#### 3. 시스템 상태 (2개 패널)
- **Active Recommendation Requests** (게이지)
  - 현재 처리 중인 요청 수
  - 임계값: 10개 (노란색), 50개 (빨간색)

- **Cache Hit Rate** (게이지)
  - Redis 캐시 히트율 (%)
  - 임계값: 50% (노란색), 80% (초록색)

#### 4. 결과 분석 (1개 패널)
- **Recommendation Result Count** (시계열)
  - 요청당 반환된 센터 수 (P50)

#### 5. 시스템 리소스 (2개 패널)
- **CPU Usage** (시계열)
  - CPU 사용률 (%)

- **Memory Usage** (시계열)
  - 메모리 사용량 (bytes)

---

## 🚨 알림 규칙 (총 10개)

### Critical 알림 (3개)

| 알림 이름 | 조건 | 지속 시간 | 설명 |
|---------|------|---------|------|
| **HighResponseTime** | P95 > 5초 | 2분 | API 응답 시간 급증 |
| **HighErrorRate** | 에러율 > 5% | 2분 | API 에러 발생률 증가 |
| **APIUnavailable** | 요청 수 = 0 | 2분 | API 서비스 중단 의심 |

### Warning 알림 (7개)

| 알림 이름 | 조건 | 지속 시간 | 설명 |
|---------|------|---------|------|
| **LowCacheHitRate** | 캐시 히트율 < 50% | 5분 | 캐시 성능 저하 |
| **HighActiveRequests** | 동시 요청 > 50 | 1분 | 높은 부하 또는 느린 쿼리 |
| **SlowScoringModule** | 모듈 실행 > 1초 | 3분 | 특정 스코어링 모듈 느림 |
| **HighCPUUsage** | CPU > 80% | 5분 | CPU 사용률 높음 |
| **HighMemoryUsage** | 메모리 > 1GB | 5분 | 메모리 사용량 높음 |
| **HighZeroResultsRate** | 결과 없음 > 20% | 5분 | 추천 결과 부족 |
| **P99ResponseTimeSpike** | P99 > 10초 | 1분 | 일부 요청 지연 심각 |

---

## 🛠️ 설치 및 설정

### 1. Grafana 대시보드 가져오기

#### 방법 A: JSON 파일 직접 업로드
```bash
# Grafana UI에서
1. Dashboards → Import
2. "Upload JSON file" 클릭
3. recommendation-dashboard.json 선택
4. 데이터소스 선택 (Prometheus)
5. Import 클릭
```

#### 방법 B: Grafana API 사용
```bash
# Grafana API로 자동 등록
curl -X POST http://admin:admin@localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @recommendation-dashboard.json
```

#### 방법 C: Docker Compose Provisioning
```yaml
# docker-compose.yml에 추가
services:
  grafana:
    image: grafana/grafana:latest
    volumes:
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    ports:
      - "3000:3000"
```

---

### 2. Prometheus 알림 규칙 설정

#### Step 1: 알림 규칙 파일 복사
```bash
# Prometheus 설정 디렉토리로 복사
cp alert-rules.yml /etc/prometheus/rules/
```

#### Step 2: prometheus.yml 업데이트
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

# 알림 규칙 파일 로드
rule_files:
  - "rules/alert-rules.yml"

# Alertmanager 설정 (옵션)
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

# 스크래핑 타겟
scrape_configs:
  - job_name: 'mindconnect-api'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['localhost:5000']
```

#### Step 3: Prometheus 재시작 또는 리로드
```bash
# 방법 A: 재시작
docker-compose restart prometheus

# 방법 B: 핫 리로드 (권장)
curl -X POST http://localhost:9090/-/reload
```

#### Step 4: 알림 규칙 확인
```bash
# Prometheus UI에서 확인
http://localhost:9090/alerts
```

---

### 3. Alertmanager 설정 (옵션)

알림을 Slack, Email, PagerDuty 등으로 전송하려면 Alertmanager 설정이 필요합니다.

#### alertmanager.yml 예시
```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack-notifications'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname']
```

---

## 📈 사용 가이드

### 일일 모니터링 체크리스트

#### 🌅 매일 아침 확인 (9:00 AM)
- [ ] P95 응답 시간 < 3초 확인
- [ ] 에러율 < 1% 확인
- [ ] 캐시 히트율 > 80% 확인
- [ ] 활성 알림 없음 확인

#### 🕐 점심 시간 확인 (12:00 PM)
- [ ] 피크 타임 성능 확인 (요청 수 증가)
- [ ] 스코어링 모듈 지연 없음 확인

#### 🌙 저녁 확인 (18:00 PM)
- [ ] 일일 최대 트래픽 시 성능 확인
- [ ] CPU/메모리 사용률 정상 범위 확인

---

### 성능 기준 (Performance Baseline)

| 메트릭 | 목표 | 경고 | 위험 |
|-------|-----|-----|-----|
| P95 응답 시간 | < 2초 | 2-5초 | > 5초 |
| 에러율 | < 1% | 1-5% | > 5% |
| 캐시 히트율 | > 80% | 50-80% | < 50% |
| 동시 요청 수 | < 10 | 10-50 | > 50 |
| 모듈 실행 시간 | < 0.5초 | 0.5-1초 | > 1초 |
| CPU 사용률 | < 50% | 50-80% | > 80% |
| 메모리 사용량 | < 512MB | 512MB-1GB | > 1GB |

---

### 문제 해결 가이드

#### 응답 시간 증가 시
1. **스코어링 모듈 성능 확인**
   - 어느 모듈이 느린지 확인
   - 해당 모듈의 데이터베이스 쿼리 최적화

2. **캐시 히트율 확인**
   - 캐시 히트율이 낮으면 Redis 연결 상태 확인
   - TTL 설정 재검토 (현재: 5분)

3. **데이터베이스 인덱스 확인**
   - EXPLAIN 쿼리로 인덱스 사용 확인
   - 필요 시 추가 인덱스 생성

#### 에러율 증가 시
1. **에러 로그 확인**
   ```bash
   docker-compose logs backend | grep ERROR
   ```

2. **Sentry 확인** (Task 4.4.3 구현 후)
   - 에러 스택 트레이스 분석
   - 영향받은 사용자 수 확인

3. **입력 검증 오류 (400)**
   - 프론트엔드 요청 형식 확인
   - Zod 스키마 검증 로직 재확인

4. **서버 오류 (500)**
   - 데이터베이스 연결 상태 확인
   - Redis 연결 상태 확인
   - 메모리/CPU 리소스 확인

#### 캐시 히트율 저하 시
1. **Redis 연결 확인**
   ```bash
   docker-compose logs redis
   redis-cli PING
   ```

2. **캐시 키 분포 확인**
   ```bash
   redis-cli KEYS "recommendation:*" | wc -l
   ```

3. **TTL 설정 재검토**
   - 현재: 5분
   - 고려 사항: 센터 데이터 업데이트 빈도

---

## 🔗 관련 링크

- **Grafana 대시보드**: http://localhost:3000/d/recommendation-api-dashboard
- **Prometheus 메트릭**: http://localhost:9090/graph
- **Prometheus 알림**: http://localhost:9090/alerts
- **Alertmanager**: http://localhost:9093

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 |
|-----|------|---------|
| 2025-01-28 | 1.0 | 초기 대시보드 생성 (10개 패널, 10개 알림 규칙) |

---

## 📞 문의

**담당**: DevOps Team
**문서 작성**: Sprint 2 - Task 4.4.2
**최종 업데이트**: 2025-01-28

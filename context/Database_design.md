# 마음이음(MindConnect) 데이터베이스 설계 문서

## 1. 개요

### 1.1 설계 원칙
- **정규화**: 3차 정규형(3NF)을 기본으로 하되, 성능을 위해 필요시 역정규화 적용
- **확장성**: 향후 기능 추가를 고려한 유연한 구조
- **성능 최적화**: 적절한 인덱스 설계 및 파티셔닝 전략
- **데이터 무결성**: 외래키, 제약조건, 트리거를 통한 데이터 일관성 보장
- **보안**: 민감정보 암호화 및 접근 권한 관리

### 1.2 데이터베이스 사양
- **DBMS**: MySQL 8.0+
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Storage Engine**: InnoDB

## 2. 테이블 설계

### 2.1 사용자 관련 테이블

#### users (사용자 기본 정보)
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    birth_year YEAR,
    gender ENUM('M', 'F', 'O', 'N') DEFAULT 'N' COMMENT 'M:남성, F:여성, O:기타, N:미공개',
    user_type ENUM('GENERAL', 'PROFESSIONAL', 'ADMIN') DEFAULT 'GENERAL',
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED') DEFAULT 'ACTIVE',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### user_profiles (사용자 상세 프로필)
```sql
CREATE TABLE user_profiles (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    age_group ENUM('10s', '20s', '30s', '40s', '50s', '60s', '70s+') NULL,
    occupation VARCHAR(100),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    address_sido VARCHAR(50),
    address_sigungu VARCHAR(50),
    prefer_online BOOLEAN DEFAULT FALSE,
    prefer_after_6pm BOOLEAN DEFAULT FALSE,
    prefer_weekend BOOLEAN DEFAULT FALSE,
    main_concern JSON COMMENT '주요 관심사/고민 영역 (JSON 배열)',
    severity_code ENUM('LOW','MID','HIGH') NULL COMMENT '자가진단 등급',
    severity_score DECIMAL(5, 2) NULL COMMENT '원점수(정규화 전)',
    notification_enabled BOOLEAN DEFAULT TRUE,
    privacy_agreed BOOLEAN DEFAULT FALSE,
    marketing_agreed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_location (location_lat, location_lng),
    INDEX idx_address (address_sido, address_sigungu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### user_sessions (세션 관리)
```sql
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    session_token_hash VARBINARY(64) NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_session_token_hash (session_token_hash),
    INDEX idx_user_expires (user_id, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.2 센터 관련 테이블

#### centers (센터 기본 정보)
```sql
CREATE TABLE centers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    center_name VARCHAR(200) NOT NULL,
    center_type VARCHAR(100) NOT NULL COMMENT '센터구분',
    center_type_original VARCHAR(100) COMMENT '센터구분(원본)',
    road_address VARCHAR(500) NOT NULL,
    jibun_address VARCHAR(500),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    business_content TEXT COMMENT '건강증진업무내용',
    building_area DECIMAL(10, 2) COMMENT '건물면적(㎡)',
    phone_number VARCHAR(50),
    operating_org_name VARCHAR(200) COMMENT '운영기관명',
    managing_org_name VARCHAR(200) COMMENT '관리기관명',
    managing_org_phone VARCHAR(50) COMMENT '관리기관전화번호',
    provider_code VARCHAR(50) COMMENT '제공기관코드',
    provider_name VARCHAR(200) COMMENT '제공기관명',
    other_info TEXT COMMENT '기타이용안내',
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT UNSIGNED DEFAULT 0,
    favorite_count INT UNSIGNED DEFAULT 0,
    review_count INT UNSIGNED DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    data_reference_date DATE COMMENT '데이터기준일자',
    source VARCHAR(50) NULL COMMENT '원천 데이터 출처 식별자(예: MOHW)',
    external_id VARCHAR(100) NULL COMMENT '원천 데이터의 고유 ID',
    raw_hours_text VARCHAR(500) NULL COMMENT '운영시간 원문 보존',
    location POINT SRID 4326 NULL COMMENT 'WGS84 좌표(경도,위도)'

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_center_type (center_type),
    INDEX idx_location (latitude, longitude),
    INDEX idx_name (center_name),
    INDEX idx_active_rating (is_active, avg_rating DESC),
    FULLTEXT idx_fulltext_search (center_name, business_content, road_address),
    UNIQUE KEY uk_source_external (source, external_id),
    SPATIAL INDEX spx_centers_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### center_operating_hours (센터 운영시간)
```sql
CREATE TABLE center_operating_hours (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    center_id BIGINT UNSIGNED NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '0:일요일, 1:월요일, ..., 6:토요일',
    open_time TIME NULL,
    close_time TIME NULL,
    is_holiday BOOLEAN DEFAULT FALSE,
    is_open BOOLEAN NOT NULL DEFAULT TRUE COMMENT '영업(운영) 여부(정기휴무 요일은 false)',

    
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_center_day (center_id, day_of_week),
    INDEX idx_day_time (day_of_week, open_time, close_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### center_holidays (센터 휴무일)
> **비고**: 정기휴무(예: 주말)는 `center_operating_hours.is_open=false`로 관리하며, 본 테이블에는 공휴일/임시휴무 등 **특정일**만 저장합니다.
```sql
CREATE TABLE center_holidays (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    center_id BIGINT UNSIGNED NOT NULL,
    holiday_date DATE,
    holiday_name VARCHAR(100),
    is_regular BOOLEAN DEFAULT FALSE COMMENT '정기휴무 여부',
    
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    INDEX idx_center_date (center_id, holiday_date),
    INDEX idx_holiday_date (holiday_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


#### center_types (센터 유형 마스터)
```sql
CREATE TABLE center_types (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### staff_types (직원 유형 마스터)
```sql
CREATE TABLE staff_types (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
#### center_staff (센터 직원 현황)
```sql
CREATE TABLE center_staff (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    center_id BIGINT UNSIGNED NOT NULL,
    staff_type VARCHAR(50) NOT NULL COMMENT '의사, 간호사, 사회복지사, 영양사, 기타',
    staff_count INT UNSIGNED DEFAULT 0,
    description TEXT,
    
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_center_staff (center_id, staff_type),
    INDEX idx_staff_type (staff_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### center_programs (센터 프로그램)
```sql
CREATE TABLE center_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    center_id BIGINT UNSIGNED NOT NULL,
    program_name VARCHAR(200) NOT NULL,
    program_type VARCHAR(100),
    target_group VARCHAR(200) COMMENT '대상 그룹',
    description TEXT,
    is_online_available BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT TRUE,
    fee_amount DECIMAL(10, 0),
    capacity INT UNSIGNED,
    duration_minutes INT UNSIGNED,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    INDEX idx_center_active (center_id, is_active),
    INDEX idx_program_type (program_type),
    FULLTEXT idx_program_search (program_name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.3 태그 시스템

#### tags (태그 마스터)
```sql
CREATE TABLE tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL UNIQUE,
    tag_category VARCHAR(50) COMMENT '태그 카테고리',
    usage_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_category (tag_category),
    INDEX idx_usage (usage_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### center_tags (센터-태그 매핑)
```sql
CREATE TABLE center_tags (
    center_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (center_id, tag_id),
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_tag_center (tag_id, center_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.4 리뷰 및 평점

#### reviews (리뷰)
```sql
CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    center_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    content TEXT NOT NULL,
    visit_date DATE,
    is_verified BOOLEAN DEFAULT FALSE COMMENT '실제 방문 인증 여부',
    helpful_count INT UNSIGNED DEFAULT 0,
    report_count INT UNSIGNED DEFAULT 0,
    status ENUM('ACTIVE', 'HIDDEN', 'DELETED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_center_rating (center_id, rating, created_at DESC),
    INDEX idx_user_reviews (user_id, created_at DESC),
    INDEX idx_status_created (status, created_at DESC),
    FULLTEXT idx_review_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### review_images (리뷰 이미지)
```sql
CREATE TABLE review_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    display_order TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    INDEX idx_review_order (review_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### review_reactions (리뷰 반응)
```sql
CREATE TABLE review_reactions (
    review_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    reaction_type ENUM('HELPFUL', 'UNHELPFUL', 'REPORT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (review_id, user_id, reaction_type),
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_reactions (user_id, reaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.5 즐겨찾기 및 추천

#### user_favorites (즐겨찾기)
```sql
CREATE TABLE user_favorites (
    user_id BIGINT UNSIGNED NOT NULL,
    center_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, center_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    INDEX idx_center_favorites (center_id),
    INDEX idx_user_created (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### recommendations (추천 로그)
```sql
CREATE TABLE recommendations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    session_id VARCHAR(100),
    center_id BIGINT UNSIGNED NOT NULL,
    recommendation_type ENUM('RULE_BASED', 'AI_BASED', 'HYBRID') NOT NULL,
    total_score DECIMAL(5, 2) NOT NULL,
    distance_score DECIMAL(5, 2),
    operating_score DECIMAL(5, 2),
    specialty_score DECIMAL(5, 2),
    program_match_score DECIMAL(5, 2),
    similarity_score DECIMAL(5, 2),
    recommendation_rank INT UNSIGNED,
    reason_json JSON COMMENT '추천 이유 상세',
    is_clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_session_created (session_id, created_at DESC),
    INDEX idx_center_recommendations (center_id, created_at DESC),
    INDEX idx_type_score (recommendation_type, total_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.6 자가진단 관련

#### self_assessment_templates (자가진단 템플릿)
```sql
CREATE TABLE self_assessment_templates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(200) NOT NULL,
    template_type VARCHAR(50) NOT NULL COMMENT '우울증, 불안장애, 스트레스 등',
    description TEXT,
    questions_json JSON NOT NULL COMMENT '질문 목록',
    scoring_rules_json JSON COMMENT '점수 계산 규칙',
    interpretation_json JSON COMMENT '결과 해석 가이드',
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type_active (template_type, is_active),
    INDEX idx_name (template_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### user_assessments (사용자 자가진단 결과)
```sql
CREATE TABLE user_assessments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    session_id VARCHAR(100),
    template_id BIGINT UNSIGNED NOT NULL,
    answers_json JSON NOT NULL COMMENT '응답 내역',
    total_score DECIMAL(5, 2),
    severity_code ENUM('LOW','MID','HIGH') COMMENT '표준 등급 코드',
    result_summary TEXT,
    recommended_action TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES self_assessment_templates(id),
    INDEX idx_user_completed (user_id, completed_at DESC),
    INDEX idx_template_completed (template_id, completed_at DESC),
    INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.7 정신건강 콘텐츠

#### content_categories (콘텐츠 카테고리)
```sql
CREATE TABLE content_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    display_order INT UNSIGNED DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES content_categories(id) ON DELETE SET NULL,
    INDEX idx_parent_order (parent_id, display_order),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### contents (콘텐츠)
```sql
CREATE TABLE contents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    content_type ENUM('ARTICLE', 'GUIDE', 'FAQ', 'EMERGENCY') NOT NULL,
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content_body MEDIUMTEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    author VARCHAR(100),
    source VARCHAR(200),
    view_count INT UNSIGNED DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES content_categories(id),
    INDEX idx_category_type (category_id, content_type, is_active),
    INDEX idx_featured (is_featured, published_at DESC),
    INDEX idx_published (published_at DESC),
    FULLTEXT idx_content_search (title, summary, content_body)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.8 검색 및 활동 로그

#### search_logs (검색 로그)
```sql
CREATE TABLE search_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    session_id VARCHAR(100),
    search_type ENUM('MAP', 'TEXT', 'FILTER', 'RECOMMENDATION') NOT NULL,
    search_query VARCHAR(500),
    filters_json JSON COMMENT '적용된 필터 조건',
    result_count INT UNSIGNED,
    clicked_result_id BIGINT UNSIGNED,
    search_duration_ms INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_session_created (session_id, created_at DESC),
    INDEX idx_type_created (search_type, created_at DESC),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

#### page_views (페이지 조회 로그)
```sql
CREATE TABLE page_views (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    session_id VARCHAR(100),
    page_type VARCHAR(50) NOT NULL,
    page_id VARCHAR(100),
    referrer VARCHAR(500),
    duration_seconds INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_page_type (page_type, created_at DESC),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
```

### 2.9 관리자 기능

### 2.10 원천데이터 Staging(임시 적재)
> 공공데이터의 포맷/결측/시간표현이 불규칙하므로, 원문을 먼저 저장한 뒤 정규화 단계로 변환합니다.

```sql
CREATE TABLE staging_centers_raw (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    external_id VARCHAR(100) NOT NULL,
    payload_json JSON NOT NULL,
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_source_external (source, external_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


#### admin_users (관리자)
```sql
CREATE TABLE admin_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('SUPER_ADMIN', 'ADMIN', 'MODERATOR') NOT NULL,
    permissions_json JSON COMMENT '세부 권한 설정',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### audit_logs (감사 로그)
```sql
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_user_id BIGINT UNSIGNED,
    action_type VARCHAR(100) NOT NULL,
    target_table VARCHAR(100),
    target_id BIGINT UNSIGNED,
    before_data JSON,
    after_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_admin_created (admin_user_id, created_at DESC),
    INDEX idx_action_created (action_type, created_at DESC),
    INDEX idx_target (target_table, target_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 3. 뷰(View) 설계

### 3.1 실시간 운영 상태 뷰
```sql
CREATE VIEW v_center_operating_status AS
SELECT 
    c.id,
    c.center_name,
    c.latitude,
    c.longitude,
    CASE 
        WHEN ch.holiday_date IS NOT NULL THEN 'HOLIDAY'
        WHEN coh.is_open = TRUE 
             AND TIME(CONVERT_TZ(NOW(),'UTC','Asia/Seoul')) BETWEEN coh.open_time AND coh.close_time 
             AND coh.day_of_week = DAYOFWEEK(CONVERT_TZ(NOW(),'UTC','Asia/Seoul')) - 1 THEN 'OPEN'
        ELSE 'CLOSED'
    END AS operating_status,
    coh.open_time,
    coh.close_time,
    ch.holiday_name
FROM centers c
LEFT JOIN center_operating_hours coh ON c.id = coh.center_id 
    AND coh.day_of_week = DAYOFWEEK(CURDATE()) - 1
LEFT JOIN center_holidays ch ON c.id = ch.center_id 
    AND ch.holiday_date = CURDATE()
WHERE c.is_active = TRUE;
```

### 3.2 센터 통계 뷰
```sql
CREATE VIEW v_center_statistics AS
SELECT 
    c.id,
    c.center_name,
    c.center_type,
    c.avg_rating,
    c.review_count,
    c.favorite_count,
    c.view_count,
    COUNT(DISTINCT cp.id) as program_count,
    COUNT(DISTINCT cs.staff_type) as staff_type_count,
    SUM(cs.staff_count) as total_staff_count
FROM centers c
LEFT JOIN center_programs cp ON c.id = cp.center_id AND cp.is_active = TRUE
LEFT JOIN center_staff cs ON c.id = cs.center_id
WHERE c.is_active = TRUE
GROUP BY c.id;
```

## 4. 인덱스 전략

### 4.1 복합 인덱스
> 지도 반경 검색을 위해 `centers.location(POINT, SRID 4326)`에 **SPATIAL INDEX**를 사용합니다. 기존 `(latitude, longitude)` 인덱스는 하위 호환용으로 유지합니다.
```sql
-- 지역 기반 검색 최적화
CREATE INDEX idx_centers_location_type ON centers(latitude, longitude, center_type, is_active);

-- 추천 시스템 최적화
CREATE INDEX idx_recommendations_user_type_score ON recommendations(user_id, recommendation_type, total_score DESC);

-- 리뷰 검색 최적화
CREATE INDEX idx_reviews_center_status_rating ON reviews(center_id, status, rating DESC, created_at DESC);
```

### 4.2 커버링 인덱스
```sql
-- 센터 목록 조회 최적화
CREATE INDEX idx_centers_list_covering ON centers(
    is_active, center_type, avg_rating DESC, 
    center_name, latitude, longitude, road_address
);

-- 사용자 활동 조회 최적화
CREATE INDEX idx_user_activity_covering ON search_logs(
    user_id, created_at DESC, search_type, search_query
);
```

## 5. 트리거

### 5.1 센터 통계 업데이트 트리거
```sql
DELIMITER $$

-- 리뷰 추가 시 센터 통계 업데이트
CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE centers 
    SET 
        review_count = review_count + 1,
        avg_rating = (
            SELECT AVG(rating) 
            FROM reviews 
            WHERE center_id = NEW.center_id 
            AND status = 'ACTIVE'
        )
    WHERE id = NEW.center_id;
END$$

-- 즐겨찾기 추가 시 카운트 업데이트
CREATE TRIGGER after_favorite_insert
AFTER INSERT ON user_favorites
FOR EACH ROW
BEGIN
    UPDATE centers 
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.center_id;
END$$



-- 리뷰 수정/상태변경 시 재집계
CREATE TRIGGER after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE centers c
    JOIN (
        SELECT center_id, 
               COUNT(*) AS rc, 
               IFNULL(AVG(CASE WHEN status <> 'DELETED' THEN rating END), 0) AS ar
        FROM reviews
        WHERE center_id = NEW.center_id AND status <> 'DELETED'
    ) r ON r.center_id = c.id
    SET c.review_count = r.rc,
        c.avg_rating = r.ar
    WHERE c.id = NEW.center_id;
END$$

-- 리뷰 삭제 시 재집계
CREATE TRIGGER after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE centers c
    JOIN (
        SELECT center_id, 
               COUNT(*) AS rc, 
               IFNULL(AVG(CASE WHEN status <> 'DELETED' THEN rating END), 0) AS ar
        FROM reviews
        WHERE center_id = OLD.center_id AND status <> 'DELETED'
    ) r ON r.center_id = c.id
    SET c.review_count = r.rc,
        c.avg_rating = r.ar
    WHERE c.id = OLD.center_id;
END$$

DELIMITER ;
```

## 6. 저장 프로시저

### 6.1 센터 추천 프로시저
```sql
DELIMITER $$

CREATE PROCEDURE sp_get_recommended_centers(
    IN p_user_id BIGINT,
    IN p_latitude DECIMAL(10, 8),
    IN p_longitude DECIMAL(11, 8),
    IN p_limit INT
)
BEGIN
    SELECT 
        c.id,
        c.center_name,
        c.center_type,
        c.road_address,
        c.latitude,
        c.longitude,
        c.avg_rating,
        c.review_count,
        ST_Distance_Sphere(POINT(c.longitude, c.latitude), POINT(p_longitude, p_latitude)) AS distance_meters
FROM centers c
LEFT JOIN v_center_operating_status v ON v.id = c.id
    LEFT JOIN center_operating_hours coh ON c.id = coh.center_id 
        AND coh.day_of_week = DAYOFWEEK(CURDATE()) - 1
    WHERE c.is_active = TRUE
    ORDER BY 
        (v.operating_status = 'OPEN') DESC,
        distance_meters ASC,
        c.avg_rating DESC
    LIMIT p_limit;
END$$

DELIMITER ;
```

## 7. 성능 최적화 전략

### 7.1 파티셔닝
- **MVP에서는 파티셔닝을 적용하지 않습니다.**
- 운영 데이터 증가 시 `search_logs`, `page_views`는 연도별 RANGE 파티셔닝, `reviews`는 월별 파티셔닝을 **향후** 검토

### 7.2 캐싱 전략
- Redis를 활용한 캐싱 레이어
  - 센터 기본 정보 (TTL: 1시간)
  - 운영시간 정보 (TTL: 1일)
  - 인기 검색어 (TTL: 10분)
  - 추천 결과 (TTL: 30분)

### 7.3 읽기 부하 분산
- 읽기 전용 복제본 구성
- 마스터: 쓰기 작업
- 슬레이브: 읽기 작업 (검색, 조회)

## 8. 백업 및 복구 전략

### 8.1 백업 정책
```bash
# 일일 전체 백업 (새벽 2시)
mysqldump -u root -p mindconnect > backup_$(date +%Y%m%d).sql

# 시간별 증분 백업
mysqlbinlog --start-datetime="2024-01-01 00:00:00" \
           --stop-datetime="2024-01-01 01:00:00" \
           mysql-bin.000001 > incremental_backup.sql
```

### 8.2 복구 절차
1. 최신 전체 백업 복원
2. 증분 백업 순차 적용
3. 데이터 무결성 검증

## 9. 보안 고려사항

### 9.1 암호화
- 비밀번호: bcrypt 해싱
- 민감정보: AES-256 암호화
- 전송구간: SSL/TLS 적용

### 9.2 접근 권한
```sql
-- 애플리케이션 사용자
CREATE USER 'app_user'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON mindconnect.* TO 'app_user'@'%';

-- 읽기 전용 사용자
CREATE USER 'readonly_user'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT ON mindconnect.* TO 'readonly_user'@'%';

-- 백업 사용자
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, LOCK TABLES, SHOW VIEW ON mindconnect.* TO 'backup_user'@'localhost';
```

## 10. 모니터링 지표

### 10.1 성능 모니터링
- 쿼리 응답 시간
- 슬로우 쿼리 로그
- 인덱스 사용률
- 테이블 락 대기 시간

### 10.2 용량 모니터링
- 테이블별 레코드 수
- 디스크 사용량
- 파티션별 데이터 분포

### 10.3 비즈니스 지표 쿼리
```sql
-- 일일 활성 사용자 (DAU)
SELECT COUNT(DISTINCT user_id) as dau
FROM search_logs
WHERE DATE(created_at) = CURDATE();

-- 센터별 인기도
SELECT 
    c.center_name,
    COUNT(sl.id) as search_count,
    COUNT(DISTINCT sl.user_id) as unique_users
FROM centers c
JOIN search_logs sl ON sl.clicked_result_id = c.id
WHERE sl.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY c.id
ORDER BY search_count DESC
LIMIT 10;
```

## 11. 확장성 고려사항

### 11.1 향후 기능 확장 대비
- 예약 시스템 테이블 구조 준비
- 원격 상담 기능 테이블 구조
- 알림 시스템 테이블 구조
- 다국어 지원을 위한 i18n 테이블

### 11.2 데이터 증가 대응
- 샤딩 전략 수립 (user_id 기반)
- 아카이빙 정책 (2년 이상 데이터)
- NoSQL 도입 검토 (로그 데이터)

## 12. 마이그레이션 스크립트

### 12.1 초기 데이터 로드
```sql
-- CSV 데이터 임포트
LOAD DATA INFILE '/data/centers.csv'
INTO TABLE centers
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(center_name, center_type, center_type_original, road_address, jibun_address, 
 @latitude, @longitude, business_content, @building_area, phone_number, ...)
SET 
    latitude = NULLIF(@latitude, ''),
    longitude = NULLIF(@longitude, ''),
    building_area = NULLIF(@building_area, ''),
    created_at = NOW(),
    updated_at = NOW();
```

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
*최종 수정일: 2024-10-08*
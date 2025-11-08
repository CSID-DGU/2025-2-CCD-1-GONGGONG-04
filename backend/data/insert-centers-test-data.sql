-- Centers Test Data Import
-- Generated from centers_test.csv
-- Encoding: UTF-8

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 라인 2: 서울시 정신건강복지센터
INSERT INTO centers (
  center_name, center_type, road_address, jibun_address,
  latitude, longitude, phone_number, business_content,
  building_area, operating_org_name, managing_org_name,
  managing_org_phone, provider_code, provider_name,
  other_info, data_reference_date, source, external_id,
  raw_hours_text, is_active, created_at, updated_at
) VALUES (
  '서울시 정신건강복지센터',
  '정신건강복지센터',
  '서울특별시 중구 세종대로 110',
  '서울특별시 중구 태평로1가 31',
  37.5665,
  126.978,
  '02-3444-9934',
  '정신건강 상담 및 치료',
  1500.5,
  '서울시',
  '서울시',
  '02-120',
  'SEOUL001',
  '서울시',
  '24시간 상담 가능',
  '2024-01-15',
  '공공데이터포털',
  'CENTER_001',
  '평일 09:00-18:00',
  1,
  NOW(),
  NOW()
);

-- 라인 3: 강남구 정신건강복지센터
INSERT INTO centers (
  center_name, center_type, road_address, jibun_address,
  latitude, longitude, phone_number, business_content,
  building_area, operating_org_name, managing_org_name,
  managing_org_phone, provider_code, provider_name,
  other_info, data_reference_date, source, external_id,
  raw_hours_text, is_active, created_at, updated_at
) VALUES (
  '강남구 정신건강복지센터',
  '정신건강복지센터',
  '서울특별시 강남구 선릉로 668',
  '서울특별시 강남구 삼성동 35-3',
  37.5133,
  127.0592,
  '02-3444-9988',
  '정신건강 상담',
  800,
  '강남구청',
  '강남구청',
  '02-3423-5000',
  'GANGNAM001',
  '강남구',
  '주차 가능',
  '2024-01-15',
  '공공데이터포털',
  'CENTER_002',
  '평일 09:00-18:00',
  1,
  NOW(),
  NOW()
);

-- 라인 4: 마포구 정신건강복지센터
INSERT INTO centers (
  center_name, center_type, road_address, jibun_address,
  latitude, longitude, phone_number, business_content,
  building_area, operating_org_name, managing_org_name,
  managing_org_phone, provider_code, provider_name,
  other_info, data_reference_date, source, external_id,
  raw_hours_text, is_active, created_at, updated_at
) VALUES (
  '마포구 정신건강복지센터',
  '정신건강복지센터',
  '서울특별시 마포구 월드컵로 212',
  '서울특별시 마포구 성산동 284',
  37.5663,
  126.8996,
  '02-3153-9002',
  '정신건강 지원',
  NULL,
  '마포구청',
  '마포구청',
  '02-3153-9002',
  'MAPO001',
  '마포구',
  NULL,
  '2024-01-15',
  '공공데이터포털',
  'CENTER_003',
  '평일 09:00-17:00',
  1,
  NOW(),
  NOW()
);

-- 라인 5: 용산구 정신건강복지센터
INSERT INTO centers (
  center_name, center_type, road_address, jibun_address,
  latitude, longitude, phone_number, business_content,
  building_area, operating_org_name, managing_org_name,
  managing_org_phone, provider_code, provider_name,
  other_info, data_reference_date, source, external_id,
  raw_hours_text, is_active, created_at, updated_at
) VALUES (
  '용산구 정신건강복지센터',
  '정신건강복지센터',
  '서울특별시 용산구 한강대로 95',
  '서울특별시 용산구 한강대로 95',
  37.5326,
  126.9652,
  '02-749-9742',
  '심리 상담',
  650,
  '용산구청',
  '용산구청',
  '02-2199-7114',
  'YONGSAN001',
  '용산구',
  NULL,
  '2024-01-15',
  '공공데이터포털',
  'CENTER_004',
  '평일 09:00-18:00',
  1,
  NOW(),
  NOW()
);

-- 라인 6: 성북구 정신건강복지센터
INSERT INTO centers (
  center_name, center_type, road_address, jibun_address,
  latitude, longitude, phone_number, business_content,
  building_area, operating_org_name, managing_org_name,
  managing_org_phone, provider_code, provider_name,
  other_info, data_reference_date, source, external_id,
  raw_hours_text, is_active, created_at, updated_at
) VALUES (
  '성북구 정신건강복지센터',
  '정신건강복지센터',
  '서울특별시 성북구 화랑로 172',
  '서울특별시 성북구 하월곡동 74',
  37.6063,
  127.0453,
  '02-2241-6315',
  '우울증 치료',
  920,
  '성북구청',
  '성북구청',
  '02-2241-5704',
  'SEONGBUK001',
  '성북구',
  NULL,
  '2024-01-15',
  '공공데이터포털',
  'CENTER_005',
  '평일 09:00-18:00',
  1,
  NOW(),
  NOW()
);

-- 라인 7: 광진구 정신건강복지센터
INSERT INTO centers (
  center_name, center_type, road_address, jibun_address,
  latitude, longitude, phone_number, business_content,
  building_area, operating_org_name, managing_org_name,
  managing_org_phone, provider_code, provider_name,
  other_info, data_reference_date, source, external_id,
  raw_hours_text, is_active, created_at, updated_at
) VALUES (
  '광진구 정신건강복지센터',
  '정신건강복지센터',
  '서울특별시 광진구 자양로 117',
  '서울특별시 광진구 자양동 227-5',
  37.5347,
  127.0822,
  '02-450-1395',
  '정신건강 상담',
  550,
  '광진구청',
  '광진구청',
  '02-450-7114',
  'GWANGJIN001',
  '광진구',
  NULL,
  '2024-01-15',
  '공공데이터포털',
  'CENTER_006',
  NULL,
  1,
  NOW(),
  NOW()
);

-- 라인 8: 중랑구 정신건강복지센터
INSERT INTO centers (
  center_name, center_type, road_address, jibun_address,
  latitude, longitude, phone_number, business_content,
  building_area, operating_org_name, managing_org_name,
  managing_org_phone, provider_code, provider_name,
  other_info, data_reference_date, source, external_id,
  raw_hours_text, is_active, created_at, updated_at
) VALUES (
  '중랑구 정신건강복지센터',
  '정신건강복지센터',
  '서울특별시 중랑구 봉화산로 179',
  '서울특별시 중랑구 신내동 664',
  37.6067,
  127.1003,
  NULL,
  '정신건강 지원',
  480,
  '중랑구청',
  '중랑구청',
  '02-2094-0708',
  'JUNGNANG001',
  '중랑구',
  '야간 상담 가능',
  '2024-01-15',
  '공공데이터포털',
  'CENTER_007',
  '평일 09:00-21:00',
  1,
  NOW(),
  NOW()
);

-- 라인 10: 은평구 정신건강복지센터
INSERT INTO centers (
  center_name, center_type, road_address, jibun_address,
  latitude, longitude, phone_number, business_content,
  building_area, operating_org_name, managing_org_name,
  managing_org_phone, provider_code, provider_name,
  other_info, data_reference_date, source, external_id,
  raw_hours_text, is_active, created_at, updated_at
) VALUES (
  '은평구 정신건강복지센터',
  '정신건강복지센터',
  '서울특별시 은평구 통일로 684',
  '서울특별시 은평구 녹번동 5',
  37.6176,
  126.9227,
  '02-351-7781',
  '정신건강 상담',
  600,
  '은평구청',
  '은평구청',
  '02-351-8181',
  'EUNPYEONG001',
  '은평구',
  '주말 상담',
  '2024-01-15',
  '공공데이터포털',
  'CENTER_009',
  '평일 09:00-18:00 토 09:00-13:00',
  1,
  NOW(),
  NOW()
);


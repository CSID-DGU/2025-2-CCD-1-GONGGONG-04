-- Test data for QA (UTF-8 encoding)

-- Insert test center
INSERT INTO centers (id, center_name, center_type, road_address, latitude, longitude, phone_number, is_active)
VALUES (1238, '서울시 정신건강복지센터', '정신건강복지센터', '서울특별시 중구 삼일대로 343', 37.5665, 126.9780, '02-1234-5678', 1);

-- Insert center operating hours (day_of_week: 1=Monday, 7=Sunday)
INSERT INTO center_operating_hours (center_id, day_of_week, open_time, close_time, is_open)
VALUES
(1238, 1, '09:00', '18:00', 1),
(1238, 2, '09:00', '18:00', 1),
(1238, 3, '09:00', '18:00', 1),
(1238, 4, '09:00', '18:00', 1),
(1238, 5, '09:00', '18:00', 1),
(1238, 6, NULL, NULL, 0),
(1238, 7, NULL, NULL, 0);

-- Insert test users
INSERT INTO users (id, email, password_hash, nickname)
VALUES
(190, 'user1@test.com', '$2b$10$YourHashedPassword1', '테스트유저1'),
(191, 'user2@test.com', '$2b$10$YourHashedPassword2', '테스트유저2'),
(192, 'user3@test.com', '$2b$10$YourHashedPassword3', '테스트유저3');

-- Insert test reviews
INSERT INTO reviews (center_id, user_id, rating, content, visit_date, helpful_count)
VALUES
(1238, 190, 5, '상담 선생님이 너무 친절하시고 많은 도움이 되었습니다. 다시 방문하고 싶어요!', '2025-10-15', 5),
(1238, 191, 4, '시설이 깨끗하고 프로그램이 다양해서 좋았습니다. 다만 대기시간이 조금 길었어요.', '2025-10-10', 3),
(1238, 192, 5, '처음 방문했는데 분위기가 편안하고 전문적인 상담을 받을 수 있었습니다.', '2025-10-05', 8),
(1238, 190, 3, '상담은 괜찮았는데 주차가 불편했습니다.', '2025-09-28', 2),
(1238, 191, 4, '프로그램 참여 후 많은 변화가 있었습니다. 추천합니다!', '2025-09-20', 6);

-- Update center statistics
UPDATE centers SET review_count = 5, avg_rating = 4.20 WHERE id = 1238;

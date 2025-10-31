-- ============================================
-- 자가진단 템플릿 Seed SQL 스크립트
-- PHQ-9 기반 우울증 자가진단
-- Sprint 1: Task 1.6 & 1.7
-- ============================================

-- 기존 데이터 삭제 (재실행 시)
DELETE FROM self_assessment_templates WHERE template_name = '우울증 자가진단 (PHQ-9)';

-- PHQ-9 템플릿 삽입
INSERT INTO self_assessment_templates (
  template_name,
  template_type,
  description,
  questions_json,
  scoring_rules_json,
  interpretation_json,
  is_active,
  version,
  created_at,
  updated_at
) VALUES (
  '우울증 자가진단 (PHQ-9)',
  'depression',
  'PHQ-9 (Patient Health Questionnaire-9) 기반 우울증 선별 검사. 지난 2주 동안의 경험을 기준으로 응답해주세요.',
  JSON_ARRAY(
    JSON_OBJECT(
      'id', 1,
      'questionText', '일이나 여가 활동을 하는 데 흥미나 즐거움을 느끼지 못함',
      'questionOrder', 1,
      'options', JSON_ARRAY(
        JSON_OBJECT('value', 0, 'label', '전혀 그렇지 않다'),
        JSON_OBJECT('value', 1, 'label', '며칠 동안'),
        JSON_OBJECT('value', 2, 'label', '일주일 이상'),
        JSON_OBJECT('value', 3, 'label', '거의 매일')
      )
    ),
    JSON_OBJECT(
      'id', 2,
      'questionText', '기분이 가라앉거나, 우울하거나, 희망이 없다고 느낌',
      'questionOrder', 2,
      'options', JSON_ARRAY(
        JSON_OBJECT('value', 0, 'label', '전혀 그렇지 않다'),
        JSON_OBJECT('value', 1, 'label', '며칠 동안'),
        JSON_OBJECT('value', 2, 'label', '일주일 이상'),
        JSON_OBJECT('value', 3, 'label', '거의 매일')
      )
    ),
    JSON_OBJECT(
      'id', 3,
      'questionText', '잠들기 어렵거나 자주 깨어남, 또는 너무 많이 잠',
      'questionOrder', 3,
      'options', JSON_ARRAY(
        JSON_OBJECT('value', 0, 'label', '전혀 그렇지 않다'),
        JSON_OBJECT('value', 1, 'label', '며칠 동안'),
        JSON_OBJECT('value', 2, 'label', '일주일 이상'),
        JSON_OBJECT('value', 3, 'label', '거의 매일')
      )
    ),
    JSON_OBJECT(
      'id', 4,
      'questionText', '피곤하다고 느끼거나 기력이 거의 없음',
      'questionOrder', 4,
      'options', JSON_ARRAY(
        JSON_OBJECT('value', 0, 'label', '전혀 그렇지 않다'),
        JSON_OBJECT('value', 1, 'label', '며칠 동안'),
        JSON_OBJECT('value', 2, 'label', '일주일 이상'),
        JSON_OBJECT('value', 3, 'label', '거의 매일')
      )
    ),
    JSON_OBJECT(
      'id', 5,
      'questionText', '식욕이 줄었거나 과식을 함',
      'questionOrder', 5,
      'options', JSON_ARRAY(
        JSON_OBJECT('value', 0, 'label', '전혀 그렇지 않다'),
        JSON_OBJECT('value', 1, 'label', '며칠 동안'),
        JSON_OBJECT('value', 2, 'label', '일주일 이상'),
        JSON_OBJECT('value', 3, 'label', '거의 매일')
      )
    ),
    JSON_OBJECT(
      'id', 6,
      'questionText', '자신을 부정적으로 봄 - 혹은 자신이 실패자라고 느끼거나 자신 또는 가족을 실망시킴',
      'questionOrder', 6,
      'options', JSON_ARRAY(
        JSON_OBJECT('value', 0, 'label', '전혀 그렇지 않다'),
        JSON_OBJECT('value', 1, 'label', '며칠 동안'),
        JSON_OBJECT('value', 2, 'label', '일주일 이상'),
        JSON_OBJECT('value', 3, 'label', '거의 매일')
      )
    ),
    JSON_OBJECT(
      'id', 7,
      'questionText', '신문을 읽거나 TV를 보는 것과 같은 일에 집중하기 어려움',
      'questionOrder', 7,
      'options', JSON_ARRAY(
        JSON_OBJECT('value', 0, 'label', '전혀 그렇지 않다'),
        JSON_OBJECT('value', 1, 'label', '며칠 동안'),
        JSON_OBJECT('value', 2, 'label', '일주일 이상'),
        JSON_OBJECT('value', 3, 'label', '거의 매일')
      )
    ),
    JSON_OBJECT(
      'id', 8,
      'questionText', '다른 사람들이 알아챌 정도로 너무 느리게 움직이거나 말을 함. 또는 반대로 평상시보다 많이 움직여서 너무 안절부절못하거나 들떠 있음',
      'questionOrder', 8,
      'options', JSON_ARRAY(
        JSON_OBJECT('value', 0, 'label', '전혀 그렇지 않다'),
        JSON_OBJECT('value', 1, 'label', '며칠 동안'),
        JSON_OBJECT('value', 2, 'label', '일주일 이상'),
        JSON_OBJECT('value', 3, 'label', '거의 매일')
      )
    ),
    JSON_OBJECT(
      'id', 9,
      'questionText', '자신이 죽는 것이 더 낫다고 생각하거나 어떤 식으로든 자신을 해칠 것이라고 생각함',
      'questionOrder', 9,
      'options', JSON_ARRAY(
        JSON_OBJECT('value', 0, 'label', '전혀 그렇지 않다'),
        JSON_OBJECT('value', 1, 'label', '며칠 동안'),
        JSON_OBJECT('value', 2, 'label', '일주일 이상'),
        JSON_OBJECT('value', 3, 'label', '거의 매일')
      )
    ),
    JSON_OBJECT(
      'id', 10,
      'questionText', '위의 증상들이 일상생활(직장, 학업, 가정생활, 대인관계 등)을 하는 데 얼마나 어렵게 만들었습니까?',
      'questionOrder', 10,
      'options', JSON_ARRAY(
        JSON_OBJECT('value', 0, 'label', '전혀 어렵지 않음'),
        JSON_OBJECT('value', 1, 'label', '약간 어려움'),
        JSON_OBJECT('value', 2, 'label', '많이 어려움'),
        JSON_OBJECT('value', 3, 'label', '매우 많이 어려움')
      )
    )
  ),
  JSON_OBJECT(
    'totalPoints', 27,
    'calculation', 'sum',
    'description', '각 문항 점수(0-3점)를 합산하여 총점 산출',
    'severityLevels', JSON_ARRAY(
      JSON_OBJECT('range', JSON_ARRAY(0, 4), 'code', 'LOW', 'label', '정상', 'description', '우울증 증상이 거의 없는 상태입니다.'),
      JSON_OBJECT('range', JSON_ARRAY(5, 9), 'code', 'LOW', 'label', '가벼운 우울', 'description', '경미한 우울 증상이 나타나고 있습니다.'),
      JSON_OBJECT('range', JSON_ARRAY(10, 14), 'code', 'MID', 'label', '중간 정도 우울', 'description', '중간 수준의 우울 증상으로 전문가 상담을 권장합니다.'),
      JSON_OBJECT('range', JSON_ARRAY(15, 19), 'code', 'MID', 'label', '약간 심한 우울', 'description', '비교적 심한 우울 증상으로 전문적인 도움이 필요합니다.'),
      JSON_OBJECT('range', JSON_ARRAY(20, 27), 'code', 'HIGH', 'label', '심한 우울', 'description', '심각한 우울 증상으로 즉시 전문의 상담이 필요합니다.')
    )
  ),
  JSON_OBJECT(
    'lowSeverity', JSON_OBJECT(
      'title', '정상 또는 경미한 우울',
      'message', '현재 우울 증상이 거의 없거나 경미한 수준입니다. 하지만 증상이 지속되거나 악화되는 경우 전문가 상담을 고려해보세요.',
      'recommendations', JSON_ARRAY(
        '규칙적인 운동과 충분한 수면을 유지하세요',
        '가족, 친구들과 소통하며 사회적 관계를 유지하세요',
        '스트레스 관리 기법(명상, 요가 등)을 실천해보세요'
      )
    ),
    'midSeverity', JSON_OBJECT(
      'title', '중간 정도의 우울',
      'message', '중간 수준의 우울 증상이 나타나고 있습니다. 전문가 상담을 통해 적절한 치료를 받는 것이 좋습니다.',
      'recommendations', JSON_ARRAY(
        '정신건강 전문의 또는 심리상담사와 상담하세요',
        '인지행동치료(CBT) 등 심리치료를 고려해보세요',
        '필요시 약물치료에 대해 전문의와 상담하세요',
        '가족과 친구들에게 도움을 요청하세요'
      )
    ),
    'highSeverity', JSON_OBJECT(
      'title', '심각한 우울',
      'message', '심각한 우울 증상이 나타나고 있습니다. 즉시 정신건강 전문의의 진료를 받으시기 바랍니다.',
      'recommendations', JSON_ARRAY(
        '즉시 정신건강의학과 전문의 진료를 받으세요',
        '자해나 자살 충동이 있다면 즉시 응급실을 방문하거나 정신건강 위기상담전화(1577-0199)에 연락하세요',
        '가족이나 친구에게 현재 상태를 알리고 도움을 요청하세요',
        '약물치료와 심리치료를 병행하는 것이 효과적입니다'
      ),
      'emergencyContact', JSON_OBJECT(
        'suicide', '자살예방상담전화: 1393',
        'mentalHealth', '정신건강위기상담전화: 1577-0199',
        'emergency', '응급실: 119'
      )
    )
  ),
  TRUE,
  '1.0',
  NOW(),
  NOW()
);

-- 검증 쿼리
SELECT
  id,
  template_name,
  template_type,
  JSON_LENGTH(questions_json) AS question_count,
  version,
  is_active
FROM self_assessment_templates
WHERE template_name = '우울증 자가진단 (PHQ-9)';

-- ============================================
-- 마음이음 자가진단 템플릿 데이터
-- ============================================
-- 작성일: 2025-01-XX
-- 목적: 우울증, 불안장애, 스트레스 자가진단 템플릿 생성
-- 기반: PHQ-9, GAD-7, PSS-10 표준 검사 도구
-- ============================================

-- 1. 우울증 자가진단 (PHQ-9 기반)
INSERT INTO self_assessment_templates (
    template_code,
    template_name,
    template_type,
    description,
    question_count,
    estimated_time_minutes,
    questions_json,
    scoring_rules_json,
    interpretation_json,
    is_active,
    version
) VALUES (
    'PHQ9',
    '우울증 자가진단 (PHQ-9)',
    '우울증',
    '최근 2주 동안 다음의 문제들로 인해 얼마나 자주 방해를 받았는지 체크해주세요.',
    9,
    5,
    JSON_ARRAY(
        JSON_OBJECT(
            'id', 1,
            'question', '일 또는 여가 활동을 하는데 흥미나 즐거움을 느끼지 못함',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 2,
            'question', '기분이 가라앉거나, 우울하거나, 희망이 없다고 느낌',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 3,
            'question', '잠들기 어렵거나 자주 깨어남, 또는 너무 많이 잠',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 4,
            'question', '피곤하다고 느끼거나 기력이 거의 없음',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 5,
            'question', '입맛이 없거나 과식을 함',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 6,
            'question', '자신을 부정적으로 봄 - 혹은 자신이 실패자라고 느끼거나 자신 또는 가족을 실망시킴',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 7,
            'question', '신문을 읽거나 TV를 보는 것과 같은 일에 집중하기 어려움',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 8,
            'question', '다른 사람들이 알아챌 정도로 너무 느리게 움직이거나 말을 함. 또는 반대로 평상시보다 많이 움직여서, 너무 안절부절 못하거나 들떠 있음',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 9,
            'question', '자신이 죽는 것이 더 낫다고 생각하거나 어떤 식으로든 자신을 해칠 것이라고 생각함',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        )
    ),
    JSON_OBJECT(
        'total_score_range', JSON_OBJECT('min', 0, 'max', 27),
        'calculation', 'sum',
        'severity_levels', JSON_ARRAY(
            JSON_OBJECT('code', 'LOW', 'range', JSON_OBJECT('min', 0, 'max', 4), 'label', '정상'),
            JSON_OBJECT('code', 'LOW', 'range', JSON_OBJECT('min', 5, 'max', 9), 'label', '경미한 우울'),
            JSON_OBJECT('code', 'MID', 'range', JSON_OBJECT('min', 10, 'max', 14), 'label', '중등도 우울'),
            JSON_OBJECT('code', 'HIGH', 'range', JSON_OBJECT('min', 15, 'max', 19), 'label', '중증 우울'),
            JSON_OBJECT('code', 'HIGH', 'range', JSON_OBJECT('min', 20, 'max', 27), 'label', '최중증 우울')
        )
    ),
    JSON_OBJECT(
        'LOW', JSON_OBJECT(
            'title', '정상 범위',
            'description', '현재 우울증 증상이 정상 범위에 있습니다. 하지만 지속적인 관심과 자기 관리가 필요합니다.',
            'recommendation', '규칙적인 운동, 충분한 수면, 균형 잡힌 식사를 통해 정신건강을 유지하세요. 스트레스 관리 프로그램 참여를 고려해보세요.',
            'center_type', JSON_ARRAY('정신건강복지센터', '건강증진센터')
        ),
        'MID', JSON_OBJECT(
            'title', '중등도 우울',
            'description', '중등도의 우울 증상이 나타나고 있습니다. 전문가의 상담을 받아보시는 것이 좋습니다.',
            'recommendation', '정신건강 전문가와의 상담을 권장합니다. 센터에서 제공하는 상담 프로그램이나 집단 치료 프로그램 참여를 고려하세요.',
            'center_type', JSON_ARRAY('정신건강복지센터', '정신건강의학과')
        ),
        'HIGH', JSON_OBJECT(
            'title', '중증 이상 우울',
            'description', '중증 이상의 우울 증상이 나타나고 있습니다. 즉시 전문적인 도움이 필요합니다.',
            'recommendation', '가능한 빨리 정신건강의학과 전문의를 찾아가 진료를 받으시기 바랍니다. 응급 상황이라고 느껴진다면 정신건강위기상담전화(1577-0199)로 연락하세요.',
            'center_type', JSON_ARRAY('정신건강복지센터', '정신건강의학과', '응급정신건강센터'),
            'emergency_contact', JSON_OBJECT(
                'name', '정신건강위기상담전화',
                'phone', '1577-0199',
                'description', '24시간 무료 상담'
            )
        )
    ),
    TRUE,
    '1.0'
);

-- 2. 불안장애 자가진단 (GAD-7 기반)
INSERT INTO self_assessment_templates (
    template_code,
    template_name,
    template_type,
    description,
    question_count,
    estimated_time_minutes,
    questions_json,
    scoring_rules_json,
    interpretation_json,
    is_active,
    version
) VALUES (
    'GAD7',
    '불안장애 자가진단 (GAD-7)',
    '불안장애',
    '지난 2주 동안, 다음의 문제들로 인해 얼마나 자주 방해를 받았습니까?',
    7,
    5,
    JSON_ARRAY(
        JSON_OBJECT(
            'id', 1,
            'question', '초조하거나 불안하거나 조마조마하게 느낌',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 2,
            'question', '걱정하는 것을 멈추거나 조절할 수 없음',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 3,
            'question', '여러 가지 것들에 대해 걱정을 너무 많이 함',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 4,
            'question', '편하게 있기가 어려움',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 5,
            'question', '너무 안절부절못해서 가만히 있기 힘듦',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 6,
            'question', '쉽게 짜증이 나거나 쉽게 성을 내게 됨',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        ),
        JSON_OBJECT(
            'id', 7,
            'question', '마치 끔찍한 일이 생길 것 같아 두려움을 느낌',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 방해받지 않았다'),
                JSON_OBJECT('value', 1, 'label', '며칠 동안 방해받았다'),
                JSON_OBJECT('value', 2, 'label', '7일 이상 방해받았다'),
                JSON_OBJECT('value', 3, 'label', '거의 매일 방해받았다')
            )
        )
    ),
    JSON_OBJECT(
        'total_score_range', JSON_OBJECT('min', 0, 'max', 21),
        'calculation', 'sum',
        'severity_levels', JSON_ARRAY(
            JSON_OBJECT('code', 'LOW', 'range', JSON_OBJECT('min', 0, 'max', 4), 'label', '정상'),
            JSON_OBJECT('code', 'LOW', 'range', JSON_OBJECT('min', 5, 'max', 9), 'label', '경미한 불안'),
            JSON_OBJECT('code', 'MID', 'range', JSON_OBJECT('min', 10, 'max', 14), 'label', '중등도 불안'),
            JSON_OBJECT('code', 'HIGH', 'range', JSON_OBJECT('min', 15, 'max', 21), 'label', '중증 불안')
        )
    ),
    JSON_OBJECT(
        'LOW', JSON_OBJECT(
            'title', '정상 범위',
            'description', '현재 불안 증상이 정상 범위에 있습니다. 건강한 정신 상태를 유지하고 있습니다.',
            'recommendation', '현재 상태를 유지하기 위해 규칙적인 운동, 명상, 요가 등의 이완 활동을 실천하세요. 스트레스 관리 능력을 키우는 것이 도움이 됩니다.',
            'center_type', JSON_ARRAY('정신건강복지센터', '건강증진센터')
        ),
        'MID', JSON_OBJECT(
            'title', '중등도 불안',
            'description', '중등도의 불안 증상이 나타나고 있습니다. 전문가의 도움을 받는 것이 좋습니다.',
            'recommendation', '심리상담이나 인지행동치료가 도움이 될 수 있습니다. 가까운 정신건강복지센터에서 상담 서비스를 이용하세요.',
            'center_type', JSON_ARRAY('정신건강복지센터', '정신건강의학과')
        ),
        'HIGH', JSON_OBJECT(
            'title', '중증 불안',
            'description', '중증의 불안 증상이 나타나고 있습니다. 전문적인 치료가 필요합니다.',
            'recommendation', '가능한 빨리 정신건강의학과 전문의의 진료를 받으시기 바랍니다. 약물치료와 심리치료를 병행하는 것이 효과적일 수 있습니다.',
            'center_type', JSON_ARRAY('정신건강복지센터', '정신건강의학과'),
            'emergency_contact', JSON_OBJECT(
                'name', '정신건강위기상담전화',
                'phone', '1577-0199',
                'description', '24시간 무료 상담'
            )
        )
    ),
    TRUE,
    '1.0'
);

-- 3. 스트레스 자가진단 (PSS-10 기반)
INSERT INTO self_assessment_templates (
    template_code,
    template_name,
    template_type,
    description,
    question_count,
    estimated_time_minutes,
    questions_json,
    scoring_rules_json,
    interpretation_json,
    is_active,
    version
) VALUES (
    'PSS10',
    '스트레스 자가진단 (PSS-10)',
    '스트레스',
    '지난 한 달 동안, 다음의 상황을 얼마나 자주 경험하셨습니까?',
    10,
    5,
    JSON_ARRAY(
        JSON_OBJECT(
            'id', 1,
            'question', '예상치 못한 일 때문에 기분이 상한 적이 있었습니까?',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 없었다'),
                JSON_OBJECT('value', 1, 'label', '거의 없었다'),
                JSON_OBJECT('value', 2, 'label', '가끔 있었다'),
                JSON_OBJECT('value', 3, 'label', '자주 있었다'),
                JSON_OBJECT('value', 4, 'label', '매우 자주 있었다')
            )
        ),
        JSON_OBJECT(
            'id', 2,
            'question', '인생의 중요한 일들을 조절할 수 없다는 느낌을 받은 적이 있었습니까?',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 없었다'),
                JSON_OBJECT('value', 1, 'label', '거의 없었다'),
                JSON_OBJECT('value', 2, 'label', '가끔 있었다'),
                JSON_OBJECT('value', 3, 'label', '자주 있었다'),
                JSON_OBJECT('value', 4, 'label', '매우 자주 있었다')
            )
        ),
        JSON_OBJECT(
            'id', 3,
            'question', '신경이 예민해지고 스트레스를 받은 적이 있었습니까?',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 없었다'),
                JSON_OBJECT('value', 1, 'label', '거의 없었다'),
                JSON_OBJECT('value', 2, 'label', '가끔 있었다'),
                JSON_OBJECT('value', 3, 'label', '자주 있었다'),
                JSON_OBJECT('value', 4, 'label', '매우 자주 있었다')
            )
        ),
        JSON_OBJECT(
            'id', 4,
            'question', '개인적인 문제들을 다루는 데 있어서 자신감을 느낀 적이 있었습니까?',
            'reverse', true,
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 4, 'label', '전혀 없었다'),
                JSON_OBJECT('value', 3, 'label', '거의 없었다'),
                JSON_OBJECT('value', 2, 'label', '가끔 있었다'),
                JSON_OBJECT('value', 1, 'label', '자주 있었다'),
                JSON_OBJECT('value', 0, 'label', '매우 자주 있었다')
            )
        ),
        JSON_OBJECT(
            'id', 5,
            'question', '일들이 뜻대로 진행되고 있다고 느낀 적이 있었습니까?',
            'reverse', true,
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 4, 'label', '전혀 없었다'),
                JSON_OBJECT('value', 3, 'label', '거의 없었다'),
                JSON_OBJECT('value', 2, 'label', '가끔 있었다'),
                JSON_OBJECT('value', 1, 'label', '자주 있었다'),
                JSON_OBJECT('value', 0, 'label', '매우 자주 있었다')
            )
        ),
        JSON_OBJECT(
            'id', 6,
            'question', '해야 할 일들을 감당할 수 없다고 느낀 적이 있었습니까?',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 없었다'),
                JSON_OBJECT('value', 1, 'label', '거의 없었다'),
                JSON_OBJECT('value', 2, 'label', '가끔 있었다'),
                JSON_OBJECT('value', 3, 'label', '자주 있었다'),
                JSON_OBJECT('value', 4, 'label', '매우 자주 있었다')
            )
        ),
        JSON_OBJECT(
            'id', 7,
            'question', '일상의 짜증을 잘 다스릴 수 있었습니까?',
            'reverse', true,
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 4, 'label', '전혀 없었다'),
                JSON_OBJECT('value', 3, 'label', '거의 없었다'),
                JSON_OBJECT('value', 2, 'label', '가끔 있었다'),
                JSON_OBJECT('value', 1, 'label', '자주 있었다'),
                JSON_OBJECT('value', 0, 'label', '매우 자주 있었다')
            )
        ),
        JSON_OBJECT(
            'id', 8,
            'question', '최상의 컨디션이라고 느낀 적이 있었습니까?',
            'reverse', true,
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 4, 'label', '전혀 없었다'),
                JSON_OBJECT('value', 3, 'label', '거의 없었다'),
                JSON_OBJECT('value', 2, 'label', '가끔 있었다'),
                JSON_OBJECT('value', 1, 'label', '자주 있었다'),
                JSON_OBJECT('value', 0, 'label', '매우 자주 있었다')
            )
        ),
        JSON_OBJECT(
            'id', 9,
            'question', '자신이 통제할 수 없는 일로 화가 난 적이 있었습니까?',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 없었다'),
                JSON_OBJECT('value', 1, 'label', '거의 없었다'),
                JSON_OBJECT('value', 2, 'label', '가끔 있었다'),
                JSON_OBJECT('value', 3, 'label', '자주 있었다'),
                JSON_OBJECT('value', 4, 'label', '매우 자주 있었다')
            )
        ),
        JSON_OBJECT(
            'id', 10,
            'question', '어려운 일들이 너무 많이 쌓여서 극복하지 못할 것 같다고 느낀 적이 있었습니까?',
            'options', JSON_ARRAY(
                JSON_OBJECT('value', 0, 'label', '전혀 없었다'),
                JSON_OBJECT('value', 1, 'label', '거의 없었다'),
                JSON_OBJECT('value', 2, 'label', '가끔 있었다'),
                JSON_OBJECT('value', 3, 'label', '자주 있었다'),
                JSON_OBJECT('value', 4, 'label', '매우 자주 있었다')
            )
        )
    ),
    JSON_OBJECT(
        'total_score_range', JSON_OBJECT('min', 0, 'max', 40),
        'calculation', 'sum',
        'note', '4, 5, 7, 8번 문항은 역채점 문항입니다.',
        'severity_levels', JSON_ARRAY(
            JSON_OBJECT('code', 'LOW', 'range', JSON_OBJECT('min', 0, 'max', 13), 'label', '정상'),
            JSON_OBJECT('code', 'MID', 'range', JSON_OBJECT('min', 14, 'max', 26), 'label', '중등도 스트레스'),
            JSON_OBJECT('code', 'HIGH', 'range', JSON_OBJECT('min', 27, 'max', 40), 'label', '고도 스트레스')
        )
    ),
    JSON_OBJECT(
        'LOW', JSON_OBJECT(
            'title', '정상 범위',
            'description', '현재 스트레스 수준이 정상 범위에 있습니다. 적절한 스트레스 대처 능력을 보이고 있습니다.',
            'recommendation', '현재의 스트레스 관리 방법을 유지하시고, 규칙적인 운동과 취미 활동을 통해 건강한 생활습관을 이어가세요.',
            'center_type', JSON_ARRAY('건강증진센터', '정신건강복지센터')
        ),
        'MID', JSON_OBJECT(
            'title', '중등도 스트레스',
            'description', '중등도의 스트레스를 경험하고 있습니다. 스트레스 관리가 필요한 시점입니다.',
            'recommendation', '스트레스 관리 프로그램이나 명상, 요가 등의 이완 기법을 배워보세요. 정신건강복지센터의 스트레스 관리 프로그램 참여를 권장합니다.',
            'center_type', JSON_ARRAY('정신건강복지센터', '건강증진센터')
        ),
        'HIGH', JSON_OBJECT(
            'title', '고도 스트레스',
            'description', '높은 수준의 스트레스를 경험하고 있습니다. 전문가의 도움이 필요합니다.',
            'recommendation', '스트레스로 인한 건강 문제가 발생하기 전에 전문가와 상담하세요. 정신건강의학과 진료나 심리상담을 받으시기 바랍니다.',
            'center_type', JSON_ARRAY('정신건강복지센터', '정신건강의학과'),
            'emergency_contact', JSON_OBJECT(
                'name', '정신건강위기상담전화',
                'phone', '1577-0199',
                'description', '24시간 무료 상담'
            )
        )
    ),
    TRUE,
    '1.0'
);

-- 데이터 삽입 확인 쿼리
SELECT
    id,
    template_name,
    template_type,
    version,
    is_active,
    created_at
FROM self_assessment_templates
ORDER BY id;

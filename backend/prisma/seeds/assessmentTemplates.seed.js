/**
 * 자가진단 템플릿 Seed 스크립트
 * PHQ-9 (Patient Health Questionnaire-9) 기반 우울증 자가진단
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 1.6: Seed 스크립트 작성
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// PHQ-9 기반 우울증 자가진단 템플릿
const depressionTemplate = {
  templateName: '우울증 자가진단 (PHQ-9)',
  templateType: 'depression',
  description: 'PHQ-9 (Patient Health Questionnaire-9) 기반 우울증 선별 검사. 지난 2주 동안의 경험을 기준으로 응답해주세요.',
  questionsJson: [
    {
      id: 1,
      questionText: '일이나 여가 활동을 하는 데 흥미나 즐거움을 느끼지 못함',
      questionOrder: 1,
      options: [
        { value: 0, label: '전혀 그렇지 않다' },
        { value: 1, label: '며칠 동안' },
        { value: 2, label: '일주일 이상' },
        { value: 3, label: '거의 매일' },
      ],
    },
    {
      id: 2,
      questionText: '기분이 가라앉거나, 우울하거나, 희망이 없다고 느낌',
      questionOrder: 2,
      options: [
        { value: 0, label: '전혀 그렇지 않다' },
        { value: 1, label: '며칠 동안' },
        { value: 2, label: '일주일 이상' },
        { value: 3, label: '거의 매일' },
      ],
    },
    {
      id: 3,
      questionText: '잠들기 어렵거나 자주 깨어남, 또는 너무 많이 잠',
      questionOrder: 3,
      options: [
        { value: 0, label: '전혀 그렇지 않다' },
        { value: 1, label: '며칠 동안' },
        { value: 2, label: '일주일 이상' },
        { value: 3, label: '거의 매일' },
      ],
    },
    {
      id: 4,
      questionText: '피곤하다고 느끼거나 기력이 거의 없음',
      questionOrder: 4,
      options: [
        { value: 0, label: '전혀 그렇지 않다' },
        { value: 1, label: '며칠 동안' },
        { value: 2, label: '일주일 이상' },
        { value: 3, label: '거의 매일' },
      ],
    },
    {
      id: 5,
      questionText: '식욕이 줄었거나 과식을 함',
      questionOrder: 5,
      options: [
        { value: 0, label: '전혀 그렇지 않다' },
        { value: 1, label: '며칠 동안' },
        { value: 2, label: '일주일 이상' },
        { value: 3, label: '거의 매일' },
      ],
    },
    {
      id: 6,
      questionText:
        '자신을 부정적으로 봄 - 혹은 자신이 실패자라고 느끼거나 자신 또는 가족을 실망시킴',
      questionOrder: 6,
      options: [
        { value: 0, label: '전혀 그렇지 않다' },
        { value: 1, label: '며칠 동안' },
        { value: 2, label: '일주일 이상' },
        { value: 3, label: '거의 매일' },
      ],
    },
    {
      id: 7,
      questionText: '신문을 읽거나 TV를 보는 것과 같은 일에 집중하기 어려움',
      questionOrder: 7,
      options: [
        { value: 0, label: '전혀 그렇지 않다' },
        { value: 1, label: '며칠 동안' },
        { value: 2, label: '일주일 이상' },
        { value: 3, label: '거의 매일' },
      ],
    },
    {
      id: 8,
      questionText:
        '다른 사람들이 알아챌 정도로 너무 느리게 움직이거나 말을 함. 또는 반대로 평상시보다 많이 움직여서 너무 안절부절못하거나 들떠 있음',
      questionOrder: 8,
      options: [
        { value: 0, label: '전혀 그렇지 않다' },
        { value: 1, label: '며칠 동안' },
        { value: 2, label: '일주일 이상' },
        { value: 3, label: '거의 매일' },
      ],
    },
    {
      id: 9,
      questionText:
        '자신이 죽는 것이 더 낫다고 생각하거나 어떤 식으로든 자신을 해칠 것이라고 생각함',
      questionOrder: 9,
      options: [
        { value: 0, label: '전혀 그렇지 않다' },
        { value: 1, label: '며칠 동안' },
        { value: 2, label: '일주일 이상' },
        { value: 3, label: '거의 매일' },
      ],
    },
    {
      id: 10,
      questionText:
        '위의 증상들이 일상생활(직장, 학업, 가정생활, 대인관계 등)을 하는 데 얼마나 어렵게 만들었습니까?',
      questionOrder: 10,
      options: [
        { value: 0, label: '전혀 어렵지 않음' },
        { value: 1, label: '약간 어려움' },
        { value: 2, label: '많이 어려움' },
        { value: 3, label: '매우 많이 어려움' },
      ],
    },
  ],
  scoringRulesJson: {
    totalPoints: 27,
    calculation: 'sum',
    description: '각 문항 점수(0-3점)를 합산하여 총점 산출',
    severityLevels: [
      {
        range: [0, 4],
        code: 'LOW',
        label: '정상',
        description: '우울증 증상이 거의 없는 상태입니다.',
      },
      {
        range: [5, 9],
        code: 'LOW',
        label: '가벼운 우울',
        description: '경미한 우울 증상이 나타나고 있습니다.',
      },
      {
        range: [10, 14],
        code: 'MID',
        label: '중간 정도 우울',
        description: '중간 수준의 우울 증상으로 전문가 상담을 권장합니다.',
      },
      {
        range: [15, 19],
        code: 'MID',
        label: '약간 심한 우울',
        description: '비교적 심한 우울 증상으로 전문적인 도움이 필요합니다.',
      },
      {
        range: [20, 27],
        code: 'HIGH',
        label: '심한 우울',
        description: '심각한 우울 증상으로 즉시 전문의 상담이 필요합니다.',
      },
    ],
  },
  interpretationJson: {
    lowSeverity: {
      title: '정상 또는 경미한 우울',
      message:
        '현재 우울 증상이 거의 없거나 경미한 수준입니다. 하지만 증상이 지속되거나 악화되는 경우 전문가 상담을 고려해보세요.',
      recommendations: [
        '규칙적인 운동과 충분한 수면을 유지하세요',
        '가족, 친구들과 소통하며 사회적 관계를 유지하세요',
        '스트레스 관리 기법(명상, 요가 등)을 실천해보세요',
      ],
    },
    midSeverity: {
      title: '중간 정도의 우울',
      message:
        '중간 수준의 우울 증상이 나타나고 있습니다. 전문가 상담을 통해 적절한 치료를 받는 것이 좋습니다.',
      recommendations: [
        '정신건강 전문의 또는 심리상담사와 상담하세요',
        '인지행동치료(CBT) 등 심리치료를 고려해보세요',
        '필요시 약물치료에 대해 전문의와 상담하세요',
        '가족과 친구들에게 도움을 요청하세요',
      ],
    },
    highSeverity: {
      title: '심각한 우울',
      message:
        '심각한 우울 증상이 나타나고 있습니다. 즉시 정신건강 전문의의 진료를 받으시기 바랍니다.',
      recommendations: [
        '즉시 정신건강의학과 전문의 진료를 받으세요',
        '자해나 자살 충동이 있다면 즉시 응급실을 방문하거나 정신건강 위기상담전화(1577-0199)에 연락하세요',
        '가족이나 친구에게 현재 상태를 알리고 도움을 요청하세요',
        '약물치료와 심리치료를 병행하는 것이 효과적입니다',
      ],
      emergencyContact: {
        suicide: '자살예방상담전화: 1393',
        mentalHealth: '정신건강위기상담전화: 1577-0199',
        emergency: '응급실: 119',
      },
    },
  },
  isActive: true,
  version: '1.0',
};

async function main() {
  console.log('🌱 Starting seed: Self-Assessment Templates');

  try {
    // 기존 템플릿 확인
    const existingTemplate = await prisma.selfAssessmentTemplate.findFirst({
      where: {
        templateName: depressionTemplate.templateName,
      },
    });

    if (existingTemplate) {
      console.log(
        '⚠️  Template already exists. Updating...',
        existingTemplate.templateName
      );
      await prisma.selfAssessmentTemplate.update({
        where: { id: existingTemplate.id },
        data: depressionTemplate,
      });
      console.log('✅ Template updated successfully');
    } else {
      // 새 템플릿 생성
      const created = await prisma.selfAssessmentTemplate.create({
        data: depressionTemplate,
      });
      console.log('✅ Template created successfully:', created.templateName);
      console.log(`   - Template ID: ${created.id}`);
      console.log(
        `   - Questions: ${created.questionsJson.length} items`
      );
    }

    // 검증
    const totalTemplates = await prisma.selfAssessmentTemplate.count();
    console.log(`\n📊 Total templates in database: ${totalTemplates}`);

    // 생성된 템플릿 상세 조회
    const template = await prisma.selfAssessmentTemplate.findFirst({
      where: { templateName: depressionTemplate.templateName },
    });

    if (template) {
      console.log('\n📋 Template Details:');
      console.log(`   - Name: ${template.templateName}`);
      console.log(`   - Type: ${template.templateType}`);
      console.log(`   - Questions: ${template.questionsJson.length}`);
      console.log(`   - Version: ${template.version}`);
      console.log(`   - Active: ${template.isActive}`);
    }

    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

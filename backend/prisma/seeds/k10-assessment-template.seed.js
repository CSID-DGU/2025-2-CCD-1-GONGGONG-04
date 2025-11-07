/**
 * K-10 자가진단 템플릿 Seed 스크립트
 * Kessler Psychological Distress Scale (K-10) 기반 정신적 고통 선별 검사
 *
 * Sprint 3: 자가진단 도구 구현
 * Task 3.1.1: 데이터베이스 스키마 및 시드 데이터
 *
 * @reference https://www.health.gov.au/resources/apps-and-tools/k10-assessment
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// K-10 기반 정신건강 자가진단 템플릿
const k10Template = {
  templateCode: 'K10_V1',
  templateName: '정신건강 자가진단 (K-10)',
  templateType: 'mental_health',
  description:
    'K-10 (Kessler Psychological Distress Scale) 기반 정신적 고통 선별 검사입니다. 지난 한 달 동안의 경험을 기준으로 응답해주세요.',
  questionCount: 10,
  estimatedTimeMinutes: 3,
  questionsJson: [
    {
      question_number: 1,
      question_text: '지난 한 달 동안, 신경이 예민하여 안절부절못한 느낌을 얼마나 자주 느꼈습니까?',
      category: 'anxiety',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 2,
      question_text: '지난 한 달 동안, 너무 불안해서 가만히 앉아 있을 수 없는 느낌을 얼마나 자주 느꼈습니까?',
      category: 'anxiety',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 3,
      question_text: '지난 한 달 동안, 안절부절못하거나 초조함을 얼마나 자주 느꼈습니까?',
      category: 'restlessness',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 4,
      question_text: '지난 한 달 동안, 우울하거나 침울한 기분을 얼마나 자주 느꼈습니까?',
      category: 'depression',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 5,
      question_text: '지난 한 달 동안, 모든 일에 노력이 필요하다고 느낀 적이 얼마나 자주 있었습니까?',
      category: 'fatigue',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 6,
      question_text: '지난 한 달 동안, 아무 희망도 없다고 느낀 적이 얼마나 자주 있었습니까?',
      category: 'hopelessness',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 7,
      question_text: '지난 한 달 동안, 가치 없는 사람이라고 느낀 적이 얼마나 자주 있었습니까?',
      category: 'worthlessness',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 8,
      question_text: '지난 한 달 동안, 극도로 피로하거나 지쳐있다고 느낀 적이 얼마나 자주 있었습니까?',
      category: 'fatigue',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 9,
      question_text: '지난 한 달 동안, 사람들과 만나고 이야기하는 것이 힘들다고 느낀 적이 얼마나 자주 있었습니까?',
      category: 'social_withdrawal',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
    {
      question_number: 10,
      question_text: '지난 한 달 동안, 자신이 쓸모없는 사람이라고 느낀 적이 얼마나 자주 있었습니까?',
      category: 'worthlessness',
      options: [
        { option_number: 1, option_text: '전혀 느끼지 않았다', score: 1 },
        { option_number: 2, option_text: '가끔 느꼈다', score: 2 },
        { option_number: 3, option_text: '자주 느꼈다', score: 3 },
        { option_number: 4, option_text: '항상 느꼈다', score: 4 },
      ],
    },
  ],
  scoringRulesJson: {
    totalPoints: 40,
    minScore: 10,
    maxScore: 40,
    calculation: 'sum',
    description: '각 문항 점수(1-4점)를 합산하여 총점 산출 (범위: 10-40점)',
    severityLevels: [
      {
        code: 'LOW',
        min: 10,
        max: 15,
        label: '정상',
        description: '정신적 고통이 거의 없는 상태입니다.',
        color: '#10B981',
        recommendation: '현재 정신건강 상태가 양호합니다. 건강한 생활습관을 유지하세요.',
      },
      {
        code: 'MID',
        min: 16,
        max: 29,
        label: '중간 정도 고통',
        description: '중간 수준의 정신적 고통을 경험하고 있습니다.',
        color: '#F59E0B',
        recommendation: '전문가 상담을 통해 적절한 지원을 받는 것이 좋습니다.',
      },
      {
        code: 'HIGH',
        min: 30,
        max: 40,
        label: '심각한 고통',
        description: '심각한 수준의 정신적 고통을 경험하고 있습니다.',
        color: '#EF4444',
        recommendation: '즉시 정신건강 전문의의 진료를 받으시기 바랍니다.',
      },
    ],
  },
  interpretationJson: {
    LOW: {
      title: '정상 범위',
      message:
        '현재 정신적 고통이 거의 없는 상태입니다. 이는 좋은 정신건강 상태를 나타냅니다.',
      recommendations: [
        '규칙적인 수면 패턴과 건강한 식습관을 유지하세요',
        '적절한 운동과 취미활동으로 스트레스를 관리하세요',
        '가족, 친구들과의 긍정적인 관계를 유지하세요',
        '필요시 정신건강 자가진단을 주기적으로 실시하세요',
      ],
      urgency: 'low',
    },
    MID: {
      title: '중간 정도의 정신적 고통',
      message:
        '중간 수준의 정신적 고통을 경험하고 있습니다. 전문가의 도움을 받으면 증상이 개선될 수 있습니다.',
      recommendations: [
        '정신건강 전문가(정신건강의학과 의사, 임상심리사)와 상담하세요',
        '스트레스 관리 프로그램이나 심리 상담을 고려해보세요',
        '충분한 휴식과 수면을 취하세요',
        '술이나 카페인 섭취를 줄이세요',
        '가까운 사람들에게 현재 상태를 공유하고 지지를 구하세요',
      ],
      urgency: 'moderate',
      contactInfo: {
        nationalMentalHealth: '정신건강위기상담전화 1577-0199 (24시간)',
        counseling: '마음이음 센터 검색을 통해 가까운 상담센터를 찾아보세요',
      },
    },
    HIGH: {
      title: '심각한 정신적 고통',
      message:
        '심각한 수준의 정신적 고통을 경험하고 있습니다. 즉시 전문적인 도움이 필요합니다.',
      recommendations: [
        '즉시 정신건강의학과 전문의 진료를 받으세요',
        '자해나 자살 충동이 있다면 즉시 응급실을 방문하거나 자살예방상담전화(1393)에 연락하세요',
        '가족이나 친구에게 현재 상태를 알리고 즉각적인 지원을 요청하세요',
        '혼자 있지 말고 신뢰할 수 있는 사람과 함께 있으세요',
        '약물치료와 심리치료를 병행하는 것이 효과적입니다',
      ],
      urgency: 'high',
      emergencyContact: {
        suicide: '자살예방상담전화: 1393 (24시간)',
        mentalHealth: '정신건강위기상담전화: 1577-0199 (24시간)',
        emergency: '응급상황: 119',
        counseling: '생명의전화: 1588-9191',
      },
      warningMessage:
        '⚠️ 즉각적인 위험이 있다고 느끼시면 지체 없이 119에 연락하거나 가까운 응급실을 방문하세요.',
    },
  },
  isActive: true,
  version: '1.0',
};

async function main() {
  console.log('🌱 Starting seed: K-10 Self-Assessment Template');

  try {
    // 기존 K-10 템플릿 확인
    const existingTemplate = await prisma.selfAssessmentTemplate.findFirst({
      where: {
        templateCode: k10Template.templateCode,
      },
    });

    if (existingTemplate) {
      console.log(
        '⚠️  K-10 Template already exists. Updating...',
        existingTemplate.templateName
      );
      await prisma.selfAssessmentTemplate.update({
        where: { id: existingTemplate.id },
        data: k10Template,
      });
      console.log('✅ K-10 Template updated successfully');
    } else {
      // 새 K-10 템플릿 생성
      const created = await prisma.selfAssessmentTemplate.create({
        data: k10Template,
      });
      console.log('✅ K-10 Template created successfully:', created.templateName);
      console.log(`   - Template ID: ${created.id}`);
      console.log(`   - Template Code: ${created.templateCode}`);
      console.log(`   - Questions: ${created.questionCount} items`);
      console.log(`   - Estimated Time: ${created.estimatedTimeMinutes} minutes`);
    }

    // 검증
    const totalTemplates = await prisma.selfAssessmentTemplate.count();
    console.log(`\n📊 Total templates in database: ${totalTemplates}`);

    // 생성된 K-10 템플릿 상세 조회
    const template = await prisma.selfAssessmentTemplate.findFirst({
      where: { templateCode: k10Template.templateCode },
    });

    if (template) {
      console.log('\n📋 K-10 Template Details:');
      console.log(`   - ID: ${template.id}`);
      console.log(`   - Code: ${template.templateCode}`);
      console.log(`   - Name: ${template.templateName}`);
      console.log(`   - Type: ${template.templateType}`);
      console.log(`   - Questions: ${template.questionCount}`);
      console.log(`   - Estimated Time: ${template.estimatedTimeMinutes} min`);
      console.log(`   - Version: ${template.version}`);
      console.log(`   - Active: ${template.isActive}`);

      // Scoring rules validation
      const scoringRules = template.scoringRulesJson;
      console.log('\n📐 Scoring Rules:');
      console.log(`   - Total Points: ${scoringRules.totalPoints}`);
      console.log(`   - Score Range: ${scoringRules.minScore}-${scoringRules.maxScore}`);
      console.log(`   - Severity Levels: ${scoringRules.severityLevels.length}`);

      scoringRules.severityLevels.forEach(level => {
        console.log(`     • ${level.code}: ${level.min}-${level.max} (${level.label})`);
      });
    }

    console.log('\n🎉 K-10 seed completed successfully!');
  } catch (error) {
    console.error('❌ K-10 seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
    .catch(e => {
      console.error(e);
      process.exit(1);
    });
}

// Export for testing
module.exports = { k10Template, main };

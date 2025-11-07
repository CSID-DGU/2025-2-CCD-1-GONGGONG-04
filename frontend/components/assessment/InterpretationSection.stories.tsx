/**
 * InterpretationSection Storybook Stories
 * Sprint 3 - Task 3.2.4
 */

import type { Meta, StoryObj } from '@storybook/react';
import { InterpretationSection } from './InterpretationSection';
import type { Interpretation } from '@/lib/api/assessments';

const meta = {
  title: 'Assessment/InterpretationSection',
  component: InterpretationSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InterpretationSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const lowInterpretation: Interpretation = {
  title: '정상 범위',
  description: '현재 정신건강 상태가 비교적 양호합니다. 지속적인 관리를 통해 긍정적인 상태를 유지하세요.',
  recommendations: [
    '규칙적인 생활 습관 유지하기',
    '스트레스 관리 기법 실천하기',
    '긍정적인 사회적 관계 유지하기',
  ],
  urgency: 'low',
};

const midInterpretation: Interpretation = {
  title: '중등도 우울 증상',
  description: '최근 2주간 우울감과 스트레스가 지속되고 있습니다. 전문가의 상담을 통해 증상 완화를 도모하는 것이 좋습니다.',
  recommendations: [
    '정신건강복지센터에서 전문가 상담받기',
    '규칙적인 운동과 충분한 수면 유지',
    '가족이나 친구와 어려움 공유하기',
    '스트레스 요인 파악 및 관리',
  ],
  urgency: 'moderate',
};

const highInterpretation: Interpretation = {
  title: '심각한 심리적 고통',
  description: '심각한 수준의 우울감과 불안을 겪고 있습니다. 즉시 전문의의 도움을 받아야 합니다. 혼자 고민하지 마시고 전문가의 지원을 받으세요.',
  recommendations: [
    '즉시 정신건강의학과 전문의 진료 받기',
    '24시간 위기상담전화 이용 (1577-0199)',
    '가까운 정신건강복지센터 방문',
    '가족이나 신뢰할 수 있는 사람에게 도움 요청',
    '자해 또는 자살 생각 시 즉시 응급실 방문',
  ],
  urgency: 'high',
};

/**
 * LOW 심각도 해석
 */
export const LowUrgency: Story = {
  args: {
    interpretation: lowInterpretation,
  },
  parameters: {
    docs: {
      description: {
        story: '정상 범위의 진단 결과 해석. 긍정적인 메시지와 유지 관리 권장사항을 제공합니다.',
      },
    },
  },
};

/**
 * MID 심각도 해석
 */
export const ModerateUrgency: Story = {
  args: {
    interpretation: midInterpretation,
  },
  parameters: {
    docs: {
      description: {
        story: '중등도 우울 증상 해석. 전문가 상담 권장과 구체적인 대처 방법을 안내합니다.',
      },
    },
  },
};

/**
 * HIGH 심각도 해석
 */
export const HighUrgency: Story = {
  args: {
    interpretation: highInterpretation,
  },
  parameters: {
    docs: {
      description: {
        story: '심각한 심리적 고통 해석. 즉시 전문의 도움이 필요함을 강조하고 긴급 연락처를 제공합니다.',
      },
    },
  },
};

/**
 * 권장사항 없음
 */
export const NoRecommendations: Story = {
  args: {
    interpretation: {
      title: '결과 분석 중',
      description: '진단 결과를 분석하고 있습니다. 잠시 후 상세한 해석이 제공될 예정입니다.',
      recommendations: [],
      urgency: 'low',
    },
  },
  parameters: {
    docs: {
      description: {
        story: '권장사항이 없는 경우. 권장사항 섹션이 표시되지 않습니다.',
      },
    },
  },
};

/**
 * 긴 제목 및 설명
 */
export const LongContent: Story = {
  args: {
    interpretation: {
      title: '복합적인 정신건강 상태에 대한 종합 분석 결과 및 향후 관리 방향 제시',
      description:
        '진단 결과 여러 가지 정신건강 관련 증상이 복합적으로 나타나고 있습니다. ' +
        '우울감, 불안, 스트레스가 동시에 작용하여 일상생활에 어려움을 겪고 있을 수 있습니다. ' +
        '이러한 증상은 단순히 일시적인 기분 변화가 아니라 체계적인 관리가 필요한 상태입니다. ' +
        '전문가와의 상담을 통해 증상의 원인을 파악하고 개인에게 맞는 치료 계획을 수립하는 것이 중요합니다.',
      recommendations: [
        '종합적인 정신건강 검진을 통해 정확한 진단 받기',
        '정신건강의학과 전문의와 정기적인 상담 일정 잡기',
        '약물치료와 심리치료의 병행 치료 고려하기',
        '가족 및 주변 지지체계의 이해와 협조 구하기',
        '생활 습관 개선 (규칙적인 수면, 건강한 식습관, 적절한 운동)',
        '스트레스 관리 기법 (명상, 요가, 취미 활동) 실천하기',
      ],
      urgency: 'moderate',
    },
  },
  parameters: {
    docs: {
      description: {
        story: '긴 제목과 상세한 설명, 많은 권장사항이 있는 경우의 레이아웃',
      },
    },
  },
};

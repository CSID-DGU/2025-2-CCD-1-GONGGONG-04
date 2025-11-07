/**
 * ScoreSection Storybook Stories
 * Sprint 3 - Task 3.2.4
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ScoreSection } from './ScoreSection';

const meta = {
  title: 'Assessment/ScoreSection',
  component: ScoreSection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    totalScore: {
      control: { type: 'number', min: 0, max: 40, step: 1 },
      description: '진단 총점',
    },
    severityCode: {
      control: { type: 'select' },
      options: ['LOW', 'MID', 'HIGH'],
      description: '심각도 코드',
    },
    maxScore: {
      control: { type: 'number', min: 10, max: 100, step: 10 },
      description: '최대 점수 (기본: 40)',
    },
  },
} satisfies Meta<typeof ScoreSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * LOW 심각도 (정상 범위)
 * 점수: 10-15점
 * 색상: 초록색
 */
export const LowSeverity: Story = {
  args: {
    totalScore: 12,
    severityCode: 'LOW',
    maxScore: 40,
  },
  parameters: {
    docs: {
      description: {
        story: '정신건강이 비교적 양호한 상태입니다. 초록색 배지와 긍정적인 메시지를 표시합니다.',
      },
    },
  },
};

/**
 * MID 심각도 (중간 정도 고통)
 * 점수: 16-29점
 * 색상: 노란색
 */
export const MidSeverity: Story = {
  args: {
    totalScore: 22,
    severityCode: 'MID',
    maxScore: 40,
  },
  parameters: {
    docs: {
      description: {
        story: '중간 정도의 정신적 고통을 겪고 있습니다. 노란색 배지와 전문가 상담 권장 메시지를 표시합니다.',
      },
    },
  },
};

/**
 * HIGH 심각도 (심각한 고통)
 * 점수: 30-40점
 * 색상: 빨간색
 */
export const HighSeverity: Story = {
  args: {
    totalScore: 35,
    severityCode: 'HIGH',
    maxScore: 40,
  },
  parameters: {
    docs: {
      description: {
        story: '심각한 정신적 고통을 겪고 있습니다. 빨간색 배지와 긴급 도움 필요 메시지를 표시합니다.',
      },
    },
  },
};

/**
 * 최저 점수 (0점)
 */
export const MinimumScore: Story = {
  args: {
    totalScore: 0,
    severityCode: 'LOW',
    maxScore: 40,
  },
  parameters: {
    docs: {
      description: {
        story: '최저 점수 0점인 경우의 표시',
      },
    },
  },
};

/**
 * 최고 점수 (40점)
 */
export const MaximumScore: Story = {
  args: {
    totalScore: 40,
    severityCode: 'HIGH',
    maxScore: 40,
  },
  parameters: {
    docs: {
      description: {
        story: '최고 점수 40점인 경우의 표시 (100% 진행률)',
      },
    },
  },
};

/**
 * 커스텀 최대 점수 (100점 만점)
 */
export const CustomMaxScore: Story = {
  args: {
    totalScore: 75,
    severityCode: 'HIGH',
    maxScore: 100,
  },
  parameters: {
    docs: {
      description: {
        story: '최대 점수를 100점으로 설정한 경우',
      },
    },
  },
};

/**
 * 경계값 - LOW/MID 경계 (15점)
 */
export const BoundaryLowMid: Story = {
  args: {
    totalScore: 15,
    severityCode: 'LOW',
    maxScore: 40,
  },
  parameters: {
    docs: {
      description: {
        story: 'LOW와 MID의 경계값 (K-10 기준 15점)',
      },
    },
  },
};

/**
 * 경계값 - MID/HIGH 경계 (30점)
 */
export const BoundaryMidHigh: Story = {
  args: {
    totalScore: 30,
    severityCode: 'HIGH',
    maxScore: 40,
  },
  parameters: {
    docs: {
      description: {
        story: 'MID와 HIGH의 경계값 (K-10 기준 30점)',
      },
    },
  },
};

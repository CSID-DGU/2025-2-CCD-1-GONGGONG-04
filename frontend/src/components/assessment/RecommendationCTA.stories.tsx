/**
 * RecommendationCTA Storybook Stories
 * Sprint 3 - Task 3.2.4
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RecommendationCTA } from './RecommendationCTA';

const meta = {
  title: 'Assessment/RecommendationCTA',
  component: RecommendationCTA,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    assessmentId: {
      control: { type: 'number' },
      description: '진단 ID',
    },
    severityCode: {
      control: { type: 'select' },
      options: ['LOW', 'MID', 'HIGH'],
      description: '심각도 코드',
    },
  },
} satisfies Meta<typeof RecommendationCTA>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 CTA
 */
export const Default: Story = {
  args: {
    assessmentId: 123,
    severityCode: 'MID',
  },
  parameters: {
    docs: {
      description: {
        story: '진단 결과 기반 센터 추천 CTA. lavender 그라디언트 배경에 흰색 텍스트와 버튼이 표시됩니다.',
      },
    },
  },
};

/**
 * LOW 심각도
 */
export const LowSeverity: Story = {
  args: {
    assessmentId: 456,
    severityCode: 'LOW',
  },
  parameters: {
    docs: {
      description: {
        story: 'LOW 심각도에서의 추천 CTA',
      },
    },
  },
};

/**
 * HIGH 심각도
 */
export const HighSeverity: Story = {
  args: {
    assessmentId: 789,
    severityCode: 'HIGH',
  },
  parameters: {
    docs: {
      description: {
        story: 'HIGH 심각도에서의 추천 CTA. 긴급한 상황이지만 센터 추천은 여전히 유용합니다.',
      },
    },
  },
};

/**
 * 모바일 뷰
 */
export const Mobile: Story = {
  args: {
    assessmentId: 123,
    severityCode: 'MID',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '모바일 화면에서의 CTA 표시. 버튼이 전체 너비로 확장됩니다.',
      },
    },
  },
};

/**
 * 태블릿 뷰
 */
export const Tablet: Story = {
  args: {
    assessmentId: 123,
    severityCode: 'MID',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: '태블릿 화면에서의 CTA 표시',
      },
    },
  },
};

/**
 * AssessmentHeader Storybook Stories
 * Sprint 3 - Task 3.2.3
 */

import type { Meta, StoryObj } from '@storybook/react';
import { AssessmentHeader } from './AssessmentHeader';

const meta = {
  title: 'Assessment/AssessmentHeader',
  component: AssessmentHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AssessmentHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 상태
 */
export const Default: Story = {
  args: {
    templateName: '정신건강 자가진단 (K-10)',
    description: '최근 한 달 동안의 정신건강 상태를 확인하는 자가진단입니다',
    estimatedMinutes: 5,
  },
};

/**
 * 예상 시간 없음
 */
export const WithoutEstimatedTime: Story = {
  args: {
    templateName: '정신건강 자가진단 (K-10)',
    description: '최근 한 달 동안의 정신건강 상태를 확인하는 자가진단입니다',
  },
};

/**
 * 긴 설명
 */
export const WithLongDescription: Story = {
  args: {
    templateName: '정신건강 자가진단 (K-10)',
    description:
      '이 자가진단은 최근 한 달 동안 경험한 정신건강 상태를 확인하는 도구입니다. 10개의 질문으로 구성되어 있으며, 각 질문에 대해 솔직하게 답변해주시면 현재 상태를 파악하는 데 도움이 됩니다. 전문가의 진단을 대체할 수는 없지만, 전문적인 도움이 필요한지 판단하는 유용한 지표가 될 수 있습니다.',
    estimatedMinutes: 10,
  },
};

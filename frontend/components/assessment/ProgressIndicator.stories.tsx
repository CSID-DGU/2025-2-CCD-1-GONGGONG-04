/**
 * ProgressIndicator Storybook Stories
 * Sprint 3 - Task 3.2.3
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProgressIndicator } from './ProgressIndicator';

const meta = {
  title: 'Assessment/ProgressIndicator',
  component: ProgressIndicator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 시작 (0%)
 */
export const Start: Story = {
  args: {
    currentStep: 1,
    totalSteps: 10,
  },
};

/**
 * 30% 진행
 */
export const ThirtyPercent: Story = {
  args: {
    currentStep: 3,
    totalSteps: 10,
  },
};

/**
 * 50% 진행
 */
export const FiftyPercent: Story = {
  args: {
    currentStep: 5,
    totalSteps: 10,
  },
};

/**
 * 80% 진행
 */
export const EightyPercent: Story = {
  args: {
    currentStep: 8,
    totalSteps: 10,
  },
};

/**
 * 완료 (100%)
 */
export const Complete: Story = {
  args: {
    currentStep: 10,
    totalSteps: 10,
  },
};

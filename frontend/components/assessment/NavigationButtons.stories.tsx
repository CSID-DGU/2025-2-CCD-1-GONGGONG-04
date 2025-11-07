/**
 * NavigationButtons Storybook Stories
 * Sprint 3 - Task 3.2.3
 */

import type { Meta, StoryObj } from '@storybook/react';
import { NavigationButtons } from './NavigationButtons';

const meta = {
  title: 'Assessment/NavigationButtons',
  component: NavigationButtons,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 첫 질문 (이전 버튼 비활성화)
 */
export const FirstQuestion: Story = {
  args: {
    canGoPrevious: false,
    canGoNext: false,
    isLastStep: false,
    isSubmitting: false,
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onSubmit: () => console.log('Submit clicked'),
  },
};

/**
 * 중간 질문 (답변 선택 전)
 */
export const MiddleQuestionNotAnswered: Story = {
  args: {
    canGoPrevious: true,
    canGoNext: false,
    isLastStep: false,
    isSubmitting: false,
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onSubmit: () => console.log('Submit clicked'),
  },
};

/**
 * 중간 질문 (답변 선택 후)
 */
export const MiddleQuestionAnswered: Story = {
  args: {
    canGoPrevious: true,
    canGoNext: true,
    isLastStep: false,
    isSubmitting: false,
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onSubmit: () => console.log('Submit clicked'),
  },
};

/**
 * 마지막 질문 (답변 선택 전)
 */
export const LastQuestionNotAnswered: Story = {
  args: {
    canGoPrevious: true,
    canGoNext: false,
    isLastStep: true,
    isSubmitting: false,
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onSubmit: () => console.log('Submit clicked'),
  },
};

/**
 * 마지막 질문 (제출 가능)
 */
export const LastQuestionReadyToSubmit: Story = {
  args: {
    canGoPrevious: true,
    canGoNext: true,
    isLastStep: true,
    isSubmitting: false,
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onSubmit: () => console.log('Submit clicked'),
  },
};

/**
 * 제출 중
 */
export const Submitting: Story = {
  args: {
    canGoPrevious: true,
    canGoNext: true,
    isLastStep: true,
    isSubmitting: true,
    onPrevious: () => console.log('Previous clicked'),
    onNext: () => console.log('Next clicked'),
    onSubmit: () => console.log('Submit clicked'),
  },
};

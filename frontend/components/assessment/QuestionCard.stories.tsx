/**
 * QuestionCard Storybook Stories
 * Sprint 3 - Task 3.2.3
 */

import type { Meta, StoryObj } from '@storybook/react';
import { QuestionCard } from './QuestionCard';

const meta = {
  title: 'Assessment/QuestionCard',
  component: QuestionCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QuestionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockOptions = [
  { optionNumber: 1, optionText: '전혀 없음', score: 0 },
  { optionNumber: 2, optionText: '가끔', score: 1 },
  { optionNumber: 3, optionText: '자주', score: 2 },
  { optionNumber: 4, optionText: '항상', score: 3 },
];

/**
 * 선택 안 함
 */
export const Unselected: Story = {
  args: {
    questionNumber: 1,
    questionText: '최근 한 달 동안 얼마나 자주 불안을 느꼈습니까?',
    options: mockOptions,
    selectedOption: undefined,
    onSelectOption: (option) => console.log('Selected:', option),
  },
};

/**
 * 옵션 1 선택
 */
export const Option1Selected: Story = {
  args: {
    questionNumber: 1,
    questionText: '최근 한 달 동안 얼마나 자주 불안을 느꼈습니까?',
    options: mockOptions,
    selectedOption: 1,
    onSelectOption: (option) => console.log('Selected:', option),
  },
};

/**
 * 옵션 2 선택
 */
export const Option2Selected: Story = {
  args: {
    questionNumber: 1,
    questionText: '최근 한 달 동안 얼마나 자주 불안을 느꼈습니까?',
    options: mockOptions,
    selectedOption: 2,
    onSelectOption: (option) => console.log('Selected:', option),
  },
};

/**
 * 긴 질문
 */
export const WithLongQuestion: Story = {
  args: {
    questionNumber: 5,
    questionText:
      '최근 한 달 동안 귀하는 일상생활에서 업무나 가사, 학업 등을 수행하는 데 있어서 신체적 또는 정신적인 어려움으로 인해 평소보다 능률이 떨어지거나 활동량이 줄어든 적이 얼마나 자주 있었습니까?',
    options: mockOptions,
    selectedOption: undefined,
    onSelectOption: (option) => console.log('Selected:', option),
  },
};

/**
 * 5개 옵션
 */
export const WithFiveOptions: Story = {
  args: {
    questionNumber: 3,
    questionText: '최근 한 달 동안 얼마나 자주 스트레스를 느꼈습니까?',
    options: [
      { optionNumber: 1, optionText: '전혀 없음', score: 0 },
      { optionNumber: 2, optionText: '거의 없음', score: 1 },
      { optionNumber: 3, optionText: '가끔', score: 2 },
      { optionNumber: 4, optionText: '자주', score: 3 },
      { optionNumber: 5, optionText: '항상', score: 4 },
    ],
    selectedOption: undefined,
    onSelectOption: (option) => console.log('Selected:', option),
  },
};

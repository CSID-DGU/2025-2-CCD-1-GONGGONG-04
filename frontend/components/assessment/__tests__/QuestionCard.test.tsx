/**
 * QuestionCard Component Tests
 * Sprint 3 - Task 3.2.3
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../QuestionCard';

describe('QuestionCard', () => {
  const mockOptions = [
    { optionNumber: 1, optionText: '전혀 없음', score: 0 },
    { optionNumber: 2, optionText: '가끔', score: 1 },
    { optionNumber: 3, optionText: '자주', score: 2 },
    { optionNumber: 4, optionText: '항상', score: 3 },
  ];

  const mockProps = {
    questionNumber: 1,
    questionText: '최근 한 달 동안 얼마나 자주 불안을 느꼈습니까?',
    options: mockOptions,
    selectedOption: undefined,
    onSelectOption: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders question number badge correctly', () => {
    render(<QuestionCard {...mockProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders question text correctly', () => {
    render(<QuestionCard {...mockProps} />);
    expect(screen.getByText(mockProps.questionText)).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<QuestionCard {...mockProps} />);
    mockOptions.forEach((option) => {
      expect(screen.getByText(option.optionText)).toBeInTheDocument();
    });
  });

  it('calls onSelectOption when an option is clicked', () => {
    render(<QuestionCard {...mockProps} />);

    const option2 = screen.getByLabelText('가끔');
    fireEvent.click(option2);

    expect(mockProps.onSelectOption).toHaveBeenCalledWith(2);
  });

  it('highlights selected option', () => {
    const propsWithSelection = {
      ...mockProps,
      selectedOption: 2,
    };

    const { container } = render(<QuestionCard {...propsWithSelection} />);

    // Find the div containing option 2
    const selectedOptionDiv = container.querySelector('[class*="bg-lavender-50"]');
    expect(selectedOptionDiv).toBeInTheDocument();
  });

  it('does not highlight unselected options', () => {
    const propsWithSelection = {
      ...mockProps,
      selectedOption: 2,
    };

    render(<QuestionCard {...propsWithSelection} />);

    // Option 1 should not have lavender background
    const option1Label = screen.getByLabelText('전혀 없음');
    const option1Container = option1Label.closest('div');
    expect(option1Container).not.toHaveClass('bg-lavender-50');
  });

  it('has correct ARIA attributes', () => {
    render(<QuestionCard {...mockProps} />);

    // RadioGroup should have aria-label
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveAttribute('aria-label', '질문 1 답변 선택');
  });

  it('each option has unique id and matches label htmlFor', () => {
    render(<QuestionCard {...mockProps} />);

    mockOptions.forEach((option) => {
      const expectedId = `question-${mockProps.questionNumber}-option-${option.optionNumber}`;
      const radioInput = document.getElementById(expectedId);
      expect(radioInput).toBeInTheDocument();
    });
  });

  it('all options are minimum 44px height for touch targets', () => {
    const { container } = render(<QuestionCard {...mockProps} />);

    // Find all option containers
    const optionContainers = container.querySelectorAll('[class*="min-h-\\[44px\\]"]');
    expect(optionContainers.length).toBe(mockOptions.length);
  });
});

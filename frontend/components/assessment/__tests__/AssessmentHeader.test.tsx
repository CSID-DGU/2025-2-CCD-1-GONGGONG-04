/**
 * AssessmentHeader Component Tests
 * Sprint 3 - Task 3.2.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AssessmentHeader } from '../AssessmentHeader';

describe('AssessmentHeader', () => {
  const mockProps = {
    templateName: '정신건강 자가진단 (K-10)',
    description: '최근 한 달 동안의 정신건강 상태를 확인하는 자가진단입니다',
    estimatedMinutes: 5,
  };

  it('renders template name correctly', () => {
    render(<AssessmentHeader {...mockProps} />);
    expect(screen.getByText(mockProps.templateName)).toBeInTheDocument();
  });

  it('renders description correctly', () => {
    render(<AssessmentHeader {...mockProps} />);
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
  });

  it('renders estimated time when provided', () => {
    render(<AssessmentHeader {...mockProps} />);
    expect(
      screen.getByText(/예상 소요 시간: 약 5분/i)
    ).toBeInTheDocument();
  });

  it('does not render estimated time when not provided', () => {
    const { estimatedMinutes, ...propsWithoutTime} = mockProps;
    render(<AssessmentHeader {...propsWithoutTime} />);
    expect(
      screen.queryByText(/예상 소요 시간/i)
    ).not.toBeInTheDocument();
  });

  it('uses correct typography classes', () => {
    const { container } = render(<AssessmentHeader {...mockProps} />);

    // H1 should have text-h1 class
    const heading = screen.getByText(mockProps.templateName);
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveClass('text-h1');
  });

  it('renders clock icon when estimated time is provided', () => {
    const { container } = render(<AssessmentHeader {...mockProps} />);

    // Clock icon should be present (lucide-react Clock component)
    const clockIcon = container.querySelector('svg[class*="lucide-clock"]');
    expect(clockIcon).toBeInTheDocument();
  });
});

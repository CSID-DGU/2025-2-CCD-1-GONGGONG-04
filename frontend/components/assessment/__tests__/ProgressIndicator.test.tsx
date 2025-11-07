/**
 * ProgressIndicator Component Tests
 * Sprint 3 - Task 3.2.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressIndicator } from '../ProgressIndicator';

describe('ProgressIndicator', () => {
  it('renders current step and total steps correctly', () => {
    render(<ProgressIndicator currentStep={3} totalSteps={10} />);
    expect(screen.getByText('질문 3/10')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    render(<ProgressIndicator currentStep={3} totalSteps={10} />);
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('renders 0% when currentStep is 0', () => {
    render(<ProgressIndicator currentStep={0} totalSteps={10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders 100% when currentStep equals totalSteps', () => {
    render(<ProgressIndicator currentStep={10} totalSteps={10} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders 0% when totalSteps is 0 (edge case)', () => {
    render(<ProgressIndicator currentStep={0} totalSteps={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('has correct ARIA attributes for accessibility', () => {
    render(<ProgressIndicator currentStep={3} totalSteps={10} />);

    // Progress element should have aria-label
    const progressElement = screen.getByLabelText('진행률 30%');
    expect(progressElement).toBeInTheDocument();

    // Should have aria-valuenow, aria-valuemin, aria-valuemax
    expect(progressElement).toHaveAttribute('aria-valuenow', '30');
    expect(progressElement).toHaveAttribute('aria-valuemin', '0');
    expect(progressElement).toHaveAttribute('aria-valuemax', '100');
  });

  it('rounds percentage to nearest integer', () => {
    render(<ProgressIndicator currentStep={1} totalSteps={3} />);
    // 1/3 = 33.33... should round to 33
    expect(screen.getByText('33%')).toBeInTheDocument();
  });
});

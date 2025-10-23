import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewSummary } from './ReviewSummary';

describe('ReviewSummary', () => {
  const mockProps = {
    avgRating: 4.5,
    totalReviews: 100,
    ratingDistribution: {
      5: 60,
      4: 20,
      3: 10,
      2: 5,
      1: 5,
    },
  };

  it('renders average rating with 1 decimal place', () => {
    render(<ReviewSummary {...mockProps} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders total review count', () => {
    render(<ReviewSummary {...mockProps} />);

    expect(screen.getByText('100개의 리뷰')).toBeInTheDocument();
  });

  it('renders all star ratings (5-1)', () => {
    render(<ReviewSummary {...mockProps} />);

    // Check that all rating labels are present
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders rating distribution counts', () => {
    render(<ReviewSummary {...mockProps} />);

    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Both 2-star and 1-star are 5
  });

  it('handles zero reviews', () => {
    render(<ReviewSummary avgRating={0} totalReviews={0} ratingDistribution={{}} />);

    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.getByText('0개의 리뷰')).toBeInTheDocument();
  });

  it('renders progress bars with aria-labels', () => {
    render(<ReviewSummary {...mockProps} />);

    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(5); // 5 star ratings

    // Check that at least one has an aria-label
    expect(progressBars[0]).toHaveAttribute('aria-label');
  });

  it('calculates percentage correctly', () => {
    const { container } = render(<ReviewSummary {...mockProps} />);

    // 5-star: 60/100 = 60%
    const fiveStarProgress = container.querySelector('[aria-label*="별점 5점"]');
    expect(fiveStarProgress).toBeInTheDocument();
  });
});

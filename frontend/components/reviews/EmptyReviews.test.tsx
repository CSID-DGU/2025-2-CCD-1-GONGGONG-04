import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyReviews } from './EmptyReviews';

describe('EmptyReviews', () => {
  it('renders empty state message', () => {
    render(<EmptyReviews />);

    expect(screen.getByText('아직 리뷰가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 리뷰를 작성해보세요')).toBeInTheDocument();
  });

  it('renders icon with aria-label', () => {
    render(<EmptyReviews />);

    const icon = screen.getByRole('img', { name: '리뷰 없음' });
    expect(icon).toBeInTheDocument();
  });

  it('uses correct typography classes', () => {
    const { container } = render(<EmptyReviews />);

    const title = screen.getByText('아직 리뷰가 없습니다');
    const subtitle = screen.getByText('첫 번째 리뷰를 작성해보세요');

    expect(title).toHaveClass('text-h3');
    expect(subtitle).toHaveClass('text-body');
  });
});

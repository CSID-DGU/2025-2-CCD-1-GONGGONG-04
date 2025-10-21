import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CenterHeader, CenterHeaderProps } from '../CenterHeader';

describe('CenterHeader', () => {
  const defaultProps: CenterHeaderProps = {
    centerName: '서울시립 청소년 상담복지센터',
    centerType: '청소년상담복지센터',
    avgRating: 4.5,
    reviewCount: 42,
    onShare: vi.fn(),
    onFavorite: vi.fn(),
    isFavorited: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render center name correctly', () => {
      render(<CenterHeader {...defaultProps} />);
      expect(
        screen.getByText('서울시립 청소년 상담복지센터')
      ).toBeInTheDocument();
    });

    it('should render center type as badge', () => {
      render(<CenterHeader {...defaultProps} />);
      expect(screen.getByText('청소년상담복지센터')).toBeInTheDocument();
    });

    it('should display rating with 1 decimal place', () => {
      render(<CenterHeader {...defaultProps} />);
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('should format rating to 1 decimal place when integer', () => {
      render(<CenterHeader {...defaultProps} avgRating={4} />);
      expect(screen.getByText('4.0')).toBeInTheDocument();
    });

    it('should display review count with comma formatting', () => {
      render(<CenterHeader {...defaultProps} reviewCount={1234} />);
      expect(screen.getByText(/1,234개 리뷰/)).toBeInTheDocument();
    });

    it('should display review count for single review', () => {
      render(<CenterHeader {...defaultProps} reviewCount={1} />);
      expect(screen.getByText(/1개 리뷰/)).toBeInTheDocument();
    });
  });

  describe('No Reviews State', () => {
    it('should show "아직 리뷰가 없습니다" when reviewCount is 0', () => {
      render(<CenterHeader {...defaultProps} reviewCount={0} />);
      expect(screen.getByText('아직 리뷰가 없습니다')).toBeInTheDocument();
    });

    it('should not display rating when reviewCount is 0', () => {
      render(<CenterHeader {...defaultProps} reviewCount={0} />);
      expect(screen.queryByText('4.5')).not.toBeInTheDocument();
    });

    it('should not display star icon when reviewCount is 0', () => {
      const { container } = render(
        <CenterHeader {...defaultProps} reviewCount={0} />
      );
      const starIcon = container.querySelector('.fill-yellow-400');
      expect(starIcon).not.toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onShare when share button is clicked', () => {
      const onShare = vi.fn();
      render(<CenterHeader {...defaultProps} onShare={onShare} />);

      const shareButton = screen.getByRole('button', { name: '공유하기' });
      fireEvent.click(shareButton);

      expect(onShare).toHaveBeenCalledTimes(1);
    });

    it('should call onFavorite when favorite button is clicked', () => {
      const onFavorite = vi.fn();
      render(<CenterHeader {...defaultProps} onFavorite={onFavorite} />);

      const favoriteButton = screen.getByRole('button', {
        name: '즐겨찾기 추가',
      });
      fireEvent.click(favoriteButton);

      expect(onFavorite).toHaveBeenCalledTimes(1);
    });

    it('should work without onShare callback', () => {
      render(<CenterHeader {...defaultProps} onShare={undefined} />);

      const shareButton = screen.getByRole('button', { name: '공유하기' });
      expect(() => fireEvent.click(shareButton)).not.toThrow();
    });

    it('should work without onFavorite callback', () => {
      render(<CenterHeader {...defaultProps} onFavorite={undefined} />);

      const favoriteButton = screen.getByRole('button', {
        name: '즐겨찾기 추가',
      });
      expect(() => fireEvent.click(favoriteButton)).not.toThrow();
    });
  });

  describe('Favorite State', () => {
    it('should show "즐겨찾기 해제" label when isFavorited is true', () => {
      render(<CenterHeader {...defaultProps} isFavorited={true} />);

      const favoriteButton = screen.getByRole('button', {
        name: '즐겨찾기 해제',
      });
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should show filled heart icon when isFavorited is true', () => {
      const { container } = render(
        <CenterHeader {...defaultProps} isFavorited={true} />
      );

      const heartIcon = container.querySelector(
        '.fill-lavender-500.text-lavender-500'
      );
      expect(heartIcon).toBeInTheDocument();
    });

    it('should show unfilled heart icon when isFavorited is false', () => {
      const { container } = render(
        <CenterHeader {...defaultProps} isFavorited={false} />
      );

      const heartIcon = container.querySelector('.text-neutral-400');
      expect(heartIcon).toBeInTheDocument();
    });

    it('should default to isFavorited false when not provided', () => {
      const { isFavorited, ...propsWithoutFavorited } = defaultProps;
      render(<CenterHeader {...propsWithoutFavorited} />);

      const favoriteButton = screen.getByRole('button', {
        name: '즐겨찾기 추가',
      });
      expect(favoriteButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label for share button', () => {
      render(<CenterHeader {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: '공유하기' });
      expect(shareButton).toHaveAttribute('aria-label', '공유하기');
    });

    it('should have proper ARIA label for favorite button when not favorited', () => {
      render(<CenterHeader {...defaultProps} isFavorited={false} />);

      const favoriteButton = screen.getByRole('button', {
        name: '즐겨찾기 추가',
      });
      expect(favoriteButton).toHaveAttribute('aria-label', '즐겨찾기 추가');
    });

    it('should have proper ARIA label for favorite button when favorited', () => {
      render(<CenterHeader {...defaultProps} isFavorited={true} />);

      const favoriteButton = screen.getByRole('button', {
        name: '즐겨찾기 해제',
      });
      expect(favoriteButton).toHaveAttribute('aria-label', '즐겨찾기 해제');
    });

    it('should have aria-hidden on decorative icons', () => {
      const { container } = render(<CenterHeader {...defaultProps} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation on share button', async () => {
      const user = userEvent.setup();
      render(<CenterHeader {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: '공유하기' });
      await user.tab();
      await user.tab();
      await user.tab();

      expect(document.activeElement?.getAttribute('aria-label')).toBe(
        '공유하기'
      );
    });

    it('should have focus-visible styles on buttons', () => {
      render(<CenterHeader {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: '공유하기' });
      expect(shareButton).toHaveClass('focus-ring');
    });
  });
});

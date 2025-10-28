/**
 * StarRating Component Tests
 *
 * Sprint 4: Review and Rating System
 * Unit tests for StarRating component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  describe('Rendering', () => {
    it('renders 5 star buttons', () => {
      render(<StarRating rating={3} />);
      const buttons = screen.getAllByRole('radio');
      expect(buttons).toHaveLength(5);
    });

    it('fills correct number of stars based on rating', () => {
      render(<StarRating rating={3} readonly />);
      const container = screen.getByRole('img');
      const stars = container.querySelectorAll('svg');

      // First 3 stars should be filled (yellow), last 2 should be empty (gray)
      stars.forEach((star, index) => {
        if (index < 3) {
          expect(star).toHaveClass('fill-yellow-400');
        } else {
          expect(star).toHaveClass('fill-neutral-300');
        }
      });
    });

    it('renders with correct size classes', () => {
      const { rerender } = render(<StarRating rating={3} size="sm" readonly />);
      let stars = screen.getByRole('img').querySelectorAll('svg');
      expect(stars[0]).toHaveClass('h-4 w-4');

      rerender(<StarRating rating={3} size="md" readonly />);
      stars = screen.getByRole('img').querySelectorAll('svg');
      expect(stars[0]).toHaveClass('h-5 w-5');

      rerender(<StarRating rating={3} size="lg" readonly />);
      stars = screen.getByRole('img').querySelectorAll('svg');
      expect(stars[0]).toHaveClass('h-6 w-6');
    });
  });

  describe('Hover Interaction', () => {
    it('shows preview rating on hover', () => {
      render(<StarRating rating={2} onRatingChange={vi.fn()} />);
      const buttons = screen.getAllByRole('radio');

      // Hover over 4th star
      fireEvent.mouseEnter(buttons[3]);

      const container = screen.getByRole('radiogroup');
      const stars = container.querySelectorAll('svg');

      // First 4 stars should be filled
      expect(stars[0]).toHaveClass('fill-yellow-400');
      expect(stars[1]).toHaveClass('fill-yellow-400');
      expect(stars[2]).toHaveClass('fill-yellow-400');
      expect(stars[3]).toHaveClass('fill-yellow-400');
      expect(stars[4]).toHaveClass('fill-neutral-300');
    });

    it('returns to original rating when mouse leaves', () => {
      render(<StarRating rating={2} onRatingChange={vi.fn()} />);
      const container = screen.getByRole('radiogroup');
      const buttons = screen.getAllByRole('radio');

      // Hover over 4th star
      fireEvent.mouseEnter(buttons[3]);

      // Mouse leave container
      fireEvent.mouseLeave(container);

      const stars = container.querySelectorAll('svg');

      // Should return to original rating (2 stars)
      expect(stars[0]).toHaveClass('fill-yellow-400');
      expect(stars[1]).toHaveClass('fill-yellow-400');
      expect(stars[2]).toHaveClass('fill-neutral-300');
    });
  });

  describe('Click Interaction', () => {
    it('calls onRatingChange when star is clicked', () => {
      const handleRatingChange = vi.fn();
      render(<StarRating rating={0} onRatingChange={handleRatingChange} />);

      const buttons = screen.getAllByRole('radio');

      // Click 3rd star
      fireEvent.click(buttons[2]);

      expect(handleRatingChange).toHaveBeenCalledWith(3);
    });

    it('allows changing rating multiple times', () => {
      const handleRatingChange = vi.fn();
      render(<StarRating rating={2} onRatingChange={handleRatingChange} />);

      const buttons = screen.getAllByRole('radio');

      // Click 5th star
      fireEvent.click(buttons[4]);
      expect(handleRatingChange).toHaveBeenCalledWith(5);

      // Click 1st star
      fireEvent.click(buttons[0]);
      expect(handleRatingChange).toHaveBeenCalledWith(1);

      expect(handleRatingChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Readonly Mode', () => {
    it('does not respond to clicks when readonly', () => {
      const handleRatingChange = vi.fn();
      render(<StarRating rating={3} onRatingChange={handleRatingChange} readonly />);

      const buttons = screen.queryAllByRole('radio');
      expect(buttons).toHaveLength(0); // No radio buttons in readonly mode

      const container = screen.getByRole('img');
      const firstStar = container.querySelector('button');

      if (firstStar) {
        fireEvent.click(firstStar);
        expect(handleRatingChange).not.toHaveBeenCalled();
      }
    });

    it('does not respond to hover when readonly', () => {
      render(<StarRating rating={2} readonly />);
      const container = screen.getByRole('img');
      const stars = container.querySelectorAll('button');

      // Try to hover over 4th star
      fireEvent.mouseEnter(stars[3]);

      const svgs = container.querySelectorAll('svg');

      // Should still show original rating (2 stars)
      expect(svgs[0]).toHaveClass('fill-yellow-400');
      expect(svgs[1]).toHaveClass('fill-yellow-400');
      expect(svgs[2]).toHaveClass('fill-neutral-300');
      expect(svgs[3]).toHaveClass('fill-neutral-300');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA labels in interactive mode', () => {
      render(<StarRating rating={3} onRatingChange={vi.fn()} />);

      const radioGroup = screen.getByRole('radiogroup', { name: '별점 선택' });
      expect(radioGroup).toBeInTheDocument();

      const buttons = screen.getAllByRole('radio');
      buttons.forEach((button, index) => {
        expect(button).toHaveAttribute('aria-label', `별점 ${index + 1}점`);
      });
    });

    it('has correct ARIA label in readonly mode', () => {
      render(<StarRating rating={4} readonly />);

      const img = screen.getByRole('img', { name: '별점 4점' });
      expect(img).toBeInTheDocument();
    });

    it('is keyboard accessible', () => {
      const handleRatingChange = vi.fn();
      render(<StarRating rating={0} onRatingChange={handleRatingChange} />);

      const buttons = screen.getAllByRole('radio');

      // Focus and click 3rd star using keyboard
      buttons[2].focus();
      expect(buttons[2]).toHaveFocus();

      fireEvent.click(buttons[2]);
      expect(handleRatingChange).toHaveBeenCalledWith(3);
    });
  });
});

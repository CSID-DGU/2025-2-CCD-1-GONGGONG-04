/**
 * RecommendationCTA Component Tests
 * Sprint 3 - Task 3.2.4
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecommendationCTA } from '../RecommendationCTA';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('RecommendationCTA', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe('Rendering', () => {
    it('renders CTA title', () => {
      render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      expect(screen.getByText('나에게 맞는 센터 추천받기')).toBeInTheDocument();
    });

    it('renders CTA description', () => {
      render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      expect(
        screen.getByText('진단 결과를 바탕으로 가장 적합한 정신건강복지센터를 추천해드립니다')
      ).toBeInTheDocument();
    });

    it('renders CTA button', () => {
      render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      const button = screen.getByRole('button', { name: /나에게 맞는 센터 추천 페이지로 이동/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to recommendation page on click', () => {
      render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/recommendations/from-assessment/123');
    });

    it('navigates with correct assessment ID', () => {
      render(<RecommendationCTA assessmentId={456} severityCode="HIGH" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/recommendations/from-assessment/456');
    });

    it('handles multiple clicks', () => {
      render(<RecommendationCTA assessmentId={789} severityCode="LOW" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledTimes(3);
    });
  });

  describe('Severity codes', () => {
    it('renders with LOW severity', () => {
      render(<RecommendationCTA assessmentId={123} severityCode="LOW" />);

      expect(screen.getByText('나에게 맞는 센터 추천받기')).toBeInTheDocument();
    });

    it('renders with MID severity', () => {
      render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      expect(screen.getByText('나에게 맞는 센터 추천받기')).toBeInTheDocument();
    });

    it('renders with HIGH severity', () => {
      render(<RecommendationCTA assessmentId={123} severityCode="HIGH" />);

      expect(screen.getByText('나에게 맞는 센터 추천받기')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has lavender gradient background', () => {
      const { container } = render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      const card = container.querySelector('.bg-gradient-to-r');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('from-lavender-400');
      expect(card).toHaveClass('to-lavender-600');
    });

    it('has white text', () => {
      const { container } = render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      const textContainer = container.querySelector('.text-white');
      expect(textContainer).toBeInTheDocument();
    });

    it('button has white background with lavender text', () => {
      const { container } = render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('text-lavender-600');
    });
  });

  describe('Accessibility', () => {
    it('button has descriptive aria-label', () => {
      render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      const button = screen.getByRole('button', {
        name: '나에게 맞는 센터 추천 페이지로 이동',
      });
      expect(button).toBeInTheDocument();
    });

    it('hides decorative icons from screen readers', () => {
      const { container } = render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });

    it('button is keyboard accessible', () => {
      render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Responsive design', () => {
    it('button has responsive width classes', () => {
      render(<RecommendationCTA assessmentId={123} severityCode="MID" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
      expect(button).toHaveClass('sm:w-auto');
    });
  });
});

/**
 * AssessmentSkeleton Component Tests
 * 자가진단 스켈레톤 로딩 UI 테스트
 *
 * Sprint 3 - Task 3.3.2
 */

import { render, screen } from '@testing-library/react';
import { AssessmentSkeleton } from '../AssessmentSkeleton';

describe('AssessmentSkeleton', () => {
  describe('렌더링', () => {
    it('should render skeleton UI with proper structure', () => {
      render(<AssessmentSkeleton />);

      // Container should have proper role and aria-label
      const container = screen.getByRole('status', { name: '자가진단 로딩 중' });
      expect(container).toBeInTheDocument();
    });

    it('should have screen reader announcement', () => {
      render(<AssessmentSkeleton />);

      // sr-only text for screen readers
      const srText = screen.getByText('자가진단 템플릿을 불러오는 중입니다...');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });

    it('should render all skeleton sections', () => {
      const { container } = render(<AssessmentSkeleton />);

      // Check that Skeleton components are rendered
      // Using class selector since Skeleton is a presentational component
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('접근성', () => {
    it('should have proper ARIA attributes', () => {
      render(<AssessmentSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', '자가진단 로딩 중');
    });

    it('should be accessible to screen readers', () => {
      render(<AssessmentSkeleton />);

      // Should have hidden text for screen readers
      const announcement = screen.getByText('자가진단 템플릿을 불러오는 중입니다...');
      expect(announcement).toHaveClass('sr-only');
    });
  });

  describe('구조', () => {
    it('should have proper layout structure', () => {
      const { container } = render(<AssessmentSkeleton />);

      // Should have container with proper classes
      const mainContainer = container.querySelector('.container.max-w-3xl.mx-auto');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should render header skeleton section', () => {
      const { container } = render(<AssessmentSkeleton />);

      // Header section should exist
      const headerSection = container.querySelector('.mb-8');
      expect(headerSection).toBeInTheDocument();
    });

    it('should render progress skeleton section', () => {
      const { container } = render(<AssessmentSkeleton />);

      // Progress section with proper spacing
      const progressSection = container.querySelector('.mb-6');
      expect(progressSection).toBeInTheDocument();
    });

    it('should render question card skeleton', () => {
      const { container } = render(<AssessmentSkeleton />);

      // Card component
      const card = container.querySelector('[class*="shadow"]');
      expect(card).toBeInTheDocument();
    });

    it('should render navigation buttons skeleton', () => {
      const { container } = render(<AssessmentSkeleton />);

      // Navigation section
      const navSection = container.querySelector('.flex.items-center.justify-between.gap-4.mt-6');
      expect(navSection).toBeInTheDocument();
    });
  });

  describe('스냅샷', () => {
    it('should match snapshot', () => {
      const { container } = render(<AssessmentSkeleton />);
      expect(container).toMatchSnapshot();
    });
  });
});

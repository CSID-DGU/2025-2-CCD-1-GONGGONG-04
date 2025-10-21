import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import {
  CenterDescription,
  CenterDescriptionProps,
} from '../CenterDescription';

describe('CenterDescription', () => {
  const defaultProps: CenterDescriptionProps = {
    businessContent:
      '우리 센터는 청소년들의 정신건강을 위해 전문적인 상담 서비스를 제공합니다.\n무료 상담 및 심리검사를 진행하고 있습니다.',
    viewCount: 1234,
    favoriteCount: 56,
  };

  describe('Rendering', () => {
    it('should render section title correctly', () => {
      render(<CenterDescription {...defaultProps} />);
      expect(screen.getByText('센터 소개')).toBeInTheDocument();
    });

    it('should render business content correctly', () => {
      render(<CenterDescription {...defaultProps} />);
      expect(
        screen.getByText(/우리 센터는 청소년들의 정신건강을 위해/)
      ).toBeInTheDocument();
    });

    it('should render multi-line content correctly', () => {
      render(<CenterDescription {...defaultProps} />);
      expect(
        screen.getByText(/무료 상담 및 심리검사를 진행하고 있습니다/)
      ).toBeInTheDocument();
    });

    it('should render view count with label', () => {
      render(<CenterDescription {...defaultProps} />);
      expect(screen.getByText(/조회 1,234/)).toBeInTheDocument();
    });

    it('should render favorite count with label', () => {
      render(<CenterDescription {...defaultProps} />);
      expect(screen.getByText(/즐겨찾기 56/)).toBeInTheDocument();
    });
  });

  describe('Null Content State', () => {
    it('should show empty state when businessContent is null', () => {
      render(<CenterDescription {...defaultProps} businessContent={null} />);
      expect(
        screen.getByText('센터 소개가 등록되지 않았습니다')
      ).toBeInTheDocument();
    });

    it('should show helpful message in empty state', () => {
      render(<CenterDescription {...defaultProps} businessContent={null} />);
      expect(
        screen.getByText('센터에 직접 문의하여 자세한 정보를 확인해주세요')
      ).toBeInTheDocument();
    });

    it('should not render business content when null', () => {
      render(<CenterDescription {...defaultProps} businessContent={null} />);
      expect(
        screen.queryByText(/우리 센터는 청소년들의 정신건강을 위해/)
      ).not.toBeInTheDocument();
    });

    it('should still show stats when content is null', () => {
      render(<CenterDescription {...defaultProps} businessContent={null} />);
      expect(screen.getByText(/조회 1,234/)).toBeInTheDocument();
      expect(screen.getByText(/즐겨찾기 56/)).toBeInTheDocument();
    });
  });

  describe('Number Formatting', () => {
    it('should format view count with commas for thousands', () => {
      render(<CenterDescription {...defaultProps} viewCount={12345} />);
      expect(screen.getByText(/조회 12,345/)).toBeInTheDocument();
    });

    it('should format favorite count with commas for thousands', () => {
      render(<CenterDescription {...defaultProps} favoriteCount={9876} />);
      expect(screen.getByText(/즐겨찾기 9,876/)).toBeInTheDocument();
    });

    it('should handle single digit counts correctly', () => {
      render(
        <CenterDescription {...defaultProps} viewCount={5} favoriteCount={3} />
      );
      expect(screen.getByText(/조회 5/)).toBeInTheDocument();
      expect(screen.getByText(/즐겨찾기 3/)).toBeInTheDocument();
    });

    it('should handle zero counts correctly', () => {
      render(
        <CenterDescription
          {...defaultProps}
          viewCount={0}
          favoriteCount={0}
        />
      );
      expect(screen.getByText(/조회 0/)).toBeInTheDocument();
      expect(screen.getByText(/즐겨찾기 0/)).toBeInTheDocument();
    });

    it('should format large numbers with multiple commas', () => {
      render(
        <CenterDescription
          {...defaultProps}
          viewCount={1234567}
          favoriteCount={123456}
        />
      );
      expect(screen.getByText(/조회 1,234,567/)).toBeInTheDocument();
      expect(screen.getByText(/즐겨찾기 123,456/)).toBeInTheDocument();
    });
  });

  describe('Whitespace Preservation', () => {
    it('should preserve line breaks in content with whitespace-pre-line', () => {
      const { container } = render(<CenterDescription {...defaultProps} />);

      const contentElement = container.querySelector('.whitespace-pre-line');
      expect(contentElement).toBeInTheDocument();
    });

    it('should render multi-line content with proper spacing', () => {
      const multiLineContent =
        '첫 번째 줄\n두 번째 줄\n세 번째 줄\n네 번째 줄';
      render(
        <CenterDescription {...defaultProps} businessContent={multiLineContent} />
      );

      expect(screen.getByText(multiLineContent)).toBeInTheDocument();
    });

    it('should handle content without line breaks', () => {
      const singleLineContent = '이것은 단일 줄 내용입니다.';
      render(
        <CenterDescription
          {...defaultProps}
          businessContent={singleLineContent}
        />
      );

      expect(screen.getByText(singleLineContent)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading for section', () => {
      render(<CenterDescription {...defaultProps} />);
      const heading = screen.getByText('센터 소개');
      expect(heading.tagName).toBe('H3');
    });

    it('should have screen reader text for icons', () => {
      render(<CenterDescription {...defaultProps} />);
      expect(screen.getByText('조회수')).toHaveClass('sr-only');
      expect(screen.getByText('즐겨찾기 수')).toHaveClass('sr-only');
    });

    it('should have aria-labels for stats', () => {
      render(<CenterDescription {...defaultProps} />);
      expect(screen.getByLabelText('조회수 1,234회')).toBeInTheDocument();
      expect(screen.getByLabelText('즐겨찾기 56개')).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative icons', () => {
      const { container } = render(<CenterDescription {...defaultProps} />);
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have proper text contrast for content', () => {
      const { container } = render(<CenterDescription {...defaultProps} />);
      const contentElement = container.querySelector('.text-neutral-700');
      expect(contentElement).toBeInTheDocument();
    });

    it('should have accessible empty state styling', () => {
      const { container } = render(
        <CenterDescription {...defaultProps} businessContent={null} />
      );
      const emptyStateText = container.querySelector('.text-neutral-500');
      expect(emptyStateText).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('should have divider between content and stats', () => {
      const { container } = render(<CenterDescription {...defaultProps} />);
      const divider = container.querySelector('.border-t');
      expect(divider).toBeInTheDocument();
    });

    it('should have vertical separator between stats', () => {
      const { container } = render(<CenterDescription {...defaultProps} />);
      const separator = container.querySelector('.bg-neutral-200');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });

    it('should use proper spacing classes', () => {
      const { container } = render(<CenterDescription {...defaultProps} />);
      const cardContent = container.querySelector('.space-y-4');
      expect(cardContent).toBeInTheDocument();
    });

    it('should apply proper padding to empty state', () => {
      const { container } = render(
        <CenterDescription {...defaultProps} businessContent={null} />
      );
      const emptyState = container.querySelector('.py-8');
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string content', () => {
      render(<CenterDescription {...defaultProps} businessContent="" />);
      expect(screen.getByText('')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(1000);
      render(<CenterDescription {...defaultProps} businessContent={longContent} />);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('should handle special characters in content', () => {
      const specialContent = '특수문자: !@#$%^&*()_+-=[]{}|;:",.<>?/~`';
      render(
        <CenterDescription {...defaultProps} businessContent={specialContent} />
      );
      expect(screen.getByText(specialContent)).toBeInTheDocument();
    });

    it('should handle HTML entities in content', () => {
      const htmlContent = '&lt;div&gt;HTML 엔티티&lt;/div&gt;';
      render(<CenterDescription {...defaultProps} businessContent={htmlContent} />);
      expect(screen.getByText(htmlContent)).toBeInTheDocument();
    });
  });
});

/**
 * ScoreSection Component Tests
 * Sprint 3 - Task 3.2.4
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreSection } from '../ScoreSection';

describe('ScoreSection', () => {
  describe('LOW severity', () => {
    it('renders LOW severity with green badge', () => {
      render(<ScoreSection totalScore={12} severityCode="LOW" maxScore={40} />);

      const badge = screen.getByText('정상 범위');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('div')).toHaveClass('bg-green-500');
    });

    it('displays correct score and percentage for LOW severity', () => {
      render(<ScoreSection totalScore={15} severityCode="LOW" maxScore={40} />);

      expect(screen.getByLabelText('총점 15점')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('/ 40점')).toBeInTheDocument();

      // 15/40 = 37.5% -> rounds to 38%
      expect(screen.getByText('38%')).toBeInTheDocument();
    });

    it('shows positive description for LOW severity', () => {
      render(<ScoreSection totalScore={10} severityCode="LOW" maxScore={40} />);

      expect(screen.getByText('정신건강이 비교적 양호한 상태입니다')).toBeInTheDocument();
    });
  });

  describe('MID severity', () => {
    it('renders MID severity with yellow badge', () => {
      render(<ScoreSection totalScore={25} severityCode="MID" maxScore={40} />);

      const badge = screen.getByText('중간 정도 고통');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('div')).toHaveClass('bg-yellow-500');
    });

    it('displays correct score and percentage for MID severity', () => {
      render(<ScoreSection totalScore={20} severityCode="MID" maxScore={40} />);

      expect(screen.getByLabelText('총점 20점')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();

      // 20/40 = 50%
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('shows supportive description for MID severity', () => {
      render(<ScoreSection totalScore={20} severityCode="MID" maxScore={40} />);

      expect(screen.getByText('전문가 상담을 고려해보세요')).toBeInTheDocument();
    });
  });

  describe('HIGH severity', () => {
    it('renders HIGH severity with red badge', () => {
      render(<ScoreSection totalScore={35} severityCode="HIGH" maxScore={40} />);

      const badge = screen.getByText('심각한 고통');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('div')).toHaveClass('bg-red-500');
    });

    it('displays correct score and percentage for HIGH severity', () => {
      render(<ScoreSection totalScore={40} severityCode="HIGH" maxScore={40} />);

      expect(screen.getByLabelText('총점 40점')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();

      // 40/40 = 100%
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('shows urgent description for HIGH severity', () => {
      render(<ScoreSection totalScore={35} severityCode="HIGH" maxScore={40} />);

      expect(screen.getByText('즉시 전문가의 도움이 필요합니다')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for score', () => {
      render(<ScoreSection totalScore={25} severityCode="MID" maxScore={40} />);

      expect(screen.getByLabelText('총점 25점')).toBeInTheDocument();
    });

    it('has proper ARIA labels for progress', () => {
      render(<ScoreSection totalScore={20} severityCode="MID" maxScore={40} />);

      expect(screen.getByLabelText('진단 점수 50%')).toBeInTheDocument();
    });

    it('has status role for description', () => {
      render(<ScoreSection totalScore={25} severityCode="MID" maxScore={40} />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('hides decorative icons from screen readers', () => {
      const { container } = render(<ScoreSection totalScore={25} severityCode="MID" maxScore={40} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('handles score of 0', () => {
      render(<ScoreSection totalScore={0} severityCode="LOW" maxScore={40} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles maximum score', () => {
      render(<ScoreSection totalScore={40} severityCode="HIGH" maxScore={40} />);

      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('handles custom maxScore', () => {
      render(<ScoreSection totalScore={50} severityCode="HIGH" maxScore={100} />);

      expect(screen.getByText('/ 100점')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Visual hierarchy', () => {
    it('renders score with large typography', () => {
      const { container } = render(<ScoreSection totalScore={25} severityCode="MID" maxScore={40} />);

      const score = screen.getByText('25');
      expect(score).toHaveClass('text-h1');
      expect(score).toHaveClass('font-bold');
    });

    it('renders progress bar', () => {
      render(<ScoreSection totalScore={30} severityCode="HIGH" maxScore={40} />);

      const progress = screen.getByLabelText('진단 점수 75%');
      expect(progress).toBeInTheDocument();
    });
  });
});

/**
 * InterpretationSection Component Tests
 * Sprint 3 - Task 3.2.4
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InterpretationSection } from '../InterpretationSection';
import type { Interpretation } from '@/lib/api/assessments';

const mockInterpretation: Interpretation = {
  title: '중등도 우울 증상',
  description: '최근 2주간 우울감과 스트레스가 지속되고 있습니다. 전문가 상담을 권장합니다.',
  recommendations: [
    '정신건강복지센터에서 전문가 상담받기',
    '규칙적인 운동과 충분한 수면 유지',
    '가족이나 친구와 대화 나누기',
  ],
  urgency: 'moderate',
};

describe('InterpretationSection', () => {
  describe('Rendering', () => {
    it('renders interpretation title', () => {
      render(<InterpretationSection interpretation={mockInterpretation} />);

      expect(screen.getByText('중등도 우울 증상')).toBeInTheDocument();
    });

    it('renders interpretation description', () => {
      render(<InterpretationSection interpretation={mockInterpretation} />);

      expect(
        screen.getByText(/최근 2주간 우울감과 스트레스가 지속되고 있습니다/)
      ).toBeInTheDocument();
    });

    it('renders all recommendations', () => {
      render(<InterpretationSection interpretation={mockInterpretation} />);

      expect(screen.getByText('정신건강복지센터에서 전문가 상담받기')).toBeInTheDocument();
      expect(screen.getByText('규칙적인 운동과 충분한 수면 유지')).toBeInTheDocument();
      expect(screen.getByText('가족이나 친구와 대화 나누기')).toBeInTheDocument();
    });

    it('renders "권장사항" heading', () => {
      render(<InterpretationSection interpretation={mockInterpretation} />);

      expect(screen.getByText('권장사항')).toBeInTheDocument();
    });
  });

  describe('Urgency levels', () => {
    it('renders low urgency icon', () => {
      const lowUrgency: Interpretation = {
        ...mockInterpretation,
        urgency: 'low',
      };

      const { container } = render(<InterpretationSection interpretation={lowUrgency} />);

      const icon = container.querySelector('.text-blue-600');
      expect(icon).toBeInTheDocument();
    });

    it('renders moderate urgency icon', () => {
      const { container } = render(<InterpretationSection interpretation={mockInterpretation} />);

      const icon = container.querySelector('.text-yellow-600');
      expect(icon).toBeInTheDocument();
    });

    it('renders high urgency icon', () => {
      const highUrgency: Interpretation = {
        ...mockInterpretation,
        urgency: 'high',
      };

      const { container } = render(<InterpretationSection interpretation={highUrgency} />);

      const icon = container.querySelector('.text-red-600');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Empty recommendations', () => {
    it('does not render recommendations section when empty', () => {
      const noRecommendations: Interpretation = {
        ...mockInterpretation,
        recommendations: [],
      };

      render(<InterpretationSection interpretation={noRecommendations} />);

      expect(screen.queryByText('권장사항')).not.toBeInTheDocument();
    });

    it('does not render recommendations section when undefined', () => {
      const undefinedRecommendations: Interpretation = {
        ...mockInterpretation,
        recommendations: undefined as any,
      };

      render(<InterpretationSection interpretation={undefinedRecommendations} />);

      expect(screen.queryByText('권장사항')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic list for recommendations', () => {
      render(<InterpretationSection interpretation={mockInterpretation} />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('hides decorative icons from screen readers', () => {
      const { container } = render(<InterpretationSection interpretation={mockInterpretation} />);

      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });

    it('has proper heading hierarchy', () => {
      const { container } = render(<InterpretationSection interpretation={mockInterpretation} />);

      const h3 = container.querySelector('h3');
      expect(h3).toBeInTheDocument();
      expect(h3).toHaveClass('text-h3');

      const h4 = container.querySelector('h4');
      expect(h4).toBeInTheDocument();
    });
  });

  describe('Long content', () => {
    it('handles long title', () => {
      const longTitle: Interpretation = {
        ...mockInterpretation,
        title: '매우 긴 제목을 가진 해석 정보입니다. 이 제목은 여러 줄에 걸쳐 표시될 수 있습니다.',
      };

      render(<InterpretationSection interpretation={longTitle} />);

      expect(screen.getByText(/매우 긴 제목을 가진 해석 정보입니다/)).toBeInTheDocument();
    });

    it('handles long description', () => {
      const longDescription: Interpretation = {
        ...mockInterpretation,
        description:
          '매우 긴 설명입니다. '.repeat(50) + '전문가 상담을 권장합니다.',
      };

      render(<InterpretationSection interpretation={longDescription} />);

      expect(screen.getByText(/매우 긴 설명입니다/)).toBeInTheDocument();
    });

    it('handles many recommendations', () => {
      const manyRecommendations: Interpretation = {
        ...mockInterpretation,
        recommendations: Array.from({ length: 10 }, (_, i) => `권장사항 ${i + 1}`),
      };

      render(<InterpretationSection interpretation={manyRecommendations} />);

      expect(screen.getByText('권장사항 1')).toBeInTheDocument();
      expect(screen.getByText('권장사항 10')).toBeInTheDocument();
    });
  });
});

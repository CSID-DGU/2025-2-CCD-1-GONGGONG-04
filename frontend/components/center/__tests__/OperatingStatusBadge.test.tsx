/**
 * 마음이음 - 운영 상태 배지 컴포넌트 단위 테스트
 *
 * Sprint 2: 통합 정보 제공 - 실시간 운영 상태 표시
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OperatingStatusBadge } from '../OperatingStatusBadge';

describe('OperatingStatusBadge', () => {
  describe('상태별 렌더링', () => {
    it('OPEN 상태를 올바르게 렌더링해야 함', () => {
      render(<OperatingStatusBadge status="OPEN" />);
      expect(screen.getByText('운영 중')).toBeInTheDocument();
      expect(screen.getByLabelText('현재 운영 중')).toBeInTheDocument();
    });

    it('CLOSING_SOON 상태를 올바르게 렌더링해야 함', () => {
      render(<OperatingStatusBadge status="CLOSING_SOON" />);
      expect(screen.getByText('곧 마감')).toBeInTheDocument();
    });

    it('CLOSED 상태를 올바르게 렌더링해야 함', () => {
      render(<OperatingStatusBadge status="CLOSED" />);
      expect(screen.getByText('마감')).toBeInTheDocument();
    });

    it('HOLIDAY 상태를 올바르게 렌더링해야 함', () => {
      render(<OperatingStatusBadge status="HOLIDAY" />);
      expect(screen.getByText('휴무일')).toBeInTheDocument();
    });

    it('TEMP_CLOSED 상태를 올바르게 렌더링해야 함', () => {
      render(<OperatingStatusBadge status="TEMP_CLOSED" />);
      expect(screen.getByText('임시 휴무')).toBeInTheDocument();
    });

    it('NO_INFO 상태를 올바르게 렌더링해야 함', () => {
      render(<OperatingStatusBadge status="NO_INFO" />);
      expect(screen.getByText('정보 없음')).toBeInTheDocument();
    });
  });

  describe('커스텀 메시지', () => {
    it('message prop이 제공되면 커스텀 메시지를 표시해야 함', () => {
      render(
        <OperatingStatusBadge status="OPEN" message="18:00까지 운영" />
      );
      expect(screen.getByText('18:00까지 운영')).toBeInTheDocument();
      expect(screen.queryByText('운영 중')).not.toBeInTheDocument();
    });

    it('message가 aria-label에 반영되어야 함', () => {
      render(
        <OperatingStatusBadge status="CLOSED" message="내일 09:00 오픈" />
      );
      expect(screen.getByLabelText('내일 09:00 오픈')).toBeInTheDocument();
    });
  });

  describe('아이콘 표시', () => {
    it('기본적으로 아이콘을 표시해야 함', () => {
      const { container } = render(<OperatingStatusBadge status="OPEN" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('showIcon=false일 때 아이콘을 숨겨야 함', () => {
      const { container } = render(
        <OperatingStatusBadge status="OPEN" showIcon={false} />
      );
      const icon = container.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('아이콘에 aria-hidden 속성이 있어야 함', () => {
      const { container } = render(<OperatingStatusBadge status="OPEN" />);
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('크기 변형', () => {
    it('sm 크기를 올바르게 적용해야 함', () => {
      const { container } = render(
        <OperatingStatusBadge status="OPEN" size="sm" />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-xs');
    });

    it('md 크기를 올바르게 적용해야 함 (기본값)', () => {
      const { container } = render(<OperatingStatusBadge status="OPEN" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-sm');
    });

    it('lg 크기를 올바르게 적용해야 함', () => {
      const { container } = render(
        <OperatingStatusBadge status="OPEN" size="lg" />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-base');
    });
  });

  describe('CSS 클래스', () => {
    it('커스텀 className을 적용해야 함', () => {
      const { container } = render(
        <OperatingStatusBadge status="OPEN" className="custom-class" />
      );
      const badge = container.firstChild;
      expect(badge).toHaveClass('custom-class');
    });

    it('기본 레이아웃 클래스를 포함해야 함', () => {
      const { container } = render(<OperatingStatusBadge status="OPEN" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('inline-flex', 'items-center', 'gap-1');
    });
  });

  describe('접근성', () => {
    it('모든 상태에 aria-label이 있어야 함', () => {
      const statuses = [
        'NO_INFO',
        'TEMP_CLOSED',
        'HOLIDAY',
        'OPEN',
        'CLOSING_SOON',
        'CLOSED',
      ] as const;

      statuses.forEach((status) => {
        const { container } = render(<OperatingStatusBadge status={status} />);
        const badge = container.firstChild;
        expect(badge).toHaveAttribute('aria-label');
        cleanup();
      });
    });

    it('메시지가 있을 때 aria-label에 메시지를 사용해야 함', () => {
      render(
        <OperatingStatusBadge status="OPEN" message="커스텀 메시지" />
      );
      expect(screen.getByLabelText('커스텀 메시지')).toBeInTheDocument();
    });
  });

  describe('상태별 색상 변형', () => {
    it('OPEN 상태는 operating variant를 사용해야 함', () => {
      const { container } = render(<OperatingStatusBadge status="OPEN" />);
      const badge = container.querySelector('[class*="operating"]');
      expect(badge).toBeInTheDocument();
    });

    it('CLOSED/HOLIDAY 상태는 closed variant를 사용해야 함', () => {
      const { container: closedContainer } = render(
        <OperatingStatusBadge status="CLOSED" />
      );
      expect(
        closedContainer.querySelector('[class*="closed"]')
      ).toBeInTheDocument();

      cleanup();

      const { container: holidayContainer } = render(
        <OperatingStatusBadge status="HOLIDAY" />
      );
      expect(
        holidayContainer.querySelector('[class*="closed"]')
      ).toBeInTheDocument();
    });

    it('TEMP_CLOSED 상태는 emergency variant를 사용해야 함', () => {
      const { container } = render(
        <OperatingStatusBadge status="TEMP_CLOSED" />
      );
      const badge = container.querySelector('[class*="emergency"]');
      expect(badge).toBeInTheDocument();
    });

    it('NO_INFO 상태는 secondary variant를 사용해야 함', () => {
      const { container } = render(<OperatingStatusBadge status="NO_INFO" />);
      const badge = container.querySelector('[class*="secondary"]');
      expect(badge).toBeInTheDocument();
    });
  });
});

// cleanup helper
function cleanup() {
  document.body.innerHTML = '';
}

/**
 * 마음이음 - 휴무일 목록 컴포넌트 단위 테스트
 *
 * Sprint 2: 통합 정보 제공 - 실시간 운영 상태 표시
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HolidayList } from '../HolidayList';
import type { Holiday } from '@/types/operatingStatus';

const sampleHolidays: Holiday[] = [
  { date: '2025-01-01', name: '신정', type: 'public' },
  { date: '2025-01-28', name: '설날 연휴', type: 'public' },
  { date: '2025-01-29', name: '설날', type: 'public' },
  { date: '2025-01-30', name: '설날 연휴', type: 'public' },
  { date: '2025-03-01', name: '삼일절', type: 'public' },
];

describe('HolidayList', () => {
  describe('기본 렌더링', () => {
    it('모든 휴무일을 올바르게 렌더링해야 함', () => {
      render(<HolidayList holidays={sampleHolidays} />);

      expect(screen.getByText('신정')).toBeInTheDocument();
      expect(screen.getByText('설날 연휴')).toBeInTheDocument();
      expect(screen.getByText('설날')).toBeInTheDocument();
      expect(screen.getByText('삼일절')).toBeInTheDocument();
    });

    it('날짜를 한국어 형식으로 표시해야 함', () => {
      render(<HolidayList holidays={sampleHolidays} />);

      expect(screen.getByText(/1월 1일/)).toBeInTheDocument();
      expect(screen.getByText(/3월 1일/)).toBeInTheDocument();
    });

    it('리스트 역할을 가진 ul 요소를 렌더링해야 함', () => {
      const { container } = render(<HolidayList holidays={sampleHolidays} />);

      const list = container.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
    });
  });

  describe('휴무일 타입 배지', () => {
    it('기본적으로 타입 배지를 표시해야 함', () => {
      render(<HolidayList holidays={sampleHolidays} />);

      const publicBadges = screen.getAllByText('공휴일');
      expect(publicBadges.length).toBeGreaterThan(0);
    });

    it('showType=false일 때 타입 배지를 숨겨야 함', () => {
      render(<HolidayList holidays={sampleHolidays} showType={false} />);

      expect(screen.queryByText('공휴일')).not.toBeInTheDocument();
    });

    it('다양한 타입 배지를 표시해야 함', () => {
      const mixedHolidays: Holiday[] = [
        { date: '2025-01-01', name: '신정', type: 'public' },
        { date: '2025-01-05', name: '매주 일요일', type: 'regular' },
        { date: '2025-01-15', name: '시설 보수', type: 'temporary' },
      ];

      render(<HolidayList holidays={mixedHolidays} />);

      expect(screen.getByText('공휴일')).toBeInTheDocument();
      expect(screen.getByText('정기휴무')).toBeInTheDocument();
      expect(screen.getByText('임시휴무')).toBeInTheDocument();
    });
  });

  describe('최대 항목 수 제한', () => {
    it('maxItems보다 적은 항목만 표시해야 함', () => {
      const { container } = render(
        <HolidayList holidays={sampleHolidays} maxItems={3} />
      );

      const items = container.querySelectorAll('li');
      expect(items).toHaveLength(3);
    });

    it('maxItems보다 많은 항목이 있으면 더보기 버튼을 표시해야 함', () => {
      render(<HolidayList holidays={sampleHolidays} maxItems={3} />);

      const moreButton = screen.getByRole('button', { name: /더보기/ });
      expect(moreButton).toBeInTheDocument();
      expect(moreButton).toHaveTextContent('2개 더 있음');
    });

    it('더보기 버튼을 클릭하면 모든 항목을 표시해야 함', () => {
      const { container } = render(
        <HolidayList holidays={sampleHolidays} maxItems={3} />
      );

      const moreButton = screen.getByRole('button', { name: /더보기/ });
      fireEvent.click(moreButton);

      const items = container.querySelectorAll('li');
      expect(items).toHaveLength(sampleHolidays.length);
    });

    it('전체 표시 후 접기 버튼을 클릭하면 다시 제한해야 함', () => {
      const { container } = render(
        <HolidayList holidays={sampleHolidays} maxItems={3} />
      );

      // 더보기 클릭
      const moreButton = screen.getByRole('button', { name: /더보기/ });
      fireEvent.click(moreButton);

      // 접기 클릭
      const collapseButton = screen.getByRole('button', { name: /접기/ });
      fireEvent.click(collapseButton);

      const items = container.querySelectorAll('li');
      expect(items).toHaveLength(3);
    });
  });

  describe('날짜순 정렬', () => {
    it('휴무일을 날짜순으로 정렬해야 함', () => {
      const unsortedHolidays: Holiday[] = [
        { date: '2025-03-01', name: '삼일절', type: 'public' },
        { date: '2025-01-01', name: '신정', type: 'public' },
        { date: '2025-02-15', name: '설날', type: 'public' },
      ];

      const { container } = render(<HolidayList holidays={unsortedHolidays} />);

      const items = Array.from(container.querySelectorAll('li'));
      const names = items.map(
        (item) => item.querySelector('.font-medium')?.textContent
      );

      expect(names).toEqual(['신정', '설날', '삼일절']);
    });
  });

  describe('빈 상태', () => {
    it('휴무일이 없을 때 빈 상태 메시지를 표시해야 함', () => {
      render(<HolidayList holidays={[]} />);

      expect(
        screen.getByText('등록된 휴무일이 없습니다')
      ).toBeInTheDocument();
    });

    it('커스텀 빈 상태 메시지를 표시해야 함', () => {
      render(
        <HolidayList
          holidays={[]}
          emptyMessage="현재 예정된 휴무일이 없습니다."
        />
      );

      expect(
        screen.getByText('현재 예정된 휴무일이 없습니다.')
      ).toBeInTheDocument();
    });

    it('빈 상태에 아이콘을 표시해야 함', () => {
      const { container } = render(<HolidayList holidays={[]} />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('CSS 클래스', () => {
    it('커스텀 className을 적용해야 함', () => {
      const { container } = render(
        <HolidayList holidays={sampleHolidays} className="custom-class" />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('각 항목에 호버 효과를 적용해야 함', () => {
      const { container } = render(<HolidayList holidays={sampleHolidays} />);

      const items = container.querySelectorAll('li');
      items.forEach((item) => {
        expect(item).toHaveClass('hover:bg-neutral-50');
      });
    });
  });

  describe('접근성', () => {
    it('각 휴무일 항목에 아이콘이 있고 aria-hidden 속성이 있어야 함', () => {
      const { container } = render(<HolidayList holidays={sampleHolidays} />);

      const icons = container.querySelectorAll('li svg');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('리스트가 올바른 role 속성을 가져야 함', () => {
      const { container } = render(<HolidayList holidays={sampleHolidays} />);

      const list = container.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
    });

    it('더보기/접기 버튼이 적절한 레이블을 가져야 함', () => {
      render(<HolidayList holidays={sampleHolidays} maxItems={3} />);

      const moreButton = screen.getByRole('button', { name: /더보기/ });
      expect(moreButton).toHaveAccessibleName();
    });
  });

  describe('엣지 케이스', () => {
    it('단일 휴무일만 있어도 렌더링되어야 함', () => {
      const singleHoliday: Holiday[] = [
        { date: '2025-01-01', name: '신정', type: 'public' },
      ];

      render(<HolidayList holidays={singleHoliday} />);

      expect(screen.getByText('신정')).toBeInTheDocument();
    });

    it('maxItems가 전체 항목 수와 같으면 더보기 버튼이 없어야 함', () => {
      render(<HolidayList holidays={sampleHolidays} maxItems={5} />);

      expect(
        screen.queryByRole('button', { name: /더보기/ })
      ).not.toBeInTheDocument();
    });

    it('maxItems가 전체 항목 수보다 크면 모든 항목을 표시해야 함', () => {
      const { container } = render(
        <HolidayList holidays={sampleHolidays} maxItems={10} />
      );

      const items = container.querySelectorAll('li');
      expect(items).toHaveLength(sampleHolidays.length);
    });

    it('잘못된 날짜 형식도 처리해야 함', () => {
      const invalidHoliday: Holiday[] = [
        { date: 'invalid-date', name: '테스트', type: 'public' },
      ];

      render(<HolidayList holidays={invalidHoliday} />);

      // 에러 없이 렌더링되어야 함
      expect(screen.getByText('테스트')).toBeInTheDocument();
    });
  });

  describe('날짜 포맷팅', () => {
    it('날짜를 "M월 d일 (요일)" 형식으로 표시해야 함', () => {
      const holiday: Holiday[] = [
        { date: '2025-01-01', name: '신정', type: 'public' },
      ];

      render(<HolidayList holidays={holiday} />);

      // 날짜 포맷 확인 (정규식 사용)
      expect(screen.getByText(/1월 1일 \(.+\)/)).toBeInTheDocument();
    });
  });

  describe('상호작용', () => {
    it('더보기 버튼이 전체 너비를 차지해야 함', () => {
      render(<HolidayList holidays={sampleHolidays} maxItems={3} />);

      const moreButton = screen.getByRole('button', { name: /더보기/ });
      expect(moreButton).toHaveClass('w-full');
    });

    it('접기 버튼도 전체 너비를 차지해야 함', () => {
      render(<HolidayList holidays={sampleHolidays} maxItems={3} />);

      const moreButton = screen.getByRole('button', { name: /더보기/ });
      fireEvent.click(moreButton);

      const collapseButton = screen.getByRole('button', { name: /접기/ });
      expect(collapseButton).toHaveClass('w-full');
    });
  });
});

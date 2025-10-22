/**
 * 마음이음 - 운영시간 테이블 컴포넌트 단위 테스트
 *
 * Sprint 2: 통합 정보 제공 - 실시간 운영 상태 표시
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OperatingHoursTable } from '../OperatingHoursTable';
import type { OperatingHour } from '@/types/operatingStatus';

const sampleOperatingHours: OperatingHour[] = [
  { dayOfWeek: 0, dayName: '일요일', openTime: '10:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 6, dayName: '토요일', openTime: '09:00', closeTime: '13:00', isOpen: true },
];

describe('OperatingHoursTable', () => {
  describe('기본 렌더링', () => {
    it('모든 요일을 올바르게 렌더링해야 함', () => {
      render(<OperatingHoursTable operatingHours={sampleOperatingHours} />);

      const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      dayNames.forEach((dayName) => {
        expect(screen.getByText(dayName)).toBeInTheDocument();
      });
    });

    it('운영시간을 올바른 형식으로 표시해야 함', () => {
      render(<OperatingHoursTable operatingHours={sampleOperatingHours} />);

      expect(screen.getByText('09:00 ~ 18:00')).toBeInTheDocument();
      expect(screen.getByText('09:00 ~ 13:00')).toBeInTheDocument(); // 토요일
    });

    it('테이블 헤더를 표시해야 함', () => {
      render(<OperatingHoursTable operatingHours={sampleOperatingHours} />);

      expect(screen.getByText('요일')).toBeInTheDocument();
      expect(screen.getByText('운영시간')).toBeInTheDocument();
    });
  });

  describe('휴무일 처리', () => {
    const hoursWithClosedDays: OperatingHour[] = [
      { dayOfWeek: 0, dayName: '일요일', openTime: '', closeTime: '', isOpen: false },
      { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 6, dayName: '토요일', openTime: '', closeTime: '', isOpen: false },
    ];

    it('휴무일에 "휴무"를 표시해야 함', () => {
      render(<OperatingHoursTable operatingHours={hoursWithClosedDays} />);

      const closedTexts = screen.getAllByText('휴무');
      expect(closedTexts).toHaveLength(2); // 일요일, 토요일
    });

    it('휴무일 텍스트에 neutral 색상을 적용해야 함', () => {
      render(<OperatingHoursTable operatingHours={hoursWithClosedDays} />);

      const closedTexts = screen.getAllByText('휴무');
      closedTexts.forEach((text) => {
        expect(text).toHaveClass('text-neutral-500');
      });
    });
  });

  describe('현재 요일 강조', () => {
    it('현재 요일 행을 강조 표시해야 함', () => {
      const { container } = render(
        <OperatingHoursTable
          operatingHours={sampleOperatingHours}
          currentDayOfWeek={3} // 수요일
        />
      );

      // 수요일 행 찾기
      const wednesdayRow = screen.getByText('수요일').closest('tr');
      expect(wednesdayRow).toHaveClass('bg-lavender-50');
      expect(wednesdayRow).toHaveClass('border-l-4', 'border-l-lavender-500');
    });

    it('현재 요일 텍스트에 lavender 색상을 적용해야 함', () => {
      render(
        <OperatingHoursTable
          operatingHours={sampleOperatingHours}
          currentDayOfWeek={1} // 월요일
        />
      );

      const mondayCell = screen.getByText('월요일');
      expect(mondayCell).toHaveClass('text-lavender-700', 'font-semibold');
    });

    it('현재 요일에 스크린 리더용 "(오늘)" 텍스트를 포함해야 함', () => {
      render(
        <OperatingHoursTable
          operatingHours={sampleOperatingHours}
          currentDayOfWeek={2} // 화요일
        />
      );

      const srOnlyText = screen.getByText('(오늘)');
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('currentDayOfWeek가 없으면 강조 표시하지 않아야 함', () => {
      const { container } = render(
        <OperatingHoursTable operatingHours={sampleOperatingHours} />
      );

      const highlightedRows = container.querySelectorAll('.bg-lavender-50');
      expect(highlightedRows).toHaveLength(0);
    });
  });

  describe('컴팩트 모드', () => {
    it('compact=true일 때 좁은 패딩을 사용해야 함', () => {
      const { container } = render(
        <OperatingHoursTable
          operatingHours={sampleOperatingHours}
          compact={true}
        />
      );

      const cells = container.querySelectorAll('td');
      cells.forEach((cell) => {
        expect(cell).toHaveClass('py-2');
      });
    });

    it('compact=false일 때 기본 패딩을 사용해야 함', () => {
      const { container } = render(
        <OperatingHoursTable
          operatingHours={sampleOperatingHours}
          compact={false}
        />
      );

      const cells = container.querySelectorAll('td');
      cells.forEach((cell) => {
        expect(cell).toHaveClass('py-3');
      });
    });
  });

  describe('요일 정렬', () => {
    it('요일을 순서대로 표시해야 함 (일요일부터 토요일까지)', () => {
      // 무작위 순서의 운영시간
      const shuffledHours: OperatingHour[] = [
        { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
        { dayOfWeek: 0, dayName: '일요일', openTime: '10:00', closeTime: '18:00', isOpen: true },
        { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
        { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      ];

      render(<OperatingHoursTable operatingHours={shuffledHours} />);

      const dayNames = Array.from(
        document.querySelectorAll('tbody tr td:first-child')
      ).map((cell) => cell.textContent);

      expect(dayNames).toEqual(['일요일', '월요일', '수요일', '금요일']);
    });
  });

  describe('CSS 클래스', () => {
    it('커스텀 className을 적용해야 함', () => {
      const { container } = render(
        <OperatingHoursTable
          operatingHours={sampleOperatingHours}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('기본 테두리와 둥근 모서리를 포함해야 함', () => {
      const { container } = render(
        <OperatingHoursTable operatingHours={sampleOperatingHours} />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('overflow-hidden', 'rounded-lg', 'border');
    });
  });

  describe('접근성', () => {
    it('테이블 구조가 올바르게 렌더링되어야 함', () => {
      const { container } = render(
        <OperatingHoursTable operatingHours={sampleOperatingHours} />
      );

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();

      const thead = container.querySelector('thead');
      const tbody = container.querySelector('tbody');
      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
    });

    it('각 행이 올바른 개수의 셀을 가져야 함', () => {
      const { container } = render(
        <OperatingHoursTable operatingHours={sampleOperatingHours} />
      );

      const rows = container.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        expect(cells).toHaveLength(2); // 요일, 운영시간
      });
    });
  });

  describe('엣지 케이스', () => {
    it('빈 배열을 처리해야 함', () => {
      const { container } = render(<OperatingHoursTable operatingHours={[]} />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(0);
    });

    it('단일 요일만 있어도 렌더링되어야 함', () => {
      const singleDay: OperatingHour[] = [
        { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      ];

      render(<OperatingHoursTable operatingHours={singleDay} />);

      expect(screen.getByText('월요일')).toBeInTheDocument();
      expect(screen.getByText('09:00 ~ 18:00')).toBeInTheDocument();
    });
  });
});

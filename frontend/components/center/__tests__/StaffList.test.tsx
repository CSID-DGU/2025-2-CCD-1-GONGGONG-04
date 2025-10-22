/**
 * StaffList 컴포넌트 테스트
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { StaffList } from '../StaffList';
import type { Staff } from '@/types/center';

describe('StaffList', () => {
  const mockStaff: Staff[] = [
    {
      staff_type: '정신건강의학과 전문의',
      staff_count: 2,
      description: null,
    },
    {
      staff_type: '임상심리사',
      staff_count: 3,
      description: '청소년 상담 전문',
    },
    {
      staff_type: '사회복지사',
      staff_count: 5,
      description: null,
    },
  ];

  describe('렌더링', () => {
    it('의료진 목록을 정상적으로 표시한다', () => {
      render(
        <StaffList staff={mockStaff} totalStaff={10} hasData={true} />
      );

      // 제목 확인
      expect(screen.getByText('의료진 현황')).toBeInTheDocument();

      // 총 인원 배지 확인
      expect(screen.getByText('총 10명')).toBeInTheDocument();

      // 의료진 유형 확인
      expect(screen.getByText('정신건강의학과 전문의')).toBeInTheDocument();
      expect(screen.getByText('임상심리사')).toBeInTheDocument();
      expect(screen.getByText('사회복지사')).toBeInTheDocument();

      // 인원 배지 확인
      expect(screen.getByText('2명')).toBeInTheDocument();
      expect(screen.getByText('3명')).toBeInTheDocument();
      expect(screen.getByText('5명')).toBeInTheDocument();
    });

    it('의료진 설명이 있을 경우 표시한다', () => {
      render(
        <StaffList staff={mockStaff} totalStaff={10} hasData={true} />
      );

      expect(screen.getByText('청소년 상담 전문')).toBeInTheDocument();
    });

    it('빈 상태를 정상적으로 표시한다', () => {
      render(<StaffList staff={[]} totalStaff={0} hasData={false} />);

      // 제목 확인
      expect(screen.getByText('의료진 현황')).toBeInTheDocument();

      // 총 인원 배지가 표시되지 않는지 확인
      expect(screen.queryByText(/총.*명/)).not.toBeInTheDocument();

      // 빈 상태 메시지 확인
      expect(screen.getByText('의료진 정보가 없습니다')).toBeInTheDocument();
      expect(
        screen.getByText('센터에 문의하여 정보를 확인해주세요')
      ).toBeInTheDocument();
    });

    it('빈 상태 아이콘이 표시된다', () => {
      const { container } = render(
        <StaffList staff={[]} totalStaff={0} hasData={false} />
      );

      // Stethoscope 아이콘이 있는지 확인 (SVG 요소)
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('리스트 역할이 올바르게 설정된다', () => {
      render(
        <StaffList staff={mockStaff} totalStaff={10} hasData={true} />
      );

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('리스트 항목 역할이 올바르게 설정된다', () => {
      render(
        <StaffList staff={mockStaff} totalStaff={10} hasData={true} />
      );

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    it('배지에 aria-label이 설정된다', () => {
      render(
        <StaffList staff={mockStaff} totalStaff={10} hasData={true} />
      );

      expect(
        screen.getByLabelText('정신건강의학과 전문의 2명')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('임상심리사 3명')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('사회복지사 5명')
      ).toBeInTheDocument();
    });
  });

  describe('스타일링', () => {
    it('커스텀 className이 적용된다', () => {
      const { container } = render(
        <StaffList
          staff={mockStaff}
          totalStaff={10}
          hasData={true}
          className="custom-class"
        />
      );

      // Card 컴포넌트에 커스텀 클래스가 적용되는지 확인
      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('호버 스타일이 적용된다', () => {
      const { container } = render(
        <StaffList staff={mockStaff} totalStaff={10} hasData={true} />
      );

      const listItems = container.querySelectorAll('[role="listitem"]');
      listItems.forEach((item) => {
        expect(item).toHaveClass('hover:bg-neutral-100');
      });
    });
  });

  describe('엣지 케이스', () => {
    it('의료진이 1명일 경우도 정상적으로 표시한다', () => {
      const singleStaff: Staff[] = [
        {
          staff_type: '정신건강의학과 전문의',
          staff_count: 1,
          description: null,
        },
      ];

      render(
        <StaffList staff={singleStaff} totalStaff={1} hasData={true} />
      );

      expect(screen.getByText('총 1명')).toBeInTheDocument();
      expect(screen.getByText('1명')).toBeInTheDocument();
    });

    it('긴 설명이 있어도 레이아웃이 깨지지 않는다', () => {
      const staffWithLongDescription: Staff[] = [
        {
          staff_type: '임상심리사',
          staff_count: 2,
          description:
            '청소년 및 성인 대상 심리상담 전문가로 10년 이상의 경력을 보유하고 있으며, 인지행동치료, 가족치료 등 다양한 상담 기법을 활용합니다.',
        },
      ];

      render(
        <StaffList
          staff={staffWithLongDescription}
          totalStaff={2}
          hasData={true}
        />
      );

      expect(
        screen.getByText(/청소년 및 성인 대상 심리상담 전문가/)
      ).toBeInTheDocument();
    });

    it('많은 의료진 유형이 있어도 스크롤 가능하다', () => {
      const manyStaff: Staff[] = Array.from({ length: 10 }, (_, i) => ({
        staff_type: `의료진 유형 ${i + 1}`,
        staff_count: i + 1,
        description: null,
      }));

      render(
        <StaffList staff={manyStaff} totalStaff={55} hasData={true} />
      );

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(10);
    });
  });
});

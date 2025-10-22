/**
 * ProgramList 컴포넌트 테스트
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramList } from '../ProgramList';
import type { Program } from '@/types/center';

describe('ProgramList', () => {
  const mockPrograms: Program[] = [
    {
      id: 1,
      program_name: '직장인 스트레스 관리',
      program_type: '집단 상담',
      target_group: '직장인',
      description: '스트레스 대처법 프로그램',
      is_online_available: true,
      is_free: true,
      fee_amount: null,
      capacity: 12,
      duration_minutes: 90,
    },
    {
      id: 2,
      program_name: '청소년 마음건강',
      program_type: '집단 상담',
      target_group: '청소년',
      description: '청소년 고민 상담',
      is_online_available: false,
      is_free: true,
      fee_amount: null,
      capacity: 10,
      duration_minutes: 60,
    },
    {
      id: 3,
      program_name: '개인 심리 상담',
      program_type: '개인 상담',
      target_group: '전체',
      description: '1:1 개인 상담',
      is_online_available: true,
      is_free: false,
      fee_amount: 30000,
      capacity: 1,
      duration_minutes: 50,
    },
  ];

  const mockOnProgramClick = jest.fn();

  beforeEach(() => {
    mockOnProgramClick.mockClear();
  });

  it('프로그램 카드 목록을 정상적으로 렌더링한다', () => {
    render(
      <ProgramList
        programs={mockPrograms}
        hasData={true}
        onProgramClick={mockOnProgramClick}
      />
    );

    // 모든 프로그램이 표시되어야 함 (3개 < 5개)
    expect(screen.getByText('직장인 스트레스 관리')).toBeInTheDocument();
    expect(screen.getByText('청소년 마음건강')).toBeInTheDocument();
    expect(screen.getByText('개인 심리 상담')).toBeInTheDocument();
  });

  it('초기에 5개의 프로그램만 표시한다', () => {
    const manyPrograms: Program[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      program_name: `프로그램 ${i + 1}`,
      program_type: '집단 상담',
      target_group: '전체',
      description: null,
      is_online_available: false,
      is_free: true,
      fee_amount: null,
      capacity: null,
      duration_minutes: null,
    }));

    render(
      <ProgramList
        programs={manyPrograms}
        hasData={true}
        onProgramClick={mockOnProgramClick}
      />
    );

    // 초기 5개만 표시
    expect(screen.getByText('프로그램 1')).toBeInTheDocument();
    expect(screen.getByText('프로그램 5')).toBeInTheDocument();
    expect(screen.queryByText('프로그램 6')).not.toBeInTheDocument();
  });

  it('프로그램이 5개보다 많을 경우 "더보기" 버튼을 표시한다', () => {
    const manyPrograms: Program[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      program_name: `프로그램 ${i + 1}`,
      program_type: '집단 상담',
      target_group: '전체',
      description: null,
      is_online_available: false,
      is_free: true,
      fee_amount: null,
      capacity: null,
      duration_minutes: null,
    }));

    render(
      <ProgramList
        programs={manyPrograms}
        hasData={true}
        onProgramClick={mockOnProgramClick}
      />
    );

    expect(screen.getByText('더보기')).toBeInTheDocument();
  });

  it('프로그램이 5개 이하일 경우 "더보기" 버튼을 표시하지 않는다', () => {
    render(
      <ProgramList
        programs={mockPrograms}
        hasData={true}
        onProgramClick={mockOnProgramClick}
      />
    );

    expect(screen.queryByText('더보기')).not.toBeInTheDocument();
  });

  it('"더보기" 버튼 클릭 시 모든 프로그램을 표시한다', () => {
    const manyPrograms: Program[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      program_name: `프로그램 ${i + 1}`,
      program_type: '집단 상담',
      target_group: '전체',
      description: null,
      is_online_available: false,
      is_free: true,
      fee_amount: null,
      capacity: null,
      duration_minutes: null,
    }));

    render(
      <ProgramList
        programs={manyPrograms}
        hasData={true}
        onProgramClick={mockOnProgramClick}
      />
    );

    // "더보기" 버튼 클릭
    const moreButton = screen.getByText('더보기');
    fireEvent.click(moreButton);

    // 모든 프로그램이 표시되어야 함
    expect(screen.getByText('프로그램 6')).toBeInTheDocument();
    expect(screen.getByText('프로그램 8')).toBeInTheDocument();

    // "더보기" 버튼은 사라져야 함
    expect(screen.queryByText('더보기')).not.toBeInTheDocument();
  });

  it('빈 상태일 경우 적절한 메시지를 표시한다', () => {
    render(
      <ProgramList
        programs={[]}
        hasData={false}
        onProgramClick={mockOnProgramClick}
      />
    );

    expect(
      screen.getByText('제공 중인 프로그램이 없습니다')
    ).toBeInTheDocument();
    expect(screen.getByText('센터에 직접 문의해 주세요')).toBeInTheDocument();
  });

  it('프로그램 카드 클릭 시 onProgramClick 핸들러가 호출된다', () => {
    render(
      <ProgramList
        programs={mockPrograms}
        hasData={true}
        onProgramClick={mockOnProgramClick}
      />
    );

    // 첫 번째 프로그램 카드 클릭
    const firstCard = screen.getByText('직장인 스트레스 관리').closest('div[role="button"]');
    if (firstCard) {
      fireEvent.click(firstCard);
    }

    expect(mockOnProgramClick).toHaveBeenCalledWith(mockPrograms[0]);
  });

  it('반응형 그리드 레이아웃 클래스를 적용한다', () => {
    const { container } = render(
      <ProgramList
        programs={mockPrograms}
        hasData={true}
        onProgramClick={mockOnProgramClick}
      />
    );

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
  });
});

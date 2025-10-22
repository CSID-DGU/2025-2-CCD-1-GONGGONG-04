/**
 * ProgramCard 컴포넌트 테스트
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ProgramCard } from '../ProgramCard';
import type { Program } from '@/types/center';

describe('ProgramCard', () => {
  const mockProgram: Program = {
    id: 1,
    program_name: '직장인 스트레스 관리 프로그램',
    program_type: '집단 상담',
    target_group: '직장인',
    description: '주 1회, 8회기 프로그램으로 직장에서의 스트레스 대처법을 배웁니다.',
    is_online_available: true,
    is_free: true,
    fee_amount: null,
    capacity: 12,
    duration_minutes: 90,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('프로그램 정보를 정상적으로 렌더링한다', () => {
    render(<ProgramCard program={mockProgram} onClick={mockOnClick} />);

    // 프로그램 이름 확인
    expect(
      screen.getByText('직장인 스트레스 관리 프로그램')
    ).toBeInTheDocument();

    // 프로그램 유형 및 대상 그룹 확인
    expect(screen.getByText(/유형: 집단 상담/)).toBeInTheDocument();
    expect(screen.getByText(/대상: 직장인/)).toBeInTheDocument();

    // 정원 및 시간 정보 확인
    expect(screen.getByText(/정원 12명/)).toBeInTheDocument();
    expect(screen.getByText(/90분/)).toBeInTheDocument();
  });

  it('온라인 프로그램일 경우 온라인 배지를 표시한다', () => {
    render(<ProgramCard program={mockProgram} onClick={mockOnClick} />);

    expect(screen.getByText('온라인')).toBeInTheDocument();
  });

  it('무료 프로그램일 경우 무료 배지를 표시한다', () => {
    render(<ProgramCard program={mockProgram} onClick={mockOnClick} />);

    expect(screen.getByText('무료')).toBeInTheDocument();
  });

  it('유료 프로그램일 경우 금액을 표시한다', () => {
    const paidProgram: Program = {
      ...mockProgram,
      is_free: false,
      fee_amount: 30000,
    };

    render(<ProgramCard program={paidProgram} onClick={mockOnClick} />);

    expect(screen.getByText(/유료 30,000원/)).toBeInTheDocument();
  });

  it('클릭 시 onClick 핸들러가 호출된다', () => {
    render(<ProgramCard program={mockProgram} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('Enter 키 입력 시 onClick 핸들러가 호출된다', () => {
    render(<ProgramCard program={mockProgram} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('Space 키 입력 시 onClick 핸들러가 호출된다', () => {
    render(<ProgramCard program={mockProgram} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('정원과 시간 정보가 없는 경우에도 정상적으로 렌더링된다', () => {
    const programWithoutDetails: Program = {
      ...mockProgram,
      capacity: null,
      duration_minutes: null,
    };

    render(
      <ProgramCard program={programWithoutDetails} onClick={mockOnClick} />
    );

    // 프로그램 이름은 표시되어야 함
    expect(
      screen.getByText('직장인 스트레스 관리 프로그램')
    ).toBeInTheDocument();

    // 정원과 시간 정보는 표시되지 않아야 함
    expect(screen.queryByText(/정원/)).not.toBeInTheDocument();
    expect(screen.queryByText(/분/)).not.toBeInTheDocument();
  });
});

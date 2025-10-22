/**
 * ProgramDetailModal Component Tests
 * 프로그램 상세 모달 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgramDetailModal } from '../ProgramDetailModal';
import { Program } from '@/types/center';

// 테스트용 프로그램 데이터
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

const mockOnlinePaidProgram: Program = {
  id: 2,
  program_name: '개인 심리 상담',
  program_type: '개인 상담',
  target_group: '전체',
  description: '1:1 개인 상담 (예약 필수)',
  is_online_available: true,
  is_free: false,
  fee_amount: 30000,
  capacity: 1,
  duration_minutes: 50,
};

const mockOfflineFreeProgram: Program = {
  id: 3,
  program_name: '청소년 마음건강 프로그램',
  program_type: '집단 상담',
  target_group: '청소년',
  description: '또래 관계, 학업 스트레스 등 청소년기 고민 상담',
  is_online_available: false,
  is_free: true,
  fee_amount: null,
  capacity: 10,
  duration_minutes: 60,
};

const mockProgramWithoutDescription: Program = {
  id: 4,
  program_name: '가족 상담 프로그램',
  program_type: '가족 상담',
  target_group: '가족',
  description: null,
  is_online_available: false,
  is_free: true,
  fee_amount: null,
  capacity: null,
  duration_minutes: null,
};

describe('ProgramDetailModal', () => {
  it('모달이 열림 상태일 때 프로그램 정보를 렌더링한다', () => {
    const onOpenChange = vi.fn();

    render(
      <ProgramDetailModal
        program={mockProgram}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // 프로그램명 표시
    expect(screen.getByText('직장인 스트레스 관리 프로그램')).toBeInTheDocument();

    // 배지 표시
    expect(screen.getByText('온라인')).toBeInTheDocument();
    expect(screen.getByText('무료')).toBeInTheDocument();
    expect(screen.getByText('집단 상담')).toBeInTheDocument();
    expect(screen.getByText('직장인')).toBeInTheDocument();

    // 설명 표시
    expect(
      screen.getByText(/주 1회, 8회기 프로그램으로 직장에서의 스트레스 대처법을 배웁니다/)
    ).toBeInTheDocument();

    // 정원 표시
    expect(screen.getByText('12명')).toBeInTheDocument();

    // 시간 표시
    expect(screen.getByText('90분')).toBeInTheDocument();

    // 비용 표시
    expect(screen.getAllByText('무료')).toHaveLength(2); // 배지 + 상세정보
  });

  it('모달이 닫힘 상태일 때 렌더링하지 않는다', () => {
    const onOpenChange = vi.fn();

    render(
      <ProgramDetailModal
        program={mockProgram}
        open={false}
        onOpenChange={onOpenChange}
      />
    );

    // 프로그램명이 표시되지 않음
    expect(
      screen.queryByText('직장인 스트레스 관리 프로그램')
    ).not.toBeInTheDocument();
  });

  it('온라인 유료 프로그램을 올바르게 표시한다', () => {
    const onOpenChange = vi.fn();

    render(
      <ProgramDetailModal
        program={mockOnlinePaidProgram}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // 유료 배지 표시
    expect(screen.getByText('유료')).toBeInTheDocument();

    // 비용 표시
    expect(screen.getByText('30,000원')).toBeInTheDocument();
  });

  it('오프라인 무료 프로그램을 올바르게 표시한다', () => {
    const onOpenChange = vi.fn();

    render(
      <ProgramDetailModal
        program={mockOfflineFreeProgram}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // 온라인 배지가 표시되지 않음
    expect(screen.queryByText('온라인')).not.toBeInTheDocument();

    // 무료 배지 표시
    expect(screen.getByText('무료')).toBeInTheDocument();
  });

  it('설명이 없을 경우 기본 메시지를 표시한다', () => {
    const onOpenChange = vi.fn();

    render(
      <ProgramDetailModal
        program={mockProgramWithoutDescription}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    expect(
      screen.getByText('상세 소개가 등록되지 않았습니다.')
    ).toBeInTheDocument();
  });

  it('정원과 시간이 없을 경우 표시하지 않는다', () => {
    const onOpenChange = vi.fn();

    render(
      <ProgramDetailModal
        program={mockProgramWithoutDescription}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // 정원, 시간이 표시되지 않음 (상세정보 섹션에서)
    expect(screen.queryByText(/명$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/분$/)).not.toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onOpenChange가 호출된다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ProgramDetailModal
        program={mockProgram}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // 닫기 버튼 클릭
    const closeButton = screen.getByRole('button', { name: /닫기/i });
    await user.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('program이 null일 경우 아무것도 렌더링하지 않는다', () => {
    const onOpenChange = vi.fn();

    const { container } = render(
      <ProgramDetailModal
        program={null}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('ESC 키 이벤트는 shadcn Dialog가 처리한다', () => {
    // Note: shadcn Dialog의 ESC 키 기능은 Dialog 컴포넌트 자체 테스트에서 검증됨
    // 여기서는 통합 확인만 수행
    const onOpenChange = vi.fn();

    render(
      <ProgramDetailModal
        program={mockProgram}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // Dialog가 렌더링됨을 확인
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('모든 섹션 제목이 올바르게 표시된다', () => {
    const onOpenChange = vi.fn();

    render(
      <ProgramDetailModal
        program={mockProgram}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    expect(screen.getByText('프로그램 소개')).toBeInTheDocument();
    expect(screen.getByText('상세 정보')).toBeInTheDocument();
    expect(screen.getByText('신청 안내')).toBeInTheDocument();
  });

  it('신청 안내 메시지가 표시된다', () => {
    const onOpenChange = vi.fn();

    render(
      <ProgramDetailModal
        program={mockProgram}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    expect(
      screen.getByText('이 프로그램 신청은 센터에 직접 문의해 주세요.')
    ).toBeInTheDocument();
  });
});

/**
 * ProgramDetailModal Storybook Stories
 * 프로그램 상세 모달 컴포넌트 스토리북
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProgramDetailModal } from './ProgramDetailModal';
import { Program } from '@/types/center';
import { useState } from 'react';

const meta = {
  title: 'Center/ProgramDetailModal',
  component: ProgramDetailModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '프로그램 상세 정보를 표시하는 모달 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    program: {
      description: '표시할 프로그램 정보',
      control: 'object',
    },
    open: {
      description: '모달 열림 상태',
      control: 'boolean',
    },
    onOpenChange: {
      description: '모달 상태 변경 핸들러',
      action: 'onOpenChange',
    },
  },
} satisfies Meta<typeof ProgramDetailModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 프로그램 데이터
const defaultProgram: Program = {
  id: 1,
  program_name: '직장인 스트레스 관리 프로그램',
  program_type: '집단 상담',
  target_group: '직장인',
  description:
    '주 1회, 8회기 프로그램으로 직장에서의 스트레스 대처법을 배웁니다.\n\n스트레스 관리 기법, 마음챙김 명상, 감정 조절 등을 함께 학습합니다.',
  is_online_available: true,
  is_free: true,
  fee_amount: null,
  capacity: 12,
  duration_minutes: 90,
};

// Wrapper 컴포넌트 (상태 관리)
function ProgramDetailModalWrapper({
  program,
  defaultOpen = true,
}: {
  program: Program | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-lavender-500 text-white rounded-lg hover:bg-lavender-600"
      >
        모달 열기
      </button>
      <ProgramDetailModal program={program} open={open} onOpenChange={setOpen} />
    </div>
  );
}

/**
 * 기본 상태: 모달이 열린 상태로 프로그램 상세 정보를 표시합니다.
 */
export const Opened: Story = {
  args: {
    program: defaultProgram,
    open: true,
    onOpenChange: () => {},
  },
  render: () => <ProgramDetailModalWrapper program={defaultProgram} />,
};

/**
 * 온라인 무료 프로그램
 */
export const OnlineFree: Story = {
  args: {
    program: {
      id: 2,
      program_name: '청소년 마음건강 프로그램',
      program_type: '집단 상담',
      target_group: '청소년',
      description: '또래 관계, 학업 스트레스 등 청소년기 고민을 함께 나누는 프로그램입니다.',
      is_online_available: true,
      is_free: true,
      fee_amount: null,
      capacity: 10,
      duration_minutes: 60,
    },
    open: true,
    onOpenChange: () => {},
  },
  render: () => (
    <ProgramDetailModalWrapper
      program={{
        id: 2,
        program_name: '청소년 마음건강 프로그램',
        program_type: '집단 상담',
        target_group: '청소년',
        description: '또래 관계, 학업 스트레스 등 청소년기 고민을 함께 나누는 프로그램입니다.',
        is_online_available: true,
        is_free: true,
        fee_amount: null,
        capacity: 10,
        duration_minutes: 60,
      }}
    />
  ),
};

/**
 * 오프라인 유료 프로그램
 */
export const OfflinePaid: Story = {
  args: {
    program: {
      id: 3,
      program_name: '개인 심리 상담',
      program_type: '개인 상담',
      target_group: '전체',
      description: '1:1 개인 상담 (예약 필수)\n\n전문 상담사와의 개별 상담으로 개인적인 고민을 깊이 있게 다룹니다.',
      is_online_available: false,
      is_free: false,
      fee_amount: 50000,
      capacity: 1,
      duration_minutes: 50,
    },
    open: true,
    onOpenChange: () => {},
  },
  render: () => (
    <ProgramDetailModalWrapper
      program={{
        id: 3,
        program_name: '개인 심리 상담',
        program_type: '개인 상담',
        target_group: '전체',
        description: '1:1 개인 상담 (예약 필수)\n\n전문 상담사와의 개별 상담으로 개인적인 고민을 깊이 있게 다룹니다.',
        is_online_available: false,
        is_free: false,
        fee_amount: 50000,
        capacity: 1,
        duration_minutes: 50,
      }}
    />
  ),
};

/**
 * 설명이 없는 프로그램
 */
export const WithoutDescription: Story = {
  args: {
    program: {
      id: 4,
      program_name: '가족 상담 프로그램',
      program_type: '가족 상담',
      target_group: '가족',
      description: null,
      is_online_available: false,
      is_free: true,
      fee_amount: null,
      capacity: 5,
      duration_minutes: 90,
    },
    open: true,
    onOpenChange: () => {},
  },
  render: () => (
    <ProgramDetailModalWrapper
      program={{
        id: 4,
        program_name: '가족 상담 프로그램',
        program_type: '가족 상담',
        target_group: '가족',
        description: null,
        is_online_available: false,
        is_free: true,
        fee_amount: null,
        capacity: 5,
        duration_minutes: 90,
      }}
    />
  ),
};

/**
 * 최소 정보만 있는 프로그램 (정원/시간 없음)
 */
export const WithoutDetails: Story = {
  args: {
    program: {
      id: 5,
      program_name: '정신건강 교육 프로그램',
      program_type: '교육',
      target_group: '전체',
      description: '정신건강에 대한 기본 지식을 배우는 교육 프로그램입니다.',
      is_online_available: true,
      is_free: true,
      fee_amount: null,
      capacity: null,
      duration_minutes: null,
    },
    open: true,
    onOpenChange: () => {},
  },
  render: () => (
    <ProgramDetailModalWrapper
      program={{
        id: 5,
        program_name: '정신건강 교육 프로그램',
        program_type: '교육',
        target_group: '전체',
        description: '정신건강에 대한 기본 지식을 배우는 교육 프로그램입니다.',
        is_online_available: true,
        is_free: true,
        fee_amount: null,
        capacity: null,
        duration_minutes: null,
      }}
    />
  ),
};

/**
 * 닫힌 상태: 모달이 닫힌 상태로 버튼만 표시됩니다.
 */
export const Closed: Story = {
  args: {
    program: defaultProgram,
    open: false,
    onOpenChange: () => {},
  },
  render: () => <ProgramDetailModalWrapper program={defaultProgram} defaultOpen={false} />,
};

/**
 * 긴 설명이 있는 프로그램
 */
export const LongDescription: Story = {
  args: {
    program: {
      id: 6,
      program_name: '통합 정신건강 프로그램',
      program_type: '종합 프로그램',
      target_group: '전체',
      description: `이 프로그램은 정신건강의 다양한 측면을 다루는 종합 프로그램입니다.

총 12주 과정으로 진행되며, 다음과 같은 내용을 포함합니다:

1. 스트레스 관리 및 이완 기법
2. 감정 인식 및 조절
3. 대인관계 기술
4. 문제 해결 능력
5. 자기 돌봄 및 회복탄력성

각 세션은 이론 교육과 실습으로 구성되어 있으며, 소그룹 활동을 통해 참여자 간 경험을 공유하고 서로 지지할 수 있는 기회를 제공합니다.

프로그램 수료 시 수료증이 발급되며, 이후에도 정기적인 사후 모임을 통해 지속적인 관리를 받을 수 있습니다.`,
      is_online_available: true,
      is_free: false,
      fee_amount: 150000,
      capacity: 15,
      duration_minutes: 120,
    },
    open: true,
    onOpenChange: () => {},
  },
  render: () => (
    <ProgramDetailModalWrapper
      program={{
        id: 6,
        program_name: '통합 정신건강 프로그램',
        program_type: '종합 프로그램',
        target_group: '전체',
        description: `이 프로그램은 정신건강의 다양한 측면을 다루는 종합 프로그램입니다.

총 12주 과정으로 진행되며, 다음과 같은 내용을 포함합니다:

1. 스트레스 관리 및 이완 기법
2. 감정 인식 및 조절
3. 대인관계 기술
4. 문제 해결 능력
5. 자기 돌봄 및 회복탄력성

각 세션은 이론 교육과 실습으로 구성되어 있으며, 소그룹 활동을 통해 참여자 간 경험을 공유하고 서로 지지할 수 있는 기회를 제공합니다.

프로그램 수료 시 수료증이 발급되며, 이후에도 정기적인 사후 모임을 통해 지속적인 관리를 받을 수 있습니다.`,
        is_online_available: true,
        is_free: false,
        fee_amount: 150000,
        capacity: 15,
        duration_minutes: 120,
      }}
    />
  ),
};

/**
 * 유료이지만 금액 미정인 프로그램
 */
export const PaidWithoutAmount: Story = {
  args: {
    program: {
      id: 7,
      program_name: '맞춤형 심리검사',
      program_type: '심리검사',
      target_group: '전체',
      description: '개인에게 필요한 심리검사를 선택하여 실시하는 프로그램입니다.',
      is_online_available: false,
      is_free: false,
      fee_amount: null,
      capacity: null,
      duration_minutes: null,
    },
    open: true,
    onOpenChange: () => {},
  },
  render: () => (
    <ProgramDetailModalWrapper
      program={{
        id: 7,
        program_name: '맞춤형 심리검사',
        program_type: '심리검사',
        target_group: '전체',
        description: '개인에게 필요한 심리검사를 선택하여 실시하는 프로그램입니다.',
        is_online_available: false,
        is_free: false,
        fee_amount: null,
        capacity: null,
        duration_minutes: null,
      }}
    />
  ),
};

/**
 * ProgramCard Storybook 스토리
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProgramCard } from './ProgramCard';
import type { Program } from '@/types/center';

const meta = {
  title: 'Components/Center/ProgramCard',
  component: ProgramCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    program: {
      description: '프로그램 정보',
    },
    onClick: {
      description: '클릭 이벤트 핸들러',
      action: 'clicked',
    },
  },
} satisfies Meta<typeof ProgramCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseProgram: Program = {
  id: 1,
  program_name: '직장인 스트레스 관리 프로그램',
  program_type: '집단 상담',
  target_group: '직장인',
  description: '주 1회, 8회기 프로그램으로 직장에서의 스트레스 대처법을 배웁니다.',
  is_online_available: false,
  is_free: true,
  fee_amount: null,
  capacity: 12,
  duration_minutes: 90,
};

/**
 * 기본 프로그램 카드 (오프라인, 무료)
 */
export const Default: Story = {
  args: {
    program: baseProgram,
  },
};

/**
 * 온라인 + 무료 프로그램
 */
export const OnlineFree: Story = {
  args: {
    program: {
      ...baseProgram,
      program_name: '온라인 청소년 상담 프로그램',
      program_type: '집단 상담',
      target_group: '청소년',
      is_online_available: true,
      is_free: true,
      capacity: 15,
      duration_minutes: 60,
    },
  },
};

/**
 * 온라인 + 유료 프로그램
 */
export const OnlinePaid: Story = {
  args: {
    program: {
      ...baseProgram,
      program_name: '1:1 개인 심리 상담',
      program_type: '개인 상담',
      target_group: '전체',
      is_online_available: true,
      is_free: false,
      fee_amount: 50000,
      capacity: 1,
      duration_minutes: 50,
    },
  },
};

/**
 * 정원 및 시간 정보 없음
 */
export const WithoutDetails: Story = {
  args: {
    program: {
      ...baseProgram,
      program_name: '가족 상담 프로그램',
      program_type: '가족 상담',
      target_group: '가족',
      capacity: null,
      duration_minutes: null,
    },
  },
};

/**
 * 긴 프로그램명 (2줄 표시)
 */
export const LongProgramName: Story = {
  args: {
    program: {
      ...baseProgram,
      program_name:
        '직장 내 스트레스 완화 및 정신건강 증진을 위한 종합적인 상담 프로그램 (8주 과정)',
    },
  },
};

/**
 * 클릭 가능한 인터랙티브 예시
 */
export const Clickable: Story = {
  args: {
    program: baseProgram,
  },
  parameters: {
    docs: {
      description: {
        story:
          '프로그램 카드를 클릭하거나 Enter/Space 키를 눌러 상세 정보를 볼 수 있습니다.',
      },
    },
  },
};

/**
 * ProgramList Storybook 스토리
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProgramList } from './ProgramList';
import type { Program } from '@/types/center';

const meta = {
  title: 'Components/Center/ProgramList',
  component: ProgramList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    programs: {
      description: '프로그램 목록',
    },
    hasData: {
      description: '데이터 존재 여부',
    },
    onProgramClick: {
      description: '프로그램 클릭 이벤트 핸들러',
      action: 'program clicked',
    },
  },
} satisfies Meta<typeof ProgramList>;

export default meta;
type Story = StoryObj<typeof meta>;

// 샘플 프로그램 데이터
const samplePrograms: Program[] = [
  {
    id: 1,
    program_name: '직장인 스트레스 관리 프로그램',
    program_type: '집단 상담',
    target_group: '직장인',
    description: '주 1회, 8회기 프로그램',
    is_online_available: true,
    is_free: true,
    fee_amount: null,
    capacity: 12,
    duration_minutes: 90,
  },
  {
    id: 2,
    program_name: '청소년 마음건강 프로그램',
    program_type: '집단 상담',
    target_group: '청소년',
    description: '또래 관계, 학업 스트레스',
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
  {
    id: 4,
    program_name: '부부 상담 프로그램',
    program_type: '가족 상담',
    target_group: '부부',
    description: '관계 개선 프로그램',
    is_online_available: false,
    is_free: false,
    fee_amount: 80000,
    capacity: 2,
    duration_minutes: 90,
  },
];

/**
 * 기본 프로그램 목록 (3-4개)
 */
export const Default: Story = {
  args: {
    programs: samplePrograms.slice(0, 4),
    hasData: true,
    onProgramClick: () => {},
  },
};

/**
 * 정확히 5개의 프로그램 ("더보기" 버튼 없음)
 */
export const FivePrograms: Story = {
  args: {
    programs: [
      ...samplePrograms,
      {
        id: 5,
        program_name: '노인 정신건강 프로그램',
        program_type: '집단 상담',
        target_group: '노인',
        description: '치매 예방 및 우울증 관리',
        is_online_available: false,
        is_free: true,
        fee_amount: null,
        capacity: 15,
        duration_minutes: 60,
      },
    ],
    hasData: true,
    onProgramClick: () => {},
  },
};

/**
 * 5개 이상의 프로그램 ("더보기" 버튼 표시)
 */
export const MoreThanFive: Story = {
  args: {
    programs: [
      ...samplePrograms,
      {
        id: 5,
        program_name: '노인 정신건강 프로그램',
        program_type: '집단 상담',
        target_group: '노인',
        description: '치매 예방 및 우울증 관리',
        is_online_available: false,
        is_free: true,
        fee_amount: null,
        capacity: 15,
        duration_minutes: 60,
      },
      {
        id: 6,
        program_name: '육아 스트레스 관리 프로그램',
        program_type: '집단 상담',
        target_group: '육아맘',
        description: '양육 스트레스 해소',
        is_online_available: true,
        is_free: true,
        fee_amount: null,
        capacity: 12,
        duration_minutes: 90,
      },
      {
        id: 7,
        program_name: '학업 스트레스 상담',
        program_type: '개인 상담',
        target_group: '학생',
        description: '시험 불안 및 학업 부담 상담',
        is_online_available: true,
        is_free: false,
        fee_amount: 25000,
        capacity: 1,
        duration_minutes: 50,
      },
      {
        id: 8,
        program_name: '직장 내 갈등 해결 프로그램',
        program_type: '집단 상담',
        target_group: '직장인',
        description: '대인관계 개선 및 갈등 해결',
        is_online_available: false,
        is_free: true,
        fee_amount: null,
        capacity: 10,
        duration_minutes: 120,
      },
    ],
    hasData: true,
    onProgramClick: () => {},
  },
};

/**
 * 빈 상태 (프로그램 없음)
 */
export const Empty: Story = {
  args: {
    programs: [],
    hasData: false,
    onProgramClick: () => {},
  },
};

/**
 * 단일 프로그램
 */
export const SingleProgram: Story = {
  args: {
    programs: [samplePrograms[0]],
    hasData: true,
    onProgramClick: () => {},
  },
};

/**
 * 확장된 상태 (showAll=true)
 */
export const ExpandedView: Story = {
  args: {
    programs: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      program_name: `프로그램 ${i + 1}`,
      program_type: '집단 상담',
      target_group: '전체',
      description: `설명 ${i + 1}`,
      is_online_available: i % 2 === 0,
      is_free: i % 3 === 0,
      fee_amount: i % 3 === 0 ? null : 30000,
      capacity: 10,
      duration_minutes: 60,
    })),
    hasData: true,
    onProgramClick: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          '"더보기" 버튼을 클릭하면 모든 프로그램이 표시됩니다.',
      },
    },
  },
};

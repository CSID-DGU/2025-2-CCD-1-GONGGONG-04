/**
 * StaffList Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { StaffList } from './StaffList';
import type { Staff } from '@/types/center';

const meta: Meta<typeof StaffList> = {
  title: 'Center/StaffList',
  component: StaffList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '센터의 의료진 현황을 표시하는 컴포넌트입니다. 의료진 유형별 인원수와 설명을 카드 형식으로 보여줍니다.',
      },
    },
  },
  argTypes: {
    staff: {
      description: '의료진 목록',
      control: 'object',
    },
    totalStaff: {
      description: '총 의료진 수',
      control: 'number',
    },
    hasData: {
      description: '데이터 존재 여부',
      control: 'boolean',
    },
    className: {
      description: '추가 CSS 클래스',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StaffList>;

/**
 * 기본 의료진 목록
 */
export const Default: Story = {
  args: {
    staff: [
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
    ],
    totalStaff: 10,
    hasData: true,
  },
};

/**
 * 설명이 있는 의료진 목록
 */
export const WithDescriptions: Story = {
  args: {
    staff: [
      {
        staff_type: '정신건강의학과 전문의',
        staff_count: 2,
        description: '성인 우울증 및 불안장애 전문',
      },
      {
        staff_type: '임상심리사',
        staff_count: 3,
        description: '청소년 상담 전문, 심리검사 가능',
      },
      {
        staff_type: '사회복지사',
        staff_count: 4,
        description: '복지 제도 안내 및 자원 연계',
      },
      {
        staff_type: '간호사',
        staff_count: 2,
        description: '응급 대응 및 건강 상담',
      },
    ],
    totalStaff: 11,
    hasData: true,
  },
};

/**
 * 빈 상태 (데이터 없음)
 */
export const Empty: Story = {
  args: {
    staff: [],
    totalStaff: 0,
    hasData: false,
  },
};

/**
 * 단일 의료진 유형
 */
export const SingleStaff: Story = {
  args: {
    staff: [
      {
        staff_type: '정신건강의학과 전문의',
        staff_count: 1,
        description: null,
      },
    ],
    totalStaff: 1,
    hasData: true,
  },
};

/**
 * 많은 의료진 유형
 */
export const ManyStaff: Story = {
  args: {
    staff: [
      {
        staff_type: '정신건강의학과 전문의',
        staff_count: 3,
        description: '성인 및 청소년 정신과 진료',
      },
      {
        staff_type: '임상심리사',
        staff_count: 5,
        description: '심리상담 및 심리검사 전문',
      },
      {
        staff_type: '사회복지사',
        staff_count: 8,
        description: '사회복지 서비스 및 자원 연계',
      },
      {
        staff_type: '간호사',
        staff_count: 4,
        description: '간호 및 건강관리',
      },
      {
        staff_type: '정신건강전문요원',
        staff_count: 2,
        description: '정신건강 증진 프로그램 진행',
      },
      {
        staff_type: '상담사',
        staff_count: 6,
        description: '개인 및 집단 상담',
      },
      {
        staff_type: '작업치료사',
        staff_count: 2,
        description: '일상생활 능력 향상 치료',
      },
    ],
    totalStaff: 30,
    hasData: true,
  },
};

/**
 * 긴 설명이 있는 경우
 */
export const LongDescription: Story = {
  args: {
    staff: [
      {
        staff_type: '정신건강의학과 전문의',
        staff_count: 2,
        description:
          '서울대학교 의과대학 졸업, 대한신경정신의학회 정회원으로 우울증, 불안장애, 조현병 등 다양한 정신질환 치료 경험 보유',
      },
      {
        staff_type: '임상심리사',
        staff_count: 3,
        description:
          '청소년 및 성인 대상 심리상담 전문가로 10년 이상의 경력을 보유하고 있으며, 인지행동치료, 가족치료 등 다양한 상담 기법을 활용합니다.',
      },
    ],
    totalStaff: 5,
    hasData: true,
  },
};

/**
 * 커스텀 클래스 적용
 */
export const CustomClassName: Story = {
  args: {
    staff: [
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
    ],
    totalStaff: 5,
    hasData: true,
    className: 'shadow-lg',
  },
};

/**
 * 다양한 인원 수
 */
export const VariousStaffCounts: Story = {
  args: {
    staff: [
      {
        staff_type: '정신건강의학과 전문의',
        staff_count: 1,
        description: null,
      },
      {
        staff_type: '임상심리사',
        staff_count: 15,
        description: '다양한 전문 분야',
      },
      {
        staff_type: '사회복지사',
        staff_count: 8,
        description: null,
      },
      {
        staff_type: '간호사',
        staff_count: 3,
        description: null,
      },
    ],
    totalStaff: 27,
    hasData: true,
  },
};

/**
 * OperatingStatusBadge Storybook
 *
 * 센터 운영 상태 배지의 다양한 상태를 시연합니다
 */

import type { Meta, StoryObj } from '@storybook/react';
import { OperatingStatusBadge } from './OperatingStatusBadge';

const meta = {
  title: 'Map/OperatingStatusBadge',
  component: OperatingStatusBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '센터의 현재 운영 상태를 시각적으로 표시하는 배지 컴포넌트입니다. 상태별로 적절한 색상, 아이콘, 애니메이션을 제공하여 사용자가 한눈에 운영 상태를 파악할 수 있습니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      description: '운영 상태',
      control: 'select',
      options: ['OPEN', 'CLOSING_SOON', 'CLOSED', 'HOLIDAY', 'TEMP_CLOSED', 'NO_INFO'],
    },
    closingTime: {
      description: '마감 시간 (OPEN, CLOSING_SOON일 때)',
      control: 'text',
    },
    nextOpenDate: {
      description: '다음 운영 날짜 (CLOSED, HOLIDAY, TEMP_CLOSED일 때)',
      control: 'text',
    },
  },
} satisfies Meta<typeof OperatingStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 영업중 (마감시간 포함)
 */
export const Open: Story = {
  args: {
    status: 'OPEN',
    closingTime: '18:00',
  },
};

/**
 * 영업중 (마감시간 없음)
 */
export const OpenNoTime: Story = {
  args: {
    status: 'OPEN',
    closingTime: null,
  },
};

/**
 * 곧 마감
 */
export const ClosingSoon: Story = {
  args: {
    status: 'CLOSING_SOON',
    closingTime: '18:00',
  },
};

/**
 * 영업종료 (다음 오픈 날짜 포함)
 */
export const Closed: Story = {
  args: {
    status: 'CLOSED',
    nextOpenDate: '2025-01-16',
  },
};

/**
 * 영업종료 (다음 오픈 날짜 없음)
 */
export const ClosedNoDate: Story = {
  args: {
    status: 'CLOSED',
    nextOpenDate: null,
  },
};

/**
 * 휴무일
 */
export const Holiday: Story = {
  args: {
    status: 'HOLIDAY',
    nextOpenDate: '2025-01-17',
  },
};

/**
 * 임시휴무
 */
export const TemporarilyClosed: Story = {
  args: {
    status: 'TEMP_CLOSED',
    nextOpenDate: '2025-02-01',
  },
};

/**
 * 정보없음
 */
export const NoInfo: Story = {
  args: {
    status: 'NO_INFO',
  },
};

/**
 * 모든 상태 비교
 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <OperatingStatusBadge status="OPEN" closingTime="18:00" />
      <OperatingStatusBadge status="CLOSING_SOON" closingTime="18:00" />
      <OperatingStatusBadge status="CLOSED" nextOpenDate="2025-01-16" />
      <OperatingStatusBadge status="HOLIDAY" nextOpenDate="2025-01-17" />
      <OperatingStatusBadge status="TEMP_CLOSED" nextOpenDate="2025-02-01" />
      <OperatingStatusBadge status="NO_INFO" />
    </div>
  ),
};

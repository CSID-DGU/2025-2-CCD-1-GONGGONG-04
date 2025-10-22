/**
 * 마음이음 - 운영 상태 배지 Storybook
 *
 * Sprint 2: 통합 정보 제공 - 실시간 운영 상태 표시
 */

import type { Meta, StoryObj } from '@storybook/react';
import { OperatingStatusBadge } from './OperatingStatusBadge';

const meta: Meta<typeof OperatingStatusBadge> = {
  title: 'Center/OperatingStatusBadge',
  component: OperatingStatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['NO_INFO', 'TEMP_CLOSED', 'HOLIDAY', 'OPEN', 'CLOSING_SOON', 'CLOSED'],
      description: '운영 상태',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '배지 크기',
    },
    showIcon: {
      control: 'boolean',
      description: '아이콘 표시 여부',
    },
  },
};

export default meta;
type Story = StoryObj<typeof OperatingStatusBadge>;

/**
 * 기본 상태 - 운영 중
 */
export const Default: Story = {
  args: {
    status: 'OPEN',
  },
};

/**
 * 모든 상태 변형
 */
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <OperatingStatusBadge status="OPEN" />
      <OperatingStatusBadge status="CLOSING_SOON" />
      <OperatingStatusBadge status="CLOSED" />
      <OperatingStatusBadge status="HOLIDAY" />
      <OperatingStatusBadge status="TEMP_CLOSED" />
      <OperatingStatusBadge status="NO_INFO" />
    </div>
  ),
};

/**
 * 메시지 포함
 */
export const WithMessages: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <OperatingStatusBadge status="OPEN" message="18:00까지 운영" />
      <OperatingStatusBadge status="CLOSING_SOON" message="17:30 마감 예정" />
      <OperatingStatusBadge status="CLOSED" message="내일 09:00 오픈" />
      <OperatingStatusBadge status="HOLIDAY" message="설날 연휴" />
      <OperatingStatusBadge status="TEMP_CLOSED" message="시설 보수 중" />
      <OperatingStatusBadge status="NO_INFO" message="운영시간 문의 필요" />
    </div>
  ),
};

/**
 * 아이콘 없이
 */
export const WithoutIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <OperatingStatusBadge status="OPEN" showIcon={false} />
      <OperatingStatusBadge status="CLOSING_SOON" showIcon={false} />
      <OperatingStatusBadge status="CLOSED" showIcon={false} />
      <OperatingStatusBadge status="HOLIDAY" showIcon={false} />
      <OperatingStatusBadge status="TEMP_CLOSED" showIcon={false} />
      <OperatingStatusBadge status="NO_INFO" showIcon={false} />
    </div>
  ),
};

/**
 * 크기 변형
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 w-20">Small:</span>
        <OperatingStatusBadge status="OPEN" size="sm" />
        <OperatingStatusBadge status="CLOSING_SOON" size="sm" />
        <OperatingStatusBadge status="CLOSED" size="sm" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 w-20">Medium:</span>
        <OperatingStatusBadge status="OPEN" size="md" />
        <OperatingStatusBadge status="CLOSING_SOON" size="md" />
        <OperatingStatusBadge status="CLOSED" size="md" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 w-20">Large:</span>
        <OperatingStatusBadge status="OPEN" size="lg" />
        <OperatingStatusBadge status="CLOSING_SOON" size="lg" />
        <OperatingStatusBadge status="CLOSED" size="lg" />
      </div>
    </div>
  ),
};

/**
 * 센터 헤더에 사용하는 예시
 */
export const InCenterHeader: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h3 text-neutral-900">강남구정신건강복지센터</h2>
          <p className="text-small text-neutral-600">정신건강복지센터</p>
        </div>
        <OperatingStatusBadge status="OPEN" message="18:00까지" size="lg" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h3 text-neutral-900">서초구정신건강복지센터</h2>
          <p className="text-small text-neutral-600">정신건강복지센터</p>
        </div>
        <OperatingStatusBadge status="CLOSED" message="내일 09:00 오픈" size="lg" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h3 text-neutral-900">송파구정신건강복지센터</h2>
          <p className="text-small text-neutral-600">정신건강복지센터</p>
        </div>
        <OperatingStatusBadge status="HOLIDAY" message="공휴일" size="lg" />
      </div>
    </div>
  ),
};

/**
 * 카드 리스트에 사용하는 예시
 */
export const InCardList: Story = {
  render: () => (
    <div className="space-y-3 max-w-sm">
      {[
        { name: '강남구센터', status: 'OPEN' as const, message: '운영 중' },
        { name: '서초구센터', status: 'CLOSING_SOON' as const, message: '곧 마감' },
        { name: '송파구센터', status: 'CLOSED' as const, message: '마감' },
      ].map((center) => (
        <div
          key={center.name}
          className="flex items-center justify-between p-4 rounded-lg border border-neutral-200"
        >
          <div>
            <h3 className="text-body font-semibold">{center.name}</h3>
            <p className="text-small text-neutral-600">서울특별시</p>
          </div>
          <OperatingStatusBadge status={center.status} message={center.message} />
        </div>
      ))}
    </div>
  ),
};

/**
 * 인터랙티브 예시 - 실시간 상태 변경
 */
export const Interactive: Story = {
  args: {
    status: 'OPEN',
    message: '18:00까지 운영',
    showIcon: true,
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: '상태, 메시지, 아이콘 표시 여부, 크기를 변경하여 다양한 조합을 테스트할 수 있습니다.',
      },
    },
  },
};

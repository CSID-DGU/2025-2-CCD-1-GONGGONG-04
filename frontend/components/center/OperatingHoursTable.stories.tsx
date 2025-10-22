/**
 * 마음이음 - 운영시간 테이블 Storybook
 *
 * Sprint 2: 통합 정보 제공 - 실시간 운영 상태 표시
 */

import type { Meta, StoryObj } from '@storybook/react';
import { OperatingHoursTable } from './OperatingHoursTable';
import type { OperatingHour } from '@/types/operatingStatus';

const meta: Meta<typeof OperatingHoursTable> = {
  title: 'Center/OperatingHoursTable',
  component: OperatingHoursTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentDayOfWeek: {
      control: { type: 'number', min: 0, max: 6 },
      description: '현재 요일 (0=일요일, 6=토요일)',
    },
    compact: {
      control: 'boolean',
      description: '컴팩트 모드',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof OperatingHoursTable>;

// 샘플 운영시간 데이터
const sampleOperatingHours: OperatingHour[] = [
  { dayOfWeek: 0, dayName: '일요일', openTime: '10:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 6, dayName: '토요일', openTime: '09:00', closeTime: '13:00', isOpen: true },
];

/**
 * 기본 상태
 */
export const Default: Story = {
  args: {
    operatingHours: sampleOperatingHours,
  },
};

/**
 * 현재 요일 강조 (수요일)
 */
export const WithCurrentDay: Story = {
  args: {
    operatingHours: sampleOperatingHours,
    currentDayOfWeek: 3, // 수요일
  },
};

/**
 * 휴무일 포함
 */
export const WithClosedDays: Story = {
  args: {
    operatingHours: [
      { dayOfWeek: 0, dayName: '일요일', openTime: '', closeTime: '', isOpen: false },
      { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 6, dayName: '토요일', openTime: '', closeTime: '', isOpen: false },
    ],
    currentDayOfWeek: 1, // 월요일
  },
};

/**
 * 모든 요일 운영
 */
export const AllDaysOpen: Story = {
  args: {
    operatingHours: [
      { dayOfWeek: 0, dayName: '일요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 6, dayName: '토요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
    ],
    currentDayOfWeek: 5, // 금요일
  },
};

/**
 * 모든 요일 휴무
 */
export const AllDaysClosed: Story = {
  args: {
    operatingHours: [
      { dayOfWeek: 0, dayName: '일요일', openTime: '', closeTime: '', isOpen: false },
      { dayOfWeek: 1, dayName: '월요일', openTime: '', closeTime: '', isOpen: false },
      { dayOfWeek: 2, dayName: '화요일', openTime: '', closeTime: '', isOpen: false },
      { dayOfWeek: 3, dayName: '수요일', openTime: '', closeTime: '', isOpen: false },
      { dayOfWeek: 4, dayName: '목요일', openTime: '', closeTime: '', isOpen: false },
      { dayOfWeek: 5, dayName: '금요일', openTime: '', closeTime: '', isOpen: false },
      { dayOfWeek: 6, dayName: '토요일', openTime: '', closeTime: '', isOpen: false },
    ],
  },
};

/**
 * 컴팩트 모드
 */
export const Compact: Story = {
  args: {
    operatingHours: sampleOperatingHours,
    currentDayOfWeek: 2, // 화요일
    compact: true,
  },
};

/**
 * 다양한 운영시간
 */
export const VariedHours: Story = {
  args: {
    operatingHours: [
      { dayOfWeek: 0, dayName: '일요일', openTime: '', closeTime: '', isOpen: false },
      { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '20:00', isOpen: true },
      { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '20:00', isOpen: true },
      { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
      { dayOfWeek: 6, dayName: '토요일', openTime: '10:00', closeTime: '15:00', isOpen: true },
    ],
    currentDayOfWeek: 2, // 화요일
  },
};

/**
 * 센터 상세 페이지 컨텍스트
 */
export const InCenterDetailPage: Story = {
  render: () => (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-h3 text-neutral-900 mb-2">운영시간</h2>
        <p className="text-small text-neutral-600 mb-4">
          센터 방문 전 운영시간을 확인하세요
        </p>
      </div>
      <OperatingHoursTable
        operatingHours={sampleOperatingHours}
        currentDayOfWeek={new Date().getDay()}
      />
    </div>
  ),
};

/**
 * 카드 내부에서 사용
 */
export const InCard: Story = {
  render: () => (
    <div className="max-w-md p-6 rounded-lg border border-neutral-200 bg-white shadow-sm">
      <h3 className="text-h3 text-neutral-900 mb-4">운영시간 안내</h3>
      <OperatingHoursTable
        operatingHours={[
          { dayOfWeek: 0, dayName: '일요일', openTime: '', closeTime: '', isOpen: false },
          { dayOfWeek: 1, dayName: '월요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 2, dayName: '화요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 3, dayName: '수요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 4, dayName: '목요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 5, dayName: '금요일', openTime: '09:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 6, dayName: '토요일', openTime: '', closeTime: '', isOpen: false },
        ]}
        currentDayOfWeek={3}
        compact
      />
      <p className="text-small text-neutral-600 mt-4">
        ※ 점심시간: 12:00 ~ 13:00
      </p>
    </div>
  ),
};

/**
 * 인터랙티브 예시
 */
export const Interactive: Story = {
  args: {
    operatingHours: sampleOperatingHours,
    currentDayOfWeek: new Date().getDay(),
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          '현재 요일을 변경하여 강조 표시를 테스트할 수 있습니다. 컴팩트 모드를 토글하여 간격을 조절할 수 있습니다.',
      },
    },
  },
};

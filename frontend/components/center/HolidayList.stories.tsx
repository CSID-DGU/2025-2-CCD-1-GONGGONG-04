/**
 * 마음이음 - 휴무일 목록 Storybook
 *
 * Sprint 2: 통합 정보 제공 - 실시간 운영 상태 표시
 */

import type { Meta, StoryObj } from '@storybook/react';
import { HolidayList } from './HolidayList';
import type { Holiday } from '@/types/operatingStatus';

const meta: Meta<typeof HolidayList> = {
  title: 'Center/HolidayList',
  component: HolidayList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maxItems: {
      control: { type: 'number', min: 1, max: 10 },
      description: '표시할 최대 항목 수',
    },
    showType: {
      control: 'boolean',
      description: '휴무일 타입 배지 표시 여부',
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
type Story = StoryObj<typeof HolidayList>;

// 샘플 휴무일 데이터
const sampleHolidays: Holiday[] = [
  { date: '2025-01-01', name: '신정', type: 'public' },
  { date: '2025-01-28', name: '설날 연휴', type: 'public' },
  { date: '2025-01-29', name: '설날', type: 'public' },
  { date: '2025-01-30', name: '설날 연휴', type: 'public' },
  { date: '2025-03-01', name: '삼일절', type: 'public' },
];

const regularHolidays: Holiday[] = [
  { date: '2025-01-05', name: '매주 일요일', type: 'regular' },
  { date: '2025-01-12', name: '매주 일요일', type: 'regular' },
  { date: '2025-01-19', name: '매주 일요일', type: 'regular' },
  { date: '2025-01-26', name: '매주 일요일', type: 'regular' },
];

const temporaryHolidays: Holiday[] = [
  { date: '2025-01-15', name: '시설 보수', type: 'temporary' },
  { date: '2025-02-10', name: '직원 연수', type: 'temporary' },
];

/**
 * 기본 상태
 */
export const Default: Story = {
  args: {
    holidays: sampleHolidays,
  },
};

/**
 * 공휴일만
 */
export const PublicHolidaysOnly: Story = {
  args: {
    holidays: sampleHolidays,
  },
};

/**
 * 정기휴무만
 */
export const RegularHolidaysOnly: Story = {
  args: {
    holidays: regularHolidays,
  },
};

/**
 * 임시휴무만
 */
export const TemporaryHolidaysOnly: Story = {
  args: {
    holidays: temporaryHolidays,
  },
};

/**
 * 혼합 타입
 */
export const MixedTypes: Story = {
  args: {
    holidays: [
      ...sampleHolidays.slice(0, 2),
      ...regularHolidays.slice(0, 2),
      ...temporaryHolidays,
    ],
  },
};

/**
 * 빈 목록
 */
export const Empty: Story = {
  args: {
    holidays: [],
  },
};

/**
 * 빈 목록 (커스텀 메시지)
 */
export const EmptyWithCustomMessage: Story = {
  args: {
    holidays: [],
    emptyMessage: '현재 예정된 휴무일이 없습니다.',
  },
};

/**
 * 타입 배지 없이
 */
export const WithoutTypeBadges: Story = {
  args: {
    holidays: sampleHolidays,
    showType: false,
  },
};

/**
 * 최대 3개 표시
 */
export const MaxThreeItems: Story = {
  args: {
    holidays: sampleHolidays,
    maxItems: 3,
  },
};

/**
 * 더보기 버튼 (많은 항목)
 */
export const WithManyItems: Story = {
  args: {
    holidays: [
      { date: '2025-01-01', name: '신정', type: 'public' },
      { date: '2025-01-28', name: '설날 연휴', type: 'public' },
      { date: '2025-01-29', name: '설날', type: 'public' },
      { date: '2025-01-30', name: '설날 연휴', type: 'public' },
      { date: '2025-03-01', name: '삼일절', type: 'public' },
      { date: '2025-05-05', name: '어린이날', type: 'public' },
      { date: '2025-06-06', name: '현충일', type: 'public' },
      { date: '2025-08-15', name: '광복절', type: 'public' },
      { date: '2025-09-16', name: '추석 연휴', type: 'public' },
      { date: '2025-09-17', name: '추석', type: 'public' },
      { date: '2025-09-18', name: '추석 연휴', type: 'public' },
      { date: '2025-10-03', name: '개천절', type: 'public' },
      { date: '2025-10-09', name: '한글날', type: 'public' },
      { date: '2025-12-25', name: '크리스마스', type: 'public' },
    ],
    maxItems: 5,
  },
};

/**
 * 센터 상세 페이지 컨텍스트
 */
export const InCenterDetailPage: Story = {
  render: () => (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-h3 text-neutral-900 mb-2">휴무일 안내</h2>
        <p className="text-small text-neutral-600 mb-4">
          방문 전 휴무일을 확인하세요
        </p>
      </div>
      <HolidayList
        holidays={[
          { date: '2025-01-01', name: '신정', type: 'public' },
          { date: '2025-01-28', name: '설날 연휴', type: 'public' },
          { date: '2025-01-29', name: '설날', type: 'public' },
          { date: '2025-01-30', name: '설날 연휴', type: 'public' },
          { date: '2025-01-15', name: '시설 보수', type: 'temporary' },
        ]}
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
      <h3 className="text-h3 text-neutral-900 mb-4">이번 달 휴무일</h3>
      <HolidayList
        holidays={[
          { date: '2025-01-01', name: '신정', type: 'public' },
          { date: '2025-01-05', name: '매주 일요일', type: 'regular' },
          { date: '2025-01-12', name: '매주 일요일', type: 'regular' },
          { date: '2025-01-19', name: '매주 일요일', type: 'regular' },
        ]}
        maxItems={3}
      />
      <p className="text-small text-neutral-600 mt-4">
        ※ 공휴일은 관공서 일정에 따릅니다
      </p>
    </div>
  ),
};

/**
 * 사이드 패널에서 사용
 */
export const InSidePanel: Story = {
  render: () => (
    <div className="w-80 p-4 bg-neutral-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-body font-semibold text-neutral-900">
          휴무일 정보
        </h4>
        <span className="text-small text-neutral-600">
          {sampleHolidays.length}일
        </span>
      </div>
      <HolidayList
        holidays={sampleHolidays}
        maxItems={3}
        showType={true}
      />
    </div>
  ),
};

/**
 * 정렬 확인 (날짜순)
 */
export const ChronologicalOrder: Story = {
  args: {
    holidays: [
      { date: '2025-03-01', name: '삼일절', type: 'public' },
      { date: '2025-01-01', name: '신정', type: 'public' },
      { date: '2025-02-15', name: '시설 점검', type: 'temporary' },
      { date: '2025-01-29', name: '설날', type: 'public' },
    ],
  },
};

/**
 * 인터랙티브 예시
 */
export const Interactive: Story = {
  args: {
    holidays: sampleHolidays,
    maxItems: 5,
    showType: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '최대 항목 수와 타입 표시 여부를 변경하여 다양한 조합을 테스트할 수 있습니다. 더보기 버튼을 클릭하여 전체 목록을 확인할 수 있습니다.',
      },
    },
  },
};

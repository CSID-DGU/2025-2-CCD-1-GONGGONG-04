/**
 * RadiusSelector Component Stories
 *
 * Sprint 2: Map-based Center Search - Day 8
 * 검색 반경 선택 드롭다운 컴포넌트
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RadiusSelector } from './RadiusSelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import type { RadiusType } from '@/store/mapStore';

const meta: Meta<typeof RadiusSelector> = {
  title: 'Map/RadiusSelector',
  component: RadiusSelector,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '지도 검색 반경을 선택하는 드롭다운 컴포넌트입니다. 1km, 3km, 5km, 10km, 전체 옵션을 제공합니다.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadiusSelector>;

/**
 * 기본 상태
 * Note: 실제 컴포넌트는 Zustand store를 사용하므로 Storybook에서는 초기값이 표시됩니다.
 */
export const Default: Story = {};

/**
 * 반경 옵션 데모
 * 각 옵션의 표시 형태를 보여줍니다.
 */
const RADIUS_OPTIONS: Array<{ value: RadiusType; label: string }> = [
  { value: '1', label: '반경 1km' },
  { value: '3', label: '반경 3km' },
  { value: '5', label: '반경 5km' },
  { value: '10', label: '반경 10km' },
  { value: 'all', label: '전체' },
];

export const AllOptions: Story = {
  render: () => (
    <div className="space-y-3">
      {RADIUS_OPTIONS.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-lavender-600" aria-hidden="true" />
          <div className="w-36 px-3 py-2 border border-gray-300 rounded-md text-sm">
            {option.label}
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '선택 가능한 모든 반경 옵션을 나열합니다.',
      },
    },
  },
};

/**
 * 인터랙티브 예시 (Controlled Component)
 * Zustand 없이 독립적으로 동작하는 버전
 */
const InteractiveComponent = () => {
  const [radius, setRadius] = useState<RadiusType>('5');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-lavender-600 hidden sm:block" aria-hidden="true" />
        <Select value={radius} onValueChange={(value) => setRadius(value as RadiusType)}>
          <SelectTrigger
            className="w-32 sm:w-36 h-11 border-gray-300 focus:ring-lavender-500 focus:border-lavender-500"
            aria-label="반경 선택"
          >
            <SelectValue placeholder="반경 선택" />
          </SelectTrigger>
          <SelectContent>
            {RADIUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-small text-neutral-700">선택한 반경: {radius}</p>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveComponent />,
  parameters: {
    docs: {
      description: {
        story: '드롭다운을 직접 조작하여 반경 변경 동작을 테스트할 수 있습니다.',
      },
    },
  },
};

/**
 * 모바일 뷰 (아이콘 숨김)
 */
const MobileViewComponent = () => {
  const [radius, setRadius] = useState<RadiusType>('3');

  return (
    <div className="w-32">
      <Select value={radius} onValueChange={(value) => setRadius(value as RadiusType)}>
        <SelectTrigger
          className="w-32 h-11 border-gray-300 focus:ring-lavender-500 focus:border-lavender-500"
          aria-label="반경 선택"
        >
          <SelectValue placeholder="반경 선택" />
        </SelectTrigger>
        <SelectContent>
          {RADIUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const MobileView: Story = {
  render: () => <MobileViewComponent />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '모바일 화면에서는 MapPin 아이콘이 숨겨지고 더 좁은 너비로 표시됩니다.',
      },
    },
  },
};

/**
 * 각 반경별 사용 시나리오
 */
export const UseCases: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="p-4 border border-neutral-200 rounded-lg">
        <h4 className="text-body font-semibold mb-2">반경 1km</h4>
        <p className="text-small text-neutral-600">
          도보 거리 내 센터 검색 (걸어서 10-15분)
        </p>
      </div>
      <div className="p-4 border border-neutral-200 rounded-lg">
        <h4 className="text-body font-semibold mb-2">반경 3km</h4>
        <p className="text-small text-neutral-600">
          자전거/대중교통 거리 (이동 15-20분)
        </p>
      </div>
      <div className="p-4 border border-neutral-200 rounded-lg">
        <h4 className="text-body font-semibold mb-2">반경 5km</h4>
        <p className="text-small text-neutral-600">
          차량 이용 시 편한 거리 (이동 20-30분)
        </p>
      </div>
      <div className="p-4 border border-neutral-200 rounded-lg">
        <h4 className="text-body font-semibold mb-2">반경 10km</h4>
        <p className="text-small text-neutral-600">
          넓은 지역 검색 (이동 30-40분)
        </p>
      </div>
      <div className="p-4 border border-lavender-200 bg-lavender-50 rounded-lg">
        <h4 className="text-body font-semibold mb-2">전체</h4>
        <p className="text-small text-neutral-700">
          거리 제한 없이 모든 센터 표시 (특수한 서비스 검색 시)
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '각 반경 옵션의 실제 사용 시나리오와 예상 이동 시간',
      },
    },
  },
};

/**
 * 반응형 디자인
 */
export const ResponsiveDesign: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-h4 mb-3">Desktop (≥640px)</h3>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-lavender-600" aria-hidden="true" />
          <div className="w-36 px-3 py-2 border border-gray-300 rounded-md text-sm">
            반경 5km
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-h4 mb-3">Mobile (&lt;640px)</h3>
        <div className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm">
          반경 5km
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '화면 크기에 따라 아이콘과 너비가 조정됩니다.',
      },
    },
  },
};

/**
 * 포커스 상태 (키보드 네비게이션)
 */
const FocusStateComponent = () => {
  const [radius, setRadius] = useState<RadiusType>('5');

  return (
    <div className="space-y-4">
      <p className="text-small text-neutral-600">
        Tab 키를 눌러 포커스를 이동하고 Enter 키로 드롭다운을 열어보세요.
      </p>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-lavender-600" aria-hidden="true" />
        <Select value={radius} onValueChange={(value) => setRadius(value as RadiusType)}>
          <SelectTrigger
            className="w-36 h-11 border-gray-300 focus:ring-lavender-500 focus:border-lavender-500"
            aria-label="반경 선택"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RADIUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const FocusState: Story = {
  render: () => <FocusStateComponent />,
  parameters: {
    docs: {
      description: {
        story: '키보드 네비게이션 시 lavender-500 포커스 링이 표시됩니다.',
      },
    },
  },
};

/**
 * 접근성 테스트
 */
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">ARIA Label</h3>
        <p className="text-xs text-neutral-600 mb-2">
          SelectTrigger에 aria-label=&quot;반경 선택&quot; 제공
        </p>
        <RadiusSelector />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Keyboard Navigation</h3>
        <p className="text-xs text-neutral-600 mb-2">
          Tab: 포커스 이동 | Enter/Space: 드롭다운 열기 | Arrow: 옵션 선택 | Esc: 닫기
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Icon aria-hidden</h3>
        <p className="text-xs text-neutral-600 mb-2">
          MapPin 아이콘은 장식용이므로 aria-hidden=&quot;true&quot; 설정
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '접근성 기능: ARIA labels, 키보드 네비게이션, 스크린리더 지원',
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'label', enabled: true },
          { id: 'aria-allowed-attr', enabled: true },
        ],
      },
    },
  },
};

/**
 * 검색 바와 함께 사용하는 예시
 */
const WithSearchBarComponent = () => {
  const [radius, setRadius] = useState<RadiusType>('5');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
      {/* Search Input */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="지역, 센터명 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-11 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-lavender-500 focus:border-lavender-500"
        />
      </div>

      {/* Radius Selector */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-lavender-600 hidden sm:block" aria-hidden="true" />
        <Select value={radius} onValueChange={(value) => setRadius(value as RadiusType)}>
          <SelectTrigger
            className="w-32 sm:w-36 h-11 border-gray-300 focus:ring-lavender-500 focus:border-lavender-500"
            aria-label="반경 선택"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RADIUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const WithSearchBar: Story = {
  render: () => <WithSearchBarComponent />,
  parameters: {
    docs: {
      description: {
        story: '실제 UI에서 검색 입력창과 함께 사용되는 형태',
      },
    },
  },
};

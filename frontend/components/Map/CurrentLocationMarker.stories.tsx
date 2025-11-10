/**
 * CurrentLocationMarker Component Stories
 *
 * Sprint 2: Map-based Center Search
 * 현재 위치 마커 컴포넌트의 다양한 상태를 시각화
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CurrentLocationMarker } from './CurrentLocationMarker';

const meta: Meta<typeof CurrentLocationMarker> = {
  title: 'Map/CurrentLocationMarker',
  component: CurrentLocationMarker,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '사용자의 현재 위치를 지도에 파란색 점으로 표시하고, GPS 정확도에 따라 원형 범위를 시각화합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    map: {
      description: 'Kakao Map 인스턴스',
      control: false,
    },
    position: {
      description: 'Geolocation Position 객체',
      control: false,
    },
    showAccuracyFeedback: {
      description: '정확도 피드백 UI 표시 여부',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CurrentLocationMarker>;

/**
 * Mock Kakao Map instance for Storybook
 */
const createMockMap = () => ({
  panTo: () => {},
  getCenter: () => ({ getLat: () => 37.5665, getLng: () => 126.978 }),
  getLevel: () => 3,
} as unknown as kakao.maps.Map);

/**
 * Mock GeolocationPosition factory
 */
const createMockPosition = (accuracy: number): GeolocationPosition => ({
  coords: {
    latitude: 37.5665,
    longitude: 126.978,
    accuracy,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
});

/**
 * 기본 상태 - 높은 정확도
 */
export const Default: Story = {
  args: {
    map: createMockMap(),
    position: createMockPosition(25),
    showAccuracyFeedback: true,
  },
};

/**
 * 정확도 레벨별 피드백
 */
export const AccuracyLevels: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">높은 정확도 (&lt;50m)</h3>
        <CurrentLocationMarker
          map={createMockMap()}
          position={createMockPosition(25)}
          showAccuracyFeedback={true}
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">보통 정확도 (50-200m)</h3>
        <CurrentLocationMarker
          map={createMockMap()}
          position={createMockPosition(120)}
          showAccuracyFeedback={true}
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">낮은 정확도 (&gt;200m)</h3>
        <CurrentLocationMarker
          map={createMockMap()}
          position={createMockPosition(350)}
          showAccuracyFeedback={true}
        />
      </div>
    </div>
  ),
};

/**
 * 높은 정확도 (GPS 정확)
 */
export const HighAccuracy: Story = {
  args: {
    map: createMockMap(),
    position: createMockPosition(15),
    showAccuracyFeedback: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'GPS 신호가 강할 때: 오차 15m 이하, 녹색 피드백',
      },
    },
  },
};

/**
 * 보통 정확도 (실내/도심)
 */
export const MediumAccuracy: Story = {
  args: {
    map: createMockMap(),
    position: createMockPosition(85),
    showAccuracyFeedback: true,
  },
  parameters: {
    docs: {
      description: {
        story: '실내나 고층 빌딩 사이: 오차 50-200m, 노란색 피드백',
      },
    },
  },
};

/**
 * 낮은 정확도 (지하/터널)
 */
export const LowAccuracy: Story = {
  args: {
    map: createMockMap(),
    position: createMockPosition(450),
    showAccuracyFeedback: true,
  },
  parameters: {
    docs: {
      description: {
        story: '지하나 터널: 오차 200m 이상, 빨간색 경고 및 주소 검색 권장',
      },
    },
  },
};

/**
 * 피드백 없이 표시
 */
export const WithoutFeedback: Story = {
  args: {
    map: createMockMap(),
    position: createMockPosition(25),
    showAccuracyFeedback: false,
  },
  parameters: {
    docs: {
      description: {
        story: '정확도 피드백 UI를 숨긴 상태 (지도만 표시)',
      },
    },
  },
};

/**
 * 엣지 케이스 - 매우 낮은 정확도
 */
export const VeryLowAccuracy: Story = {
  args: {
    map: createMockMap(),
    position: createMockPosition(1000),
    showAccuracyFeedback: true,
  },
  parameters: {
    docs: {
      description: {
        story: '극단적으로 낮은 정확도 (1km 오차): 위치 기반 검색 불가능',
      },
    },
  },
};

/**
 * 인터랙티브 예시
 */
export const Interactive: Story = {
  args: {
    map: createMockMap(),
    position: createMockPosition(100),
    showAccuracyFeedback: true,
  },
  parameters: {
    docs: {
      description: {
        story: '정확도 값을 조정하여 다양한 피드백 상태를 테스트할 수 있습니다.',
      },
    },
  },
};

/**
 * 실제 사용 시나리오
 */
export const RealWorldScenarios: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-h4 mb-2">야외 (강남역 앞)</h3>
        <p className="text-small text-neutral-600 mb-2">
          GPS 신호 양호, 높은 정확도
        </p>
        <CurrentLocationMarker
          map={createMockMap()}
          position={createMockPosition(12)}
          showAccuracyFeedback={true}
        />
      </div>
      <div>
        <h3 className="text-h4 mb-2">실내 (카페 내부)</h3>
        <p className="text-small text-neutral-600 mb-2">
          Wi-Fi 위치 기반, 중간 정확도
        </p>
        <CurrentLocationMarker
          map={createMockMap()}
          position={createMockPosition(150)}
          showAccuracyFeedback={true}
        />
      </div>
      <div>
        <h3 className="text-h4 mb-2">지하철역 (지하)</h3>
        <p className="text-small text-neutral-600 mb-2">
          GPS 신호 약함, 낮은 정확도
        </p>
        <CurrentLocationMarker
          map={createMockMap()}
          position={createMockPosition(500)}
          showAccuracyFeedback={true}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '실제 사용자가 마주할 수 있는 다양한 환경별 정확도 시나리오',
      },
    },
  },
};

/**
 * 접근성 테스트
 */
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">ARIA Labels</h3>
        <p className="text-xs text-neutral-600 mb-2">
          Alert 컴포넌트는 자동으로 role=&quot;alert&quot; 제공
        </p>
        <CurrentLocationMarker
          map={createMockMap()}
          position={createMockPosition(25)}
          showAccuracyFeedback={true}
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Icon aria-hidden</h3>
        <p className="text-xs text-neutral-600 mb-2">
          아이콘은 장식용이므로 aria-hidden=&quot;true&quot; 설정
        </p>
        <CurrentLocationMarker
          map={createMockMap()}
          position={createMockPosition(120)}
          showAccuracyFeedback={true}
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Color Contrast</h3>
        <p className="text-xs text-neutral-600 mb-2">
          모든 상태 색상이 WCAG AA 기준 충족
        </p>
        <CurrentLocationMarker
          map={createMockMap()}
          position={createMockPosition(350)}
          showAccuracyFeedback={true}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '접근성 기능 검증: ARIA labels, 색상 대비, 스크린리더 지원',
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-allowed-attr', enabled: true },
        ],
      },
    },
  },
};

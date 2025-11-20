import type { Meta, StoryObj } from '@storybook/react';
import BottomNavigation from './BottomNavigation';

const meta = {
  title: 'Layout/BottomNavigation',
  component: BottomNavigation,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/map',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 지도 검색 탭 활성화 상태
 * pathname: /map
 */
export const MapActive: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/map',
      },
    },
  },
};

/**
 * 센터 목록 탭 활성화 상태
 * pathname: /centers
 */
export const CentersActive: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/centers',
      },
    },
  },
};

/**
 * 자가진단 탭 활성화 상태
 * pathname: /assessment
 */
export const AssessmentActive: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/assessment',
      },
    },
  },
};

/**
 * 페이지 전환 인터랙션 테스트
 * 탭을 클릭하면 활성 상태가 변경됩니다
 */
export const Interactive: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/map',
      },
    },
  },
  render: () => (
    <div className="relative h-screen">
      <div className="flex flex-col h-full">
        {/* 페이지 내용 영역 */}
        <div className="flex-1 p-8 bg-neutral-50">
          <h2 className="text-h2 font-semibold mb-4">현재 페이지</h2>
          <p className="text-body text-neutral-600">
            하단 네비게이션 탭을 클릭하면 페이지가 전환됩니다.
          </p>
          <p className="text-small text-neutral-500 mt-2">
            Storybook에서는 실제 라우팅이 작동하지 않지만, 활성 상태 스타일을
            확인할 수 있습니다.
          </p>
        </div>

        {/* BottomNavigation */}
        <BottomNavigation />
      </div>
    </div>
  ),
};

/**
 * 모바일 뷰포트 테스트
 * 작은 화면에서의 레이아웃 확인
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/map',
      },
    },
  },
};

/**
 * 태블릿 뷰포트 테스트
 * 중간 크기 화면에서의 레이아웃 확인
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/centers',
      },
    },
  },
};

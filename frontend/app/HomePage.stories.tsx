import type { Meta, StoryObj } from '@storybook/react';
import HomePage from './page';

const meta = {
  title: 'Pages/HomePage',
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 홈 페이지 기본 화면
 * - 서비스 소개
 * - 주요 기능 4개 카드 (2x2 그리드)
 * - 이용 안내
 * - 긴급 연락처
 */
export const Default: Story = {};

/**
 * 모바일 뷰포트
 * 작은 화면에서의 레이아웃 확인
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * 태블릿 뷰포트
 * 중간 크기 화면에서의 레이아웃 확인
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * 데스크톱 뷰포트
 * 큰 화면에서의 레이아웃 확인
 */
export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

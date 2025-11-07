/**
 * RatingDisplay Storybook
 *
 * 센터 평점 및 리뷰 개수 표시 컴포넌트의 다양한 상태를 시연합니다
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RatingDisplay } from './RatingDisplay';

const meta = {
  title: 'Map/RatingDisplay',
  component: RatingDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '센터의 평균 별점과 리뷰 개수를 표시하는 컴포넌트입니다. 별 아이콘, 평점 숫자, 리뷰 개수 배지를 조합하여 시각적으로 명확한 정보를 제공합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    rating: {
      description: '평균 별점 (0-5)',
      control: { type: 'number', min: 0, max: 5, step: 0.1 },
    },
    reviewCount: {
      description: '리뷰 개수',
      control: { type: 'number', min: 0, step: 1 },
    },
    size: {
      description: '크기',
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof RatingDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 크기 (md)
 */
export const Default: Story = {
  args: {
    rating: 4.5,
    reviewCount: 42,
    size: 'md',
  },
};

/**
 * 작은 크기 (sm)
 */
export const Small: Story = {
  args: {
    rating: 4.5,
    reviewCount: 42,
    size: 'sm',
  },
};

/**
 * 큰 크기 (lg)
 */
export const Large: Story = {
  args: {
    rating: 4.5,
    reviewCount: 42,
    size: 'lg',
  },
};

/**
 * 완벽한 평점 (5.0)
 */
export const PerfectRating: Story = {
  args: {
    rating: 5.0,
    reviewCount: 127,
    size: 'md',
  },
};

/**
 * 높은 평점 (4.8)
 */
export const HighRating: Story = {
  args: {
    rating: 4.8,
    reviewCount: 89,
    size: 'md',
  },
};

/**
 * 중간 평점 (3.5)
 */
export const MediumRating: Story = {
  args: {
    rating: 3.5,
    reviewCount: 25,
    size: 'md',
  },
};

/**
 * 낮은 평점 (2.3)
 */
export const LowRating: Story = {
  args: {
    rating: 2.3,
    reviewCount: 8,
    size: 'md',
  },
};

/**
 * 리뷰가 적은 경우
 */
export const FewReviews: Story = {
  args: {
    rating: 4.2,
    reviewCount: 3,
    size: 'md',
  },
};

/**
 * 리뷰가 많은 경우
 */
export const ManyReviews: Story = {
  args: {
    rating: 4.6,
    reviewCount: 542,
    size: 'md',
  },
};

/**
 * 리뷰 없음 (0)
 */
export const NoReviews: Story = {
  args: {
    rating: 0,
    reviewCount: 0,
    size: 'md',
  },
};

/**
 * 크기 비교
 */
export const SizeComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 w-16">Small:</span>
        <RatingDisplay rating={4.5} reviewCount={42} size="sm" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 w-16">Medium:</span>
        <RatingDisplay rating={4.5} reviewCount={42} size="md" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600 w-16">Large:</span>
        <RatingDisplay rating={4.5} reviewCount={42} size="lg" />
      </div>
    </div>
  ),
};

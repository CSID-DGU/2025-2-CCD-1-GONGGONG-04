import type { Meta, StoryObj } from '@storybook/react';
import { CenterHeader } from './CenterHeader';

const meta: Meta<typeof CenterHeader> = {
  title: 'Center/CenterHeader',
  component: CenterHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onShare: { action: 'shared' },
    onFavorite: { action: 'favorited' },
    isFavorited: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CenterHeader>;

/**
 * 기본 상태 - 리뷰가 있는 센터
 */
export const Default: Story = {
  args: {
    centerName: '강남구정신건강복지센터',
    centerType: '정신건강복지센터',
    avgRating: 4.5,
    reviewCount: 123,
    isFavorited: false,
  },
};

/**
 * 즐겨찾기 활성화 상태
 */
export const Favorited: Story = {
  args: {
    centerName: '서울시립청소년상담복지센터',
    centerType: '청소년상담복지센터',
    avgRating: 4.8,
    reviewCount: 87,
    isFavorited: true,
  },
};

/**
 * 리뷰가 없는 센터
 */
export const NoReviews: Story = {
  args: {
    centerName: '신규 개설 센터',
    centerType: 'Wee센터',
    avgRating: 0,
    reviewCount: 0,
    isFavorited: false,
  },
};

/**
 * 매우 긴 센터명
 */
export const LongCenterName: Story = {
  args: {
    centerName:
      '서울특별시 강남구 역삼동 청소년 심리 상담 및 정신건강 증진 복지 센터',
    centerType: '정신건강복지센터',
    avgRating: 4.2,
    reviewCount: 456,
    isFavorited: false,
  },
};

/**
 * 낮은 평점
 */
export const LowRating: Story = {
  args: {
    centerName: '테스트 센터',
    centerType: '상담센터',
    avgRating: 2.3,
    reviewCount: 12,
    isFavorited: false,
  },
};

/**
 * 높은 평점과 많은 리뷰
 */
export const HighRatingManyReviews: Story = {
  args: {
    centerName: '인기 상담 센터',
    centerType: '청소년상담복지센터',
    avgRating: 4.9,
    reviewCount: 1234,
    isFavorited: true,
  },
};

/**
 * 인터랙티브 예시 - 모든 기능 활성화
 */
export const Interactive: Story = {
  args: {
    centerName: '인터랙티브 센터',
    centerType: 'Wee센터',
    avgRating: 4.5,
    reviewCount: 100,
    isFavorited: false,
  },
  parameters: {
    docs: {
      description: {
        story: '공유하기와 즐겨찾기 버튼을 클릭하여 인터랙션을 테스트할 수 있습니다.',
      },
    },
  },
};

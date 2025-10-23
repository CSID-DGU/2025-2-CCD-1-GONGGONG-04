import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ReviewCard } from './ReviewCard';
import type { Review } from '@/types/review';

const meta = {
  title: 'Reviews/ReviewCard',
  component: ReviewCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onReactionClick: { action: 'reaction-clicked' },
    onEdit: { action: 'edit-clicked' },
    onDelete: { action: 'delete-clicked' },
  },
} satisfies Meta<typeof ReviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseReview: Review = {
  id: 1,
  rating: 5,
  title: '친절하고 전문적인 상담',
  content: '처음 방문했는데 상담사분이 정말 친절하게 대해주셨어요. 시설도 깨끗하고 편안한 분위기에서 상담을 받을 수 있었습니다.',
  visit_date: '2025-01-15',
  helpful_count: 12,
  unhelpful_count: 1,
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  user: {
    id: 101,
    nickname: '김철수',
    avatar_url: null,
  },
  is_my_review: false,
  my_reaction: null,
};

export const Default: Story = {
  args: {
    review: baseReview,
    onReactionClick: fn(),
  },
};

export const WithAvatar: Story = {
  args: {
    review: {
      ...baseReview,
      user: {
        ...baseReview.user,
        avatar_url: 'https://i.pravatar.cc/150?u=user1',
      },
    },
    onReactionClick: fn(),
  },
};

export const MyReview: Story = {
  args: {
    review: {
      ...baseReview,
      is_my_review: true,
      user: {
        id: 1,
        nickname: '나',
        avatar_url: 'https://i.pravatar.cc/150?u=me',
      },
    },
    onReactionClick: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
};

export const LongContent: Story = {
  args: {
    review: {
      ...baseReview,
      title: '매우 만족스러운 상담 경험',
      content:
        '이 센터는 제가 지금까지 방문한 곳 중 가장 전문적이고 체계적인 곳이었습니다. 처음 전화 예약부터 상담 종료까지 모든 과정이 매끄럽게 진행되었고, 상담사분께서 제 상황을 정확히 이해하고 적절한 조언을 해주셨습니다.\n\n특히 인상 깊었던 점은 비밀보장과 관련하여 세심하게 설명해주신 부분이었습니다. 처음 상담을 받는 입장에서 걱정이 많았는데, 그런 불안감을 잘 해소해주셨어요.\n\n시설도 매우 깨끗하고 쾌적했으며, 대기 공간도 편안하게 꾸며져 있었습니다. 다음에도 꼭 다시 방문하고 싶습니다.',
    },
    onReactionClick: fn(),
  },
};

export const NoTitle: Story = {
  args: {
    review: {
      ...baseReview,
      title: null,
    },
    onReactionClick: fn(),
  },
};

export const NoVisitDate: Story = {
  args: {
    review: {
      ...baseReview,
      visit_date: null,
    },
    onReactionClick: fn(),
  },
};

export const LowRating: Story = {
  args: {
    review: {
      ...baseReview,
      rating: 2,
      title: '아쉬운 점이 많았습니다',
      content: '예약 시간보다 30분이나 늦게 시작했고, 상담 시간도 너무 짧았어요. 좀 더 신경써주셨으면 합니다.',
      helpful_count: 3,
      unhelpful_count: 8,
    },
    onReactionClick: fn(),
  },
};

export const HelpfulReaction: Story = {
  args: {
    review: {
      ...baseReview,
      my_reaction: 'helpful',
    },
    onReactionClick: fn(),
  },
};

export const UnhelpfulReaction: Story = {
  args: {
    review: {
      ...baseReview,
      my_reaction: 'unhelpful',
    },
    onReactionClick: fn(),
  },
};

export const RecentReview: Story = {
  args: {
    review: {
      ...baseReview,
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    },
    onReactionClick: fn(),
  },
};

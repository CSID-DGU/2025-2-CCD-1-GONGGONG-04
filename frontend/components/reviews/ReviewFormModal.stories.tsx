/**
 * ReviewFormModal Component Stories
 *
 * Sprint 4: Review and Rating System
 * Storybook stories demonstrating ReviewFormModal component states
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReviewFormModal } from './ReviewFormModal';
import { Button } from '@/components/ui/button';
import type { Review } from '@/types/review';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const meta: Meta<typeof ReviewFormModal> = {
  title: 'Reviews/ReviewFormModal',
  component: ReviewFormModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  argTypes: {
    centerId: {
      control: 'number',
      description: 'Center ID to review',
    },
    existingReview: {
      control: 'object',
      description: 'Existing review for edit mode',
    },
    isOpen: {
      control: 'boolean',
      description: 'Dialog open state',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when dialog closes',
    },
    onSuccess: {
      action: 'success',
      description: 'Callback on successful submission',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReviewFormModal>;

const mockReview: Review = {
  id: 1,
  rating: 4,
  title: '친절하고 전문적인 상담',
  content: '처음 방문했는데 상담사분이 정말 친절하게 대해주셨습니다. 예약도 쉽고 대기시간도 거의 없었어요.',
  visit_date: '2025-01-10',
  helpful_count: 5,
  unhelpful_count: 1,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  user: {
    id: 1,
    nickname: '홍길동',
    avatar_url: null,
  },
  is_my_review: true,
  my_reaction: null,
};

/**
 * Create mode - New review creation
 */
export const CreateMode: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>리뷰 작성하기</Button>
        <ReviewFormModal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </div>
    );
  },
  args: {
    centerId: 1,
    existingReview: null,
  },
};

/**
 * Edit mode - Editing existing review
 */
export const EditMode: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>리뷰 수정하기</Button>
        <ReviewFormModal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          existingReview={mockReview}
        />
      </div>
    );
  },
  args: {
    centerId: 1,
  },
};

/**
 * Loading state - Form submission in progress
 */
export const LoadingState: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <ReviewFormModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    );
  },
  args: {
    centerId: 1,
    existingReview: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Submit the form to see loading state (buttons disabled, "저장 중..." text)',
      },
    },
  },
};

/**
 * Validation errors - Invalid form input
 */
export const ValidationErrors: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <ReviewFormModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    );
  },
  args: {
    centerId: 1,
    existingReview: null,
  },
  parameters: {
    docs: {
      description: {
        story: 'Try submitting without filling required fields to see validation errors',
      },
    },
  },
};

/**
 * Character counter - Content length tracking
 */
export const CharacterCounter: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);

    const longReview: Review = {
      ...mockReview,
      content: 'A'.repeat(950), // Close to limit
    };

    return (
      <ReviewFormModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        existingReview={longReview}
      />
    );
  },
  args: {
    centerId: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Character counter shows current length and turns red when exceeding limit',
      },
    },
  },
};

/**
 * With all fields filled - Complete review form
 */
export const AllFieldsFilled: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <ReviewFormModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        existingReview={mockReview}
      />
    );
  },
  args: {
    centerId: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Review form with all fields populated including optional fields',
      },
    },
  },
};

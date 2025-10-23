import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReviewList } from './ReviewList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: 'Reviews/ReviewList',
  component: ReviewList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-[800px]">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  argTypes: {
    centerId: {
      control: 'number',
      description: 'Center ID to fetch reviews for',
    },
    sortBy: {
      control: 'select',
      options: ['latest', 'helpful', 'rating_desc', 'rating_asc'],
      description: 'Sort option',
    },
    onSortChange: { action: 'sort-changed' },
    onReactionClick: { action: 'reaction-clicked' },
    onEditReview: { action: 'edit-clicked' },
    onDeleteReview: { action: 'delete-clicked' },
  },
} satisfies Meta<typeof ReviewList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    centerId: 1,
    sortBy: 'latest',
    onSortChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows loading skeleton while fetching reviews',
      },
    },
  },
};

export const WithReviews: Story = {
  args: {
    centerId: 1,
    sortBy: 'latest',
    onSortChange: fn(),
    onReactionClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a list of reviews with sorting options',
      },
    },
  },
};

export const SortedByHelpful: Story = {
  args: {
    centerId: 1,
    sortBy: 'helpful',
    onSortChange: fn(),
    onReactionClick: fn(),
  },
};

export const SortedByRating: Story = {
  args: {
    centerId: 1,
    sortBy: 'rating_desc',
    onSortChange: fn(),
    onReactionClick: fn(),
  },
};

export const WithEditDelete: Story = {
  args: {
    centerId: 1,
    sortBy: 'latest',
    onSortChange: fn(),
    onReactionClick: fn(),
    onEditReview: fn(),
    onDeleteReview: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows edit/delete options for user\'s own reviews',
      },
    },
  },
};

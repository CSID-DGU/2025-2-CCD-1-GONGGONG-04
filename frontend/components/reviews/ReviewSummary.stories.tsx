import type { Meta, StoryObj } from '@storybook/react';
import { ReviewSummary } from './ReviewSummary';

const meta = {
  title: 'Reviews/ReviewSummary',
  component: ReviewSummary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    avgRating: {
      control: { type: 'number', min: 0, max: 5, step: 0.1 },
      description: 'Average rating (0.0-5.0)',
    },
    totalReviews: {
      control: { type: 'number', min: 0 },
      description: 'Total number of reviews',
    },
    ratingDistribution: {
      control: 'object',
      description: 'Distribution of ratings by star (1-5)',
    },
  },
} satisfies Meta<typeof ReviewSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HighRating: Story = {
  args: {
    avgRating: 4.5,
    totalReviews: 120,
    ratingDistribution: {
      5: 80,
      4: 25,
      3: 10,
      2: 3,
      1: 2,
    },
  },
};

export const MediumRating: Story = {
  args: {
    avgRating: 3.2,
    totalReviews: 50,
    ratingDistribution: {
      5: 8,
      4: 12,
      3: 15,
      2: 10,
      1: 5,
    },
  },
};

export const LowRating: Story = {
  args: {
    avgRating: 1.8,
    totalReviews: 30,
    ratingDistribution: {
      5: 2,
      4: 3,
      3: 5,
      2: 8,
      1: 12,
    },
  },
};

export const PerfectRating: Story = {
  args: {
    avgRating: 5.0,
    totalReviews: 50,
    ratingDistribution: {
      5: 50,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  },
};

export const FewReviews: Story = {
  args: {
    avgRating: 4.0,
    totalReviews: 5,
    ratingDistribution: {
      5: 2,
      4: 2,
      3: 1,
      2: 0,
      1: 0,
    },
  },
};

export const NoReviews: Story = {
  args: {
    avgRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  },
};

/**
 * StarRating Component Stories
 *
 * Sprint 4: Review and Rating System
 * Storybook stories demonstrating StarRating component states and interactions
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { StarRating } from './StarRating';

const meta: Meta<typeof StarRating> = {
  title: 'Reviews/StarRating',
  component: StarRating,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    rating: {
      control: { type: 'range', min: 0, max: 5, step: 1 },
      description: 'Current rating value (0-5)',
    },
    onRatingChange: {
      action: 'ratingChanged',
      description: 'Callback when rating changes',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Star size variant',
    },
    readonly: {
      control: 'boolean',
      description: 'Read-only mode (display only)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StarRating>;

/**
 * Interactive star rating with hover preview
 * Click on stars to select rating
 */
const InteractiveComponent = (args: React.ComponentProps<typeof StarRating>) => {
  const [rating, setRating] = useState(args.rating || 0);
  return (
    <div className="space-y-4">
      <StarRating {...args} rating={rating} onRatingChange={setRating} />
      <p className="text-body text-neutral-700">선택한 별점: {rating}점</p>
    </div>
  );
};

export const Interactive: Story = {
  render: (args) => <InteractiveComponent {...args} />,
  args: {
    rating: 3,
    readonly: false,
    size: 'md',
  },
};

/**
 * Read-only star rating for display purposes
 * No interaction, just shows the rating value
 */
export const Readonly: Story = {
  args: {
    rating: 4,
    readonly: true,
    size: 'md',
  },
};

/**
 * Different sizes demonstration
 */
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-body text-neutral-700 w-20">Small:</span>
        <StarRating rating={4} size="sm" readonly />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-body text-neutral-700 w-20">Medium:</span>
        <StarRating rating={4} size="md" readonly />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-body text-neutral-700 w-20">Large:</span>
        <StarRating rating={4} size="lg" readonly />
      </div>
    </div>
  ),
};

/**
 * All rating values (1-5 stars)
 */
export const AllRatings: Story = {
  render: () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((rating) => (
        <div key={rating} className="flex items-center gap-3">
          <span className="text-body text-neutral-700 w-16">{rating}점:</span>
          <StarRating rating={rating} readonly size="md" />
        </div>
      ))}
    </div>
  ),
};

/**
 * Empty rating (0 stars)
 */
const EmptyComponent = (args: React.ComponentProps<typeof StarRating>) => {
  const [rating, setRating] = useState(0);
  return (
    <div className="space-y-4">
      <p className="text-body text-neutral-700">별점을 선택해주세요</p>
      <StarRating {...args} rating={rating} onRatingChange={setRating} />
      {rating > 0 && <p className="text-body text-lavender-500">선택: {rating}점</p>}
    </div>
  );
};

export const Empty: Story = {
  render: (args) => <EmptyComponent {...args} />,
  args: {
    rating: 0,
    readonly: false,
    size: 'lg',
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { EmptyReviews } from './EmptyReviews';

const meta = {
  title: 'Reviews/EmptyReviews',
  component: EmptyReviews,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyReviews>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <EmptyReviews />,
};

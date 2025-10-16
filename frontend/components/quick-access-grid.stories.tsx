import type { Meta, StoryObj } from '@storybook/react'
import { QuickAccessGrid } from './quick-access-grid'

const meta = {
  title: 'Components/QuickAccessGrid',
  component: QuickAccessGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QuickAccessGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const InContainer: Story = {
  render: () => (
    <div className="max-w-2xl mx-auto">
      <QuickAccessGrid />
    </div>
  ),
}

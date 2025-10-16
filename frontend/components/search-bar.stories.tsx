import type { Meta, StoryObj } from '@storybook/react'
import { SearchBar } from './search-bar'

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const InContainer: Story = {
  render: () => (
    <div className="max-w-md mx-auto">
      <SearchBar />
    </div>
  ),
}

export const FullWidth: Story = {
  render: () => (
    <div className="w-full">
      <SearchBar />
    </div>
  ),
}

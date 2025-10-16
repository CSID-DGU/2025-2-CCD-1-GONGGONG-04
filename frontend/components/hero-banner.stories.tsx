import type { Meta, StoryObj } from '@storybook/react'
import { HeroBanner } from './hero-banner'

const meta = {
  title: 'Components/HeroBanner',
  component: HeroBanner,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HeroBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithMobileViewport: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {},
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
  args: {},
}

export const InContext: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto space-y-4">
        <Story />
        <p className="text-sm text-muted-foreground">
          Other content below the banner
        </p>
      </div>
    ),
  ],
  args: {},
}

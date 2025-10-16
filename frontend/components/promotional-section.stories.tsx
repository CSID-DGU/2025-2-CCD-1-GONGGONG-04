import type { Meta, StoryObj } from '@storybook/react'
import { PromotionalSection } from './promotional-section'

const meta = {
  title: 'Components/PromotionalSection',
  component: PromotionalSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PromotionalSection>

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
          Other promotional content could appear below
        </p>
      </div>
    ),
  ],
  args: {},
}

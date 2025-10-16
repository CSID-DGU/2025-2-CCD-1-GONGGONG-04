import type { Meta, StoryObj } from '@storybook/react'
import { Toggle } from './toggle'
import { Bold, Italic, Underline } from 'lucide-react'

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'The visual variant of the toggle',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'The size of the toggle',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <Bold className="h-4 w-4" />,
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: <Italic className="h-4 w-4" />,
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: <Bold className="h-4 w-4" />,
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: <Bold className="h-4 w-4" />,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: <Bold className="h-4 w-4" />,
  },
}

export const WithText: Story = {
  args: {
    children: (
      <>
        <Bold className="h-4 w-4 mr-2" />
        Bold
      </>
    ),
  },
}

export const TextFormattingExample: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle aria-label="Toggle bold">
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <Underline className="h-4 w-4" />
      </Toggle>
    </div>
  ),
}

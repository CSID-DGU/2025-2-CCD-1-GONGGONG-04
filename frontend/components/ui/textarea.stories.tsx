import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the textarea is read-only',
    },
    required: {
      control: 'boolean',
      description: 'Whether the textarea is required',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text rows',
    },
    maxLength: {
      control: 'number',
      description: 'Maximum number of characters',
    },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
  render: (args) => <Textarea {...args} className="w-[400px]" />,
}

export const WithValue: Story = {
  args: {
    defaultValue:
      'This is a textarea with some content already filled in. You can edit this text.',
  },
  render: (args) => <Textarea {...args} className="w-[400px]" />,
}

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled',
    disabled: true,
    defaultValue: 'You cannot edit this text.',
  },
  render: (args) => <Textarea {...args} className="w-[400px]" />,
}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'This text is read-only and cannot be edited.',
  },
  render: (args) => <Textarea {...args} className="w-[400px]" />,
}

export const WithRows: Story = {
  args: {
    rows: 6,
    placeholder: 'This textarea has 6 visible rows...',
  },
  render: (args) => <Textarea {...args} className="w-[400px]" />,
}

export const WithMaxLength: Story = {
  args: {
    maxLength: 100,
    placeholder: 'Maximum 100 characters allowed',
  },
  render: (args) => (
    <div className="w-[400px] space-y-2">
      <Textarea {...args} />
      <p className="text-xs text-muted-foreground">
        Character limit: 100 characters
      </p>
    </div>
  ),
}

export const Required: Story = {
  args: {
    required: true,
    placeholder: 'This field is required',
  },
  render: (args) => (
    <div className="w-[400px] space-y-2">
      <label className="text-sm font-medium">
        Message <span className="text-destructive">*</span>
      </label>
      <Textarea {...args} />
    </div>
  ),
}

export const Invalid: Story = {
  args: {
    placeholder: 'Invalid input',
    'aria-invalid': true,
    defaultValue: 'This input has an error',
  },
  render: (args) => (
    <div className="w-[400px] space-y-2">
      <label className="text-sm font-medium">Message</label>
      <Textarea {...args} />
      <p className="text-xs text-destructive">This field has an error.</p>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <label htmlFor="bio" className="text-sm font-medium">
        Bio
      </label>
      <Textarea
        id="bio"
        placeholder="Tell us a little bit about yourself"
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground">
        You can write a short bio to introduce yourself.
      </p>
    </div>
  ),
}

export const Resizable: Story = {
  args: {
    placeholder: 'This textarea can be resized',
    defaultValue: 'You can resize this textarea by dragging the corner.',
  },
  render: (args) => <Textarea {...args} className="w-[400px] resize" />,
}

export const NoResize: Story = {
  args: {
    placeholder: 'This textarea cannot be resized',
    defaultValue: 'This textarea has resize disabled.',
  },
  render: (args) => <Textarea {...args} className="w-[400px] resize-none" />,
}

export const SmallWidth: Story = {
  args: {
    placeholder: 'Narrow textarea',
  },
  render: (args) => <Textarea {...args} className="w-[200px]" />,
}

export const LargeWidth: Story = {
  args: {
    placeholder: 'Wide textarea',
  },
  render: (args) => <Textarea {...args} className="w-[600px]" />,
}

export const FormExample: Story = {
  render: () => (
    <form className="w-[500px] space-y-4">
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject <span className="text-destructive">*</span>
        </label>
        <input
          id="subject"
          type="text"
          placeholder="What is this about?"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="message"
          placeholder="What do you want to say?"
          rows={5}
          required
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        Send Message
      </button>
    </form>
  ),
}

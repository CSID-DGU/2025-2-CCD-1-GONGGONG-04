import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './checkbox'
import { Label } from './label'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
    },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    checked: true,
  },
}

export const Unchecked: Story = {
  args: {
    checked: false,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
}

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms-checkbox" />
      <Label htmlFor="terms-checkbox">Accept terms and conditions</Label>
    </div>
  ),
}

export const WithLongLabel: Story = {
  render: () => (
    <div className="flex items-start gap-2 max-w-md">
      <Checkbox id="privacy-checkbox" className="mt-1" />
      <Label htmlFor="privacy-checkbox" className="leading-relaxed">
        I agree to the privacy policy and consent to the collection and
        processing of my personal data as described in the terms of service.
      </Label>
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="option-1" />
        <Label htmlFor="option-1">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="option-2" defaultChecked />
        <Label htmlFor="option-2">Option 2</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="option-3" />
        <Label htmlFor="option-3">Option 3</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="option-4" disabled />
        <Label htmlFor="option-4">Option 4 (disabled)</Label>
      </div>
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox id="state-1" checked={false} />
        <Label htmlFor="state-1">Unchecked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="state-2" checked={true} />
        <Label htmlFor="state-2">Checked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="state-3" checked={false} disabled />
        <Label htmlFor="state-3">Disabled unchecked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="state-4" checked={true} disabled />
        <Label htmlFor="state-4">Disabled checked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="state-5" aria-invalid={true} />
        <Label htmlFor="state-5">Invalid</Label>
      </div>
    </div>
  ),
}

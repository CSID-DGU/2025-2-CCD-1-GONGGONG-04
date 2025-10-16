import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './label'
import { Input } from './input'
import { Checkbox } from './checkbox'

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    htmlFor: {
      control: 'text',
      description: 'The ID of the form element to associate with',
    },
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Label',
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
}

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="username">
        Username
        <span className="text-destructive ml-1">*</span>
      </Label>
      <Input id="username" placeholder="Enter username" required />
    </div>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="bio">Biography</Label>
      <textarea
        id="bio"
        className="min-h-20 w-80 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
        placeholder="Tell us about yourself"
      />
      <p className="text-muted-foreground text-xs">
        Brief description for your profile.
      </p>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2" data-disabled="true">
      <Label htmlFor="disabled">Disabled field</Label>
      <Input id="disabled" placeholder="Cannot edit" disabled />
    </div>
  ),
}

export const MultipleFields: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div className="flex flex-col gap-2">
        <Label htmlFor="first-name">First name</Label>
        <Input id="first-name" placeholder="John" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="last-name">Last name</Label>
        <Input id="last-name" placeholder="Doe" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-field">Email</Label>
        <Input id="email-field" type="email" placeholder="john@example.com" />
      </div>
    </div>
  ),
}

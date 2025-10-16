import type { Meta, StoryObj } from '@storybook/react'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Label } from './label'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Whether the radio group is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the radio group is required',
    },
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="r1" />
        <Label htmlFor="r1">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="r2" />
        <Label htmlFor="r2">Option 2</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="r3" />
        <Label htmlFor="r3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
}

export const WithoutDefault: Story = {
  render: () => (
    <RadioGroup>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="no-default-1" />
        <Label htmlFor="no-default-1">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="no-default-2" />
        <Label htmlFor="no-default-2">Option 2</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="no-default-3" />
        <Label htmlFor="no-default-3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="disabled-1" />
        <Label htmlFor="disabled-1">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="disabled-2" />
        <Label htmlFor="disabled-2">Option 2</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="disabled-3" />
        <Label htmlFor="disabled-3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
}

export const IndividualDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="ind-disabled-1" />
        <Label htmlFor="ind-disabled-1">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="ind-disabled-2" disabled />
        <Label htmlFor="ind-disabled-2">Option 2 (disabled)</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="ind-disabled-3" />
        <Label htmlFor="ind-disabled-3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
}

export const Invalid: Story = {
  render: () => (
    <RadioGroup>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="invalid-1" aria-invalid={true} />
        <Label htmlFor="invalid-1">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="invalid-2" aria-invalid={true} />
        <Label htmlFor="invalid-2">Option 2</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="invalid-3" aria-invalid={true} />
        <Label htmlFor="invalid-3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
}

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="plan-1">
      <div className="flex items-start gap-2">
        <RadioGroupItem value="plan-1" id="plan-1" className="mt-1" />
        <div className="grid gap-1">
          <Label htmlFor="plan-1">Free Plan</Label>
          <p className="text-muted-foreground text-sm">
            Basic features for personal use
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="plan-2" id="plan-2" className="mt-1" />
        <div className="grid gap-1">
          <Label htmlFor="plan-2">Pro Plan</Label>
          <p className="text-muted-foreground text-sm">
            Advanced features for professionals
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="plan-3" id="plan-3" className="mt-1" />
        <div className="grid gap-1">
          <Label htmlFor="plan-3">Enterprise Plan</Label>
          <p className="text-muted-foreground text-sm">
            Full features for large teams
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1" className="flex gap-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="h1" />
        <Label htmlFor="h1">Option 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="h2" />
        <Label htmlFor="h2">Option 2</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="h3" />
        <Label htmlFor="h3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
}

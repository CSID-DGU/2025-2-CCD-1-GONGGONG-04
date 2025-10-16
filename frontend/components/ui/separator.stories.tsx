import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './separator'

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the separator',
    },
    decorative: {
      control: 'boolean',
      description: 'Whether the separator is purely decorative',
    },
  },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="w-[300px] space-y-4">
      <div>
        <h4 className="text-sm font-medium">Section 1</h4>
        <p className="text-sm text-muted-foreground">Content for section 1</p>
      </div>
      <Separator {...args} />
      <div>
        <h4 className="text-sm font-medium">Section 2</h4>
        <p className="text-sm text-muted-foreground">Content for section 2</p>
      </div>
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex h-[100px] items-center space-x-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Left Section</h4>
        <p className="text-sm text-muted-foreground">Content here</p>
      </div>
      <Separator {...args} />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Right Section</h4>
        <p className="text-sm text-muted-foreground">Content here</p>
      </div>
    </div>
  ),
}

export const InList: Story = {
  render: () => (
    <div className="w-[300px]">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Menu Items</h4>
        <p className="text-sm text-muted-foreground">
          Select an item from the list
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-col space-y-3">
        <div className="text-sm">Item 1</div>
        <div className="text-sm">Item 2</div>
        <div className="text-sm">Item 3</div>
        <Separator />
        <div className="text-sm font-medium">Special Items</div>
        <div className="text-sm">Item 4</div>
        <div className="text-sm">Item 5</div>
      </div>
    </div>
  ),
}

export const InCard: Story = {
  render: () => (
    <div className="w-[350px] rounded-lg border p-6 space-y-4">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your profile information
        </p>
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Name</span>
          <span>John Doe</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Email</span>
          <span>john@example.com</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Role</span>
          <span>Administrator</span>
        </div>
      </div>
      <Separator />
      <div className="flex justify-end space-x-2">
        <button className="text-sm px-3 py-1.5 border rounded-md">
          Cancel
        </button>
        <button className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md">
          Save
        </button>
      </div>
    </div>
  ),
}

export const NavigationDivider: Story = {
  render: () => (
    <div className="flex items-center space-x-4 text-sm">
      <a href="#" className="hover:underline">
        Home
      </a>
      <Separator orientation="vertical" className="h-4" />
      <a href="#" className="hover:underline">
        Products
      </a>
      <Separator orientation="vertical" className="h-4" />
      <a href="#" className="hover:underline">
        About
      </a>
      <Separator orientation="vertical" className="h-4" />
      <a href="#" className="hover:underline">
        Contact
      </a>
    </div>
  ),
}

export const MultiSection: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Account Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Profile</h4>
          <p className="text-sm text-muted-foreground">
            Update your personal information
          </p>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-medium mb-2">Security</h4>
          <p className="text-sm text-muted-foreground">
            Manage your password and security settings
          </p>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-medium mb-2">Notifications</h4>
          <p className="text-sm text-muted-foreground">
            Configure how you receive notifications
          </p>
        </div>
      </div>
    </div>
  ),
}

export const WithSpacing: Story = {
  render: () => (
    <div className="w-[300px] space-y-8">
      <div>
        <h4 className="text-sm font-medium">Section with default spacing</h4>
        <p className="text-sm text-muted-foreground">Content here</p>
      </div>
      <Separator className="my-8" />
      <div>
        <h4 className="text-sm font-medium">Section with custom spacing</h4>
        <p className="text-sm text-muted-foreground">Content here</p>
      </div>
      <Separator className="my-2" />
      <div>
        <h4 className="text-sm font-medium">Section with minimal spacing</h4>
        <p className="text-sm text-muted-foreground">Content here</p>
      </div>
    </div>
  ),
}

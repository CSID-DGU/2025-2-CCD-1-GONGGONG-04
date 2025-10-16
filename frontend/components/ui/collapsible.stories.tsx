import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible'
import { Button } from './button'

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultOpen: {
      control: 'boolean',
      description: 'Whether the collapsible is open by default',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the collapsible is disabled',
    },
    open: {
      control: 'boolean',
      description: 'Controlled open state',
    },
  },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[400px]">
        <div className="flex items-center justify-between space-x-4 p-4 border rounded-md">
          <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            @radix-ui/primitives
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">
            @radix-ui/colors
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">@stitches/react</div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

export const DefaultOpen: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[400px]">
        <div className="flex items-center justify-between space-x-4 p-4 border rounded-md">
          <h4 className="text-sm font-semibold">Notification Settings</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            Email notifications enabled
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">
            Push notifications enabled
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">
            SMS notifications disabled
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

export const WithCustomTrigger: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[400px]">
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between space-x-4 p-4 border rounded-md hover:bg-muted transition-colors">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <h4 className="text-sm font-semibold">Project Details</h4>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            <strong>Status:</strong> In Progress
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">
            <strong>Team:</strong> 5 members
          </div>
          <div className="rounded-md border px-4 py-3 text-sm">
            <strong>Deadline:</strong> December 31, 2025
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

export const Disabled: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} disabled className="w-[400px]">
        <div className="flex items-center justify-between space-x-4 p-4 border rounded-md opacity-50">
          <h4 className="text-sm font-semibold">Disabled Collapsible</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" disabled>
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            This content cannot be accessed
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

export const NestedContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[500px]">
        <div className="flex items-center justify-between space-x-4 p-4 border rounded-md">
          <h4 className="text-sm font-semibold">Advanced Settings</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="rounded-md border p-4">
            <h5 className="font-medium text-sm mb-2">Performance Options</h5>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Enable hardware acceleration</li>
              <li>Optimize memory usage</li>
              <li>Cache management settings</li>
            </ul>
          </div>
          <div className="rounded-md border p-4">
            <h5 className="font-medium text-sm mb-2">Security Options</h5>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Two-factor authentication</li>
              <li>Session timeout duration</li>
              <li>IP whitelist management</li>
            </ul>
          </div>
          <div className="rounded-md border p-4">
            <h5 className="font-medium text-sm mb-2">Developer Tools</h5>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Enable debug mode</li>
              <li>API logging level</li>
              <li>Error tracking integration</li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

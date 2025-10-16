'use client'

import type { Meta, StoryObj } from '@storybook/react'
import { Toaster } from './toaster'
import { useToast } from '@/hooks/use-toast'
import { Button } from './button'

const meta = {
  title: 'UI/Toaster',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

function ToasterDemo() {
  const { toast } = useToast()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Toast Examples</h3>
        <p className="text-sm text-muted-foreground">
          Click the buttons to trigger different toast notifications
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            toast({
              title: 'Notification',
              description: 'This is a simple notification message.',
            })
          }}
        >
          Show Simple Toast
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            toast({
              title: 'Success',
              description: 'Your changes have been saved successfully.',
              variant: 'default',
            })
          }}
        >
          Show Success
        </Button>

        <Button
          variant="destructive"
          onClick={() => {
            toast({
              title: 'Error',
              description: 'Something went wrong. Please try again.',
              variant: 'destructive',
            })
          }}
        >
          Show Error
        </Button>
      </div>

      <Toaster />
    </div>
  )
}

export const Default: Story = {
  render: () => <ToasterDemo />,
}

function ToasterWithAction() {
  const { toast } = useToast()

  return (
    <div className="space-y-4">
      <Button
        onClick={() => {
          toast({
            title: 'Scheduled: Catch up',
            description: 'Friday, February 10, 2023 at 5:57 PM',
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Action clicked!')}
              >
                Undo
              </Button>
            ),
          })
        }}
      >
        Show Toast with Action
      </Button>
      <Toaster />
    </div>
  )
}

export const WithAction: Story = {
  render: () => <ToasterWithAction />,
}

function ToasterVariants() {
  const { toast } = useToast()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: 'Information',
              description: 'New updates are available.',
            })
          }}
        >
          Info
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: 'Warning',
              description: 'Your session will expire soon.',
              variant: 'default',
            })
          }}
        >
          Warning
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: 'Success',
              description: 'Operation completed successfully.',
            })
          }}
        >
          Success
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: 'Error',
              description: 'Failed to process your request.',
              variant: 'destructive',
            })
          }}
        >
          Error
        </Button>
      </div>
      <Toaster />
    </div>
  )
}

export const AllVariants: Story = {
  render: () => <ToasterVariants />,
}

function ToasterTitleOnly() {
  const { toast } = useToast()

  return (
    <div className="space-y-4">
      <Button
        onClick={() => {
          toast({
            title: 'Task completed successfully',
          })
        }}
      >
        Show Title Only
      </Button>
      <Toaster />
    </div>
  )
}

export const TitleOnly: Story = {
  render: () => <ToasterTitleOnly />,
}

function ToasterLongContent() {
  const { toast } = useToast()

  return (
    <div className="space-y-4">
      <Button
        onClick={() => {
          toast({
            title: 'Long notification',
            description:
              'This is a longer notification message that demonstrates how the toast component handles more detailed information. The component will automatically adjust its size to accommodate the content.',
          })
        }}
      >
        Show Long Content
      </Button>
      <Toaster />
    </div>
  )
}

export const LongContent: Story = {
  render: () => <ToasterLongContent />,
}

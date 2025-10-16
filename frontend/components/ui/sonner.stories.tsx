'use client'

import type { Meta, StoryObj } from '@storybook/react'
import { Toaster } from './sonner'
import { Button } from './button'
import { toast } from 'sonner'

const meta = {
  title: 'UI/Sonner',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

function SonnerDemo() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Sonner Toast Examples</h3>
        <p className="text-sm text-muted-foreground">
          Click the buttons to trigger different Sonner toast notifications
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast('This is a simple toast message')}>
          Default Toast
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            toast.success('Your changes have been saved successfully')
          }
        >
          Success
        </Button>

        <Button
          variant="destructive"
          onClick={() => toast.error('Something went wrong. Please try again.')}
        >
          Error
        </Button>

        <Button
          variant="outline"
          onClick={() => toast.info('New updates are available')}
        >
          Info
        </Button>

        <Button
          variant="outline"
          onClick={() => toast.warning('Your session will expire soon')}
        >
          Warning
        </Button>
      </div>

      <Toaster />
    </div>
  )
}

export const Default: Story = {
  render: () => <SonnerDemo />,
}

function SonnerWithDescription() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            toast('Event has been created', {
              description: 'Sunday, December 03, 2023 at 9:00 AM',
            })
          }
        >
          With Description
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            toast.success('Payment successful', {
              description: 'Your payment has been processed successfully',
            })
          }
        >
          Success with Description
        </Button>
      </div>

      <Toaster />
    </div>
  )
}

export const WithDescription: Story = {
  render: () => <SonnerWithDescription />,
}

function SonnerWithAction() {
  return (
    <div className="space-y-4">
      <Button
        onClick={() =>
          toast('Event has been created', {
            action: {
              label: 'Undo',
              onClick: () => toast('Undo clicked'),
            },
          })
        }
      >
        Toast with Action
      </Button>

      <Toaster />
    </div>
  )
}

export const WithAction: Story = {
  render: () => <SonnerWithAction />,
}

function SonnerPromise() {
  const simulateAsyncOperation = () =>
    new Promise((resolve) => setTimeout(resolve, 2000))

  return (
    <div className="space-y-4">
      <Button
        onClick={() =>
          toast.promise(simulateAsyncOperation, {
            loading: 'Loading...',
            success: 'Data loaded successfully',
            error: 'Failed to load data',
          })
        }
      >
        Promise Toast
      </Button>

      <Toaster />
    </div>
  )
}

export const Promise: Story = {
  render: () => <SonnerPromise />,
}

function SonnerCustomPosition() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          onClick={() => toast('Top left', { position: 'top-left' })}
        >
          Top Left
        </Button>
        <Button
          variant="outline"
          onClick={() => toast('Top center', { position: 'top-center' })}
        >
          Top Center
        </Button>
        <Button
          variant="outline"
          onClick={() => toast('Top right', { position: 'top-right' })}
        >
          Top Right
        </Button>
        <Button
          variant="outline"
          onClick={() => toast('Bottom left', { position: 'bottom-left' })}
        >
          Bottom Left
        </Button>
        <Button
          variant="outline"
          onClick={() => toast('Bottom center', { position: 'bottom-center' })}
        >
          Bottom Center
        </Button>
        <Button
          variant="outline"
          onClick={() => toast('Bottom right', { position: 'bottom-right' })}
        >
          Bottom Right
        </Button>
      </div>

      <Toaster />
    </div>
  )
}

export const CustomPosition: Story = {
  render: () => <SonnerCustomPosition />,
}

function SonnerDuration() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast('1 second', { duration: 1000 })}>
          1s Duration
        </Button>
        <Button onClick={() => toast('3 seconds', { duration: 3000 })}>
          3s Duration
        </Button>
        <Button onClick={() => toast('10 seconds', { duration: 10000 })}>
          10s Duration
        </Button>
        <Button onClick={() => toast('Infinite', { duration: Infinity })}>
          Infinite
        </Button>
      </div>

      <Toaster />
    </div>
  )
}

export const CustomDuration: Story = {
  render: () => <SonnerDuration />,
}

function SonnerRichContent() {
  return (
    <div className="space-y-4">
      <Button
        onClick={() =>
          toast(
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-lavender-500 rounded-full flex items-center justify-center text-white">
                JD
              </div>
              <div>
                <div className="font-medium">John Doe</div>
                <div className="text-sm text-muted-foreground">
                  Commented on your post
                </div>
              </div>
            </div>,
          )
        }
      >
        Rich Content Toast
      </Button>

      <Toaster />
    </div>
  )
}

export const RichContent: Story = {
  render: () => <SonnerRichContent />,
}

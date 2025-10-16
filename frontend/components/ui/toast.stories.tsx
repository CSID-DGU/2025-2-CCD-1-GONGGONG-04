import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './toast'

const meta = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'The visual style variant of the toast',
    },
    open: {
      control: 'boolean',
      description: 'Whether the toast is open',
    },
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <ToastProvider>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Show Toast
        </button>
        <Toast open={open} onOpenChange={setOpen}>
          <div className="grid gap-1">
            <ToastTitle>Notification</ToastTitle>
            <ToastDescription>
              This is a default toast notification.
            </ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <ToastProvider>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow transition-colors hover:bg-destructive/90"
        >
          Show Error
        </button>
        <Toast open={open} onOpenChange={setOpen} variant="destructive">
          <div className="grid gap-1">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>
              Something went wrong. Please try again.
            </ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

export const WithAction: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <ToastProvider>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Show Toast with Action
        </button>
        <Toast open={open} onOpenChange={setOpen}>
          <div className="grid gap-1">
            <ToastTitle>Update Available</ToastTitle>
            <ToastDescription>
              A new version is available. Update now?
            </ToastDescription>
          </div>
          <ToastAction
            altText="Update now"
            onClick={() => {
              console.log('Update clicked')
              setOpen(false)
            }}
          >
            Update
          </ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

export const DestructiveWithAction: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <ToastProvider>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow transition-colors hover:bg-destructive/90"
        >
          Delete Item
        </button>
        <Toast open={open} onOpenChange={setOpen} variant="destructive">
          <div className="grid gap-1">
            <ToastTitle>Item Deleted</ToastTitle>
            <ToastDescription>
              The item has been permanently deleted.
            </ToastDescription>
          </div>
          <ToastAction
            altText="Undo delete"
            onClick={() => {
              console.log('Undo clicked')
              setOpen(false)
            }}
          >
            Undo
          </ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

export const TitleOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <ToastProvider>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Show Simple Toast
        </button>
        <Toast open={open} onOpenChange={setOpen}>
          <div className="grid gap-1">
            <ToastTitle>Changes saved</ToastTitle>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

export const DescriptionOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <ToastProvider>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Show Toast
        </button>
        <Toast open={open} onOpenChange={setOpen}>
          <div className="grid gap-1">
            <ToastDescription>Your file has been uploaded.</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(true)

    return (
      <ToastProvider>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Show Toast
        </button>
        <Toast open={open} onOpenChange={setOpen}>
          <div className="grid gap-1">
            <ToastTitle>Processing Complete</ToastTitle>
            <ToastDescription>
              Your data has been successfully processed and is now available for
              download. You can access it from the downloads section of your
              dashboard.
            </ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

export const MultipleToasts: Story = {
  render: () => {
    const [toasts, setToasts] = useState<Array<{ id: number; open: boolean }>>(
      [],
    )

    const addToast = () => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, open: true }])
    }

    const closeToast = (id: number) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    return (
      <ToastProvider>
        <button
          onClick={addToast}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Add Toast
        </button>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            open={toast.open}
            onOpenChange={(open) => !open && closeToast(toast.id)}
          >
            <div className="grid gap-1">
              <ToastTitle>Toast {toast.id}</ToastTitle>
              <ToastDescription>
                This is toast notification #{toast.id}.
              </ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    )
  },
}

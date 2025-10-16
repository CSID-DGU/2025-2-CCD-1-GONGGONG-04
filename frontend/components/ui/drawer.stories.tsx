import type { Meta, StoryObj } from '@storybook/react'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from './drawer'
import { Button } from './button'

const meta = {
  title: 'UI/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Bottom: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Open Drawer (Bottom)</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer Title</DrawerTitle>
            <DrawerDescription>
              This drawer slides up from the bottom with drag-to-close
              functionality.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <p className="text-sm text-muted-foreground">
              You can drag down on the handle to close this drawer, or click the
              close button.
            </p>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
}

export const Top: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Drawer direction="top">
        <DrawerTrigger asChild>
          <Button>Open Drawer (Top)</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notifications</DrawerTitle>
            <DrawerDescription>
              You have 3 unread notifications
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-3">
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">New message from John</p>
              <p className="text-xs text-muted-foreground">2 minutes ago</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Meeting reminder</p>
              <p className="text-xs text-muted-foreground">1 hour ago</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">System update available</p>
              <p className="text-xs text-muted-foreground">3 hours ago</p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  ),
}

export const Left: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <Button>Open Drawer (Left)</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>
              Apply filters to refine your search
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select className="w-full rounded-md border px-3 py-2 text-sm">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Books</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <input
                type="range"
                min="0"
                max="1000"
                className="w-full"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button>Apply Filters</Button>
            <DrawerClose asChild>
              <Button variant="outline">Reset</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
}

export const Right: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button>Open Drawer (Right)</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Shopping Cart</DrawerTitle>
            <DrawerDescription>3 items in your cart</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="text-sm font-medium">Product 1</p>
                <p className="text-xs text-muted-foreground">$29.99</p>
              </div>
              <Button variant="ghost" size="sm">
                Remove
              </Button>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="text-sm font-medium">Product 2</p>
                <p className="text-xs text-muted-foreground">$49.99</p>
              </div>
              <Button variant="ghost" size="sm">
                Remove
              </Button>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="text-sm font-medium">Product 3</p>
                <p className="text-xs text-muted-foreground">$19.99</p>
              </div>
              <Button variant="ghost" size="sm">
                Remove
              </Button>
            </div>
            <div className="flex justify-between items-center pt-3">
              <p className="font-semibold">Total</p>
              <p className="font-semibold">$99.97</p>
            </div>
          </div>
          <DrawerFooter>
            <Button>Checkout</Button>
            <DrawerClose asChild>
              <Button variant="outline">Continue Shopping</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
}

export const WithForm: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Add New Item</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New Item</DrawerTitle>
            <DrawerDescription>
              Fill in the details to add a new item
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="item-name" className="text-sm font-medium">
                Item Name
              </label>
              <input
                id="item-name"
                placeholder="Enter item name"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="item-description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="item-description"
                placeholder="Enter description"
                className="w-full rounded-md border px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="item-price" className="text-sm font-medium">
                Price
              </label>
              <input
                id="item-price"
                type="number"
                placeholder="0.00"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button>Add Item</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
}

export const Confirmation: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-semibold">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              placeholder="Type DELETE here"
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <DrawerFooter>
            <Button variant="destructive">Delete Account</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
}

export const SnapPoints: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Drawer snapPoints={[0.25, 0.5, 1]}>
        <DrawerTrigger asChild>
          <Button>Open with Snap Points</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer with Snap Points</DrawerTitle>
            <DrawerDescription>
              This drawer snaps to 25%, 50%, and 100% heights
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4 overflow-y-auto">
            <p className="text-sm">
              Try dragging this drawer to different heights. It will snap to
              predefined points.
            </p>
            <p className="text-sm text-muted-foreground">
              This is useful for content that can be viewed at different levels
              of detail.
            </p>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="text-sm font-medium">Item {i + 1}</p>
                <p className="text-xs text-muted-foreground">
                  Description for item {i + 1}
                </p>
              </div>
            ))}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from './sheet'
import { Button } from './button'

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Right: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet (Right)</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                defaultValue="John Doe"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                defaultValue="@johndoe"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button>Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  ),
}

export const Left: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet (Left)</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              Browse through different sections of the application.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Projects
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Team
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  ),
}

export const Top: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet (Top)</Button>
        </SheetTrigger>
        <SheetContent side="top">
          <SheetHeader>
            <SheetTitle>Notification Settings</SheetTitle>
            <SheetDescription>
              Configure how you want to receive notifications.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="email-notif" className="text-sm">
                Email notifications
              </label>
              <input type="checkbox" id="email-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="push-notif" className="text-sm">
                Push notifications
              </label>
              <input type="checkbox" id="push-notif" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  ),
}

export const Bottom: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button>Open Sheet (Bottom)</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Share this page</SheetTitle>
            <SheetDescription>
              Share this page with your friends and colleagues.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 flex gap-2">
            <Button variant="outline" className="flex-1">
              Email
            </Button>
            <Button variant="outline" className="flex-1">
              Twitter
            </Button>
            <Button variant="outline" className="flex-1">
              Facebook
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  ),
}

export const WithLongContent: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button>View Details</Button>
        </SheetTrigger>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Product Details</SheetTitle>
            <SheetDescription>
              Detailed information about this product.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <section>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                This is a comprehensive product with many features and
                capabilities. It has been designed with user experience in mind.
              </p>
            </section>
            <section>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                <li>High-quality materials</li>
                <li>Durable construction</li>
                <li>Easy to use</li>
                <li>Customizable options</li>
                <li>24/7 support</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold mb-2">Specifications</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Weight</dt>
                  <dd className="font-medium">2.5 kg</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Dimensions</dt>
                  <dd className="font-medium">30 x 20 x 10 cm</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Material</dt>
                  <dd className="font-medium">Aluminum</dd>
                </div>
              </dl>
            </section>
          </div>
          <SheetFooter>
            <Button className="w-full">Add to Cart</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  ),
}

export const MenuNavigation: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Menu</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Navigate to different sections</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Products
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              About Us
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Contact
            </Button>
            <div className="my-2 border-t" />
            <Button variant="ghost" className="w-full justify-start">
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Help
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  ),
}

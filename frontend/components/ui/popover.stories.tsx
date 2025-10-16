import type { Meta, StoryObj } from '@storybook/react'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { Button } from './button'

const meta = {
  title: 'UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Popover Title</h4>
          <p className="text-sm text-muted-foreground">
            This is a popover component. It can contain any content you need.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Edit Dimensions</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="width" className="text-sm">
                Width
              </label>
              <input
                id="width"
                defaultValue="100%"
                className="col-span-2 rounded-md border px-2 py-1 text-sm"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="height" className="text-sm">
                Height
              </label>
              <input
                id="height"
                defaultValue="25px"
                className="col-span-2 rounded-md border px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-8">
      <div />
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Top</Button>
          </PopoverTrigger>
          <PopoverContent side="top">
            <p className="text-sm">Content positioned at the top</p>
          </PopoverContent>
        </Popover>
      </div>
      <div />

      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Left</Button>
          </PopoverTrigger>
          <PopoverContent side="left">
            <p className="text-sm">Content positioned to the left</p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Center</Button>
          </PopoverTrigger>
          <PopoverContent>
            <p className="text-sm">Content positioned by default</p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Right</Button>
          </PopoverTrigger>
          <PopoverContent side="right">
            <p className="text-sm">Content positioned to the right</p>
          </PopoverContent>
        </Popover>
      </div>

      <div />
      <div className="flex justify-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Bottom</Button>
          </PopoverTrigger>
          <PopoverContent side="bottom">
            <p className="text-sm">Content positioned at the bottom</p>
          </PopoverContent>
        </Popover>
      </div>
      <div />
    </div>
  ),
}

export const Alignment: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Start</Button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <p className="text-sm">Content aligned to the start</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align Center</Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <p className="text-sm">Content aligned to center</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Align End</Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <p className="text-sm">Content aligned to the end</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
}

export const UserProfile: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="rounded-full">
          <div className="size-8 rounded-full bg-lavender-500 flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-lavender-500 flex items-center justify-center text-white font-medium">
              JD
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
          </div>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Profile
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const ColorPicker: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <div className="size-4 rounded bg-lavender-500 mr-2" />
          Pick a color
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">Select a color</h4>
            <div className="grid grid-cols-5 gap-2">
              {[
                'bg-red-500',
                'bg-orange-500',
                'bg-yellow-500',
                'bg-green-500',
                'bg-blue-500',
                'bg-indigo-500',
                'bg-purple-500',
                'bg-pink-500',
                'bg-gray-500',
                'bg-black',
              ].map((color) => (
                <button
                  key={color}
                  className={`size-8 rounded ${color} hover:scale-110 transition-transform`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="hex" className="text-sm font-medium">
              Hex Code
            </label>
            <input
              id="hex"
              defaultValue="#6366f1"
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const DatePicker: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Pick a date</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date</label>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
            <Button size="sm">Confirm</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

export const ShareMenu: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Share</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">Share this page</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Share via social media or copy link
            </p>
          </div>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Twitter
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Facebook
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              LinkedIn
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Copy Link
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}

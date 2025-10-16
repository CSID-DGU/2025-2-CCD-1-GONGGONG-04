import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea, ScrollBar } from './scroll-area'
import { Separator } from './separator'

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Scroll Area</h4>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="text-sm">
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 rounded-md bg-muted h-20 w-20 flex items-center justify-center text-sm font-medium"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

export const WithSeparators: Story = {
  render: () => (
    <ScrollArea className="h-72 w-96 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i}>
            <div className="text-sm py-2">
              Tag {i + 1}
              <span className="ml-2 text-xs text-muted-foreground">
                Description for tag {i + 1}
              </span>
            </div>
            {i < 49 && <Separator />}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const LongContent: Story = {
  render: () => (
    <ScrollArea className="h-[400px] w-[500px] rounded-md border p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Terms and Conditions</h3>
        <p className="text-sm leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <p className="text-sm leading-relaxed">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
          non proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
        <h4 className="text-md font-semibold mt-6">1. Acceptance of Terms</h4>
        <p className="text-sm leading-relaxed">
          By accessing and using this service, you accept and agree to be bound
          by the terms and provision of this agreement. If you do not agree to
          these terms, please do not use this service.
        </p>
        <h4 className="text-md font-semibold mt-6">2. Privacy Policy</h4>
        <p className="text-sm leading-relaxed">
          We are committed to protecting your privacy. Any information you
          provide will be held with the utmost care and will not be used in
          ways that you have not consented to.
        </p>
        <h4 className="text-md font-semibold mt-6">3. User Obligations</h4>
        <p className="text-sm leading-relaxed">
          You agree to use the service only for lawful purposes and in a way
          that does not infringe the rights of others or restrict or inhibit
          their use and enjoyment of the service.
        </p>
        <p className="text-sm leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Additional
          content to demonstrate scrolling behavior with substantial text.
        </p>
      </div>
    </ScrollArea>
  ),
}

export const ImageGallery: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 overflow-hidden rounded-md"
            style={{ width: 200, height: 150 }}
          >
            <div className="h-full w-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
              <span className="text-sm font-medium">Image {i + 1}</span>
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

export const ListWithHeaders: Story = {
  render: () => (
    <ScrollArea className="h-80 w-96 rounded-md border">
      <div className="p-4">
        {['A', 'B', 'C', 'D', 'E', 'F'].map((letter) => (
          <div key={letter} className="mb-4">
            <h4 className="mb-2 text-sm font-semibold bg-muted px-2 py-1 rounded">
              {letter}
            </h4>
            <div className="space-y-1 pl-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="text-sm py-1">
                  {letter}
                  {i + 1} - Item name
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const CodeBlock: Story = {
  render: () => (
    <ScrollArea className="h-64 w-[500px] rounded-md border bg-slate-950">
      <div className="p-4">
        <pre className="text-sm text-slate-50">
          <code>{`function calculateTotal(items) {
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    total += item.price * item.quantity;

    if (item.discount) {
      total -= item.discount;
    }
  }

  return total;
}

const cart = [
  { name: "Product 1", price: 29.99, quantity: 2 },
  { name: "Product 2", price: 49.99, quantity: 1, discount: 5 },
  { name: "Product 3", price: 19.99, quantity: 3 },
];

const total = calculateTotal(cart);
console.log(\`Total: $\${total.toFixed(2)}\`);`}</code>
        </pre>
      </div>
    </ScrollArea>
  ),
}

export const BothDirections: Story = {
  render: () => (
    <ScrollArea className="h-64 w-96 rounded-md border">
      <div className="p-4" style={{ width: '800px' }}>
        <div className="space-y-4">
          <h4 className="text-sm font-medium">
            Wide Content with Vertical Scroll
          </h4>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="text-sm whitespace-nowrap">
              This is a very long line of text that extends beyond the container
              width - Item {i + 1}
            </div>
          ))}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}

export const InCard: Story = {
  render: () => (
    <div className="w-[400px] rounded-lg border p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">
          Your latest actions and updates
        </p>
      </div>
      <Separator />
      <ScrollArea className="h-64">
        <div className="space-y-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Activity {i + 1}</p>
                <p className="text-xs text-muted-foreground">
                  Description for activity {i + 1}
                </p>
                <p className="text-xs text-muted-foreground">
                  {i + 1} hours ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
}

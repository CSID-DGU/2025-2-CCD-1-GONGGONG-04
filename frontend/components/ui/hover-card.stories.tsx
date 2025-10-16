import type { Meta, StoryObj } from '@storybook/react'
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card'
import { Button } from './button'

const meta = {
  title: 'UI/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@username</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">@username</h4>
          <p className="text-sm text-muted-foreground">
            This is a hover card with user information.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}

export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <p className="text-sm">
        Hover over{' '}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="px-0">
              @johndoe
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex gap-4">
              <div className="size-12 rounded-full bg-lavender-500 flex items-center justify-center text-white font-medium">
                JD
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">John Doe</h4>
                <p className="text-sm text-muted-foreground">@johndoe</p>
                <p className="text-xs text-muted-foreground">
                  Full-stack developer and open source contributor. Loves
                  building tools that help others.
                </p>
                <div className="flex gap-4 pt-2">
                  <div className="text-xs">
                    <span className="font-semibold">1,234</span>
                    <span className="text-muted-foreground"> Followers</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">567</span>
                    <span className="text-muted-foreground"> Following</span>
                  </div>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        {' '}to see their profile
      </p>
    </div>
  ),
}

export const ProductPreview: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <p className="text-sm">
        Check out our{' '}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="px-0">
              new product
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <div className="aspect-video w-full rounded-md bg-gradient-to-br from-lavender-400 to-lavender-600" />
              <h4 className="text-sm font-semibold">Premium Widget Pro</h4>
              <p className="text-xs text-muted-foreground">
                The ultimate tool for productivity and efficiency. Available now
                at 30% off.
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold">$49.99</span>
                <Button size="sm">Add to Cart</Button>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </p>
    </div>
  ),
}

export const LinkPreview: Story = {
  render: () => (
    <div className="max-w-md">
      <p className="text-sm">
        Read more about this topic in our{' '}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="px-0">
              documentation
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Getting Started Guide</h4>
              <p className="text-xs text-muted-foreground">
                A comprehensive guide to help you get started with our platform.
                Covers installation, configuration, and basic usage.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-muted-foreground">
                  15 min read
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  Updated 2 days ago
                </span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        {' '}or explore our{' '}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="px-0">
              tutorials
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Video Tutorials</h4>
              <p className="text-xs text-muted-foreground">
                Step-by-step video guides covering advanced features and best
                practices.
              </p>
              <div className="text-xs text-muted-foreground">
                12 videos • 2.5 hours total
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </p>
    </div>
  ),
}

export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-8">
      <div />
      <div className="flex justify-center">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline">Top</Button>
          </HoverCardTrigger>
          <HoverCardContent side="top">
            <p className="text-sm">Content positioned at the top</p>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div />

      <div className="flex justify-center">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline">Left</Button>
          </HoverCardTrigger>
          <HoverCardContent side="left">
            <p className="text-sm">Content positioned to the left</p>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="flex justify-center">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline">Bottom</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="text-sm">Default position (bottom)</p>
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="flex justify-center">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline">Right</Button>
          </HoverCardTrigger>
          <HoverCardContent side="right">
            <p className="text-sm">Content positioned to the right</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  ),
}

export const TeamMember: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Our Team</h3>
      <div className="flex gap-4">
        {[
          { name: 'Alice Johnson', role: 'CEO', initials: 'AJ' },
          { name: 'Bob Smith', role: 'CTO', initials: 'BS' },
          { name: 'Carol Davis', role: 'Designer', initials: 'CD' },
        ].map((member) => (
          <HoverCard key={member.name}>
            <HoverCardTrigger asChild>
              <button className="size-12 rounded-full bg-lavender-500 flex items-center justify-center text-white font-medium hover:scale-110 transition-transform">
                {member.initials}
              </button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-lavender-500 flex items-center justify-center text-white font-medium">
                    {member.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{member.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Passionate about building great products and leading amazing
                  teams.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  ),
}

export const FeatureDescription: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Features</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            title: 'Fast',
            description: 'Optimized for speed with lazy loading and caching',
          },
          {
            title: 'Secure',
            description: 'End-to-end encryption and regular security audits',
          },
          {
            title: 'Reliable',
            description: '99.9% uptime with automatic failover systems',
          },
          {
            title: 'Scalable',
            description: 'Handles millions of requests with ease',
          },
        ].map((feature) => (
          <HoverCard key={feature.title}>
            <HoverCardTrigger asChild>
              <Button variant="outline" className="h-20 flex-col">
                <span className="font-semibold">{feature.title}</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  ),
}

export const WithDelay: Story = {
  render: () => (
    <HoverCard openDelay={700} closeDelay={300}>
      <HoverCardTrigger asChild>
        <Button variant="link">Hover (delayed)</Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Custom Timing</h4>
          <p className="text-sm text-muted-foreground">
            This hover card has a 700ms open delay and 300ms close delay.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}

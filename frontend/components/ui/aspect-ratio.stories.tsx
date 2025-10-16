import type { Meta, StoryObj } from '@storybook/react'
import { AspectRatio } from './aspect-ratio'

const meta = {
  title: 'UI/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: 'number',
      description: 'The desired aspect ratio (width/height)',
    },
  },
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

export const Video16x9: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => (
    <div className="w-[450px]">
      <AspectRatio {...args}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          <span className="text-sm text-muted-foreground">16:9 Video</span>
        </div>
      </AspectRatio>
    </div>
  ),
}

export const Square1x1: Story = {
  args: {
    ratio: 1 / 1,
  },
  render: (args) => (
    <div className="w-[300px]">
      <AspectRatio {...args}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          <span className="text-sm text-muted-foreground">1:1 Square</span>
        </div>
      </AspectRatio>
    </div>
  ),
}

export const Portrait4x5: Story = {
  args: {
    ratio: 4 / 5,
  },
  render: (args) => (
    <div className="w-[300px]">
      <AspectRatio {...args}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          <span className="text-sm text-muted-foreground">4:5 Portrait</span>
        </div>
      </AspectRatio>
    </div>
  ),
}

export const UltraWide21x9: Story = {
  args: {
    ratio: 21 / 9,
  },
  render: (args) => (
    <div className="w-[500px]">
      <AspectRatio {...args}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          <span className="text-sm text-muted-foreground">
            21:9 Ultra Wide
          </span>
        </div>
      </AspectRatio>
    </div>
  ),
}

export const WithImage16x9: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => (
    <div className="w-[450px]">
      <AspectRatio {...args} className="bg-muted rounded-md overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Photo by Drew Beamer"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
}

export const WithImageSquare: Story = {
  args: {
    ratio: 1 / 1,
  },
  render: (args) => (
    <div className="w-[300px]">
      <AspectRatio {...args} className="bg-muted rounded-md overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=300&dpr=2&q=80"
          alt="Photo"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
}

export const VideoPlayer: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => (
    <div className="w-[600px]">
      <AspectRatio {...args} className="bg-black rounded-md overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-white text-sm">Click to play video</p>
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
}

export const ProductImage: Story = {
  args: {
    ratio: 1 / 1,
  },
  render: (args) => (
    <div className="w-[250px] space-y-3">
      <AspectRatio {...args} className="bg-muted rounded-lg overflow-hidden border">
        <img
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&dpr=2&q=80"
          alt="Product"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
      <div>
        <h3 className="font-semibold">Product Name</h3>
        <p className="text-sm text-muted-foreground">$99.99</p>
      </div>
    </div>
  ),
}

export const ResponsiveGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 w-[700px]">
      {[1, 2, 3].map((i) => (
        <AspectRatio key={i} ratio={4 / 3} className="bg-muted rounded-md">
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-muted-foreground">Image {i}</span>
          </div>
        </AspectRatio>
      ))}
    </div>
  ),
}

export const CardWithImage: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => (
    <div className="w-[350px] rounded-lg border overflow-hidden">
      <AspectRatio {...args}>
        <img
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&dpr=2&q=80"
          alt="Blog post"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold">Blog Post Title</h3>
        <p className="text-sm text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore.
        </p>
        <button className="text-sm text-primary hover:underline">
          Read more
        </button>
      </div>
    </div>
  ),
}

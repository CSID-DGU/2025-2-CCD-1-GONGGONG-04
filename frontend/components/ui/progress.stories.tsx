import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from './progress'
import { useEffect, useState } from 'react'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'The progress value (0-100)',
    },
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 50,
    className: 'w-[300px]',
  },
}

export const Empty: Story = {
  args: {
    value: 0,
    className: 'w-[300px]',
  },
}

export const Complete: Story = {
  args: {
    value: 100,
    className: 'w-[300px]',
  },
}

export const DifferentValues: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">25%</div>
        <Progress value={25} />
      </div>
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">50%</div>
        <Progress value={50} />
      </div>
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">75%</div>
        <Progress value={75} />
      </div>
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">100%</div>
        <Progress value={100} />
      </div>
    </div>
  ),
}

export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0
          }
          return prev + 10
        })
      }, 500)

      return () => clearInterval(timer)
    }, [])

    return (
      <div className="space-y-2 w-[300px]">
        <div className="text-sm text-muted-foreground">
          Loading... {progress}%
        </div>
        <Progress value={progress} />
      </div>
    )
  },
}

export const LoadingStates: Story = {
  render: () => {
    const [progress1, setProgress1] = useState(0)
    const [progress2, setProgress2] = useState(0)
    const [progress3, setProgress3] = useState(0)

    useEffect(() => {
      const timer1 = setInterval(() => {
        setProgress1((prev) => (prev >= 100 ? 0 : prev + 5))
      }, 200)

      const timer2 = setInterval(() => {
        setProgress2((prev) => (prev >= 100 ? 0 : prev + 3))
      }, 150)

      const timer3 = setInterval(() => {
        setProgress3((prev) => (prev >= 100 ? 0 : prev + 2))
      }, 100)

      return () => {
        clearInterval(timer1)
        clearInterval(timer2)
        clearInterval(timer3)
      }
    }, [])

    return (
      <div className="space-y-6 w-[400px]">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Downloading files...</span>
            <span className="text-muted-foreground">{progress1}%</span>
          </div>
          <Progress value={progress1} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing data...</span>
            <span className="text-muted-foreground">{progress2}%</span>
          </div>
          <Progress value={progress2} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading results...</span>
            <span className="text-muted-foreground">{progress3}%</span>
          </div>
          <Progress value={progress3} />
        </div>
      </div>
    )
  },
}

export const CustomSizes: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Small</div>
        <Progress value={60} className="h-1" />
      </div>
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Default</div>
        <Progress value={60} />
      </div>
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Large</div>
        <Progress value={60} className="h-4" />
      </div>
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from './chart'

const meta = {
  title: 'UI/Chart',
  component: ChartContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    config: {
      description: 'Chart configuration with labels and colors',
    },
  },
} satisfies Meta<typeof ChartContainer>

export default meta
type Story = StoryObj<typeof meta>

const barChartData = [
  { month: 'Jan', revenue: 2400, profit: 1398 },
  { month: 'Feb', revenue: 1398, profit: 2400 },
  { month: 'Mar', revenue: 9800, profit: 3908 },
  { month: 'Apr', revenue: 3908, profit: 4800 },
  { month: 'May', revenue: 4800, profit: 3800 },
  { month: 'Jun', revenue: 3800, profit: 4300 },
]

const lineChartData = [
  { month: 'Jan', users: 186, sessions: 80 },
  { month: 'Feb', users: 305, sessions: 200 },
  { month: 'Mar', users: 237, sessions: 120 },
  { month: 'Apr', users: 273, sessions: 190 },
  { month: 'May', users: 209, sessions: 130 },
  { month: 'Jun', users: 214, sessions: 140 },
]

const pieChartData = [
  { category: 'Desktop', value: 275, fill: 'var(--color-desktop)' },
  { category: 'Mobile', value: 200, fill: 'var(--color-mobile)' },
  { category: 'Tablet', value: 187, fill: 'var(--color-tablet)' },
]

const barChartConfig: ChartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#2563eb',
  },
  profit: {
    label: 'Profit',
    color: '#60a5fa',
  },
}

const lineChartConfig: ChartConfig = {
  users: {
    label: 'Users',
    color: '#8b5cf6',
  },
  sessions: {
    label: 'Sessions',
    color: '#d946ef',
  },
}

const pieChartConfig: ChartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#2563eb',
  },
  mobile: {
    label: 'Mobile',
    color: '#60a5fa',
  },
  tablet: {
    label: 'Tablet',
    color: '#93c5fd',
  },
}

export const BarChartExample: Story = {
  render: () => (
    <ChartContainer config={barChartConfig} className="h-[300px] w-[500px]">
      <BarChart data={barChartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" />
        <Bar dataKey="profit" fill="var(--color-profit)" />
      </BarChart>
    </ChartContainer>
  ),
}

export const LineChartExample: Story = {
  render: () => (
    <ChartContainer config={lineChartConfig} className="h-[300px] w-[500px]">
      <LineChart data={lineChartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="users"
          stroke="var(--color-users)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="sessions"
          stroke="var(--color-sessions)"
          strokeWidth={2}
        />
      </LineChart>
    </ChartContainer>
  ),
}

export const PieChartExample: Story = {
  render: () => (
    <ChartContainer config={pieChartConfig} className="h-[300px] w-[500px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie data={pieChartData} dataKey="value" nameKey="category" />
      </PieChart>
    </ChartContainer>
  ),
}

export const WithTooltipIndicators: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ChartContainer
        config={barChartConfig}
        className="h-[200px] w-[400px]"
      >
        <BarChart data={barChartData}>
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" />
        </BarChart>
      </ChartContainer>
      <ChartContainer
        config={barChartConfig}
        className="h-[200px] w-[400px]"
      >
        <BarChart data={barChartData}>
          <XAxis dataKey="month" />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" />
        </BarChart>
      </ChartContainer>
    </div>
  ),
}

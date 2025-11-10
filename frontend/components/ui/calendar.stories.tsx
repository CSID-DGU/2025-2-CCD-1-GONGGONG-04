import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Calendar } from './calendar'

const { useState } = React

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

const DefaultComponent = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return <Calendar mode="single" selected={date} onSelect={setDate} />
}

export const Default: Story = {
  render: () => <DefaultComponent />,
}

const MultipleComponent = () => {
  const [dates, setDates] = useState<Date[] | undefined>([])
  return <Calendar mode="multiple" selected={dates} onSelect={setDates} />
}

export const Multiple: Story = {
  render: () => <MultipleComponent />,
}

const RangeComponent = () => {
  const [range, setRange] = useState<{ from: Date | undefined; to?: Date }>({
    from: new Date(),
    to: undefined,
  })
  return <Calendar mode="range" selected={range} onSelect={setRange as any} />
}

export const Range: Story = {
  render: () => <RangeComponent />,
}

const WithDropdownsComponent = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      captionLayout="dropdown"
      fromYear={2020}
      toYear={2030}
    />
  )
}

export const WithDropdowns: Story = {
  render: () => <WithDropdownsComponent />,
}

const DisabledDatesComponent = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const disabledDays = [
    new Date(2024, 0, 1),
    new Date(2024, 0, 15),
    { dayOfWeek: [0, 6] }, // Disable weekends
  ]
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={disabledDays as any}
    />
  )
}

export const DisabledDates: Story = {
  render: () => <DisabledDatesComponent />,
}

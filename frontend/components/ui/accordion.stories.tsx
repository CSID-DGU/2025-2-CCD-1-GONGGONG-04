import type { Meta, StoryObj } from '@storybook/react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion'

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Whether single or multiple items can be open',
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether all items can be collapsed (single mode only)',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the accordion is disabled',
    },
  },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: {
    type: 'single',
    collapsible: true,
    className: 'w-[400px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components
          aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const Multiple: Story = {
  args: {
    type: 'multiple',
    className: 'w-[400px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Accessibility</AccordionTrigger>
        <AccordionContent>
          Full keyboard navigation support with proper ARIA attributes.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Styling</AccordionTrigger>
        <AccordionContent>
          Customizable with Tailwind CSS and consistent with design system.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Animation</AccordionTrigger>
        <AccordionContent>
          Smooth animations with CSS transitions and configurable timing.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const NonCollapsible: Story = {
  args: {
    type: 'single',
    collapsible: false,
    defaultValue: 'item-1',
    className: 'w-[400px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Always one open</AccordionTrigger>
        <AccordionContent>
          When collapsible is false, one item must always be open.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Guaranteed content</AccordionTrigger>
        <AccordionContent>
          Users can&apos;t collapse all items, ensuring content visibility.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>UX consideration</AccordionTrigger>
        <AccordionContent>
          Useful for navigation or when one section should always be visible.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const WithLongContent: Story = {
  args: {
    type: 'single',
    collapsible: true,
    className: 'w-[500px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Introduction</AccordionTrigger>
        <AccordionContent>
          <p>
            The accordion component is a vertically stacked set of interactive
            headings that each reveal an associated section of content.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Features</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc pl-4 space-y-2">
            <li>Fully accessible with keyboard navigation</li>
            <li>Single or multiple selection modes</li>
            <li>Smooth animations and transitions</li>
            <li>Customizable styling with Tailwind</li>
            <li>Built with Radix UI primitives</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Usage Guidelines</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2">
            Use accordions when you need to present multiple sections of
            related content in a limited space. They work well for:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>FAQs and help documentation</li>
            <li>Settings and configuration panels</li>
            <li>Progressive disclosure of complex information</li>
            <li>Mobile-friendly content organization</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const Disabled: Story = {
  args: {
    type: 'single',
    collapsible: true,
    disabled: true,
    className: 'w-[400px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Disabled accordion</AccordionTrigger>
        <AccordionContent>This content cannot be accessed.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>All items disabled</AccordionTrigger>
        <AccordionContent>Interaction is prevented.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import { ThemeProvider } from './theme-provider'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

const meta = {
  title: 'Components/ThemeProvider',
  component: ThemeProvider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeProvider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Theme Provider Example</CardTitle>
            <CardDescription>
              This component wraps your app to provide theme functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The ThemeProvider component uses next-themes to provide theme
              switching capabilities. It supports light, dark, and system themes.
            </p>
            <div className="flex gap-2">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  ),
}

export const LightTheme: Story = {
  render: () => (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Light Theme</CardTitle>
            <CardDescription>Forced light theme</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This example uses a forced light theme.</p>
            <div className="flex gap-2 mt-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  ),
}

export const DarkTheme: Story = {
  render: () => (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Dark Theme</CardTitle>
            <CardDescription>Forced dark theme</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This example uses a forced dark theme.</p>
            <div className="flex gap-2 mt-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  ),
}

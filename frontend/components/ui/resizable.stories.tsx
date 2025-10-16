import type { Meta, StoryObj } from '@storybook/react'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from './resizable'

const meta = {
  title: 'UI/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ResizablePanelGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Left Panel</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Right Panel</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="vertical"
      className="min-h-[400px] max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Top Panel</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Bottom Panel</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const WithHandle: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Left</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Right</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const ThreeColumns: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] max-w-2xl rounded-lg border"
    >
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Main Content</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Aside</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const Nested: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[400px] max-w-2xl rounded-lg border"
    >
      <ResizablePanel defaultSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Top Content</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Bottom Content</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const EditorLayout: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[500px] max-w-4xl rounded-lg border"
    >
      <ResizablePanel defaultSize={20} minSize={15}>
        <div className="flex h-full flex-col p-4">
          <span className="font-semibold mb-4">Files</span>
          <div className="space-y-2 text-sm">
            <div className="p-2 hover:bg-muted rounded">src/</div>
            <div className="p-2 hover:bg-muted rounded ml-4">components/</div>
            <div className="p-2 hover:bg-muted rounded ml-4">pages/</div>
            <div className="p-2 hover:bg-muted rounded">package.json</div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70}>
            <div className="flex h-full flex-col p-4">
              <span className="font-semibold mb-4">Editor</span>
              <div className="flex-1 bg-muted rounded p-4 font-mono text-sm">
                <code>function hello() {'{'}</code>
                <br />
                <code>  console.log("Hello World");</code>
                <br />
                <code>{'}'}</code>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30}>
            <div className="flex h-full flex-col p-4">
              <span className="font-semibold mb-4">Terminal</span>
              <div className="flex-1 bg-black text-green-400 rounded p-4 font-mono text-sm">
                $ npm run dev
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={20} minSize={15}>
        <div className="flex h-full flex-col p-4">
          <span className="font-semibold mb-4">Preview</span>
          <div className="flex-1 border rounded p-4">
            <p className="text-sm text-muted-foreground">
              Live preview appears here
            </p>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const DashboardLayout: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="vertical"
      className="min-h-[500px] max-w-3xl rounded-lg border"
    >
      <ResizablePanel defaultSize={20} minSize={10}>
        <div className="flex h-full items-center justify-between px-6">
          <span className="font-semibold">Header</span>
          <div className="flex gap-4 text-sm">
            <a href="#">Home</a>
            <a href="#">Dashboard</a>
            <a href="#">Settings</a>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30}>
            <div className="flex h-full flex-col p-6">
              <span className="font-semibold mb-4">Navigation</span>
              <div className="space-y-2">
                <div className="p-2 bg-muted rounded">Overview</div>
                <div className="p-2 hover:bg-muted rounded">Analytics</div>
                <div className="p-2 hover:bg-muted rounded">Reports</div>
                <div className="p-2 hover:bg-muted rounded">Settings</div>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Main Content Area</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={20} minSize={10}>
        <div className="flex h-full items-center justify-center px-6">
          <span className="text-sm text-muted-foreground">Footer</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

export const WithMinMax: Story = {
  render: () => (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] max-w-md rounded-lg border"
    >
      <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <span className="font-semibold block">Constrained</span>
            <span className="text-xs text-muted-foreground">
              Min 20% - Max 40%
            </span>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Flexible</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import {
  Calendar,
  Settings,
  Smile,
  File,
  User,
  Plus,
  Rocket,
} from 'lucide-react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command'
import { Button } from './button'

const meta = {
  title: 'UI/Command',
  component: Command,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile className="mr-2 h-4 w-4" />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <Rocket className="mr-2 h-4 w-4" />
            <span>Launch</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

const DialogComponent = () => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Press{' '}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </p>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open Command Menu
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile className="mr-2 h-4 w-4" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <Rocket className="mr-2 h-4 w-4" />
              <span>Launch</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}

export const Dialog: Story = {
  render: () => <DialogComponent />,
}

export const Search: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Search for files and folders..." />
      <CommandList>
        <CommandEmpty>No files found.</CommandEmpty>
        <CommandGroup heading="Recent Files">
          <CommandItem>
            <File className="mr-2 h-4 w-4" />
            <span>project-proposal.pdf</span>
          </CommandItem>
          <CommandItem>
            <File className="mr-2 h-4 w-4" />
            <span>meeting-notes.md</span>
          </CommandItem>
          <CommandItem>
            <File className="mr-2 h-4 w-4" />
            <span>design-specs.fig</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Folders">
          <CommandItem>
            <span>Documents</span>
          </CommandItem>
          <CommandItem>
            <span>Projects</span>
          </CommandItem>
          <CommandItem>
            <span>Downloads</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const WithKeyboardShortcuts: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Type a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="File">
          <CommandItem>
            <File className="mr-2 h-4 w-4" />
            <span>New File</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <File className="mr-2 h-4 w-4" />
            <span>Open File</span>
            <CommandShortcut>⌘O</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <File className="mr-2 h-4 w-4" />
            <span>Save</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <File className="mr-2 h-4 w-4" />
            <span>Save As</span>
            <CommandShortcut>⇧⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Edit">
          <CommandItem>
            <span>Undo</span>
            <CommandShortcut>⌘Z</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Redo</span>
            <CommandShortcut>⇧⌘Z</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Copy</span>
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Paste</span>
            <CommandShortcut>⌘V</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="View">
          <CommandItem>
            <span>Toggle Sidebar</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Toggle Terminal</span>
            <CommandShortcut>⌃`</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Command Palette</span>
            <CommandShortcut>⇧⌘P</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const Actions: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Search actions..." />
      <CommandList>
        <CommandEmpty>No actions found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Project</span>
          </CommandItem>
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Add Team Member</span>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Open Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem>
            <span>Go to Dashboard</span>
            <CommandShortcut>⌘1</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Go to Projects</span>
            <CommandShortcut>⌘2</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Go to Team</span>
            <CommandShortcut>⌘3</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <span>Go to Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const MultipleGroups: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Search everything..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem>
            <span>Home</span>
          </CommandItem>
          <CommandItem>
            <span>About</span>
          </CommandItem>
          <CommandItem>
            <span>Contact</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Projects">
          <CommandItem>
            <span>Website Redesign</span>
          </CommandItem>
          <CommandItem>
            <span>Mobile App</span>
          </CommandItem>
          <CommandItem>
            <span>API Development</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Team">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>John Doe</span>
          </CommandItem>
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Jane Smith</span>
          </CommandItem>
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Bob Johnson</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Preferences</span>
          </CommandItem>
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Account</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const FilterableList: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[450px]">
      <CommandInput placeholder="Filter programming languages..." />
      <CommandList>
        <CommandEmpty>No language found.</CommandEmpty>
        <CommandGroup heading="Popular">
          <CommandItem>JavaScript</CommandItem>
          <CommandItem>TypeScript</CommandItem>
          <CommandItem>Python</CommandItem>
          <CommandItem>Java</CommandItem>
          <CommandItem>C++</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Web">
          <CommandItem>HTML</CommandItem>
          <CommandItem>CSS</CommandItem>
          <CommandItem>JavaScript</CommandItem>
          <CommandItem>TypeScript</CommandItem>
          <CommandItem>PHP</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Systems">
          <CommandItem>C</CommandItem>
          <CommandItem>C++</CommandItem>
          <CommandItem>Rust</CommandItem>
          <CommandItem>Go</CommandItem>
          <CommandItem>Assembly</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

export const Compact: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[350px]">
      <CommandInput placeholder="Quick search..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup>
          <CommandItem>New</CommandItem>
          <CommandItem>Open</CommandItem>
          <CommandItem>Save</CommandItem>
          <CommandItem>Export</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}

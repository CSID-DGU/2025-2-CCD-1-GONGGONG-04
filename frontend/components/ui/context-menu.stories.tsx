import type { Meta, StoryObj } from '@storybook/react'
import {
  CopyIcon,
  DownloadIcon,
  LinkIcon,
  MailIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  PlusCircleIcon,
  ShareIcon,
  TrashIcon,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu'

const meta = {
  title: 'UI/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[200px] w-[400px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          <CopyIcon />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <DownloadIcon />
          Download
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <ShareIcon />
          Share
          <ContextMenuShortcut>⌘S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <TrashIcon />
          Delete
          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

export const WithSubmenus: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[200px] w-[400px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click to see submenu options
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          <CopyIcon />
          Copy
        </ContextMenuItem>
        <ContextMenuItem>
          <LinkIcon />
          Copy Link
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <ShareIcon />
            Share
          </ContextMenuSubTrigger>
          <ContextMenuPortal>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                <MailIcon />
                Email
              </ContextMenuItem>
              <ContextMenuItem>
                <MessageSquareIcon />
                Message
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>
                <PlusCircleIcon />
                More...
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuPortal>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <MoreHorizontalIcon />
            More Tools
          </ContextMenuSubTrigger>
          <ContextMenuPortal>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>Save as...</ContextMenuItem>
              <ContextMenuItem>Create Shortcut</ContextMenuItem>
              <ContextMenuItem>Rename</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuPortal>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <TrashIcon />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

export const WithCheckboxes: Story = {
  render: () => {
    const [showBookmarks, setShowBookmarks] = React.useState(true)
    const [showReadingList, setShowReadingList] = React.useState(false)
    const [showHistory, setShowHistory] = React.useState(false)

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-[200px] w-[400px] items-center justify-center rounded-md border border-dashed text-sm">
          Right click for view options
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuLabel>View Options</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            checked={showBookmarks}
            onCheckedChange={setShowBookmarks}
          >
            Show Bookmarks Bar
            <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={showReadingList}
            onCheckedChange={setShowReadingList}
          >
            Show Reading List
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={showHistory}
            onCheckedChange={setShowHistory}
          >
            Show Full History
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}

export const WithRadioGroup: Story = {
  render: () => {
    const [quality, setQuality] = React.useState('auto')

    return (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-[200px] w-[400px] items-center justify-center rounded-md border border-dashed text-sm">
          Right click to select quality
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuLabel>Video Quality</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={quality} onValueChange={setQuality}>
            <ContextMenuRadioItem value="auto">Auto</ContextMenuRadioItem>
            <ContextMenuRadioItem value="1080p">1080p</ContextMenuRadioItem>
            <ContextMenuRadioItem value="720p">720p</ContextMenuRadioItem>
            <ContextMenuRadioItem value="480p">480p</ContextMenuRadioItem>
            <ContextMenuRadioItem value="360p">360p</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
}

export const ImageContext: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[250px] w-[400px] items-center justify-center overflow-hidden rounded-md border">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 text-white">
          Right click this image area
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          <CopyIcon />
          Copy Image
        </ContextMenuItem>
        <ContextMenuItem>
          <LinkIcon />
          Copy Image Address
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <DownloadIcon />
          Save Image As...
          <ContextMenuShortcut>⌘S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Open Image in New Tab</ContextMenuItem>
        <ContextMenuItem>Inspect</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

export const TextContext: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[200px] w-[500px] items-center justify-center rounded-md border p-8 text-center">
        <p className="text-sm leading-relaxed">
          This is selectable text content. Right click to see text-related
          context menu options. Try selecting some text first before opening
          the menu.
        </p>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          <CopyIcon />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Select All</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Search</ContextMenuSubTrigger>
          <ContextMenuPortal>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>Search with Google</ContextMenuItem>
              <ContextMenuItem>Search with Bing</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuPortal>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

export const FileContext: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[160px] w-[400px] items-center gap-4 rounded-md border p-4">
        <div className="flex h-20 w-20 items-center justify-center rounded bg-blue-100 dark:bg-blue-900">
          <svg
            className="h-10 w-10 text-blue-600 dark:text-blue-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-medium">document.pdf</div>
          <div className="text-sm text-muted-foreground">2.4 MB</div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>Open With...</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <DownloadIcon />
          Download
        </ContextMenuItem>
        <ContextMenuItem>
          <ShareIcon />
          Share
        </ContextMenuItem>
        <ContextMenuItem>
          <CopyIcon />
          Copy
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem>Properties</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <TrashIcon />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

export const WithInset: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[200px] w-[400px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Actions with Icons</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <CopyIcon />
          Copy
        </ContextMenuItem>
        <ContextMenuItem>
          <DownloadIcon />
          Download
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuLabel inset>Plain Actions</ContextMenuLabel>
        <ContextMenuItem inset>Reload</ContextMenuItem>
        <ContextMenuItem inset>Clear Cache</ContextMenuItem>
        <ContextMenuItem inset>View Source</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}

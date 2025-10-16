import type { Meta, StoryObj } from '@storybook/react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from './table'

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">INV001</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>Credit Card</TableCell>
          <TableCell className="text-right">$250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV002</TableCell>
          <TableCell>Pending</TableCell>
          <TableCell>PayPal</TableCell>
          <TableCell className="text-right">$150.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV003</TableCell>
          <TableCell>Unpaid</TableCell>
          <TableCell>Bank Transfer</TableCell>
          <TableCell className="text-right">$350.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV004</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>Credit Card</TableCell>
          <TableCell className="text-right">$450.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">INV005</TableCell>
          <TableCell>Paid</TableCell>
          <TableCell>PayPal</TableCell>
          <TableCell className="text-right">$550.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of your recent transactions.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">TXN001</TableCell>
          <TableCell>2025-01-15</TableCell>
          <TableCell>Office Supplies</TableCell>
          <TableCell className="text-right">$125.50</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">TXN002</TableCell>
          <TableCell>2025-01-16</TableCell>
          <TableCell>Software License</TableCell>
          <TableCell className="text-right">$599.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">TXN003</TableCell>
          <TableCell>2025-01-17</TableCell>
          <TableCell>Travel Expenses</TableCell>
          <TableCell className="text-right">$450.75</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">TXN004</TableCell>
          <TableCell>2025-01-18</TableCell>
          <TableCell>Equipment Rental</TableCell>
          <TableCell className="text-right">$275.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right font-medium">$1,450.25</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const UserTable: Story = {
  render: () => (
    <Table>
      <TableCaption>Team members and their roles.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Alice Johnson</TableCell>
          <TableCell>alice@example.com</TableCell>
          <TableCell>Admin</TableCell>
          <TableCell>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Active
            </span>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Bob Smith</TableCell>
          <TableCell>bob@example.com</TableCell>
          <TableCell>Developer</TableCell>
          <TableCell>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Active
            </span>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Carol Williams</TableCell>
          <TableCell>carol@example.com</TableCell>
          <TableCell>Designer</TableCell>
          <TableCell>
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
              Away
            </span>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">David Brown</TableCell>
          <TableCell>david@example.com</TableCell>
          <TableCell>Manager</TableCell>
          <TableCell>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Active
            </span>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Eve Davis</TableCell>
          <TableCell>eve@example.com</TableCell>
          <TableCell>Developer</TableCell>
          <TableCell>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
              Offline
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const ProductTable: Story = {
  render: () => (
    <Table>
      <TableCaption>Product inventory status.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Wireless Mouse</TableCell>
          <TableCell>WM-001</TableCell>
          <TableCell className="text-right">$29.99</TableCell>
          <TableCell className="text-right">145</TableCell>
          <TableCell className="text-center">In Stock</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Mechanical Keyboard</TableCell>
          <TableCell>MK-002</TableCell>
          <TableCell className="text-right">$89.99</TableCell>
          <TableCell className="text-right">23</TableCell>
          <TableCell className="text-center">Low Stock</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">USB-C Hub</TableCell>
          <TableCell>UH-003</TableCell>
          <TableCell className="text-right">$49.99</TableCell>
          <TableCell className="text-right">0</TableCell>
          <TableCell className="text-center">Out of Stock</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Laptop Stand</TableCell>
          <TableCell>LS-004</TableCell>
          <TableCell className="text-right">$39.99</TableCell>
          <TableCell className="text-right">67</TableCell>
          <TableCell className="text-center">In Stock</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Webcam HD</TableCell>
          <TableCell>WC-005</TableCell>
          <TableCell className="text-right">$79.99</TableCell>
          <TableCell className="text-right">12</TableCell>
          <TableCell className="text-center">Low Stock</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const DataTable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">#</TableHead>
          <TableHead>Project Name</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead className="text-right">Due Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>1</TableCell>
          <TableCell className="font-medium">Website Redesign</TableCell>
          <TableCell>Design Team</TableCell>
          <TableCell>75%</TableCell>
          <TableCell className="text-right">2025-02-28</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>2</TableCell>
          <TableCell className="font-medium">Mobile App Launch</TableCell>
          <TableCell>Dev Team</TableCell>
          <TableCell>45%</TableCell>
          <TableCell className="text-right">2025-03-15</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>3</TableCell>
          <TableCell className="font-medium">API Integration</TableCell>
          <TableCell>Backend Team</TableCell>
          <TableCell>90%</TableCell>
          <TableCell className="text-right">2025-02-10</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>4</TableCell>
          <TableCell className="font-medium">Marketing Campaign</TableCell>
          <TableCell>Marketing Team</TableCell>
          <TableCell>30%</TableCell>
          <TableCell className="text-right">2025-04-01</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>5</TableCell>
          <TableCell className="font-medium">Database Migration</TableCell>
          <TableCell>DevOps Team</TableCell>
          <TableCell>60%</TableCell>
          <TableCell className="text-right">2025-02-20</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const MinimalTable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Subtotal</TableCell>
          <TableCell className="text-right">$99.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Tax</TableCell>
          <TableCell className="text-right">$9.90</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Shipping</TableCell>
          <TableCell className="text-right">$5.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-bold">Total</TableCell>
          <TableCell className="text-right font-bold">$113.90</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

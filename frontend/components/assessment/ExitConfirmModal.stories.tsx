/**
 * ExitConfirmModal Storybook Stories
 * Sprint 3 - Task 3.2.3
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ExitConfirmModal } from './ExitConfirmModal';

const meta = {
  title: 'Assessment/ExitConfirmModal',
  component: ExitConfirmModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExitConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 상태 (닫혀있음)
 */
export const Closed: Story = {
  args: {
    open: false,
    onClose: () => console.log('Modal closed'),
    onConfirmExit: () => console.log('Exit confirmed'),
  },
};

/**
 * 열린 상태
 */
export const Open: Story = {
  args: {
    open: true,
    onClose: () => console.log('Modal closed'),
    onConfirmExit: () => console.log('Exit confirmed'),
  },
};

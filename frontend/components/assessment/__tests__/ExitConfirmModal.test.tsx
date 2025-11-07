/**
 * ExitConfirmModal Component Tests
 * Sprint 3 - Task 3.2.3
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExitConfirmModal } from '../ExitConfirmModal';

describe('ExitConfirmModal', () => {
  const mockHandlers = {
    onClose: jest.fn(),
    onConfirmExit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when open is false', () => {
    render(<ExitConfirmModal open={false} {...mockHandlers} />);

    expect(
      screen.queryByText('진단을 중단하시겠습니까?')
    ).not.toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(<ExitConfirmModal open={true} {...mockHandlers} />);

    expect(
      screen.getByText('진단을 중단하시겠습니까?')
    ).toBeInTheDocument();
  });

  it('displays warning message', () => {
    render(<ExitConfirmModal open={true} {...mockHandlers} />);

    expect(
      screen.getByText(/진행 중인 내용은 저장되지 않습니다/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/처음부터 다시 시작해야 합니다/i)
    ).toBeInTheDocument();
  });

  it('renders "계속 진단하기" button', () => {
    render(<ExitConfirmModal open={true} {...mockHandlers} />);

    expect(
      screen.getByRole('button', { name: /계속 진단하기/i })
    ).toBeInTheDocument();
  });

  it('renders "나가기" button', () => {
    render(<ExitConfirmModal open={true} {...mockHandlers} />);

    expect(
      screen.getByRole('button', { name: /나가기/i })
    ).toBeInTheDocument();
  });

  it('calls onClose when "계속 진단하기" button is clicked', () => {
    render(<ExitConfirmModal open={true} {...mockHandlers} />);

    const continueButton = screen.getByRole('button', { name: /계속 진단하기/i });
    fireEvent.click(continueButton);

    expect(mockHandlers.onClose).toHaveBeenCalledTimes(1);
    expect(mockHandlers.onConfirmExit).not.toHaveBeenCalled();
  });

  it('calls onConfirmExit when "나가기" button is clicked', () => {
    render(<ExitConfirmModal open={true} {...mockHandlers} />);

    const exitButton = screen.getByRole('button', { name: /나가기/i });
    fireEvent.click(exitButton);

    expect(mockHandlers.onConfirmExit).toHaveBeenCalledTimes(1);
  });

  it('"계속 진단하기" button has primary styling', () => {
    render(<ExitConfirmModal open={true} {...mockHandlers} />);

    const continueButton = screen.getByRole('button', { name: /계속 진단하기/i });

    // Should have lavender background (primary action)
    expect(continueButton).toHaveClass('bg-lavender-500');
  });

  it('"나가기" button has secondary styling', () => {
    render(<ExitConfirmModal open={true} {...mockHandlers} />);

    const exitButton = screen.getByRole('button', { name: /나가기/i });

    // Should have gray background (secondary action)
    expect(exitButton).toHaveClass('bg-gray-100');
  });
});

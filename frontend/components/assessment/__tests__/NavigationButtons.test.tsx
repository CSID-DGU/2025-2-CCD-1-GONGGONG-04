/**
 * NavigationButtons Component Tests
 * Sprint 3 - Task 3.2.3
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationButtons } from '../NavigationButtons';

describe('NavigationButtons', () => {
  const mockHandlers = {
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Previous button', () => {
    it('renders previous button', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={false}
          isLastStep={false}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      expect(screen.getByRole('button', { name: /이전/i })).toBeInTheDocument();
    });

    it('disables previous button when canGoPrevious is false', () => {
      render(
        <NavigationButtons
          canGoPrevious={false}
          canGoNext={true}
          isLastStep={false}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      const prevButton = screen.getByRole('button', { name: /이전/i });
      expect(prevButton).toBeDisabled();
    });

    it('calls onPrevious when clicked', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={false}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      const prevButton = screen.getByRole('button', { name: /이전/i });
      fireEvent.click(prevButton);

      expect(mockHandlers.onPrevious).toHaveBeenCalledTimes(1);
    });

    it('disables previous button when submitting', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={false}
          isSubmitting={true}
          {...mockHandlers}
        />
      );

      const prevButton = screen.getByRole('button', { name: /이전/i });
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Next button (not last step)', () => {
    it('renders next button when not last step', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={false}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      expect(screen.getByRole('button', { name: /다음/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /제출/i })).not.toBeInTheDocument();
    });

    it('disables next button when canGoNext is false', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={false}
          isLastStep={false}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      const nextButton = screen.getByRole('button', { name: /다음/i });
      expect(nextButton).toBeDisabled();
    });

    it('calls onNext when clicked', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={false}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      const nextButton = screen.getByRole('button', { name: /다음/i });
      fireEvent.click(nextButton);

      expect(mockHandlers.onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Submit button (last step)', () => {
    it('renders submit button when last step', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={true}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      expect(screen.getByRole('button', { name: /제출/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /다음/i })).not.toBeInTheDocument();
    });

    it('disables submit button when canGoNext is false', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={false}
          isLastStep={true}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      const submitButton = screen.getByRole('button', { name: /제출/i });
      expect(submitButton).toBeDisabled();
    });

    it('shows loading state when submitting', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={true}
          isSubmitting={true}
          {...mockHandlers}
        />
      );

      expect(screen.getByText(/제출 중.../i)).toBeInTheDocument();
    });

    it('calls onSubmit when clicked', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={true}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      const submitButton = screen.getByRole('button', { name: /제출/i });
      fireEvent.click(submitButton);

      expect(mockHandlers.onSubmit).toHaveBeenCalledTimes(1);
    });

    it('disables submit button when isSubmitting is true', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={true}
          isSubmitting={true}
          {...mockHandlers}
        />
      );

      const submitButton = screen.getByRole('button', { name: /제출 중/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label for previous button', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={false}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      const prevButton = screen.getByLabelText('이전 질문으로 이동');
      expect(prevButton).toBeInTheDocument();
    });

    it('has correct aria-label for next button', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={false}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      const nextButton = screen.getByLabelText('다음 질문으로 이동');
      expect(nextButton).toBeInTheDocument();
    });

    it('has correct aria-label for submit button', () => {
      render(
        <NavigationButtons
          canGoPrevious={true}
          canGoNext={true}
          isLastStep={true}
          isSubmitting={false}
          {...mockHandlers}
        />
      );

      const submitButton = screen.getByLabelText('자가진단 제출하기');
      expect(submitButton).toBeInTheDocument();
    });
  });
});

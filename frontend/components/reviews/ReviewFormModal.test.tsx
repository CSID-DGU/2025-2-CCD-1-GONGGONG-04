/**
 * ReviewFormModal Component Tests
 *
 * Sprint 4: Review and Rating System
 * Unit tests for ReviewFormModal component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { ReviewFormModal } from './ReviewFormModal';
import type { Review } from '@/types/review';

// Mock toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock mutation hooks
vi.mock('@/hooks/useReviewMutation', () => ({
  useCreateReview: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 1, rating: 5 }),
    isPending: false,
  }),
  useUpdateReview: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 1, rating: 4 }),
    isPending: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockReview: Review = {
  id: 1,
  rating: 4,
  title: '친절한 상담',
  content: '정말 좋은 경험이었습니다. 상담사분이 친절하게 대해주셨어요.',
  visit_date: '2025-01-10',
  helpful_count: 5,
  unhelpful_count: 1,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  user: {
    id: 1,
    nickname: '홍길동',
    avatar_url: null,
  },
  is_my_review: true,
  my_reaction: null,
};

describe('ReviewFormModal', () => {
  const defaultProps = {
    centerId: 1,
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders create mode with empty form', () => {
      render(<ReviewFormModal {...defaultProps} />, { wrapper });

      expect(screen.getByText('리뷰 작성')).toBeInTheDocument();
      expect(screen.getByLabelText(/별점/)).toBeInTheDocument();
      expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
      expect(screen.getByLabelText(/리뷰 내용/)).toBeInTheDocument();
      expect(screen.getByLabelText(/방문 날짜/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '등록' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('renders edit mode with pre-filled form', () => {
      render(<ReviewFormModal {...defaultProps} existingReview={mockReview} />, { wrapper });

      expect(screen.getByText('리뷰 수정')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '수정하기' })).toBeInTheDocument();

      // Check pre-filled values
      const titleInput = screen.getByLabelText(/제목/) as HTMLInputElement;
      const contentTextarea = screen.getByLabelText(/리뷰 내용/) as HTMLTextAreaElement;

      expect(titleInput.value).toBe(mockReview.title);
      expect(contentTextarea.value).toBe(mockReview.content);
    });

    it('shows character counter for content field', () => {
      render(<ReviewFormModal {...defaultProps} />, { wrapper });

      const counter = screen.getByText(/\/ 1000/);
      expect(counter).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('shows error when rating is not selected', async () => {
      render(<ReviewFormModal {...defaultProps} />, { wrapper });

      const submitButton = screen.getByRole('button', { name: '등록' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('별점을 선택해주세요')).toBeInTheDocument();
      });
    });

    it('shows error when content is too short', async () => {
      render(<ReviewFormModal {...defaultProps} />, { wrapper });

      const contentTextarea = screen.getByLabelText(/리뷰 내용/);
      fireEvent.change(contentTextarea, { target: { value: '짧음' } });

      const submitButton = screen.getByRole('button', { name: '등록' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/최소 10자 이상/)).toBeInTheDocument();
      });
    });

    it('shows error when content is too long', async () => {
      render(<ReviewFormModal {...defaultProps} />, { wrapper });

      const contentTextarea = screen.getByLabelText(/리뷰 내용/);
      const longContent = 'A'.repeat(1001);
      fireEvent.change(contentTextarea, { target: { value: longContent } });

      const submitButton = screen.getByRole('button', { name: '등록' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/최대 1000자/)).toBeInTheDocument();
      });
    });

    it('shows error when title is too long', async () => {
      render(<ReviewFormModal {...defaultProps} />, { wrapper });

      const titleInput = screen.getByLabelText(/제목/);
      const longTitle = 'A'.repeat(101);
      fireEvent.change(titleInput, { target: { value: longTitle } });

      const submitButton = screen.getByRole('button', { name: '등록' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/최대 100자/)).toBeInTheDocument();
      });
    });
  });

  describe('Character Counter', () => {
    it('updates character counter when typing', () => {
      render(<ReviewFormModal {...defaultProps} />, { wrapper });

      const contentTextarea = screen.getByLabelText(/리뷰 내용/);
      fireEvent.change(contentTextarea, { target: { value: '좋은 상담이었습니다!' } });

      expect(screen.getByText('11 / 1000')).toBeInTheDocument();
    });

    it('turns counter red when exceeding limit', () => {
      render(<ReviewFormModal {...defaultProps} />, { wrapper });

      const contentTextarea = screen.getByLabelText(/리뷰 내용/);
      const longContent = 'A'.repeat(1001);
      fireEvent.change(contentTextarea, { target: { value: longContent } });

      const counter = screen.getByText('1001 / 1000');
      expect(counter).toHaveClass('text-destructive');
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data in create mode', async () => {
      const onSuccess = vi.fn();
      render(<ReviewFormModal {...defaultProps} onSuccess={onSuccess} />, { wrapper });

      // Fill form
      const ratingButtons = screen.getAllByRole('radio');
      fireEvent.click(ratingButtons[4]); // 5 stars

      const titleInput = screen.getByLabelText(/제목/);
      fireEvent.change(titleInput, { target: { value: '좋은 센터' } });

      const contentTextarea = screen.getByLabelText(/리뷰 내용/);
      fireEvent.change(contentTextarea, { target: { value: '정말 좋은 경험이었습니다!' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: '등록' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('submits form with valid data in edit mode', async () => {
      const onSuccess = vi.fn();
      render(
        <ReviewFormModal {...defaultProps} existingReview={mockReview} onSuccess={onSuccess} />,
        { wrapper }
      );

      const submitButton = screen.getByRole('button', { name: '수정하기' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Dialog Controls', () => {
    it('calls onClose when cancel button is clicked', () => {
      const onClose = vi.fn();
      render(<ReviewFormModal {...defaultProps} onClose={onClose} />, { wrapper });

      const cancelButton = screen.getByRole('button', { name: '취소' });
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
      render(<ReviewFormModal {...defaultProps} isOpen={false} />, { wrapper });

      expect(screen.queryByText('리뷰 작성')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for required fields', () => {
      render(<ReviewFormModal {...defaultProps} />, { wrapper });

      expect(screen.getByLabelText(/별점.*\*/)).toBeInTheDocument();
      expect(screen.getByLabelText(/리뷰 내용.*\*/)).toBeInTheDocument();
    });

    it('has proper ARIA error descriptions', async () => {
      render(<ReviewFormModal {...defaultProps} />, { wrapper });

      const submitButton = screen.getByRole('button', { name: '등록' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const contentTextarea = screen.getByLabelText(/리뷰 내용/);
        expect(contentTextarea).toHaveAttribute('aria-invalid', 'true');
        expect(contentTextarea).toHaveAttribute('aria-describedby', 'content-error');
      });
    });
  });
});

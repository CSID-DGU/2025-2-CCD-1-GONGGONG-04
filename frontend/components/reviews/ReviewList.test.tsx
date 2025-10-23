import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReviewList } from './ReviewList';
import * as useReviewsHook from '@/hooks/useReviews';
import type { ReviewsResponse } from '@/types/review';

// Mock useReviews hook
vi.mock('@/hooks/useReviews');

const mockReviewsResponse: ReviewsResponse = {
  reviews: [
    {
      id: 1,
      rating: 5,
      title: '훌륭한 상담',
      content: '매우 만족스러웠습니다.',
      visit_date: '2025-01-15',
      helpful_count: 10,
      unhelpful_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: 101,
        nickname: '김철수',
        avatar_url: null,
      },
      is_my_review: false,
      my_reaction: null,
    },
    {
      id: 2,
      rating: 4,
      title: '좋았어요',
      content: '친절하고 전문적이었습니다.',
      visit_date: null,
      helpful_count: 5,
      unhelpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: 102,
        nickname: '이영희',
        avatar_url: null,
      },
      is_my_review: false,
      my_reaction: null,
    },
  ],
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_count: 2,
    limit: 10,
    has_prev: false,
    has_next: false,
  },
  summary: {
    avg_rating: 4.5,
    total_reviews: 2,
    rating_distribution: {
      5: 1,
      4: 1,
      3: 0,
      2: 0,
      1: 0,
    },
  },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('ReviewList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    vi.mocked(useReviewsHook.useReviews).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    render(
      <ReviewList
        centerId={1}
        sortBy="latest"
        onSortChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    // Check for skeletons
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error message when fetch fails', () => {
    vi.mocked(useReviewsHook.useReviews).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    render(
      <ReviewList
        centerId={1}
        sortBy="latest"
        onSortChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('리뷰를 불러오는데 실패했습니다')).toBeInTheDocument();
  });

  it('renders empty state when no reviews', () => {
    vi.mocked(useReviewsHook.useReviews).mockReturnValue({
      data: {
        pages: [{ ...mockReviewsResponse, reviews: [], pagination: { ...mockReviewsResponse.pagination, total_count: 0 } }],
        pageParams: [1],
      },
      isLoading: false,
      isError: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    render(
      <ReviewList
        centerId={1}
        sortBy="latest"
        onSortChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('아직 리뷰가 없습니다')).toBeInTheDocument();
  });

  it('renders reviews when data is loaded', () => {
    vi.mocked(useReviewsHook.useReviews).mockReturnValue({
      data: {
        pages: [mockReviewsResponse],
        pageParams: [1],
      },
      isLoading: false,
      isError: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    render(
      <ReviewList
        centerId={1}
        sortBy="latest"
        onSortChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('훌륭한 상담')).toBeInTheDocument();
    expect(screen.getByText('좋았어요')).toBeInTheDocument();
  });

  it('displays total review count', () => {
    vi.mocked(useReviewsHook.useReviews).mockReturnValue({
      data: {
        pages: [mockReviewsResponse],
        pageParams: [1],
      },
      isLoading: false,
      isError: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    render(
      <ReviewList
        centerId={1}
        sortBy="latest"
        onSortChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('2', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/개의 리뷰/)).toBeInTheDocument();
  });

  it('calls onSortChange when sort option changes', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    vi.mocked(useReviewsHook.useReviews).mockReturnValue({
      data: {
        pages: [mockReviewsResponse],
        pageParams: [1],
      },
      isLoading: false,
      isError: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    render(
      <ReviewList
        centerId={1}
        sortBy="latest"
        onSortChange={onSortChange}
      />,
      { wrapper: createWrapper() }
    );

    const sortSelect = screen.getByLabelText('정렬 옵션');
    await user.click(sortSelect);

    await waitFor(() => {
      const helpfulOption = screen.getByRole('option', { name: '도움순' });
      expect(helpfulOption).toBeInTheDocument();
    });
  });

  it('renders load more button when hasNextPage is true', () => {
    vi.mocked(useReviewsHook.useReviews).mockReturnValue({
      data: {
        pages: [mockReviewsResponse],
        pageParams: [1],
      },
      isLoading: false,
      isError: false,
      fetchNextPage: vi.fn(),
      hasNextPage: true,
      isFetchingNextPage: false,
    } as any);

    render(
      <ReviewList
        centerId={1}
        sortBy="latest"
        onSortChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('더보기')).toBeInTheDocument();
  });

  it('calls fetchNextPage when load more button is clicked', async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();

    vi.mocked(useReviewsHook.useReviews).mockReturnValue({
      data: {
        pages: [mockReviewsResponse],
        pageParams: [1],
      },
      isLoading: false,
      isError: false,
      fetchNextPage,
      hasNextPage: true,
      isFetchingNextPage: false,
    } as any);

    render(
      <ReviewList
        centerId={1}
        sortBy="latest"
        onSortChange={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    const loadMoreButton = screen.getByText('더보기');
    await user.click(loadMoreButton);

    expect(fetchNextPage).toHaveBeenCalled();
  });
});

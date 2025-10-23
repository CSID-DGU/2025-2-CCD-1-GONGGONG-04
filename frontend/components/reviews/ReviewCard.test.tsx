import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewCard } from './ReviewCard';
import type { Review } from '@/types/review';

const mockReview: Review = {
  id: 1,
  rating: 4,
  title: '좋은 상담이었습니다',
  content: '상담사분이 친절하고 전문적이었어요.',
  visit_date: '2025-01-15',
  helpful_count: 10,
  unhelpful_count: 2,
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  user: {
    id: 101,
    nickname: '김철수',
    avatar_url: null,
  },
  is_my_review: false,
  my_reaction: null,
};

describe('ReviewCard', () => {
  it('renders review author name', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('김철수')).toBeInTheDocument();
  });

  it('renders review title', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('좋은 상담이었습니다')).toBeInTheDocument();
  });

  it('renders review content', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('상담사분이 친절하고 전문적이었어요.')).toBeInTheDocument();
  });

  it('renders star rating', () => {
    render(<ReviewCard review={mockReview} />);

    const ratingElement = screen.getByRole('img', { name: '별점 4점' });
    expect(ratingElement).toBeInTheDocument();
  });

  it('renders visit date badge when provided', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText(/방문일:/)).toBeInTheDocument();
  });

  it('does not render visit date when null', () => {
    const reviewWithoutVisitDate = { ...mockReview, visit_date: null };
    render(<ReviewCard review={reviewWithoutVisitDate} />);

    expect(screen.queryByText(/방문일:/)).not.toBeInTheDocument();
  });

  it('does not render title when null', () => {
    const reviewWithoutTitle = { ...mockReview, title: null };
    render(<ReviewCard review={reviewWithoutTitle} />);

    expect(screen.queryByText('좋은 상담이었습니다')).not.toBeInTheDocument();
  });

  it('renders reaction buttons with counts', () => {
    render(<ReviewCard review={mockReview} onReactionClick={vi.fn()} />);

    expect(screen.getByText('10')).toBeInTheDocument(); // helpful count
    expect(screen.getByText('2')).toBeInTheDocument(); // unhelpful count
  });

  it('calls onReactionClick when helpful button is clicked', async () => {
    const user = userEvent.setup();
    const onReactionClick = vi.fn();
    render(<ReviewCard review={mockReview} onReactionClick={onReactionClick} />);

    const helpfulButton = screen.getByLabelText('이 리뷰가 도움돼요');
    await user.click(helpfulButton);

    expect(onReactionClick).toHaveBeenCalledWith(1, 'helpful');
  });

  it('calls onReactionClick when unhelpful button is clicked', async () => {
    const user = userEvent.setup();
    const onReactionClick = vi.fn();
    render(<ReviewCard review={mockReview} onReactionClick={onReactionClick} />);

    const unhelpfulButton = screen.getByLabelText('이 리뷰가 도움안돼요');
    await user.click(unhelpfulButton);

    expect(onReactionClick).toHaveBeenCalledWith(1, 'unhelpful');
  });

  it('toggles helpful reaction when clicked twice', async () => {
    const user = userEvent.setup();
    const onReactionClick = vi.fn();
    const reviewWithHelpful = { ...mockReview, my_reaction: 'helpful' as const };
    render(<ReviewCard review={reviewWithHelpful} onReactionClick={onReactionClick} />);

    const helpfulButton = screen.getByLabelText('이 리뷰가 도움돼요');
    await user.click(helpfulButton);

    // Should cancel reaction (pass null)
    expect(onReactionClick).toHaveBeenCalledWith(1, null);
  });

  it('shows dropdown menu for own reviews', () => {
    const myReview = { ...mockReview, is_my_review: true };
    render(<ReviewCard review={myReview} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const moreButton = screen.getByLabelText('더보기 메뉴');
    expect(moreButton).toBeInTheDocument();
  });

  it('does not show dropdown menu for other users reviews', () => {
    render(<ReviewCard review={mockReview} />);

    const moreButton = screen.queryByLabelText('더보기 메뉴');
    expect(moreButton).not.toBeInTheDocument();
  });

  it('calls onEdit when edit menu item is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const myReview = { ...mockReview, is_my_review: true };
    render(<ReviewCard review={myReview} onEdit={onEdit} />);

    const moreButton = screen.getByLabelText('더보기 메뉴');
    await user.click(moreButton);

    const editItem = screen.getByText('수정');
    await user.click(editItem);

    expect(onEdit).toHaveBeenCalledWith(myReview);
  });

  it('calls onDelete when delete menu item is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const myReview = { ...mockReview, is_my_review: true };
    render(<ReviewCard review={myReview} onDelete={onDelete} />);

    const moreButton = screen.getByLabelText('더보기 메뉴');
    await user.click(moreButton);

    const deleteItem = screen.getByText('삭제');
    await user.click(deleteItem);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('renders avatar fallback when no avatar URL', () => {
    render(<ReviewCard review={mockReview} />);

    // Fallback should show first letter of nickname
    expect(screen.getByText('김')).toBeInTheDocument();
  });

  it('has correct aria-pressed for active helpful reaction', () => {
    const reviewWithHelpful = { ...mockReview, my_reaction: 'helpful' as const };
    render(<ReviewCard review={reviewWithHelpful} onReactionClick={vi.fn()} />);

    const helpfulButton = screen.getByLabelText('이 리뷰가 도움돼요');
    expect(helpfulButton).toHaveAttribute('aria-pressed', 'true');
  });
});

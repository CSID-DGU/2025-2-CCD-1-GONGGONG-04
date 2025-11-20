/**
 * CenterListSkeleton Component - Unit Tests
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * CenterListSkeleton 컴포넌트 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CenterListSkeleton,
  SearchBarSkeleton,
  FilterButtonSkeleton,
} from '../CenterListSkeleton';

describe('CenterListSkeleton', () => {
  describe('기본 렌더링', () => {
    it('스켈레톤이 렌더링된다', () => {
      render(<CenterListSkeleton />);

      expect(screen.getByRole('status', { name: '센터 목록 로딩 중' })).toBeInTheDocument();
    });

    it('기본 6개의 카드 스켈레톤을 렌더링한다', () => {
      const { container } = render(<CenterListSkeleton />);

      // CenterCardSkeleton has Card component with internal structure
      // Count direct children of grid which are Card wrappers
      const grid = container.querySelector('.grid');
      const directChildren = grid?.children;
      expect(directChildren?.length).toBe(6);
    });

    it('커스텀 카드 수를 렌더링한다', () => {
      const { container } = render(<CenterListSkeleton cardCount={9} />);

      const grid = container.querySelector('.grid');
      const directChildren = grid?.children;
      expect(directChildren?.length).toBe(9);
    });

    it('헤더 스켈레톤을 렌더링한다', () => {
      const { container } = render(<CenterListSkeleton />);

      // Header consists of title and subtitle skeletons
      const headerSkeleton = container.querySelector('.space-y-2.animate-pulse');
      expect(headerSkeleton).toBeInTheDocument();
      expect(headerSkeleton?.children.length).toBe(2);
    });

    it('검색바와 필터 버튼 스켈레톤을 렌더링한다', () => {
      const { container } = render(<CenterListSkeleton />);

      // Search bar and filter button are in a flex container
      const searchFilterContainer = container.querySelector('.flex.flex-col.sm\\:flex-row.gap-3.animate-pulse');
      expect(searchFilterContainer).toBeInTheDocument();
      expect(searchFilterContainer?.children.length).toBe(2);
    });

    it('페이지네이션 스켈레톤을 렌더링한다', () => {
      const { container } = render(<CenterListSkeleton />);

      // Pagination skeleton should have page info and page buttons
      const paginationSkeleton = container.querySelector('.flex.flex-col.items-center.gap-4.pt-4.animate-pulse');
      expect(paginationSkeleton).toBeInTheDocument();

      // Should have 5 page number skeletons
      const pageButtons = paginationSkeleton?.querySelectorAll('.h-10.w-10');
      expect(pageButtons?.length).toBe(5);
    });
  });

  describe('스타일링', () => {
    it('커스텀 className을 적용한다', () => {
      render(<CenterListSkeleton className="custom-class" />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('custom-class');
    });

    it('기본 컨테이너 스타일을 유지한다', () => {
      render(<CenterListSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-6');
    });

    it('애니메이션 클래스가 적용된다', () => {
      const { container } = render(<CenterListSkeleton />);

      const animatedElements = container.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('접근성', () => {
    it('role="status"가 설정된다', () => {
      render(<CenterListSkeleton />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('aria-label이 설정된다', () => {
      render(<CenterListSkeleton />);

      expect(screen.getByLabelText('센터 목록 로딩 중')).toBeInTheDocument();
    });
  });

  describe('반응형 디자인', () => {
    it('그리드 레이아웃 클래스가 설정된다', () => {
      const { container } = render(<CenterListSkeleton />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('검색바와 필터가 반응형 flex 레이아웃을 사용한다', () => {
      const { container } = render(<CenterListSkeleton />);

      const flexContainer = container.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('엣지 케이스', () => {
    it('0개 카드로 렌더링해도 오류가 발생하지 않는다', () => {
      const { container } = render(<CenterListSkeleton cardCount={0} />);

      const grid = container.querySelector('.grid');
      const directChildren = grid?.children;
      expect(directChildren?.length).toBe(0);
    });

    it('음수 카드 수는 빈 배열로 처리된다', () => {
      const { container } = render(<CenterListSkeleton cardCount={-5} />);

      const grid = container.querySelector('.grid');
      const directChildren = grid?.children;
      expect(directChildren?.length).toBe(0);
    });

    it('매우 많은 카드 수를 처리한다', () => {
      const { container } = render(<CenterListSkeleton cardCount={100} />);

      const grid = container.querySelector('.grid');
      const directChildren = grid?.children;
      expect(directChildren?.length).toBe(100);
    });
  });
});

describe('SearchBarSkeleton', () => {
  it('검색바 스켈레톤이 렌더링된다', () => {
    render(<SearchBarSkeleton />);

    expect(screen.getByRole('status', { name: '검색바 로딩 중' })).toBeInTheDocument();
  });

  it('기본 스타일이 적용된다', () => {
    render(<SearchBarSkeleton />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('h-11', 'bg-neutral-200', 'rounded-lg', 'animate-pulse');
  });

  it('커스텀 className을 적용한다', () => {
    render(<SearchBarSkeleton className="custom-search" />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('custom-search');
  });
});

describe('FilterButtonSkeleton', () => {
  it('필터 버튼 스켈레톤이 렌더링된다', () => {
    render(<FilterButtonSkeleton />);

    expect(screen.getByRole('status', { name: '필터 버튼 로딩 중' })).toBeInTheDocument();
  });

  it('기본 스타일이 적용된다', () => {
    render(<FilterButtonSkeleton />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('h-11', 'w-20', 'bg-neutral-200', 'rounded-lg', 'animate-pulse');
  });

  it('커스텀 className을 적용한다', () => {
    render(<FilterButtonSkeleton className="custom-filter" />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('custom-filter');
  });
});

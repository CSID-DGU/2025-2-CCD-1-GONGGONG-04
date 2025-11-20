/**
 * EmptyState Component - Unit Tests
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * @description
 * EmptyState 컴포넌트 단위 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState, EmptyStatePresets } from '../EmptyState';
import { Button } from '@/components/ui/button';

describe('EmptyState', () => {
  describe('기본 렌더링', () => {
    it('제목만 있는 EmptyState를 렌더링한다', () => {
      render(<EmptyState title="데이터가 없습니다" />);

      expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
    });

    it('아이콘을 렌더링한다', () => {
      render(<EmptyState icon="🔍" title="검색 결과 없음" />);

      expect(screen.getByText('🔍')).toBeInTheDocument();
    });

    it('단일 설명 텍스트를 렌더링한다', () => {
      render(
        <EmptyState
          title="검색 결과 없음"
          description="검색어를 다시 확인해주세요"
        />
      );

      expect(screen.getByText('검색어를 다시 확인해주세요')).toBeInTheDocument();
    });

    it('여러 줄 설명을 리스트로 렌더링한다', () => {
      render(
        <EmptyState
          title="검색 결과 없음"
          description={['검색어를 다시 확인해주세요', '다른 키워드로 검색해보세요']}
        />
      );

      expect(screen.getByText(/검색어를 다시 확인해주세요/)).toBeInTheDocument();
      expect(screen.getByText(/다른 키워드로 검색해보세요/)).toBeInTheDocument();
    });

    it('액션 버튼을 렌더링한다', () => {
      render(
        <EmptyState
          title="검색 결과 없음"
          action={<Button>전체 센터 보기</Button>}
        />
      );

      expect(screen.getByRole('button', { name: '전체 센터 보기' })).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('role="status"가 설정된다', () => {
      render(<EmptyState title="데이터 없음" />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
    });

    it('aria-live="polite"가 설정된다', () => {
      render(<EmptyState title="데이터 없음" />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('아이콘에 aria-hidden이 설정된다', () => {
      const { container } = render(<EmptyState icon="🔍" title="검색 결과 없음" />);

      const iconDiv = container.querySelector('[aria-hidden="true"]');
      expect(iconDiv).toBeInTheDocument();
      expect(iconDiv).toHaveTextContent('🔍');
    });
  });

  describe('스타일링', () => {
    it('커스텀 className을 적용한다', () => {
      render(<EmptyState title="데이터 없음" className="custom-class" />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('custom-class');
    });

    it('기본 스타일을 유지한다', () => {
      render(<EmptyState title="데이터 없음" />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('flex', 'flex-col', 'items-center');
    });
  });

  describe('인터랙션', () => {
    it('액션 버튼 클릭이 동작한다', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <EmptyState
          title="데이터 없음"
          action={
            <Button onClick={handleClick}>새로고침</Button>
          }
        />
      );

      const button = screen.getByRole('button', { name: '새로고침' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('엣지 케이스', () => {
    it('빈 description 배열을 처리한다', () => {
      render(<EmptyState title="데이터 없음" description={[]} />);

      // description이 렌더링되지 않아야 함
      const container = screen.getByRole('status');
      expect(container.querySelectorAll('ul').length).toBe(0);
      expect(container.querySelectorAll('p').length).toBe(0); // description이 없으므로 0개
      expect(screen.getByText('데이터 없음')).toBeInTheDocument(); // title은 h3로 렌더링됨
    });

    it('undefined description을 처리한다', () => {
      render(<EmptyState title="데이터 없음" description={undefined} />);

      // description이 렌더링되지 않아야 함
      const container = screen.getByRole('status');
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(0);
    });

    it('icon이 React 컴포넌트일 때 렌더링한다', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Custom Icon</div>;

      render(<EmptyState icon={<CustomIcon />} title="데이터 없음" />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });
});

describe('EmptyStatePresets', () => {
  describe('NoSearchResults', () => {
    it('검색 결과 없음 preset을 렌더링한다', () => {
      render(<EmptyStatePresets.NoSearchResults />);

      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
      expect(screen.getByText(/검색어를 다시 확인해주세요/)).toBeInTheDocument();
      expect(screen.getByText(/다른 키워드로 검색해보세요/)).toBeInTheDocument();
    });

    it('onReset 핸들러가 동작한다', async () => {
      const user = userEvent.setup();
      const handleReset = vi.fn();

      render(<EmptyStatePresets.NoSearchResults onReset={handleReset} />);

      const button = screen.getByRole('button', { name: '전체 센터 보기' });
      await user.click(button);

      expect(handleReset).toHaveBeenCalledTimes(1);
    });

    it('onReset이 없으면 버튼이 렌더링되지 않는다', () => {
      render(<EmptyStatePresets.NoSearchResults />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('NoFilterResults', () => {
    it('필터 결과 없음 preset을 렌더링한다', () => {
      render(<EmptyStatePresets.NoFilterResults />);

      expect(screen.getByText('필터 조건에 맞는 센터가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('다른 조건으로 검색해보세요')).toBeInTheDocument();
    });

    it('onResetFilters 핸들러가 동작한다', async () => {
      const user = userEvent.setup();
      const handleResetFilters = vi.fn();

      render(<EmptyStatePresets.NoFilterResults onResetFilters={handleResetFilters} />);

      const button = screen.getByRole('button', { name: '필터 초기화' });
      await user.click(button);

      expect(handleResetFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('NoBookmarks', () => {
    it('즐겨찾기 없음 preset을 렌더링한다', () => {
      render(<EmptyStatePresets.NoBookmarks />);

      expect(screen.getByText('즐겨찾기한 센터가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('자주 찾는 센터를 즐겨찾기에 추가해보세요')).toBeInTheDocument();
    });

    it('onGoToCenters 핸들러가 동작한다', async () => {
      const user = userEvent.setup();
      const handleGoToCenters = vi.fn();

      render(<EmptyStatePresets.NoBookmarks onGoToCenters={handleGoToCenters} />);

      const button = screen.getByRole('button', { name: '센터 찾아보기' });
      await user.click(button);

      expect(handleGoToCenters).toHaveBeenCalledTimes(1);
    });
  });

  describe('NoData', () => {
    it('일반 데이터 없음 preset을 렌더링한다', () => {
      render(<EmptyStatePresets.NoData />);

      expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('나중에 다시 시도해주세요')).toBeInTheDocument();
    });

    it('커스텀 메시지를 렌더링한다', () => {
      render(<EmptyStatePresets.NoData message="커스텀 메시지" />);

      expect(screen.getByText('커스텀 메시지')).toBeInTheDocument();
    });

    it('onAction 핸들러가 동작한다', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();

      render(<EmptyStatePresets.NoData onAction={handleAction} />);

      const button = screen.getByRole('button', { name: '새로고침' });
      await user.click(button);

      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MainLayout from '../MainLayout';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../BottomNavigation', () => ({
  default: () => <nav role="navigation">Bottom Navigation</nav>,
}));

describe('MainLayout', () => {
  const mockRouter = {
    back: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    forward: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  it('children을 렌더링한다', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('title이 있으면 헤더에 표시한다', () => {
    render(<MainLayout title="테스트 페이지">내용</MainLayout>);
    expect(screen.getByText('테스트 페이지')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('title이 없으면 헤더를 표시하지 않는다', () => {
    render(<MainLayout>내용</MainLayout>);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('showBackButton이 true면 뒤로가기 버튼을 표시한다', async () => {
    const user = userEvent.setup();
    render(<MainLayout showBackButton={true} title="페이지">내용</MainLayout>);

    const backButton = screen.getByLabelText('뒤로 가기');
    expect(backButton).toBeInTheDocument();

    await user.click(backButton);
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it('showBackButton이 false면 뒤로가기 버튼을 표시하지 않는다', () => {
    render(<MainLayout showBackButton={false} title="페이지">내용</MainLayout>);
    expect(screen.queryByLabelText('뒤로 가기')).not.toBeInTheDocument();
  });

  it('showBottomNav이 true면 하단 네비게이션을 표시한다 (기본값)', () => {
    render(<MainLayout>내용</MainLayout>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('showBottomNav이 false면 하단 네비게이션을 숨긴다', () => {
    render(<MainLayout showBottomNav={false}>내용</MainLayout>);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('className prop이 전달되면 추가 스타일을 적용한다', () => {
    const { container } = render(
      <MainLayout className="custom-class">내용</MainLayout>
    );
    const layoutDiv = container.firstChild;
    expect(layoutDiv).toHaveClass('custom-class');
  });

  it('main 요소에 role="main"이 있다', () => {
    render(<MainLayout>내용</MainLayout>);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BottomNavigation from '../BottomNavigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('BottomNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('5개의 탭 버튼을 렌더링한다', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/map');
    render(<BottomNavigation />);

    expect(screen.getByLabelText('지도 검색 페이지로 이동')).toBeInTheDocument();
    expect(screen.getByLabelText('센터 목록 페이지로 이동')).toBeInTheDocument();
    expect(screen.getByLabelText('홈 페이지로 이동')).toBeInTheDocument();
    expect(screen.getByLabelText('추천 페이지로 이동')).toBeInTheDocument();
    expect(screen.getByLabelText('자가진단 페이지로 이동')).toBeInTheDocument();
  });

  it('현재 경로와 일치하는 탭에 aria-current="page"를 설정한다', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/map');
    render(<BottomNavigation />);

    const mapLink = screen.getByLabelText('지도 검색 페이지로 이동');
    expect(mapLink).toHaveAttribute('aria-current', 'page');

    const centersLink = screen.getByLabelText('센터 목록 페이지로 이동');
    expect(centersLink).not.toHaveAttribute('aria-current');
  });

  it('각 탭에 올바른 href가 설정되어 있다', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/map');
    render(<BottomNavigation />);

    expect(screen.getByLabelText('지도 검색 페이지로 이동')).toHaveAttribute('href', '/map');
    expect(screen.getByLabelText('센터 목록 페이지로 이동')).toHaveAttribute('href', '/centers');
    expect(screen.getByLabelText('홈 페이지로 이동')).toHaveAttribute('href', '/');
    expect(screen.getByLabelText('추천 페이지로 이동')).toHaveAttribute('href', '/recommendations');
    expect(screen.getByLabelText('자가진단 페이지로 이동')).toHaveAttribute('href', '/assessment');
  });

  it('탭 레이블이 올바르게 표시된다', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/map');
    render(<BottomNavigation />);

    expect(screen.getByText('지도 검색')).toBeInTheDocument();
    expect(screen.getByText('센터 목록')).toBeInTheDocument();
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('추천')).toBeInTheDocument();
    expect(screen.getByText('자가진단')).toBeInTheDocument();
  });

  it('nav 요소에 role="navigation"과 aria-label이 있다', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/map');
    render(<BottomNavigation />);

    const nav = screen.getByRole('navigation', { name: '주요 네비게이션' });
    expect(nav).toBeInTheDocument();
  });

  it('활성 탭은 lavender-500 색상 클래스를 가진다', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/centers');
    render(<BottomNavigation />);

    const centersLink = screen.getByLabelText('센터 목록 페이지로 이동');
    expect(centersLink).toHaveClass('text-lavender-500');
  });

  it('비활성 탭은 neutral-500 색상 클래스를 가진다', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/map');
    render(<BottomNavigation />);

    const centersLink = screen.getByLabelText('센터 목록 페이지로 이동');
    expect(centersLink).toHaveClass('text-neutral-500');
  });
});

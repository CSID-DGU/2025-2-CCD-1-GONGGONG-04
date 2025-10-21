import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CenterContactInfo,
  CenterContactInfoProps,
} from '../CenterContactInfo';

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock window.open
global.window.open = vi.fn();

// Mock window.location.href
delete (window as any).location;
(window as any).location = { href: '' };

describe('CenterContactInfo', () => {
  const defaultProps: CenterContactInfoProps = {
    phone: '02-1234-5678',
    roadAddress: '서울특별시 강남구 테헤란로 123',
    jibunAddress: '서울특별시 강남구 역삼동 456-78',
    latitude: 37.5012345,
    longitude: 127.0398765,
    distance: 1234,
    onCall: vi.fn(),
    onDirections: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (navigator.clipboard.writeText as any).mockClear();
    (window.open as any).mockClear();
    mockToast.mockClear();
  });

  describe('Rendering', () => {
    it('should render phone number correctly', () => {
      render(<CenterContactInfo {...defaultProps} />);
      expect(screen.getByText('02-1234-5678')).toBeInTheDocument();
    });

    it('should render road address correctly', () => {
      render(<CenterContactInfo {...defaultProps} />);
      expect(
        screen.getByText('서울특별시 강남구 테헤란로 123')
      ).toBeInTheDocument();
    });

    it('should render jibun address correctly', () => {
      render(<CenterContactInfo {...defaultProps} />);
      expect(
        screen.getByText(/서울특별시 강남구 역삼동 456-78/)
      ).toBeInTheDocument();
    });

    it('should display distance badge', () => {
      render(<CenterContactInfo {...defaultProps} distance={1234} />);
      expect(screen.getByText('1.2km')).toBeInTheDocument();
    });
  });

  describe('Null Value Handling', () => {
    it('should hide phone section when phone is null', () => {
      render(<CenterContactInfo {...defaultProps} phone={null} />);
      expect(screen.queryByText('전화번호')).not.toBeInTheDocument();
    });

    it('should hide jibun address when null', () => {
      render(<CenterContactInfo {...defaultProps} jibunAddress={null} />);
      expect(screen.queryByText(/지번/)).not.toBeInTheDocument();
    });

    it('should hide distance badge when undefined', () => {
      render(<CenterContactInfo {...defaultProps} distance={undefined} />);
      const badges = screen.queryAllByText(/km|m/);
      expect(badges.length).toBe(0);
    });

    it('should show only directions button when phone is null', () => {
      render(<CenterContactInfo {...defaultProps} phone={null} />);

      const callButtons = screen.queryAllByText('전화하기');
      expect(callButtons.length).toBe(0);

      const directionsButton = screen.getByRole('button', { name: '길찾기' });
      expect(directionsButton).toHaveClass('w-full');
    });
  });

  describe('Phone Formatting', () => {
    it('should display phone number with hyphens', () => {
      render(<CenterContactInfo {...defaultProps} />);
      expect(screen.getByText('02-1234-5678')).toBeInTheDocument();
    });

    it('should create tel link without hyphens', () => {
      render(<CenterContactInfo {...defaultProps} />);
      const phoneLink = screen.getByRole('link', {
        name: /02-1234-5678로 전화하기/,
      });
      expect(phoneLink).toHaveAttribute('href', 'tel:021234567');
    });
  });

  describe('Distance Formatting', () => {
    it('should format distance < 1000m as meters', () => {
      render(<CenterContactInfo {...defaultProps} distance={500} />);
      expect(screen.getByText('500m')).toBeInTheDocument();
    });

    it('should format distance 1000-9999m with 1 decimal km', () => {
      render(<CenterContactInfo {...defaultProps} distance={2345} />);
      expect(screen.getByText('2.3km')).toBeInTheDocument();
    });

    it('should format distance >= 10000m as rounded km', () => {
      render(<CenterContactInfo {...defaultProps} distance={15678} />);
      expect(screen.getByText('16km')).toBeInTheDocument();
    });

    it('should round meters correctly', () => {
      render(<CenterContactInfo {...defaultProps} distance={456} />);
      expect(screen.getByText('456m')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onCall when call button is clicked', () => {
      const onCall = vi.fn();
      render(<CenterContactInfo {...defaultProps} onCall={onCall} />);

      const callButton = screen.getAllByText('전화하기')[0];
      fireEvent.click(callButton);

      expect(onCall).toHaveBeenCalledTimes(1);
    });

    it('should call onDirections when directions button is clicked', () => {
      const onDirections = vi.fn();
      render(
        <CenterContactInfo {...defaultProps} onDirections={onDirections} />
      );

      const directionsButton = screen.getByRole('button', { name: '길찾기' });
      fireEvent.click(directionsButton);

      expect(onDirections).toHaveBeenCalledTimes(1);
    });

    it('should open phone dialer when call button clicked', () => {
      render(<CenterContactInfo {...defaultProps} />);

      const callButton = screen.getAllByRole('button', { name: '전화하기' })[0];
      fireEvent.click(callButton);

      expect(window.location.href).toBe('tel:0212345678');
    });

    it('should open Kakao Map when directions button clicked', () => {
      render(<CenterContactInfo {...defaultProps} />);

      const directionsButton = screen.getByRole('button', { name: '길찾기' });
      fireEvent.click(directionsButton);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://map.kakao.com/link/to/'),
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should work without onCall callback', () => {
      render(<CenterContactInfo {...defaultProps} onCall={undefined} />);

      const callButton = screen.getAllByText('전화하기')[0];
      expect(() => fireEvent.click(callButton)).not.toThrow();
    });

    it('should work without onDirections callback', () => {
      render(<CenterContactInfo {...defaultProps} onDirections={undefined} />);

      const directionsButton = screen.getByRole('button', { name: '길찾기' });
      expect(() => fireEvent.click(directionsButton)).not.toThrow();
    });
  });

  describe('Clipboard Functionality', () => {
    it('should copy road address to clipboard when clicked', async () => {
      render(<CenterContactInfo {...defaultProps} />);

      const addressButton = screen.getByRole('button', {
        name: '도로명 주소 복사하기',
      });
      fireEvent.click(addressButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          '서울특별시 강남구 테헤란로 123'
        );
      });
    });

    it('should show toast notification after successful copy', async () => {
      render(<CenterContactInfo {...defaultProps} />);

      const addressButton = screen.getByRole('button', {
        name: '도로명 주소 복사하기',
      });
      fireEvent.click(addressButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '주소가 복사되었습니다',
          description: '서울특별시 강남구 테헤란로 123',
          duration: 2000,
        });
      });
    });

    it('should show checkmark icon after copy', async () => {
      const { container } = render(<CenterContactInfo {...defaultProps} />);

      const addressButton = screen.getByRole('button', {
        name: '도로명 주소 복사하기',
      });
      fireEvent.click(addressButton);

      await waitFor(() => {
        const checkIcon = container.querySelector('.text-status-operating');
        expect(checkIcon).toBeInTheDocument();
      });
    });

    it('should revert to copy icon after 2 seconds', async () => {
      vi.useFakeTimers();
      const { container } = render(<CenterContactInfo {...defaultProps} />);

      const addressButton = screen.getByRole('button', {
        name: '도로명 주소 복사하기',
      });
      fireEvent.click(addressButton);

      await waitFor(() => {
        const checkIcon = container.querySelector('.text-status-operating');
        expect(checkIcon).toBeInTheDocument();
      });

      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        const copyIcon = container.querySelector('.text-neutral-400');
        expect(copyIcon).toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('should show error toast when copy fails', async () => {
      (navigator.clipboard.writeText as any).mockRejectedValueOnce(
        new Error('Copy failed')
      );

      render(<CenterContactInfo {...defaultProps} />);

      const addressButton = screen.getByRole('button', {
        name: '도로명 주소 복사하기',
      });
      fireEvent.click(addressButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '주소 복사 실패',
          description: '다시 시도해주세요',
          variant: 'destructive',
          duration: 2000,
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for buttons', () => {
      render(<CenterContactInfo {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: '전화하기' })
      ).toHaveAttribute('aria-label', '전화하기');
      expect(screen.getByRole('button', { name: '길찾기' })).toHaveAttribute(
        'aria-label',
        '길찾기'
      );
    });

    it('should have aria-label for phone link', () => {
      render(<CenterContactInfo {...defaultProps} />);

      const phoneLink = screen.getByRole('link', {
        name: /02-1234-5678로 전화하기/,
      });
      expect(phoneLink).toHaveAttribute(
        'aria-label',
        '02-1234-5678로 전화하기'
      );
    });

    it('should have aria-hidden on decorative icons', () => {
      const { container } = render(<CenterContactInfo {...defaultProps} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have focus-visible styles on buttons', () => {
      render(<CenterContactInfo {...defaultProps} />);

      const callButton = screen.getAllByRole('button', { name: '전화하기' })[0];
      expect(callButton).toHaveClass('focus-ring');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CenterContactInfo {...defaultProps} />);

      const addressButton = screen.getByRole('button', {
        name: '도로명 주소 복사하기',
      });

      await user.tab();
      expect(document.activeElement?.getAttribute('href')).toBe(
        'tel:0212345678'
      );
    });
  });

  describe('Layout Variations', () => {
    it('should show both call and directions buttons when phone exists', () => {
      render(<CenterContactInfo {...defaultProps} />);

      const callButtons = screen.getAllByText('전화하기');
      const directionsButton = screen.getByRole('button', { name: '길찾기' });

      expect(callButtons.length).toBeGreaterThan(0);
      expect(directionsButton).toBeInTheDocument();
    });

    it('should show full-width directions button when phone is null', () => {
      render(<CenterContactInfo {...defaultProps} phone={null} />);

      const directionsButton = screen.getByRole('button', { name: '길찾기' });
      expect(directionsButton).toHaveClass('w-full');
    });

    it('should apply lavender variant to call button when phone exists', () => {
      render(<CenterContactInfo {...defaultProps} />);

      const callButton = screen.getAllByRole('button', {
        name: '전화하기',
      })[1]; // Get the bottom button
      expect(callButton.className).toContain('lavender');
    });

    it('should apply lavender variant to directions button when no phone', () => {
      render(<CenterContactInfo {...defaultProps} phone={null} />);

      const directionsButton = screen.getByRole('button', { name: '길찾기' });
      expect(directionsButton.className).toContain('lavender');
    });
  });
});

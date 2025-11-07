/**
 * EmergencyContactBanner Component Tests
 * Sprint 3 - Task 3.2.4
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmergencyContactBanner } from '../EmergencyContactBanner';
import type { EmergencyContactInfo } from '../EmergencyContactBanner';

const mockContactInfo: EmergencyContactInfo = {
  suicidePrevention: '1393',
  mentalHealthCrisis: '1577-0199',
  emergency: '119',
};

describe('EmergencyContactBanner', () => {
  describe('Conditional rendering', () => {
    it('renders when show is true', () => {
      render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      expect(screen.getByText('즉시 전문의 진료가 필요합니다')).toBeInTheDocument();
    });

    it('does not render when show is false', () => {
      render(<EmergencyContactBanner show={false} contactInfo={mockContactInfo} />);

      expect(screen.queryByText('즉시 전문의 진료가 필요합니다')).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    beforeEach(() => {
      render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);
    });

    it('renders warning message', () => {
      expect(screen.getByText('즉시 전문의 진료가 필요합니다')).toBeInTheDocument();
      expect(
        screen.getByText(/심각한 정신적 고통을 겪고 계신 것으로 보입니다/)
      ).toBeInTheDocument();
    });

    it('renders emergency contacts heading', () => {
      expect(screen.getByText('긴급 연락처')).toBeInTheDocument();
    });

    it('renders suicide prevention contact', () => {
      expect(screen.getByText('자살예방 상담전화')).toBeInTheDocument();
      expect(screen.getByText('1393')).toBeInTheDocument();
    });

    it('renders mental health crisis contact', () => {
      expect(screen.getByText('정신건강 위기상담전화')).toBeInTheDocument();
      expect(screen.getByText('1577-0199')).toBeInTheDocument();
    });

    it('renders emergency contact', () => {
      expect(screen.getByText('응급전화')).toBeInTheDocument();
      expect(screen.getByText('119')).toBeInTheDocument();
    });

    it('renders additional guidance', () => {
      expect(
        screen.getByText(/긴급한 상황에서는 주저하지 말고 위 번호로 전화하세요/)
      ).toBeInTheDocument();
    });
  });

  describe('Tel links', () => {
    it('has clickable tel link for suicide prevention', () => {
      render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const link = screen.getByRole('link', { name: /자살예방 상담전화 1393번으로 전화하기/i });
      expect(link).toHaveAttribute('href', 'tel:1393');
    });

    it('has clickable tel link for mental health crisis', () => {
      render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const link = screen.getByRole('link', {
        name: /정신건강 위기상담전화 1577-0199번으로 전화하기/i,
      });
      expect(link).toHaveAttribute('href', 'tel:15770199');
    });

    it('has clickable tel link for emergency', () => {
      render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const link = screen.getByRole('link', { name: /응급전화 119번으로 전화하기/i });
      expect(link).toHaveAttribute('href', 'tel:119');
    });

    it('removes hyphens from tel links', () => {
      const contactWithHyphens: EmergencyContactInfo = {
        suicidePrevention: '02-1234-5678',
        mentalHealthCrisis: '031-123-4567',
        emergency: '119',
      };

      render(<EmergencyContactBanner show={true} contactInfo={contactWithHyphens} />);

      const link1 = screen.getByRole('link', { name: /자살예방 상담전화/i });
      expect(link1).toHaveAttribute('href', 'tel:0212345678');

      const link2 = screen.getByRole('link', { name: /정신건강 위기상담전화/i });
      expect(link2).toHaveAttribute('href', 'tel:0311234567');
    });
  });

  describe('Accessibility', () => {
    it('has role="alert" for urgency', () => {
      const { container } = render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('has aria-live="assertive" for immediate announcement', () => {
      const { container } = render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const alert = container.querySelector('[aria-live="assertive"]');
      expect(alert).toBeInTheDocument();
    });

    it('all contact links have descriptive aria-labels', () => {
      render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      expect(
        screen.getByRole('link', { name: /자살예방 상담전화 1393번으로 전화하기/i })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('link', { name: /정신건강 위기상담전화 1577-0199번으로 전화하기/i })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('link', { name: /응급전화 119번으로 전화하기/i })
      ).toBeInTheDocument();
    });

    it('hides decorative icons from screen readers', () => {
      const { container } = render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });

    it('has keyboard-accessible links', () => {
      render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        link.focus();
        expect(document.activeElement).toBe(link);
      });
    });
  });

  describe('Styling', () => {
    it('has red background for urgency', () => {
      const { container } = render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const card = container.querySelector('.bg-red-50');
      expect(card).toBeInTheDocument();
    });

    it('has red border', () => {
      const { container } = render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const card = container.querySelector('.border-red-200');
      expect(card).toBeInTheDocument();
    });

    it('contact links have hover effect', () => {
      const { container } = render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveClass('hover:bg-red-50');
      });
    });

    it('has focus-visible ring for keyboard navigation', () => {
      const { container } = render(<EmergencyContactBanner show={true} contactInfo={mockContactInfo} />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveClass('focus-visible:ring-2');
        expect(link).toHaveClass('focus-visible:ring-lavender-500');
      });
    });
  });

  describe('Different contact info', () => {
    it('handles different phone number formats', () => {
      const customContact: EmergencyContactInfo = {
        suicidePrevention: '02-123-4567',
        mentalHealthCrisis: '1588-9999',
        emergency: '911',
      };

      render(<EmergencyContactBanner show={true} contactInfo={customContact} />);

      expect(screen.getByText('02-123-4567')).toBeInTheDocument();
      expect(screen.getByText('1588-9999')).toBeInTheDocument();
      expect(screen.getByText('911')).toBeInTheDocument();
    });
  });
});

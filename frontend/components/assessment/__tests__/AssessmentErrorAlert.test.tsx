/**
 * AssessmentErrorAlert Component Tests
 * 자가진단 에러 알림 컴포넌트 테스트
 *
 * Sprint 3 - Task 3.3.2
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { AssessmentErrorAlert, ErrorType } from '../AssessmentErrorAlert';

describe('AssessmentErrorAlert', () => {
  describe('렌더링', () => {
    it('should render network error correctly', () => {
      render(<AssessmentErrorAlert type="network" />);

      expect(screen.getByText('네트워크 연결 오류')).toBeInTheDocument();
      expect(screen.getByText('인터넷 연결이 불안정합니다.')).toBeInTheDocument();
      expect(screen.getByText('네트워크 연결을 확인하고 다시 시도해주세요.')).toBeInTheDocument();
    });

    it('should render server error correctly', () => {
      render(<AssessmentErrorAlert type="server" />);

      expect(screen.getByText('서버 오류')).toBeInTheDocument();
      expect(screen.getByText('일시적인 서버 오류가 발생했습니다.')).toBeInTheDocument();
    });

    it('should render not found error correctly', () => {
      render(<AssessmentErrorAlert type="not_found" />);

      expect(screen.getByText('진단 템플릿을 찾을 수 없습니다')).toBeInTheDocument();
      expect(screen.getByText('요청하신 자가진단 템플릿을 찾을 수 없습니다.')).toBeInTheDocument();
    });

    it('should render unauthorized error correctly', () => {
      render(<AssessmentErrorAlert type="unauthorized" />);

      expect(screen.getByText('로그인이 필요합니다')).toBeInTheDocument();
      expect(screen.getByText('진단 결과를 저장하려면 로그인이 필요합니다.')).toBeInTheDocument();
    });

    it('should render unknown error correctly', () => {
      render(<AssessmentErrorAlert type="unknown" />);

      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText('알 수 없는 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });

  describe('커스텀 메시지', () => {
    it('should render custom error message when provided', () => {
      const customMessage = '사용자 정의 에러 메시지입니다.';
      render(<AssessmentErrorAlert type="network" message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
      // Default message should not be rendered
      expect(screen.queryByText('인터넷 연결이 불안정합니다.')).not.toBeInTheDocument();
    });

    it('should still show solution text with custom message', () => {
      const customMessage = '사용자 정의 에러 메시지입니다.';
      render(<AssessmentErrorAlert type="network" message={customMessage} />);

      // Solution should still be shown
      expect(screen.getByText('네트워크 연결을 확인하고 다시 시도해주세요.')).toBeInTheDocument();
    });
  });

  describe('재시도 버튼', () => {
    it('should not show retry button by default', () => {
      render(<AssessmentErrorAlert type="network" />);

      expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
    });

    it('should show retry button when showRetry is true', () => {
      const onRetry = jest.fn();
      render(<AssessmentErrorAlert type="network" showRetry onRetry={onRetry} />);

      expect(screen.getByText('다시 시도')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const onRetry = jest.fn();
      render(<AssessmentErrorAlert type="network" showRetry onRetry={onRetry} />);

      const retryButton = screen.getByText('다시 시도');
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should not render retry button when showRetry is false', () => {
      const onRetry = jest.fn();
      render(<AssessmentErrorAlert type="network" showRetry={false} onRetry={onRetry} />);

      expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
    });
  });

  describe('로그인 버튼', () => {
    it('should not show login button by default', () => {
      render(<AssessmentErrorAlert type="unauthorized" />);

      expect(screen.queryByText('로그인하기')).not.toBeInTheDocument();
    });

    it('should show login button when showLogin is true', () => {
      const onLogin = jest.fn();
      render(<AssessmentErrorAlert type="unauthorized" showLogin onLogin={onLogin} />);

      expect(screen.getByText('로그인하기')).toBeInTheDocument();
    });

    it('should call onLogin when login button is clicked', () => {
      const onLogin = jest.fn();
      render(<AssessmentErrorAlert type="unauthorized" showLogin onLogin={onLogin} />);

      const loginButton = screen.getByText('로그인하기');
      fireEvent.click(loginButton);

      expect(onLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('아이콘', () => {
    it('should render appropriate icon for each error type', () => {
      const errorTypes: ErrorType[] = ['network', 'server', 'not_found', 'unauthorized', 'unknown'];

      errorTypes.forEach((type) => {
        const { container } = render(<AssessmentErrorAlert type={type} />);

        // Each error type should have an icon (svg element)
        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('접근성', () => {
    it('should have proper Alert role', () => {
      const { container } = render(<AssessmentErrorAlert type="network" />);

      // Alert component should have proper ARIA role
      const alert = container.querySelector('[role="alert"]') || container.querySelector('.destructive');
      expect(alert).toBeInTheDocument();
    });

    it('should have aria-hidden on icon', () => {
      const { container } = render(<AssessmentErrorAlert type="network" />);

      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should have proper button types', () => {
      const onRetry = jest.fn();
      const onLogin = jest.fn();

      render(
        <AssessmentErrorAlert
          type="unauthorized"
          showRetry
          onRetry={onRetry}
          showLogin
          onLogin={onLogin}
        />
      );

      const retryButton = screen.getByText('다시 시도');
      const loginButton = screen.getByText('로그인하기');

      expect(retryButton).toHaveAttribute('type', 'button');
      expect(loginButton).toHaveAttribute('type', 'button');
    });
  });

  describe('레이아웃', () => {
    it('should have proper structure with icon and content', () => {
      const { container } = render(<AssessmentErrorAlert type="network" />);

      // Should have flex layout
      const flexContainer = container.querySelector('.flex.items-start.gap-3');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should show both retry and login buttons when both are enabled', () => {
      const onRetry = jest.fn();
      const onLogin = jest.fn();

      render(
        <AssessmentErrorAlert
          type="unauthorized"
          showRetry
          onRetry={onRetry}
          showLogin
          onLogin={onLogin}
        />
      );

      expect(screen.getByText('다시 시도')).toBeInTheDocument();
      expect(screen.getByText('로그인하기')).toBeInTheDocument();
    });
  });

  describe('스냅샷', () => {
    it('should match snapshot for network error', () => {
      const { container } = render(<AssessmentErrorAlert type="network" />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with retry button', () => {
      const { container } = render(
        <AssessmentErrorAlert type="server" showRetry onRetry={jest.fn()} />
      );
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with custom message', () => {
      const { container } = render(
        <AssessmentErrorAlert type="unknown" message="Custom error message" />
      );
      expect(container).toMatchSnapshot();
    });
  });
});

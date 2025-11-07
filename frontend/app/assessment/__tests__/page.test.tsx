/**
 * Assessment Page Integration Tests
 * Sprint 3 - Task 3.2.3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import AssessmentPage from '../page';
import * as assessmentHooks from '@/hooks/useAssessments';
import { useAssessmentStore } from '@/store/assessmentStore';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock assessment hooks
jest.mock('@/hooks/useAssessments');

describe('AssessmentPage Integration', () => {
  let queryClient: QueryClient;
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  // Mock template data
  const mockTemplate = {
    id: 1,
    templateCode: 'K10_V1',
    name: '정신건강 자가진단 (K-10)',
    description: '최근 한 달 동안의 정신건강 상태를 확인하는 자가진단입니다',
    questionCount: 3,
    estimatedTimeMinutes: 5,
    questionsJson: [
      {
        questionNumber: 1,
        questionText: '최근 한 달 동안 얼마나 자주 불안을 느꼈습니까?',
        options: [
          { optionNumber: 1, optionText: '전혀 없음', score: 0 },
          { optionNumber: 2, optionText: '가끔', score: 1 },
          { optionNumber: 3, optionText: '자주', score: 2 },
          { optionNumber: 4, optionText: '항상', score: 3 },
        ],
      },
      {
        questionNumber: 2,
        questionText: '최근 한 달 동안 얼마나 자주 우울함을 느꼈습니까?',
        options: [
          { optionNumber: 1, optionText: '전혀 없음', score: 0 },
          { optionNumber: 2, optionText: '가끔', score: 1 },
          { optionNumber: 3, optionText: '자주', score: 2 },
          { optionNumber: 4, optionText: '항상', score: 3 },
        ],
      },
      {
        questionNumber: 3,
        questionText: '최근 한 달 동안 얼마나 자주 스트레스를 느꼈습니까?',
        options: [
          { optionNumber: 1, optionText: '전혀 없음', score: 0 },
          { optionNumber: 2, optionText: '가끔', score: 1 },
          { optionNumber: 3, optionText: '자주', score: 2 },
          { optionNumber: 4, optionText: '항상', score: 3 },
        ],
      },
    ],
    scoringRulesJson: {
      LOW: { min: 0, max: 3, description: '낮음' },
      MID: { min: 4, max: 6, description: '중등도' },
      HIGH: { min: 7, max: 12, description: '높음' },
    },
    interpretationsJson: {
      LOW: {
        title: '정상 범위',
        description: '현재 정신건강 상태가 양호합니다.',
        recommendations: [],
        urgency: 'low' as const,
      },
      MID: {
        title: '주의 필요',
        description: '전문가 상담을 권장합니다.',
        recommendations: [],
        urgency: 'moderate' as const,
      },
      HIGH: {
        title: '위험',
        description: '즉시 전문가 상담이 필요합니다.',
        recommendations: [],
        urgency: 'high' as const,
      },
    },
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Reset store
    useAssessmentStore.getState().resetAssessment();

    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  describe('Page Loading', () => {
    it('shows loading skeleton when fetching template', () => {
      (assessmentHooks.useTemplate as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      (assessmentHooks.useSubmitAssessment as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
        isError: false,
      });

      renderWithProviders(<AssessmentPage />);

      // Should show skeleton elements
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows error message when template fetch fails', () => {
      (assessmentHooks.useTemplate as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load template'),
      });

      (assessmentHooks.useSubmitAssessment as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
        isError: false,
      });

      renderWithProviders(<AssessmentPage />);

      expect(
        screen.getByText(/자가진단 템플릿을 불러오는데 실패했습니다/i)
      ).toBeInTheDocument();
    });

    it('renders assessment page when template loads successfully', () => {
      (assessmentHooks.useTemplate as jest.Mock).mockReturnValue({
        data: mockTemplate,
        isLoading: false,
        isError: false,
      });

      (assessmentHooks.useSubmitAssessment as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
        isError: false,
      });

      renderWithProviders(<AssessmentPage />);

      // Should show template name
      expect(screen.getByText(mockTemplate.name)).toBeInTheDocument();

      // Should show first question
      expect(screen.getByText(mockTemplate.questionsJson[0].questionText)).toBeInTheDocument();
    });
  });

  describe('Question Navigation', () => {
    beforeEach(() => {
      (assessmentHooks.useTemplate as jest.Mock).mockReturnValue({
        data: mockTemplate,
        isLoading: false,
        isError: false,
      });

      (assessmentHooks.useSubmitAssessment as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
        isError: false,
      });
    });

    it('disables previous button on first question', () => {
      renderWithProviders(<AssessmentPage />);

      const prevButton = screen.getByRole('button', { name: /이전/i });
      expect(prevButton).toBeDisabled();
    });

    it('disables next button when no answer selected', () => {
      renderWithProviders(<AssessmentPage />);

      const nextButton = screen.getByRole('button', { name: /다음/i });
      expect(nextButton).toBeDisabled();
    });

    it('enables next button after selecting an answer', () => {
      renderWithProviders(<AssessmentPage />);

      // Select first option
      const option1 = screen.getByLabelText('전혀 없음');
      fireEvent.click(option1);

      // Next button should be enabled
      const nextButton = screen.getByRole('button', { name: /다음/i });
      expect(nextButton).not.toBeDisabled();
    });

    it('navigates to next question when next button clicked', () => {
      renderWithProviders(<AssessmentPage />);

      // Select an answer
      const option1 = screen.getByLabelText('전혀 없음');
      fireEvent.click(option1);

      // Click next
      const nextButton = screen.getByRole('button', { name: /다음/i });
      fireEvent.click(nextButton);

      // Should show second question
      expect(screen.getByText(mockTemplate.questionsJson[1].questionText)).toBeInTheDocument();
    });

    it('navigates back to previous question', () => {
      renderWithProviders(<AssessmentPage />);

      // Answer first question and go to second
      fireEvent.click(screen.getByLabelText('전혀 없음'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      // Answer second question and go to third
      fireEvent.click(screen.getByLabelText('가끔'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      // Now on third question
      expect(screen.getByText(mockTemplate.questionsJson[2].questionText)).toBeInTheDocument();

      // Click previous
      const prevButton = screen.getByRole('button', { name: /이전/i });
      fireEvent.click(prevButton);

      // Should show second question again
      expect(screen.getByText(mockTemplate.questionsJson[1].questionText)).toBeInTheDocument();
    });

    it('shows submit button on last question', () => {
      renderWithProviders(<AssessmentPage />);

      // Navigate to last question
      fireEvent.click(screen.getByLabelText('전혀 없음'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      fireEvent.click(screen.getByLabelText('가끔'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      // Should show submit button, not next button
      expect(screen.getByRole('button', { name: /제출/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /다음/i })).not.toBeInTheDocument();
    });
  });

  describe('Assessment Submission', () => {
    const mockSubmit = jest.fn();

    beforeEach(() => {
      (assessmentHooks.useTemplate as jest.Mock).mockReturnValue({
        data: mockTemplate,
        isLoading: false,
        isError: false,
      });

      mockSubmit.mockResolvedValue({
        assessmentId: 123,
        totalScore: 3,
        severityCode: 'LOW',
        interpretation: mockTemplate.interpretationsJson.LOW,
        completedAt: '2025-01-15T09:30:00Z',
      });

      (assessmentHooks.useSubmitAssessment as jest.Mock).mockReturnValue({
        mutateAsync: mockSubmit,
        isPending: false,
        isError: false,
      });
    });

    it('submits assessment with all answers', async () => {
      renderWithProviders(<AssessmentPage />);

      // Answer all questions
      fireEvent.click(screen.getByLabelText('전혀 없음'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      fireEvent.click(screen.getByLabelText('가끔'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      fireEvent.click(screen.getByLabelText('자주'));

      // Submit
      const submitButton = screen.getByRole('button', { name: /제출/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          templateId: 1,
          answers: [
            { questionNumber: 1, selectedOption: 1 },
            { questionNumber: 2, selectedOption: 2 },
            { questionNumber: 3, selectedOption: 3 },
          ],
        });
      });
    });

    it('redirects to result page after successful submission', async () => {
      renderWithProviders(<AssessmentPage />);

      // Answer all questions
      fireEvent.click(screen.getByLabelText('전혀 없음'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      fireEvent.click(screen.getByLabelText('가끔'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      fireEvent.click(screen.getByLabelText('자주'));

      // Submit
      const submitButton = screen.getByRole('button', { name: /제출/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/assessment/result/123');
      });
    });

    it('shows error message when submission fails', async () => {
      mockSubmit.mockRejectedValueOnce(new Error('Submission failed'));

      renderWithProviders(<AssessmentPage />);

      // Answer all questions
      fireEvent.click(screen.getByLabelText('전혀 없음'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      fireEvent.click(screen.getByLabelText('가끔'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      fireEvent.click(screen.getByLabelText('자주'));

      // Submit
      const submitButton = screen.getByRole('button', { name: /제출/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/진단 결과 제출에 실패했습니다/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Progress Tracking', () => {
    beforeEach(() => {
      (assessmentHooks.useTemplate as jest.Mock).mockReturnValue({
        data: mockTemplate,
        isLoading: false,
        isError: false,
      });

      (assessmentHooks.useSubmitAssessment as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
        isPending: false,
        isError: false,
      });
    });

    it('shows correct progress on first question', () => {
      renderWithProviders(<AssessmentPage />);

      expect(screen.getByText('질문 1/3')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument(); // No answers yet
    });

    it('updates progress after answering questions', () => {
      renderWithProviders(<AssessmentPage />);

      // Answer first question
      fireEvent.click(screen.getByLabelText('전혀 없음'));

      // Progress should update (1 answer out of 3 = 33%)
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('shows 100% progress after answering all questions', () => {
      renderWithProviders(<AssessmentPage />);

      // Answer all three questions
      fireEvent.click(screen.getByLabelText('전혀 없음'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      fireEvent.click(screen.getByLabelText('가끔'));
      fireEvent.click(screen.getByRole('button', { name: /다음/i }));

      fireEvent.click(screen.getByLabelText('자주'));

      // Should show 100%
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });
});

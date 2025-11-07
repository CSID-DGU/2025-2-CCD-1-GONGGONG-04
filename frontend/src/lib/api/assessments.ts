/**
 * Assessment API Client
 * 자가진단 관련 API 호출
 *
 * Sprint 3 - Task 3.2.4
 */

import apiClient from './client';

// ============================================
// 타입 정의
// ============================================

/**
 * 답변 인터페이스
 */
export interface Answer {
  questionNumber: number;
  selectedOption: number;
}

/**
 * 진단 템플릿 질문
 */
export interface AssessmentQuestion {
  id: number;
  questionNumber: number;
  questionText: string;
  options: {
    value: number;
    label: string;
  }[];
}

/**
 * 진단 템플릿
 */
export interface AssessmentTemplate {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  estimatedMinutes: number;
  questions: AssessmentQuestion[];
  isActive: boolean;
}

/**
 * 심각도 코드
 */
export type SeverityCode = 'LOW' | 'MID' | 'HIGH';

/**
 * 해석 정보
 */
export interface Interpretation {
  title: string;
  description: string;
  recommendations: string[];
  urgency: 'low' | 'moderate' | 'high';
  contactInfo?: {
    suicidePrevention: string;
    mentalHealthCrisis: string;
    emergency: string;
  };
}

/**
 * 진단 결과
 */
export interface AssessmentResult {
  id: number;
  userId: number;
  templateId: number;
  totalScore: number;
  maxScore: number;
  severityCode: SeverityCode;
  interpretation: Interpretation;
  completedAt: string;
  answers: Answer[];
}

/**
 * 진단 제출 요청
 */
export interface SubmitAssessmentRequest {
  templateId: number;
  answers: Answer[];
}

/**
 * 진단 제출 응답
 */
export interface SubmitAssessmentResponse {
  assessmentId: number;
  totalScore: number;
  severityCode: SeverityCode;
  message: string;
  createdAt: string;
}

// ============================================
// API 클라이언트
// ============================================

/**
 * 활성화된 진단 템플릿 목록 조회
 */
export async function getActiveTemplates(): Promise<AssessmentTemplate[]> {
  const response = await apiClient.get<AssessmentTemplate[]>('/assessments/templates');
  return response.data;
}

/**
 * 특정 진단 템플릿 상세 조회
 */
export async function getTemplateById(templateId: number): Promise<AssessmentTemplate> {
  const response = await apiClient.get<AssessmentTemplate>(
    `/assessments/templates/${templateId}`
  );
  return response.data;
}

/**
 * 자가진단 제출
 */
export async function submitAssessment(
  data: SubmitAssessmentRequest
): Promise<SubmitAssessmentResponse> {
  const response = await apiClient.post<SubmitAssessmentResponse>('/assessments', data);
  return response.data;
}

/**
 * 진단 결과 조회
 */
export async function getAssessmentResult(assessmentId: number): Promise<AssessmentResult> {
  const response = await apiClient.get<AssessmentResult>(`/assessments/${assessmentId}/result`);
  return response.data;
}

/**
 * 사용자 진단 이력 조회
 */
export async function getMyAssessments(): Promise<AssessmentResult[]> {
  const response = await apiClient.get<AssessmentResult[]>('/assessments/my');
  return response.data;
}

/**
 * 진단 기반 추천 센터 조회
 */
export async function getRecommendationsByAssessment(
  assessmentId: number,
  userLocation: { lat: number; lng: number }
): Promise<any> {
  const response = await apiClient.get(`/assessments/${assessmentId}/recommendations`, {
    params: {
      lat: userLocation.lat,
      lng: userLocation.lng,
    },
  });
  return response.data;
}

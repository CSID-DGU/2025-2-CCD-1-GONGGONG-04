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
    optionNumber: number;
    optionText: string;
    score: number;
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
 * 긴급도 수준
 */
export type UrgencyLevel = 'low' | 'moderate' | 'high';

/**
 * 해석 정보
 */
export interface Interpretation {
  title: string;
  description: string;
  recommendations: string[];
  urgency: UrgencyLevel;
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
  assessmentId?: number; // id의 alias (호환성)
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
 * 진단 제출 응답 (Backend 실제 응답)
 */
export interface SubmitAssessmentResponse {
  assessmentId: number;
  totalScore: number;
  severityCode: SeverityCode;
  interpretation: Interpretation;
  completedAt: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * 백엔드 템플릿 응답을 프론트엔드 형식으로 변환
 * - questionsJson → questions
 * - name → title
 */
function transformTemplateData(data: any): AssessmentTemplate {
  if (!data || typeof data !== 'object') return data;

  // questionsJson을 questions로 변환
  if ('questionsJson' in data) {
    data.questions = data.questionsJson;
    delete data.questionsJson;
  }

  // name을 title로 변환
  if ('name' in data && !('title' in data)) {
    data.title = data.name;
  }

  return data as AssessmentTemplate;
}

// ============================================
// API 클라이언트
// ============================================

/**
 * 활성화된 진단 템플릿 목록 조회
 */
export async function getActiveTemplates(): Promise<AssessmentTemplate[]> {
  const response = await apiClient.get<any[]>('/assessments/templates');

  // 백엔드 응답을 프론트엔드 형식으로 변환
  if (Array.isArray(response.data)) {
    return response.data.map(transformTemplateData);
  }

  return response.data;
}

/**
 * 특정 진단 템플릿 상세 조회
 */
export async function getTemplateById(templateId: number): Promise<AssessmentTemplate> {
  const response = await apiClient.get<any>(
    `/assessments/templates/${templateId}`
  );

  // 백엔드 응답을 프론트엔드 형식으로 변환
  return transformTemplateData(response.data);
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

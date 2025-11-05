/**
 * User Profile Types
 *
 * 사용자 프로필 및 매칭 관련 타입 정의
 * Sprint 2 - Task 3.4.1: User Profile Matching Logic
 *
 * @module types/userProfile
 * @created 2025-01-27
 */

/**
 * 사용자 프로필 인터페이스
 *
 * 추천 시스템에서 사용자 특성을 나타내는 데이터 구조
 */
export interface UserProfile {
  /**
   * 사용자가 경험하는 증상 목록
   *
   * @example ['우울감', '불안', '스트레스', '불면증']
   */
  symptoms?: string[];

  /**
   * 선호하는 프로그램 카테고리
   *
   * @example '개인상담', '집단상담', '심리검사', '정신건강교육'
   */
  preferredCategory?: string;

  /**
   * 사용자 연령대
   *
   * @example '20대', '30대', '40대', '50대', '60대 이상'
   */
  ageGroup?: string;

  /**
   * 온라인 상담 선호 여부
   *
   * @example true (온라인 상담 선호), false (대면 상담 선호)
   */
  preferOnline?: boolean;

  /**
   * 비용 민감도 (무료 프로그램 선호 여부)
   *
   * @example true (무료 프로그램 선호), false (유료 가능)
   */
  preferFree?: boolean;
}

/**
 * 프로그램 매칭 결과 인터페이스
 */
export interface ProgramMatchResult {
  /**
   * 프로그램 ID
   */
  programId: bigint;

  /**
   * 프로그램명
   */
  programName: string;

  /**
   * 매칭 점수 (0-100)
   */
  matchScore: number;

  /**
   * 매칭 이유 (디버깅 및 설명용)
   */
  matchReasons: string[];
}

/**
 * 프로그램 카테고리 목록
 *
 * 정신건강 서비스에서 제공하는 주요 프로그램 유형
 */
export const PROGRAM_CATEGORIES = [
  '개인상담',
  '집단상담',
  '심리검사',
  '정신건강교육',
  '인지행동치료',
  '미술치료',
  '음악치료',
  '가족상담',
  '청소년상담',
  '직장인상담',
] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];

/**
 * 연령대 목록
 */
export const AGE_GROUPS = [
  '아동', // 0-12세
  '청소년', // 13-19세
  '20대',
  '30대',
  '40대',
  '50대',
  '60대 이상',
  '성인', // 일반 성인 (연령대 무관)
] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];

/**
 * 증상 카테고리 목록
 *
 * 정신건강 관련 주요 증상들
 */
export const SYMPTOM_CATEGORIES = [
  '우울감',
  '불안',
  '스트레스',
  '불면증',
  '공황장애',
  '강박증',
  '외상후스트레스',
  '대인관계',
  '가족갈등',
  '직장스트레스',
  '학업스트레스',
  '중독',
  '자살사고',
  '자해',
  '폭력',
] as const;

export type SymptomCategory = (typeof SYMPTOM_CATEGORIES)[number];

/**
 * 프로그램 정보 인터페이스 (스코어링용)
 */
export interface ProgramInfo {
  /** 프로그램 ID */
  id: bigint;

  /** 센터 ID */
  centerId: bigint;

  /** 프로그램명 */
  programName: string;

  /** 프로그램 유형 */
  programType: string | null;

  /** 대상 그룹 */
  targetGroup: string | null;

  /** 프로그램 설명 */
  description: string | null;

  /** 온라인 제공 여부 */
  isOnlineAvailable: boolean;

  /** 무료 여부 */
  isFree: boolean;

  /** 비용 (유료일 경우) */
  feeAmount: number | null;

  /** 활성 여부 */
  isActive: boolean;
}

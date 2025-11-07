/**
 * AssessmentHeader Component
 * 자가진단 헤더
 *
 * Sprint 3 - Task 3.2.3
 *
 * @description
 * 자가진단 페이지 상단에 표시되는 헤더 컴포넌트
 * - 템플릿 이름 표시 (H1 타이포그래피)
 * - 설명 표시
 * - 예상 소요 시간 표시 (시계 아이콘 포함)
 */

import React from 'react';
import { Clock } from 'lucide-react';

// ============================================
// Props 인터페이스
// ============================================

export interface AssessmentHeaderProps {
  /** 템플릿 이름 */
  templateName: string;

  /** 템플릿 설명 */
  description: string;

  /** 예상 소요 시간 (분) */
  estimatedMinutes?: number;
}

// ============================================
// AssessmentHeader Component
// ============================================

/**
 * 자가진단 헤더 컴포넌트
 *
 * @example
 * ```tsx
 * <AssessmentHeader
 *   templateName="정신건강 자가진단 (K-10)"
 *   description="최근 한 달 동안의 정신건강 상태를 확인하는 자가진단입니다"
 *   estimatedMinutes={5}
 * />
 * ```
 */
export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  templateName,
  description,
  estimatedMinutes,
}) => {
  return (
    <header className="mb-8">
      {/* 템플릿 이름 - H1 타이포그래피 */}
      <h1 className="text-h1 text-gray-900 mb-3">{templateName}</h1>

      {/* 설명 - Body 타이포그래피 */}
      <p className="text-body text-gray-600 mb-4">{description}</p>

      {/* 예상 소요 시간 (있을 경우) */}
      {estimatedMinutes && (
        <div className="flex items-center gap-2 text-small text-gray-500">
          <Clock className="h-4 w-4" aria-hidden="true" />
          <span>예상 소요 시간: 약 {estimatedMinutes}분</span>
        </div>
      )}
    </header>
  );
};

AssessmentHeader.displayName = 'AssessmentHeader';

export default AssessmentHeader;

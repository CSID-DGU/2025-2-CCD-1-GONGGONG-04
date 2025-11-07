/**
 * QuestionCard Component
 * 질문 카드 컴포넌트
 *
 * Sprint 3 - Task 3.2.3
 *
 * @description
 * 자가진단 질문을 표시하고 옵션 선택을 받는 컴포넌트
 * - shadcn Card 사용
 * - RadioGroup으로 옵션 선택
 * - 선택된 옵션 하이라이트 (lavender-50 배경)
 * - ARIA 접근성 지원
 * - 터치 친화적 디자인 (min-height 44px)
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// ============================================
// Props 인터페이스
// ============================================

/** 질문 옵션 */
export interface QuestionOption {
  /** 옵션 번호 */
  optionNumber: number;

  /** 옵션 텍스트 */
  optionText: string;

  /** 점수 (UI에서는 숨김) */
  score: number;
}

export interface QuestionCardProps {
  /** 질문 번호 */
  questionNumber: number;

  /** 질문 텍스트 */
  questionText: string;

  /** 옵션 목록 */
  options: QuestionOption[];

  /** 선택된 옵션 번호 */
  selectedOption?: number;

  /** 옵션 선택 핸들러 */
  onSelectOption: (optionNumber: number) => void;
}

// ============================================
// QuestionCard Component
// ============================================

/**
 * 질문 카드 컴포넌트
 *
 * @example
 * ```tsx
 * <QuestionCard
 *   questionNumber={1}
 *   questionText="최근 한 달 동안 얼마나 자주 불안을 느꼈습니까?"
 *   options={[
 *     { optionNumber: 1, optionText: "전혀 없음", score: 0 },
 *     { optionNumber: 2, optionText: "가끔", score: 1 },
 *     { optionNumber: 3, optionText: "자주", score: 2 },
 *     { optionNumber: 4, optionText: "항상", score: 3 }
 *   ]}
 *   selectedOption={2}
 *   onSelectOption={(option) => console.log(option)}
 * />
 * ```
 */
export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionNumber,
  questionText,
  options,
  selectedOption,
  onSelectOption,
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        {/* 질문 번호 배지 */}
        <div
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-lavender-100 text-lavender-600 font-semibold text-sm mb-3"
          aria-hidden="true"
        >
          {questionNumber}
        </div>

        {/* 질문 텍스트 - H2 타이포그래피 */}
        <h2
          className="text-h2 text-gray-900 leading-relaxed"
          id={`question-${questionNumber}-heading`}
        >
          {questionText}
        </h2>
      </CardHeader>

      <CardContent>
        {/* 옵션 선택 - RadioGroup */}
        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={(value) => onSelectOption(parseInt(value, 10))}
          aria-labelledby={`question-${questionNumber}-heading`}
          aria-required="true"
        >
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = selectedOption === option.optionNumber;

              return (
                <div
                  key={option.optionNumber}
                  className={`
                    flex items-center space-x-3 p-4 rounded-lg border-2 transition-all
                    cursor-pointer min-h-[44px]
                    ${
                      isSelected
                        ? 'bg-lavender-50 border-lavender-500'
                        : 'bg-white border-gray-200 hover:border-lavender-300'
                    }
                  `}
                >
                  <RadioGroupItem
                    value={option.optionNumber.toString()}
                    id={`question-${questionNumber}-option-${option.optionNumber}`}
                    aria-label={option.optionText}
                  />
                  <Label
                    htmlFor={`question-${questionNumber}-option-${option.optionNumber}`}
                    className="flex-1 cursor-pointer text-body text-gray-900"
                  >
                    {option.optionText}
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

QuestionCard.displayName = 'QuestionCard';

export default QuestionCard;

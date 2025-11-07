/**
 * ScoreSection Component
 * 진단 총점 및 심각도 표시
 *
 * Sprint 3 - Task 3.2.4
 *
 * @example
 * ```tsx
 * <ScoreSection
 *   totalScore={25}
 *   severityCode="MID"
 *   maxScore={40}
 * />
 * ```
 */

'use client';

import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SeverityCode } from '@/lib/api/assessments';

// ============================================
// 타입 정의
// ============================================

export interface ScoreSectionProps {
  /** 총 점수 */
  totalScore: number;
  /** 심각도 코드 */
  severityCode: SeverityCode;
  /** 최대 점수 (기본: 40 for K-10) */
  maxScore?: number;
}

// ============================================
// 심각도별 설정
// ============================================

const SEVERITY_CONFIG = {
  LOW: {
    label: '정상 범위',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: CheckCircle,
    description: '정신건강이 비교적 양호한 상태입니다',
  },
  MID: {
    label: '중간 정도 고통',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: AlertCircle,
    description: '전문가 상담을 고려해보세요',
  },
  HIGH: {
    label: '심각한 고통',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: AlertTriangle,
    description: '즉시 전문가의 도움이 필요합니다',
  },
} as const;

// ============================================
// 컴포넌트
// ============================================

export function ScoreSection({ totalScore, severityCode, maxScore = 40 }: ScoreSectionProps) {
  const config = SEVERITY_CONFIG[severityCode];
  const Icon = config.icon;
  const progressPercent = Math.round((totalScore / maxScore) * 100);

  return (
    <Card className="border-2">
      <CardContent className="pt-6 pb-6 space-y-6">
        {/* 심각도 배지 */}
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className={`${config.color} text-white px-6 py-2 text-base font-semibold flex items-center gap-2`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span>{config.label}</span>
          </Badge>
        </div>

        {/* 점수 표시 */}
        <div className="text-center space-y-2">
          <div className="space-y-1">
            <p className="text-small text-neutral-600">진단 결과</p>
            <p className="text-h1 font-bold text-neutral-900" aria-label={`총점 ${totalScore}점`}>
              {totalScore}
              <span className="text-h3 text-neutral-500 font-normal ml-2">/ {maxScore}점</span>
            </p>
          </div>

          {/* 진행 바 */}
          <div className="space-y-2 px-4">
            <Progress
              value={progressPercent}
              className="h-3"
              aria-label={`진단 점수 ${progressPercent}%`}
            />
            <p className="text-caption text-neutral-500">{progressPercent}%</p>
          </div>
        </div>

        {/* 설명 */}
        <div
          className={`${config.bgColor} ${config.textColor} rounded-lg p-4 text-center`}
          role="status"
          aria-live="polite"
        >
          <p className="text-body font-medium">{config.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

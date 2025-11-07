/**
 * InterpretationSection Component
 * 진단 결과 해석 및 권장사항 표시
 *
 * Sprint 3 - Task 3.2.4
 *
 * @example
 * ```tsx
 * <InterpretationSection
 *   interpretation={{
 *     title: '중등도 우울 증상',
 *     description: '최근 2주간 우울감과 스트레스가...',
 *     recommendations: ['전문가 상담', '규칙적인 운동', '충분한 수면'],
 *     urgency: 'moderate'
 *   }}
 * />
 * ```
 */

'use client';

import { Info, AlertCircle, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Interpretation } from '@/lib/api/assessments';

// ============================================
// 타입 정의
// ============================================

export interface InterpretationSectionProps {
  /** 해석 정보 */
  interpretation: Interpretation;
}

// ============================================
// 긴급도별 아이콘
// ============================================

const URGENCY_ICONS = {
  low: Info,
  moderate: AlertCircle,
  high: AlertTriangle,
} as const;

const URGENCY_COLORS = {
  low: 'text-blue-600',
  moderate: 'text-yellow-600',
  high: 'text-red-600',
} as const;

// ============================================
// 컴포넌트
// ============================================

export function InterpretationSection({ interpretation }: InterpretationSectionProps) {
  const Icon = URGENCY_ICONS[interpretation.urgency];
  const iconColor = URGENCY_COLORS[interpretation.urgency];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h2 flex items-center gap-2">
          <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
          <span>결과 해석</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 제목 */}
        <div>
          <h3 className="text-h3 font-semibold text-neutral-900">{interpretation.title}</h3>
        </div>

        {/* 설명 */}
        <div>
          <p className="text-body text-neutral-700 leading-relaxed">{interpretation.description}</p>
        </div>

        {/* 권장사항 */}
        {interpretation.recommendations && interpretation.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-body font-semibold text-neutral-900">권장사항</h4>
            <ul className="space-y-2" role="list">
              {interpretation.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-body text-neutral-700">
                  <span className="text-lavender-500 mt-1" aria-hidden="true">
                    •
                  </span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * RecommendationCTA Component
 * 진단 결과 기반 센터 추천 CTA
 *
 * Sprint 3 - Task 3.2.4
 *
 * @example
 * ```tsx
 * <RecommendationCTA
 *   assessmentId={123}
 *   severityCode="MID"
 * />
 * ```
 */

'use client';

import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { SeverityCode } from '@/lib/api/assessments';

// ============================================
// 타입 정의
// ============================================

export interface RecommendationCTAProps {
  /** 진단 ID */
  assessmentId: number;
  /** 심각도 코드 */
  severityCode: SeverityCode;
}

// ============================================
// 컴포넌트
// ============================================

export function RecommendationCTA({ assessmentId, severityCode }: RecommendationCTAProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/recommendations/from-assessment/${assessmentId}`);
  };

  return (
    <Card className="bg-gradient-to-r from-lavender-400 to-lavender-600 border-0">
      <CardContent className="pt-6 pb-6">
        <div className="space-y-4 text-center text-white">
          {/* 아이콘 */}
          <div className="flex justify-center">
            <div className="bg-white/20 rounded-full p-3">
              <MapPin className="h-8 w-8" aria-hidden="true" />
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <h3 className="text-h2 font-bold">나에게 맞는 센터 추천받기</h3>
            <p className="text-body opacity-90">
              진단 결과를 바탕으로 가장 적합한 정신건강복지센터를 추천해드립니다
            </p>
          </div>

          {/* CTA 버튼 */}
          <Button
            size="lg"
            onClick={handleClick}
            className="bg-white text-lavender-600 hover:bg-neutral-100 font-semibold shadow-lg w-full sm:w-auto px-8"
            aria-label="나에게 맞는 센터 추천 페이지로 이동"
          >
            <span>추천 받기</span>
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

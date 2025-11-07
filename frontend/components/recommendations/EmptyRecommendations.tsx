/**
 * EmptyRecommendations Component
 *
 * Sprint 3 - Task 3.5.1: 진단 기반 추천 페이지
 *
 * 추천 결과가 없을 때 표시되는 컴포넌트
 * - 아이콘 및 메시지 표시
 * - 위치 변경 또는 검색 반경 조정 안내
 */

'use client';

import React from 'react';
import { MapPinOff, Navigation, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface EmptyRecommendationsProps {
  /** 위치 변경 핸들러 */
  onChangeLocation?: () => void;

  /** 커스텀 메시지 (선택사항) */
  message?: string;

  /** 커스텀 설명 (선택사항) */
  description?: string;
}

export function EmptyRecommendations({
  onChangeLocation,
  message = '근처에 추천할 센터를 찾지 못했습니다',
  description = '다른 위치를 시도하시거나, 검색 반경을 넓혀보세요',
}: EmptyRecommendationsProps) {
  return (
    <Card className="rounded-card shadow-soft border-neutral-200">
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
          {/* 아이콘 */}
          <div className="relative">
            <div className="absolute inset-0 bg-lavender-100 rounded-full blur-xl opacity-50" />
            <div className="relative w-20 h-20 bg-lavender-50 rounded-full flex items-center justify-center">
              <MapPinOff className="h-10 w-10 text-lavender-600" />
            </div>
          </div>

          {/* 메시지 */}
          <div className="space-y-2">
            <h3 className="text-h3 font-bold text-neutral-900">
              {message}
            </h3>
            <p className="text-body text-neutral-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {onChangeLocation && (
              <Button
                variant="lavender"
                size="default"
                onClick={onChangeLocation}
                className="min-w-[160px]"
              >
                <Navigation className="h-4 w-4 mr-2" />
                위치 변경하기
              </Button>
            )}

            <Button
              variant="outline"
              size="default"
              onClick={() => window.location.reload()}
              className="min-w-[160px]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          </div>

          {/* 추가 안내 */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200 w-full">
            <p className="text-body-sm text-neutral-600 leading-relaxed">
              <span className="font-semibold text-neutral-900">💡 도움말:</span>
              <br />
              • 위치를 변경하여 다른 지역을 검색해보세요
              <br />
              • 검색 반경을 넓혀서 더 많은 센터를 찾아보세요
              <br />
              • 도시 중심부나 주요 구 지역을 검색해보세요
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

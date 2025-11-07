/**
 * EmptyHistory Component
 *
 * Sprint 3 - Task 3.5.2: 진단 이력 페이지
 *
 * 진단 이력이 없을 때 표시되는 컴포넌트
 * - 빈 상태 아이콘 및 메시지
 * - "첫 진단 시작하기" 버튼
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, PlayCircle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface EmptyHistoryProps {
  /** 커스텀 메시지 (선택사항) */
  message?: string;

  /** 커스텀 설명 (선택사항) */
  description?: string;
}

export function EmptyHistory({
  message = '아직 진단 기록이 없습니다',
  description = '정신건강 자가진단을 통해 나의 상태를 확인하고, 맞춤 센터 추천을 받아보세요',
}: EmptyHistoryProps) {
  return (
    <Card className="rounded-card shadow-soft border-neutral-200">
      <CardContent className="py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
          {/* 아이콘 */}
          <div className="relative">
            <div className="absolute inset-0 bg-lavender-100 rounded-full blur-xl opacity-50" />
            <div className="relative w-20 h-20 bg-lavender-50 rounded-full flex items-center justify-center">
              <FileText className="h-10 w-10 text-lavender-600" />
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

          {/* 첫 진단 시작하기 버튼 */}
          <Button
            asChild
            variant="lavender"
            size="lg"
            className="min-w-[200px]"
          >
            <Link href="/assessment">
              <PlayCircle className="h-5 w-5 mr-2" />
              첫 진단 시작하기
            </Link>
          </Button>

          {/* 추가 안내 */}
          <div className="mt-6 p-4 bg-lavender-50 rounded-lg border border-lavender-200 w-full">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-lavender-600 shrink-0 mt-0.5" />
              <div className="space-y-2 text-left">
                <p className="text-body-sm font-semibold text-lavender-900">
                  자가진단으로 할 수 있는 일
                </p>
                <ul className="space-y-1.5 text-body-sm text-lavender-700">
                  <li className="flex items-start gap-2">
                    <span className="text-lavender-600 mt-0.5">•</span>
                    <span>나의 정신건강 상태를 객관적으로 확인</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lavender-600 mt-0.5">•</span>
                    <span>심각도에 따른 맞춤 센터 추천</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lavender-600 mt-0.5">•</span>
                    <span>진단 이력 관리 및 변화 추적</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 소요 시간 안내 */}
          <p className="text-caption text-neutral-500">
            ⏱️ 소요 시간: 약 3-5분
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Center Detail Loading State
 * 센터 상세 로딩 스켈레톤
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function CenterDetailLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 헤더 스켈레톤 */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg bg-neutral-200 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-neutral-200 animate-pulse" />
            <div className="w-10 h-10 rounded-lg bg-neutral-200 animate-pulse" />
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 스켈레톤 */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 기본 정보 카드 스켈레톤 */}
        <Card>
          <CardHeader>
            <div className="space-y-3">
              <div className="h-6 bg-neutral-200 rounded w-24 animate-pulse" />
              <div className="h-8 bg-neutral-200 rounded w-3/4 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 주소 스켈레톤 */}
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-neutral-200 rounded flex-shrink-0 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-neutral-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
              </div>
            </div>

            {/* 전화번호 스켈레톤 */}
            <div className="flex gap-3">
              <div className="w-5 h-5 bg-neutral-200 rounded flex-shrink-0 animate-pulse" />
              <div className="h-5 bg-neutral-200 rounded w-40 animate-pulse" />
            </div>

            {/* 버튼 스켈레톤 */}
            <div className="flex gap-3 pt-4">
              <div className="flex-1 h-11 bg-neutral-200 rounded-lg animate-pulse" />
              <div className="flex-1 h-11 bg-neutral-200 rounded-lg animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* 센터 소개 스켈레톤 */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-neutral-200 rounded w-32 animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-3/4 animate-pulse" />
          </CardContent>
        </Card>

        {/* 운영 시간 스켈레톤 */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-neutral-200 rounded w-32 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-5 bg-neutral-200 rounded w-2/3 animate-pulse" />
          </CardContent>
        </Card>

        {/* 리뷰 스켈레톤 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-6 bg-neutral-200 rounded w-24 animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded w-20 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-5 bg-neutral-200 rounded w-2/3 animate-pulse" />
          </CardContent>
        </Card>

        {/* 지도 스켈레톤 */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-neutral-200 rounded w-20 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-3/4 mt-3 animate-pulse" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

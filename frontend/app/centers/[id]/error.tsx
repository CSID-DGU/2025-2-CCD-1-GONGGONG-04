/**
 * Center Detail Error Boundary
 * 센터 상세 에러 바운더리
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CenterDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 에러 모니터링 서비스로 전송)
    console.error('Center detail error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          {/* 에러 아이콘 */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-status-emergency/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-status-emergency" aria-hidden="true" />
            </div>
          </div>

          {/* 에러 메시지 */}
          <div className="space-y-2">
            <h1 className="text-h2 text-neutral-900">
              일시적인 오류가 발생했습니다
            </h1>
            <p className="text-body text-neutral-600">
              잠시 후 다시 시도해주세요
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-small text-neutral-500 mt-4 font-mono bg-neutral-100 p-3 rounded">
                {error.message}
              </p>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={reset}
              variant="default"
              className="w-full touch-target"
              aria-label="다시 시도하기"
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              다시 시도
            </Button>

            <Button
              variant="secondary"
              className="w-full touch-target"
              asChild
            >
              <Link href="/" aria-label="홈으로 이동">
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                홈으로
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

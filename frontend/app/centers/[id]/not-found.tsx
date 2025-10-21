/**
 * Center Detail Not Found Page
 * 센터를 찾을 수 없는 경우 404 페이지
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Home } from 'lucide-react';
import Link from 'next/link';

export default function CenterNotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          {/* 아이콘 */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-neutral-400" aria-hidden="true" />
            </div>
          </div>

          {/* 메시지 */}
          <div className="space-y-2">
            <h1 className="text-h2 text-neutral-900">
              센터를 찾을 수 없습니다
            </h1>
            <p className="text-body text-neutral-600">
              요청하신 센터 정보를 찾을 수 없습니다.
              <br />
              다른 센터를 검색해보세요.
            </p>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="default"
              className="w-full touch-target"
              asChild
            >
              <Link href="/" aria-label="전체 센터 보기">
                전체 센터 보기
              </Link>
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

'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNavigation from './BottomNavigation';
import { cn } from '@/lib/utils';

export interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  showBottomNav?: boolean;
  className?: string;
}

export default function MainLayout({
  children,
  title,
  showBackButton = false,
  showBottomNav = true,
  className = '',
}: MainLayoutProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'flex flex-col min-h-screen',
        'mx-auto',
        'sm:max-w-3xl lg:max-w-5xl',
        className
      )}
    >
      {/* Header */}
      {(title || showBackButton) && (
        <header
          className="sticky top-0 z-40 bg-white border-b border-neutral-200"
          role="banner"
        >
          <div className="flex items-center h-14 px-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                aria-label="뒤로 가기"
                className="mr-2"
              >
                <ChevronLeft className="w-6 h-6" aria-hidden="true" />
              </Button>
            )}
            {title && (
              <h1 className="text-h2 font-semibold text-neutral-900">
                {title}
              </h1>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1",
          showBottomNav && "pb-20" // 하단 네비게이션 바 높이(64px) + 여유 공간
        )}
        role="main"
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}

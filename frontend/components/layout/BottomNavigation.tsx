'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Map, List, ClipboardList, Heart, Home, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavTab {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_TABS: NavTab[] = [
  { label: '지도 검색', href: '/map', icon: Map },
  { label: '센터 목록', href: '/centers', icon: List },
  { label: '홈', href: '/', icon: Home },
  { label: '추천', href: '/recommendations', icon: Heart },
  { label: '자가진단', href: '/assessment', icon: ClipboardList },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200"
      role="navigation"
      aria-label="주요 네비게이션"
    >
      <div className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom,0px)]">
        {NAV_TABS.map((tab) => {
          // 정확히 일치하거나 하위 경로인 경우 active 처리
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + '/');
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-w-[64px] h-full px-2',
                'transition-colors duration-200',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender-600',
                'rounded-md',
                isActive ? 'text-lavender-500' : 'text-neutral-500 hover:text-neutral-700'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${tab.label} 페이지로 이동`}
            >
              <Icon className="w-6 h-6 mb-1" aria-hidden={true} />
              <span className="text-caption font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Recommendations Page
 *
 * Sprint 2 - Task 4.3.3
 * 센터 추천 결과 페이지
 */

import type { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import { RecommendationsPageClient } from './RecommendationsPageClient';

/**
 * 페이지 메타데이터
 */
export const metadata: Metadata = {
  title: '추천 센터 | 마음이음',
  description:
    '맞춤형 정신건강복지센터를 추천받으세요. 현재 위치와 개인 상황을 고려한 최적의 센터를 찾아드립니다.',
  keywords: [
    '정신건강복지센터',
    '센터 추천',
    '맞춤 추천',
    '위치 기반 추천',
    '정신건강 상담',
  ],
  openGraph: {
    title: '추천 센터 | 마음이음',
    description: '맞춤형 정신건강복지센터를 추천받으세요',
    type: 'website',
  },
};

/**
 * 추천 페이지 (서버 컴포넌트)
 */
export default function RecommendationsPage() {
  return (
    <MainLayout title="추천" showBackButton={false} showBottomNav={true}>
      <RecommendationsPageClient />
    </MainLayout>
  );
}

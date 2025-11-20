/**
 * 지도 페이지
 *
 * Kakao Maps를 사용하여 정신건강복지센터를 지도에 표시합니다
 * - 지도 기반 센터 검색
 * - 현재 위치 기반 주변 센터 표시
 * - 지도 이동에 따른 센터 목록 업데이트
 *
 * @route /map
 */

import type { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import { MapPageClient } from './MapPageClient';

/**
 * 페이지 메타데이터
 */
export const metadata: Metadata = {
  title: '지도로 찾기 | 마음이음',
  description:
    '지도에서 가까운 정신건강복지센터를 찾아보세요. 현재 위치 기반으로 주변 센터를 확인할 수 있습니다.',
  keywords: [
    '정신건강복지센터',
    '지도',
    '위치 기반',
    '센터 찾기',
    '내 주변 센터',
  ],
  openGraph: {
    title: '지도로 찾기 | 마음이음',
    description: '지도에서 가까운 정신건강복지센터를 찾아보세요',
    type: 'website',
  },
};

/**
 * 지도 페이지 (서버 컴포넌트)
 */
export default function MapPage() {
  return (
    <MainLayout title="지도 검색" showBackButton={false}>
      <MapPageClient />
    </MainLayout>
  );
}

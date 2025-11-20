/**
 * 센터 목록 페이지
 *
 * 전체 정신건강복지센터 리스트를 표시합니다
 * - 검색 기능 (센터명, 주소)
 * - 필터링 (센터 유형, 지역, 운영 상태)
 * - 모든 센터를 한 번에 표시
 * - 센터 카드 클릭 시 상세 페이지 이동
 *
 * @route /centers
 */

import type { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import { CenterListClient } from './CenterListClient';

/**
 * 페이지 메타데이터
 */
export const metadata: Metadata = {
  title: '센터 목록 | 마음이음',
  description:
    '전국의 정신건강복지센터를 한눈에 확인하세요. 검색과 필터를 통해 원하는 조건의 센터를 쉽게 찾을 수 있습니다.',
  keywords: [
    '정신건강복지센터',
    '센터 목록',
    '센터 검색',
    '전체 센터',
    '정신건강 상담',
  ],
  openGraph: {
    title: '센터 목록 | 마음이음',
    description: '전국의 정신건강복지센터를 한눈에 확인하세요',
    type: 'website',
  },
};

/**
 * 센터 목록 페이지 (서버 컴포넌트)
 */
export default function CentersPage() {
  return (
    <MainLayout title="센터 목록" showBackButton={false} showBottomNav={true}>
      <CenterListClient />
    </MainLayout>
  );
}

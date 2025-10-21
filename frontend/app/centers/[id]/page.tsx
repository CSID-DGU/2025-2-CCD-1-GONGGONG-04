/**
 * Center Detail Page
 * 센터 상세 페이지 - Server-Side Rendering with ISR
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCenterDetail } from '@/lib/api/centers';
import { CenterDetail } from '@/types/center';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CenterHeader,
  CenterContactInfo,
  CenterDescription,
} from '@/components/center';
import { Clock, Star, Heart, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

// Incremental Static Regeneration (ISR)
// 60초마다 페이지 재생성하여 성능과 최신성 균형 유지
export const revalidate = 60;

/**
 * 동적 메타데이터 생성 (SEO 최적화)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const centerId = parseInt(params.id, 10);

    if (isNaN(centerId)) {
      return {
        title: '센터를 찾을 수 없습니다 | 마음이음',
        description: '정신건강증진센터를 찾을 수 없습니다',
      };
    }

    const center = await getCenterDetail(centerId);

    const description = center.business_content
      ? center.business_content.slice(0, 160) // 메타 설명 길이 제한
      : `${center.center_name} - ${center.center_type} 정신건강 상담 센터`;

    return {
      title: `${center.center_name} | 마음이음`,
      description,
      keywords: [
        '정신건강',
        '상담센터',
        center.center_type,
        center.contact.road_address.split(' ')[1], // 지역명
        '마음이음',
      ],
      openGraph: {
        title: center.center_name,
        description,
        type: 'website',
        locale: 'ko_KR',
        siteName: '마음이음',
      },
      twitter: {
        card: 'summary',
        title: center.center_name,
        description,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: '센터 정보 | 마음이음',
      description: '정신건강증진센터 상세 정보',
    };
  }
}

/**
 * 센터 상세 페이지 컴포넌트
 */
export default async function CenterDetailPage({ params }: PageProps) {
  const centerId = parseInt(params.id, 10);

  // 유효하지 않은 ID
  if (isNaN(centerId)) {
    notFound();
  }

  let center: CenterDetail;

  try {
    // 서버 사이드에서 데이터 페칭
    center = await getCenterDetail(centerId);
  } catch (error: any) {
    // 404 에러는 notFound 처리
    if (error.statusCode === 404) {
      notFound();
    }
    // 기타 에러는 에러 바운더리로 전달
    throw error;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="focus-ring rounded-lg">
            <Button variant="ghost" size="sm" aria-label="홈으로 돌아가기">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" aria-label="공유하기">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" aria-label="즐겨찾기">
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 센터 기본 정보 - CenterHeader 컴포넌트 */}
        <Card>
          <CardContent className="p-6">
            <CenterHeader
              centerName={center.center_name}
              centerType={center.center_type}
              avgRating={center.stats.avg_rating}
              reviewCount={center.stats.review_count}
            />
          </CardContent>
        </Card>

        {/* 연락처 및 위치 정보 - CenterContactInfo 컴포넌트 */}
        <CenterContactInfo
          phone={center.contact.phone}
          roadAddress={center.contact.road_address}
          jibunAddress={center.contact.jibun_address}
          latitude={center.location.latitude}
          longitude={center.location.longitude}
          distance={center.location.distance}
        />

        {/* 센터 소개 - CenterDescription 컴포넌트 */}
        <CenterDescription
          businessContent={center.business_content}
          viewCount={center.stats.view_count}
          favoriteCount={center.stats.favorite_count}
        />

        {/* 플레이스홀더: 운영 시간 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h3 flex items-center gap-2">
              <Clock className="w-5 h-5" aria-hidden="true" />
              운영 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-body text-neutral-500">
              운영 시간 정보는 곧 제공될 예정입니다.
            </p>
          </CardContent>
        </Card>

        {/* 플레이스홀더: 리뷰 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-h3 flex items-center gap-2">
                <Star className="w-5 h-5" aria-hidden="true" />
                리뷰
              </CardTitle>
              <span className="text-small text-neutral-500">
                {center.stats.review_count}개의 리뷰
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-body text-neutral-500">
              리뷰 기능은 곧 제공될 예정입니다.
            </p>
          </CardContent>
        </Card>

        {/* 플레이스홀더: 지도 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h3">위치</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-neutral-200 rounded-lg flex items-center justify-center">
              <p className="text-body text-neutral-500">
                지도는 곧 제공될 예정입니다.
              </p>
            </div>
            <p className="text-small text-neutral-600 mt-3">
              {center.contact.road_address}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

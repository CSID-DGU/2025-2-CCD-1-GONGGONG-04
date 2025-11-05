'use client';

/**
 * Recommendations Page
 *
 * Sprint 2 - Task 4.3.3
 * 센터 추천 결과 페이지
 */

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, MapPin, TrendingUp, AlertCircle, Search } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/**
 * 추천 결과 메인 컴포넌트
 */
function RecommendationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 쿼리 파라미터에서 위치 정보 읽기
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const maxDistance = searchParams.get('maxDistance');
  const limit = searchParams.get('limit');

  // Recommendations mutation
  const {
    mutate: getRecommendations,
    data,
    isLoading,
    error,
  } = useRecommendations({
    showErrorToast: true,
  });

  // 페이지 로드 시 자동으로 추천 요청
  useEffect(() => {
    if (lat && lng) {
      getRecommendations({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        maxDistance: maxDistance ? parseInt(maxDistance) : 10,
        limit: limit ? parseInt(limit) : 5,
      });
    }
  }, [lat, lng, maxDistance, limit, getRecommendations]);

  // 위치 정보가 없는 경우
  if (!lat || !lng) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Alert>
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>위치 정보 필요</AlertTitle>
          <AlertDescription>
            센터 추천을 받으려면 현재 위치 정보가 필요합니다.
            <br />
            메인 페이지에서 위치를 설정한 후 다시 시도해주세요.
          </AlertDescription>
        </Alert>

        <div className="mt-6">
          <Button onClick={() => router.push('/')} variant="lavender">
            메인 페이지로 이동
          </Button>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 스켈레톤 */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* 카드 스켈레톤 */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-7 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>추천 실패</AlertTitle>
          <AlertDescription>
            {error.message}
            <br />
            다시 시도해주세요.
          </AlertDescription>
        </Alert>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => {
              if (lat && lng) {
                getRecommendations({
                  latitude: parseFloat(lat),
                  longitude: parseFloat(lng),
                  maxDistance: maxDistance ? parseInt(maxDistance) : 10,
                  limit: limit ? parseInt(limit) : 5,
                });
              }
            }}
            variant="lavender"
          >
            다시 시도
          </Button>
          <Button onClick={() => router.push('/')} variant="outline">
            메인 페이지로
          </Button>
        </div>
      </div>
    );
  }

  // 빈 결과
  if (data && data.data.recommendations.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Alert>
          <Search className="h-5 w-5" />
          <AlertTitle>검색 결과 없음</AlertTitle>
          <AlertDescription>
            현재 위치 반경 {data.data.searchCriteria.maxDistance}km 내에 추천 가능한 센터가 없습니다.
            <br />
            검색 반경을 넓혀서 다시 시도해보세요.
          </AlertDescription>
        </Alert>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => {
              if (lat && lng) {
                getRecommendations({
                  latitude: parseFloat(lat),
                  longitude: parseFloat(lng),
                  maxDistance: 20, // 반경 확장
                  limit: limit ? parseInt(limit) : 5,
                });
              }
            }}
            variant="lavender"
          >
            반경 20km로 다시 검색
          </Button>
          <Button onClick={() => router.push('/')} variant="outline">
            메인 페이지로
          </Button>
        </div>
      </div>
    );
  }

  // 성공 - 추천 결과 표시
  if (data) {
    const recommendations = data.data.recommendations;
    const { searchCriteria } = data.data;

    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-neutral-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-lavender-600" />
            추천 센터
          </h1>
          <p className="text-body text-neutral-600 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {searchCriteria.maxDistance}km 반경 내 {recommendations.length}개 센터를 찾았습니다
          </p>
        </div>

        {/* 추천 결과 리스트 */}
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.centerId}
              recommendation={recommendation}
              rank={index + 1}
              onClick={(centerId) => {
                router.push(`/centers/${centerId}`);
              }}
            />
          ))}
        </div>

        {/* 하단 액션 */}
        <div className="mt-8 text-center">
          <Button onClick={() => router.push('/')} variant="outline">
            새로운 검색
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * 추천 페이지 (Suspense 래퍼)
 */
export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-4xl mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavender-600" />
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}

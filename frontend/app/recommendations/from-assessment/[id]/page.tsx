/**
 * Assessment-based Recommendation Page
 *
 * Sprint 3 - Task 3.5.1: 진단 기반 추천 페이지
 *
 * 자가진단 결과를 바탕으로 맞춤 센터 추천을 제공하는 페이지
 * - Assessment 정보 조회 및 표시
 * - 위치 입력 모달
 * - 추천 센터 목록 표시
 * - 로딩/에러 상태 처리
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LocationInputModal } from '@/components/recommendations/LocationInputModal';
import { AssessmentRecommendationHeader } from '@/components/recommendations/AssessmentRecommendationHeader';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { EmptyRecommendations } from '@/components/recommendations/EmptyRecommendations';
import { RecommendationListSkeleton } from '@/components/recommendations/RecommendationListSkeleton';
import { useAssessmentRecommendations } from '@/hooks/useRecommendations';
import { useAssessmentStore } from '@/store/assessmentStore';
import type { AssessmentRecommendationRequest } from '@/lib/api/recommendations';

export default function AssessmentRecommendationPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = Number(params.id);

  // assessmentStore에서 현재 결과 가져오기 (익명 사용자 지원)
  const { currentResult: storeResult } = useAssessmentStore();

  // 상태 관리
  const [location, setLocation] = useState<AssessmentRecommendationRequest | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // 인증 토큰 (MVP: user_1 형식)
  // 실제 환경에서는 인증 컨텍스트나 쿠키에서 가져와야 함
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') || 'user_1' : 'user_1';

  /**
   * Assessment 정보 확인 및 위치 모달 열기
   */
  useEffect(() => {
    if (!assessmentId || isNaN(assessmentId)) {
      return;
    }

    // Store에 결과가 있으면 위치 모달 자동 열기
    if (storeResult && storeResult.assessmentId === assessmentId) {
      setIsLocationModalOpen(true);
    }
  }, [assessmentId, storeResult]);

  /**
   * 추천 데이터 조회 (위치 설정 후)
   */
  const {
    data: recommendationData,
    isLoading: isLoadingRecommendations,
    error: recommendationError,
    refetch,
  } = useAssessmentRecommendations(assessmentId, location, authToken, {
    enabled: !!location,
    showErrorToast: true,
  });

  /**
   * 위치 확인 핸들러
   */
  const handleLocationConfirm = (newLocation: AssessmentRecommendationRequest) => {
    setLocation(newLocation);
    setIsLocationModalOpen(false);
  };

  /**
   * 위치 변경 버튼 핸들러
   */
  const handleChangeLocation = () => {
    setIsLocationModalOpen(true);
  };

  /**
   * 뒤로 가기
   */
  const handleGoBack = () => {
    router.back();
  };

  /**
   * Assessment 데이터 없음
   */
  if (!storeResult || storeResult.assessmentId !== assessmentId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {/* 뒤로 가기 버튼 */}
          <Button variant="ghost" onClick={handleGoBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            뒤로 가기
          </Button>

          {/* 에러 메시지 */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>진단 정보를 찾을 수 없습니다</AlertTitle>
            <AlertDescription>
              진단을 먼저 완료해주세요.
            </AlertDescription>
          </Alert>

          <Button variant="lavender" onClick={() => router.push('/assessment')}>
            자가진단 시작하기
          </Button>
        </div>
      </div>
    );
  }

  /**
   * 메인 렌더링
   */
  const recommendations = (recommendationData as any)?.data?.recommendations || [];
  const hasRecommendations = recommendations.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        {/* 뒤로 가기 버튼 */}
        <Button variant="ghost" onClick={handleGoBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          뒤로 가기
        </Button>

        {/* 헤더 (진단 정보) */}
        <AssessmentRecommendationHeader
          assessment={storeResult as any}
          location={location}
          onChangeLocation={handleChangeLocation}
          recommendationCount={recommendations.length}
        />

        {/* 추천 센터 목록 영역 */}
        {!location ? (
          // 위치 미설정 상태
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>위치를 설정해주세요</AlertTitle>
            <AlertDescription>
              추천 센터를 찾기 위해 현재 위치를 입력해주세요
            </AlertDescription>
          </Alert>
        ) : isLoadingRecommendations ? (
          // 로딩 중
          <RecommendationListSkeleton count={5} />
        ) : recommendationError ? (
          // 에러 발생
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>추천 센터를 불러올 수 없습니다</AlertTitle>
            <AlertDescription>
              {recommendationError.message || '알 수 없는 오류가 발생했습니다'}
            </AlertDescription>
          </Alert>
        ) : hasRecommendations ? (
          // 추천 결과 있음
          <div className="space-y-4">
            <div>
              <h2 className="text-h3 font-bold text-neutral-900">
                맞춤 추천 센터 ({recommendations.length}개)
              </h2>
              <p className="text-body text-neutral-600 mt-1">
                진단 결과와 위치를 고려한 추천 순위입니다
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((recommendation: any, index: number) => (
                <RecommendationCard
                  key={recommendation.centerId}
                  recommendation={recommendation}
                  rank={index + 1}
                  onClick={(centerId) => router.push(`/centers/${centerId}`)}
                />
              ))}
            </div>
          </div>
        ) : (
          // 추천 결과 없음
          <EmptyRecommendations onChangeLocation={handleChangeLocation} />
        )}
      </div>

      {/* 위치 입력 모달 */}
      <LocationInputModal
        open={isLocationModalOpen}
        onOpenChange={setIsLocationModalOpen}
        onConfirm={handleLocationConfirm}
        initialLocation={location}
        isLoading={isLoadingRecommendations}
      />
    </div>
  );
}

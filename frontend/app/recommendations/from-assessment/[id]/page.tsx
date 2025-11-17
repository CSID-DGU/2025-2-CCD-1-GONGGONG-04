/**
 * Assessment-based Recommendation Page
 *
 * Sprint 3 → Sprint 5 (Phase 2): 진단 기반 추천 페이지 (하이브리드 추천으로 업그레이드)
 *
 * 자가진단 결과를 바탕으로 맞춤 센터 추천을 제공하는 페이지
 * - Assessment 정보 조회 및 표시
 * - 위치 입력 모달
 * - 하이브리드 추천 (규칙 70% + 의미론적 검색 30%)
 * - userQuery 없어도 규칙 기반으로 자동 Fallback
 * - 추천 센터 목록 표시
 * - 로딩/에러 상태 처리
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocationInputModal } from '@/components/recommendations/LocationInputModal';
import { AssessmentRecommendationHeader } from '@/components/recommendations/AssessmentRecommendationHeader';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { EmptyRecommendations } from '@/components/recommendations/EmptyRecommendations';
import { RecommendationListSkeleton } from '@/components/recommendations/RecommendationListSkeleton';
import { useHybridRecommendations } from '@/hooks/useRecommendations';
import { useAssessmentStore } from '@/store/assessmentStore';
import type { AssessmentRecommendationRequest, HybridRecommendationRequest } from '@/lib/api/recommendations';

export default function AssessmentRecommendationPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = Number(params.id);

  // assessmentStore에서 현재 결과 가져오기 (익명 사용자 지원)
  const { currentResult: storeResult } = useAssessmentStore();

  // 상태 관리
  const [locationInput, setLocationInput] = useState<AssessmentRecommendationRequest | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [userQuery, setUserQuery] = useState<string>(''); // Textarea 입력값
  const [appliedQuery, setAppliedQuery] = useState<string>(''); // 실제로 API에 전달되는 쿼리
  const [showQueryInput, setShowQueryInput] = useState<boolean>(false);

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
   * 하이브리드 추천 요청 생성
   * locationInput { lat, lng } → HybridRecommendationRequest { latitude, longitude, assessmentId, userQuery? }
   */
  const hybridRequest: HybridRecommendationRequest | null = locationInput
    ? {
        latitude: locationInput.lat,
        longitude: locationInput.lng,
        assessmentId: assessmentId,
        maxDistance: locationInput.maxDistance || 10,
        limit: locationInput.limit || 5,
        // appliedQuery가 있으면 하이브리드 모드, 없으면 규칙 기반만 사용 (Fallback 모드)
        ...(appliedQuery.trim() && { userQuery: appliedQuery.trim() }),
      }
    : null;

  /**
   * 하이브리드 추천 데이터 조회 (위치 설정 후)
   * Sprint 5 - Phase 2: 규칙 기반(70%) + 의미론적 검색(30%)
   */
  const {
    data: recommendationData,
    isLoading: isLoadingRecommendations,
    error: recommendationError,
    refetch,
  } = useHybridRecommendations(hybridRequest, {
    enabled: !!hybridRequest,
    showErrorToast: true,
  });

  /**
   * 위치 확인 핸들러
   */
  const handleLocationConfirm = (newLocation: AssessmentRecommendationRequest) => {
    setLocationInput(newLocation);
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
   * AI 추천 적용하기 (Manual Trigger)
   */
  const handleApplyQuery = () => {
    setAppliedQuery(userQuery);
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
          location={locationInput}
          onChangeLocation={handleChangeLocation}
          recommendationCount={recommendations.length}
        />

        {/* Sprint 5: 사용자 쿼리 입력 (선택) */}
        {locationInput && (
          <Card className="border-lavender-200 bg-lavender-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-lavender-600" />
                  <Label htmlFor="userQuery" className="text-h4 font-semibold text-neutral-900">
                    AI 맞춤 추천 (선택)
                  </Label>
                  {!showQueryInput && (
                    <Badge variant="secondary" className="ml-2">
                      선택사항
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQueryInput(!showQueryInput)}
                  className="text-lavender-600 hover:text-lavender-700 hover:bg-lavender-100"
                >
                  {showQueryInput ? '숨기기' : '입력하기'}
                </Button>
              </div>

              {showQueryInput ? (
                <div className="space-y-3">
                  <Textarea
                    id="userQuery"
                    placeholder="예: 우울증 상담이 필요해요 / 불안감이 심해요 / 가족 상담을 받고 싶어요"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="min-h-[100px] resize-none border-lavender-200 focus:border-lavender-400 focus:ring-lavender-400"
                    maxLength={500}
                    disabled={isLoadingRecommendations}
                  />
                  <div className="flex items-start gap-2 text-caption text-neutral-600">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      상담 내용을 자유롭게 입력하시면 AI가 더 정확한 추천을 제공합니다.
                      입력하지 않아도 진단 결과를 바탕으로 추천받을 수 있습니다.
                      ({userQuery.length}/500자)
                    </p>
                  </div>

                  {/* AI 추천 적용하기 버튼 */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="lavender"
                      size="default"
                      onClick={handleApplyQuery}
                      disabled={!userQuery.trim() || userQuery.trim() === appliedQuery.trim() || isLoadingRecommendations}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isLoadingRecommendations ? 'AI 분석 중...' : 'AI 추천 적용하기'}
                    </Button>
                    {userQuery.trim() && userQuery.trim() === appliedQuery.trim() && (
                      <span className="text-caption text-neutral-600">
                        ✓ 적용됨
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-body text-neutral-600">
                  상담이 필요한 내용을 입력하면 AI가 더욱 정확한 센터를 추천해드립니다.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 추천 알고리즘 메타데이터 (추천 결과가 있을 때) */}
        {recommendationData?.data?.metadata && (
          <Card className="border-neutral-200 bg-neutral-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 text-caption">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-600">추천 알고리즘:</span>
                  <Badge variant={recommendationData.data.metadata.fallbackMode ? 'secondary' : 'default'}>
                    {recommendationData.data.metadata.algorithm === 'hybrid' ? 'AI 하이브리드' : '규칙 기반'}
                  </Badge>
                </div>
                {!recommendationData.data.metadata.fallbackMode && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-600">가중치:</span>
                    <span className="text-neutral-900 font-medium">
                      규칙 {Math.round(recommendationData.data.metadata.weights.rule * 100)}% +
                      AI {Math.round(recommendationData.data.metadata.weights.embedding * 100)}%
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-neutral-600">응답 시간:</span>
                  <span className="text-neutral-900 font-medium">
                    {recommendationData.data.metadata.queryTime}ms
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 추천 센터 목록 영역 */}
        {!locationInput ? (
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
        initialLocation={locationInput}
        isLoading={isLoadingRecommendations}
      />
    </div>
  );
}

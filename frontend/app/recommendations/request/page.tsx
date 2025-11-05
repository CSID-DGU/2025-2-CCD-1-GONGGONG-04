/**
 * Recommendation Request Page
 *
 * Sprint 2 - Task 4.3.4: 추천 요청 폼 페이지
 *
 * 센터 추천을 요청하기 위한 폼 페이지
 * - 위치 입력 (GPS + 수동)
 * - 필터 옵션 (검색 반경, 개수, 센터 유형 등)
 * - 사용자 프로필 (선택적)
 * - 폼 검증 및 결과 페이지로 리다이렉션
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationInput } from '@/components/recommendations/LocationInput';
import { FilterOptions } from '@/components/recommendations/FilterOptions';
import { UserProfile } from '@/components/recommendations/UserProfile';
import {
  recommendationRequestFormSchema,
  type RecommendationRequestFormData,
} from '@/lib/validations/recommendationRequest';
import { ArrowRight, Info } from 'lucide-react';

export default function RecommendationRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecommendationRequestFormData>({
    resolver: zodResolver(recommendationRequestFormSchema),
    defaultValues: {
      location: {
        latitude: 0,
        longitude: 0,
      },
      filters: {
        maxDistance: 10,
        limit: 5,
        operatingHours: 'all',
        onlineAvailable: false,
      },
      userProfile: undefined,
    },
  });

  /**
   * 폼 제출 핸들러
   */
  const onSubmit = (data: RecommendationRequestFormData) => {
    setIsSubmitting(true);

    try {
      // 쿼리 파라미터 구성
      const params = new URLSearchParams({
        lat: data.location.latitude.toString(),
        lng: data.location.longitude.toString(),
        maxDistance: data.filters.maxDistance.toString(),
        limit: data.filters.limit.toString(),
      });

      // 선택적 필터 추가
      if (data.filters.centerTypes && data.filters.centerTypes.length > 0) {
        params.append('centerTypes', data.filters.centerTypes.join(','));
      }

      if (data.filters.operatingHours && data.filters.operatingHours !== 'all') {
        params.append('operatingHours', data.filters.operatingHours);
      }

      if (data.filters.onlineAvailable) {
        params.append('onlineAvailable', 'true');
      }

      // 사용자 프로필 추가 (선택적)
      if (data.userProfile) {
        if (data.userProfile.ageGroup) {
          params.append('ageGroup', data.userProfile.ageGroup);
        }
        if (data.userProfile.symptoms && data.userProfile.symptoms.length > 0) {
          params.append('symptoms', data.userProfile.symptoms.join(','));
        }
        if (data.userProfile.preferredCounseling) {
          params.append('preferredCounseling', data.userProfile.preferredCounseling);
        }
        if (data.userProfile.preferFree) {
          params.append('preferFree', 'true');
        }
      }

      // 결과 페이지로 리다이렉션
      router.push(`/recommendations?${params.toString()}`);
    } catch (error) {
      console.error('Failed to submit recommendation request:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-h1 text-gray-900 mb-2">맞춤 센터 추천 받기</h1>
        <p className="text-body text-gray-600">
          위치와 선호 조건을 입력하시면 가장 적합한 정신건강 센터를 추천해드립니다
        </p>
      </div>

      {/* 안내 메시지 */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          위치 정보는 필수이며, 나머지 정보는 선택사항입니다. 더 많은 정보를 입력하실수록
          정확한 추천을 받을 수 있습니다.
        </AlertDescription>
      </Alert>

      {/* 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 1. 위치 입력 */}
        <section>
          <div className="mb-4">
            <h2 className="text-h2 text-gray-900 mb-1">위치 정보</h2>
            <p className="text-sm text-gray-600">
              현재 위치 또는 원하는 위치를 선택해주세요
            </p>
          </div>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <LocationInput
                value={field.value}
                onChange={field.onChange}
                error={errors.location?.latitude?.message || errors.location?.longitude?.message}
              />
            )}
          />
        </section>

        <Separator />

        {/* 2. 필터 옵션 */}
        <section>
          <div className="mb-4">
            <h2 className="text-h2 text-gray-900 mb-1">검색 옵션</h2>
            <p className="text-sm text-gray-600">
              검색 범위와 센터 조건을 설정해주세요
            </p>
          </div>
          <Controller
            name="filters"
            control={control}
            render={({ field }) => (
              <FilterOptions value={field.value} onChange={field.onChange} />
            )}
          />
        </section>

        <Separator />

        {/* 3. 사용자 프로필 (선택적) */}
        <section>
          <div className="mb-4">
            <h2 className="text-h2 text-gray-900 mb-1">
              사용자 프로필 <span className="text-sm text-gray-500">(선택사항)</span>
            </h2>
            <p className="text-sm text-gray-600">
              더 정확한 추천을 위해 프로필 정보를 입력해주세요
            </p>
          </div>
          <Controller
            name="userProfile"
            control={control}
            render={({ field }) => (
              <UserProfile value={field.value} onChange={field.onChange} />
            )}
          />
        </section>

        <Separator />

        {/* 제출 버튼 */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            size="lg"
            className="min-w-[200px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              '처리 중...'
            ) : (
              <>
                맞춤 센터 추천 받기
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {/* 전체 폼 에러 메시지 */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              입력하신 정보를 다시 확인해주세요. 위치 정보는 필수입니다.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}

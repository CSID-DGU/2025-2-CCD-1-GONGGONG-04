/**
 * LocationInputModal Component
 *
 * Sprint 3 - Task 3.5.1: 진단 기반 추천 페이지
 *
 * 위치 입력 모달 컴포넌트
 * - Dialog 기반 모달
 * - GPS 현재 위치 또는 수동 입력
 * - 위치 확인 후 추천 요청
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LocationInput } from './LocationInput';
import type { LocationData } from '@/lib/validations/recommendationRequest';
import type { AssessmentRecommendationRequest } from '@/lib/api/recommendations';

export interface LocationInputModalProps {
  /** 모달 열림 상태 */
  open: boolean;

  /** 모달 닫기 핸들러 */
  onOpenChange: (open: boolean) => void;

  /** 위치 확인 핸들러 */
  onConfirm: (location: AssessmentRecommendationRequest) => void;

  /** 초기 위치 (선택사항) */
  initialLocation?: AssessmentRecommendationRequest | null;

  /** 로딩 상태 */
  isLoading?: boolean;
}

export function LocationInputModal({
  open,
  onOpenChange,
  onConfirm,
  initialLocation = null,
  isLoading = false,
}: LocationInputModalProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // 초기 위치 설정
  useEffect(() => {
    if (initialLocation) {
      setLocation({
        latitude: initialLocation.lat,
        longitude: initialLocation.lng,
        address: '선택된 위치',
      });
    }
  }, [initialLocation]);

  /**
   * 위치 변경 핸들러
   */
  const handleLocationChange = (newLocation: LocationData) => {
    setLocation(newLocation);
    setValidationError(null);
  };

  /**
   * 위치 확인 핸들러
   */
  const handleConfirm = () => {
    if (!location || location.latitude === 0 || location.longitude === 0) {
      setValidationError('위치를 입력해주세요');
      return;
    }

    // 위도 범위 검증
    if (location.latitude < -90 || location.latitude > 90) {
      setValidationError('위도는 -90 ~ 90 사이여야 합니다');
      return;
    }

    // 경도 범위 검증
    if (location.longitude < -180 || location.longitude > 180) {
      setValidationError('경도는 -180 ~ 180 사이여야 합니다');
      return;
    }

    // 추천 요청 파라미터 생성
    const recommendationRequest: AssessmentRecommendationRequest = {
      lat: location.latitude,
      lng: location.longitude,
    };

    onConfirm(recommendationRequest);
  };

  /**
   * 모달 닫기 핸들러
   */
  const handleCancel = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-h2">위치 입력</DialogTitle>
          <DialogDescription className="text-body text-neutral-600">
            추천 센터를 찾기 위해 현재 위치를 입력해주세요.
            <br />
            GPS 버튼을 누르거나 직접 위도/경도를 입력할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <LocationInput
            value={location}
            onChange={handleLocationChange}
            error={validationError || undefined}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            type="button"
          >
            취소
          </Button>
          <Button
            variant="lavender"
            onClick={handleConfirm}
            disabled={isLoading || !location}
            type="button"
          >
            {isLoading ? '검색 중...' : '추천 센터 찾기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

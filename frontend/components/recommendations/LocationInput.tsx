/**
 * LocationInput Component
 *
 * Sprint 2 - Task 4.3.4: 위치 입력 컴포넌트
 *
 * 사용자 위치를 입력받는 컴포넌트
 * - GPS 현재 위치 버튼
 * - 수동 위도/경도 입력
 * - 위치 표시
 */

'use client';

import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LocationData } from '@/lib/validations/recommendationRequest';

interface LocationInputProps {
  value: LocationData | null;
  onChange: (location: LocationData) => void;
  error?: string;
}

export function LocationInput({ value, onChange, error }: LocationInputProps) {
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  /**
   * GPS 현재 위치 가져오기
   */
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('이 브라우저는 위치 서비스를 지원하지 않습니다');
      return;
    }

    setIsLoadingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange({
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          address: '현재 위치',
        });
        setIsLoadingGPS(false);
      },
      (error) => {
        let errorMessage = 'GPS 위치를 가져올 수 없습니다';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다';
            break;
        }

        setGpsError(errorMessage);
        setIsLoadingGPS(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /**
   * 수동 위도 입력
   */
  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = parseFloat(e.target.value);
    if (!isNaN(lat)) {
      onChange({
        latitude: lat,
        longitude: value?.longitude || 0,
        address: value?.address,
      });
    }
  };

  /**
   * 수동 경도 입력
   */
  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lng = parseFloat(e.target.value);
    if (!isNaN(lng)) {
      onChange({
        latitude: value?.latitude || 0,
        longitude: lng,
        address: value?.address,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* GPS 버튼 */}
      <div>
        <Button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoadingGPS}
          className="w-full"
          variant="outline"
        >
          {isLoadingGPS ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              위치 가져오는 중...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              현재 위치 사용
            </>
          )}
        </Button>
      </div>

      {/* GPS 에러 메시지 */}
      {gpsError && (
        <Alert variant="destructive">
          <AlertDescription>{gpsError}</AlertDescription>
        </Alert>
      )}

      {/* 수동 입력 필드 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">위도 (Latitude)</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            min="-90"
            max="90"
            placeholder="37.5665"
            value={value?.latitude || ''}
            onChange={handleLatitudeChange}
            aria-describedby={error ? 'location-error' : undefined}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">경도 (Longitude)</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            min="-180"
            max="180"
            placeholder="126.9780"
            value={value?.longitude || ''}
            onChange={handleLongitudeChange}
            aria-describedby={error ? 'location-error' : undefined}
          />
        </div>
      </div>

      {/* 현재 선택된 위치 표시 */}
      {value && value.latitude !== 0 && value.longitude !== 0 && (
        <div className="rounded-md bg-lavender-50 p-3 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-lavender-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-lavender-900">선택된 위치</p>
              {value.address && (
                <p className="text-lavender-700">{value.address}</p>
              )}
              <p className="text-lavender-600 text-xs mt-1">
                위도: {value.latitude.toFixed(6)}, 경도: {value.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 검증 에러 메시지 */}
      {error && (
        <Alert variant="destructive" id="location-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * LocationPermissionDialog Component
 *
 * 위치 권한 요청 다이얼로그
 *
 * 사용자에게 GPS 위치 권한을 요청하고, 거부 시 주소 검색으로 유도합니다.
 * Geolocation API의 에러 상태에 따라 적절한 피드백을 제공합니다.
 *
 * @example
 * const { requestLocation, error } = useGeolocation();
 *
 * <LocationPermissionDialog
 *   open={!hasPermission}
 *   onAllow={requestLocation}
 *   onDeny={() => router.push('/map?mode=address')}
 *   error={error}
 * />
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';

export interface LocationPermissionDialogProps {
  /**
   * 다이얼로그 표시 여부
   */
  open: boolean;

  /**
   * [위치 사용 허용] 클릭 핸들러
   */
  onAllow: () => void;

  /**
   * [주소로 검색하기] 클릭 핸들러
   */
  onDeny: () => void;

  /**
   * Geolocation 에러 (optional)
   */
  error?: GeolocationPositionError | null;
}

/**
 * 위치 권한 요청 다이얼로그 컴포넌트
 */
export function LocationPermissionDialog({
  open,
  onAllow,
  onDeny,
  error,
}: LocationPermissionDialogProps) {
  /**
   * 에러 코드에 따른 메시지 렌더링
   */
  const getErrorMessage = () => {
    if (!error) return null;

    switch (error.code) {
      case 1: // PERMISSION_DENIED
        return (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-md border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" aria-hidden="true" />
            <p className="text-sm text-red-700">
              위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.
            </p>
          </div>
        );

      case 2: // POSITION_UNAVAILABLE
        return (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0" aria-hidden="true" />
            <p className="text-sm text-yellow-700">
              위치 정보를 가져올 수 없습니다. 주소 검색을 이용해주세요.
            </p>
          </div>
        );

      case 3: // TIMEOUT
        return (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0" aria-hidden="true" />
            <p className="text-sm text-yellow-700">
              위치 요청 시간이 초과되었습니다. 다시 시도해주세요.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-lavender-100 rounded-full" aria-hidden="true">
              <MapPin className="h-5 w-5 text-lavender-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              위치 권한이 필요합니다
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-600">
            주변 정신건강 센터를 찾기 위해 현재 위치가 필요합니다.
            위치 정보는 센터 검색 목적으로만 사용됩니다.
          </DialogDescription>
        </DialogHeader>

        {getErrorMessage()}

        <DialogFooter className="flex gap-2 sm:gap-2 flex-col-reverse sm:flex-row">
          <Button
            variant="outline"
            onClick={onDeny}
            className="flex-1 h-[44px]"
            aria-label="주소로 검색하기"
          >
            주소로 검색하기
          </Button>
          <Button
            onClick={onAllow}
            className="flex-1 h-[44px] bg-lavender-500 hover:bg-lavender-600"
            disabled={error?.code === 1} // PERMISSION_DENIED 시 비활성화
            aria-label="위치 사용 허용"
          >
            위치 사용 허용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

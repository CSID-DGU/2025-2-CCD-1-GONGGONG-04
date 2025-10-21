'use client';

/**
 * CenterContactInfo Component
 * 센터의 연락처 및 위치 정보를 표시하는 컴포넌트
 * - 전화번호, 주소, 거리 정보
 * - 전화하기, 길찾기 액션 버튼
 * - 주소 복사 기능
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, MapPin, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface CenterContactInfoProps {
  phone: string | null;
  roadAddress: string;
  jibunAddress: string | null;
  latitude: number;
  longitude: number;
  distance?: number;
  onCall?: () => void;
  onDirections?: () => void;
}

export function CenterContactInfo({
  phone,
  roadAddress,
  jibunAddress,
  latitude,
  longitude,
  distance,
  onCall,
  onDirections,
}: CenterContactInfoProps) {
  const [addressCopied, setAddressCopied] = useState(false);
  const { toast } = useToast();

  // 주소 복사 핸들러
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(roadAddress);
      setAddressCopied(true);
      toast({
        title: '주소가 복사되었습니다',
        description: roadAddress,
        duration: 2000,
      });

      // 2초 후 아이콘 복구
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (error) {
      toast({
        title: '주소 복사 실패',
        description: '다시 시도해주세요',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  // 전화하기 핸들러
  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone.replace(/-/g, '')}`;
      onCall?.();
    }
  };

  // 길찾기 핸들러
  const handleDirections = () => {
    // 카카오맵 길찾기 링크
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(
      roadAddress
    )},${latitude},${longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onDirections?.();
  };

  // 거리 포맷팅
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    if (meters < 10000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${Math.round(meters / 1000)}km`;
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* 전화번호 섹션 */}
        {phone && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-small font-medium text-neutral-600">
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>전화번호</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <a
                href={`tel:${phone.replace(/-/g, '')}`}
                className="text-body text-neutral-900 hover:text-lavender-500 transition-colors focus-ring rounded"
                aria-label={`${phone}로 전화하기`}
              >
                {phone}
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCall}
                className="focus-ring"
                aria-label="전화하기"
              >
                전화하기
              </Button>
            </div>
          </div>
        )}

        {/* 주소 섹션 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-small font-medium text-neutral-600">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>주소</span>
            </div>
            {distance && (
              <Badge variant="secondary" className="text-caption">
                {formatDistance(distance)}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            {/* 도로명 주소 */}
            <button
              onClick={handleCopyAddress}
              className="w-full text-left text-body text-neutral-900 hover:text-lavender-500 transition-colors focus-ring rounded p-1 -ml-1 flex items-start gap-2"
              aria-label="도로명 주소 복사하기"
            >
              <span className="flex-1">{roadAddress}</span>
              {addressCopied ? (
                <Check className="w-4 h-4 text-status-operating flex-shrink-0 mt-1" />
              ) : (
                <Copy className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-1" />
              )}
            </button>

            {/* 지번 주소 */}
            {jibunAddress && (
              <p className="text-small text-neutral-500 pl-1">
                (지번) {jibunAddress}
              </p>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 pt-2">
          {phone && (
            <Button
              variant="lavender"
              size="touch"
              className="flex-1"
              onClick={handleCall}
              aria-label="전화하기"
            >
              <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
              전화하기
            </Button>
          )}

          <Button
            variant={phone ? 'outline' : 'lavender'}
            size="touch"
            className={phone ? 'flex-1' : 'w-full'}
            onClick={handleDirections}
            aria-label="길찾기"
          >
            <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
            길찾기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * RadiusSelector Component
 *
 * Sprint 2 - Day 8
 *
 * 검색 반경을 선택하는 드롭다운 컴포넌트
 *
 * @example
 * <RadiusSelector />
 */

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMapStore } from '@/store/mapStore';
import type { RadiusType } from '@/store/mapStore';
import { MapPin } from 'lucide-react';

/**
 * 반경 옵션 정의
 */
const RADIUS_OPTIONS: Array<{ value: RadiusType; label: string }> = [
  { value: '1', label: '반경 1km' },
  { value: '3', label: '반경 3km' },
  { value: '5', label: '반경 5km' },
  { value: '10', label: '반경 10km' },
  { value: 'all', label: '전체' },
];

export function RadiusSelector() {
  const { radius, setRadius } = useMapStore();

  return (
    <div className="flex items-center gap-2">
      {/* 아이콘 (옵션) */}
      <MapPin className="h-4 w-4 text-lavender-600 hidden sm:block" aria-hidden="true" />

      {/* 드롭다운 */}
      <Select value={radius} onValueChange={(value) => setRadius(value as RadiusType)}>
        <SelectTrigger
          className="w-32 sm:w-36 h-11 border-gray-300 focus:ring-lavender-500 focus:border-lavender-500"
          aria-label="반경 선택"
        >
          <SelectValue placeholder="반경 선택" />
        </SelectTrigger>
        <SelectContent>
          {RADIUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

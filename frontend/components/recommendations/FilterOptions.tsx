/**
 * FilterOptions Component
 *
 * Sprint 2 - Task 4.3.4: 필터 옵션 컴포넌트
 *
 * 추천 검색 필터 옵션
 * - 검색 반경 슬라이더 (1-50km)
 * - 추천 개수 선택 (1-20)
 * - 센터 유형 체크박스
 * - 운영 시간 필터
 * - 온라인 상담 가능 토글
 */

'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilterOptionsData } from '@/lib/validations/recommendationRequest';

interface FilterOptionsProps {
  value: FilterOptionsData;
  onChange: (filters: FilterOptionsData) => void;
}

const CENTER_TYPES = [
  '정신건강복지센터',
  '자살예방센터',
  '중독관리통합지원센터',
  '청소년상담복지센터',
  '아동보호전문기관',
] as const;

const OPERATING_HOURS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'weekday', label: '평일만' },
  { value: 'weekend', label: '주말 운영' },
  { value: 'night', label: '야간 운영' },
] as const;

export function FilterOptions({ value, onChange }: FilterOptionsProps) {
  /**
   * 검색 반경 변경
   */
  const handleDistanceChange = (newValue: number[]) => {
    onChange({
      ...value,
      maxDistance: newValue[0],
    });
  };

  /**
   * 추천 개수 변경
   */
  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    if (!isNaN(newLimit) && newLimit >= 1 && newLimit <= 20) {
      onChange({
        ...value,
        limit: newLimit,
      });
    }
  };

  /**
   * 센터 유형 체크박스 토글
   */
  const handleCenterTypeToggle = (centerType: string) => {
    const currentTypes = value.centerTypes || [];
    const isChecked = currentTypes.includes(centerType as any);

    const newTypes = isChecked
      ? currentTypes.filter((t) => t !== centerType)
      : [...currentTypes, centerType as any];

    onChange({
      ...value,
      centerTypes: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  /**
   * 운영 시간 필터 변경
   */
  const handleOperatingHoursChange = (newValue: string) => {
    onChange({
      ...value,
      operatingHours: newValue as any,
    });
  };

  /**
   * 온라인 상담 가능 토글
   */
  const handleOnlineToggle = (checked: boolean) => {
    onChange({
      ...value,
      onlineAvailable: checked,
    });
  };

  return (
    <div className="space-y-6">
      {/* 검색 반경 슬라이더 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="distance-slider">검색 반경</Label>
          <span className="text-sm font-medium text-lavender-600">
            {value.maxDistance}km
          </span>
        </div>
        <Slider
          id="distance-slider"
          min={1}
          max={50}
          step={1}
          value={[value.maxDistance]}
          onValueChange={handleDistanceChange}
          className="w-full"
          aria-label="검색 반경 선택"
        />
        <p className="text-xs text-gray-500">
          현재 위치로부터 {value.maxDistance}km 이내의 센터를 검색합니다
        </p>
      </div>

      {/* 추천 개수 */}
      <div className="space-y-2">
        <Label htmlFor="limit-input">추천 개수</Label>
        <Input
          id="limit-input"
          type="number"
          min={1}
          max={20}
          value={value.limit}
          onChange={handleLimitChange}
          className="w-24"
          aria-label="추천 개수 입력"
        />
        <p className="text-xs text-gray-500">최대 {value.limit}개의 센터를 추천받습니다</p>
      </div>

      {/* 센터 유형 */}
      <div className="space-y-3">
        <Label>센터 유형</Label>
        <div className="space-y-2">
          {CENTER_TYPES.map((centerType) => (
            <div key={centerType} className="flex items-center space-x-2">
              <Checkbox
                id={`center-type-${centerType}`}
                checked={value.centerTypes?.includes(centerType) || false}
                onCheckedChange={() => handleCenterTypeToggle(centerType)}
                aria-label={`${centerType} 선택`}
              />
              <label
                htmlFor={`center-type-${centerType}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {centerType}
              </label>
            </div>
          ))}
        </div>
        {(!value.centerTypes || value.centerTypes.length === 0) && (
          <p className="text-xs text-gray-500">모든 센터 유형이 검색됩니다</p>
        )}
      </div>

      {/* 운영 시간 필터 */}
      <div className="space-y-2">
        <Label htmlFor="operating-hours">운영 시간</Label>
        <Select
          value={value.operatingHours}
          onValueChange={handleOperatingHoursChange}
        >
          <SelectTrigger id="operating-hours" className="w-full">
            <SelectValue placeholder="운영 시간 선택" />
          </SelectTrigger>
          <SelectContent>
            {OPERATING_HOURS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 온라인 상담 가능 */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="online-available" className="text-base">
            온라인 상담 가능
          </Label>
          <p className="text-sm text-gray-500">
            화상 또는 전화 상담이 가능한 센터만 보기
          </p>
        </div>
        <Switch
          id="online-available"
          checked={value.onlineAvailable}
          onCheckedChange={handleOnlineToggle}
          aria-label="온라인 상담 가능 센터만 보기"
        />
      </div>
    </div>
  );
}

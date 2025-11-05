/**
 * UserProfile Component
 *
 * Sprint 2 - Task 4.3.4: 사용자 프로필 컴포넌트
 *
 * 사용자 프로필 정보 입력 (선택적)
 * - 연령대 선택
 * - 증상 태그 선택 (최대 10개)
 * - 선호 상담 방식
 * - 무료 프로그램 선호 여부
 */

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserProfileData } from '@/lib/validations/recommendationRequest';

interface UserProfileProps {
  value: UserProfileData | undefined;
  onChange: (profile: UserProfileData | undefined) => void;
}

const AGE_GROUPS = [
  '아동',
  '청소년',
  '20대',
  '30대',
  '40대',
  '50대',
  '60대 이상',
  '성인',
] as const;

const SYMPTOMS = [
  '우울감',
  '불안',
  '스트레스',
  '불면증',
  '중독',
  '자살/자해',
  '대인관계',
  '트라우마',
  '분노조절',
  '기타',
] as const;

const COUNSELING_TYPES = [
  '개인상담',
  '집단상담',
  '가족상담',
  '상관없음',
] as const;

export function UserProfile({ value, onChange }: UserProfileProps) {
  /**
   * 연령대 변경
   */
  const handleAgeGroupChange = (newValue: string) => {
    onChange({
      ...(value || {}),
      ageGroup: newValue as any,
    });
  };

  /**
   * 증상 토글
   */
  const handleSymptomToggle = (symptom: string) => {
    const currentSymptoms = value?.symptoms || [];
    const isSelected = currentSymptoms.includes(symptom as any);

    let newSymptoms: typeof currentSymptoms;

    if (isSelected) {
      // 이미 선택된 증상 제거
      newSymptoms = currentSymptoms.filter((s) => s !== symptom);
    } else {
      // 새 증상 추가 (최대 10개)
      if (currentSymptoms.length >= 10) {
        return; // 최대 개수 초과 방지
      }
      newSymptoms = [...currentSymptoms, symptom as any];
    }

    onChange({
      ...(value || {}),
      symptoms: newSymptoms.length > 0 ? newSymptoms : undefined,
    });
  };

  /**
   * 선호 상담 방식 변경
   */
  const handleCounselingTypeChange = (newValue: string) => {
    onChange({
      ...(value || {}),
      preferredCounseling: newValue as any,
    });
  };

  /**
   * 무료 프로그램 선호 토글
   */
  const handlePreferFreeToggle = (checked: boolean) => {
    onChange({
      ...(value || {}),
      preferFree: checked,
    });
  };

  const selectedSymptomsCount = value?.symptoms?.length || 0;
  const isMaxSymptomsReached = selectedSymptomsCount >= 10;

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <Alert>
        <AlertDescription>
          사용자 프로필 정보는 선택사항입니다. 입력하시면 더 정확한 추천을 받을 수 있습니다.
        </AlertDescription>
      </Alert>

      {/* 연령대 */}
      <div className="space-y-2">
        <Label htmlFor="age-group">연령대</Label>
        <Select
          value={value?.ageGroup}
          onValueChange={handleAgeGroupChange}
        >
          <SelectTrigger id="age-group" className="w-full">
            <SelectValue placeholder="연령대를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {AGE_GROUPS.map((ageGroup) => (
              <SelectItem key={ageGroup} value={ageGroup}>
                {ageGroup}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 증상 선택 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>증상 (최대 10개)</Label>
          <span className="text-sm text-gray-500">
            {selectedSymptomsCount}/10
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((symptom) => {
            const isSelected = value?.symptoms?.includes(symptom) || false;
            const isDisabled = !isSelected && isMaxSymptomsReached;

            return (
              <Badge
                key={symptom}
                variant={isSelected ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-lavender-500 hover:bg-lavender-600'
                    : 'hover:bg-lavender-50'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && handleSymptomToggle(symptom)}
                role="checkbox"
                aria-checked={isSelected}
                aria-label={`${symptom} 증상 선택`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    !isDisabled && handleSymptomToggle(symptom);
                  }
                }}
              >
                {symptom}
              </Badge>
            );
          })}
        </div>

        {isMaxSymptomsReached && (
          <p className="text-xs text-amber-600">
            최대 10개까지 선택할 수 있습니다
          </p>
        )}
      </div>

      {/* 선호 상담 방식 */}
      <div className="space-y-2">
        <Label htmlFor="counseling-type">선호 상담 방식</Label>
        <Select
          value={value?.preferredCounseling}
          onValueChange={handleCounselingTypeChange}
        >
          <SelectTrigger id="counseling-type" className="w-full">
            <SelectValue placeholder="상담 방식을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {COUNSELING_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 무료 프로그램 선호 */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="prefer-free" className="text-base">
            무료 프로그램 선호
          </Label>
          <p className="text-sm text-gray-500">
            무료로 이용 가능한 프로그램이 있는 센터 우선 추천
          </p>
        </div>
        <Switch
          id="prefer-free"
          checked={value?.preferFree || false}
          onCheckedChange={handlePreferFreeToggle}
          aria-label="무료 프로그램 선호"
        />
      </div>
    </div>
  );
}

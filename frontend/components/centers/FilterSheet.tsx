'use client';

/**
 * FilterSheet Component
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * Mobile version of center filters using shadcn Sheet component.
 * Provides filtering options for center types, regions, and operating status.
 */

import * as React from 'react';
import type { CenterMarkerData } from '@/lib/api/centers';
import type { CenterFilters } from '@/lib/utils/filterCenters';
import { extractCenterTypes, extractRegions } from '@/lib/utils/filterCenters';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

/**
 * Operating status display labels
 */
const OPERATING_STATUS_LABELS: Record<CenterMarkerData['operatingStatus'], string> = {
  OPEN: '운영 중',
  CLOSED: '마감',
  HOLIDAY: '휴무',
  CLOSING_SOON: '마감 임박',
  TEMP_CLOSED: '임시 휴무',
  NO_INFO: '정보 없음',
};

/**
 * FilterSheet Props
 */
export interface FilterSheetProps {
  /** Sheet open state */
  open: boolean;
  /** Sheet open state change handler */
  onOpenChange: (open: boolean) => void;
  /** Current filter values */
  filters: CenterFilters;
  /** Filter change handler */
  onFiltersChange: (filters: CenterFilters) => void;
  /** Apply button handler */
  onApply: () => void;
  /** Centers data for extracting filter options */
  centers: CenterMarkerData[];
}

/**
 * FilterSheet Component
 *
 * Mobile filter sheet with center type checkboxes, region selects, and operating status radio buttons.
 *
 * @example
 * ```tsx
 * <FilterSheet
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   onApply={handleApply}
 *   centers={centersData}
 * />
 * ```
 */
export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
  centers,
}: FilterSheetProps) {
  // Extract unique center types and regions
  const centerTypes = React.useMemo(() => extractCenterTypes(centers), [centers]);
  const regions = React.useMemo(() => extractRegions(centers), [centers]);

  // Get districts for selected province
  const availableDistricts = React.useMemo(() => {
    if (!filters.region?.province) {
      return [];
    }
    return regions.districts[filters.region.province] || [];
  }, [filters.region?.province, regions.districts]);

  /**
   * Handle center type checkbox change
   */
  const handleCenterTypeChange = (type: string, checked: boolean) => {
    const currentTypes = filters.centerTypes || [];
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter((t) => t !== type);

    onFiltersChange({
      ...filters,
      centerTypes: newTypes,
    });
  };

  /**
   * Handle province selection
   */
  const handleProvinceChange = (province: string) => {
    onFiltersChange({
      ...filters,
      region: {
        province,
        district: undefined, // Reset district when province changes
      },
    });
  };

  /**
   * Handle district selection
   */
  const handleDistrictChange = (district: string) => {
    onFiltersChange({
      ...filters,
      region: {
        ...filters.region,
        province: filters.region?.province || '',
        district,
      },
    });
  };

  /**
   * Handle operating status selection
   */
  const handleOperatingStatusChange = (status: CenterMarkerData['operatingStatus']) => {
    onFiltersChange({
      ...filters,
      operatingStatus: status,
    });
  };

  /**
   * Reset all filters
   */
  const handleReset = () => {
    onFiltersChange({
      centerTypes: [],
      region: undefined,
      operatingStatus: undefined,
    });
  };

  /**
   * Apply filters and close sheet
   */
  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-h3">필터</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Center Types Filter */}
          <div className="space-y-3">
            <Label className="text-body font-semibold">센터 유형</Label>
            <div className="space-y-3">
              {centerTypes.map((type) => (
                <div key={type} className="flex items-center gap-3">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.centerTypes?.includes(type) || false}
                    onCheckedChange={(checked) =>
                      handleCenterTypeChange(type, checked as boolean)
                    }
                    aria-label={`${type} 필터`}
                    className="min-w-[44px] min-h-[44px]"
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-body cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Region Filter */}
          <div className="space-y-3">
            <Label className="text-body font-semibold">지역</Label>
            <div className="space-y-3">
              {/* Province Select */}
              <div>
                <Label htmlFor="province-select" className="text-small text-muted-foreground mb-2">
                  시/도
                </Label>
                <Select
                  value={filters.region?.province || ''}
                  onValueChange={handleProvinceChange}
                >
                  <SelectTrigger
                    id="province-select"
                    className="w-full h-[44px]"
                    aria-label="시/도 선택"
                  >
                    <SelectValue placeholder="시/도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District Select */}
              {filters.region?.province && (
                <div>
                  <Label htmlFor="district-select" className="text-small text-muted-foreground mb-2">
                    시/군/구
                  </Label>
                  <Select
                    value={filters.region?.district || ''}
                    onValueChange={handleDistrictChange}
                  >
                    <SelectTrigger
                      id="district-select"
                      className="w-full h-[44px]"
                      aria-label="시/군/구 선택"
                    >
                      <SelectValue placeholder="시/군/구 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Operating Status Filter */}
          <div className="space-y-3">
            <Label className="text-body font-semibold">운영 상태</Label>
            <RadioGroup
              value={filters.operatingStatus || ''}
              onValueChange={(value) =>
                handleOperatingStatusChange(value as CenterMarkerData['operatingStatus'])
              }
            >
              {(Object.keys(OPERATING_STATUS_LABELS) as CenterMarkerData['operatingStatus'][]).map(
                (status) => (
                  <div key={status} className="flex items-center gap-3">
                    <RadioGroupItem
                      id={`status-${status}`}
                      value={status}
                      aria-label={`${OPERATING_STATUS_LABELS[status]} 필터`}
                      className="min-w-[44px] min-h-[44px]"
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-body cursor-pointer"
                    >
                      {OPERATING_STATUS_LABELS[status]}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>
          </div>
        </div>

        <SheetFooter className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="touch"
            onClick={handleReset}
            className="w-full"
            aria-label="필터 초기화"
          >
            초기화
          </Button>
          <Button
            variant="lavender"
            size="touch"
            onClick={handleApply}
            className="w-full"
            aria-label="필터 적용"
          >
            적용
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

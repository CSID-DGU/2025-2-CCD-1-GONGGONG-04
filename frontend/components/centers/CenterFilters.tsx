'use client';

/**
 * CenterFilters Component
 *
 * Sprint 2 - Day 11: Centers List Page
 *
 * Responsive wrapper component that conditionally renders FilterSheet (mobile)
 * or FilterDialog (desktop) based on screen size.
 */

import * as React from 'react';
import type { CenterMarkerData } from '@/lib/api/centers';
import type { CenterFilters as CenterFiltersType } from '@/lib/utils/filterCenters';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterSheet } from './FilterSheet';
import { FilterDialog } from './FilterDialog';

/**
 * CenterFilters Props
 */
export interface CenterFiltersProps {
  /** Filter sheet/dialog open state */
  open: boolean;
  /** Open state change handler */
  onOpenChange: (open: boolean) => void;
  /** Current filter values */
  filters: CenterFiltersType;
  /** Filter change handler */
  onFiltersChange: (filters: CenterFiltersType) => void;
  /** Apply button handler */
  onApply: () => void;
  /** Centers data for extracting filter options */
  centers: CenterMarkerData[];
}

/**
 * CenterFilters Component
 *
 * Responsive filter component that switches between Sheet (mobile) and Dialog (desktop).
 * Uses the `useIsMobile` hook to determine which component to render.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * const [filters, setFilters] = useState<CenterFilters>({});
 *
 * <CenterFilters
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   onApply={handleApply}
 *   centers={centersData}
 * />
 * ```
 */
export default function CenterFilters({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApply,
  centers,
}: CenterFiltersProps) {
  const isMobile = useIsMobile();

  // Render mobile version (Sheet)
  if (isMobile) {
    return (
      <FilterSheet
        open={open}
        onOpenChange={onOpenChange}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onApply={onApply}
        centers={centers}
      />
    );
  }

  // Render desktop version (Dialog)
  return (
    <FilterDialog
      open={open}
      onOpenChange={onOpenChange}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onApply={onApply}
      centers={centers}
    />
  );
}

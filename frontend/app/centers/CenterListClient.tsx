'use client';

import { useState } from 'react';
import { useCenters, useFilteredCenters } from '@/hooks';
import { CenterCard } from '@/components/centers/CenterCard';
import { SearchBar } from '@/components/centers/SearchBar';
import { CenterListSkeleton } from '@/components/centers/CenterListSkeleton';
import { EmptyStatePresets } from '@/components/centers/EmptyState';
import CenterFilters from '@/components/centers/CenterFilters';
import { FilterTags } from '@/components/centers/FilterTags';
import { Button } from '@/components/ui/button';
import type { CenterFilters as CenterFiltersType } from '@/lib/utils/filterCenters';

export function CenterListClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CenterFiltersType>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch all centers
  const { data, isLoading, error } = useCenters();

  const centers = data?.centers || [];

  // Apply filters and search
  const { filteredCenters, filteredCount, hasActiveFilters } = useFilteredCenters({
    centers,
    searchQuery,
    filters,
  });

  // Filter handlers
  const handleFiltersChange = (newFilters: CenterFiltersType) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
  };

  const handleRemoveFilter = (
    filterType: 'centerType' | 'province' | 'district' | 'operatingStatus',
    value?: string
  ) => {
    const newFilters = { ...filters };

    if (filterType === 'centerType' && value) {
      newFilters.centerTypes = newFilters.centerTypes?.filter((t) => t !== value);
      if (newFilters.centerTypes?.length === 0) {
        delete newFilters.centerTypes;
      }
    } else if (filterType === 'province') {
      if (newFilters.region) {
        delete newFilters.region.province;
        delete newFilters.region.district; // Remove district when province is removed
        if (Object.keys(newFilters.region).length === 0) {
          delete newFilters.region;
        }
      }
    } else if (filterType === 'district') {
      if (newFilters.region) {
        delete newFilters.region.district;
      }
    } else if (filterType === 'operatingStatus') {
      delete newFilters.operatingStatus;
    }

    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Show full page skeleton during initial load
  if (isLoading) {
    return <CenterListSkeleton cardCount={6} />;
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-body text-red-600">
            센터 목록을 불러오는 중 오류가 발생했습니다: {error.message}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // Check if we have search query or filters active
  const hasSearchOrFilters = searchQuery.trim() !== '' || hasActiveFilters;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-h2 font-semibold text-neutral-900">
          전체 센터 ({filteredCount})
        </h2>
        <p className="text-small text-neutral-600">
          검색과 필터로 원하는 센터를 찾아보세요
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            onSearchChange={setSearchQuery}
            defaultValue={searchQuery}
            placeholder="센터명, 주소로 검색..."
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(true)}
          className="h-11"
        >
          필터
          {hasActiveFilters && (
            <span className="ml-2 bg-lavender-500 text-white rounded-full px-2 py-0.5 text-xs">
              {(filters.centerTypes?.length || 0) +
                (filters.region?.province ? 1 : 0) +
                (filters.region?.district ? 1 : 0) +
                (filters.operatingStatus ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Tags */}
      {hasActiveFilters && (
        <FilterTags filters={filters} onRemoveFilter={handleRemoveFilter} />
      )}

      {/* Center Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCenters.length === 0 ? (
          <div className="col-span-full">
            {hasSearchOrFilters ? (
              <EmptyStatePresets.NoSearchResults onReset={handleResetFilters} />
            ) : (
              <EmptyStatePresets.NoData
                message="등록된 센터가 없습니다"
                onAction={() => window.location.reload()}
              />
            )}
          </div>
        ) : (
          filteredCenters.map((center) => (
            <CenterCard key={center.id} center={center} variant="list" />
          ))
        )}
      </div>

      {/* Filter Dialog/Sheet */}
      <CenterFilters
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        centers={centers}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleApplyFilters}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCenters, useFilteredCenters, usePagination } from '@/hooks';
import { CenterCard } from '@/components/centers/CenterCard';
import { SearchBar } from '@/components/centers/SearchBar';
import { CenterListSkeleton } from '@/components/centers/CenterListSkeleton';
import { EmptyStatePresets } from '@/components/centers/EmptyState';
import CenterFilters from '@/components/centers/CenterFilters';
import { FilterTags } from '@/components/centers/FilterTags';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import type { CenterFilters as CenterFiltersType } from '@/lib/utils/filterCenters';

interface CenterListClientProps {
  initialPage: number;
}

export function CenterListClient({ initialPage }: CenterListClientProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CenterFiltersType>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Sync currentPage with initialPage when it changes (e.g., browser back/forward)
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Fetch all centers
  const { data, isLoading, error } = useCenters();

  const centers = data?.centers || [];

  // Apply filters and search
  const { filteredCenters, filteredCount, hasActiveFilters } = useFilteredCenters({
    centers,
    searchQuery,
    filters,
  });

  // Apply pagination
  const {
    paginatedItems,
    totalPages,
    currentPage: validatedPage,
    hasPrevPage,
    hasNextPage,
    pageNumbers,
    pageInfo,
  } = usePagination({
    items: filteredCenters,
    currentPage,
    itemsPerPage: 20,
    maxVisiblePages: 5,
  });

  // Debug: Track state changes
  useEffect(() => {
    console.log('=== useEffect: State changed ===');
    console.log('currentPage:', currentPage);
    console.log('validatedPage:', validatedPage);
    console.log('totalPages:', totalPages);
    console.log('filteredCenters.length:', filteredCenters.length);
    console.log('paginatedItems.length:', paginatedItems.length);
    console.log('First 3 paginated items:', paginatedItems.slice(0, 3).map(c => ({ id: c.id, name: c.name })));
    console.log('pageInfo:', pageInfo);
  }, [currentPage, validatedPage, paginatedItems, filteredCenters, totalPages, pageInfo]);

  // Page change handler using URL navigation
  const handlePageChange = (page: number) => {
    console.log('=== handlePageChange called ===');
    console.log('Changing to page:', page);
    console.log('Current page before:', currentPage);

    // Update local state immediately for responsive UI
    setCurrentPage(page);

    // Update URL with new page number (include full path for App Router)
    router.push(`/centers?page=${page}`, { scroll: false });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter handlers
  const handleFiltersChange = (newFilters: CenterFiltersType) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page
    router.push('/centers?page=1', { scroll: false }); // Reset to first page when filters change
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
    setCurrentPage(1); // Reset to first page
    router.push('/centers?page=1', { scroll: false });
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1); // Reset to first page
    router.push('/centers?page=1', { scroll: false });
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
            onSearchChange={(query) => {
              setSearchQuery(query);
              setCurrentPage(1); // Reset to first page
              router.push('/centers?page=1', { scroll: false }); // Reset to first page on search
            }}
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
          paginatedItems.map((center) => (
            <CenterCard key={center.id} center={center} variant="list" />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredCenters.length > 0 && (
        <div className="flex flex-col items-center gap-4 pt-4">
          {/* Page Info */}
          <div className="text-small text-neutral-500" aria-live="polite">
            {pageInfo}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasPrevPage) handlePageChange(validatedPage - 1);
                    }}
                    className={!hasPrevPage ? 'pointer-events-none opacity-50' : ''}
                    aria-disabled={!hasPrevPage}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {pageNumbers.map((pageNum, index) => {
                  // Check if we need ellipsis before this page
                  const showEllipsisBefore = index === 0 && pageNum > 1;

                  // Check if we need ellipsis after this page
                  const showEllipsisAfter =
                    index === pageNumbers.length - 1 && pageNum < totalPages;

                  return (
                    <div key={pageNum} className="flex items-center">
                      {showEllipsisBefore && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                          isActive={pageNum === validatedPage}
                          aria-label={`${pageNum}페이지로 이동`}
                          aria-current={pageNum === validatedPage ? 'page' : undefined}
                          className={
                            pageNum === validatedPage
                              ? 'bg-lavender-500 text-white hover:bg-lavender-600 border-lavender-500'
                              : ''
                          }
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>

                      {showEllipsisAfter && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </div>
                  );
                })}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasNextPage) handlePageChange(validatedPage + 1);
                    }}
                    className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
                    aria-disabled={!hasNextPage}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

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

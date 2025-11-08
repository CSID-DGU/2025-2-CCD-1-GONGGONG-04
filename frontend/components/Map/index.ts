/**
 * Map 컴포넌트 모듈
 *
 * Kakao Maps API를 사용한 지도 관련 컴포넌트들을 내보냅니다
 */

export { KakaoMapView } from './KakaoMapView';
export type { KakaoMapViewProps } from './KakaoMapView';

export { MapSkeleton } from './MapSkeleton';

export {
  MapLayout,
  MapLayoutWithSidebar,
  MapLayoutSplit,
} from './MapLayout';

export { CenterMarker } from './CenterMarker';
export type { CenterMarkerProps } from './CenterMarker';

export { CenterMarkers } from './CenterMarkers';
export type { CenterMarkersProps } from './CenterMarkers';

export {
  getMarkerImageSrc,
  getMarkerImageOptions,
  getStatusColor,
  getStatusLabel,
} from './markerIcons';
export type { OperatingStatus } from './markerIcons';

export { CurrentLocationMarker } from './CurrentLocationMarker';
export type { CurrentLocationMarkerProps } from './CurrentLocationMarker';

export { MarkerInfoPopup } from './MarkerInfoPopup';
export type { MarkerInfoPopupProps } from './MarkerInfoPopup';

export { OperatingStatusBadge } from './OperatingStatusBadge';
export type { OperatingStatusBadgeProps } from './OperatingStatusBadge';

export { RatingDisplay } from './RatingDisplay';
export type { RatingDisplayProps } from './RatingDisplay';

// Sprint 2 - Day 8: Radius Filter Components
export { RadiusSelector } from './RadiusSelector';
export { RadiusCircle } from './RadiusCircle';
export { RadiusChangeHandler } from './RadiusChangeHandler';

// Sprint 2 - Day 9: Address Search Components
export { AddressSearchBar } from './AddressSearchBar';
export type { AddressSearchBarProps } from '@/types/address';

export { SuggestionList, EmptySuggestionList } from './SuggestionList';
export type { SuggestionListProps } from '@/types/address';

// Sprint 2 - Day 10: Center List Components
export { CenterList } from './CenterList';
export type { CenterListProps } from '@/types/center';

export { CenterListItem, CenterListItemSkeleton } from './CenterListItem';
export type { CenterListItemProps } from '@/types/center';

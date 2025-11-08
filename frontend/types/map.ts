/**
 * Map Types
 *
 * Sprint 2 - Day 8
 *
 * 지도 관련 타입 정의
 */

export type RadiusType = '1' | '3' | '5' | '10' | 'all';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface MapViewMode {
  mode: 'map' | 'list';
}

/**
 * Marker Icon Generator
 * 운영 상태별 마커 아이콘 SVG 생성
 */

/**
 * 운영 상태 타입
 */
export type OperatingStatus =
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'CLOSED'
  | 'HOLIDAY'
  | 'TEMP_CLOSED'
  | 'NO_INFO';

/**
 * 운영 상태별 색상 매핑
 */
const STATUS_COLORS: Record<OperatingStatus, string> = {
  OPEN: '#10B981', // green-500 (운영중)
  CLOSING_SOON: '#F59E0B', // amber-500 (곧 마감)
  CLOSED: '#9CA3AF', // neutral-400 (마감)
  HOLIDAY: '#EF4444', // red-500 (휴무)
  TEMP_CLOSED: '#DC2626', // red-600 (임시 휴무)
  NO_INFO: '#6B7280', // neutral-500 (정보 없음)
};

/**
 * 운영 상태별 접근성 레이블
 */
const STATUS_LABELS: Record<OperatingStatus, string> = {
  OPEN: '운영중',
  CLOSING_SOON: '곧 마감',
  CLOSED: '마감',
  HOLIDAY: '휴무',
  TEMP_CLOSED: '임시 휴무',
  NO_INFO: '정보 없음',
};

/**
 * 마커 아이콘 SVG 생성
 *
 * @param operatingStatus - 운영 상태
 * @returns SVG 마커 아이콘의 Data URL
 *
 * @example
 * const iconSrc = getMarkerImageSrc('OPEN');
 * // returns: data:image/svg+xml;charset=utf-8,...
 */
export function getMarkerImageSrc(operatingStatus: OperatingStatus): string {
  const color = STATUS_COLORS[operatingStatus];
  const label = STATUS_LABELS[operatingStatus];

  // 핀 모양의 마커 아이콘 (32x40px)
  const svg = `
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 그림자 -->
      <ellipse cx="16" cy="38" rx="8" ry="2" fill="black" opacity="0.2"/>

      <!-- 핀 모양 -->
      <path
        d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 40 16 40C16 40 32 24.837 32 16C32 7.163 24.837 0 16 0Z"
        fill="${color}"
      />

      <!-- 내부 원 -->
      <circle cx="16" cy="15" r="8" fill="white"/>

      <!-- 체크 아이콘 (OPEN 상태) -->
      ${operatingStatus === 'OPEN' ? `
        <path
          d="M12 15L15 18L20 12"
          stroke="${color}"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      ` : ''}

      <!-- X 아이콘 (CLOSED, HOLIDAY, TEMP_CLOSED 상태) -->
      ${['CLOSED', 'HOLIDAY', 'TEMP_CLOSED'].includes(operatingStatus) ? `
        <path
          d="M13 13L19 19M19 13L13 19"
          stroke="${color}"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      ` : ''}

      <!-- 시계 아이콘 (CLOSING_SOON 상태) -->
      ${operatingStatus === 'CLOSING_SOON' ? `
        <circle cx="16" cy="15" r="4" stroke="${color}" stroke-width="1.5" fill="none"/>
        <path d="M16 13V15H18" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
      ` : ''}

      <!-- 물음표 아이콘 (NO_INFO 상태) -->
      ${operatingStatus === 'NO_INFO' ? `
        <text
          x="16"
          y="19"
          font-family="Arial, sans-serif"
          font-size="12"
          font-weight="bold"
          fill="${color}"
          text-anchor="middle"
        >?</text>
      ` : ''}

      <!-- 접근성을 위한 title -->
      <title>${label}</title>
    </svg>
  `.trim();

  // SVG를 Data URL로 인코딩
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Kakao Maps용 MarkerImage 객체 생성
 *
 * @param operatingStatus - 운영 상태
 * @returns Kakao Maps MarkerImage 생성용 옵션
 *
 * @example
 * const markerImageOptions = getMarkerImageOptions('OPEN');
 * const markerImage = new kakao.maps.MarkerImage(
 *   markerImageOptions.src,
 *   markerImageOptions.size,
 *   markerImageOptions.options
 * );
 */
export function getMarkerImageOptions(operatingStatus: OperatingStatus) {
  const imageSrc = getMarkerImageSrc(operatingStatus);
  const label = STATUS_LABELS[operatingStatus];

  return {
    src: imageSrc,
    size: new window.kakao.maps.Size(32, 40),
    options: {
      offset: new window.kakao.maps.Point(16, 40), // 마커의 기준점을 하단 중앙으로 설정
      alt: `${label} 센터`,
    },
  };
}

/**
 * 운영 상태에 따른 색상 가져오기
 *
 * @param operatingStatus - 운영 상태
 * @returns 색상 코드
 *
 * @example
 * const color = getStatusColor('OPEN'); // '#10B981'
 */
export function getStatusColor(operatingStatus: OperatingStatus): string {
  return STATUS_COLORS[operatingStatus];
}

/**
 * 운영 상태에 따른 레이블 가져오기
 *
 * @param operatingStatus - 운영 상태
 * @returns 레이블 텍스트
 *
 * @example
 * const label = getStatusLabel('OPEN'); // '운영중'
 */
export function getStatusLabel(operatingStatus: OperatingStatus): string {
  return STATUS_LABELS[operatingStatus];
}

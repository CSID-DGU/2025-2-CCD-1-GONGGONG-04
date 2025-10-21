/**
 * Opens Kakao Map with directions to specified coordinates
 *
 * @param latitude - Destination latitude
 * @param longitude - Destination longitude
 * @param placeName - Name of the destination (optional, defaults to "목적지")
 *
 * @example
 * ```typescript
 * // Open directions to Seoul City Hall
 * openKakaoMapDirections(37.5665, 126.9780, "서울시청");
 *
 * // Open directions without place name
 * openKakaoMapDirections(37.5665, 126.9780);
 * ```
 */
export function openKakaoMapDirections(
  latitude: number,
  longitude: number,
  placeName?: string
): void {
  try {
    // Use default place name if not provided
    const destination = placeName || '목적지';

    // URL encode the place name to handle special characters
    const encodedPlaceName = encodeURIComponent(destination);

    // Construct Kakao Map URL for directions
    // Format: https://map.kakao.com/link/to/{placeName},{latitude},{longitude}
    const kakaoMapUrl = `https://map.kakao.com/link/to/${encodedPlaceName},${latitude},${longitude}`;

    // Open in new tab
    window.open(kakaoMapUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Failed to open Kakao Map directions:', error);
  }
}

/**
 * Opens Kakao Map to show a specific location
 *
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @param placeName - Name of the location (optional)
 *
 * @example
 * ```typescript
 * // Show location on map
 * openKakaoMapLocation(37.5665, 126.9780, "서울시청");
 * ```
 */
export function openKakaoMapLocation(
  latitude: number,
  longitude: number,
  placeName?: string
): void {
  try {
    const destination = placeName || '위치';
    const encodedPlaceName = encodeURIComponent(destination);

    // Format: https://map.kakao.com/link/map/{placeName},{latitude},{longitude}
    const kakaoMapUrl = `https://map.kakao.com/link/map/${encodedPlaceName},${latitude},${longitude}`;

    window.open(kakaoMapUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Failed to open Kakao Map location:', error);
  }
}

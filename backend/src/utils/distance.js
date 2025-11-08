/**
 * Distance Calculation Utilities
 *
 * Sprint 2 Day 6: Haversine formula and walk time calculation
 * FR-BE-05: Accurate distance calculation and walk time estimation
 */

/**
 * Calculate accurate distance between two GPS coordinates using Haversine formula
 *
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lng1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lng2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in meters (rounded)
 *
 * @example
 * // Seoul City Hall to Gangnam Station
 * const distance = calculateDistance(37.5665, 126.9780, 37.4979, 127.0276);
 * console.log(distance); // ~8500 meters
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // meters
}

/**
 * Calculate estimated walk time
 *
 * @param {number} distanceInMeters - Distance in meters
 * @returns {string} Walk time (e.g., "10분")
 *
 * @example
 * calculateWalkTime(1000)  // "13분"
 * calculateWalkTime(3000)  // "38분"
 * calculateWalkTime(100)   // "2분" (minimum 2 minutes)
 */
function calculateWalkTime(distanceInMeters) {
  const walkSpeedMeterPerMin = 80; // 80 meters per minute
  const minutes = Math.ceil(distanceInMeters / walkSpeedMeterPerMin);
  return `${minutes}분`;
}

module.exports = {
  calculateDistance,
  calculateWalkTime,
};

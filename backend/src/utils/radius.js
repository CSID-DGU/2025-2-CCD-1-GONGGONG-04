/**
 * Radius Utility Functions
 *
 * Sprint 2 Day 6: Radius parameter expansion
 * FR-BE-04: Support multiple radius options
 */

/**
 * Convert radius string to meters
 *
 * @param {string} radius - Radius parameter ('10', '30', '50', '100', 'all')
 * @returns {number} Radius in meters
 *
 * @example
 * getRadiusInMeters('10')   // 10000
 * getRadiusInMeters('30')   // 30000
 * getRadiusInMeters('50')   // 50000
 * getRadiusInMeters('100')  // 100000
 * getRadiusInMeters('all') // 999999999 (effectively unlimited, 100 results limit)
 */
function getRadiusInMeters(radius) {
  // Type check - must be string
  if (typeof radius !== 'string') {
    throw new Error(`Radius must be a string. Received: ${typeof radius}`);
  }

  const radiusMap = {
    '10': 10000,
    '30': 30000,
    '50': 50000,
    '100': 100000,
    'all': 999999999, // Effectively unlimited (limited by 100 result cap)
  };

  if (!Object.hasOwnProperty.call(radiusMap, radius)) {
    throw new Error(`Invalid radius value: ${radius}. Must be one of: 10, 30, 50, 100, all`);
  }

  return radiusMap[radius];
}

/**
 * Get display string for radius
 *
 * @param {string} radius - Radius parameter ('1', '3', '5', '10', 'all')
 * @returns {string} Display string (e.g., '5km' or '전체')
 *
 * @example
 * getRadiusDisplay('5')   // '5km'
 * getRadiusDisplay('all') // '전체'
 */
function getRadiusDisplay(radius) {
  if (radius === 'all') {
    return '전체';
  }
  return `${radius}km`;
}

module.exports = {
  getRadiusInMeters,
  getRadiusDisplay,
};

/**
 * Case Converter Utilities
 * Convert between snake_case and camelCase
 */

/**
 * Convert snake_case string to camelCase
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 */
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively convert all keys in object from snake_case to camelCase
 */
function keysToCamel(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => keysToCamel(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = snakeToCamel(key);
    acc[camelKey] = keysToCamel(obj[key]);
    return acc;
  }, {});
}

/**
 * Recursively convert all keys in object from camelCase to snake_case
 */
function keysToSnake(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => keysToSnake(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnake(key);
    acc[snakeKey] = keysToSnake(obj[key]);
    return acc;
  }, {});
}

module.exports = {
  snakeToCamel,
  camelToSnake,
  keysToCamel,
  keysToSnake,
};

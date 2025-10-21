/**
 * Validation utilities for API endpoints
 */

/**
 * Validate if a value is a positive integer
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid positive integer
 */
const isPositiveInteger = (value) => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

/**
 * Validate latitude value (-90 to 90)
 * @param {*} value - Latitude value to validate
 * @returns {boolean} True if valid latitude
 */
const isValidLatitude = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= -90 && num <= 90;
};

/**
 * Validate longitude value (-180 to 180)
 * @param {*} value - Longitude value to validate
 * @returns {boolean} True if valid longitude
 */
const isValidLongitude = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= -180 && num <= 180;
};

/**
 * Create validation error response
 * @param {string} message - Error message
 * @param {string} field - Field name that failed validation
 * @returns {Object} Validation error object
 */
const createValidationError = (message, field = null) => {
  const error = new Error(message);
  error.statusCode = 400;
  error.field = field;
  return error;
};

/**
 * Create not found error response
 * @param {string} message - Error message
 * @returns {Object} Not found error object
 */
const createNotFoundError = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

module.exports = {
  isPositiveInteger,
  isValidLatitude,
  isValidLongitude,
  createValidationError,
  createNotFoundError
};

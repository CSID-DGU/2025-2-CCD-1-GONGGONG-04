/**
 * Reviews Routes
 *
 * Defines HTTP routes for review operations.
 *
 * @module routes/reviews
 */

const { Router } = require('express');
const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  addReaction,
  errorHandler,
} = require('../controllers/reviews.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @route GET /api/centers/:id/reviews
 * @description Get reviews for a specific center
 * @access Public (authentication optional for is_my_review and my_reaction)
 *
 * @queryparam {number} page - Page number (default: 1)
 * @queryparam {number} limit - Items per page (default: 10, max: 50)
 * @queryparam {string} sort - Sort option: latest|helpful|rating_desc|rating_asc (default: latest)
 *
 * @returns {Object} 200 - Review list with pagination and summary
 * @returns {Object} 400 - Invalid request parameters
 * @returns {Object} 404 - Center not found
 * @returns {Object} 500 - Internal server error
 */
router.get('/centers/:id/reviews', getReviews);

/**
 * @route POST /api/centers/:id/reviews
 * @description Create a new review for a center
 * @access Private (requires authentication)
 *
 * @bodyparam {number} rating - Rating (1-5, required)
 * @bodyparam {string} title - Review title (2-200 characters, optional)
 * @bodyparam {string} content - Review content (10-1000 characters, required)
 * @bodyparam {string} visit_date - Visit date in YYYY-MM-DD format (optional)
 *
 * @returns {Object} 201 - Created review
 * @returns {Object} 400 - Invalid request body
 * @returns {Object} 401 - Not authenticated
 * @returns {Object} 404 - Center not found
 * @returns {Object} 409 - Duplicate review
 * @returns {Object} 500 - Internal server error
 */
router.post('/centers/:id/reviews', authMiddleware, createReview);

/**
 * @route PUT /api/reviews/:id
 * @description Update an existing review (within 7 days)
 * @access Private (requires authentication, owner only)
 *
 * @bodyparam {number} rating - Rating (1-5, optional)
 * @bodyparam {string} title - Review title (2-200 characters, optional)
 * @bodyparam {string} content - Review content (10-1000 characters, optional)
 * @bodyparam {string} visit_date - Visit date in YYYY-MM-DD format (optional)
 *
 * @returns {Object} 200 - Updated review
 * @returns {Object} 400 - Invalid request body
 * @returns {Object} 401 - Not authenticated
 * @returns {Object} 403 - Not owner or 7-day limit exceeded
 * @returns {Object} 404 - Review not found
 * @returns {Object} 500 - Internal server error
 */
router.put('/reviews/:id', authMiddleware, updateReview);

/**
 * @route DELETE /api/reviews/:id
 * @description Delete a review (soft delete)
 * @access Private (requires authentication, owner only)
 *
 * @returns {void} 204 - No Content
 * @returns {Object} 401 - Not authenticated
 * @returns {Object} 403 - Not owner
 * @returns {Object} 404 - Review not found
 * @returns {Object} 500 - Internal server error
 */
router.delete('/reviews/:id', authMiddleware, deleteReview);

/**
 * @route POST /api/reviews/:id/reactions
 * @description Add or update reaction to a review
 * @access Private (requires authentication)
 *
 * @bodyparam {string|null} reaction - 'helpful' | 'unhelpful' | null (null = remove reaction)
 *
 * @returns {Object} 200 - Updated reaction counts and my_reaction
 * @returns {Object} 400 - Invalid request body
 * @returns {Object} 401 - Not authenticated
 * @returns {Object} 404 - Review not found
 * @returns {Object} 500 - Internal server error
 */
router.post('/reviews/:id/reactions', authMiddleware, addReaction);

// Apply error handler middleware
router.use(errorHandler);

module.exports = router;

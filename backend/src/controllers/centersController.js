const { PrismaClient } = require('@prisma/client');
const {
  isPositiveInteger,
  isValidLatitude,
  isValidLongitude,
  createValidationError,
  createNotFoundError,
  validateSchema,
  centerSearchQuerySchema,
} = require('../utils/validation');
const { getCentersWithinRadius } = require('../services/centersService');
const { getRadiusDisplay } = require('../utils/radius');

const prisma = new PrismaClient();

/**
 * Search centers within radius
 *
 * Sprint 1: 지도 기반 센터 검색
 * Day 1: Backend API Implementation
 *
 * @route GET /api/v1/centers?lat=37.5665&lng=126.9780&radius=5&offset=0&limit=50
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.lat - User's latitude (required)
 * @param {string} req.query.lng - User's longitude (required)
 * @param {string} req.query.radius - Search radius ('10', '30', '50', '100', 'all') (optional, default: '5')
 * @param {string} req.query.offset - Pagination offset (optional, default: 0)
 * @param {string} req.query.limit - Results per page (optional, default: 50)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} Centers within radius with operating status, pagination info
 *
 * @example
 * GET /api/v1/centers?lat=37.5665&lng=126.9780&radius=10&offset=0&limit=50
 */
const searchCenters = async (req, res, next) => {
  try {
    const { lat, lng, radius, offset, limit } = req.query;

    // Get centers within radius (service handles caching and distance calculation)
    const result = await getCentersWithinRadius(
      parseFloat(lat),
      parseFloat(lng),
      radius || '50',
      offset ? parseInt(offset, 10) : 0,
      limit ? parseInt(limit, 10) : 50,
    );

    // Send success response with Sprint 2 enhanced format
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

/**
 * Get center detail by ID
 *
 * @route GET /api/v1/centers/:id
 * @param {Object} req - Express request object
 * @param {Object} req.params - Path parameters
 * @param {string} req.params.id - Center ID
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.user_lat - User's latitude (optional)
 * @param {string} req.query.user_lng - User's longitude (optional)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} Center detail information
 *
 * @example
 * // Without user location
 * GET /api/v1/centers/1
 *
 * // With user location for distance calculation
 * GET /api/v1/centers/1?user_lat=37.5665&user_lng=126.9780
 */
const getCenterDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_lat, user_lng } = req.query;

    // Validate center ID
    if (!isPositiveInteger(id)) {
      throw createValidationError('Invalid center ID. Must be a positive integer.', 'id');
    }

    const centerId = parseInt(id, 10);

    // Validate user location parameters
    let userLat = null;
    let userLng = null;
    let includeDistance = false;

    if (user_lat || user_lng) {
      // Both parameters must be provided together
      if (!user_lat || !user_lng) {
        throw createValidationError(
          'Both user_lat and user_lng must be provided together.',
          user_lat ? 'user_lng' : 'user_lat',
        );
      }

      // Validate latitude
      if (!isValidLatitude(user_lat)) {
        throw createValidationError('Invalid latitude. Must be between -90 and 90.', 'user_lat');
      }

      // Validate longitude
      if (!isValidLongitude(user_lng)) {
        throw createValidationError('Invalid longitude. Must be between -180 and 180.', 'user_lng');
      }

      userLat = parseFloat(user_lat);
      userLng = parseFloat(user_lng);
      includeDistance = true;
    }

    // Query center detail from v_center_detail view
    let centerDetail;

    if (includeDistance) {
      // Query with distance calculation using MySQL function
      const result = await prisma.$queryRaw`
        SELECT
          id,
          center_name,
          center_type,
          phone_number,
          road_address,
          jibun_address,
          latitude,
          longitude,
          business_content,
          avg_rating,
          review_count,
          favorite_count,
          view_count,
          calculate_distance(${userLat}, ${userLng}, latitude, longitude) as distance
        FROM v_center_detail
        WHERE id = ${centerId}
        LIMIT 1
      `;

      centerDetail = result[0] || null;
    } else {
      // Query without distance calculation
      const result = await prisma.$queryRaw`
        SELECT
          id,
          center_name,
          center_type,
          phone_number,
          road_address,
          jibun_address,
          latitude,
          longitude,
          business_content,
          avg_rating,
          review_count,
          favorite_count,
          view_count
        FROM v_center_detail
        WHERE id = ${centerId}
        LIMIT 1
      `;

      centerDetail = result[0] || null;
    }

    // Get rating distribution
    const ratingDistribution = await prisma.$queryRaw`
      SELECT
        rating,
        COUNT(*) as count
      FROM reviews
      WHERE center_id = ${centerId}
      GROUP BY rating
    `;

    // Convert rating distribution array to object
    const ratingDistObj = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(item => {
      ratingDistObj[Number(item.rating)] = Number(item.count);
    });

    // Check if center exists
    if (!centerDetail) {
      throw createNotFoundError(`Center with ID ${centerId} not found.`);
    }

    // Increment view count asynchronously (don't wait for it)
    prisma.center
      .update({
        where: { id: BigInt(centerId) },
        data: { viewCount: { increment: 1 } },
      })
      .catch(err => {
        // Log error but don't fail the request
        console.error('Failed to increment view count:', err);
      });

    // Transform database result to API response format
    const response = {
      id: Number(centerDetail.id),
      center_name: centerDetail.center_name,
      center_type: centerDetail.center_type,
      contact: {
        phone: centerDetail.phone_number,
        road_address: centerDetail.road_address,
        jibun_address: centerDetail.jibun_address,
      },
      location: {
        latitude: parseFloat(centerDetail.latitude),
        longitude: parseFloat(centerDetail.longitude),
      },
      business_content: centerDetail.business_content,
      stats: {
        avg_rating: parseFloat(centerDetail.avg_rating),
        review_count: Number(centerDetail.review_count),
        favorite_count: Number(centerDetail.favorite_count),
        view_count: Number(centerDetail.view_count),
        rating_distribution: ratingDistObj,
      },
    };

    // Add distance if calculated
    if (includeDistance && centerDetail.distance !== null) {
      response.location.distance = parseFloat(Number(centerDetail.distance).toFixed(2));
    }

    // Send success response
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

/**
 * Get center staff information
 *
 * @route GET /api/v1/centers/:id/staff
 * @param {Object} req - Express request object
 * @param {Object} req.params - Path parameters
 * @param {string} req.params.id - Center ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} Staff information with total count
 *
 * @example
 * GET /api/v1/centers/1/staff
 */
const getCenterStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate center ID
    if (!isPositiveInteger(id)) {
      throw createValidationError('Invalid center ID. Must be a positive integer.', 'id');
    }

    const centerId = parseInt(id, 10);

    // Check if center exists
    const center = await prisma.center.findUnique({
      where: { id: BigInt(centerId) },
      select: { id: true },
    });

    if (!center) {
      throw createNotFoundError(`Center with ID ${centerId} not found.`);
    }

    // Get staff data using service
    const { getCenterStaff: getStaffService } = require('../services/staffService');
    const staffData = await getStaffService(centerId);

    // Send success response
    res.status(200).json({
      success: true,
      data: staffData,
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

/**
 * Get center programs with optional filters and pagination
 *
 * @route GET /api/v1/centers/:id/programs
 * @param {Object} req - Express request object
 * @param {Object} req.params - Path parameters
 * @param {string} req.params.id - Center ID
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.target_group - Target group filter (optional)
 * @param {string} req.query.is_online - Online availability filter (optional)
 * @param {string} req.query.is_free - Free program filter (optional)
 * @param {string} req.query.page - Page number (optional, default: 1)
 * @param {string} req.query.limit - Items per page (optional, default: 10)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Object} Program list with pagination
 *
 * @example
 * GET /api/v1/centers/1/programs?is_online=true&page=1&limit=10
 */
const getCenterPrograms = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { target_group, is_online, is_free, page, limit } = req.query;

    // Validate center ID
    if (!isPositiveInteger(id)) {
      throw createValidationError('Invalid center ID. Must be a positive integer.', 'id');
    }

    const centerId = parseInt(id, 10);

    // Check if center exists
    const center = await prisma.center.findUnique({
      where: { id: BigInt(centerId) },
      select: { id: true },
    });

    if (!center) {
      throw createNotFoundError(`Center with ID ${centerId} not found.`);
    }

    // Parse filters
    const filters = {};
    if (target_group) {
      filters.target_group = target_group;
    }
    if (is_online !== undefined) {
      filters.is_online = is_online === 'true';
    }
    if (is_free !== undefined) {
      filters.is_free = is_free === 'true';
    }

    // Parse pagination
    const pagination = {};
    if (page) {
      const pageNum = parseInt(page, 10);
      if (pageNum > 0) {
        pagination.page = pageNum;
      }
    }
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (limitNum > 0 && limitNum <= 100) {
        pagination.limit = limitNum;
      }
    }

    // Get programs data using service
    const { getCenterPrograms: getProgramsService } = require('../services/programService');
    const programsData = await getProgramsService(centerId, filters, pagination);

    // Send success response
    res.status(200).json({
      success: true,
      data: programsData,
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

module.exports = {
  searchCenters,
  getCenterDetail,
  getCenterStaff,
  getCenterPrograms,
};

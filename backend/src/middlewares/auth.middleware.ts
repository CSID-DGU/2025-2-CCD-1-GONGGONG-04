/**
 * Authentication Middleware
 *
 * Validates JWT tokens and attaches user information to request.
 * For MVP, this is a simplified implementation.
 *
 * @module middlewares/auth
 */

import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';

/**
 * JWT authentication middleware
 *
 * Verifies JWT token from Authorization header.
 * For MVP: Simplified token validation (production should use proper JWT library like jsonwebtoken).
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 *
 * @throws UnauthorizedError if token is missing or invalid
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('인증 토큰이 필요합니다.');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('인증 토큰이 필요합니다.');
    }

    // 2. Verify token (MVP: simplified validation)
    // TODO: In production, use proper JWT verification with jsonwebtoken library
    // Example: jwt.verify(token, process.env.JWT_SECRET)

    // For MVP: Extract user ID from token (assuming format: "user_{id}")
    // In production, this should decode and verify the JWT signature
    const userId = extractUserIdFromToken(token);

    if (!userId) {
      throw new UnauthorizedError('유효하지 않은 토큰입니다.');
    }

    // 3. Attach user to request
    (req as any).user = {
      id: userId,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('유효하지 않은 토큰입니다.'));
    }
  }
}

/**
 * Extract user ID from token (MVP implementation)
 *
 * @param token - JWT token string
 * @returns User ID or null
 */
function extractUserIdFromToken(token: string): number | null {
  try {
    // MVP: Simplified token parsing
    // Format: "user_{id}" (e.g., "user_123")
    // In production, use jwt.verify() to decode and validate

    if (token.startsWith('user_')) {
      const userId = parseInt(token.substring(5), 10);
      return isNaN(userId) ? null : userId;
    }

    // If token doesn't match expected format, attempt to parse as number
    // This is for testing convenience only
    const userId = parseInt(token, 10);
    return isNaN(userId) ? null : userId;
  } catch {
    return null;
  }
}

// CommonJS export for compatibility
module.exports = {
  authMiddleware,
};

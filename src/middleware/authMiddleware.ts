/**
 * Authentication Middleware
 * Protects routes and verifies JWT tokens
 */

import { Request, Response, NextFunction } from 'express';
import { extractToken, verifyToken, TokenPayload } from '../utils/jwtUtils';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header and validates it
 */
export function verifyTokenMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided. Use Authorization: Bearer <token>',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    const message = error.message || 'Token verification failed';
    const statusCode = message.includes('expired') ? 401 : 401;

    return res.status(statusCode).json({
      error: 'Unauthorized',
      message,
    });
  }
}

/**
 * Middleware to verify user has specific role
 */
export function requireRole(role: string | string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const requiredRoles = Array.isArray(role) ? role : [role];
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This resource requires one of these roles: ${requiredRoles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Optional authentication - continues even without token
 * Useful for routes that have different behavior for authenticated vs non-authenticated users
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }

  next();
}

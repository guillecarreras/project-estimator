/**
 * JWT Utility Functions
 * Handles token generation and verification
 */

import jwt from 'jsonwebtoken';
import { User, UserRole } from '../database/entities/User';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY: string = process.env.TOKEN_EXPIRY || '24h';

/**
 * Generate a JWT token from a user
 */
export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: TOKEN_EXPIRY,
    algorithm: 'HS256',
  } as any);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as TokenPayload;

    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Decode token without verification (for refresh scenarios)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

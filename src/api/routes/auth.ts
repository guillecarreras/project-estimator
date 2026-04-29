/**
 * Authentication Routes
 * Handles login, logout, refresh, and user info endpoints
 */

import { Router, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../../database/entities/User';
import { generateToken, verifyToken, TokenPayload } from '../../utils/jwtUtils';
import { verifyTokenMiddleware, AuthRequest } from '../../middleware/authMiddleware';
import { AppError } from '../../middleware/errorHandler';

export function createAuthRoutes(dataSource: DataSource): Router {
  const router = Router();
  const userRepository = dataSource.getRepository(User);

  /**
   * POST /api/auth/login
   * Authenticate user with username/password and return JWT token
   */
  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        throw new AppError('Username and password are required', 400);
      }

      // Find user
      const user = await userRepository.findOne({
        where: { username },
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid credentials', 401);
      }

      // Verify password
      const isPasswordValid = verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/auth/logout
   * Invalidate the current token
   * Note: In a production system, maintain a token blacklist in Redis
   */
  router.post('/logout', verifyTokenMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      // In a real implementation, add token to blacklist/Redis
      // For now, just confirm logout
      res.json({
        message: 'Logout successful. Token is now invalid.',
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/auth/refresh
   * Generate a new token using an existing valid token
   */
  router.post('/refresh', verifyTokenMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      // Fetch fresh user data to ensure it's still valid and active
      const user = await userRepository.findOne({
        where: { id: req.user.userId },
      });

      if (!user || !user.isActive) {
        throw new AppError('User no longer exists or is inactive', 401);
      }

      // Generate new token
      const token = generateToken(user);

      res.json({
        message: 'Token refreshed successfully',
        token,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user information
   */
  router.get('/me', verifyTokenMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      // Fetch latest user data
      const user = await userRepository.findOne({
        where: { id: req.user.userId },
      });

      if (!user || !user.isActive) {
        throw new AppError('User not found or is inactive', 404);
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/auth/register
   * Register a new user (admin only in production)
   */
  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password, role } = req.body;

      // Validate input
      if (!username || !email || !password) {
        throw new AppError('Username, email, and password are required', 400);
      }

      if (username.length < 3) {
        throw new AppError('Username must be at least 3 characters', 400);
      }

      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
      }

      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: { username },
      });

      if (existingUser) {
        throw new AppError('Username already exists', 409);
      }

      const existingEmail = await userRepository.findOne({
        where: { email },
      });

      if (existingEmail) {
        throw new AppError('Email already exists', 409);
      }

      // Hash password
      const passwordHash = hashPassword(password);

      // Create new user
      const newUser = userRepository.create({
        username,
        email,
        passwordHash,
        role: role === 'admin' ? 'admin' : 'user',
        isActive: true,
      });

      const savedUser = await userRepository.save(newUser);

      // Generate token
      const token = generateToken(savedUser);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: savedUser.id,
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

/**
 * Hash password using crypto
 * Note: In production, use bcrypt for better security
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + process.env.PASSWORD_SALT || 'salt').digest('hex');
}

/**
 * Verify password against hash
 */
function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

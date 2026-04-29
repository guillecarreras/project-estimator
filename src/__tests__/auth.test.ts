/**
 * Authentication Tests
 * Tests for JWT token generation, verification, and auth endpoints
 */

import request from 'supertest';
import app from '../api/server';
import { generateToken, verifyToken, extractToken, TokenPayload } from '../utils/jwtUtils';
import { User } from '../database/entities/User';
import * as crypto from 'crypto';

describe('JWT Utilities', () => {
  const mockUser: User = {
    id: 'test-user-123',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hash',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tokenInvalidatedAt: 0,
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should include user data in token payload', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);

      expect(payload.userId).toBe(mockUser.id);
      expect(payload.username).toBe(mockUser.username);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it('should have expiration time', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);

      expect(payload.exp).toBeTruthy();
      expect(payload.iat).toBeTruthy();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);

      expect(payload).toBeTruthy();
      expect(payload.userId).toBe(mockUser.id);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow('Invalid token');
    });

    it('should throw error for tampered token', () => {
      const token = generateToken(mockUser);
      const tamperedToken = token.slice(0, -10) + 'tampered';

      expect(() => {
        verifyToken(tamperedToken);
      }).toThrow();
    });
  });

  describe('extractToken', () => {
    it('should extract token from Bearer header', () => {
      const token = generateToken(mockUser);
      const authHeader = `Bearer ${token}`;

      const extracted = extractToken(authHeader);
      expect(extracted).toBe(token);
    });

    it('should return null for missing header', () => {
      const extracted = extractToken(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for invalid format', () => {
      const extracted = extractToken('InvalidFormat token');
      expect(extracted).toBeNull();
    });

    it('should return null for missing Bearer prefix', () => {
      const extracted = extractToken('token-without-bearer');
      expect(extracted).toBeNull();
    });
  });
});

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should return 400 if username or password missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'admin',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'nonexistent',
        password: 'wrongpass',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return 401 without Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'newuser',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it('should return 400 if username too short', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('at least 3 characters');
    });

    it('should return 400 if password too short', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'newuser',
        email: 'test@example.com',
        password: 'short',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('at least 6 characters');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).post('/api/auth/refresh');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });
  });
});

describe('Protected Routes', () => {
  it('should return 401 for protected route without token', async () => {
    const response = await request(app).get('/api/projects');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  it('should return 401 for protected route with invalid token', async () => {
    const response = await request(app)
      .get('/api/projects')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(response.status).toBe(401);
  });

  it('should return 401 if Authorization header malformed', async () => {
    const response = await request(app)
      .get('/api/projects')
      .set('Authorization', 'InvalidFormat token');

    expect(response.status).toBe(401);
  });
});

describe('Error Handling', () => {
  it('should handle missing Authorization header gracefully', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('No token provided');
  });

  it('should return helpful error message for invalid token format', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'just-a-string');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  it('should handle database errors gracefully', async () => {
    // Try to access a protected route
    const response = await request(app).get('/api/estimations');

    // Should return 401 for auth error, not 500 for db error
    expect(response.status).toBe(401);
  });
});

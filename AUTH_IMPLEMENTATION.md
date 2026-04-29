# JWT Authentication Implementation

## Overview

The Project Estimator API now includes comprehensive JWT (JSON Web Token) authentication. All API endpoints (except auth endpoints) require a valid JWT token passed in the `Authorization` header.

## Features

- **JWT Token Generation**: Tokens with 24-hour expiration (configurable)
- **Token Verification**: Validates token signature and expiration
- **Protected Routes**: All API endpoints require authentication
- **Role-Based Access**: Support for admin and user roles
- **Token Refresh**: Ability to refresh expired tokens
- **Logout Support**: Token invalidation on logout
- **Demo User**: Pre-configured admin user for testing

## Configuration

### Environment Variables

Add to your `.env` file:

```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
TOKEN_EXPIRY=24h
PASSWORD_SALT=your-password-salt-change-in-production
```

### Default Demo User

For testing, a default admin user is seeded on database initialization:

- **Username**: `admin`
- **Password**: `demo123`
- **Email**: `admin@example.com`
- **Role**: `admin`

## Authentication Flow

### 1. Login

Request:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "demo123"
  }'
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### 2. Use Token in Protected Requests

Include the token in the `Authorization` header:

```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Refresh Token

Before token expires, refresh it:

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer <current-token>"
```

Response includes new token:
```json
{
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Get Current User

Retrieve authenticated user info:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

Response:
```json
{
  "id": "user-uuid",
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-04-29T20:30:00.000Z",
  "updatedAt": "2025-04-29T20:30:00.000Z"
}
```

### 5. Logout

Invalidate the current token:

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-------------:|---|
| POST | `/api/auth/login` | No | Authenticate with username/password |
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/refresh` | Yes | Refresh expired token |
| POST | `/api/auth/logout` | Yes | Invalidate current token |
| GET | `/api/auth/me` | Yes | Get current user info |

### Protected Routes

The following routes require a valid JWT token:

| Method | Endpoint | Description |
|--------|----------|---|
| POST/GET/PUT/DELETE | `/api/projects/:id` | Project management |
| POST/GET/PUT/DELETE | `/api/estimations/:id` | Estimation management |
| POST/GET/DELETE | `/api/snapshots/:id` | Snapshot management |
| GET | `/api/analytics/:estimationId` | Analytics data |

## Architecture

### Directory Structure

```
src/
├── database/
│   ├── entities/
│   │   └── User.ts                 # User entity with roles
│   └── migrations/
│       └── 1714185600002-AddUsersTable.ts   # Migration to create users table
├── middleware/
│   ├── authMiddleware.ts           # Auth middleware: verifyToken, requireRole, optionalAuth
│   └── errorHandler.ts             # Error handling
├── utils/
│   └── jwtUtils.ts                 # JWT utilities: generateToken, verifyToken, extractToken
├── api/
│   └── routes/
│       └── auth.ts                 # Auth endpoints
└── __tests__/
    └── auth.test.ts                # Authentication tests
```

### Key Files

#### 1. **User Entity** (`src/database/entities/User.ts`)
- Stores user credentials and role information
- Includes password hash and account status
- Supports role-based access control

#### 2. **JWT Utilities** (`src/utils/jwtUtils.ts`)
- `generateToken(user)`: Create JWT from user object
- `verifyToken(token)`: Validate and decode JWT
- `extractToken(header)`: Parse Authorization header
- `decodeToken(token)`: Decode without verification

#### 3. **Auth Middleware** (`src/middleware/authMiddleware.ts`)
- `verifyTokenMiddleware`: Validates JWT and attaches user to request
- `requireRole(role)`: Check user role before allowing access
- `optionalAuth`: Allow both authenticated and unauthenticated requests

#### 4. **Auth Routes** (`src/api/routes/auth.ts`)
- `POST /api/auth/login`: Authentication endpoint
- `POST /api/auth/register`: User registration
- `POST /api/auth/refresh`: Token refresh
- `POST /api/auth/logout`: Token invalidation
- `GET /api/auth/me`: Current user info

## Security Considerations

### Current Implementation

1. **JWT Secret**: Uses environment variable `JWT_SECRET` (must be set in production)
2. **Token Expiration**: 24 hours by default (configurable via `TOKEN_EXPIRY`)
3. **Password Hashing**: SHA-256 with salt (for demo purposes)
4. **Role-Based Access**: Support for admin and user roles
5. **CORS Headers**: Authorization header is allowed in CORS configuration

### Production Recommendations

1. **Use bcrypt for passwords**: Replace SHA-256 hashing with bcrypt
   ```typescript
   import bcrypt from 'bcrypt';
   const hash = await bcrypt.hash(password, 10);
   const isValid = await bcrypt.compare(password, hash);
   ```

2. **Token Blacklist**: Maintain Redis-backed blacklist for logout
   ```typescript
   // On logout, add token to Redis blacklist
   await redis.setex(`blacklist:${token}`, tokenExpiry, '1');
   ```

3. **Rotate Secrets**: Implement JWT secret rotation strategy

4. **HTTPS Only**: Use HTTPS in production (set secure cookies, etc.)

5. **Rate Limiting**: Add rate limiting to auth endpoints
   ```typescript
   app.use('/api/auth/login', rateLimiter(5, 15 * 60 * 1000)); // 5 attempts per 15 min
   ```

6. **Two-Factor Authentication**: Add optional 2FA for admin accounts

7. **Audit Logging**: Log all authentication attempts

## Testing

Run the authentication tests:

```bash
npm test -- auth.test.ts
```

Tests cover:
- Token generation and verification
- Token extraction from headers
- Login and logout flows
- Token refresh
- Current user retrieval
- Protected route access
- Error handling and validation

## Usage Examples

### Example 1: Complete Authentication Flow

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"demo123"}' | jq -r '.token')

# 2. Use token in API call
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN"

# 3. Refresh token before expiration
NEW_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer $TOKEN" | jq -r '.token')

# 4. Get current user info
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $NEW_TOKEN"

# 5. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $NEW_TOKEN"
```

### Example 2: Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepassword123",
    "role": "user"
  }'
```

### Example 3: Programmatic Usage

```typescript
import { generateToken, verifyToken } from './utils/jwtUtils';
import { User } from './database/entities/User';

// Generate token
const user: User = await userRepository.findOne({ where: { id: userId } });
const token = generateToken(user);

// Verify token
try {
  const payload = verifyToken(token);
  console.log(payload.userId, payload.role);
} catch (error) {
  console.log('Token invalid or expired');
}
```

## Troubleshooting

### "No token provided" error
- **Issue**: Missing Authorization header
- **Solution**: Include `Authorization: Bearer <token>` in request header

### "Invalid token" error
- **Issue**: Token is malformed or corrupted
- **Solution**: Generate new token by logging in again

### "Token has expired" error
- **Issue**: Token has exceeded expiration time
- **Solution**: Use `/api/auth/refresh` endpoint to get new token

### "Invalid credentials" error
- **Issue**: Username/password combination is incorrect
- **Solution**: Verify credentials are correct, use demo user for testing

### CORS errors with Authorization header
- **Issue**: CORS not configured to allow Authorization header
- **Solution**: Check server.ts CORS configuration (already set to allow)

## Migration from No Auth to JWT Auth

If upgrading existing API:

1. **Run migration**: Database migration creates users table and seeds demo user
2. **Update environment**: Add JWT_SECRET to .env
3. **Clients need update**: All API calls must include Authorization header
4. **Backward compatibility**: Consider temporary open endpoints for migration period

## Next Steps

- [ ] Implement password reset flow
- [ ] Add email verification for registration
- [ ] Implement 2FA for admin users
- [ ] Add OAuth2/SSO integration (Google, GitHub, etc.)
- [ ] Create token blacklist in Redis for better logout handling
- [ ] Implement API key authentication for service-to-service calls
- [ ] Add more granular permission system

## References

- [JWT.io](https://jwt.io/) - JWT specification and tools
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken) - JWT library documentation
- [Express.js Middleware](https://expressjs.com/en/guide/using-middleware.html) - Middleware guide
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

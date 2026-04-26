# Database Persistence Setup Guide

## Overview

This guide covers setting up and using the database persistence layer for the Project Estimator application.

## File Structure

```
src/
├── database/
│   ├── data-source.ts                    # TypeORM DataSource configuration
│   ├── entities/
│   │   ├── Project.ts                    # Project entity
│   │   ├── Estimation.ts                 # Estimation entity
│   │   └── Snapshot.ts                   # Snapshot entity
│   ├── repositories/
│   │   ├── ProjectRepository.ts          # Project data access
│   │   ├── EstimationRepository.ts       # Estimation data access
│   │   └── SnapshotRepository.ts         # Snapshot data access
│   └── migrations/
│       ├── 1714185600000-InitialSchema.ts
│       └── 1714185600001-SeedData.ts
├── api/
│   ├── server.ts                         # Express server with routes
│   └── routes/
│       ├── estimations.ts                # POST /api/estimations, GET, PUT, DELETE
│       ├── snapshots.ts                  # POST /api/snapshots, GET, DELETE
│       └── analytics.ts                  # GET /api/analytics (variance analysis)
└── __tests__/
    ├── setup.ts                          # Test database setup utilities
    ├── repositories/
    │   ├── ProjectRepository.test.ts
    │   ├── EstimationRepository.test.ts
    │   └── SnapshotRepository.test.ts
    └── api/
        ├── estimations.test.ts
        ├── snapshots.test.ts
        └── analytics.test.ts
```

## Prerequisites

- PostgreSQL 15+
- Node.js 18+
- npm or yarn

## Installation

```bash
npm install
```

## Database Setup

### Option 1: Docker (Recommended)

Start PostgreSQL container:

```bash
npm run db:start
```

This creates a PostgreSQL container with:
- Host: localhost
- Port: 5432
- Username: postgres
- Password: password
- Database: estimator

Stop the container:

```bash
npm run db:stop
```

### Option 2: Manual PostgreSQL Setup

Create database:

```sql
CREATE DATABASE estimator;
CREATE DATABASE estimator_test;
```

## Running Migrations

```bash
npm run build
npm run migration:run
```

This will:
1. Create the `projects`, `estimations`, and `snapshots` tables
2. Seed 3 example projects with estimations and snapshots

## Database Schema

### projects
- `id` (UUID, PK)
- `name` (VARCHAR)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### estimations
- `id` (UUID, PK)
- `projectId` (UUID, FK)
- `backlogJson` (JSONB) - Array of BacklogItem
- `configJson` (JSONB) - EstimationConfig object
- `resultJson` (JSONB) - EstimationResult object
- `createdAt` (TIMESTAMP)

### snapshots
- `id` (UUID, PK)
- `estimationId` (UUID, FK)
- `actualHours` (NUMERIC)
- `actualCost` (NUMERIC)
- `createdAt` (TIMESTAMP)

## Environment Variables

Create a `.env` file:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=estimator
NODE_ENV=development
PORT=3000
```

For testing, use:

```
DB_NAME=estimator_test
```

## API Endpoints

### Estimations

**Create Estimation**
```
POST /api/estimations
Content-Type: application/json

{
  "projectId": "uuid",
  "backlogJson": [...],
  "configJson": {...},
  "resultJson": {...}
}
```

**Get Estimation**
```
GET /api/estimations/:id
```

**List Estimations**
```
GET /api/estimations
GET /api/estimations?projectId=uuid
```

**Update Estimation**
```
PUT /api/estimations/:id
{
  "backlogJson": [...],
  "configJson": {...},
  "resultJson": {...}
}
```

**Delete Estimation**
```
DELETE /api/estimations/:id
```

### Snapshots

**Create Snapshot** (actual hours/cost update)
```
POST /api/snapshots
{
  "estimationId": "uuid",
  "actualHours": 120,
  "actualCost": 15000
}
```

**Get Snapshot**
```
GET /api/snapshots/:id
```

**List Snapshots**
```
GET /api/snapshots
GET /api/snapshots?estimationId=uuid
```

**Delete Snapshot**
```
DELETE /api/snapshots/:id
```

### Analytics

**Get All Analytics**
```
GET /api/analytics
```

Returns variance analysis for all estimations with snapshots.

Response:
```json
[
  {
    "estimationId": "uuid",
    "estimatedHours": 120,
    "estimatedCost": 12000,
    "actualHours": 150,
    "actualCost": 18000,
    "hoursVariance": 30,
    "hoursVariancePercent": 25,
    "costVariance": 6000,
    "costVariancePercent": 50,
    "snapshotCount": 1
  }
]
```

**Get Estimation Analytics**
```
GET /api/analytics/:estimationId
```

Returns time-series variance data for all snapshots of an estimation.

## Running the Application

### Development

```bash
npm run api:dev
```

Server runs on `http://localhost:3000`

### Production

```bash
npm run build
npm run start
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Test Coverage

Tests cover:

1. **Repository Tests**
   - CRUD operations for all entities
   - Query methods (findById, findAll, etc.)
   - Relationship handling

2. **API Tests**
   - All endpoint methods (POST, GET, PUT, DELETE)
   - Status codes and error handling
   - Request validation
   - Response data structure

3. **Analytics Tests**
   - Variance calculations
   - Time-series data
   - Edge cases

## Example Usage

### 1. Create a Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project"}'
```

### 2. Create an Estimation

```bash
curl -X POST http://localhost:3000/api/estimations \
  -H "Content-Type: application/json" \
  -d '{
    "projectId":"<project-id>",
    "backlogJson":[{"epic":"Feature","feature":"Sub","tshirt_size":"M","roles":["Fullstack"]}],
    "configJson":{"hoursPerDay":8,"sprintLengthWeeks":2,...},
    "resultJson":{...}
  }'
```

### 3. Record Actual Hours/Cost

```bash
curl -X POST http://localhost:3000/api/snapshots \
  -H "Content-Type: application/json" \
  -d '{
    "estimationId":"<estimation-id>",
    "actualHours":150,
    "actualCost":18000
  }'
```

### 4. View Analytics

```bash
curl http://localhost:3000/api/analytics
curl http://localhost:3000/api/analytics/<estimation-id>
```

## Troubleshooting

### Database Connection Error

1. Ensure PostgreSQL is running
2. Check environment variables
3. Verify credentials in `.env`

### Migration Fails

1. Check database exists
2. Run `npm run build` first
3. Ensure TypeORM CLI is installed

### Tests Fail

1. Ensure test database exists: `CREATE DATABASE estimator_test;`
2. Check `NODE_ENV=test` is set
3. Database must be empty before tests

## Architecture Notes

- **Repository Pattern**: Each entity has a dedicated repository for data access
- **JSONB Storage**: Backlog, config, and results stored as JSON for flexibility
- **Cascade Delete**: Deleting projects cascades to estimations and snapshots
- **Type Safety**: Full TypeScript typing for all entities and API responses
- **Migrations**: Automatic schema creation and seeding on startup

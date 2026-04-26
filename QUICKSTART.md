# Quick Start - Database Persistence

## 1. Install Dependencies
```bash
npm install
```

## 2. Start PostgreSQL
```bash
npm run db:start
```

Or manually:
```bash
psql -U postgres -c "CREATE DATABASE estimator;"
psql -U postgres -c "CREATE DATABASE estimator_test;"
```

## 3. Build & Run Migrations
```bash
npm run build
npm run migration:run
```

This automatically:
- Creates tables (projects, estimations, snapshots)
- Creates indexes and foreign keys
- Seeds 3 example projects with data

## 4. Start API Server
```bash
npm run api:dev
```

Server runs on http://localhost:3000

## 5. Test Endpoints

### Create Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project"}'
```

### List Projects
```bash
curl http://localhost:3000/api/projects
```

### Create Estimation (use projectId from above)
```bash
curl -X POST http://localhost:3000/api/estimations \
  -H "Content-Type: application/json" \
  -d '{
    "projectId":"<uuid>",
    "backlogJson":[{"epic":"E1","feature":"F1","tshirt_size":"M","roles":["Fullstack"]}],
    "configJson":{"hoursPerDay":8,"sprintLengthWeeks":2,"unitTestingPercentage":20,"bugFixingPercentage":15,"documentationPercentage":10,"contingencyPercentage":20,"startDate":"2024-05-01"},
    "resultJson":{"backlogItemCount":1,"totalBaseHours":100,"roleEfforts":[{"role":"Fullstack","baseHours":100,"withMultipliers":120,"totalHours":120,"fte":0.75,"cost":12000}],"teamComposition":[{"role":"Fullstack","count":1,"allocationPercentage":100}],"totalCost":12000,"durationDays":15,"durationWeeks":2.14,"durationSprints":1.07,"startDate":"2024-05-01","endDate":"2024-05-16","workingDays":11,"assumptions":[],"ganttData":[]}
  }'
```

### Record Actual Hours/Cost (use estimationId from above)
```bash
curl -X POST http://localhost:3000/api/snapshots \
  -H "Content-Type: application/json" \
  -d '{"estimationId":"<uuid>","actualHours":150,"actualCost":18000}'
```

### View Analytics
```bash
curl http://localhost:3000/api/analytics
curl http://localhost:3000/api/analytics/<estimationId>
```

## 6. Run Tests
```bash
npm test
```

## 7. Stop PostgreSQL
```bash
npm run db:stop
```

## Files Created

**Database Layer:**
- `src/database/data-source.ts` - TypeORM config
- `src/database/entities/` - Project, Estimation, Snapshot models
- `src/database/repositories/` - CRUD operations
- `src/database/migrations/` - Schema creation & seeding

**API Layer:**
- `src/api/server.ts` - Express server
- `src/api/routes/` - endpoints (projects, estimations, snapshots, analytics)

**Tests:**
- `src/__tests__/repositories/` - Repository unit tests
- `src/__tests__/api/` - API integration tests

**Config:**
- `package.json` - dependencies
- `jest.config.js` - test runner
- `tsconfig.json` - TypeScript config
- `.env.example` - environment variables

## API Reference

See `DATABASE_SETUP.md` for full documentation.

### Quick Reference
- **Projects**: `POST /api/projects`, `GET /api/projects`, `GET /api/projects/:id`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`
- **Estimations**: `POST /api/estimations`, `GET /api/estimations`, `GET /api/estimations/:id`, `PUT /api/estimations/:id`, `DELETE /api/estimations/:id`
- **Snapshots**: `POST /api/snapshots`, `GET /api/snapshots`, `GET /api/snapshots/:id`, `DELETE /api/snapshots/:id`
- **Analytics**: `GET /api/analytics`, `GET /api/analytics/:estimationId`

## Troubleshooting

**Port 5432 in use**: 
```bash
npm run db:stop
```

**Connection refused**:
```bash
npm run db:start
sleep 5
npm run migration:run
```

**Tests fail**:
```bash
psql -U postgres -c "DROP DATABASE estimator_test;"
psql -U postgres -c "CREATE DATABASE estimator_test;"
npm test
```

**Type errors**:
```bash
npm run build
```

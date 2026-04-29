# REST API Quick Reference

## Quick Start

```bash
npm run api:dev
# Server runs on http://localhost:3000
```

## Projects

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| POST | `/api/projects` | 201 | Create new project |
| GET | `/api/projects` | 200 | List all projects |
| GET | `/api/projects/:id` | 200/404 | Get project by ID |
| PUT | `/api/projects/:id` | 200/404/400 | Update project |
| DELETE | `/api/projects/:id` | 200/404 | Delete project |

### Create Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project"}'
```

## Estimations

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| POST | `/api/estimations` | 201 | Create new estimation |
| GET | `/api/estimations` | 200 | List all estimations |
| GET | `/api/estimations?projectId=:id` | 200 | Filter by project |
| GET | `/api/estimations/:id` | 200/404 | Get estimation by ID |
| PUT | `/api/estimations/:id` | 200/404/400 | Update estimation |
| DELETE | `/api/estimations/:id` | 200/404 | Delete estimation |

### Create Estimation
```bash
curl -X POST http://localhost:3000/api/estimations \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-id",
    "backlogJson": [{"epic": "Auth", "feature": "Login", "tshirt_size": "M", "roles": ["Fullstack"]}],
    "configJson": {"hoursPerDay": 8, "sprintLengthWeeks": 2, ...},
    "resultJson": {...}
  }'
```

## Snapshots

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| POST | `/api/snapshots` | 201 | Create new snapshot |
| GET | `/api/snapshots` | 200 | List all snapshots |
| GET | `/api/snapshots?estimationId=:id` | 200 | Filter by estimation |
| GET | `/api/snapshots/:id` | 200/404 | Get snapshot by ID |
| DELETE | `/api/snapshots/:id` | 200/404 | Delete snapshot |

### Create Snapshot
```bash
curl -X POST http://localhost:3000/api/snapshots \
  -H "Content-Type: application/json" \
  -d '{
    "estimationId": "estimation-id",
    "actualHours": 45.5,
    "actualCost": 2300
  }'
```

## Analytics

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/api/analytics` | 200 | List all analytics |
| GET | `/api/analytics/:estimationId` | 200/404 | Get analytics for estimation |

## Utility

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/health` | 200 | Health check |
| GET | `/api/info` | 200 | API information |

## Response Format

### Success (200/201)
```json
{
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-04-29T10:00:00Z"
}
```

### List Response (200)
```json
{
  "data": [ ... ],
  "count": 5,
  "timestamp": "2024-04-29T10:00:00Z"
}
```

### Validation Error (400)
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "errors": { "field": "error message" },
  "timestamp": "2024-04-29T10:00:00Z"
}
```

### Not Found (404)
```json
{
  "error": "NotFoundError",
  "message": "Resource not found",
  "timestamp": "2024-04-29T10:00:00Z"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 201 | Created - New resource created successfully |
| 200 | OK - Request successful |
| 400 | Bad Request - Invalid input or validation error |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Unexpected server error |

## Common Patterns

### List with Filter
```bash
# Get estimations for a specific project
curl http://localhost:3000/api/estimations?projectId=<project-id>

# Get snapshots for a specific estimation
curl http://localhost:3000/api/snapshots?estimationId=<estimation-id>
```

### Error Handling
All errors follow the same format with `error`, `message`, and optional `errors` object.

### Timestamps
All responses include ISO 8601 formatted timestamps in UTC.

### IDs
All resource IDs are UUIDs.

## Full Examples

### Complete Workflow

```bash
# 1. Create a project
PROJECT=$(curl -s -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Website Redesign"}')
PROJECT_ID=$(echo $PROJECT | jq -r '.data.id')

# 2. Create an estimation for the project
ESTIMATION=$(curl -s -X POST http://localhost:3000/api/estimations \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"backlogJson\": [{\"epic\": \"UI\", \"feature\": \"Homepage\", \"tshirt_size\": \"L\", \"roles\": [\"Fullstack\"]}],
    \"configJson\": {\"hoursPerDay\": 8, \"sprintLengthWeeks\": 2, \"unitTestingPercentage\": 20, \"bugFixingPercentage\": 10, \"documentationPercentage\": 10, \"contingencyPercentage\": 15, \"startDate\": \"2024-04-29\"},
    \"resultJson\": {\"backlogItemCount\": 1, \"totalBaseHours\": 80, \"roleEfforts\": [{\"role\": \"Fullstack\", \"baseHours\": 80, \"withMultipliers\": 100, \"totalHours\": 100, \"fte\": 0.5, \"cost\": 5000}], \"teamComposition\": [{\"role\": \"Fullstack\", \"count\": 1, \"allocationPercentage\": 100}], \"totalCost\": 5000, \"durationDays\": 15, \"durationWeeks\": 3, \"durationSprints\": 1, \"startDate\": \"2024-04-29\", \"endDate\": \"2024-05-15\", \"workingDays\": 15, \"assumptions\": [], \"ganttData\": []}
  }")
ESTIMATION_ID=$(echo $ESTIMATION | jq -r '.data.id')

# 3. Create a snapshot with actual progress
curl -X POST http://localhost:3000/api/snapshots \
  -H "Content-Type: application/json" \
  -d "{
    \"estimationId\": \"$ESTIMATION_ID\",
    \"actualHours\": 95,
    \"actualCost\": 4750
  }"

# 4. Get analytics for the estimation
curl http://localhost:3000/api/analytics/$ESTIMATION_ID

# 5. Update the project
curl -X PUT http://localhost:3000/api/projects/$PROJECT_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Website Redesign - Updated"}'

# 6. List all estimations for the project
curl "http://localhost:3000/api/estimations?projectId=$PROJECT_ID"
```

## File Structure

```
src/api/
├── routes/
│   ├── projects.ts      # Project endpoints
│   ├── estimations.ts   # Estimation endpoints
│   ├── snapshots.ts     # Snapshot endpoints
│   ├── analytics.ts     # Analytics endpoints
│   └── ...
├── types.ts             # Request/Response DTOs
├── utils/
│   └── errorHandler.ts  # Error handling utilities
├── __tests__/
│   └── endpoints.test.ts # Integration tests
└── server.ts            # Express server setup
```

## Key Files

- **API Types**: `src/api/types.ts`
- **Error Handler**: `src/api/utils/errorHandler.ts`
- **Tests**: `src/api/__tests__/endpoints.test.ts`
- **Documentation**: `API_ENDPOINTS_TEST.md`, `API_IMPLEMENTATION_SUMMARY.md`

## Validation Rules

### Projects
- `name`: Required, non-empty string

### Estimations
- `projectId`: Required UUID (must exist)
- `backlogJson`: Required, non-empty array
- `configJson`: Required configuration object
- `resultJson`: Required result object

### Snapshots
- `estimationId`: Required UUID (must exist)
- `actualHours`: Required, non-negative number
- `actualCost`: Required, non-negative number

## Notes

- All timestamps are in UTC (ISO 8601 format)
- Cascade delete: Deleting a project deletes all its estimations and snapshots
- Filtering by non-existent parent ID returns 404
- Empty request bodies for required fields return 400
- Database persistence requires PostgreSQL connection

# API Endpoints Test Guide

This document describes all implemented REST API endpoints and how to test them.

## Server Setup

Start the API server:
```bash
npm run api:dev
```

The API will be available at `http://localhost:3000`

## Endpoints Overview

### Projects API

#### 1. Create Project
- **Method:** POST
- **Path:** `/api/projects`
- **Status Code:** 201 (Created)
- **Request Body:**
```json
{
  "name": "My Project"
}
```
- **Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "My Project",
    "createdAt": "2024-04-29T10:00:00Z",
    "updatedAt": "2024-04-29T10:00:00Z"
  },
  "message": "Project created successfully",
  "timestamp": "2024-04-29T10:00:00Z"
}
```

#### 2. List All Projects
- **Method:** GET
- **Path:** `/api/projects`
- **Status Code:** 200 (OK)
- **Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "My Project",
      "createdAt": "2024-04-29T10:00:00Z",
      "updatedAt": "2024-04-29T10:00:00Z",
      "estimations": []
    }
  ],
  "count": 1,
  "timestamp": "2024-04-29T10:00:00Z"
}
```

#### 3. Get Specific Project
- **Method:** GET
- **Path:** `/api/projects/:id`
- **Status Code:** 200 (OK), 404 (Not Found)
- **Response (Success):**
```json
{
  "data": {
    "id": "uuid",
    "name": "My Project",
    "createdAt": "2024-04-29T10:00:00Z",
    "updatedAt": "2024-04-29T10:00:00Z",
    "estimations": []
  },
  "timestamp": "2024-04-29T10:00:00Z"
}
```

#### 4. Update Project
- **Method:** PUT
- **Path:** `/api/projects/:id`
- **Status Code:** 200 (OK), 404 (Not Found), 400 (Bad Request)
- **Request Body:**
```json
{
  "name": "Updated Project Name"
}
```
- **Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Updated Project Name",
    "createdAt": "2024-04-29T10:00:00Z",
    "updatedAt": "2024-04-29T10:00:00Z"
  },
  "message": "Project updated successfully",
  "timestamp": "2024-04-29T10:00:00Z"
}
```

#### 5. Delete Project
- **Method:** DELETE
- **Path:** `/api/projects/:id`
- **Status Code:** 200 (OK), 404 (Not Found)
- **Response:**
```json
{
  "message": "Project deleted successfully",
  "timestamp": "2024-04-29T10:00:00Z"
}
```

### Estimations API

#### 6. Create Estimation
- **Method:** POST
- **Path:** `/api/estimations`
- **Status Code:** 201 (Created), 404 (Not Found), 400 (Bad Request)
- **Request Body:**
```json
{
  "projectId": "project-uuid",
  "backlogJson": [
    {
      "epic": "Auth",
      "feature": "User Login",
      "tshirt_size": "M",
      "roles": ["Fullstack"]
    }
  ],
  "configJson": {
    "hoursPerDay": 8,
    "sprintLengthWeeks": 2,
    "unitTestingPercentage": 20,
    "bugFixingPercentage": 10,
    "documentationPercentage": 10,
    "contingencyPercentage": 15,
    "startDate": "2024-04-29"
  },
  "resultJson": {
    "backlogItemCount": 1,
    "totalBaseHours": 40,
    "roleEfforts": [
      {
        "role": "Fullstack",
        "baseHours": 40,
        "withMultipliers": 50,
        "totalHours": 50,
        "fte": 0.25,
        "cost": 2500
      }
    ],
    "teamComposition": [
      {
        "role": "Fullstack",
        "count": 1,
        "allocationPercentage": 100
      }
    ],
    "totalCost": 2500,
    "durationDays": 10,
    "durationWeeks": 2,
    "durationSprints": 1,
    "startDate": "2024-04-29",
    "endDate": "2024-05-10",
    "workingDays": 10,
    "assumptions": [],
    "ganttData": []
  }
}
```
- **Response:** 201 (Created)

#### 7. List All Estimations
- **Method:** GET
- **Path:** `/api/estimations`
- **Status Code:** 200 (OK)
- **Query Parameters:**
  - `projectId` (optional): Filter by project ID
- **Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "project-uuid",
      "backlogJson": [...],
      "configJson": {...},
      "resultJson": {...},
      "createdAt": "2024-04-29T10:00:00Z"
    }
  ],
  "count": 1,
  "timestamp": "2024-04-29T10:00:00Z"
}
```

#### 8. Get Specific Estimation
- **Method:** GET
- **Path:** `/api/estimations/:id`
- **Status Code:** 200 (OK), 404 (Not Found)
- **Response:** Similar to list response for single item

#### 9. Update Estimation
- **Method:** PUT
- **Path:** `/api/estimations/:id`
- **Status Code:** 200 (OK), 404 (Not Found), 400 (Bad Request)
- **Request Body:** (at least one field required)
```json
{
  "backlogJson": [...],
  "configJson": {...},
  "resultJson": {...}
}
```
- **Response:** Updated estimation object

#### 10. Delete Estimation
- **Method:** DELETE
- **Path:** `/api/estimations/:id`
- **Status Code:** 200 (OK), 404 (Not Found)
- **Response:**
```json
{
  "message": "Estimation deleted successfully",
  "timestamp": "2024-04-29T10:00:00Z"
}
```

### Snapshots API

#### 11. Create Snapshot
- **Method:** POST
- **Path:** `/api/snapshots`
- **Status Code:** 201 (Created), 404 (Not Found), 400 (Bad Request)
- **Request Body:**
```json
{
  "estimationId": "estimation-uuid",
  "actualHours": 45.5,
  "actualCost": 2300
}
```
- **Response:** 201 (Created)

#### 12. List All Snapshots
- **Method:** GET
- **Path:** `/api/snapshots`
- **Status Code:** 200 (OK)
- **Query Parameters:**
  - `estimationId` (optional): Filter by estimation ID
- **Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "estimationId": "estimation-uuid",
      "actualHours": 45.5,
      "actualCost": 2300,
      "createdAt": "2024-04-29T10:00:00Z"
    }
  ],
  "count": 1,
  "timestamp": "2024-04-29T10:00:00Z"
}
```

#### 13. Get Specific Snapshot
- **Method:** GET
- **Path:** `/api/snapshots/:id`
- **Status Code:** 200 (OK), 404 (Not Found)
- **Response:** Single snapshot object

#### 14. Delete Snapshot
- **Method:** DELETE
- **Path:** `/api/snapshots/:id`
- **Status Code:** 200 (OK), 404 (Not Found)
- **Response:**
```json
{
  "message": "Snapshot deleted successfully",
  "timestamp": "2024-04-29T10:00:00Z"
}
```

### Analytics API

#### 15. List All Analytics
- **Method:** GET
- **Path:** `/api/analytics`
- **Status Code:** 200 (OK)
- **Response:**
```json
{
  "data": [
    {
      "estimationId": "uuid",
      "estimatedHours": 50,
      "estimatedCost": 2500,
      "actualHours": 45.5,
      "actualCost": 2300,
      "hoursVariance": -4.5,
      "hoursVariancePercent": -9,
      "costVariance": -200,
      "costVariancePercent": -8,
      "snapshotCount": 1
    }
  ],
  "count": 1,
  "timestamp": "2024-04-29T10:00:00Z"
}
```

#### 16. Get Analytics for Specific Estimation
- **Method:** GET
- **Path:** `/api/analytics/:estimationId`
- **Status Code:** 200 (OK), 404 (Not Found)
- **Response:**
```json
{
  "data": {
    "estimationId": "uuid",
    "snapshots": [
      {
        "snapshotId": "uuid",
        "createdAt": "2024-04-29T10:00:00Z",
        "estimatedHours": 50,
        "estimatedCost": 2500,
        "actualHours": 45.5,
        "actualCost": 2300,
        "hoursVariance": -4.5,
        "hoursVariancePercent": -9,
        "costVariance": -200,
        "costVariancePercent": -8
      }
    ]
  },
  "timestamp": "2024-04-29T10:00:00Z"
}
```

## Error Responses

All endpoints follow consistent error response format:

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "Project name is required and must not be empty",
  "errors": {
    "name": "name is required"
  },
  "timestamp": "2024-04-29T10:00:00Z"
}
```

### 404 Not Found
```json
{
  "error": "NotFoundError",
  "message": "Project with ID abc123 not found",
  "timestamp": "2024-04-29T10:00:00Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "InternalServerError",
  "message": "Database connection error",
  "timestamp": "2024-04-29T10:00:00Z"
}
```

## HTTP Status Codes

- **201 Created**: Successfully created a new resource (POST)
- **200 OK**: Successfully retrieved or updated a resource (GET, PUT)
- **204 No Content**: Successfully deleted a resource (DELETE) - alternative response
- **400 Bad Request**: Invalid request data or validation error
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

## Testing Examples

### Using curl

```bash
# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project"}'

# Get all projects
curl -X GET http://localhost:3000/api/projects

# Get specific project
curl -X GET http://localhost:3000/api/projects/{id}

# Update a project
curl -X PUT http://localhost:3000/api/projects/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Delete a project
curl -X DELETE http://localhost:3000/api/projects/{id}
```

## API Features

- **Consistent Response Format**: All responses follow a consistent structure with `data`, `message`, and `timestamp`
- **Comprehensive Error Handling**: Detailed error messages with validation information
- **Type Safety**: Full TypeScript support with request/response DTOs
- **Validation**: Input validation for all endpoints
- **Timestamps**: All responses include timestamps for audit trails
- **Filtering**: Support for filtering lists by related resources (e.g., estimations by projectId)
- **Relations**: Automatic loading of related data (estimations for projects, snapshots for estimations)

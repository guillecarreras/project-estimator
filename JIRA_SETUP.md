# Jira Integration Setup Guide

This guide explains how to set up and use the Jira integration with Project Estimator for pulling issues and auto-estimating them.

## Features

- Connect to Jira Cloud and Server instances
- Fetch issues from specific projects or using JQL queries
- Auto-estimate issues based on story points
- Map story points intelligently to T-shirt sizes
- Convert Jira issues to backlog items
- Create projects and estimations from Jira data
- Export estimation results back to Jira
- Support for pagination and rate limiting
- Secure credential management

## Prerequisites

- Jira Cloud or Jira Server instance with API access
- Jira API token (for Cloud) or username/password (for Server)
- Project estimator running and accessible

## Setting Up Jira API Access

### Jira Cloud

1. Go to your Atlassian account settings: https://id.atlassian.com/manage/api-tokens
2. Click "Create API token"
3. Give it a descriptive name (e.g., "Project Estimator")
4. Copy the generated token
5. Note your email address (used as username)
6. Find your instance name from your Jira URL: `https://<instance-name>.atlassian.net`

### Jira Server

1. Go to your Jira instance admin settings
2. Navigate to Users > API Tokens
3. Create a new API token or use your existing credentials
4. Note the server URL (e.g., `https://jira.company.com`)

## Configuration Management

### Save Jira Configuration

Configure the Jira connection via API:

```bash
curl -X POST http://localhost:3000/api/integrations/jira/config \
  -H "Content-Type: application/json" \
  -d '{
    "name": "default",
    "host": "your-instance.atlassian.net",
    "username": "your-email@example.com",
    "apiToken": "your-api-token",
    "projectKey": "YOUR_PROJECT_KEY"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Jira configuration saved: default",
  "user": "your-email@example.com",
  "email": "your-email@example.com"
}
```

### Get Configuration

Retrieve a saved configuration (sensitive data is masked):

```bash
curl http://localhost:3000/api/integrations/jira/config?name=default
```

### List All Configurations

View all saved configuration names:

```bash
curl http://localhost:3000/api/integrations/jira/configs
```

### Delete Configuration

Remove a saved configuration:

```bash
curl -X DELETE http://localhost:3000/api/integrations/jira/config/default
```

## Usage Examples

### Fetch Issues and Auto-Estimate

Fetch issues from your Jira project and automatically estimate them:

```bash
curl -X POST http://localhost:3000/api/integrations/jira/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "configName": "default",
    "projectKey": "YOUR_PROJECT_KEY",
    "createProject": true,
    "projectName": "My Project Name",
    "estimationConfig": {
      "hoursPerDay": 8,
      "sprintLengthWeeks": 2,
      "unitTestingPercentage": 25,
      "bugFixingPercentage": 15,
      "documentationPercentage": 10,
      "contingencyPercentage": 20,
      "startDate": "2026-04-29"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "issues": 15,
  "estimations": [
    {
      "issueKey": "PROJ-1",
      "summary": "Create user authentication",
      "estimatedHours": 40,
      "backlogItem": {
        "epic": "Core Features",
        "feature": "Create user authentication",
        "tshirt_size": "L",
        "roles": ["Fullstack"]
      }
    }
  ],
  "count": 15,
  "projectId": "project-uuid",
  "message": "Fetched and estimated 15 issues"
}
```

### Fetch with Custom JQL Query

Use JQL to filter issues:

```bash
curl -X POST http://localhost:3000/api/integrations/jira/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "configName": "default",
    "jql": "project = PROJ AND type = Story AND priority >= High ORDER BY created DESC"
  }'
```

### Sync Backlog Items to Jira

Push your backlog items to Jira as stories:

```bash
curl -X POST http://localhost:3000/api/integrations/jira/sync \
  -H "Content-Type: application/json" \
  -d '{
    "configName": "default",
    "backlog": [
      {
        "epic": "Authentication",
        "feature": "Social login integration",
        "tshirt_size": "L",
        "roles": ["Fullstack", "QA"]
      },
      {
        "epic": "Authentication",
        "feature": "Two-factor authentication",
        "tshirt_size": "XL",
        "roles": ["Fullstack", "QA", "DevOps"]
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "result": {
    "issuesCreated": 2,
    "issuesUpdated": 0,
    "errors": [],
    "timestamp": "2026-04-29T10:30:00Z"
  },
  "message": "Synced 2 items to Jira with 0 errors"
}
```

### Export Estimation Results

Push your estimation results back to Jira as a summary issue:

```bash
curl -X POST http://localhost:3000/api/integrations/jira/export-estimation \
  -H "Content-Type: application/json" \
  -d '{
    "configName": "default",
    "projectName": "Mobile App Redesign",
    "estimation": {
      "backlogItemCount": 15,
      "totalBaseHours": 450,
      "roleEfforts": [
        {
          "role": "Fullstack",
          "baseHours": 250,
          "withMultipliers": 300,
          "totalHours": 360,
          "fte": 2.25,
          "cost": 54000
        }
      ],
      "teamComposition": [
        {
          "role": "Fullstack",
          "count": 2,
          "allocationPercentage": 100
        }
      ],
      "totalCost": 54000,
      "durationDays": 45,
      "durationWeeks": 9,
      "durationSprints": 4,
      "startDate": "2026-04-29",
      "endDate": "2026-06-13",
      "workingDays": 45,
      "assumptions": [
        "Team works 8 hours per day",
        "2-week sprints",
        "25% time for unit testing",
        "15% time for bug fixing"
      ],
      "ganttData": []
    }
  }'
```

### List Available Boards

Get boards available in your project:

```bash
curl "http://localhost:3000/api/integrations/jira/boards?configName=default&projectKey=YOUR_PROJECT_KEY"
```

### Check Jira Connection

Verify your Jira connection is working:

```bash
curl http://localhost:3000/api/integrations/jira/health?configName=default
```

**Response:**
```json
{
  "success": true,
  "authenticated": true,
  "user": "your-email@example.com",
  "email": "your-email@example.com",
  "config": "default"
}
```

## Story Points to Hours Mapping

The integration intelligently maps Jira story points to estimated hours:

| Story Points | Estimated Hours |
|-------------|-----------------|
| 1           | 2               |
| 2           | 4               |
| 3           | 8               |
| 5           | 13              |
| 8           | 21              |
| 13          | 34              |
| 21          | 55              |
| 34          | 89              |
| 55          | 144             |

These estimates are further adjusted based on:
- Unit testing percentage (default 25%)
- Bug fixing percentage (default 15%)
- Documentation percentage (default 10%)
- Contingency percentage (default 20%)

## T-Shirt Size Mapping

Issues without story points are estimated using T-shirt sizes:

| T-Shirt Size | Base Hours |
|-------------|-----------|
| XS          | 2         |
| S           | 4         |
| M           | 8         |
| L           | 13        |
| XL          | 21        |
| XXL         | 34        |
| XXXL        | 55        |

## Environment Variables

Optionally configure Jira settings via environment variables:

```bash
export JIRA_HOST="your-instance.atlassian.net"
export JIRA_USERNAME="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"
export JIRA_PROJECT_KEY="YOUR_PROJECT_KEY"
```

Then use the configuration:

```bash
curl -X POST http://localhost:3000/api/integrations/jira/config \
  -H "Content-Type: application/json" \
  -d '{
    "name": "env-config"
  }'
```

## Error Handling

### Missing Credentials

```json
{
  "error": "Missing required fields: host, username, apiToken, projectKey"
}
```

### Authentication Failed

```json
{
  "error": "Jira authentication failed: Invalid credentials or API token"
}
```

### Connection Failed

```json
{
  "success": false,
  "error": "Failed to connect to Jira instance"
}
```

### Configuration Not Found

```json
{
  "error": "Jira configuration not found: non-existent-config"
}
```

## Pagination

The integration automatically handles pagination when fetching large numbers of issues:

- Default: 100 issues per request
- Maximum: 10,000 issues (safety limit)
- Automatically fetches all available issues within the limit

## Rate Limiting

Jira Cloud has rate limits:
- 2000 API requests per minute for authenticated users
- The integration respects these limits with appropriate error handling

## Troubleshooting

### Issue: "Authentication Failed"

- Verify your API token is correct
- Check that your email address matches your Jira account
- Ensure API token access is enabled in your Jira instance

### Issue: "Project Key Not Found"

- Verify the project key matches your Jira project (e.g., PROJ, ABC, etc.)
- Project keys are case-sensitive
- Check that you have access to the project

### Issue: "No Issues Found"

- Check your JQL query syntax
- Verify the project has issues
- Ensure your filter criteria are correct

### Issue: "Custom Field Not Found"

- Custom field ID (customfield_10026) may vary by instance
- Check your Jira instance for the correct field ID
- Go to Project Settings > Fields to find custom field IDs

## API Reference

### Configuration Endpoints

| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| POST   | /api/integrations/jira/config         | Save configuration           |
| GET    | /api/integrations/jira/config         | Get configuration            |
| GET    | /api/integrations/jira/configs        | List all configurations      |
| DELETE | /api/integrations/jira/config/:name   | Delete configuration         |

### Sync & Fetch Endpoints

| Method | Endpoint                                  | Description                     |
|--------|-------------------------------------------|---------------------------------|
| POST   | /api/integrations/jira/fetch              | Fetch and auto-estimate issues  |
| POST   | /api/integrations/jira/sync               | Sync backlog to Jira            |
| POST   | /api/integrations/jira/export-estimation  | Export estimation to Jira       |

### Information Endpoints

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | /api/integrations/jira/boards     | List available boards    |
| GET    | /api/integrations/jira/health     | Check connection status  |

## Support

For issues or feature requests related to the Jira integration, please refer to the project documentation or contact support.

## Security Considerations

- API tokens are sensitive. Never commit them to version control
- Configurations are stored in `.jira-config/` directory - add this to `.gitignore`
- The `/config` GET endpoint doesn't expose sensitive data (API token)
- Always use HTTPS in production
- Rotate API tokens regularly

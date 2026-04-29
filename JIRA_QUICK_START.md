# Jira Integration Quick Start

Get up and running with the Jira integration in 5 minutes.

## 1. Prepare Your Jira Credentials

### For Jira Cloud:
1. Go to https://id.atlassian.com/manage/api-tokens
2. Create API token
3. Copy token and your email address
4. Note your instance name from URL: `https://<instance-name>.atlassian.net`

### For Jira Server:
1. Use your server URL and credentials
2. Create API token if available, or use password

## 2. Configure in Project Estimator

```bash
curl -X POST http://localhost:3000/api/integrations/jira/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "host": "your-instance.atlassian.net",
    "username": "your-email@example.com",
    "apiToken": "your-api-token",
    "projectKey": "PROJ"
  }'
```

Replace:
- `your-instance` with your Jira instance name
- `your-email@example.com` with your Jira email
- `your-api-token` with your API token
- `PROJ` with your project key
- `YOUR_JWT_TOKEN` with your auth token from login

## 3. Verify Connection

```bash
curl http://localhost:3000/api/integrations/jira/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "authenticated": true,
  "user": "your-email@example.com",
  "email": "your-email@example.com"
}
```

## 4. Fetch and Estimate Issues

```bash
curl -X POST http://localhost:3000/api/integrations/jira/fetch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "createProject": true,
    "projectName": "My Awesome Project",
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

This will:
- Fetch all issues from your Jira project
- Auto-estimate based on story points
- Create a project in Project Estimator
- Save estimation results

## 5. View Results

Response includes:
```json
{
  "success": true,
  "issues": 15,
  "estimations": [
    {
      "issueKey": "PROJ-1",
      "summary": "Feature name",
      "estimatedHours": 40,
      "backlogItem": { ... }
    }
  ],
  "projectId": "project-uuid"
}
```

## Common Operations

### Fetch specific project
```bash
curl -X POST http://localhost:3000/api/integrations/jira/fetch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectKey": "OTHERPROJ"
  }'
```

### Use custom JQL filter
```bash
curl -X POST http://localhost:3000/api/integrations/jira/fetch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jql": "project = PROJ AND type = Story AND priority >= High"
  }'
```

### List available boards
```bash
curl http://localhost:3000/api/integrations/jira/boards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Export estimation back to Jira
```bash
curl -X POST http://localhost:3000/api/integrations/jira/export-estimation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectName": "My Project",
    "estimation": { ... }
  }'
```

## Estimation Sizes

Issues are automatically estimated based on story points:

| Story Points | Hours | Size |
|-------------|-------|------|
| 1           | 2     | XS   |
| 2           | 4     | S    |
| 3           | 8     | M    |
| 5           | 13    | L    |
| 8           | 21    | XL   |
| 13          | 34    | XXL  |
| 21+         | 55+   | XXXL |

These are adjusted for testing, fixes, docs, and contingency.

## Tips

- **Test the connection first** with `/health` before syncing
- **Start with one project** before setting up multiple configs
- **Check issue format** - make sure your issues have story points assigned
- **Use JQL filters** to sync only relevant issues
- **Review estimates** before exporting back to Jira
- **Keep configs secure** - `.jira-config/` is gitignored

## Troubleshooting

**"Authentication failed"**
- Verify API token is correct
- Check email address matches Jira account
- Ensure API token isn't expired

**"Project Key Not Found"**
- Double-check project key (case-sensitive)
- Verify you have access to the project

**"No issues found"**
- Check that project has issues assigned
- Try with specific JQL query

**"Custom field not found"**
- Different Jira instances use different field IDs
- Contact your Jira admin for correct field ID

## Next Steps

- See [JIRA_SETUP.md](./JIRA_SETUP.md) for complete documentation
- Check [src/integrations/jira/README.md](./src/integrations/jira/README.md) for technical details
- Review API endpoint documentation at `/api/info`

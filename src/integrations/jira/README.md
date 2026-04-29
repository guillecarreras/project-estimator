# Jira Integration Module

This module provides comprehensive integration with Jira Cloud and Jira Server instances, enabling automatic fetching of issues, intelligent estimation, and bi-directional synchronization of project data.

## Architecture

The Jira integration consists of four main components:

### 1. JiraClient (`client.ts`)
Low-level API client for direct communication with Jira REST API v3.

**Key Methods:**
- `authenticate()` - Verify credentials and user
- `searchIssues()` - Search using JQL with automatic pagination
- `getIssue()` - Fetch specific issue details
- `createIssue()` - Create new issue
- `updateIssue()` - Modify existing issue
- `getBoards()` - List available boards
- `getBoardIssues()` - Fetch issues from a specific board

**Features:**
- Automatic pagination for large result sets
- Basic authentication with API tokens
- Handles both HTTP and HTTPS
- Custom field support (story points)
- Comprehensive error handling

### 2. JiraMapper (`mapper.ts`)
Bidirectional mapping between Jira issues and internal project models.

**Key Methods:**
- `jiraIssueToBacklogItem()` - Convert Jira issue to backlog item
- `backlogItemToJiraIssue()` - Convert backlog item to Jira issue
- `estimationResultToSummaryIssue()` - Create summary issue from estimation

**Features:**
- Intelligent T-shirt size mapping
- Story points to hours conversion
- Custom field parsing
- Description extraction for structured data

### 3. JiraSyncService (`sync-service.ts`)
High-level service orchestrating syncing and estimation workflows.

**Key Methods:**
- `authenticate()` - Authenticate with Jira
- `fetchIssues()` - Get issues with optional filtering
- `estimateAndConvertIssues()` - Auto-estimate and convert to backlog items
- `syncIssues()` - Sync backlog items to Jira
- `pushEstimationResults()` - Export estimation to Jira as summary issue

**Features:**
- Automatic estimation with configurable multipliers
- Support for story points and T-shirt sizes
- Pagination support
- Error collection and reporting

### 4. JiraConfigManager (`config.ts`)
Manages secure storage and retrieval of Jira instance configurations.

**Key Methods:**
- `saveConfig()` - Store configuration with validation
- `getConfig()` - Retrieve named configuration
- `getAllConfigs()` - List all configurations
- `deleteConfig()` - Remove configuration
- `validateConfig()` - Verify configuration completeness

**Features:**
- File-based persistence in `.jira-config/` directory
- Environment variable support
- Sensitive data protection

## Usage Examples

### Basic Setup

```typescript
import { JiraSyncService, JiraConfigManager } from '@/integrations/jira';

// Save configuration
const configManager = new JiraConfigManager();
configManager.saveConfig('my-jira', {
  host: 'mycompany.atlassian.net',
  username: 'user@example.com',
  apiToken: 'your-api-token',
  projectKey: 'PROJ'
});

// Load and use
const config = configManager.getConfig('my-jira');
const syncService = new JiraSyncService(config);
```

### Fetch and Estimate

```typescript
const issues = await syncService.fetchIssues({
  projectKey: 'PROJ'
});

const estimations = await syncService.estimateAndConvertIssues(issues, {
  hoursPerDay: 8,
  sprintLengthWeeks: 2,
  unitTestingPercentage: 25,
  bugFixingPercentage: 15,
  documentationPercentage: 10,
  contingencyPercentage: 20,
  startDate: '2026-04-29'
});
```

### Sync Backlog to Jira

```typescript
const result = await syncService.syncIssues();

console.log(`Created: ${result.issuesCreated}`);
console.log(`Errors: ${result.errors.length}`);
```

## API Integration

The module is exposed through Express routes at `/api/integrations/jira/*`.

See [JIRA_SETUP.md](/JIRA_SETUP.md) for complete API documentation and examples.

## Configuration

### Environment Variables

```bash
JIRA_HOST=your-instance.atlassian.net
JIRA_USERNAME=user@example.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=PROJ
```

### Config File

Configurations are stored in `.jira-config/<name>.json`:

```json
{
  "host": "mycompany.atlassian.net",
  "username": "user@example.com",
  "apiToken": "token-string",
  "projectKey": "PROJ"
}
```

## Estimation Strategy

### Story Points Mapping

| Points | Hours | T-Shirt |
|--------|-------|---------|
| 1      | 2     | XS      |
| 2      | 4     | S       |
| 3      | 8     | M       |
| 5      | 13    | L       |
| 8      | 21    | XL      |
| 13     | 34    | XXL     |
| 21     | 55    | XXXL    |

### Effort Multipliers

Applied in sequence:
1. Base hours (from story points or T-shirt size)
2. Unit testing (default +25%)
3. Bug fixing (default +15%)
4. Documentation (default +10%)
5. Contingency (default +20%)

**Total = Base * (1.25 * 1.15 * 1.10 * 1.20) = Base * 1.956**

### Example

A 5-point story:
- Base: 13 hours
- With multipliers: 13 * 1.956 = 25.4 hours
- Adjusted: 26 hours (rounded up)

## Error Handling

The module provides detailed error information:

```typescript
try {
  const result = await syncService.syncIssues();
  result.errors.forEach(err => {
    console.error(`${err.issue}: ${err.error}`);
  });
} catch (error) {
  console.error('Sync failed:', error.message);
}
```

## Pagination

Large result sets are automatically paginated:
- Default: 100 issues per request
- Maximum: 10,000 issues (safety limit)
- All requests automatically fetch remaining pages

## Rate Limiting

Jira Cloud rate limits:
- 2,000 requests/minute for authenticated users
- Module respects limits with appropriate backoff

## Custom Fields

Story points field: `customfield_10026`

Different Jira instances may have different custom field IDs. To find yours:
1. Go to Project Settings > Fields
2. Look for "Story Points" field
3. Check the field ID in the URL

## Security Considerations

- API tokens should never be committed to version control
- `.jira-config/` should be in `.gitignore`
- Use environment variables for sensitive data in production
- Never log full configurations (API tokens)
- Validate all user input before API calls

## Testing

Example test setup:

```typescript
import { JiraSyncService } from '@/integrations/jira';

describe('JiraSyncService', () => {
  let service: JiraSyncService;

  beforeAll(() => {
    service = new JiraSyncService({
      host: 'test.atlassian.net',
      username: 'test@example.com',
      apiToken: process.env.TEST_JIRA_TOKEN!,
      projectKey: 'TEST'
    });
  });

  test('should authenticate', async () => {
    const authenticated = await service.authenticate();
    expect(authenticated).toBe(true);
  });

  test('should fetch issues', async () => {
    const issues = await service.fetchIssues();
    expect(Array.isArray(issues)).toBe(true);
  });
});
```

## Troubleshooting

### Connection Issues

Verify credentials:
```bash
curl -u email@example.com:token https://instance.atlassian.net/rest/api/3/myself
```

### Custom Field Not Found

Check available fields:
```bash
curl -u email@example.com:token https://instance.atlassian.net/rest/api/3/field
```

### Pagination Not Working

Ensure JQL query is valid:
```bash
curl -X POST -u email@example.com:token \
  https://instance.atlassian.net/rest/api/3/search \
  -H "Content-Type: application/json" \
  -d '{"jql":"project=PROJ","startAt":0,"maxResults":50}'
```

## Future Enhancements

- [ ] Webhook support for real-time updates
- [ ] Caching layer for performance
- [ ] Bulk operations for large datasets
- [ ] Custom estimation algorithms
- [ ] Team velocity tracking
- [ ] Integration with other estimation models
- [ ] Advanced filtering and search
- [ ] Field mapping configuration

## References

- [Jira REST API v3 Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [API Token Creation](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)
- [JQL Query Language](https://support.atlassian.com/jira-service-management-cloud/docs/use-the-jira-query-language-jql/)

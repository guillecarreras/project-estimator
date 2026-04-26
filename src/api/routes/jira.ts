/**
 * Jira API Routes
 * Express routes for Jira integration endpoints
 */

import { Router, Request, Response } from 'express';
import { JiraClient } from '../../integrations/jira/client';
import { JiraMapper } from '../../integrations/jira/mapper';
import { JiraConfig, JiraSyncResult, JiraSyncError } from '../../integrations/jira/types';
import { BacklogItem, EstimationResult } from '../../types';

const router = Router();
let jiraClient: JiraClient | null = null;

/**
 * POST /api/jira/authenticate
 * Authenticate with Jira and test connection
 */
router.post('/authenticate', async (req: Request, res: Response) => {
  try {
    const { host, username, apiToken, projectKey } = req.body;

    if (!host || !username || !apiToken || !projectKey) {
      return res.status(400).json({
        error: 'Missing required fields: host, username, apiToken, projectKey',
      });
    }

    const config: JiraConfig = { host, username, apiToken, projectKey };
    jiraClient = new JiraClient(config);

    const auth = await jiraClient.authenticate();
    res.json({
      success: true,
      authenticated: auth.authenticated,
      user: auth.user,
      email: auth.email,
      message: 'Successfully authenticated with Jira',
    });
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
});

/**
 * POST /api/jira/sync
 * Sync backlog items to Jira as stories
 */
router.post('/sync', async (req: Request, res: Response) => {
  try {
    if (!jiraClient) {
      return res.status(400).json({
        error: 'Jira client not authenticated. Call /authenticate first.',
      });
    }

    const { backlog }: { backlog: BacklogItem[] } = req.body;

    if (!backlog || !Array.isArray(backlog)) {
      return res.status(400).json({
        error: 'Invalid request. Expected { backlog: BacklogItem[] }',
      });
    }

    const result: JiraSyncResult = {
      issuesCreated: 0,
      issuesUpdated: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    for (const item of backlog) {
      try {
        const jiraIssue = JiraMapper.backlogItemToJiraIssue(item, '');
        const createdIssue = await jiraClient.createIssue(jiraIssue);
        result.issuesCreated++;
        console.log(`Created Jira issue: ${createdIssue.key}`);
      } catch (error) {
        const error_msg = error instanceof Error ? error.message : String(error);
        result.errors.push({
          issue: item.feature,
          error: error_msg,
        });
      }
    }

    res.json({
      success: true,
      result,
      message: `Synced ${result.issuesCreated} issues to Jira with ${result.errors.length} errors`,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Sync failed',
    });
  }
});

/**
 * POST /api/jira/create-issue
 * Create a single issue in Jira
 */
router.post('/create-issue', async (req: Request, res: Response) => {
  try {
    if (!jiraClient) {
      return res.status(400).json({
        error: 'Jira client not authenticated',
      });
    }

    const { summary, description, issueType = 'Story', priority = 'Medium', estimate } = req.body;

    if (!summary) {
      return res.status(400).json({
        error: 'Missing required field: summary',
      });
    }

    const issue = await jiraClient.createIssue({
      key: '',
      summary,
      description: description || '',
      issueType: issueType as any,
      priority: priority as any,
      estimate,
    });

    res.json({
      success: true,
      issue,
      message: `Created issue: ${issue.key}`,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create issue',
    });
  }
});

/**
 * GET /api/jira/issues/:key
 * Get a specific issue from Jira
 */
router.get('/issues/:key', async (req: Request, res: Response) => {
  try {
    if (!jiraClient) {
      return res.status(400).json({
        error: 'Jira client not authenticated',
      });
    }

    const { key } = req.params;
    const issue = await jiraClient.getIssue(key);

    res.json({
      success: true,
      issue,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get issue',
    });
  }
});

/**
 * POST /api/jira/search
 * Search for issues using JQL
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    if (!jiraClient) {
      return res.status(400).json({
        error: 'Jira client not authenticated',
      });
    }

    const { jql } = req.body;

    if (!jql) {
      return res.status(400).json({
        error: 'Missing required field: jql',
      });
    }

    const issues = await jiraClient.searchIssues(jql);

    res.json({
      success: true,
      issues,
      count: issues.length,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Search failed',
    });
  }
});

/**
 * PUT /api/jira/issues/:key
 * Update an issue in Jira
 */
router.put('/issues/:key', async (req: Request, res: Response) => {
  try {
    if (!jiraClient) {
      return res.status(400).json({
        error: 'Jira client not authenticated',
      });
    }

    const { key } = req.params;
    const updates = req.body;

    await jiraClient.updateIssue(key, updates);

    res.json({
      success: true,
      message: `Updated issue: ${key}`,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update issue',
    });
  }
});

/**
 * POST /api/jira/export-estimation
 * Export estimation results as Jira issue summary
 */
router.post('/export-estimation', async (req: Request, res: Response) => {
  try {
    if (!jiraClient) {
      return res.status(400).json({
        error: 'Jira client not authenticated',
      });
    }

    const { estimation, projectName }: { estimation: EstimationResult; projectName: string } = req.body;

    if (!estimation || !projectName) {
      return res.status(400).json({
        error: 'Missing required fields: estimation, projectName',
      });
    }

    const summaryIssue = JiraMapper.estimationResultToSummaryIssue(estimation, projectName);
    const createdIssue = await jiraClient.createIssue(summaryIssue);

    res.json({
      success: true,
      issue: createdIssue,
      message: `Created estimation summary: ${createdIssue.key}`,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to export estimation',
    });
  }
});

export default router;

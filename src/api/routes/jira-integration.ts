/**
 * Jira Integration Routes
 * Express routes for Jira integration endpoints with sync and auto-estimation
 */

import { Router, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { JiraClient, JiraSyncService, JiraConfigManager } from '../../integrations/jira';
import { JiraConfig, JiraSyncResult } from '../../integrations/jira/types';
import { BacklogItem, EstimationResult, EstimationConfig } from '../../types';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { EstimationRepository } from '../../database/repositories/EstimationRepository';

export function createJiraRoutes(dataSource: DataSource): Router {
  const router = Router();
  const configManager = new JiraConfigManager();
  const projectRepository = new ProjectRepository(dataSource);
  const estimationRepository = new EstimationRepository(dataSource);

  /**
   * POST /api/integrations/jira/config
   * Save Jira instance configuration
   */
  router.post('/config', async (req: Request, res: Response) => {
    try {
      const { name = 'default', host, username, apiToken, projectKey } = req.body;

      if (!host || !username || !apiToken || !projectKey) {
        return res.status(400).json({
          error: 'Missing required fields: host, username, apiToken, projectKey',
        });
      }

      const config: JiraConfig = { host, username, apiToken, projectKey };

      // Validate by attempting authentication
      const client = new JiraClient(config);
      const auth = await client.authenticate();

      if (!auth.authenticated) {
        return res.status(401).json({
          error: 'Failed to authenticate with Jira',
        });
      }

      configManager.saveConfig(name, config);

      res.json({
        success: true,
        message: `Jira configuration saved: ${name}`,
        user: auth.user,
        email: auth.email,
      });
    } catch (error) {
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Configuration failed',
      });
    }
  });

  /**
   * GET /api/integrations/jira/config
   * Get Jira configuration
   */
  router.get('/config', async (req: Request, res: Response) => {
    try {
      const { name = 'default' } = req.query;

      const config = configManager.getConfig(name as string);

      if (!config) {
        return res.status(404).json({
          error: `Jira configuration not found: ${name}`,
        });
      }

      // Don't expose sensitive data
      const safeConfig = {
        host: config.host,
        username: config.username,
        projectKey: config.projectKey,
      };

      res.json({
        success: true,
        config: safeConfig,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get configuration',
      });
    }
  });

  /**
   * GET /api/integrations/jira/configs
   * List all saved configurations (names only)
   */
  router.get('/configs', async (req: Request, res: Response) => {
    try {
      const allConfigs = configManager.getAllConfigs();
      const configNames = Array.from(allConfigs.keys());

      res.json({
        success: true,
        configs: configNames,
        count: configNames.length,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to list configurations',
      });
    }
  });

  /**
   * DELETE /api/integrations/jira/config/:name
   * Delete Jira configuration
   */
  router.delete('/config/:name', async (req: Request, res: Response) => {
    try {
      const { name } = req.params;

      configManager.deleteConfig(name);

      res.json({
        success: true,
        message: `Jira configuration deleted: ${name}`,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete configuration',
      });
    }
  });

  /**
   * POST /api/integrations/jira/fetch
   * Fetch issues from Jira with auto-estimation
   */
  router.post('/fetch', async (req: Request, res: Response) => {
    try {
      const {
        configName = 'default',
        projectKey,
        jql,
        estimationConfig,
        createProject = false,
        projectName,
      } = req.body;

      const config = configManager.getConfig(configName);
      if (!config) {
        return res.status(404).json({
          error: `Jira configuration not found: ${configName}`,
        });
      }

      const syncService = new JiraSyncService(config);

      // Authenticate
      const authenticated = await syncService.authenticate();
      if (!authenticated) {
        return res.status(401).json({
          error: 'Failed to authenticate with Jira',
        });
      }

      // Fetch issues
      const issues = await syncService.fetchIssues({
        projectKey: projectKey || config.projectKey,
        jql,
      });

      if (issues.length === 0) {
        return res.json({
          success: true,
          issues: [],
          estimations: [],
          count: 0,
          message: 'No issues found',
        });
      }

      // Default estimation config if not provided
      const estConfig: EstimationConfig = estimationConfig || {
        hoursPerDay: 8,
        sprintLengthWeeks: 2,
        unitTestingPercentage: 25,
        bugFixingPercentage: 15,
        documentationPercentage: 10,
        contingencyPercentage: 20,
        startDate: new Date().toISOString().split('T')[0],
      };

      // Estimate and convert
      const estimations = await syncService.estimateAndConvertIssues(issues, estConfig);

      // Optionally create project and save estimations
      let projectId: string | null = null;
      if (createProject && projectName) {
        try {
          const newProject = await projectRepository.create(projectName);
          projectId = newProject.id;

          // Calculate total estimation result
          const backlogItems = estimations.map((e) => e.backlogItem);
          const totalHours = estimations.reduce((sum, e) => sum + e.estimatedHours, 0);

          // Create a basic estimation result
          const result: EstimationResult = {
            backlogItemCount: backlogItems.length,
            totalBaseHours: totalHours,
            roleEfforts: [],
            teamComposition: [],
            totalCost: 0,
            durationDays: Math.ceil(totalHours / estConfig.hoursPerDay),
            durationWeeks: Math.ceil(totalHours / (estConfig.hoursPerDay * 5)),
            durationSprints: Math.ceil(totalHours / (estConfig.hoursPerDay * 5 * estConfig.sprintLengthWeeks)),
            startDate: estConfig.startDate,
            endDate: new Date(
              new Date(estConfig.startDate).getTime() +
                Math.ceil(totalHours / estConfig.hoursPerDay) * 24 * 60 * 60 * 1000,
            )
              .toISOString()
              .split('T')[0],
            workingDays: Math.ceil(totalHours / estConfig.hoursPerDay),
            assumptions: [`Auto-estimated from ${issues.length} Jira issues`],
            ganttData: [],
          };

          await estimationRepository.create(projectId, backlogItems, estConfig, result);
        } catch (error) {
          console.error(`Failed to create project: ${error}`);
        }
      }

      res.json({
        success: true,
        issues: issues.length,
        estimations: estimations.map((e) => ({
          issueKey: e.issue.key,
          summary: e.issue.summary,
          estimatedHours: e.estimatedHours,
          backlogItem: e.backlogItem,
        })),
        count: estimations.length,
        projectId,
        message: `Fetched and estimated ${estimations.length} issues`,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch issues',
      });
    }
  });

  /**
   * POST /api/integrations/jira/sync
   * Sync backlog items from internal system to Jira
   */
  router.post('/sync', async (req: Request, res: Response) => {
    try {
      const { configName = 'default', backlog } = req.body;

      if (!backlog || !Array.isArray(backlog)) {
        return res.status(400).json({
          error: 'Invalid request. Expected { backlog: BacklogItem[] }',
        });
      }

      const config = configManager.getConfig(configName);
      if (!config) {
        return res.status(404).json({
          error: `Jira configuration not found: ${configName}`,
        });
      }

      const client = new JiraClient(config);
      const result: JiraSyncResult = {
        issuesCreated: 0,
        issuesUpdated: 0,
        errors: [],
        timestamp: new Date().toISOString(),
      };

      for (const item of backlog) {
        try {
          const jiraIssue = {
            key: '',
            summary: `${item.feature} (${item.epic})`,
            description: `Epic: ${item.epic}\nFeature: ${item.feature}\nT-Shirt Size: ${item.tshirt_size}\nRequired Roles: ${item.roles.join(', ')}`,
            issueType: 'Story',
            priority: 'Medium',
            labels: ['estimation', item.epic.toLowerCase().replace(/\s+/g, '-')],
            components: item.roles,
          } as any;

          const createdIssue = await client.createIssue(jiraIssue);
          result.issuesCreated++;
        } catch (error) {
            result.errors.push({
            issue: item.feature,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      res.json({
        success: true,
        result,
        message: `Synced ${result.issuesCreated} items to Jira with ${result.errors.length} errors`,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Sync failed',
      });
    }
  });

  /**
   * POST /api/integrations/jira/export-estimation
   * Export estimation results to Jira as summary issue
   */
  router.post('/export-estimation', async (req: Request, res: Response) => {
    try {
      const { configName = 'default', estimation, projectName } = req.body;

      if (!estimation || !projectName) {
        return res.status(400).json({
          error: 'Missing required fields: estimation, projectName',
        });
      }

      const config = configManager.getConfig(configName);
      if (!config) {
        return res.status(404).json({
          error: `Jira configuration not found: ${configName}`,
        });
      }

      const syncService = new JiraSyncService(config);
      const issueKey = await syncService.pushEstimationResults(estimation, projectName);

      res.json({
        success: true,
        issueKey,
        message: `Exported estimation results to Jira: ${issueKey}`,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to export estimation',
      });
    }
  });

  /**
   * GET /api/integrations/jira/boards
   * List available boards for a project
   */
  router.get('/boards', async (req: Request, res: Response) => {
    try {
      const { configName = 'default', projectKey } = req.query;

      const config = configManager.getConfig(configName as string);
      if (!config) {
        return res.status(404).json({
          error: `Jira configuration not found: ${configName}`,
        });
      }

      const client = new JiraClient(config);
      const boards = await client.getBoards(projectKey as string || config.projectKey);

      res.json({
        success: true,
        boards,
        count: boards.length,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get boards',
      });
    }
  });

  /**
   * GET /api/integrations/jira/health
   * Check Jira connection status
   */
  router.get('/health', async (req: Request, res: Response) => {
    try {
      const { configName = 'default' } = req.query;

      const config = configManager.getConfig(configName as string);
      if (!config) {
        return res.status(404).json({
          success: false,
          message: `Jira configuration not found: ${configName}`,
        });
      }

      const client = new JiraClient(config);
      const auth = await client.authenticate();

      res.json({
        success: true,
        authenticated: auth.authenticated,
        user: auth.user,
        email: auth.email,
        config: configName,
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      });
    }
  });

  return router;
}

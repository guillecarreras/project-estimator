/**
 * Jira Sync Service
 * Handles syncing Jira issues to backlog items with auto-estimation
 */

import { BacklogItem, EstimationResult, TShirtSize, EstimationConfig, Role } from '../../types';
import { JiraClient } from './client';
import { JiraMapper } from './mapper';
import { JiraConfig, JiraIssue, JiraSyncResult, JiraSyncError } from './types';

export interface JiraFetchOptions {
  projectKey?: string;
  board?: string;
  jql?: string;
  maxResults?: number;
  estimationStrategy?: 'story-points' | 'custom-field';
}

export interface JiraEstimation {
  issue: JiraIssue;
  backlogItem: BacklogItem;
  estimatedHours: number;
}

export class JiraSyncService {
  private client: JiraClient;
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
    this.client = new JiraClient(config);
  }

  /**
   * Authenticate with Jira instance
   */
  async authenticate(): Promise<boolean> {
    try {
      const auth = await this.client.authenticate();
      return auth.authenticated;
    } catch (error) {
      throw new Error(`Failed to authenticate with Jira: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Fetch and parse issues from Jira with pagination
   */
  async fetchIssues(options: JiraFetchOptions = {}): Promise<JiraIssue[]> {
    const {
      projectKey = this.config.projectKey,
      jql,
      maxResults = 100,
    } = options;

    if (!projectKey && !jql) {
      throw new Error('Either projectKey or jql must be provided');
    }

    try {
      let finalJql = jql;
      if (!finalJql) {
        finalJql = `project = "${projectKey}" AND type in (Story, Task, Bug) ORDER BY created DESC`;
      }

      const issues = await this.client.searchIssues(finalJql);
      return issues;
    } catch (error) {
      throw new Error(`Failed to fetch issues from Jira: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Convert Jira issues to backlog items with estimations
   */
  async estimateAndConvertIssues(
    issues: JiraIssue[],
    config: EstimationConfig,
  ): Promise<JiraEstimation[]> {
    const estimations: JiraEstimation[] = [];
    const tshirtSizeToHours: { [key in TShirtSize]: number } = {
      'XS': 2,
      'S': 4,
      'M': 8,
      'L': 13,
      'XL': 21,
      'XXL': 34,
      'XXXL': 55,
    };

    for (const issue of issues) {
      try {
        // Convert to backlog item
        const backlogItem = JiraMapper.jiraIssueToBacklogItem(issue);

        // Estimate based on story points or default to M
        let estimatedHours = tshirtSizeToHours[backlogItem.tshirt_size] || 8;

        // If issue has story points, use those to estimate
        if (issue.estimate && issue.estimate > 0) {
          // Map story points to hours more intelligently
          const storyPointToHours: { [key: number]: number } = {
            1: 2, 2: 4, 3: 8, 5: 13, 8: 21, 13: 34, 21: 55, 34: 89, 55: 144,
          };
          estimatedHours = storyPointToHours[issue.estimate] || (issue.estimate * 4);
        }

        // Apply multipliers for various activities
        const withTesting = estimatedHours * (1 + config.unitTestingPercentage / 100);
        const withBugFixing = withTesting * (1 + config.bugFixingPercentage / 100);
        const withDocumentation = withBugFixing * (1 + config.documentationPercentage / 100);
        const withContingency = withDocumentation * (1 + config.contingencyPercentage / 100);

        estimations.push({
          issue,
          backlogItem,
          estimatedHours: Math.ceil(withContingency),
        });
      } catch (error) {
        console.error(`Failed to estimate issue ${issue.key}: ${error instanceof Error ? error.message : error}`);
      }
    }

    return estimations;
  }

  /**
   * Sync issues from Jira to internal system
   */
  async syncIssues(options: JiraFetchOptions = {}): Promise<JiraSyncResult> {
    const result: JiraSyncResult = {
      issuesCreated: 0,
      issuesUpdated: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };

    try {
      const issues = await this.fetchIssues(options);

      for (const issue of issues) {
        try {
          // Create Jira issue
          const created = await this.client.createIssue(issue);
          result.issuesCreated++;
          console.log(`Synced Jira issue: ${created.key}`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          result.errors.push({
            issue: issue.key,
            error: errorMsg,
          });
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      result.errors.push({
        issue: 'SYNC',
        error: errorMsg,
      });
    }

    return result;
  }

  /**
   * Push estimation results back to Jira as issue
   */
  async pushEstimationResults(
    estimation: EstimationResult,
    projectName: string,
  ): Promise<string> {
    try {
      const summaryIssue = JiraMapper.estimationResultToSummaryIssue(estimation, projectName);
      const created = await this.client.createIssue(summaryIssue);
      return created.key;
    } catch (error) {
      throw new Error(
        `Failed to push estimation results to Jira: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * Map story points to T-shirt sizes
   */
  private storyPointsToTShirtSize(storyPoints?: number): TShirtSize {
    if (!storyPoints) return 'M';

    const mapping: { [key: number]: TShirtSize } = {
      1: 'XS',
      2: 'S',
      3: 'M',
      5: 'L',
      8: 'XL',
      13: 'XXL',
      21: 'XXXL',
    };

    // Find closest match
    const points = Object.keys(mapping).map(Number).sort((a, b) => a - b);
    let closest = points[0];
    for (const point of points) {
      if (Math.abs(point - storyPoints) < Math.abs(closest - storyPoints)) {
        closest = point;
      }
    }

    return mapping[closest];
  }

  /**
   * Map Jira issue priority to importance level
   */
  private mapPriorityToLevel(priority: string): number {
    const priorityMap: { [key: string]: number } = {
      'Lowest': 1,
      'Low': 2,
      'Medium': 3,
      'High': 4,
      'Highest': 5,
    };
    return priorityMap[priority] || 3;
  }
}

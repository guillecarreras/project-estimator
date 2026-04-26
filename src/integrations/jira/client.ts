/**
 * Jira API Client
 * Handles authentication and communication with Jira REST API
 */

import * as https from 'https';
import * as http from 'http';
import {
  JiraConfig,
  JiraIssue,
  JiraCreateIssueRequest,
  JiraCreateIssueResponse,
  JiraAuthResponse,
} from './types';

export class JiraClient {
  private config: JiraConfig;
  private baseUrl: string;

  constructor(config: JiraConfig) {
    this.config = config;
    this.baseUrl = `https://${config.host}/rest/api/3`;
  }

  /**
   * Authenticate with Jira
   */
  async authenticate(): Promise<JiraAuthResponse> {
    try {
      const response = await this.makeRequest('GET', '/myself', {});
      return {
        authenticated: true,
        user: response.name || response.emailAddress,
        email: response.emailAddress,
      };
    } catch (error) {
      throw new Error(`Jira authentication failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Create a new issue in Jira
   */
  async createIssue(issue: JiraIssue): Promise<JiraCreateIssueResponse> {
    const request: JiraCreateIssueRequest = {
      fields: {
        project: { key: this.config.projectKey },
        summary: issue.summary,
        description: issue.description,
        issuetype: { name: issue.issueType },
        ...(issue.priority && { priority: { name: issue.priority } }),
        ...(issue.estimate && { customfield_10026: issue.estimate }),
        ...(issue.labels && { labels: issue.labels }),
        ...(issue.components && {
          components: issue.components.map((name) => ({ name })),
        }),
      },
    };

    try {
      const response = await this.makeRequest('POST', '/issues', request);
      return response as JiraCreateIssueResponse;
    } catch (error) {
      throw new Error(`Failed to create Jira issue: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Get an issue from Jira
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    try {
      const response = await this.makeRequest('GET', `/issues/${issueKey}`, {});
      return this.parseIssueResponse(response);
    } catch (error) {
      throw new Error(`Failed to get Jira issue: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Search for issues using JQL
   */
  async searchIssues(jql: string): Promise<JiraIssue[]> {
    try {
      const response = await this.makeRequest('POST', '/search', {
        jql,
        maxResults: 100,
        fields: ['key', 'summary', 'description', 'issuetype', 'priority', 'customfield_10026'],
      });

      return response.issues.map((issue: any) => this.parseIssueResponse(issue));
    } catch (error) {
      throw new Error(`Failed to search Jira issues: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Update an issue in Jira
   */
  async updateIssue(issueKey: string, updates: Partial<JiraIssue>): Promise<void> {
    const fields: any = {};

    if (updates.summary) fields.summary = updates.summary;
    if (updates.description) fields.description = updates.description;
    if (updates.priority) fields.priority = { name: updates.priority };
    if (updates.estimate) fields.customfield_10026 = updates.estimate;
    if (updates.labels) fields.labels = updates.labels;

    try {
      await this.makeRequest('PUT', `/issues/${issueKey}`, { fields });
    } catch (error) {
      throw new Error(`Failed to update Jira issue: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Make HTTP request to Jira API
   */
  private makeRequest(method: string, endpoint: string, body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const auth = Buffer.from(
        `${this.config.username}:${this.config.apiToken}`
      ).toString('base64');

      const url = new URL(`${this.baseUrl}${endpoint}`);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };

      const protocol = url.protocol === 'http:' ? http : https;
      const req = protocol.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(data ? JSON.parse(data) : {});
            } catch {
              resolve(data);
            }
          } else {
            reject(new Error(`Jira API returned status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (body && Object.keys(body).length > 0) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  /**
   * Parse Jira issue response
   */
  private parseIssueResponse(issue: any): JiraIssue {
    const fields = issue.fields || {};
    return {
      key: issue.key,
      summary: fields.summary,
      description: fields.description,
      issueType: fields.issuetype?.name || 'Task',
      priority: fields.priority?.name || 'Medium',
      estimate: fields.customfield_10026,
      labels: fields.labels || [],
      components: fields.components?.map((c: any) => c.name) || [],
    };
  }
}

/**
 * Jira Integration Types
 */

export interface JiraConfig {
  host: string;
  username: string;
  apiToken: string;
  projectKey: string;
}

export interface JiraIssue {
  key: string;
  summary: string;
  description: string;
  issueType: 'Story' | 'Task' | 'Bug' | 'Epic';
  priority: 'Lowest' | 'Low' | 'Medium' | 'High' | 'Highest';
  estimate?: number;
  labels?: string[];
  components?: string[];
}

export interface JiraCreateIssueRequest {
  fields: {
    project: { key: string };
    summary: string;
    description: string;
    issuetype: { name: string };
    priority?: { name: string };
    customfield_10026?: number; // Story Points
    labels?: string[];
    components?: Array<{ name: string }>;
  };
}

export interface JiraCreateIssueResponse {
  id: string;
  key: string;
  self: string;
}

export interface JiraSyncResult {
  issuesCreated: number;
  issuesUpdated: number;
  errors: JiraSyncError[];
  timestamp: string;
}

export interface JiraSyncError {
  issue: string;
  error: string;
}

export interface JiraAuthResponse {
  authenticated: boolean;
  user: string;
  email: string;
}

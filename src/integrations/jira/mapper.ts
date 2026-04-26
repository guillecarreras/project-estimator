/**
 * Jira Mapper
 * Maps between internal estimation models and Jira models
 */

import { BacklogItem, EstimationResult, RoleEffort } from '../../types';
import { JiraIssue } from './types';

export class JiraMapper {
  /**
   * Map a BacklogItem to a JiraIssue
   */
  static backlogItemToJiraIssue(item: BacklogItem, projectKey: string): JiraIssue {
    const tshirtSizeMap: { [key: string]: number } = {
      'XS': 1,
      'S': 2,
      'M': 3,
      'L': 5,
      'XL': 8,
      'XXL': 13,
      'XXXL': 21,
    };

    return {
      key: '',
      summary: `${item.feature} (${item.epic})`,
      description: `Epic: ${item.epic}\nFeature: ${item.feature}\nT-Shirt Size: ${item.tshirt_size}\nRequired Roles: ${item.roles.join(', ')}`,
      issueType: 'Story',
      priority: 'Medium',
      estimate: tshirtSizeMap[item.tshirt_size],
      labels: ['estimation', item.epic.toLowerCase().replace(/\s+/g, '-')],
      components: item.roles,
    };
  }

  /**
   * Map a JiraIssue back to a BacklogItem
   */
  static jiraIssueToBacklogItem(issue: JiraIssue): BacklogItem {
    const description = issue.description || '';
    const epicMatch = description.match(/Epic:\s*(.+?)(?:\n|$)/);
    const featureMatch = description.match(/Feature:\s*(.+?)(?:\n|$)/);

    const tshirtSizeMap: { [key: number]: string } = {
      1: 'XS',
      2: 'S',
      3: 'M',
      5: 'L',
      8: 'XL',
      13: 'XXL',
      21: 'XXXL',
    };

    const estimate = issue.estimate || 3;
    const tshirtSize = tshirtSizeMap[estimate] || 'M';

    return {
      epic: epicMatch ? epicMatch[1].trim() : 'Unknown',
      feature: featureMatch ? featureMatch[1].trim() : issue.summary,
      tshirt_size: tshirtSize as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL',
      roles: (issue.components || []) as any[],
    };
  }

  /**
   * Create a summary issue from EstimationResult
   */
  static estimationResultToSummaryIssue(result: EstimationResult, projectName: string): JiraIssue {
    const summary = `${projectName} - Project Estimation Summary`;
    const description = this.buildEstimationDescription(result, projectName);

    return {
      key: '',
      summary,
      description,
      issueType: 'Epic',
      priority: 'High',
      labels: ['estimation-summary', 'project-planning'],
    };
  }

  /**
   * Build a detailed estimation description
   */
  private static buildEstimationDescription(result: EstimationResult, projectName: string): string {
    const roleEffortsText = result.roleEfforts
      .map((re) => `- ${re.role}: ${re.totalHours} hours (${re.fte} FTE) - $${re.cost.toFixed(2)}`)
      .join('\n');

    return `PROJECT ESTIMATION: ${projectName}

OVERVIEW:
- Total Backlog Items: ${result.backlogItemCount}
- Total Base Hours: ${result.totalBaseHours.toFixed(2)}
- Total Project Cost: $${result.totalCost.toFixed(2)}

TIMELINE:
- Start Date: ${result.startDate}
- End Date: ${result.endDate}
- Duration: ${result.durationDays} days (${result.durationWeeks} weeks / ${result.durationSprints} sprints)
- Working Days: ${result.workingDays}

TEAM COMPOSITION:
${roleEffortsText}

ASSUMPTIONS:
${result.assumptions.map((a) => `- ${a}`).join('\n')}

Generated on: ${new Date().toISOString()}`;
  }

  /**
   * Extract estimation data from a Jira issue description
   */
  static extractEstimationFromDescription(description: string): Partial<BacklogItem> {
    const epicMatch = description.match(/Epic:\s*(.+?)(?:\n|$)/);
    const featureMatch = description.match(/Feature:\s*(.+?)(?:\n|$)/);
    const rolesMatch = description.match(/Required Roles:\s*(.+?)(?:\n|$)/);

    return {
      epic: epicMatch ? epicMatch[1].trim() : undefined,
      feature: featureMatch ? featureMatch[1].trim() : undefined,
      roles: rolesMatch ? rolesMatch[1].split(',').map((r) => r.trim() as any) : [],
    };
  }
}

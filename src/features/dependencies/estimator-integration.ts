/**
 * Estimator Integration Module
 * Integrates critical path analysis with project estimation
 */

import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';
import { DependencyCalculator } from './calculator';
import { DependencyDetector } from './detector';
import { Task, ScheduleAnalysis } from './models';
import { parse, format } from 'date-fns';

export interface EstimationWithDependencies extends EstimationResult {
  criticalPathDuration: number;
  criticalTasksCount: number;
  slackAnalysis: { taskId: string; taskName: string; slack: number }[];
  dependencyImpact: number; // Percentage impact on original estimate
}

export class EstimatorIntegration {
  /**
   * Calculate project estimation using critical path analysis
   * This replaces the simple max-hours approach with actual task dependencies
   */
  static calculateEstimationWithDependencies(
    baseEstimation: EstimationResult,
    backlog: BacklogItem[],
    config: EstimationConfig
  ): EstimationWithDependencies {
    // Convert backlog items to tasks with detected dependencies
    const tasks = DependencyDetector.convertBacklogToTasks(backlog);

    // Calculate critical path
    const startDate = parse(config.startDate, 'yyyy-MM-dd', new Date());
    const scheduleAnalysis = DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);

    // Extract critical path information
    const criticalPathDays = scheduleAnalysis.criticalPath.duration;
    const criticalTasksCount = scheduleAnalysis.criticalPath.criticalTasks.length;

    // Create slack analysis
    const slackAnalysis = Array.from(scheduleAnalysis.taskSlacks.entries())
      .map(([taskId, slack]) => ({
        taskId,
        taskName: tasks.find((t) => t.id === taskId)?.name || taskId,
        slack,
      }))
      .sort((a, b) => a.slack - b.slack);

    // Calculate impact of dependencies on schedule
    const originalDays = baseEstimation.workingDays;
    const criticalPathImpact = ((criticalPathDays - originalDays) / originalDays) * 100;

    // Create updated estimation result
    const updatedEstimation: EstimationWithDependencies = {
      ...baseEstimation,
      durationDays: criticalPathDays * 1.4, // Convert working days to calendar days
      workingDays: criticalPathDays,
      durationWeeks: Math.ceil(criticalPathDays / 5),
      durationSprints: Math.ceil((criticalPathDays / 5) / config.sprintLengthWeeks),
      endDate: format(scheduleAnalysis.criticalPath.endDate, 'yyyy-MM-dd'),
      criticalPathDuration: criticalPathDays,
      criticalTasksCount,
      slackAnalysis,
      dependencyImpact: criticalPathImpact,
      assumptions: [
        ...baseEstimation.assumptions,
        `Critical path calculated from task dependencies: ${criticalTasksCount} tasks`,
        `Project affected by dependencies: ${Math.abs(Math.round(criticalPathImpact))}% ${criticalPathImpact > 0 ? 'increase' : 'decrease'}`,
        `${slackAnalysis.filter((s) => s.slack > 0).length} non-critical tasks with scheduling flexibility`,
      ],
    };

    return updatedEstimation;
  }

  /**
   * Get detailed schedule analysis
   */
  static getScheduleAnalysis(
    backlog: BacklogItem[],
    config: EstimationConfig
  ): ScheduleAnalysis {
    const tasks = DependencyDetector.convertBacklogToTasks(backlog);
    const startDate = parse(config.startDate, 'yyyy-MM-dd', new Date());

    return DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);
  }

  /**
   * Identify critical tasks and bottlenecks
   */
  static identifyBottlenecks(
    backlog: BacklogItem[],
    config: EstimationConfig
  ): {
    criticalTasks: string[];
    bottlenecks: string[];
    recommendedActions: string[];
  } {
    const scheduleAnalysis = this.getScheduleAnalysis(backlog, config);
    const tasks = DependencyDetector.convertBacklogToTasks(backlog);
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    const criticalTasks = scheduleAnalysis.criticalPath.criticalTasks;
    const bottlenecks: string[] = [];
    const recommendedActions: string[] = [];

    // Identify bottlenecks: critical tasks that block many other tasks
    for (const taskId of criticalTasks) {
      const task = taskMap.get(taskId);
      if (!task) continue;

      const blockedTasks = tasks.filter((t) =>
        t.dependencies.some((d) => d.taskId === taskId)
      );

      if (blockedTasks.length > 2) {
        bottlenecks.push(`${task.name} blocks ${blockedTasks.length} downstream tasks`);
        recommendedActions.push(
          `Consider parallelizing or splitting "${task.name}" to reduce impact on schedule`
        );
      }
    }

    // Identify long-running critical tasks
    for (const taskId of criticalTasks) {
      const task = taskMap.get(taskId);
      if (task && task.duration > 10) {
        bottlenecks.push(`Long-running critical task: ${task.name} (${task.duration} days)`);
        recommendedActions.push(
          `Break down "${task.name}" into smaller subtasks or allocate more resources`
        );
      }
    }

    return {
      criticalTasks,
      bottlenecks,
      recommendedActions,
    };
  }

  /**
   * Calculate what-if scenarios (adding/removing tasks, changing durations)
   */
  static calculateWhatIf(
    backlog: BacklogItem[],
    config: EstimationConfig,
    modifications: {
      addTasks?: BacklogItem[];
      removeTasks?: string[]; // feature names to remove
      adjustDurations?: { [featureName: string]: number };
    }
  ): {
    original: number;
    modified: number;
    impact: number;
    recommendation: string;
  } {
    // Get original schedule
    const originalAnalysis = this.getScheduleAnalysis(backlog, config);
    const originalDuration = originalAnalysis.criticalPath.duration;

    // Modify backlog
    let modifiedBacklog = [...backlog];

    if (modifications.removeTasks) {
      modifiedBacklog = modifiedBacklog.filter(
        (item) => !modifications.removeTasks!.includes(item.feature)
      );
    }

    if (modifications.addTasks) {
      modifiedBacklog = [...modifiedBacklog, ...modifications.addTasks];
    }

    // Calculate modified schedule
    const modifiedAnalysis = this.getScheduleAnalysis(modifiedBacklog, config);
    const modifiedDuration = modifiedAnalysis.criticalPath.duration;

    const impact = modifiedDuration - originalDuration;
    const impactPercent = (impact / originalDuration) * 100;

    let recommendation = '';
    if (impact > 0) {
      recommendation = `Adding these items will extend the project by ${Math.round(impact)} days (${Math.round(impactPercent)}%)`;
    } else if (impact < 0) {
      recommendation = `Removing these items will shorten the project by ${Math.abs(Math.round(impact))} days (${Math.round(Math.abs(impactPercent))}%)`;
    } else {
      recommendation = 'No impact on critical path';
    }

    return {
      original: originalDuration,
      modified: modifiedDuration,
      impact,
      recommendation,
    };
  }
}

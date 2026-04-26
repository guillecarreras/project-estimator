/**
 * Dependency Calculator
 * Computes critical path, slack time, and schedule analysis
 */

import {
  Task,
  CriticalPathResult,
  ScheduleAnalysis,
  GanttEntry,
  DependencyValidation,
  DependencyError,
} from './models';

export class DependencyCalculator {
  /**
   * Calculate critical path using forward and backward pass
   */
  static calculateCriticalPath(tasks: Task[], startDate: Date): CriticalPathResult {
    // Validate input
    const validation = this.validateDependencies(tasks);
    if (!validation.valid) {
      throw new Error(`Invalid dependencies: ${validation.errors.map((e) => e.error).join(', ')}`);
    }

    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const earliestStart = new Map<string, Date>();
    const earliestFinish = new Map<string, Date>();
    const latestStart = new Map<string, Date>();
    const latestFinish = new Map<string, Date>();

    // Forward pass: calculate earliest start and finish times
    this.forwardPass(tasks, startDate, earliestStart, earliestFinish, taskMap);

    // Find project end date
    let projectEndDate = startDate;
    for (const finish of earliestFinish.values()) {
      if (finish > projectEndDate) {
        projectEndDate = finish;
      }
    }

    // Backward pass: calculate latest start and finish times
    this.backwardPass(tasks, projectEndDate, latestStart, latestFinish, taskMap);

    // Identify critical path (tasks with zero slack)
    const criticalTasks: string[] = [];
    let maxDuration = 0;

    for (const task of tasks) {
      const slack = this.calculateSlack(
        earliestStart.get(task.id)!,
        latestStart.get(task.id)!
      );

      task.slack = slack;
      task.startDate = earliestStart.get(task.id);
      task.endDate = earliestFinish.get(task.id);

      if (slack === 0) {
        criticalTasks.push(task.id);
        task.criticality = 100;
      } else {
        task.criticality = Math.max(0, 100 - (slack * 5)); // reduce criticality by slack
      }
    }

    const duration = Math.ceil(
      (projectEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      tasks,
      duration,
      startDate,
      endDate: projectEndDate,
      criticalTasks,
    };
  }

  /**
   * Calculate complete schedule analysis
   */
  static calculateScheduleAnalysis(
    tasks: Task[],
    startDate: Date
  ): ScheduleAnalysis {
    const criticalPath = this.calculateCriticalPath(tasks, startDate);
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const earliestStart = new Map<string, Date>();
    const earliestFinish = new Map<string, Date>();
    const latestStart = new Map<string, Date>();
    const latestFinish = new Map<string, Date>();
    const taskSlacks = new Map<string, number>();

    // Recalculate to populate maps
    this.forwardPass(tasks, startDate, earliestStart, earliestFinish, taskMap);

    let projectEnd = startDate;
    for (const finish of earliestFinish.values()) {
      if (finish > projectEnd) projectEnd = finish;
    }

    this.backwardPass(tasks, projectEnd, latestStart, latestFinish, taskMap);

    for (const task of tasks) {
      const slack = this.calculateSlack(
        earliestStart.get(task.id)!,
        latestStart.get(task.id)!
      );
      taskSlacks.set(task.id, slack);
    }

    // Generate Gantt entries
    const ganttEntries: GanttEntry[] = tasks.map((task) => ({
      taskId: task.id,
      taskName: task.name,
      startDate: earliestStart.get(task.id)!,
      endDate: earliestFinish.get(task.id)!,
      duration: task.duration,
      resource: task.resourceAllocation,
      percentComplete: 0,
      dependencies: task.dependencies.map((d) => d.taskId),
      level: 0, // Will be set by Gantt renderer
    }));

    return {
      criticalPath,
      ganttEntries,
      earliestStart,
      earliestFinish,
      latestStart,
      latestFinish,
      taskSlacks,
    };
  }

  /**
   * Forward pass: calculate earliest start and finish times
   */
  private static forwardPass(
    tasks: Task[],
    startDate: Date,
    earliestStart: Map<string, Date>,
    earliestFinish: Map<string, Date>,
    taskMap: Map<string, Task>
  ): void {
    // Topological sort
    const sorted = this.topologicalSort(tasks);

    for (const task of sorted) {
      let maxFinish = startDate;

      // Check all predecessors
      for (const dep of task.dependencies) {
        const predTask = taskMap.get(dep.taskId);
        if (predTask) {
          const predFinish = earliestFinish.get(dep.taskId) || startDate;
          const depStart = new Date(predFinish.getTime() + (dep.lag || 0) * 24 * 60 * 60 * 1000);
          if (depStart > maxFinish) {
            maxFinish = depStart;
          }
        }
      }

      // If no predecessors, start at project start
      if (task.dependencies.length === 0) {
        maxFinish = startDate;
      }

      earliestStart.set(task.id, maxFinish);
      const finish = new Date(maxFinish.getTime() + task.duration * 24 * 60 * 60 * 1000);
      earliestFinish.set(task.id, finish);
    }
  }

  /**
   * Backward pass: calculate latest start and finish times
   */
  private static backwardPass(
    tasks: Task[],
    projectEnd: Date,
    latestStart: Map<string, Date>,
    latestFinish: Map<string, Date>,
    taskMap: Map<string, Task>
  ): void {
    // Reverse topological sort
    const sorted = this.topologicalSort(tasks).reverse();

    for (const task of sorted) {
      let minStart = projectEnd;

      // Check all successors
      const successors = tasks.filter((t) =>
        t.dependencies.some((d) => d.taskId === task.id)
      );

      if (successors.length === 0) {
        // End task
        minStart = new Date(projectEnd.getTime() - task.duration * 24 * 60 * 60 * 1000);
      } else {
        for (const succ of successors) {
          const succStart = latestStart.get(succ.id) || projectEnd;
          const depEnd = new Date(
            succStart.getTime() - ((succ.dependencies.find((d) => d.taskId === task.id)?.lag) || 0) * 24 * 60 * 60 * 1000
          );
          if (depEnd < minStart) {
            minStart = depEnd;
          }
        }
      }

      latestStart.set(task.id, minStart);
      const finish = new Date(minStart.getTime() + task.duration * 24 * 60 * 60 * 1000);
      latestFinish.set(task.id, finish);
    }
  }

  /**
   * Topological sort of tasks
   */
  private static topologicalSort(tasks: Task[]): Task[] {
    const sorted: Task[] = [];
    const visited = new Set<string>();

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Visit all predecessors first
      for (const dep of task.dependencies) {
        visit(dep.taskId);
      }

      sorted.push(task);
    };

    for (const task of tasks) {
      visit(task.id);
    }

    return sorted;
  }

  /**
   * Calculate slack (float) time
   */
  private static calculateSlack(earliestStart: Date, latestStart: Date): number {
    const diff = latestStart.getTime() - earliestStart.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Validate task dependencies for cycles
   */
  static validateDependencies(tasks: Task[]): DependencyValidation {
    const errors: DependencyError[] = [];
    const warnings: string[] = [];
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    // Check for circular dependencies
    for (const task of tasks) {
      if (this.hasCyclicDependency(task.id, taskMap)) {
        errors.push({
          taskId: task.id,
          error: `Circular dependency detected for task: ${task.name}`,
        });
      }
    }

    // Check for missing dependencies
    for (const task of tasks) {
      for (const dep of task.dependencies) {
        if (!taskMap.has(dep.taskId)) {
          errors.push({
            taskId: task.id,
            error: `Predecessor task not found: ${dep.taskId}`,
          });
        }
      }
    }

    // Warnings for tasks with no dependencies
    for (const task of tasks) {
      if (task.dependencies.length === 0 && task.id !== tasks[0]?.id) {
        warnings.push(`Task ${task.name} has no predecessors`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if a task has circular dependencies
   */
  private static hasCyclicDependency(
    taskId: string,
    taskMap: Map<string, Task>,
    visited = new Set<string>()
  ): boolean {
    if (visited.has(taskId)) {
      return true;
    }

    const task = taskMap.get(taskId);
    if (!task) return false;

    visited.add(taskId);

    for (const dep of task.dependencies) {
      if (this.hasCyclicDependency(dep.taskId, taskMap, visited)) {
        return true;
      }
    }

    visited.delete(taskId);
    return false;
  }
}

/**
 * Gantt & Precedence Diagram Generator
 * Creates visual representations of project schedules
 */

import {
  Task,
  ScheduleAnalysis,
  PrecedenceDiagram,
  DiagramNode,
  DiagramEdge,
  GanttEntry,
} from './models';
import { DependencyCalculator } from './calculator';

export class GanttGenerator {
  /**
   * Generate precedence diagram (PERT chart)
   */
  static generatePrecedenceDiagram(
    tasks: Task[],
    startDate: Date
  ): PrecedenceDiagram {
    const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];

    // Create nodes
    for (const task of tasks) {
      const earlyStart = analysis.earliestStart.get(task.id);
      const earlyFinish = analysis.earliestFinish.get(task.id);
      const lateStart = analysis.latestStart.get(task.id);
      const lateFinish = analysis.latestFinish.get(task.id);
      const slack = analysis.taskSlacks.get(task.id) || 0;

      if (earlyStart && earlyFinish && lateStart && lateFinish) {
        const earlyStartDays = this.getDaysDiff(startDate, earlyStart);
        const earlyFinishDays = this.getDaysDiff(startDate, earlyFinish);
        const lateStartDays = this.getDaysDiff(startDate, lateStart);
        const lateFinishDays = this.getDaysDiff(startDate, lateFinish);

        nodes.push({
          id: task.id,
          label: task.name,
          duration: task.duration,
          earlyStart: earlyStartDays,
          earlyFinish: earlyFinishDays,
          lateStart: lateStartDays,
          lateFinish: lateFinishDays,
          slack: slack,
          isCritical: slack === 0,
        });
      }
    }

    // Create edges
    for (const task of tasks) {
      for (const dep of task.dependencies) {
        const isCritical = analysis.criticalPath.criticalTasks.includes(task.id) &&
          analysis.criticalPath.criticalTasks.includes(dep.taskId);

        edges.push({
          from: dep.taskId,
          to: task.id,
          type: dep.type,
          lag: dep.lag || 0,
          isCritical,
        });
      }
    }

    // Position nodes (simple left-to-right layout)
    this.positionNodes(nodes, edges);

    return {
      nodes,
      edges,
      metadata: {
        projectDuration: analysis.criticalPath.duration,
        startDate,
        endDate: analysis.criticalPath.endDate,
        criticalPathLength: analysis.criticalPath.criticalTasks.length,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Generate Gantt chart CSV format
   */
  static generateGanttCSV(analysis: ScheduleAnalysis): string {
    const rows: string[] = [];
    rows.push('Task ID,Task Name,Start Date,End Date,Duration (days),Resource,Dependencies');

    for (const entry of analysis.ganttEntries) {
      const startStr = entry.startDate.toISOString().split('T')[0];
      const endStr = entry.endDate.toISOString().split('T')[0];
      const depsStr = entry.dependencies.length > 0 ? entry.dependencies.join(';') : '-';
      const resource = entry.resource || '-';

      rows.push(
        `"${entry.taskId}","${entry.taskName}","${startStr}","${endStr}",${entry.duration},"${resource}","${depsStr}"`
      );
    }

    return rows.join('\n');
  }

  /**
   * Generate Gantt chart HTML
   */
  static generateGanttHTML(analysis: ScheduleAnalysis, title = 'Project Gantt Chart'): string {
    const ganttEntries = analysis.ganttEntries;
    const startDate = analysis.criticalPath.startDate;
    const endDate = analysis.criticalPath.endDate;

    const projectDays = this.getDaysDiff(startDate, endDate);
    const pixelsPerDay = 5;

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .gantt-container { overflow-x: auto; margin: 20px 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .timeline { display: flex; margin-top: 10px; }
    .task-bar { height: 20px; background-color: #2196F3; margin: 2px; border-radius: 3px; }
    .critical { background-color: #f44336 !important; }
    .legend { margin: 20px 0; }
    .legend-item { display: inline-block; margin-right: 20px; }
    .legend-color { display: inline-block; width: 15px; height: 15px; margin-right: 5px; vertical-align: middle; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="legend">
    <div class="legend-item"><span class="legend-color" style="background-color: #f44336;"></span>Critical Path</div>
    <div class="legend-item"><span class="legend-color" style="background-color: #2196F3;"></span>Regular Task</div>
  </div>
  <div class="gantt-container">
    <table>
      <thead>
        <tr>
          <th>Task</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Duration</th>
          <th>Resource</th>
          <th style="width: ${projectDays * pixelsPerDay}px;">Gantt Chart</th>
        </tr>
      </thead>
      <tbody>`;

    for (const entry of ganttEntries) {
      const taskStartDays = this.getDaysDiff(startDate, entry.startDate);
      const barWidth = entry.duration * pixelsPerDay;
      const leftMargin = taskStartDays * pixelsPerDay;
      const isCritical = analysis.criticalPath.criticalTasks.includes(entry.taskId);

      html += `
        <tr>
          <td><strong>${entry.taskName}</strong></td>
          <td>${entry.startDate.toISOString().split('T')[0]}</td>
          <td>${entry.endDate.toISOString().split('T')[0]}</td>
          <td>${entry.duration} days</td>
          <td>${entry.resource || '-'}</td>
          <td>
            <div style="position: relative; height: 30px;">
              <div class="task-bar ${isCritical ? 'critical' : ''}"
                   style="width: ${barWidth}px; margin-left: ${leftMargin}px;"
                   title="${entry.taskName}"></div>
            </div>
          </td>
        </tr>`;
    }

    html += `
      </tbody>
    </table>
  </div>
  <p>Generated on: ${new Date().toISOString()}</p>
</body>
</html>`;

    return html;
  }

  /**
   * Generate JSON representation of Gantt chart
   */
  static generateGanttJSON(analysis: ScheduleAnalysis): any {
    return {
      project: {
        startDate: analysis.criticalPath.startDate.toISOString(),
        endDate: analysis.criticalPath.endDate.toISOString(),
        durationDays: analysis.criticalPath.duration,
        criticalPathLength: analysis.criticalPath.criticalTasks.length,
      },
      tasks: analysis.ganttEntries.map((entry) => ({
        id: entry.taskId,
        name: entry.taskName,
        startDate: entry.startDate.toISOString(),
        endDate: entry.endDate.toISOString(),
        duration: entry.duration,
        resource: entry.resource,
        dependencies: entry.dependencies,
        slack: analysis.taskSlacks.get(entry.taskId) || 0,
        isCritical: analysis.criticalPath.criticalTasks.includes(entry.taskId),
      })),
    };
  }

  /**
   * Position nodes for diagram layout
   */
  private static positionNodes(nodes: DiagramNode[], edges: DiagramEdge[]): void {
    // Simple horizontal layout: position by early start time
    const maxLevel = this.calculateLevels(nodes, edges);

    for (const node of nodes) {
      node.x = node.earlyStart * 50; // 50 pixels per day
      node.y = (node.slack === 0 ? 1 : 2) * 100; // Critical on top, others below
    }
  }

  /**
   * Calculate hierarchy levels for layout
   */
  private static calculateLevels(nodes: DiagramNode[], edges: DiagramEdge[]): number {
    let maxLevel = 0;
    const nodeLevels = new Map<string, number>();

    for (const node of nodes) {
      const incomingEdges = edges.filter((e) => e.to === node.id);
      if (incomingEdges.length === 0) {
        nodeLevels.set(node.id, 0);
      } else {
        let maxPredLevel = 0;
        for (const edge of incomingEdges) {
          const predLevel = nodeLevels.get(edge.from) || 0;
          maxPredLevel = Math.max(maxPredLevel, predLevel);
        }
        nodeLevels.set(node.id, maxPredLevel + 1);
        maxLevel = Math.max(maxLevel, maxPredLevel + 1);
      }
    }

    return maxLevel;
  }

  /**
   * Calculate days difference between two dates
   */
  private static getDaysDiff(from: Date, to: Date): number {
    const diff = to.getTime() - from.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

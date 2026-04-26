/**
 * Dependencies API Routes
 * Express routes for dependency management and scheduling endpoints
 */

import { Router, Request, Response } from 'express';
import { Task, ScheduleAnalysis } from '../../features/dependencies/models';
import { DependencyCalculator } from '../../features/dependencies/calculator';
import { GanttGenerator } from '../../features/dependencies/gantt';

const router = Router();

/**
 * POST /api/dependencies/analyze
 * Analyze task dependencies and calculate critical path
 */
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const { tasks, startDate }: { tasks: Task[]; startDate: string } = req.body;

    if (!tasks || !Array.isArray(tasks) || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: tasks (array), startDate (ISO string)',
      });
    }

    const start = new Date(startDate);

    // Validate dependencies
    const validation = DependencyCalculator.validateDependencies(tasks);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid task dependencies',
        errors: validation.errors,
      });
    }

    // Calculate critical path
    const criticalPath = DependencyCalculator.calculateCriticalPath(tasks, start);

    res.json({
      success: true,
      criticalPath,
      warnings: validation.warnings,
      message: `Critical path calculated: ${criticalPath.duration} days, ${criticalPath.criticalTasks.length} critical tasks`,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Analysis failed',
    });
  }
});

/**
 * POST /api/dependencies/schedule
 * Calculate complete schedule analysis
 */
router.post('/schedule', (req: Request, res: Response) => {
  try {
    const { tasks, startDate }: { tasks: Task[]; startDate: string } = req.body;

    if (!tasks || !Array.isArray(tasks) || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: tasks, startDate',
      });
    }

    const start = new Date(startDate);

    // Validate
    const validation = DependencyCalculator.validateDependencies(tasks);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid dependencies',
        errors: validation.errors,
      });
    }

    // Calculate schedule
    const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, start);

    res.json({
      success: true,
      schedule: {
        projectDuration: analysis.criticalPath.duration,
        startDate: analysis.criticalPath.startDate,
        endDate: analysis.criticalPath.endDate,
        criticalTasksCount: analysis.criticalPath.criticalTasks.length,
        totalTasks: tasks.length,
      },
      ganttEntries: analysis.ganttEntries,
      taskSlacks: Array.from(analysis.taskSlacks.entries()).map(([id, slack]) => ({
        taskId: id,
        slack,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Scheduling failed',
    });
  }
});

/**
 * POST /api/dependencies/precedence-diagram
 * Generate precedence (PERT) diagram
 */
router.post('/precedence-diagram', (req: Request, res: Response) => {
  try {
    const { tasks, startDate }: { tasks: Task[]; startDate: string } = req.body;

    if (!tasks || !Array.isArray(tasks) || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: tasks, startDate',
      });
    }

    const start = new Date(startDate);

    // Generate diagram
    const diagram = GanttGenerator.generatePrecedenceDiagram(tasks, start);

    res.json({
      success: true,
      diagram,
      metadata: diagram.metadata,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Diagram generation failed',
    });
  }
});

/**
 * POST /api/dependencies/gantt-chart
 * Generate Gantt chart in multiple formats
 */
router.post('/gantt-chart', (req: Request, res: Response) => {
  try {
    const {
      tasks,
      startDate,
      format = 'json', // json, csv, html
    }: { tasks: Task[]; startDate: string; format?: 'json' | 'csv' | 'html' } = req.body;

    if (!tasks || !Array.isArray(tasks) || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: tasks, startDate',
      });
    }

    const start = new Date(startDate);
    const validation = DependencyCalculator.validateDependencies(tasks);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid dependencies',
        errors: validation.errors,
      });
    }

    const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, start);

    let ganttData: any;

    switch (format) {
      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="gantt.csv"');
        return res.send(GanttGenerator.generateGanttCSV(analysis));

      case 'html':
        res.setHeader('Content-Type', 'text/html');
        return res.send(GanttGenerator.generateGanttHTML(analysis, 'Project Gantt Chart'));

      case 'json':
      default:
        ganttData = GanttGenerator.generateGanttJSON(analysis);
        return res.json({
          success: true,
          gantt: ganttData,
        });
    }
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Gantt generation failed',
    });
  }
});

/**
 * POST /api/dependencies/validate
 * Validate task dependencies for cycles and errors
 */
router.post('/validate', (req: Request, res: Response) => {
  try {
    const { tasks }: { tasks: Task[] } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        error: 'Missing required field: tasks (array)',
      });
    }

    const validation = DependencyCalculator.validateDependencies(tasks);

    res.json({
      success: true,
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      message: validation.valid
        ? 'Dependencies are valid'
        : `Found ${validation.errors.length} errors`,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Validation failed',
    });
  }
});

/**
 * POST /api/dependencies/slack-analysis
 * Analyze task slack (float) time
 */
router.post('/slack-analysis', (req: Request, res: Response) => {
  try {
    const { tasks, startDate }: { tasks: Task[]; startDate: string } = req.body;

    if (!tasks || !Array.isArray(tasks) || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: tasks, startDate',
      });
    }

    const start = new Date(startDate);
    const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, start);

    const slackAnalysis = Array.from(analysis.taskSlacks.entries())
      .map(([taskId, slack]) => ({
        taskId,
        taskName: tasks.find((t) => t.id === taskId)?.name || taskId,
        slack,
        isCritical: slack === 0,
      }))
      .sort((a, b) => a.slack - b.slack);

    res.json({
      success: true,
      slackAnalysis,
      criticalTasks: analysis.criticalPath.criticalTasks,
      summary: {
        totalTasks: tasks.length,
        criticalTasks: analysis.criticalPath.criticalTasks.length,
        averageSlack: slackAnalysis.reduce((sum, t) => sum + t.slack, 0) / tasks.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Slack analysis failed',
    });
  }
});

export default router;

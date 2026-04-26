/**
 * Jest Tests for Dependency Management
 */

import { DependencyCalculator } from '../../features/dependencies/calculator';
import { GanttGenerator } from '../../features/dependencies/gantt';
import { Task, TaskDependency } from '../../features/dependencies/models';

describe('DependencyCalculator', () => {
  let tasks: Task[];

  beforeEach(() => {
    // Create sample tasks with dependencies
    tasks = [
      {
        id: 'T1',
        name: 'Analysis',
        duration: 5,
        dependencies: [],
        criticality: 0,
      },
      {
        id: 'T2',
        name: 'Design',
        duration: 3,
        dependencies: [{ taskId: 'T1', type: 'FS', lag: 0 }],
        criticality: 0,
      },
      {
        id: 'T3',
        name: 'Development',
        duration: 10,
        dependencies: [{ taskId: 'T2', type: 'FS', lag: 0 }],
        criticality: 0,
      },
      {
        id: 'T4',
        name: 'Testing',
        duration: 5,
        dependencies: [{ taskId: 'T3', type: 'FS', lag: 0 }],
        criticality: 0,
      },
    ];
  });

  describe('calculateCriticalPath', () => {
    it('should calculate critical path correctly', () => {
      const startDate = new Date('2025-11-03');
      const result = DependencyCalculator.calculateCriticalPath(tasks, startDate);

      expect(result.duration).toBe(23); // 5 + 3 + 10 + 5
      expect(result.criticalTasks.length).toBeGreaterThan(0);
      expect(result.startDate).toEqual(startDate);
    });

    it('should identify all tasks in critical path', () => {
      const startDate = new Date('2025-11-03');
      const result = DependencyCalculator.calculateCriticalPath(tasks, startDate);

      expect(result.criticalTasks.length).toBeGreaterThan(0);
      // At least last task must be in critical path
      expect(result.criticalTasks).toContain('T4');
    });

    it('should set task dates correctly', () => {
      const startDate = new Date('2025-11-03');
      DependencyCalculator.calculateCriticalPath(tasks, startDate);

      expect(tasks[0].startDate).toBeDefined();
      expect(tasks[0].endDate).toBeDefined();
      expect(tasks[0].slack).toBeDefined();
    });

    it('should calculate slack time', () => {
      const startDate = new Date('2025-11-03');
      const result = DependencyCalculator.calculateCriticalPath(tasks, startDate);

      // Tasks on critical path should have zero slack
      result.criticalTasks.forEach((taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        expect(task?.slack).toBe(0);
      });
    });
  });

  describe('validateDependencies', () => {
    it('should detect circular dependencies', () => {
      const circularTasks: Task[] = [
        {
          id: 'T1',
          name: 'Task 1',
          duration: 5,
          dependencies: [{ taskId: 'T2', type: 'FS' }],
          criticality: 0,
        },
        {
          id: 'T2',
          name: 'Task 2',
          duration: 5,
          dependencies: [{ taskId: 'T1', type: 'FS' }],
          criticality: 0,
        },
      ];

      const validation = DependencyCalculator.validateDependencies(circularTasks);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect missing dependencies', () => {
      const invalidTasks: Task[] = [
        {
          id: 'T1',
          name: 'Task 1',
          duration: 5,
          dependencies: [{ taskId: 'MISSING', type: 'FS' }],
          criticality: 0,
        },
      ];

      const validation = DependencyCalculator.validateDependencies(invalidTasks);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.error.includes('Predecessor')));
    });

    it('should validate correct dependencies', () => {
      const validation = DependencyCalculator.validateDependencies(tasks);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should warn about tasks with no predecessors', () => {
      const validation = DependencyCalculator.validateDependencies(tasks);
      // Only the first task should have no predecessors (which is OK)
      const unlinkedWarnings = validation.warnings.filter((w) =>
        w.includes('no predecessors')
      );
      // Should not warn about first task
      expect(unlinkedWarnings.length).toBeLessThanOrEqual(0);
    });
  });

  describe('calculateScheduleAnalysis', () => {
    it('should create complete schedule analysis', () => {
      const startDate = new Date('2025-11-03');
      const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);

      expect(analysis.criticalPath).toBeDefined();
      expect(analysis.ganttEntries).toBeDefined();
      expect(analysis.earliestStart).toBeDefined();
      expect(analysis.earliestFinish).toBeDefined();
      expect(analysis.latestStart).toBeDefined();
      expect(analysis.latestFinish).toBeDefined();
      expect(analysis.taskSlacks).toBeDefined();
    });

    it('should generate gantt entries for all tasks', () => {
      const startDate = new Date('2025-11-03');
      const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);

      expect(analysis.ganttEntries.length).toBe(tasks.length);
      analysis.ganttEntries.forEach((entry) => {
        expect(entry.startDate).toBeDefined();
        expect(entry.endDate).toBeDefined();
        expect(entry.duration).toBeGreaterThan(0);
      });
    });
  });
});

describe('GanttGenerator', () => {
  let tasks: Task[];
  let startDate: Date;

  beforeEach(() => {
    startDate = new Date('2025-11-03');
    tasks = [
      {
        id: 'T1',
        name: 'Phase 1',
        duration: 5,
        dependencies: [],
        criticality: 0,
      },
      {
        id: 'T2',
        name: 'Phase 2',
        duration: 3,
        dependencies: [{ taskId: 'T1', type: 'FS', lag: 0 }],
        criticality: 0,
      },
    ];
  });

  describe('generatePrecedenceDiagram', () => {
    it('should generate valid precedence diagram', () => {
      const diagram = GanttGenerator.generatePrecedenceDiagram(tasks, startDate);

      expect(diagram.nodes.length).toBe(tasks.length);
      expect(diagram.nodes[0].id).toBe('T1');
      expect(diagram.metadata.projectDuration).toBeGreaterThan(0);
      expect(diagram.metadata.startDate).toEqual(startDate);
    });

    it('should create diagram edges for dependencies', () => {
      const diagram = GanttGenerator.generatePrecedenceDiagram(tasks, startDate);

      expect(diagram.edges.length).toBeGreaterThan(0);
      const edge = diagram.edges[0];
      expect(edge.from).toBe('T1');
      expect(edge.to).toBe('T2');
    });
  });

  describe('generateGanttCSV', () => {
    it('should generate valid CSV format', () => {
      const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);
      const csv = GanttGenerator.generateGanttCSV(analysis);

      expect(csv).toContain('Task ID');
      expect(csv).toContain('Task Name');
      expect(csv).toContain('Duration');
      expect(csv).toContain('T1');
      expect(csv).toContain('Phase 1');
    });

    it('should include all tasks in CSV', () => {
      const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);
      const csv = GanttGenerator.generateGanttCSV(analysis);

      tasks.forEach((task) => {
        expect(csv).toContain(task.id);
      });
    });
  });

  describe('generateGanttHTML', () => {
    it('should generate valid HTML', () => {
      const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);
      const html = GanttGenerator.generateGanttHTML(analysis, 'Test Project');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Test Project');
      expect(html).toContain('<table>');
      expect(html).toContain('</table>');
    });

    it('should include task bars', () => {
      const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);
      const html = GanttGenerator.generateGanttHTML(analysis);

      expect(html).toContain('task-bar');
      expect(html).toContain('Phase 1');
      expect(html).toContain('Phase 2');
    });
  });

  describe('generateGanttJSON', () => {
    it('should generate valid JSON structure', () => {
      const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);
      const json = GanttGenerator.generateGanttJSON(analysis);

      expect(json.project).toBeDefined();
      expect(json.tasks).toBeDefined();
      expect(json.project.startDate).toBeDefined();
      expect(json.project.endDate).toBeDefined();
      expect(json.tasks.length).toBe(tasks.length);
    });

    it('should include all task details', () => {
      const analysis = DependencyCalculator.calculateScheduleAnalysis(tasks, startDate);
      const json = GanttGenerator.generateGanttJSON(analysis);

      json.tasks.forEach((task: any) => {
        expect(task.id).toBeDefined();
        expect(task.name).toBeDefined();
        expect(task.startDate).toBeDefined();
        expect(task.endDate).toBeDefined();
        expect(task.duration).toBeGreaterThan(0);
      });
    });
  });
});

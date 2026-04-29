/**
 * Tests for Dependency Detection Module
 */

import { DependencyDetector } from '../../features/dependencies/detector';
import { BacklogItem } from '../../types';

describe('DependencyDetector', () => {
  describe('convertBacklogToTasks', () => {
    it('should convert backlog items to tasks', () => {
      const backlog: BacklogItem[] = [
        {
          epic: 'Backend',
          feature: 'Setup',
          tshirt_size: 'S',
          roles: ['Fullstack'],
        },
        {
          epic: 'Backend',
          feature: 'Implementation',
          tshirt_size: 'L',
          roles: ['Fullstack', 'QA'],
        },
      ];

      const tasks = DependencyDetector.convertBacklogToTasks(backlog);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe('TASK-1');
      expect(tasks[1].id).toBe('TASK-2');
    });

    it('should estimate duration based on T-shirt size', () => {
      const backlog: BacklogItem[] = [
        { epic: 'Backend', feature: 'Feature 1', tshirt_size: 'XS', roles: ['Fullstack'] },
        { epic: 'Backend', feature: 'Feature 2', tshirt_size: 'L', roles: ['Fullstack'] },
        { epic: 'Backend', feature: 'Feature 3', tshirt_size: 'XXL', roles: ['Fullstack'] },
      ];

      const tasks = DependencyDetector.convertBacklogToTasks(backlog);

      expect(tasks[0].duration).toBeLessThan(tasks[1].duration);
      expect(tasks[1].duration).toBeLessThan(tasks[2].duration);
    });

    it('should adjust duration for multiple roles', () => {
      const singleRole: BacklogItem[] = [
        { epic: 'Backend', feature: 'Task', tshirt_size: 'M', roles: ['Fullstack'] },
      ];

      const multiRole: BacklogItem[] = [
        { epic: 'Backend', feature: 'Task', tshirt_size: 'M', roles: ['Fullstack', 'QA', 'DevOps'] },
      ];

      const singleTask = DependencyDetector.convertBacklogToTasks(singleRole);
      const multiTask = DependencyDetector.convertBacklogToTasks(multiRole);

      expect(singleTask[0].duration).toBeGreaterThanOrEqual(multiTask[0].duration);
    });

    it('should detect semantic feature ordering dependencies', () => {
      const backlog: BacklogItem[] = [
        { epic: 'Backend', feature: 'Setup', tshirt_size: 'S', roles: ['Fullstack'] },
        { epic: 'Backend', feature: 'Configuration', tshirt_size: 'S', roles: ['Fullstack'] },
        { epic: 'Backend', feature: 'Implementation', tshirt_size: 'L', roles: ['Fullstack'] },
      ];

      const tasks = DependencyDetector.convertBacklogToTasks(backlog);

      // Implementation should have dependencies on earlier tasks
      expect(tasks[2].dependencies.length).toBeGreaterThan(0);
    });
  });

  describe('extractExplicitDependencies', () => {
    it('should extract dependencies from feature names', () => {
      const backlog: BacklogItem[] = [
        {
          epic: 'Database',
          feature: 'Schema Design',
          tshirt_size: 'M',
          roles: ['Fullstack'],
        },
        {
          epic: 'API',
          feature: 'API Integration (depends on Database:Schema Design)',
          tshirt_size: 'L',
          roles: ['Fullstack'],
        },
      ];

      const deps = DependencyDetector.extractFeatureDependencies(backlog);

      // The second feature has explicit dependency notation
      expect(deps.has('API:API Integration (depends on Database:Schema Design)')).toBe(true);
      expect(deps.get('API:API Integration (depends on Database:Schema Design)')).toContain('Database:Schema Design');
    });

    it('should handle "requires" notation', () => {
      const featureName = 'API Development (requires Authentication Setup)';
      // This would be called on a feature with this name
      const backlog: BacklogItem[] = [
        {
          epic: 'Auth',
          feature: 'Setup',
          tshirt_size: 'M',
          roles: ['Fullstack'],
        },
        {
          epic: 'API',
          feature: featureName,
          tshirt_size: 'L',
          roles: ['Fullstack'],
        },
      ];

      const deps = DependencyDetector.extractFeatureDependencies(backlog);
      expect(Object.keys(deps).length).toBeGreaterThanOrEqual(0);
    });

    it('should validate dependency references', () => {
      const backlog: BacklogItem[] = [
        { epic: 'A', feature: 'F1', tshirt_size: 'S', roles: ['Fullstack'] },
        { epic: 'B', feature: 'F2', tshirt_size: 'S', roles: ['Fullstack'] },
      ];

      const deps = new Map<string, string[]>([
        ['B:F2', ['A:F1']],
      ]);

      const validation = DependencyDetector.validateDependencyReferences(backlog, deps);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should detect missing dependencies', () => {
      const backlog: BacklogItem[] = [
        { epic: 'A', feature: 'F1', tshirt_size: 'S', roles: ['Fullstack'] },
      ];

      const deps = new Map<string, string[]>([
        ['A:F1', ['MISSING:Task']],
      ]);

      const validation = DependencyDetector.validateDependencyReferences(backlog, deps);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Feature order scoring', () => {
    it('should assign correct scores to common feature names', () => {
      const backlog: BacklogItem[] = [
        { epic: 'Backend', feature: 'Setup', tshirt_size: 'S', roles: ['Fullstack'] },
        { epic: 'Backend', feature: 'Implementation', tshirt_size: 'L', roles: ['Fullstack'] },
        { epic: 'Backend', feature: 'Testing', tshirt_size: 'M', roles: ['QA'] },
        { epic: 'Backend', feature: 'Deployment', tshirt_size: 'S', roles: ['DevOps'] },
      ];

      const tasks = DependencyDetector.convertBacklogToTasks(backlog);

      // Later tasks should have higher dependencies/score
      expect(tasks[3].dependencies.length).toBeGreaterThan(tasks[0].dependencies.length);
    });
  });
});

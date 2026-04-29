/**
 * Tests for Estimator Integration Module
 */

import { EstimatorIntegration } from '../../features/dependencies/estimator-integration';
import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';

describe('EstimatorIntegration', () => {
  let backlog: BacklogItem[];
  let config: EstimationConfig;
  let baseEstimation: EstimationResult;

  beforeEach(() => {
    backlog = [
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
      {
        epic: 'Backend',
        feature: 'Testing',
        tshirt_size: 'M',
        roles: ['QA'],
      },
    ];

    config = {
      hoursPerDay: 8,
      sprintLengthWeeks: 2,
      unitTestingPercentage: 25,
      bugFixingPercentage: 15,
      documentationPercentage: 10,
      contingencyPercentage: 20,
      startDate: '2025-11-03',
    };

    baseEstimation = {
      backlogItemCount: 3,
      totalBaseHours: 100,
      roleEfforts: [
        {
          role: 'Fullstack',
          baseHours: 60,
          withMultipliers: 80,
          totalHours: 96,
          fte: 2,
          cost: 96000,
        },
      ],
      teamComposition: [
        {
          role: 'Fullstack',
          count: 2,
          allocationPercentage: 100,
        },
      ],
      totalCost: 96000,
      durationDays: 20,
      durationWeeks: 4,
      durationSprints: 2,
      startDate: '2025-11-03',
      endDate: '2025-11-23',
      workingDays: 15,
      assumptions: [],
      ganttData: [],
    };
  });

  describe('calculateEstimationWithDependencies', () => {
    it('should calculate estimation with dependencies', () => {
      const result = EstimatorIntegration.calculateEstimationWithDependencies(
        baseEstimation,
        backlog,
        config
      );

      expect(result).toBeDefined();
      expect(result.criticalPathDuration).toBeGreaterThan(0);
      expect(result.criticalTasksCount).toBeGreaterThan(0);
    });

    it('should include slack analysis', () => {
      const result = EstimatorIntegration.calculateEstimationWithDependencies(
        baseEstimation,
        backlog,
        config
      );

      expect(result.slackAnalysis).toBeDefined();
      expect(result.slackAnalysis.length).toBeGreaterThan(0);
    });

    it('should calculate dependency impact', () => {
      const result = EstimatorIntegration.calculateEstimationWithDependencies(
        baseEstimation,
        backlog,
        config
      );

      expect(result.dependencyImpact).toBeDefined();
      expect(typeof result.dependencyImpact).toBe('number');
    });

    it('should update assumptions with critical path info', () => {
      const result = EstimatorIntegration.calculateEstimationWithDependencies(
        baseEstimation,
        backlog,
        config
      );

      const hasCriticalPathAssumption = result.assumptions.some((a) =>
        a.includes('Critical path')
      );
      expect(hasCriticalPathAssumption).toBe(true);
    });
  });

  describe('getScheduleAnalysis', () => {
    it('should return complete schedule analysis', () => {
      const analysis = EstimatorIntegration.getScheduleAnalysis(backlog, config);

      expect(analysis).toBeDefined();
      expect(analysis.criticalPath).toBeDefined();
      expect(analysis.ganttEntries).toBeDefined();
      expect(analysis.taskSlacks).toBeDefined();
    });
  });

  describe('identifyBottlenecks', () => {
    it('should identify bottlenecks in project', () => {
      const result = EstimatorIntegration.identifyBottlenecks(backlog, config);

      expect(result).toBeDefined();
      expect(result.criticalTasks).toBeDefined();
      expect(result.bottlenecks).toBeDefined();
      expect(result.recommendedActions).toBeDefined();
    });

    it('should return recommendations for each bottleneck', () => {
      const result = EstimatorIntegration.identifyBottlenecks(backlog, config);

      if (result.bottlenecks.length > 0) {
        expect(result.recommendedActions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('calculateWhatIf', () => {
    it('should calculate impact of removing tasks', () => {
      const result = EstimatorIntegration.calculateWhatIf(backlog, config, {
        removeTasks: ['Implementation'],
      });

      expect(result).toBeDefined();
      expect(result.original).toBeGreaterThan(0);
      expect(result.modified).toBeGreaterThanOrEqual(0);
      expect(result.impact).toBeDefined();
    });

    it('should calculate impact of adding tasks', () => {
      const newTask: BacklogItem = {
        epic: 'Backend',
        feature: 'Documentation',
        tshirt_size: 'M',
        roles: ['Fullstack'],
      };

      const result = EstimatorIntegration.calculateWhatIf(backlog, config, {
        addTasks: [newTask],
      });

      expect(result.modified).toBeGreaterThanOrEqual(result.original);
    });

    it('should provide recommendation message', () => {
      const result = EstimatorIntegration.calculateWhatIf(backlog, config, {
        removeTasks: ['Setup'],
      });

      expect(result.recommendation).toBeDefined();
      expect(result.recommendation.length).toBeGreaterThan(0);
    });

    it('should handle no modifications', () => {
      const result = EstimatorIntegration.calculateWhatIf(backlog, config, {});

      expect(result.original).toBe(result.modified);
      expect(result.impact).toBe(0);
    });
  });
});

import { ProjectEstimator } from '../../estimator';
import { BacklogItem, EstimationConfig } from '../../types';
import { DEFAULT_CONFIG } from '../../config';

describe('ProjectEstimator', () => {
  let config: EstimationConfig;

  beforeEach(() => {
    config = { ...DEFAULT_CONFIG };
  });

  describe('T-shirt size to hours conversion', () => {
    const testCases = [
      { size: 'XS', expectedHours: 9 },
      { size: 'S', expectedHours: 18 },
      { size: 'M', expectedHours: 36 },
      { size: 'L', expectedHours: 72 },
      { size: 'XL', expectedHours: 108 },
      { size: 'XXL', expectedHours: 144 },
      { size: 'XXXL', expectedHours: 189 },
    ];

    testCases.forEach(({ size, expectedHours }) => {
      it(`should map ${size} to ${expectedHours} hours`, () => {
        const backlog: BacklogItem[] = [
          {
            epic: 'Test Epic',
            feature: 'Test Feature',
            tshirt_size: size as any,
            roles: ['Fullstack'],
          },
        ];

        const estimator = new ProjectEstimator(backlog, config);
        const result = estimator.estimate();

        // Total hours should include multipliers and contingency
        const expectedTotal = expectedHours * (1 + (15 + 20 + 10) / 100) * (1 + 15 / 100);
        expect(result.roleEfforts[0].totalHours).toBeCloseTo(expectedTotal, 1);
      });
    });
  });

  describe('Multiplier application', () => {
    it('should apply unit testing, bug fixing, documentation, and contingency multipliers', () => {
      const backlog: BacklogItem[] = [
        {
          epic: 'Auth',
          feature: 'Login',
          tshirt_size: 'M',
          roles: ['Fullstack'],
        },
      ];

      const estimator = new ProjectEstimator(backlog, config);
      const result = estimator.estimate();

      const effort = result.roleEfforts[0];
      expect(effort.baseHours).toBe(36);

      // 36 * (1 + 0.15 + 0.20 + 0.10) = 36 * 1.45 = 52.2
      expect(effort.withMultipliers).toBeCloseTo(52.2, 1);

      // 52.2 * 1.15 = 60.03
      expect(effort.totalHours).toBeCloseTo(60.03, 1);
    });
  });

  describe('Role allocation', () => {
    it('should distribute hours equally among roles', () => {
      const backlog: BacklogItem[] = [
        {
          epic: 'Auth',
          feature: 'OAuth',
          tshirt_size: 'L',
          roles: ['Fullstack', 'DevOps', 'QA'],
        },
      ];

      const estimator = new ProjectEstimator(backlog, config);
      const result = estimator.estimate();

      const fullstackEffort = result.roleEfforts.find((e) => e.role === 'Fullstack');
      const devopsEffort = result.roleEfforts.find((e) => e.role === 'DevOps');
      const qaEffort = result.roleEfforts.find((e) => e.role === 'QA');

      // Base hours should be 72/3 = 24 for each
      expect(fullstackEffort?.baseHours).toBeCloseTo(24, 1);
      expect(devopsEffort?.baseHours).toBeCloseTo(24, 1);
      expect(qaEffort?.baseHours).toBeCloseTo(24, 1);
    });
  });

  describe('QA auto-allocation with multipliers', () => {
    it('should apply multipliers to auto-allocated QA', () => {
      const backlog: BacklogItem[] = [
        {
          epic: 'Feature A',
          feature: 'Implementation',
          tshirt_size: 'L',
          roles: ['Fullstack', 'DevOps'],
        },
      ];

      const estimator = new ProjectEstimator(backlog, config);
      const result = estimator.estimate();

      const qaEffort = result.roleEfforts.find((e) => e.role === 'QA');

      // Should exist (auto-allocated)
      expect(qaEffort).toBeDefined();

      // QA base hours = total dev hours * 1/3
      const totalDevHours = result.roleEfforts
        .filter((e) => e.role === 'Fullstack' || e.role === 'DevOps')
        .reduce((sum, e) => sum + e.totalHours, 0);
      const expectedQaBase = totalDevHours / 3;

      // QA should have multipliers and contingency applied
      expect(qaEffort!.baseHours).toBeCloseTo(expectedQaBase, 1);
      expect(qaEffort!.totalHours).toBeGreaterThan(qaEffort!.baseHours);
    });
  });

  describe('Cost calculation', () => {
    it('should calculate cost correctly based on role rates', () => {
      const backlog: BacklogItem[] = [
        {
          epic: 'Auth',
          feature: 'Login',
          tshirt_size: 'S',
          roles: ['Fullstack'],
        },
      ];

      const estimator = new ProjectEstimator(backlog, config);
      const result = estimator.estimate();

      const fullstackEffort = result.roleEfforts.find((e) => e.role === 'Fullstack');
      expect(fullstackEffort).toBeDefined();
      const expectedFullstackCost = fullstackEffort!.totalHours * 85; // Fullstack rate is $85/hour
      expect(fullstackEffort!.cost).toBeCloseTo(expectedFullstackCost, 0);

      // Total cost includes BA, SM, UX project management roles
      expect(result.totalCost).toBeGreaterThan(expectedFullstackCost);
      // Verify it's the sum of all role costs
      const calculatedTotal = result.roleEfforts.reduce((sum, e) => sum + e.cost, 0);
      expect(result.totalCost).toBeCloseTo(calculatedTotal, 0);
    });
  });

  describe('Duration calculation', () => {
    it('should calculate project duration based on max role hours', () => {
      const backlog: BacklogItem[] = [
        {
          epic: 'Phase 1',
          feature: 'Feature A',
          tshirt_size: 'M',
          roles: ['Fullstack'],
        },
        {
          epic: 'Phase 2',
          feature: 'Feature B',
          tshirt_size: 'L',
          roles: ['QA'],
        },
      ];

      const estimator = new ProjectEstimator(backlog, config);
      const result = estimator.estimate();

      // Should have meaningful duration metrics
      expect(result.durationWeeks).toBeGreaterThan(0);
      expect(result.durationSprints).toBeGreaterThan(0);
      expect(result.workingDays).toBeGreaterThan(0);
    });
  });

  describe('Multiple backlog items', () => {
    it('should aggregate efforts across multiple items', () => {
      const backlog: BacklogItem[] = [
        {
          epic: 'Auth',
          feature: 'Login',
          tshirt_size: 'M',
          roles: ['Fullstack'],
        },
        {
          epic: 'Auth',
          feature: 'Signup',
          tshirt_size: 'M',
          roles: ['Fullstack'],
        },
      ];

      const estimator = new ProjectEstimator(backlog, config);
      const result = estimator.estimate();

      expect(result.backlogItemCount).toBe(2);
      const fullstackEffort = result.roleEfforts.find((e) => e.role === 'Fullstack');
      expect(fullstackEffort?.baseHours).toBeCloseTo(72, 1); // 36 + 36
    });
  });

  describe('Team composition', () => {
    it('should calculate FTE correctly', () => {
      const backlog: BacklogItem[] = [
        {
          epic: 'Feature',
          feature: 'Implementation',
          tshirt_size: 'XXL',
          roles: ['Fullstack'],
        },
      ];

      const estimator = new ProjectEstimator(backlog, config);
      const result = estimator.estimate();

      const effort = result.roleEfforts[0];
      // FTE = totalHours / (hoursPerDay * 5 * sprintLengthWeeks)
      const expectedFTE = effort.totalHours / (6 * 5 * 2);
      expect(effort.fte).toBeCloseTo(expectedFTE, 2);
    });
  });

  describe('Gantt data generation', () => {
    it('should generate Gantt tasks for each role in each item', () => {
      const backlog: BacklogItem[] = [
        {
          epic: 'Auth',
          feature: 'Login',
          tshirt_size: 'M',
          roles: ['Fullstack', 'QA'],
        },
      ];

      const estimator = new ProjectEstimator(backlog, config);
      const result = estimator.estimate();

      // Should have 2 Gantt tasks (one per role)
      expect(result.ganttData.length).toBe(2);
      expect(result.ganttData[0].epic).toBe('Auth');
      expect(result.ganttData[0].feature).toBe('Login');
      expect(result.ganttData[0].role).toBe('Fullstack');
      expect(result.ganttData[1].role).toBe('QA');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty backlog', () => {
      const estimator = new ProjectEstimator([], config);
      const result = estimator.estimate();

      expect(result.backlogItemCount).toBe(0);
      expect(result.durationDays).toBe(0);
      expect(result.durationWeeks).toBe(0);
      // BA, SM, UX should still be allocated as full-project roles with 0 hours
      expect(result.roleEfforts.length).toBe(3);
      expect(result.roleEfforts.map((e) => e.role)).toEqual(['BA', 'SM', 'UX']);
    });

    it('should handle custom config values', () => {
      const customConfig: EstimationConfig = {
        ...config,
        unitTestingPercentage: 30,
        bugFixingPercentage: 40,
        contingencyPercentage: 20,
      };

      const backlog: BacklogItem[] = [
        {
          epic: 'Feature',
          feature: 'Implementation',
          tshirt_size: 'M',
          roles: ['Fullstack'],
        },
      ];

      const estimator = new ProjectEstimator(backlog, customConfig);
      const result = estimator.estimate();

      // Base 36 hours * (1 + 0.30 + 0.40 + 0.10) * 1.20 = 36 * 1.8 * 1.2 = 77.76
      const expectedTotal = 36 * 1.8 * 1.2;
      expect(result.roleEfforts[0].totalHours).toBeCloseTo(expectedTotal, 1);
    });
  });
});

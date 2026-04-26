# 🧪 PROJECT ESTIMATOR - TEST AUTOMATION SUITE

**Status:** Template Ready - Awaiting QA Agent Results  
**Coverage Target:** 85%+ of critical paths  
**Framework:** Jest/Node.js for TypeScript, Python unittest for Python version

---

## TEST STRUCTURE

### 1. UNIT TESTS - Core Modules

#### estimator.ts / estimator.py
```javascript
describe('Estimator - T-Shirt Size Mapping', () => {
  it('should map XS to 9 hours', () => {
    expect(estimateTShirtSize('XS')).toBe(9);
  });
  
  it('should handle all size mappings correctly', () => {
    const sizes = { XS: 9, S: 18, M: 36, L: 72, XL: 108, XXL: 144, XXXL: 189 };
    Object.entries(sizes).forEach(([size, hours]) => {
      expect(estimateTShirtSize(size)).toBe(hours);
    });
  });
  
  it('should throw error for invalid T-shirt size', () => {
    expect(() => estimateTShirtSize('INVALID')).toThrow();
  });
});

describe('Estimator - Multipliers Application', () => {
  it('should apply unit testing percentage (15%)', () => {
    const baseHours = 100;
    const multiplied = applyUnitTestingMultiplier(baseHours, 15);
    expect(multiplied).toBe(115);
  });
  
  it('should apply bug fixing overhead (20%)', () => {
    const baseHours = 100;
    const multiplied = applyBugFixingMultiplier(baseHours, 20);
    expect(multiplied).toBe(120);
  });
  
  it('should apply all multipliers in correct order', () => {
    const baseHours = 100;
    const result = applyAllMultipliers(baseHours, 15, 20, 10, 15);
    // baseHours * (1 + testing%) * (1 + bugfix%) * (1 + docs%) * (1 + contingency%)
    expect(result).toBeGreaterThan(baseHours);
  });
});

describe('Estimator - Role Effort Distribution', () => {
  it('should distribute fullstack effort correctly', () => {
    const taskEffort = 100;
    const roles = ['Fullstack', 'QA'];
    const distribution = distributeEffort(taskEffort, roles);
    expect(distribution.Fullstack).toBe(100);
    expect(distribution.QA).toBeGreaterThan(0);
  });
  
  it('should handle DevOps allocation', () => {
    const roles = ['Fullstack', 'DevOps'];
    const distribution = distributeEffort(100, roles);
    expect(distribution.DevOps).toBeGreaterThan(0);
  });
  
  it('should calculate QA ratio 1:3 automatically', () => {
    const fullstackHours = 300;
    const qaHours = calculateQARatio(fullstackHours);
    expect(qaHours).toBe(100); // 300 / 3
  });
});
```

#### holidayUtils.ts / holidayUtils.py
```javascript
describe('Holiday Utils - Brazilian Holidays', () => {
  it('should recognize Fixed Brazilian Holidays', () => {
    expect(isBrazilianHoliday('2026-01-01')).toBe(true); // New Year
    expect(isBrazilianHoliday('2026-12-25')).toBe(true); // Christmas
    expect(isBrazilianHoliday('2026-09-07')).toBe(true); // Independence Day
  });
  
  it('should calculate Easter-based holidays', () => {
    expect(isBrazilianHoliday('2026-04-03')).toBe(true); // Good Friday
    expect(isBrazilianHoliday('2026-04-05')).toBe(true); // Easter Sunday
  });
  
  it('should recognize working days correctly', () => {
    expect(isWorkingDay('2026-04-06')).toBe(true); // Monday
    expect(isWorkingDay('2026-04-04')).toBe(false); // Saturday
    expect(isWorkingDay('2026-04-05')).toBe(false); // Easter Sunday (holiday)
  });
  
  it('should calculate working days between dates', () => {
    const start = '2026-04-06'; // Monday
    const end = '2026-04-10';   // Friday
    const workingDays = calculateWorkingDays(start, end);
    expect(workingDays).toBe(5); // 5 business days, no holidays
  });
  
  it('should exclude weekends from working day count', () => {
    const start = '2026-04-06'; // Monday
    const end = '2026-04-12';   // Sunday
    const workingDays = calculateWorkingDays(start, end);
    expect(workingDays).toBe(5); // Only Monday-Friday
  });
  
  it('should handle holiday exclusion in date ranges', () => {
    const start = '2026-12-20'; // Sunday
    const end = '2026-12-31';   // Thursday
    const workingDays = calculateWorkingDays(start, end);
    // Should exclude 25th (Christmas)
    expect(workingDays).toBeLessThan(10);
  });
});
```

#### teamAllocator.ts / teamAllocator.py
```javascript
describe('Team Allocator - Headcount Calculation', () => {
  it('should calculate FTE from hours', () => {
    const config = { hoursPerDay: 6, sprintLengthWeeks: 2 };
    const totalHours = 240;
    const fte = calculateFTE(totalHours, config);
    expect(fte).toBe(1); // 240 / (6 * 5 * 2) = 1 FTE
  });
  
  it('should round up partial FTE to full headcount', () => {
    const config = { hoursPerDay: 6, sprintLengthWeeks: 2 };
    const totalHours = 250; // 1.04 FTE
    const headcount = calculateHeadcount(totalHours, config);
    expect(headcount).toBe(2); // Rounds up
  });
  
  it('should apply QA ratio to dev headcount', () => {
    const devHeadcount = 3;
    const qaHeadcount = calculateQAHeadcount(devHeadcount);
    expect(qaHeadcount).toBe(1); // 1 QA per 3 devs
  });
  
  it('should allocate BA/SM/UX at 50% throughout project', () => {
    const projectDuration = 10; // sprints
    const baAllocation = calculateBAAllocation(projectDuration);
    expect(baAllocation.percentage).toBe(50);
    expect(baAllocation.sprintsAllocated).toBe(projectDuration);
  });
});
```

### 2. INTEGRATION TESTS - End-to-End Flows

```javascript
describe('Integration - Complete Estimation Flow', () => {
  it('should estimate project from backlog to final output', () => {
    const backlog = [
      { epic: 'Auth', feature: 'Login', tshirt_size: 'M', roles: ['Fullstack', 'QA'] },
      { epic: 'Auth', feature: 'OAuth', tshirt_size: 'L', roles: ['Fullstack', 'DevOps', 'QA'] }
    ];
    
    const config = {
      hoursPerDay: 6,
      sprintLengthWeeks: 2,
      unitTestingPercentage: 15,
      bugFixingPercentage: 20,
      documentationPercentage: 10,
      contingencyPercentage: 15,
      startDate: '2026-05-01'
    };
    
    const result = estimateProject(backlog, config);
    
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('roleEfforts');
    expect(result).toHaveProperty('teamComposition');
    expect(result).toHaveProperty('timeline');
    expect(result.summary.totalBaseHours).toBeGreaterThan(0);
    expect(result.summary.totalCost).toBeGreaterThan(0);
  });
  
  it('should handle empty backlog gracefully', () => {
    const result = estimateProject([], defaultConfig);
    expect(result.summary.totalBaseHours).toBe(0);
    expect(result.summary.duration).toBe('0 days');
  });
  
  it('should produce valid JSON export', () => {
    const backlog = [{ epic: 'Test', feature: 'Feature', tshirt_size: 'M', roles: ['Fullstack'] }];
    const result = estimateProject(backlog, defaultConfig);
    const jsonExport = exportToJSON(result);
    
    expect(() => JSON.parse(jsonExport)).not.toThrow();
    const parsed = JSON.parse(jsonExport);
    expect(parsed).toHaveProperty('summary');
  });
  
  it('should produce valid CSV export', () => {
    const backlog = [{ epic: 'Test', feature: 'Feature', tshirt_size: 'M', roles: ['Fullstack'] }];
    const result = estimateProject(backlog, defaultConfig);
    const csvExport = exportToCSV(result);
    
    expect(csvExport).toContain(','); // CSV should have commas
    expect(csvExport).toContain('\n'); // CSV should have newlines
  });
});

describe('Integration - Holiday Handling in Timeline', () => {
  it('should skip Brazilian holidays when calculating timeline', () => {
    const backlog = [{ epic: 'Test', feature: 'Feature', tshirt_size: 'L', roles: ['Fullstack'] }];
    const config = {
      ...defaultConfig,
      startDate: '2026-12-20' // Near Christmas
    };
    
    const result = estimateProject(backlog, config);
    const timeline = result.timeline;
    
    // Should not include 25th (Christmas) as working day
    timeline.forEach(day => {
      expect(day.date).not.toBe('2026-12-25');
    });
  });
});
```

### 3. E2E TEST CASES - User Workflows

```javascript
describe('E2E - User Workflows', () => {
  it('Scenario 1: First-time user generates example estimation', async () => {
    const backlog = generateExampleBacklog();
    expect(backlog.length).toBeGreaterThan(0);
    
    const estimation = runEstimation(backlog, defaultConfig);
    expect(estimation.summary).toBeDefined();
    
    const json = exportToJSON(estimation);
    expect(json).toBeTruthy();
  });
  
  it('Scenario 2: Custom project with multiple epics', async () => {
    const backlog = [
      { epic: 'Frontend', feature: 'Dashboard', tshirt_size: 'XL', roles: ['Fullstack', 'UX'] },
      { epic: 'Frontend', feature: 'Reports', tshirt_size: 'L', roles: ['Fullstack', 'QA'] },
      { epic: 'Backend', feature: 'API Gateway', tshirt_size: 'M', roles: ['Fullstack', 'DevOps'] },
      { epic: 'Backend', feature: 'Database Setup', tshirt_size: 'S', roles: ['DevOps'] }
    ];
    
    const estimation = runEstimation(backlog, defaultConfig);
    
    expect(estimation.summary.totalBaseHours).toBeGreaterThan(200);
    expect(estimation.roleEfforts['Fullstack']).toBeGreaterThan(0);
    expect(estimation.roleEfforts['DevOps']).toBeGreaterThan(0);
    expect(estimation.teamComposition.Fullstack.count).toBeGreaterThan(0);
  });
  
  it('Scenario 3: AI prompt generation workflow', async () => {
    const prompt = getEffortEstimationPrompt(
      'Build authentication system with OAuth',
      'Node.js, React, PostgreSQL'
    );
    
    expect(prompt).toContain('effort estimation');
    expect(prompt).toContain('Node.js');
    expect(prompt).toContain('React');
  });
});
```

### 4. EDGE CASES & ERROR HANDLING

```javascript
describe('Edge Cases', () => {
  it('should handle very large projects (1000+ features)', () => {
    const largeBacklog = Array(1000).fill(0).map((_, i) => ({
      epic: `Epic${Math.floor(i / 100)}`,
      feature: `Feature${i}`,
      tshirt_size: 'M',
      roles: ['Fullstack']
    }));
    
    expect(() => estimateProject(largeBacklog, defaultConfig)).not.toThrow();
    const result = estimateProject(largeBacklog, defaultConfig);
    expect(result.summary.totalBaseHours).toBeGreaterThan(10000);
  });
  
  it('should handle very small projects (single feature)', () => {
    const smallBacklog = [{ epic: 'Quick', feature: 'Task', tshirt_size: 'XS', roles: ['Fullstack'] }];
    const result = estimateProject(smallBacklog, defaultConfig);
    expect(result.summary.totalBaseHours).toBe(9); // XS = 9 hours
  });
  
  it('should handle projects spanning multiple years', () => {
    const backlog = [{ epic: 'Huge', feature: 'Mega', tshirt_size: 'XXXL', roles: ['Fullstack'] }];
    const config = { ...defaultConfig, startDate: '2026-01-01' };
    
    const result = estimateProject(backlog, config);
    expect(result.timeline.length).toBeGreaterThan(100); // Should be many days
  });
  
  it('should handle edge date: leap year February', () => {
    const config = { ...defaultConfig, startDate: '2024-02-20' }; // 2024 is leap year
    const result = estimateProject([{ epic: 'Test', feature: 'F', tshirt_size: 'S', roles: ['Fullstack'] }], config);
    expect(result.timeline).toBeDefined();
  });
  
  it('should reject invalid T-shirt sizes', () => {
    const invalidBacklog = [{ epic: 'Bad', feature: 'Size', tshirt_size: 'INVALID', roles: ['Fullstack'] }];
    expect(() => estimateProject(invalidBacklog, defaultConfig)).toThrow();
  });
  
  it('should handle unknown roles gracefully', () => {
    const unknownRoles = [{ epic: 'Test', feature: 'F', tshirt_size: 'M', roles: ['UnknownRole'] }];
    expect(() => estimateProject(unknownRoles, defaultConfig)).toThrow('Unknown role');
  });
});
```

---

## 📊 TEST COVERAGE TARGETS

| Module | Current | Target | Notes |
|--------|---------|--------|-------|
| estimator.ts | ? | 90% | Core logic critical |
| holidayUtils.ts | ? | 95% | Date logic must be accurate |
| teamAllocator.ts | ? | 85% | Allocation patterns |
| exportUtils.ts | ? | 80% | Output formatting |
| promptTemplates.ts | ? | 70% | Template validation |
| config.ts | ? | 100% | Constants validation |

---

## 🚀 EXECUTION PLAN

1. **Phase 1:** Unit tests (all modules)
2. **Phase 2:** Integration tests (full flows)
3. **Phase 3:** E2E scenarios (user workflows)
4. **Phase 4:** Performance testing (large datasets)
5. **Phase 5:** Regression testing (CI/CD pipeline)

---

**Status:** Waiting for QA Agent to populate with detailed test cases...

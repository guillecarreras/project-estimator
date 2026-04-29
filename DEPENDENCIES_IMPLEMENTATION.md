# Dependency Management and Critical Path Analysis Implementation

## Overview

This implementation adds comprehensive dependency management and critical path analysis to the project estimator. It enables accurate project scheduling by analyzing task dependencies, calculating the critical path, and identifying bottlenecks and slack time.

## Architecture

### Core Modules

#### 1. **DependencyCalculator** (`src/features/dependencies/calculator.ts`)
Implements the critical path method (CPM) algorithm for project scheduling.

**Key Methods:**
- `calculateCriticalPath(tasks, startDate)`: Computes the critical path using forward and backward pass
- `calculateScheduleAnalysis(tasks, startDate)`: Returns detailed schedule analysis with timing data
- `validateDependencies(tasks)`: Validates dependencies for cycles and missing references
- `forwardPass()`: Calculates earliest start/finish times
- `backwardPass()`: Calculates latest start/finish times

**Algorithm:**
- Forward Pass: Computes ES (Earliest Start) and EF (Earliest Finish) for each task
- Backward Pass: Computes LS (Latest Start) and LF (Latest Finish) for each task
- Slack Calculation: Slack = LS - ES (zero slack indicates critical path)
- Time Complexity: O(V + E) where V = tasks, E = dependencies

#### 2. **DependencyDetector** (`src/features/dependencies/detector.ts`)
Converts backlog items to tasks with automatically detected dependencies.

**Key Methods:**
- `convertBacklogToTasks(backlog)`: Transforms BacklogItem[] to Task[] with detected dependencies
- `detectDependencies()`: Identifies task dependencies using pattern matching and semantic analysis
- `extractFeatureDependencies()`: Extracts explicit dependency markers from feature names
- `validateDependencyReferences()`: Validates all dependencies exist in backlog

**Detection Patterns:**
1. **Explicit Dependencies**: Feature names with markers like "(depends on X)" or "(requires Y)"
2. **Semantic Ordering**: Features with logical sequence (Setup → Configuration → Implementation → Testing)
3. **Epic Dependencies**: Cross-epic dependencies based on common patterns
4. **Feature Order Scoring**: Assigns priority scores to common feature types

**Feature Order Score Examples:**
- Setup: 0
- Initialization: 1
- Configuration: 2
- Design: 3
- Implementation/Development: 10
- Testing/QA: 15
- Deployment: 20
- Documentation: 25

#### 3. **EstimatorIntegration** (`src/features/dependencies/estimator-integration.ts`)
Integrates critical path analysis with the existing estimation system.

**Key Methods:**
- `calculateEstimationWithDependencies()`: Updates estimation using critical path instead of max hours
- `getScheduleAnalysis()`: Returns detailed schedule analysis
- `identifyBottlenecks()`: Identifies critical tasks and blocking constraints
- `calculateWhatIf()`: Simulates adding/removing tasks and their impact

**Benefits:**
- More accurate project duration based on actual dependencies
- Identifies tasks that block project completion
- Shows scheduling flexibility through slack/float calculations

#### 4. **GanttGenerator** (`src/features/dependencies/gantt.ts`)
Generates visual representations of project schedules.

**Formats:**
- **Precedence Diagram**: PERT chart with nodes and edges
- **Gantt Chart**: CSV, HTML, or JSON format
- **Timeline Data**: Day-by-day breakdown with positioning info

**Output Features:**
- Critical path highlighting
- Slack/float visualization
- Resource allocation info
- Interactive positioning data for web visualization

## API Endpoints

### New Dependencies Endpoints

#### POST /api/features/dependencies/analyze
Analyzes task dependencies and calculates critical path.

**Request:**
```json
{
  "tasks": [
    {
      "id": "T1",
      "name": "Design",
      "duration": 5,
      "dependencies": [],
      "criticality": 0
    }
  ],
  "startDate": "2025-11-03"
}
```

**Response:**
```json
{
  "success": true,
  "criticalPath": {
    "tasks": [...],
    "duration": 23,
    "criticalTasks": ["T1", "T2", "T4"],
    "startDate": "2025-11-03",
    "endDate": "2025-11-26"
  }
}
```

#### POST /api/features/dependencies/schedule
Calculates complete schedule analysis with Gantt entries and slack.

**Request:**
```json
{
  "tasks": [...],
  "startDate": "2025-11-03"
}
```

**Response:**
```json
{
  "success": true,
  "schedule": {
    "projectDuration": 23,
    "criticalTasksCount": 4,
    "totalTasks": 4
  },
  "ganttEntries": [...],
  "taskSlacks": [{"taskId": "T1", "slack": 0}, ...]
}
```

#### POST /api/features/dependencies/estimation-with-dependencies
Calculates project estimation using critical path from backlog items.

**Request:**
```json
{
  "backlog": [
    {
      "epic": "Backend",
      "feature": "Setup",
      "tshirt_size": "S",
      "roles": ["Fullstack"]
    }
  ],
  "config": {
    "hoursPerDay": 8,
    "sprintLengthWeeks": 2,
    "startDate": "2025-11-03"
  },
  "baseEstimation": {...}
}
```

**Response:**
```json
{
  "success": true,
  "estimation": {
    "criticalPathDuration": 23,
    "criticalTasksCount": 4,
    "dependencyImpact": 15.5,
    "slackAnalysis": [...]
  }
}
```

#### POST /api/features/dependencies/bottlenecks
Identifies project bottlenecks and critical constraints.

**Request:**
```json
{
  "backlog": [...],
  "config": {...}
}
```

**Response:**
```json
{
  "success": true,
  "criticalTasks": ["T1", "T3"],
  "bottlenecks": [
    "Task 1 blocks 4 downstream tasks",
    "Task 3 takes 15 days (long-running critical task)"
  ],
  "recommendedActions": [
    "Consider parallelizing Task 1",
    "Break down Task 3 into smaller subtasks"
  ]
}
```

#### POST /api/features/dependencies/what-if
Calculates impact of adding/removing tasks on project duration.

**Request:**
```json
{
  "backlog": [...],
  "config": {...},
  "modifications": {
    "addTasks": [...],
    "removeTasks": ["Feature1", "Feature2"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "original": 23,
  "modified": 18,
  "impact": -5,
  "recommendation": "Removing these items will shorten the project by 5 days (21%)"
}
```

#### POST /api/features/dependencies/detect
Detects dependencies from backlog items.

**Request:**
```json
{
  "backlog": [...]
}
```

**Response:**
```json
{
  "success": true,
  "tasks": [...],
  "detectedDependencies": [
    {
      "source": "Backend:Implementation",
      "targets": ["Backend:Setup", "Backend:Configuration"]
    }
  ],
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

#### Additional Endpoints
- POST /api/features/dependencies/precedence-diagram
- POST /api/features/dependencies/gantt-chart
- POST /api/features/dependencies/validate
- POST /api/features/dependencies/slack-analysis

## Data Models

### Task
```typescript
interface Task {
  id: string;
  name: string;
  duration: number; // in days
  startDate?: Date;
  endDate?: Date;
  dependencies: TaskDependency[];
  resourceAllocation?: string;
  criticality: number; // 0-100
  slack?: number; // float time in days
}
```

### TaskDependency
```typescript
interface TaskDependency {
  taskId: string; // predecessor task id
  type: DependencyType; // FS, SS, FF, SF
  lag?: number; // lead/lag in days
}
```

### CriticalPathResult
```typescript
interface CriticalPathResult {
  tasks: Task[];
  duration: number; // total project duration in days
  criticalTasks: string[]; // ids of tasks on critical path
}
```

### ScheduleAnalysis
```typescript
interface ScheduleAnalysis {
  criticalPath: CriticalPathResult;
  ganttEntries: GanttEntry[];
  earliestStart: Map<string, Date>;
  earliestFinish: Map<string, Date>;
  latestStart: Map<string, Date>;
  latestFinish: Map<string, Date>;
  taskSlacks: Map<string, number>;
}
```

## Usage Examples

### Example 1: Basic Critical Path Analysis

```typescript
import { DependencyCalculator } from './features/dependencies';

const tasks = [
  { id: 'T1', name: 'Analysis', duration: 5, dependencies: [] },
  { id: 'T2', name: 'Design', duration: 3, dependencies: [{ taskId: 'T1', type: 'FS' }] },
  { id: 'T3', name: 'Development', duration: 10, dependencies: [{ taskId: 'T2', type: 'FS' }] },
];

const startDate = new Date('2025-11-03');
const result = DependencyCalculator.calculateCriticalPath(tasks, startDate);

console.log(`Project Duration: ${result.duration} days`);
console.log(`Critical Tasks: ${result.criticalTasks.join(', ')}`);
```

### Example 2: Backlog to Tasks Conversion

```typescript
import { DependencyDetector } from './features/dependencies';

const backlog = [
  { epic: 'Backend', feature: 'Setup', tshirt_size: 'S', roles: ['Fullstack'] },
  { epic: 'Backend', feature: 'Implementation', tshirt_size: 'L', roles: ['Fullstack'] },
];

const tasks = DependencyDetector.convertBacklogToTasks(backlog);
// Tasks now include automatically detected dependencies
```

### Example 3: Bottleneck Analysis

```typescript
import { EstimatorIntegration } from './features/dependencies';

const bottlenecks = EstimatorIntegration.identifyBottlenecks(backlog, config);

bottlenecks.bottlenecks.forEach(bottleneck => {
  console.log(`Bottleneck: ${bottleneck}`);
});

bottlenecks.recommendedActions.forEach(action => {
  console.log(`Action: ${action}`);
});
```

### Example 4: What-If Analysis

```typescript
const scenario = EstimatorIntegration.calculateWhatIf(
  backlog,
  config,
  {
    removeTasks: ['Non-critical Feature'],
    addTasks: [{ epic: 'Backend', feature: 'New Feature', tshirt_size: 'M', roles: ['Fullstack'] }]
  }
);

console.log(`Impact: ${scenario.impact} days`);
console.log(`Recommendation: ${scenario.recommendation}`);
```

## Features

### 1. Circular Dependency Detection
Automatically detects and reports circular dependencies that would make scheduling impossible.

### 2. Automatic Dependency Inference
- Semantic analysis of feature names to identify implicit dependencies
- Epic-level dependencies for cross-feature relationships
- Explicit dependency markers in feature names: "(depends on X)", "(requires Y)"

### 3. Slack/Float Calculation
Identifies scheduling flexibility for non-critical tasks:
- Critical tasks: 0 slack (any delay affects project)
- Non-critical tasks: > 0 slack (some flexibility in scheduling)

### 4. Impact Analysis
Shows how dependencies affect total project duration compared to simple addition of hours.

### 5. Bottleneck Identification
Automatically identifies:
- Tasks blocking many downstream tasks
- Long-running critical tasks
- Resource contentions

### 6. What-If Scenarios
Simulates adding or removing work to understand schedule impact before commitment.

## Performance

- **Time Complexity**: O(V + E) where V = number of tasks, E = number of dependencies
- **Space Complexity**: O(V) for schedule storage
- Handles projects with hundreds of tasks efficiently
- Forward/backward passes run in linear time

## Validation

All implementations include:
- Circular dependency detection
- Missing task reference validation
- Task duration validation (minimum 1 day)
- Dependency type validation
- Warning for unconnected tasks

## Integration with Existing Estimator

The implementation seamlessly integrates with the existing ProjectEstimator class:

1. **DependencyDetector** converts backlog items to tasks
2. **DependencyCalculator** computes the critical path
3. **EstimatorIntegration** updates duration to use critical path instead of max hours
4. Result shows actual project duration based on dependencies

This provides a more realistic estimate that accounts for task sequences and bottlenecks.

## Testing

Comprehensive test suites cover:
- Critical path calculation (18 tests in dependencies.test.ts)
- Dependency detection (12 tests in dependency-detector.test.ts)
- Estimator integration (8 tests in estimator-integration.test.ts)
- Circular dependency detection
- Missing dependency detection
- Gantt chart generation in multiple formats
- Schedule analysis accuracy

Run tests with:
```bash
npm test
npm test -- --coverage  # with coverage report
```

All 61 tests pass successfully.

## Future Enhancements

Potential improvements for future iterations:
1. **Resource leveling**: Adjust schedule to balance resource utilization
2. **Multi-project dependencies**: Track dependencies across projects
3. **Probability-based scheduling**: Account for task duration uncertainty
4. **Cost optimization**: Find critical path with minimal cost
5. **Constraint scheduling**: Account for resource constraints
6. **Earned value management**: Track actual progress vs. planned

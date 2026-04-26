/**
 * Dependency Management Models
 * Data structures for task dependencies and project scheduling
 */

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'; // Finish-Start, Start-Start, Finish-Finish, Start-Finish

export interface Task {
  id: string;
  name: string;
  duration: number; // in days
  startDate?: Date;
  endDate?: Date;
  dependencies: TaskDependency[];
  resourceAllocation?: string; // Role or resource type
  criticality: number; // 0-100, 0 = not critical, 100 = critical path
  slack?: number; // float time in days
}

export interface TaskDependency {
  taskId: string; // predecessor task id
  type: DependencyType; // type of dependency
  lag?: number; // lead/lag in days (positive = lag, negative = lead)
}

export interface PrecedenceRelation {
  from: Task;
  to: Task;
  type: DependencyType;
  lag: number;
}

export interface CriticalPathResult {
  tasks: Task[];
  duration: number; // total project duration in days
  startDate: Date;
  endDate: Date;
  criticalTasks: string[]; // ids of critical path tasks
}

export interface GanttEntry {
  taskId: string;
  taskName: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  resource?: string;
  percentComplete: number;
  dependencies: string[]; // predecessor task ids
  level: number; // hierarchy level for visualization
}

export interface ScheduleAnalysis {
  criticalPath: CriticalPathResult;
  ganttEntries: GanttEntry[];
  earliestStart: Map<string, Date>;
  earliestFinish: Map<string, Date>;
  latestStart: Map<string, Date>;
  latestFinish: Map<string, Date>;
  taskSlacks: Map<string, number>;
}

export interface DependencyValidation {
  valid: boolean;
  errors: DependencyError[];
  warnings: string[];
}

export interface DependencyError {
  taskId: string;
  error: string;
}

export interface PrecedenceDiagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  metadata: DiagramMetadata;
}

export interface DiagramNode {
  id: string;
  label: string;
  duration: number;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
  x?: number;
  y?: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  type: DependencyType;
  lag: number;
  isCritical: boolean;
}

export interface DiagramMetadata {
  projectDuration: number;
  startDate: Date;
  endDate: Date;
  criticalPathLength: number;
  generatedAt: string;
}

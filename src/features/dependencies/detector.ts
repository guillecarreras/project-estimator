/**
 * Dependency Detection Module
 * Parses backlog items and detects/extracts task dependencies
 */

import { BacklogItem } from '../../types';
import { Task, TaskDependency, DependencyType } from './models';

export interface DependencyPattern {
  epic: string;
  feature: string;
  blockedBy?: string[]; // epic:feature format
  blocks?: string[]; // epic:feature format
}

export class DependencyDetector {
  /**
   * Convert backlog items to tasks with detected dependencies
   * Uses pattern matching and semantic analysis to find dependencies
   */
  static convertBacklogToTasks(backlog: BacklogItem[]): Task[] {
    const tasks: Task[] = [];
    const itemMap = new Map<string, BacklogItem>();

    // Create a map for quick lookups
    for (const item of backlog) {
      const key = `${item.epic}:${item.feature}`;
      itemMap.set(key, item);
    }

    // Convert each backlog item to a task
    let taskId = 1;
    for (const item of backlog) {
      const id = `TASK-${taskId++}`;
      const dependencies = this.detectDependencies(item, backlog, itemMap);

      tasks.push({
        id,
        name: `${item.epic} - ${item.feature}`,
        duration: this.estimateDurationFromSize(item.tshirt_size, item.roles.length),
        dependencies,
        criticality: 0,
        resourceAllocation: item.roles.join(','),
      });
    }

    return tasks;
  }

  /**
   * Detect dependencies between tasks based on patterns and heuristics
   */
  private static detectDependencies(
    item: BacklogItem,
    backlog: BacklogItem[],
    itemMap: Map<string, BacklogItem>
  ): TaskDependency[] {
    const dependencies: TaskDependency[] = [];

    // Pattern 1: Explicit dependency markers in feature name
    const explicitDeps = this.extractExplicitDependencies(item.feature);
    for (const dep of explicitDeps) {
      const targetKey = dep; // Format: Epic:Feature
      if (itemMap.has(targetKey)) {
        dependencies.push({
          taskId: this.getTaskIdForItem(targetKey, backlog),
          type: 'FS', // Finish-Start
          lag: 0,
        });
      }
    }

    // Pattern 2: Semantic ordering - features within same epic often have implicit order
    // Features like "Setup", "Configuration", "Implementation", "Testing", "Deployment"
    const sameEpicFeatures = backlog.filter((b) => b.epic === item.epic && b.feature !== item.feature);
    const orderScore = this.getFeatureOrderScore(item.feature);

    for (const other of sameEpicFeatures) {
      const otherScore = this.getFeatureOrderScore(other.feature);
      // If another feature should logically come before this one, create dependency
      if (otherScore < orderScore && otherScore >= 0) {
        dependencies.push({
          taskId: this.getTaskIdForItem(`${other.epic}:${other.feature}`, backlog),
          type: 'FS',
          lag: 0,
        });
      }
    }

    // Pattern 3: Epic dependencies - all features in epic B depend on epic A's completion
    const epicDependencies = this.detectEpicDependencies(item.epic);
    for (const depEpic of epicDependencies) {
      // Find first feature of dependent epic to represent the epic
      const firstFeatureOfDepEpic = backlog.find((b) => b.epic === depEpic);
      if (firstFeatureOfDepEpic) {
        dependencies.push({
          taskId: this.getTaskIdForItem(`${firstFeatureOfDepEpic.epic}:${firstFeatureOfDepEpic.feature}`, backlog),
          type: 'FS',
          lag: 0,
        });
      }
    }

    return dependencies;
  }

  /**
   * Extract explicit dependency patterns from feature names
   * Example: "API Integration (requires Database Setup)" -> ["Database:Setup"]
   */
  private static extractExplicitDependencies(featureName: string): string[] {
    const dependencies: string[] = [];

    // Match patterns like "(depends on X)" or "(requires Y)" or "(after Z)"
    const patterns = [
      /\(depends on ([^)]+)\)/gi,
      /\(requires ([^)]+)\)/gi,
      /\(after ([^)]+)\)/gi,
      /→\s*([^;,]+)/g, // Arrow notation
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(featureName)) !== null) {
        const depString = match[1].trim();
        // Try to parse as Epic:Feature
        if (depString.includes(':')) {
          dependencies.push(depString);
        } else {
          // If no epic specified, assume same epic
          const epicMatch = featureName.match(/^([^-]+)/);
          if (epicMatch) {
            dependencies.push(`${epicMatch[1].trim()}:${depString}`);
          }
        }
      }
    }

    return dependencies;
  }

  /**
   * Detect epic-level dependencies based on epic names
   */
  private static detectEpicDependencies(epic: string): string[] {
    const dependencies: string[] = [];

    // Map of common epic dependency patterns
    const epicPatterns: { [key: string]: string[] } = {
      infrastructure: [],
      setup: [],
      database: [],
      authentication: ['infrastructure', 'database'],
      'user management': ['authentication', 'database'],
      'api development': ['database', 'authentication'],
      'frontend development': ['api development'],
      testing: ['frontend development', 'api development'],
      deployment: ['testing', 'infrastructure'],
      monitoring: ['deployment'],
    };

    const normalizedEpic = epic.toLowerCase().trim();
    const epicDeps = epicPatterns[normalizedEpic] || [];

    return epicDeps.filter((dep) => dep !== normalizedEpic);
  }

  /**
   * Assign relative ordering score to feature names
   * Higher score = later in the process
   */
  private static getFeatureOrderScore(featureName: string): number {
    const normalized = featureName.toLowerCase();

    const scoreMap: { [key: string]: number } = {
      setup: 0,
      initialization: 1,
      configuration: 2,
      design: 3,
      'data model': 4,
      'schema design': 4,
      'api definition': 5,
      implementation: 10,
      development: 10,
      'unit testing': 15,
      'integration testing': 16,
      'testing': 15,
      'qa': 16,
      'user acceptance': 17,
      'deployment': 20,
      'production': 21,
      'monitoring': 22,
      'documentation': 25,
      'release': 30,
    };

    for (const [key, score] of Object.entries(scoreMap)) {
      if (normalized.includes(key)) {
        return score;
      }
    }

    // Default score for unrecognized features
    return 10;
  }

  /**
   * Get task ID for a backlog item
   */
  private static getTaskIdForItem(itemKey: string, backlog: BacklogItem[]): string {
    const [epic, feature] = itemKey.split(':');
    const index = backlog.findIndex((b) => b.epic === epic && b.feature === feature);
    return index >= 0 ? `TASK-${index + 1}` : 'TASK-0';
  }

  /**
   * Estimate task duration from T-shirt size and number of roles
   */
  private static estimateDurationFromSize(size: string, roleCount: number): number {
    const sizeMap: { [key: string]: number } = {
      XS: 1,
      S: 2,
      M: 5,
      L: 10,
      XL: 15,
      XXL: 20,
      XXXL: 30,
    };

    const baseDays = sizeMap[size] || 5;
    // Adjust for parallel work by multiple roles (reduced duration)
    const parallelAdjustment = roleCount > 1 ? 1 - (roleCount - 1) * 0.1 : 1;
    return Math.max(1, Math.ceil(baseDays * parallelAdjustment));
  }

  /**
   * Extract dependencies from feature names using regex patterns
   * Public method for explicit dependency declaration
   */
  static extractFeatureDependencies(backlog: BacklogItem[]): Map<string, string[]> {
    const dependencyMap = new Map<string, string[]>();

    for (const item of backlog) {
      const key = `${item.epic}:${item.feature}`;
      const deps = this.extractExplicitDependencies(item.feature);
      if (deps.length > 0) {
        dependencyMap.set(key, deps);
      }
    }

    return dependencyMap;
  }

  /**
   * Validate that all referenced dependencies exist in backlog
   */
  static validateDependencyReferences(
    backlog: BacklogItem[],
    dependencies: Map<string, string[]>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validKeys = new Set(backlog.map((b) => `${b.epic}:${b.feature}`));

    for (const [source, targets] of dependencies) {
      if (!validKeys.has(source)) {
        errors.push(`Source feature not found: ${source}`);
      }
      for (const target of targets) {
        if (!validKeys.has(target)) {
          errors.push(`Dependency target not found for ${source} -> ${target}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

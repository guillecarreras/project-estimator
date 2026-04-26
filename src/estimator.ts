import {
  BacklogItem,
  EstimationConfig,
  EstimationResult,
  RoleEffort,
  Role,
  GanttTask,
} from './types';
import { TSHIRT_HOURS, getRateByRole, ROLE_ALLOCATION_PATTERN, QA_RATIO } from './config';
import { addWorkingDays, calculateWorkingDays } from './holidayUtils';
import { format, parse } from 'date-fns';

export class ProjectEstimator {
  private config: EstimationConfig;
  private backlog: BacklogItem[];

  constructor(backlog: BacklogItem[], config: EstimationConfig) {
    this.backlog = backlog;
    this.config = config;
  }

  // Convert T-shirt size to hours
  private tshirtToHours(size: string): number {
    return TSHIRT_HOURS[size as keyof typeof TSHIRT_HOURS] || 0;
  }

  // Calculate base hours per role from backlog
  private calculateBaseHours(): Map<Role, number> {
    const roleHours = new Map<Role, number>();

    for (const item of this.backlog) {
      const baseHours = this.tshirtToHours(item.tshirt_size);
      const hoursPerRole = baseHours / item.roles.length;

      for (const role of item.roles) {
        const currentHours = roleHours.get(role) || 0;
        roleHours.set(role, currentHours + hoursPerRole);
      }
    }

    return roleHours;
  }

  // Apply multipliers (unit testing, bug fixing, documentation)
  private applyMultipliers(baseHours: number): number {
    const testingHours = baseHours * (this.config.unitTestingPercentage / 100);
    const bugFixingHours = baseHours * (this.config.bugFixingPercentage / 100);
    const docHours = baseHours * (this.config.documentationPercentage / 100);

    return baseHours + testingHours + bugFixingHours + docHours;
  }

  // Apply contingency
  private applyContingency(hours: number): number {
    return hours * (1 + this.config.contingencyPercentage / 100);
  }

  // Calculate role efforts
  private calculateRoleEfforts(): RoleEffort[] {
    const baseHours = this.calculateBaseHours();
    const roleEfforts: RoleEffort[] = [];
    let totalDevHours = 0;

    // Calculate for task-based roles first
    for (const [role, hours] of baseHours.entries()) {
      const withMultipliers = this.applyMultipliers(hours);
      const totalHours = this.applyContingency(withMultipliers);

      roleEfforts.push({
        role,
        baseHours: hours,
        withMultipliers,
        totalHours,
        fte: totalHours / (this.config.hoursPerDay * 5 * this.config.sprintLengthWeeks),
        cost: totalHours * getRateByRole(role),
      });

      // Track dev hours for QA ratio
      if (role === 'Fullstack' || role === 'DevOps') {
        totalDevHours += totalHours;
      }
    }

    // Add QA based on dev ratio if not already in backlog
    if (!baseHours.has('QA') && totalDevHours > 0) {
      const qaBaseHours = totalDevHours * QA_RATIO;
      const qaWithMultipliers = this.applyMultipliers(qaBaseHours);
      const qaTotalHours = this.applyContingency(qaWithMultipliers);
      roleEfforts.push({
        role: 'QA',
        baseHours: qaBaseHours,
        withMultipliers: qaWithMultipliers,
        totalHours: qaTotalHours,
        fte: qaTotalHours / (this.config.hoursPerDay * 5 * this.config.sprintLengthWeeks),
        cost: qaTotalHours * getRateByRole('QA'),
      });
    }

    return roleEfforts;
  }

  // Calculate project duration
  private calculateDuration(roleEfforts: RoleEffort[]): {
    days: number;
    weeks: number;
    sprints: number;
    workingDays: number;
  } {
    // Handle empty backlog
    if (roleEfforts.length === 0) {
      return { days: 0, weeks: 0, sprints: 0, workingDays: 0 };
    }

    // Find critical path (maximum hours among development roles)
    const maxHours = Math.max(...roleEfforts.map((r) => r.totalHours));

    // Assuming parallel work, duration is based on longest task
    // Adjusted by team capacity
    const workingDays = Math.ceil(maxHours / this.config.hoursPerDay);
    const weeks = Math.ceil(workingDays / 5);
    const sprints = Math.ceil(weeks / this.config.sprintLengthWeeks);

    return {
      days: workingDays * 1.4, // Convert working days to calendar days (approx)
      weeks,
      sprints,
      workingDays,
    };
  }

  // Generate Gantt-like data structure
  private generateGanttData(roleEfforts: RoleEffort[], workingDays: number): GanttTask[] {
    const ganttTasks: GanttTask[] = [];
    const startDate = parse(this.config.startDate, 'yyyy-MM-dd', new Date());
    let currentDate = startDate;

    // Simplified: distribute tasks sequentially
    for (const item of this.backlog) {
      const baseHours = this.tshirtToHours(item.tshirt_size);
      const hoursPerRole = baseHours / item.roles.length;
      const withMultipliers = this.applyMultipliers(hoursPerRole);
      const totalHours = this.applyContingency(withMultipliers);
      const taskDays = Math.ceil(totalHours / this.config.hoursPerDay);

      for (const role of item.roles) {
        const taskEndDate = addWorkingDays(currentDate, taskDays);

        ganttTasks.push({
          epic: item.epic,
          feature: item.feature,
          role,
          startDate: format(currentDate, 'yyyy-MM-dd'),
          endDate: format(taskEndDate, 'yyyy-MM-dd'),
          hours: totalHours,
          days: taskDays,
        });
      }

      currentDate = addWorkingDays(currentDate, taskDays);
    }

    return ganttTasks;
  }

  // Main estimation method
  public estimate(): EstimationResult {
    const roleEfforts = this.calculateRoleEfforts();
    const duration = this.calculateDuration(roleEfforts);
    const startDate = parse(this.config.startDate, 'yyyy-MM-dd', new Date());
    const endDate = addWorkingDays(startDate, duration.workingDays);
    const ganttData = this.generateGanttData(roleEfforts, duration.workingDays);

    // Calculate team composition
    const teamComposition = roleEfforts.map((effort) => ({
      role: effort.role,
      count: Math.ceil(effort.fte),
      allocationPercentage: 100,
    }));

    // Add full-project roles (BA, SM, UX) if not present
    const fullProjectRoles: Role[] = ['BA', 'SM', 'UX'];
    for (const role of fullProjectRoles) {
      if (!roleEfforts.find((e) => e.role === role)) {
        const estimatedHours = duration.workingDays * this.config.hoursPerDay * 0.5; // 50% allocation
        roleEfforts.push({
          role,
          baseHours: estimatedHours,
          withMultipliers: estimatedHours,
          totalHours: estimatedHours,
          fte: 0.5,
          cost: estimatedHours * getRateByRole(role),
        });

        teamComposition.push({
          role,
          count: 1,
          allocationPercentage: 50,
        });
      }
    }

    const totalCost = roleEfforts.reduce((sum, effort) => sum + effort.cost, 0);
    const totalBaseHours = roleEfforts.reduce((sum, effort) => sum + effort.baseHours, 0);

    const assumptions = [
      `Working ${this.config.hoursPerDay} productive hours per day`,
      `Sprint length: ${this.config.sprintLengthWeeks} weeks`,
      `Contingency: ${this.config.contingencyPercentage}%`,
      `Bug fixing overhead: ${this.config.bugFixingPercentage}%`,
      `Documentation overhead: ${this.config.documentationPercentage}%`,
      `Unit testing overhead: ${this.config.unitTestingPercentage}%`,
      `QA ratio: 1 QA per 3 Developers`,
      `BA, SM, UX allocated throughout project at 50%`,
      `Brazilian holidays excluded from working days`,
      `Weekends excluded from working days`,
    ];

    return {
      backlogItemCount: this.backlog.length,
      totalBaseHours,
      roleEfforts,
      teamComposition,
      totalCost,
      durationDays: duration.days,
      durationWeeks: duration.weeks,
      durationSprints: duration.sprints,
      startDate: this.config.startDate,
      endDate: format(endDate, 'yyyy-MM-dd'),
      workingDays: duration.workingDays,
      assumptions,
      ganttData,
    };
  }
}


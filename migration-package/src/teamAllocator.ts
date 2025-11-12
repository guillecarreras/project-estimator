import { RoleEffort, TeamComposition, Role } from './types';
import { ROLE_ALLOCATION_PATTERN, QA_RATIO } from './config';

export class TeamAllocator {
  /**
   * Calculate optimal team composition based on effort and project duration
   */
  static calculateTeamSize(
    roleEfforts: RoleEffort[],
    projectDurationWeeks: number,
    hoursPerDay: number = 6
  ): TeamComposition[] {
    const teamComposition: TeamComposition[] = [];
    const hoursPerWeek = hoursPerDay * 5;

    for (const effort of roleEfforts) {
      const pattern = ROLE_ALLOCATION_PATTERN[effort.role as keyof typeof ROLE_ALLOCATION_PATTERN];

      let count = 1;
      let allocationPercentage = 100;

      switch (pattern) {
        case 'per-task':
          // Calculate FTE based on total hours and project duration
          const requiredFTE = effort.totalHours / (hoursPerWeek * projectDurationWeeks);
          count = Math.ceil(requiredFTE);
          allocationPercentage = count > 0 ? Math.round((requiredFTE / count) * 100) : 100;
          break;

        case 'ratio-based':
          // QA is ratio-based (already calculated in estimator)
          count = Math.ceil(effort.fte);
          allocationPercentage = 100;
          break;

        case 'full-project':
          // BA, SM, UX stay for entire project at reduced capacity
          count = 1;
          allocationPercentage = 50; // Typically 50% allocated
          break;
      }

      teamComposition.push({
        role: effort.role,
        count: Math.max(count, 1),
        allocationPercentage: Math.min(allocationPercentage, 100),
      });
    }

    return teamComposition;
  }

  /**
   * Calculate required QA headcount based on developer count
   */
  static calculateQACount(devCount: number): number {
    return Math.ceil(devCount * QA_RATIO);
  }

  /**
   * Validate team composition (e.g., ensure minimum roles)
   */
  static validateTeamComposition(composition: TeamComposition[]): {
    valid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const roles = composition.map((c) => c.role);

    // Check for essential roles
    if (!roles.includes('Fullstack') && !roles.includes('DevOps')) {
      warnings.push('No development roles found (Fullstack or DevOps)');
    }

    if (!roles.includes('QA')) {
      warnings.push('No QA role allocated - consider adding QA resources');
    }

    if (!roles.includes('SM')) {
      warnings.push('No Scrum Master - recommended for agile projects');
    }

    if (!roles.includes('BA')) {
      warnings.push('No Business Analyst - may impact requirements clarity');
    }

    // Check for overstaffing
    const totalDevs = composition
      .filter((c) => c.role === 'Fullstack' || c.role === 'DevOps')
      .reduce((sum, c) => sum + c.count, 0);

    if (totalDevs > 9) {
      warnings.push(`Large team size (${totalDevs} developers) - consider splitting into sub-teams`);
    }

    return {
      valid: warnings.length === 0,
      warnings,
    };
  }

  /**
   * Calculate total team cost per sprint
   */
  static calculateSprintCost(
    composition: TeamComposition[],
    roleRates: Map<Role, number>,
    hoursPerDay: number = 6,
    sprintLengthWeeks: number = 2
  ): number {
    let totalCost = 0;

    for (const member of composition) {
      const hourlyRate = roleRates.get(member.role) || 0;
      const hoursPerSprint = hoursPerDay * 5 * sprintLengthWeeks;
      const effectiveHours = hoursPerSprint * (member.allocationPercentage / 100);
      const memberCost = member.count * effectiveHours * hourlyRate;
      totalCost += memberCost;
    }

    return totalCost;
  }

  /**
   * Generate team allocation summary
   */
  static generateAllocationSummary(composition: TeamComposition[]): string {
    const lines: string[] = ['Team Allocation Summary:', ''];

    let totalHeadcount = 0;

    for (const member of composition) {
      totalHeadcount += member.count;
      const allocation =
        member.allocationPercentage === 100 ? 'Full-time' : `${member.allocationPercentage}%`;
      lines.push(`  ${member.role}: ${member.count} person(s) @ ${allocation}`);
    }

    lines.push('');
    lines.push(`Total Headcount: ${totalHeadcount}`);

    return lines.join('\n');
  }
}


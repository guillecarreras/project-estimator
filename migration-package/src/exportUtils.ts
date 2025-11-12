import { EstimationResult, RoleEffort, GanttTask } from './types';
import * as fs from 'fs';

export class ExportUtils {
  /**
   * Export estimation result to JSON file
   */
  static exportToJSON(result: EstimationResult, filename: string = 'estimation.json'): void {
    const json = JSON.stringify(result, null, 2);
    fs.writeFileSync(filename, json, 'utf-8');
    console.log(`✅ Estimation exported to ${filename}`);
  }

  /**
   * Export estimation result to CSV format
   */
  static exportToCSV(result: EstimationResult, filename: string = 'estimation.csv'): void {
    const lines: string[] = [];

    // Header section
    lines.push('PROJECT ESTIMATION SUMMARY');
    lines.push('');
    lines.push(`Backlog Items,${result.backlogItemCount}`);
    lines.push(`Total Base Hours,${Math.round(result.totalBaseHours)}`);
    lines.push(`Total Cost,$${result.totalCost.toLocaleString()}`);
    lines.push(`Duration (Weeks),${result.durationWeeks}`);
    lines.push(`Duration (Sprints),${result.durationSprints}`);
    lines.push(`Start Date,${result.startDate}`);
    lines.push(`End Date,${result.endDate}`);
    lines.push(`Working Days,${result.workingDays}`);
    lines.push('');

    // Role efforts
    lines.push('ROLE EFFORTS');
    lines.push('Role,Base Hours,With Multipliers,Total Hours,FTE,Cost');
    for (const effort of result.roleEfforts) {
      lines.push(
        `${effort.role},${Math.round(effort.baseHours)},${Math.round(effort.withMultipliers)},${Math.round(effort.totalHours)},${effort.fte.toFixed(2)},$${Math.round(effort.cost)}`
      );
    }
    lines.push('');

    // Team composition
    lines.push('TEAM COMPOSITION');
    lines.push('Role,Count,Allocation %');
    for (const member of result.teamComposition) {
      lines.push(`${member.role},${member.count},${member.allocationPercentage}%`);
    }
    lines.push('');

    // Assumptions
    lines.push('ASSUMPTIONS');
    for (const assumption of result.assumptions) {
      lines.push(`"${assumption}"`);
    }

    const csv = lines.join('\n');
    fs.writeFileSync(filename, csv, 'utf-8');
    console.log(`✅ Estimation exported to ${filename}`);
  }

  /**
   * Export Gantt data to CSV
   */
  static exportGanttToCSV(ganttData: GanttTask[], filename: string = 'gantt.csv'): void {
    const lines: string[] = [];

    lines.push('Epic,Feature,Role,Start Date,End Date,Hours,Days');
    for (const task of ganttData) {
      lines.push(
        `"${task.epic}","${task.feature}",${task.role},${task.startDate},${task.endDate},${Math.round(task.hours)},${task.days}`
      );
    }

    const csv = lines.join('\n');
    fs.writeFileSync(filename, csv, 'utf-8');
    console.log(`✅ Gantt data exported to ${filename}`);
  }

  /**
   * Generate a formatted console output
   */
  static printSummary(result: EstimationResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('PROJECT ESTIMATION SUMMARY');
    console.log('='.repeat(60));

    console.log(`\n📊 Scope: ${result.backlogItemCount} backlog items`);
    console.log(`⏱️  Total Base Hours: ${Math.round(result.totalBaseHours)} hours`);
    console.log(`📅 Duration: ${result.durationWeeks} weeks (${result.durationSprints} sprints)`);
    console.log(`🗓️  Timeline: ${result.startDate} → ${result.endDate}`);
    console.log(`💼 Working Days: ${result.workingDays} days`);
    console.log(`💰 Total Cost: $${result.totalCost.toLocaleString()}`);

    console.log('\n' + '-'.repeat(60));
    console.log('ROLE EFFORTS');
    console.log('-'.repeat(60));
    console.log(
      'Role'.padEnd(15),
      'Hours'.padStart(10),
      'FTE'.padStart(8),
      'Cost'.padStart(15)
    );
    console.log('-'.repeat(60));

    for (const effort of result.roleEfforts) {
      console.log(
        effort.role.padEnd(15),
        Math.round(effort.totalHours).toString().padStart(10),
        effort.fte.toFixed(2).padStart(8),
        `$${Math.round(effort.cost).toLocaleString()}`.padStart(15)
      );
    }

    console.log('\n' + '-'.repeat(60));
    console.log('TEAM COMPOSITION');
    console.log('-'.repeat(60));
    console.log('Role'.padEnd(15), 'Count'.padStart(10), 'Allocation'.padStart(15));
    console.log('-'.repeat(60));

    for (const member of result.teamComposition) {
      console.log(
        member.role.padEnd(15),
        member.count.toString().padStart(10),
        `${member.allocationPercentage}%`.padStart(15)
      );
    }

    console.log('\n' + '-'.repeat(60));
    console.log('ASSUMPTIONS');
    console.log('-'.repeat(60));
    for (const assumption of result.assumptions) {
      console.log(`  • ${assumption}`);
    }
    console.log('='.repeat(60) + '\n');
  }
}


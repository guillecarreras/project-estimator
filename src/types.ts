export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';

export type Role = 'Fullstack' | 'QA' | 'DevOps' | 'BA' | 'SM' | 'UX';

export interface BacklogItem {
  epic: string;
  feature: string;
  tshirt_size: TShirtSize;
  roles: Role[];
}

export interface EstimationConfig {
  hoursPerDay: number;
  sprintLengthWeeks: number;
  unitTestingPercentage: number;
  bugFixingPercentage: number;
  documentationPercentage: number;
  contingencyPercentage: number;
  startDate: string; // YYYY-MM-DD
}

export interface RoleRate {
  role: Role;
  hourlyRate: number;
}

export interface RoleEffort {
  role: Role;
  baseHours: number;
  withMultipliers: number;
  totalHours: number;
  fte: number;
  cost: number;
}

export interface TeamComposition {
  role: Role;
  count: number;
  allocationPercentage: number;
}

export interface EstimationResult {
  backlogItemCount: number;
  totalBaseHours: number;
  roleEfforts: RoleEffort[];
  teamComposition: TeamComposition[];
  totalCost: number;
  durationDays: number;
  durationWeeks: number;
  durationSprints: number;
  startDate: string;
  endDate: string;
  workingDays: number;
  assumptions: string[];
  ganttData: GanttTask[];
}

export interface GanttTask {
  epic: string;
  feature: string;
  role: Role;
  startDate: string;
  endDate: string;
  hours: number;
  days: number;
}


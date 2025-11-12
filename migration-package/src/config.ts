import { TShirtSize, Role, RoleRate, EstimationConfig } from './types';

// T-shirt size to hours mapping
export const TSHIRT_HOURS: Record<TShirtSize, number> = {
  XS: 9,
  S: 18,
  M: 36,
  L: 72,
  XL: 108,
  XXL: 144,
  XXXL: 189,
};

// Role hourly rates (in USD or local currency)
export const ROLE_RATES: RoleRate[] = [
  { role: 'Fullstack', hourlyRate: 85 },
  { role: 'QA', hourlyRate: 60 },
  { role: 'DevOps', hourlyRate: 90 },
  { role: 'BA', hourlyRate: 70 },
  { role: 'SM', hourlyRate: 75 },
  { role: 'UX', hourlyRate: 80 },
];

// Default estimation parameters
export const DEFAULT_CONFIG: EstimationConfig = {
  hoursPerDay: 6, // Productive hours per day
  sprintLengthWeeks: 2,
  unitTestingPercentage: 15, // Add 15% for unit testing
  bugFixingPercentage: 20, // Add 20% for bug fixing
  documentationPercentage: 10, // Add 10% for documentation
  contingencyPercentage: 15, // Add 15% contingency
  startDate: new Date().toISOString().split('T')[0],
};

// QA to Developer ratio
export const QA_RATIO = 1 / 3; // 1 QA per 3 Developers

// Role allocation patterns
export const ROLE_ALLOCATION_PATTERN = {
  Fullstack: 'per-task', // Allocated per task
  QA: 'ratio-based', // Based on dev count
  DevOps: 'per-task', // Allocated per task
  BA: 'full-project', // Stays until end
  SM: 'full-project', // Stays until end
  UX: 'full-project', // Stays until end
};

// Export helper to get rate by role
export function getRateByRole(role: Role): number {
  const roleRate = ROLE_RATES.find((r) => r.role === role);
  return roleRate?.hourlyRate || 0;
}


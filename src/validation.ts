import { z } from 'zod';

const tshirtSizeSchema = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']);
const roleSchema = z.enum(['Fullstack', 'QA', 'DevOps', 'BA', 'SM', 'UX']);

export const backlogItemSchema = z.object({
  epic: z.string().min(1, 'Epic is required'),
  feature: z.string().min(1, 'Feature is required'),
  tshirt_size: tshirtSizeSchema,
  roles: z.array(roleSchema).min(1, 'At least one role is required'),
});

export const estimationConfigSchema = z.object({
  hoursPerDay: z.number().min(1).max(24),
  sprintLengthWeeks: z.number().min(1).max(12),
  unitTestingPercentage: z.number().min(0).max(100),
  bugFixingPercentage: z.number().min(0).max(100),
  documentationPercentage: z.number().min(0).max(100),
  contingencyPercentage: z.number().min(0).max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const backlogArraySchema = z.array(backlogItemSchema);

export class ValidationError extends Error {
  constructor(
    public errors: z.ZodIssue[],
    message?: string
  ) {
    super(message || 'Validation failed');
    this.name = 'ValidationError';
  }
}

export function validateBacklog(data: unknown) {
  try {
    return backlogArraySchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        error.issues,
        `Invalid backlog format:\n${error.issues.map((e: z.ZodIssue) => `  - ${e.path.join('.')}: ${e.message}`).join('\n')}`
      );
    }
    throw error;
  }
}

export function validateConfig(data: unknown) {
  try {
    return estimationConfigSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        error.issues,
        `Invalid configuration:\n${error.issues.map((e: z.ZodIssue) => `  - ${e.path.join('.')}: ${e.message}`).join('\n')}`
      );
    }
    throw error;
  }
}

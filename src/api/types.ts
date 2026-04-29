import { BacklogItem, EstimationConfig, EstimationResult } from '../types';

// Request/Response DTOs for Projects
export interface CreateProjectRequest {
  name: string;
}

export interface UpdateProjectRequest {
  name: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  estimations?: EstimationResponse[];
}

// Request/Response DTOs for Estimations
export interface CreateEstimationRequest {
  projectId: string;
  backlogJson: BacklogItem[];
  configJson: EstimationConfig;
  resultJson: EstimationResult;
}

export interface UpdateEstimationRequest {
  backlogJson?: BacklogItem[];
  configJson?: EstimationConfig;
  resultJson?: EstimationResult;
}

export interface EstimationResponse {
  id: string;
  projectId: string;
  backlogJson: BacklogItem[];
  configJson: EstimationConfig;
  resultJson: EstimationResult;
  createdAt: Date;
  project?: ProjectResponse;
  snapshots?: SnapshotResponse[];
}

// Request/Response DTOs for Snapshots
export interface CreateSnapshotRequest {
  estimationId: string;
  actualHours: number;
  actualCost: number;
}

export interface SnapshotResponse {
  id: string;
  estimationId: string;
  actualHours: number;
  actualCost: number;
  createdAt: Date;
  estimation?: EstimationResponse;
}

// Error Response
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

// Success Response with metadata
export interface SuccessResponse<T> {
  data?: T;
  message?: string;
  timestamp?: string;
}

// List Response
export interface ListResponse<T> {
  data: T[];
  count: number;
  timestamp?: string;
}

// Analytics Response
export interface AnalyticsResponse {
  estimationId: string;
  estimatedHours: number;
  estimatedCost: number;
  actualHours: number;
  actualCost: number;
  hoursVariance: number;
  hoursVariancePercent: number;
  costVariance: number;
  costVariancePercent: number;
  snapshotCount: number;
}

// Validation error response
export interface ValidationErrorResponse extends ErrorResponse {
  errors?: Record<string, string>;
}

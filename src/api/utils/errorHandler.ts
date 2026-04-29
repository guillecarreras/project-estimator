import { Response } from 'express';
import { ErrorResponse, ValidationErrorResponse } from '../types';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    public message: string,
    public errors?: Record<string, string>,
  ) {
    super(400, message, errors);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(public message: string) {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(public message: string) {
    super(409, message);
    this.name = 'ConflictError';
  }
}

export function sendErrorResponse(res: Response, error: unknown): void {
  const timestamp = new Date().toISOString();

  if (error instanceof ValidationError) {
    const response: ValidationErrorResponse = {
      error: error.name,
      message: error.message,
      errors: error.errors,
      timestamp,
    };
    res.status(error.statusCode).json(response);
    return;
  }

  if (error instanceof ApiError) {
    const response: ErrorResponse = {
      error: error.name,
      message: error.message,
      details: error.details,
      timestamp,
    };
    res.status(error.statusCode).json(response);
    return;
  }

  if (error instanceof Error) {
    const response: ErrorResponse = {
      error: 'InternalServerError',
      message: error.message,
      timestamp,
    };
    res.status(500).json(response);
    return;
  }

  const response: ErrorResponse = {
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
    timestamp,
  };
  res.status(500).json(response);
}

export function validateRequired(fields: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') {
      errors[key] = `${key} is required`;
    }
  }
  return errors;
}

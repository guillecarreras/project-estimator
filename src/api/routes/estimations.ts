import { Router, Request, Response } from 'express';
import { EstimationRepository } from '../../database/repositories/EstimationRepository';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { DataSource } from 'typeorm';
import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';
import { CreateEstimationRequest, UpdateEstimationRequest } from '../types';
import { sendErrorResponse, ValidationError, NotFoundError } from '../utils/errorHandler';

export function createEstimationRoutes(dataSource: DataSource): Router {
  const router = Router();
  const estimationRepository = new EstimationRepository(dataSource);
  const projectRepository = new ProjectRepository(dataSource);

  /**
   * POST /api/estimations
   * Create a new estimation
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { projectId, backlogJson, configJson, resultJson } = req.body as CreateEstimationRequest;
      const timestamp = new Date().toISOString();

      // Validate required fields
      const errors: Record<string, string> = {};
      if (!projectId) errors.projectId = 'projectId is required';
      if (!backlogJson) errors.backlogJson = 'backlogJson is required';
      if (!configJson) errors.configJson = 'configJson is required';
      if (!resultJson) errors.resultJson = 'resultJson is required';

      if (Object.keys(errors).length > 0) {
        throw new ValidationError('Missing required fields', errors);
      }

      // Verify project exists
      const project = await projectRepository.findById(projectId);
      if (!project) {
        throw new NotFoundError(`Project with ID ${projectId} not found`);
      }

      // Validate backlog
      if (!Array.isArray(backlogJson) || backlogJson.length === 0) {
        throw new ValidationError('backlogJson must be a non-empty array');
      }

      const estimation = await estimationRepository.create(
        projectId,
        backlogJson,
        configJson,
        resultJson,
      );

      res.status(201).json({
        data: estimation,
        message: 'Estimation created successfully',
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * GET /api/estimations
   * List estimations (optionally filtered by projectId)
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      const timestamp = new Date().toISOString();

      let estimations;
      if (projectId && typeof projectId === 'string') {
        // Verify project exists
        const project = await projectRepository.findById(projectId);
        if (!project) {
          throw new NotFoundError(`Project with ID ${projectId} not found`);
        }
        estimations = await estimationRepository.findByProjectId(projectId);
      } else {
        estimations = await estimationRepository.findAll();
      }

      res.json({
        data: estimations,
        count: estimations.length,
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * GET /api/estimations/:id
   * Get a specific estimation by ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const timestamp = new Date().toISOString();

      if (!id || id.trim().length === 0) {
        throw new ValidationError('Estimation ID is required');
      }

      const estimation = await estimationRepository.findById(id);

      if (!estimation) {
        throw new NotFoundError(`Estimation with ID ${id} not found`);
      }

      res.json({
        data: estimation,
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * PUT /api/estimations/:id
   * Update an existing estimation
   */
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { backlogJson, configJson, resultJson } = req.body as UpdateEstimationRequest;
      const timestamp = new Date().toISOString();

      if (!id || id.trim().length === 0) {
        throw new ValidationError('Estimation ID is required');
      }

      // At least one field must be provided
      if (!backlogJson && !configJson && !resultJson) {
        throw new ValidationError('At least one field (backlogJson, configJson, or resultJson) must be provided');
      }

      // Validate backlog if provided
      if (backlogJson && (!Array.isArray(backlogJson) || backlogJson.length === 0)) {
        throw new ValidationError('backlogJson must be a non-empty array');
      }

      const estimation = await estimationRepository.update(id, backlogJson, configJson, resultJson);

      if (!estimation) {
        throw new NotFoundError(`Estimation with ID ${id} not found`);
      }

      res.json({
        data: estimation,
        message: 'Estimation updated successfully',
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * DELETE /api/estimations/:id
   * Delete an estimation
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const timestamp = new Date().toISOString();

      if (!id || id.trim().length === 0) {
        throw new ValidationError('Estimation ID is required');
      }

      const deleted = await estimationRepository.delete(id);

      if (!deleted) {
        throw new NotFoundError(`Estimation with ID ${id} not found`);
      }

      res.json({
        message: 'Estimation deleted successfully',
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  return router;
}

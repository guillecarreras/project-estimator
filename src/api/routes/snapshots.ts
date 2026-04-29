import { Router, Request, Response } from 'express';
import { SnapshotRepository } from '../../database/repositories/SnapshotRepository';
import { EstimationRepository } from '../../database/repositories/EstimationRepository';
import { DataSource } from 'typeorm';
import { CreateSnapshotRequest } from '../types';
import { sendErrorResponse, ValidationError, NotFoundError } from '../utils/errorHandler';

export function createSnapshotRoutes(dataSource: DataSource): Router {
  const router = Router();
  const snapshotRepository = new SnapshotRepository(dataSource);
  const estimationRepository = new EstimationRepository(dataSource);

  /**
   * POST /api/snapshots
   * Create a new snapshot for an estimation
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { estimationId, actualHours, actualCost } = req.body as CreateSnapshotRequest;
      const timestamp = new Date().toISOString();

      // Validate required fields
      const errors: Record<string, string> = {};
      if (!estimationId) errors.estimationId = 'estimationId is required';
      if (actualHours === undefined || actualHours === null) errors.actualHours = 'actualHours is required';
      if (actualCost === undefined || actualCost === null) errors.actualCost = 'actualCost is required';

      if (Object.keys(errors).length > 0) {
        throw new ValidationError('Missing required fields', errors);
      }

      // Validate numeric values
      if (typeof actualHours !== 'number' || actualHours < 0) {
        throw new ValidationError('actualHours must be a non-negative number');
      }
      if (typeof actualCost !== 'number' || actualCost < 0) {
        throw new ValidationError('actualCost must be a non-negative number');
      }

      // Verify estimation exists
      const estimation = await estimationRepository.findById(estimationId);
      if (!estimation) {
        throw new NotFoundError(`Estimation with ID ${estimationId} not found`);
      }

      const snapshot = await snapshotRepository.create(estimationId, actualHours, actualCost);
      res.status(201).json({
        data: snapshot,
        message: 'Snapshot created successfully',
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * GET /api/snapshots
   * List snapshots (optionally filtered by estimationId)
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { estimationId } = req.query;
      const timestamp = new Date().toISOString();

      let snapshots;
      if (estimationId && typeof estimationId === 'string') {
        // Verify estimation exists
        const estimation = await estimationRepository.findById(estimationId);
        if (!estimation) {
          throw new NotFoundError(`Estimation with ID ${estimationId} not found`);
        }
        snapshots = await snapshotRepository.findByEstimationId(estimationId);
      } else {
        snapshots = await snapshotRepository.findAll();
      }

      res.json({
        data: snapshots,
        count: snapshots.length,
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * GET /api/snapshots/:id
   * Get a specific snapshot by ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const timestamp = new Date().toISOString();

      if (!id || id.trim().length === 0) {
        throw new ValidationError('Snapshot ID is required');
      }

      const snapshot = await snapshotRepository.findById(id);

      if (!snapshot) {
        throw new NotFoundError(`Snapshot with ID ${id} not found`);
      }

      res.json({
        data: snapshot,
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * DELETE /api/snapshots/:id
   * Delete a snapshot
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const timestamp = new Date().toISOString();

      if (!id || id.trim().length === 0) {
        throw new ValidationError('Snapshot ID is required');
      }

      const deleted = await snapshotRepository.delete(id);

      if (!deleted) {
        throw new NotFoundError(`Snapshot with ID ${id} not found`);
      }

      res.json({
        message: 'Snapshot deleted successfully',
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  return router;
}

import { Router, Request, Response } from 'express';
import { SnapshotRepository } from '../../database/repositories/SnapshotRepository';
import { EstimationRepository } from '../../database/repositories/EstimationRepository';
import { DataSource } from 'typeorm';

export function createSnapshotRoutes(dataSource: DataSource): Router {
  const router = Router();
  const snapshotRepository = new SnapshotRepository(dataSource);
  const estimationRepository = new EstimationRepository(dataSource);

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { estimationId, actualHours, actualCost } = req.body;

      if (!estimationId || actualHours === undefined || actualCost === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const estimation = await estimationRepository.findById(estimationId);
      if (!estimation) {
        res.status(404).json({ error: 'Estimation not found' });
        return;
      }

      const snapshot = await snapshotRepository.create(estimationId, actualHours, actualCost);
      res.status(201).json(snapshot);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const snapshot = await snapshotRepository.findById(id);

      if (!snapshot) {
        res.status(404).json({ error: 'Snapshot not found' });
        return;
      }

      res.json(snapshot);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.get('/', async (req: Request, res: Response) => {
    try {
      const { estimationId } = req.query;

      let snapshots;
      if (estimationId) {
        snapshots = await snapshotRepository.findByEstimationId(estimationId as string);
      } else {
        snapshots = await snapshotRepository.findAll();
      }

      res.json(snapshots);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await snapshotRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Snapshot not found' });
        return;
      }

      res.json({ message: 'Snapshot deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  return router;
}

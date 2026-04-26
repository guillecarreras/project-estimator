import { Router, Request, Response } from 'express';
import { EstimationRepository } from '../../database/repositories/EstimationRepository';
import { DataSource } from 'typeorm';

interface AnalyticsData {
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

export function createAnalyticsRoutes(dataSource: DataSource): Router {
  const router = Router();
  const estimationRepository = new EstimationRepository(dataSource);

  router.get('/', async (req: Request, res: Response) => {
    try {
      const estimations = await estimationRepository.findAll();
      const analytics: AnalyticsData[] = [];

      for (const estimation of estimations) {
        if (estimation.snapshots.length === 0) continue;

        const estimatedHours = estimation.resultJson.roleEfforts.reduce((sum, effort) => sum + effort.totalHours, 0);
        const estimatedCost = estimation.resultJson.totalCost;

        const latestSnapshot = estimation.snapshots[0];
        const actualHours = latestSnapshot.actualHours;
        const actualCost = latestSnapshot.actualCost;

        const hoursVariance = actualHours - estimatedHours;
        const hoursVariancePercent = (hoursVariance / estimatedHours) * 100;
        const costVariance = actualCost - estimatedCost;
        const costVariancePercent = (costVariance / estimatedCost) * 100;

        analytics.push({
          estimationId: estimation.id,
          estimatedHours,
          estimatedCost,
          actualHours: Number(actualHours),
          actualCost: Number(actualCost),
          hoursVariance,
          hoursVariancePercent,
          costVariance,
          costVariancePercent,
          snapshotCount: estimation.snapshots.length,
        });
      }

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.get('/:estimationId', async (req: Request, res: Response) => {
    try {
      const { estimationId } = req.params;
      const estimation = await estimationRepository.findById(estimationId);

      if (!estimation) {
        res.status(404).json({ error: 'Estimation not found' });
        return;
      }

      if (estimation.snapshots.length === 0) {
        res.json({ message: 'No snapshots available for this estimation' });
        return;
      }

      const estimatedHours = estimation.resultJson.roleEfforts.reduce((sum, effort) => sum + effort.totalHours, 0);
      const estimatedCost = estimation.resultJson.totalCost;

      const snapshotAnalytics = estimation.snapshots.map((snapshot) => {
        const actualHours = snapshot.actualHours;
        const actualCost = snapshot.actualCost;

        const hoursVariance = actualHours - estimatedHours;
        const hoursVariancePercent = (hoursVariance / estimatedHours) * 100;
        const costVariance = actualCost - estimatedCost;
        const costVariancePercent = (costVariance / estimatedCost) * 100;

        return {
          snapshotId: snapshot.id,
          createdAt: snapshot.createdAt,
          estimatedHours,
          estimatedCost,
          actualHours: Number(actualHours),
          actualCost: Number(actualCost),
          hoursVariance,
          hoursVariancePercent,
          costVariance,
          costVariancePercent,
        };
      });

      res.json({
        estimationId,
        snapshots: snapshotAnalytics,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  return router;
}

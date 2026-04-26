import { Router, Request, Response } from 'express';
import { EstimationRepository } from '../../database/repositories/EstimationRepository';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { SnapshotRepository } from '../../database/repositories/SnapshotRepository';
import { DataSource } from 'typeorm';
import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';

export function createEstimationRoutes(dataSource: DataSource): Router {
  const router = Router();
  const estimationRepository = new EstimationRepository(dataSource);
  const projectRepository = new ProjectRepository(dataSource);

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { projectId, backlogJson, configJson, resultJson } = req.body;

      if (!projectId || !backlogJson || !configJson || !resultJson) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const project = await projectRepository.findById(projectId);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const estimation = await estimationRepository.create(
        projectId,
        backlogJson as BacklogItem[],
        configJson as EstimationConfig,
        resultJson as EstimationResult,
      );

      res.status(201).json(estimation);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const estimation = await estimationRepository.findById(id);

      if (!estimation) {
        res.status(404).json({ error: 'Estimation not found' });
        return;
      }

      res.json(estimation);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.get('/', async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;

      let estimations;
      if (projectId) {
        estimations = await estimationRepository.findByProjectId(projectId as string);
      } else {
        estimations = await estimationRepository.findAll();
      }

      res.json(estimations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { backlogJson, configJson, resultJson } = req.body;

      const estimation = await estimationRepository.update(
        id,
        backlogJson as BacklogItem[] | undefined,
        configJson as EstimationConfig | undefined,
        resultJson as EstimationResult | undefined,
      );

      if (!estimation) {
        res.status(404).json({ error: 'Estimation not found' });
        return;
      }

      res.json(estimation);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await estimationRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Estimation not found' });
        return;
      }

      res.json({ message: 'Estimation deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  return router;
}

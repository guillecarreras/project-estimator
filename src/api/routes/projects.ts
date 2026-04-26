import { Router, Request, Response } from 'express';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { DataSource } from 'typeorm';

export function createProjectRoutes(dataSource: DataSource): Router {
  const router = Router();
  const projectRepository = new ProjectRepository(dataSource);

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Project name is required' });
        return;
      }

      const project = await projectRepository.create(name);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = await projectRepository.findById(id);

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.get('/', async (req: Request, res: Response) => {
    try {
      const projects = await projectRepository.findAll();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Project name is required' });
        return;
      }

      const project = await projectRepository.update(id, name);

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await projectRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  return router;
}

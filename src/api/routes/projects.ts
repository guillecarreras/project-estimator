import { Router, Request, Response } from 'express';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { DataSource } from 'typeorm';
import { CreateProjectRequest, UpdateProjectRequest, ProjectResponse } from '../types';
import { sendErrorResponse, ValidationError, NotFoundError } from '../utils/errorHandler';

export function createProjectRoutes(dataSource: DataSource): Router {
  const router = Router();
  const projectRepository = new ProjectRepository(dataSource);

  /**
   * POST /api/projects
   * Create a new project
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { name } = req.body as CreateProjectRequest;
      const timestamp = new Date().toISOString();

      if (!name || name.trim().length === 0) {
        throw new ValidationError('Project name is required and must not be empty');
      }

      const project = await projectRepository.create(name.trim());
      res.status(201).json({
        data: project,
        message: 'Project created successfully',
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * GET /api/projects
   * List all projects
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const projects = await projectRepository.findAll();
      const timestamp = new Date().toISOString();

      res.json({
        data: projects,
        count: projects.length,
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * GET /api/projects/:id
   * Get a specific project by ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const timestamp = new Date().toISOString();

      if (!id || id.trim().length === 0) {
        throw new ValidationError('Project ID is required');
      }

      const project = await projectRepository.findById(id);

      if (!project) {
        throw new NotFoundError(`Project with ID ${id} not found`);
      }

      res.json({
        data: project,
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * PUT /api/projects/:id
   * Update an existing project
   */
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name } = req.body as UpdateProjectRequest;
      const timestamp = new Date().toISOString();

      if (!id || id.trim().length === 0) {
        throw new ValidationError('Project ID is required');
      }

      if (!name || name.trim().length === 0) {
        throw new ValidationError('Project name is required and must not be empty');
      }

      const project = await projectRepository.update(id, name.trim());

      if (!project) {
        throw new NotFoundError(`Project with ID ${id} not found`);
      }

      res.json({
        data: project,
        message: 'Project updated successfully',
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  /**
   * DELETE /api/projects/:id
   * Delete a project
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const timestamp = new Date().toISOString();

      if (!id || id.trim().length === 0) {
        throw new ValidationError('Project ID is required');
      }

      const deleted = await projectRepository.delete(id);

      if (!deleted) {
        throw new NotFoundError(`Project with ID ${id} not found`);
      }

      res.json({
        message: 'Project deleted successfully',
        timestamp,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  });

  return router;
}

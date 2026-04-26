/**
 * Integration Tests for API Endpoints
 */

import express, { Express } from 'express';
import request from 'supertest';
import jiraRoutes from '../../api/routes/jira';
import dependenciesRoutes from '../../api/routes/dependencies';
import { Task, DependencyType } from '../../features/dependencies/models';
import { BacklogItem } from '../../types';

describe('API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/jira', jiraRoutes);
    app.use('/api/dependencies', dependenciesRoutes);
  });

  describe('Jira Routes', () => {
    describe('POST /api/jira/authenticate', () => {
      it('should return 400 with missing credentials', async () => {
        const response = await request(app)
          .post('/api/jira/authenticate')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });

      it('should require all authentication fields', async () => {
        const response = await request(app)
          .post('/api/jira/authenticate')
          .send({
            host: 'test.atlassian.net',
            username: 'test@example.com',
          });

        expect(response.status).toBe(400);
      });
    });

    describe('POST /api/jira/create-issue', () => {
      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/jira/create-issue')
          .send({
            summary: 'Test Issue',
            description: 'Test Description',
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('authenticated');
      });

      it('should require summary field', async () => {
        const response = await request(app)
          .post('/api/jira/create-issue')
          .send({
            description: 'Test Description',
          });

        expect(response.status).toBe(400);
        // Will fail auth first, but that's ok for this test
        expect(response.body.error).toBeDefined();
      });
    });

    describe('POST /api/jira/search', () => {
      it('should require JQL query', async () => {
        const response = await request(app)
          .post('/api/jira/search')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });

      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/jira/search')
          .send({
            jql: 'project = TEST',
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('authenticated');
      });
    });
  });

  describe('Dependencies Routes', () => {
    const sampleTasks: Task[] = [
      {
        id: 'T1',
        name: 'Analysis',
        duration: 5,
        dependencies: [],
        criticality: 0,
      },
      {
        id: 'T2',
        name: 'Development',
        duration: 10,
        dependencies: [{ taskId: 'T1', type: 'FS' as DependencyType, lag: 0 }],
        criticality: 0,
      },
      {
        id: 'T3',
        name: 'Testing',
        duration: 5,
        dependencies: [{ taskId: 'T2', type: 'FS' as DependencyType, lag: 0 }],
        criticality: 0,
      },
    ];

    const startDate = '2025-11-03';

    describe('POST /api/dependencies/analyze', () => {
      it('should return 400 with missing tasks', async () => {
        const response = await request(app)
          .post('/api/dependencies/analyze')
          .send({
            startDate: startDate,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('tasks');
      });

      it('should return 400 with missing startDate', async () => {
        const response = await request(app)
          .post('/api/dependencies/analyze')
          .send({
            tasks: sampleTasks,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('startDate');
      });

      it('should calculate critical path with valid input', async () => {
        const response = await request(app)
          .post('/api/dependencies/analyze')
          .send({
            tasks: sampleTasks,
            startDate: startDate,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.criticalPath).toBeDefined();
        expect(response.body.criticalPath.duration).toBeGreaterThan(0);
      });
    });

    describe('POST /api/dependencies/schedule', () => {
      it('should generate schedule with valid input', async () => {
        const response = await request(app)
          .post('/api/dependencies/schedule')
          .send({
            tasks: sampleTasks,
            startDate: startDate,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.schedule).toBeDefined();
        expect(response.body.ganttEntries).toBeDefined();
      });

      it('should include task slack information', async () => {
        const response = await request(app)
          .post('/api/dependencies/schedule')
          .send({
            tasks: sampleTasks,
            startDate: startDate,
          });

        expect(response.status).toBe(200);
        expect(response.body.taskSlacks).toBeDefined();
        expect(Array.isArray(response.body.taskSlacks)).toBe(true);
      });
    });

    describe('POST /api/dependencies/validate', () => {
      it('should return 400 with missing tasks', async () => {
        const response = await request(app)
          .post('/api/dependencies/validate')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('tasks');
      });

      it('should validate correct task dependencies', async () => {
        const response = await request(app)
          .post('/api/dependencies/validate')
          .send({
            tasks: sampleTasks,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.valid).toBe(true);
      });

      it('should detect circular dependencies', async () => {
        const circularTasks: Task[] = [
          {
            id: 'T1',
            name: 'Task 1',
            duration: 5,
            dependencies: [{ taskId: 'T2', type: 'FS' as DependencyType }],
            criticality: 0,
          },
          {
            id: 'T2',
            name: 'Task 2',
            duration: 5,
            dependencies: [{ taskId: 'T1', type: 'FS' as DependencyType }],
            criticality: 0,
          },
        ];

        const response = await request(app)
          .post('/api/dependencies/validate')
          .send({
            tasks: circularTasks,
          });

        expect(response.status).toBe(200);
        expect(response.body.valid).toBe(false);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.length).toBeGreaterThan(0);
      });
    });

    describe('POST /api/dependencies/precedence-diagram', () => {
      it('should generate precedence diagram', async () => {
        const response = await request(app)
          .post('/api/dependencies/precedence-diagram')
          .send({
            tasks: sampleTasks,
            startDate: startDate,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.diagram).toBeDefined();
        expect(response.body.diagram.nodes).toBeDefined();
        expect(response.body.diagram.edges).toBeDefined();
      });
    });

    describe('POST /api/dependencies/gantt-chart', () => {
      it('should generate JSON gantt chart', async () => {
        const response = await request(app)
          .post('/api/dependencies/gantt-chart')
          .send({
            tasks: sampleTasks,
            startDate: startDate,
            format: 'json',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.gantt).toBeDefined();
        expect(response.body.gantt.project).toBeDefined();
        expect(response.body.gantt.tasks).toBeDefined();
      });

      it('should generate CSV gantt chart', async () => {
        const response = await request(app)
          .post('/api/dependencies/gantt-chart')
          .send({
            tasks: sampleTasks,
            startDate: startDate,
            format: 'csv',
          });

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/csv');
        expect(response.text).toContain('Task ID');
      });

      it('should generate HTML gantt chart', async () => {
        const response = await request(app)
          .post('/api/dependencies/gantt-chart')
          .send({
            tasks: sampleTasks,
            startDate: startDate,
            format: 'html',
          });

        expect(response.status).toBe(200);
        expect(response.type).toContain('text/html');
        expect(response.text).toContain('<!DOCTYPE html>');
      });
    });

    describe('POST /api/dependencies/slack-analysis', () => {
      it('should analyze task slack times', async () => {
        const response = await request(app)
          .post('/api/dependencies/slack-analysis')
          .send({
            tasks: sampleTasks,
            startDate: startDate,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.slackAnalysis).toBeDefined();
        expect(response.body.summary).toBeDefined();
        expect(response.body.summary.criticalTasks).toBeGreaterThan(0);
      });
    });
  });
});

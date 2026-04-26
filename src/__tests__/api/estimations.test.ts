import request from 'supertest';
import express from 'express';
import { DataSource } from 'typeorm';
import { createEstimationRoutes } from '../../api/routes/estimations';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { createTestDataSource, closeTestDataSource } from '../setup';
import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';

describe('Estimations API', () => {
  let app: express.Application;
  let dataSource: DataSource;
  let projectId: string;

  const mockBacklog: BacklogItem[] = [
    { epic: 'Feature 1', feature: 'Sub-feature A', tshirt_size: 'M', roles: ['Fullstack'] },
  ];

  const mockConfig: EstimationConfig = {
    hoursPerDay: 8,
    sprintLengthWeeks: 2,
    unitTestingPercentage: 20,
    bugFixingPercentage: 15,
    documentationPercentage: 10,
    contingencyPercentage: 20,
    startDate: '2024-05-01',
  };

  const mockResult: EstimationResult = {
    backlogItemCount: 1,
    totalBaseHours: 100,
    roleEfforts: [
      { role: 'Fullstack', baseHours: 100, withMultipliers: 120, totalHours: 120, fte: 0.75, cost: 12000 },
    ],
    teamComposition: [{ role: 'Fullstack', count: 1, allocationPercentage: 100 }],
    totalCost: 12000,
    durationDays: 15,
    durationWeeks: 2.14,
    durationSprints: 1.07,
    startDate: '2024-05-01',
    endDate: '2024-05-16',
    workingDays: 11,
    assumptions: ['Test assumption'],
    ganttData: [],
  };

  beforeAll(async () => {
    dataSource = await createTestDataSource();

    app = express();
    app.use(express.json());
    app.use('/api/estimations', createEstimationRoutes(dataSource));

    const projectRepository = new ProjectRepository(dataSource);
    const project = await projectRepository.create('Test Project');
    projectId = project.id;
  });

  afterAll(async () => {
    await closeTestDataSource(dataSource);
  });

  test('POST /api/estimations should create an estimation', async () => {
    const response = await request(app).post('/api/estimations').send({
      projectId,
      backlogJson: mockBacklog,
      configJson: mockConfig,
      resultJson: mockResult,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.projectId).toBe(projectId);
  });

  test('POST /api/estimations should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/estimations')
      .send({
        projectId,
        backlogJson: mockBacklog,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('POST /api/estimations should return 404 for non-existent project', async () => {
    const response = await request(app).post('/api/estimations').send({
      projectId: 'non-existent-id',
      backlogJson: mockBacklog,
      configJson: mockConfig,
      resultJson: mockResult,
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

  test('GET /api/estimations/:id should retrieve an estimation', async () => {
    const createResponse = await request(app).post('/api/estimations').send({
      projectId,
      backlogJson: mockBacklog,
      configJson: mockConfig,
      resultJson: mockResult,
    });

    const estimationId = createResponse.body.id;

    const getResponse = await request(app).get(`/api/estimations/${estimationId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(estimationId);
  });

  test('GET /api/estimations/:id should return 404 for non-existent estimation', async () => {
    const response = await request(app).get('/api/estimations/non-existent-id');

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

  test('GET /api/estimations should list all estimations', async () => {
    const response = await request(app).get('/api/estimations');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/estimations?projectId= should filter by project', async () => {
    const response = await request(app).get(`/api/estimations?projectId=${projectId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('PUT /api/estimations/:id should update an estimation', async () => {
    const createResponse = await request(app).post('/api/estimations').send({
      projectId,
      backlogJson: mockBacklog,
      configJson: mockConfig,
      resultJson: mockResult,
    });

    const estimationId = createResponse.body.id;

    const newBacklog: BacklogItem[] = [
      { epic: 'Feature 2', feature: 'Sub-feature B', tshirt_size: 'L', roles: ['QA'] },
    ];

    const updateResponse = await request(app).put(`/api/estimations/${estimationId}`).send({
      backlogJson: newBacklog,
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.backlogJson).toEqual(newBacklog);
  });

  test('DELETE /api/estimations/:id should delete an estimation', async () => {
    const createResponse = await request(app).post('/api/estimations').send({
      projectId,
      backlogJson: mockBacklog,
      configJson: mockConfig,
      resultJson: mockResult,
    });

    const estimationId = createResponse.body.id;

    const deleteResponse = await request(app).delete(`/api/estimations/${estimationId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBeDefined();
  });
});

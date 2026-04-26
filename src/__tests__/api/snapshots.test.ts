import request from 'supertest';
import express from 'express';
import { DataSource } from 'typeorm';
import { createSnapshotRoutes } from '../../api/routes/snapshots';
import { EstimationRepository } from '../../database/repositories/EstimationRepository';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { createTestDataSource, closeTestDataSource } from '../setup';
import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';

describe('Snapshots API', () => {
  let app: express.Application;
  let dataSource: DataSource;
  let estimationId: string;

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
    app.use('/api/snapshots', createSnapshotRoutes(dataSource));

    const projectRepository = new ProjectRepository(dataSource);
    const estimationRepository = new EstimationRepository(dataSource);
    const project = await projectRepository.create('Test Project');
    const estimation = await estimationRepository.create(project.id, mockBacklog, mockConfig, mockResult);
    estimationId = estimation.id;
  });

  afterAll(async () => {
    await closeTestDataSource(dataSource);
  });

  test('POST /api/snapshots should create a snapshot', async () => {
    const response = await request(app).post('/api/snapshots').send({
      estimationId,
      actualHours: 120,
      actualCost: 15000,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.estimationId).toBe(estimationId);
  });

  test('POST /api/snapshots should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/snapshots')
      .send({
        estimationId,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('POST /api/snapshots should return 404 for non-existent estimation', async () => {
    const response = await request(app).post('/api/snapshots').send({
      estimationId: 'non-existent-id',
      actualHours: 120,
      actualCost: 15000,
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

  test('GET /api/snapshots/:id should retrieve a snapshot', async () => {
    const createResponse = await request(app).post('/api/snapshots').send({
      estimationId,
      actualHours: 130,
      actualCost: 16000,
    });

    const snapshotId = createResponse.body.id;

    const getResponse = await request(app).get(`/api/snapshots/${snapshotId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(snapshotId);
  });

  test('GET /api/snapshots/:id should return 404 for non-existent snapshot', async () => {
    const response = await request(app).get('/api/snapshots/non-existent-id');

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

  test('GET /api/snapshots should list all snapshots', async () => {
    const response = await request(app).get('/api/snapshots');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/snapshots?estimationId= should filter by estimation', async () => {
    const response = await request(app).get(`/api/snapshots?estimationId=${estimationId}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('DELETE /api/snapshots/:id should delete a snapshot', async () => {
    const createResponse = await request(app).post('/api/snapshots').send({
      estimationId,
      actualHours: 140,
      actualCost: 17000,
    });

    const snapshotId = createResponse.body.id;

    const deleteResponse = await request(app).delete(`/api/snapshots/${snapshotId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBeDefined();
  });
});

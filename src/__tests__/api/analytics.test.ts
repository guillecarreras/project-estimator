import request from 'supertest';
import express from 'express';
import { DataSource } from 'typeorm';
import { createAnalyticsRoutes } from '../../api/routes/analytics';
import { EstimationRepository } from '../../database/repositories/EstimationRepository';
import { SnapshotRepository } from '../../database/repositories/SnapshotRepository';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { createTestDataSource, closeTestDataSource } from '../setup';
import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';

describe('Analytics API', () => {
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
    app.use('/api/analytics', createAnalyticsRoutes(dataSource));

    const projectRepository = new ProjectRepository(dataSource);
    const estimationRepository = new EstimationRepository(dataSource);
    const snapshotRepository = new SnapshotRepository(dataSource);

    const project = await projectRepository.create('Test Project');
    const estimation = await estimationRepository.create(project.id, mockBacklog, mockConfig, mockResult);
    estimationId = estimation.id;

    await snapshotRepository.create(estimationId, 150, 18000);
  });

  afterAll(async () => {
    await closeTestDataSource(dataSource);
  });

  test('GET /api/analytics should return analytics for all estimations', async () => {
    const response = await request(app).get('/api/analytics');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /api/analytics should calculate variance correctly', async () => {
    const response = await request(app).get('/api/analytics');

    const analytics = response.body[0];
    expect(analytics.hoursVariance).toBeDefined();
    expect(analytics.hoursVariancePercent).toBeDefined();
    expect(analytics.costVariance).toBeDefined();
    expect(analytics.costVariancePercent).toBeDefined();
  });

  test('GET /api/analytics/:estimationId should retrieve specific estimation analytics', async () => {
    const response = await request(app).get(`/api/analytics/${estimationId}`);

    expect(response.status).toBe(200);
    expect(response.body.estimationId).toBe(estimationId);
    expect(Array.isArray(response.body.snapshots)).toBe(true);
  });

  test('GET /api/analytics/:estimationId should return snapshots analytics', async () => {
    const response = await request(app).get(`/api/analytics/${estimationId}`);

    expect(response.status).toBe(200);
    const snapshots = response.body.snapshots;

    expect(snapshots.length).toBeGreaterThan(0);
    const snapshot = snapshots[0];
    expect(snapshot.snapshotId).toBeDefined();
    expect(snapshot.hoursVariance).toBeDefined();
    expect(snapshot.costVariance).toBeDefined();
  });

  test('GET /api/analytics/:estimationId should return 404 for non-existent estimation', async () => {
    const response = await request(app).get('/api/analytics/non-existent-id');

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

  test('Analytics should calculate positive variance for over estimates', async () => {
    const response = await request(app).get(`/api/analytics/${estimationId}`);

    const snapshots = response.body.snapshots;
    const snapshot = snapshots[0];

    expect(snapshot.actualHours).toBe(150);
    expect(snapshot.hoursVariance).toBeGreaterThan(0);
  });
});

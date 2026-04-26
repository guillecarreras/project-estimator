import { DataSource } from 'typeorm';
import { SnapshotRepository } from '../../database/repositories/SnapshotRepository';
import { EstimationRepository } from '../../database/repositories/EstimationRepository';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { createTestDataSource, closeTestDataSource } from '../setup';
import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';

describe('SnapshotRepository', () => {
  let dataSource: DataSource;
  let snapshotRepository: SnapshotRepository;
  let estimationRepository: EstimationRepository;
  let projectRepository: ProjectRepository;
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
    snapshotRepository = new SnapshotRepository(dataSource);
    estimationRepository = new EstimationRepository(dataSource);
    projectRepository = new ProjectRepository(dataSource);

    const project = await projectRepository.create('Test Project');
    const estimation = await estimationRepository.create(project.id, mockBacklog, mockConfig, mockResult);
    estimationId = estimation.id;
  });

  afterAll(async () => {
    await closeTestDataSource(dataSource);
  });

  test('should create a snapshot', async () => {
    const snapshot = await snapshotRepository.create(estimationId, 120, 15000);

    expect(snapshot.id).toBeDefined();
    expect(snapshot.estimationId).toBe(estimationId);
    expect(snapshot.actualHours).toBe(120);
    expect(snapshot.actualCost).toBe(15000);
  });

  test('should find snapshot by id', async () => {
    const created = await snapshotRepository.create(estimationId, 110, 14000);
    const found = await snapshotRepository.findById(created.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
  });

  test('should find snapshots by estimation id', async () => {
    const created1 = await snapshotRepository.create(estimationId, 100, 13000);
    const created2 = await snapshotRepository.create(estimationId, 105, 13500);

    const found = await snapshotRepository.findByEstimationId(estimationId);

    expect(found.length).toBeGreaterThanOrEqual(2);
    expect(found.some((s) => s.id === created1.id)).toBe(true);
    expect(found.some((s) => s.id === created2.id)).toBe(true);
  });

  test('should find all snapshots', async () => {
    const all = await snapshotRepository.findAll();
    expect(all.length).toBeGreaterThan(0);
  });

  test('should delete snapshot', async () => {
    const created = await snapshotRepository.create(estimationId, 125, 16000);
    const deleted = await snapshotRepository.delete(created.id);

    expect(deleted).toBe(true);
    const found = await snapshotRepository.findById(created.id);
    expect(found).toBeNull();
  });

  test('should return false when deleting non-existent snapshot', async () => {
    const deleted = await snapshotRepository.delete('non-existent-id');
    expect(deleted).toBe(false);
  });
});

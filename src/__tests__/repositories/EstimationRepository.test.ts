import { DataSource } from 'typeorm';
import { EstimationRepository } from '../../database/repositories/EstimationRepository';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { createTestDataSource, closeTestDataSource } from '../setup';
import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';

describe('EstimationRepository', () => {
  let dataSource: DataSource;
  let estimationRepository: EstimationRepository;
  let projectRepository: ProjectRepository;
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
    estimationRepository = new EstimationRepository(dataSource);
    projectRepository = new ProjectRepository(dataSource);
    const project = await projectRepository.create('Test Project');
    projectId = project.id;
  });

  afterAll(async () => {
    await closeTestDataSource(dataSource);
  });

  test('should create an estimation', async () => {
    const estimation = await estimationRepository.create(projectId, mockBacklog, mockConfig, mockResult);

    expect(estimation.id).toBeDefined();
    expect(estimation.projectId).toBe(projectId);
    expect(estimation.backlogJson).toEqual(mockBacklog);
    expect(estimation.configJson).toEqual(mockConfig);
    expect(estimation.resultJson).toEqual(mockResult);
  });

  test('should find estimation by id', async () => {
    const created = await estimationRepository.create(projectId, mockBacklog, mockConfig, mockResult);
    const found = await estimationRepository.findById(created.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);
  });

  test('should find estimations by project id', async () => {
    const created1 = await estimationRepository.create(projectId, mockBacklog, mockConfig, mockResult);
    const created2 = await estimationRepository.create(projectId, mockBacklog, mockConfig, mockResult);

    const found = await estimationRepository.findByProjectId(projectId);

    expect(found.length).toBeGreaterThanOrEqual(2);
    expect(found.some((e) => e.id === created1.id)).toBe(true);
    expect(found.some((e) => e.id === created2.id)).toBe(true);
  });

  test('should find all estimations', async () => {
    const all = await estimationRepository.findAll();
    expect(all.length).toBeGreaterThan(0);
  });

  test('should update estimation', async () => {
    const created = await estimationRepository.create(projectId, mockBacklog, mockConfig, mockResult);
    const newBacklog: BacklogItem[] = [
      { epic: 'Feature 2', feature: 'Sub-feature B', tshirt_size: 'L', roles: ['QA'] },
    ];

    const updated = await estimationRepository.update(created.id, newBacklog);

    expect(updated?.backlogJson).toEqual(newBacklog);
  });

  test('should delete estimation', async () => {
    const created = await estimationRepository.create(projectId, mockBacklog, mockConfig, mockResult);
    const deleted = await estimationRepository.delete(created.id);

    expect(deleted).toBe(true);
    const found = await estimationRepository.findById(created.id);
    expect(found).toBeNull();
  });

  test('should find latest estimation by project id', async () => {
    const latest = await estimationRepository.findLatestByProjectId(projectId);
    expect(latest).not.toBeNull();
  });
});

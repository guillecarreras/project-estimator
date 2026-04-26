import { DataSource } from 'typeorm';
import { ProjectRepository } from '../../database/repositories/ProjectRepository';
import { createTestDataSource, closeTestDataSource } from '../setup';

describe('ProjectRepository', () => {
  let dataSource: DataSource;
  let projectRepository: ProjectRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    projectRepository = new ProjectRepository(dataSource);
  });

  afterAll(async () => {
    await closeTestDataSource(dataSource);
  });

  test('should create a project', async () => {
    const project = await projectRepository.create('Test Project');

    expect(project.id).toBeDefined();
    expect(project.name).toBe('Test Project');
    expect(project.createdAt).toBeDefined();
    expect(project.updatedAt).toBeDefined();
  });

  test('should find project by id', async () => {
    const created = await projectRepository.create('Find Test Project');
    const found = await projectRepository.findById(created.id);

    expect(found).not.toBeNull();
    expect(found?.name).toBe('Find Test Project');
  });

  test('should return null for non-existent project', async () => {
    const found = await projectRepository.findById('non-existent-id');
    expect(found).toBeNull();
  });

  test('should find all projects', async () => {
    await projectRepository.create('Project 1');
    await projectRepository.create('Project 2');

    const all = await projectRepository.findAll();

    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  test('should update project', async () => {
    const created = await projectRepository.create('Original Name');
    const updated = await projectRepository.update(created.id, 'Updated Name');

    expect(updated?.name).toBe('Updated Name');
  });

  test('should delete project', async () => {
    const created = await projectRepository.create('Delete Test');
    const deleted = await projectRepository.delete(created.id);

    expect(deleted).toBe(true);
    const found = await projectRepository.findById(created.id);
    expect(found).toBeNull();
  });

  test('should return false when deleting non-existent project', async () => {
    const deleted = await projectRepository.delete('non-existent-id');
    expect(deleted).toBe(false);
  });
});

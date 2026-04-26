import request from 'supertest';
import express from 'express';
import { DataSource } from 'typeorm';
import { createProjectRoutes } from '../../api/routes/projects';
import { createTestDataSource, closeTestDataSource } from '../setup';

describe('Projects API', () => {
  let app: express.Application;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await createTestDataSource();

    app = express();
    app.use(express.json());
    app.use('/api/projects', createProjectRoutes(dataSource));
  });

  afterAll(async () => {
    await closeTestDataSource(dataSource);
  });

  test('POST /api/projects should create a project', async () => {
    const response = await request(app).post('/api/projects').send({
      name: 'Test Project',
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Test Project');
  });

  test('POST /api/projects should return 400 for missing name', async () => {
    const response = await request(app).post('/api/projects').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('GET /api/projects/:id should retrieve a project', async () => {
    const createResponse = await request(app).post('/api/projects').send({
      name: 'Retrieve Test',
    });

    const projectId = createResponse.body.id;

    const getResponse = await request(app).get(`/api/projects/${projectId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(projectId);
    expect(getResponse.body.name).toBe('Retrieve Test');
  });

  test('GET /api/projects/:id should return 404 for non-existent project', async () => {
    const response = await request(app).get('/api/projects/non-existent-id');

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });

  test('GET /api/projects should list all projects', async () => {
    await request(app).post('/api/projects').send({ name: 'Project 1' });
    await request(app).post('/api/projects').send({ name: 'Project 2' });

    const response = await request(app).get('/api/projects');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  test('PUT /api/projects/:id should update a project', async () => {
    const createResponse = await request(app).post('/api/projects').send({
      name: 'Original Name',
    });

    const projectId = createResponse.body.id;

    const updateResponse = await request(app).put(`/api/projects/${projectId}`).send({
      name: 'Updated Name',
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('Updated Name');
  });

  test('PUT /api/projects/:id should return 400 for missing name', async () => {
    const createResponse = await request(app).post('/api/projects').send({
      name: 'Test',
    });

    const projectId = createResponse.body.id;

    const updateResponse = await request(app).put(`/api/projects/${projectId}`).send({});

    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body.error).toBeDefined();
  });

  test('DELETE /api/projects/:id should delete a project', async () => {
    const createResponse = await request(app).post('/api/projects').send({
      name: 'Delete Test',
    });

    const projectId = createResponse.body.id;

    const deleteResponse = await request(app).delete(`/api/projects/${projectId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBeDefined();

    const getResponse = await request(app).get(`/api/projects/${projectId}`);
    expect(getResponse.status).toBe(404);
  });
});

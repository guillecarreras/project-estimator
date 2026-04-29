/**
 * API Endpoints Integration Tests
 *
 * Tests all REST API endpoints for CRUD operations on:
 * - Projects
 * - Estimations
 * - Snapshots
 */

import request from 'supertest';
import app from '../server';

// Sample data for tests
const sampleProject = {
  name: 'Test Project',
};

const sampleEstimationConfig = {
  hoursPerDay: 8,
  sprintLengthWeeks: 2,
  unitTestingPercentage: 20,
  bugFixingPercentage: 10,
  documentationPercentage: 10,
  contingencyPercentage: 15,
  startDate: '2024-04-29',
};

const sampleBacklogJson = [
  {
    epic: 'Auth',
    feature: 'User Login',
    tshirt_size: 'M',
    roles: ['Fullstack'],
  },
];

const sampleResultJson = {
  backlogItemCount: 1,
  totalBaseHours: 40,
  roleEfforts: [
    {
      role: 'Fullstack',
      baseHours: 40,
      withMultipliers: 50,
      totalHours: 50,
      fte: 0.25,
      cost: 2500,
    },
  ],
  teamComposition: [
    {
      role: 'Fullstack',
      count: 1,
      allocationPercentage: 100,
    },
  ],
  totalCost: 2500,
  durationDays: 10,
  durationWeeks: 2,
  durationSprints: 1,
  startDate: '2024-04-29',
  endDate: '2024-05-10',
  workingDays: 10,
  assumptions: [],
  ganttData: [],
};

describe('Project Endpoints', () => {
  let projectId: string;

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send(sampleProject)
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('message', 'Project created successfully');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('name', sampleProject.name);
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');

      projectId = res.body.data.id;
    });

    it('should reject project creation without name', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'ValidationError');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should reject project creation with empty name', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({ name: '' })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'ValidationError');
    });
  });

  describe('GET /api/projects', () => {
    it('should list all projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('count');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should get a specific project', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id', projectId);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app)
        .get('/api/projects/non-existent-id')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NotFoundError');
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update a project', async () => {
      const updatedName = 'Updated Test Project';
      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .send({ name: updatedName })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('name', updatedName);
      expect(res.body).toHaveProperty('message', 'Project updated successfully');
    });

    it('should reject update without name', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'ValidationError');
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app)
        .put('/api/projects/non-existent-id')
        .send({ name: 'Test' })
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NotFoundError');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let deleteProjectId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({ name: 'Project to Delete' });
      deleteProjectId = res.body.data.id;
    });

    it('should delete a project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${deleteProjectId}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Project deleted successfully');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should return 404 when deleting non-existent project', async () => {
      const res = await request(app)
        .delete('/api/projects/non-existent-id')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NotFoundError');
    });
  });
});

describe('Estimation Endpoints', () => {
  let projectId: string;
  let estimationId: string;

  beforeAll(async () => {
    // Create a project for testing estimations
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Estimation Test Project' });
    projectId = res.body.data.id;
  });

  describe('POST /api/estimations', () => {
    it('should create a new estimation', async () => {
      const res = await request(app)
        .post('/api/estimations')
        .send({
          projectId,
          backlogJson: sampleBacklogJson,
          configJson: sampleEstimationConfig,
          resultJson: sampleResultJson,
        })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('message', 'Estimation created successfully');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('projectId', projectId);

      estimationId = res.body.data.id;
    });

    it('should reject estimation without projectId', async () => {
      const res = await request(app)
        .post('/api/estimations')
        .send({
          backlogJson: sampleBacklogJson,
          configJson: sampleEstimationConfig,
          resultJson: sampleResultJson,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'ValidationError');
    });

    it('should reject estimation with non-existent project', async () => {
      const res = await request(app)
        .post('/api/estimations')
        .send({
          projectId: 'non-existent-project',
          backlogJson: sampleBacklogJson,
          configJson: sampleEstimationConfig,
          resultJson: sampleResultJson,
        })
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NotFoundError');
    });

    it('should reject estimation with empty backlogJson', async () => {
      const res = await request(app)
        .post('/api/estimations')
        .send({
          projectId,
          backlogJson: [],
          configJson: sampleEstimationConfig,
          resultJson: sampleResultJson,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'ValidationError');
    });
  });

  describe('GET /api/estimations', () => {
    it('should list all estimations', async () => {
      const res = await request(app)
        .get('/api/estimations')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('count');
    });

    it('should filter estimations by projectId', async () => {
      const res = await request(app)
        .get(`/api/estimations?projectId=${projectId}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).toHaveProperty('projectId', projectId);
      }
    });
  });

  describe('GET /api/estimations/:id', () => {
    it('should get a specific estimation', async () => {
      const res = await request(app)
        .get(`/api/estimations/${estimationId}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id', estimationId);
    });

    it('should return 404 for non-existent estimation', async () => {
      const res = await request(app)
        .get('/api/estimations/non-existent-id')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NotFoundError');
    });
  });

  describe('PUT /api/estimations/:id', () => {
    it('should update estimation with new backlogJson', async () => {
      const updatedBacklog = [
        {
          epic: 'Dashboard',
          feature: 'Analytics Dashboard',
          tshirt_size: 'L',
          roles: ['Fullstack'],
        },
      ];

      const res = await request(app)
        .put(`/api/estimations/${estimationId}`)
        .send({ backlogJson: updatedBacklog })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('message', 'Estimation updated successfully');
    });

    it('should reject update without any fields', async () => {
      const res = await request(app)
        .put(`/api/estimations/${estimationId}`)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('error', 'ValidationError');
    });

    it('should return 404 for non-existent estimation', async () => {
      const res = await request(app)
        .put('/api/estimations/non-existent-id')
        .send({ backlogJson: sampleBacklogJson })
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NotFoundError');
    });
  });

  describe('DELETE /api/estimations/:id', () => {
    let deleteEstimationId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/estimations')
        .send({
          projectId,
          backlogJson: sampleBacklogJson,
          configJson: sampleEstimationConfig,
          resultJson: sampleResultJson,
        });
      deleteEstimationId = res.body.data.id;
    });

    it('should delete an estimation', async () => {
      const res = await request(app)
        .delete(`/api/estimations/${deleteEstimationId}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Estimation deleted successfully');
    });

    it('should return 404 when deleting non-existent estimation', async () => {
      const res = await request(app)
        .delete('/api/estimations/non-existent-id')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NotFoundError');
    });
  });
});

describe('Snapshot Endpoints', () => {
  let projectId: string;
  let estimationId: string;
  let snapshotId: string;

  beforeAll(async () => {
    // Create a project and estimation for testing snapshots
    const projectRes = await request(app)
      .post('/api/projects')
      .send({ name: 'Snapshot Test Project' });
    projectId = projectRes.body.data.id;

    const estimationRes = await request(app)
      .post('/api/estimations')
      .send({
        projectId,
        backlogJson: sampleBacklogJson,
        configJson: sampleEstimationConfig,
        resultJson: sampleResultJson,
      });
    estimationId = estimationRes.body.data.id;
  });

  describe('POST /api/snapshots', () => {
    it('should create a new snapshot', async () => {
      const res = await request(app)
        .post('/api/snapshots')
        .send({
          estimationId,
          actualHours: 45.5,
          actualCost: 2300,
        })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('message', 'Snapshot created successfully');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('estimationId', estimationId);
      expect(res.body.data).toHaveProperty('actualHours', 45.5);
      expect(res.body.data).toHaveProperty('actualCost', 2300);

      snapshotId = res.body.data.id;
    });

    it('should reject snapshot without estimationId', async () => {
      const res = await request(app)
        .post('/api/snapshots')
        .send({
          actualHours: 45.5,
          actualCost: 2300,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'ValidationError');
    });

    it('should reject snapshot with non-existent estimation', async () => {
      const res = await request(app)
        .post('/api/snapshots')
        .send({
          estimationId: 'non-existent-estimation',
          actualHours: 45.5,
          actualCost: 2300,
        })
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NotFoundError');
    });

    it('should reject snapshot with negative hours', async () => {
      const res = await request(app)
        .post('/api/snapshots')
        .send({
          estimationId,
          actualHours: -10,
          actualCost: 2300,
        })
        .expect(400);

      expect(res.body).toHaveProperty('error', 'ValidationError');
    });
  });

  describe('GET /api/snapshots', () => {
    it('should list all snapshots', async () => {
      const res = await request(app)
        .get('/api/snapshots')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('count');
    });

    it('should filter snapshots by estimationId', async () => {
      const res = await request(app)
        .get(`/api/snapshots?estimationId=${estimationId}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/snapshots/:id', () => {
    it('should get a specific snapshot', async () => {
      const res = await request(app)
        .get(`/api/snapshots/${snapshotId}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id', snapshotId);
    });

    it('should return 404 for non-existent snapshot', async () => {
      const res = await request(app)
        .get('/api/snapshots/non-existent-id')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NotFoundError');
    });
  });

  describe('DELETE /api/snapshots/:id', () => {
    let deleteSnapshotId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/snapshots')
        .send({
          estimationId,
          actualHours: 50,
          actualCost: 2500,
        });
      deleteSnapshotId = res.body.data.id;
    });

    it('should delete a snapshot', async () => {
      const res = await request(app)
        .delete(`/api/snapshots/${deleteSnapshotId}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Snapshot deleted successfully');
    });

    it('should return 404 when deleting non-existent snapshot', async () => {
      const res = await request(app)
        .delete('/api/snapshots/non-existent-id')
        .expect(404);

      expect(res.body).toHaveProperty('error', 'NotFoundError');
    });
  });
});

describe('Health Check', () => {
  it('should return ok status', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
  });
});

describe('API Info', () => {
  it('should return API information', async () => {
    const res = await request(app)
      .get('/api/info')
      .expect(200);

    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('endpoints');
  });
});

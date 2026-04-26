import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

export class SeedData1714185600001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const projectId1 = randomUUID();
    const projectId2 = randomUUID();
    const projectId3 = randomUUID();

    await queryRunner.query(
      `INSERT INTO "projects" (id, name, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())`,
      [projectId1, 'E-commerce Platform Redesign'],
    );

    await queryRunner.query(
      `INSERT INTO "projects" (id, name, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())`,
      [projectId2, 'Mobile Banking App'],
    );

    await queryRunner.query(
      `INSERT INTO "projects" (id, name, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())`,
      [projectId3, 'Analytics Dashboard'],
    );

    const estimationId1 = randomUUID();
    const backlog1 = [
      { epic: 'User Experience', feature: 'Homepage Redesign', tshirt_size: 'L', roles: ['Fullstack', 'UX'] },
      { epic: 'User Experience', feature: 'Product Search', tshirt_size: 'M', roles: ['Fullstack', 'QA'] },
      { epic: 'Payment', feature: 'Payment Gateway Integration', tshirt_size: 'L', roles: ['Fullstack', 'QA'] },
      { epic: 'Payment', feature: 'Refund Management', tshirt_size: 'M', roles: ['Fullstack'] },
    ];
    const config1 = {
      hoursPerDay: 8,
      sprintLengthWeeks: 2,
      unitTestingPercentage: 20,
      bugFixingPercentage: 15,
      documentationPercentage: 10,
      contingencyPercentage: 20,
      startDate: '2024-05-01',
    };
    const result1 = {
      backlogItemCount: 4,
      totalBaseHours: 480,
      roleEfforts: [
        {
          role: 'Fullstack',
          baseHours: 300,
          withMultipliers: 360,
          totalHours: 360,
          fte: 2.25,
          cost: 43200,
        },
        {
          role: 'QA',
          baseHours: 120,
          withMultipliers: 144,
          totalHours: 144,
          fte: 0.9,
          cost: 14400,
        },
        {
          role: 'UX',
          baseHours: 60,
          withMultipliers: 72,
          totalHours: 72,
          fte: 0.45,
          cost: 10800,
        },
      ],
      teamComposition: [
        { role: 'Fullstack', count: 2, allocationPercentage: 100 },
        { role: 'QA', count: 1, allocationPercentage: 75 },
        { role: 'UX', count: 1, allocationPercentage: 50 },
      ],
      totalCost: 68400,
      durationDays: 45,
      durationWeeks: 6.43,
      durationSprints: 3.21,
      startDate: '2024-05-01',
      endDate: '2024-06-15',
      workingDays: 32,
      assumptions: ['No scope changes', 'Team fully available'],
      ganttData: [],
    };

    await queryRunner.query(
      `INSERT INTO "estimations" (id, "projectId", "backlogJson", "configJson", "resultJson", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())`,
      [estimationId1, projectId1, JSON.stringify(backlog1), JSON.stringify(config1), JSON.stringify(result1)],
    );

    const estimationId2 = randomUUID();
    const backlog2 = [
      { epic: 'Authentication', feature: 'Biometric Login', tshirt_size: 'M', roles: ['Fullstack', 'QA'] },
      { epic: 'Transactions', feature: 'Real-time Balance', tshirt_size: 'S', roles: ['Fullstack'] },
      { epic: 'Transactions', feature: 'Transfer Money', tshirt_size: 'L', roles: ['Fullstack', 'QA'] },
    ];
    const config2 = {
      hoursPerDay: 8,
      sprintLengthWeeks: 2,
      unitTestingPercentage: 25,
      bugFixingPercentage: 15,
      documentationPercentage: 10,
      contingencyPercentage: 25,
      startDate: '2024-06-01',
    };
    const result2 = {
      backlogItemCount: 3,
      totalBaseHours: 360,
      roleEfforts: [
        {
          role: 'Fullstack',
          baseHours: 240,
          withMultipliers: 300,
          totalHours: 300,
          fte: 1.875,
          cost: 36000,
        },
        {
          role: 'QA',
          baseHours: 80,
          withMultipliers: 100,
          totalHours: 100,
          fte: 0.625,
          cost: 10000,
        },
      ],
      teamComposition: [
        { role: 'Fullstack', count: 2, allocationPercentage: 100 },
        { role: 'QA', count: 1, allocationPercentage: 65 },
      ],
      totalCost: 46000,
      durationDays: 38,
      durationWeeks: 5.43,
      durationSprints: 2.71,
      startDate: '2024-06-01',
      endDate: '2024-07-09',
      workingDays: 27,
      assumptions: ['Biometric SDK available', 'Backend APIs ready'],
      ganttData: [],
    };

    await queryRunner.query(
      `INSERT INTO "estimations" (id, "projectId", "backlogJson", "configJson", "resultJson", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())`,
      [estimationId2, projectId2, JSON.stringify(backlog2), JSON.stringify(config2), JSON.stringify(result2)],
    );

    const snapshotId1 = randomUUID();
    await queryRunner.query(
      `INSERT INTO "snapshots" (id, "estimationId", "actualHours", "actualCost", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
      [snapshotId1, estimationId1, 520, 78000],
    );

    const snapshotId2 = randomUUID();
    await queryRunner.query(
      `INSERT INTO "snapshots" (id, "estimationId", "actualHours", "actualCost", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
      [snapshotId2, estimationId2, 410, 49200],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "snapshots"`);
    await queryRunner.query(`DELETE FROM "estimations"`);
    await queryRunner.query(`DELETE FROM "projects"`);
  }
}

import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema1714185600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'estimations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'projectId',
            type: 'uuid',
          },
          {
            name: 'backlogJson',
            type: 'jsonb',
          },
          {
            name: 'configJson',
            type: 'jsonb',
          },
          {
            name: 'resultJson',
            type: 'jsonb',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'estimations',
      new TableIndex({
        columnNames: ['projectId'],
        name: 'IDX_estimations_projectId',
      }),
    );

    await queryRunner.createForeignKey(
      'estimations',
      new TableForeignKey({
        columnNames: ['projectId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'snapshots',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'estimationId',
            type: 'uuid',
          },
          {
            name: 'actualHours',
            type: 'numeric',
            precision: 10,
            scale: 2,
          },
          {
            name: 'actualCost',
            type: 'numeric',
            precision: 15,
            scale: 2,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'snapshots',
      new TableIndex({
        columnNames: ['estimationId'],
        name: 'IDX_snapshots_estimationId',
      }),
    );

    await queryRunner.createForeignKey(
      'snapshots',
      new TableForeignKey({
        columnNames: ['estimationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'estimations',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('snapshots', 'FK_snapshots_estimationId');
    await queryRunner.dropIndex('snapshots', 'IDX_snapshots_estimationId');
    await queryRunner.dropTable('snapshots');

    await queryRunner.dropForeignKey('estimations', 'FK_estimations_projectId');
    await queryRunner.dropIndex('estimations', 'IDX_estimations_projectId');
    await queryRunner.dropTable('estimations');

    await queryRunner.dropTable('projects');
  }
}

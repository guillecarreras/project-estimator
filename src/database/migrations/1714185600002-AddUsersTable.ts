import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import * as crypto from 'crypto';

export class AddUsersTable1714185600002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'passwordHash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            default: "'user'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'tokenInvalidatedAt',
            type: 'bigint',
            default: 0,
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

    // Create indexes for username and email
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        columnNames: ['username'],
        name: 'IDX_users_username',
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        columnNames: ['email'],
        name: 'IDX_users_email',
        isUnique: true,
      }),
    );

    // Insert demo admin user
    const passwordSalt = process.env.PASSWORD_SALT || 'salt';
    const demoPassword = 'demo123';
    const passwordHash = crypto.createHash('sha256').update(demoPassword + passwordSalt).digest('hex');

    await queryRunner.query(
      `INSERT INTO users (username, email, "passwordHash", role, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      ['admin', 'admin@example.com', passwordHash, 'admin', true],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_email');
    await queryRunner.dropIndex('users', 'IDX_users_username');
    await queryRunner.dropTable('users');
  }
}

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Project } from './entities/Project';
import { Estimation } from './entities/Estimation';
import { Snapshot } from './entities/Snapshot';
import { User } from './entities/User';
import { InitialSchema1714185600000 } from './migrations/1714185600000-InitialSchema';
import { SeedData1714185600001 } from './migrations/1714185600001-SeedData';
import { AddUsersTable1714185600002 } from './migrations/1714185600002-AddUsersTable';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'estimator',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'test',
  entities: [Project, Estimation, Snapshot, User],
  migrations: [InitialSchema1714185600000, SeedData1714185600001, AddUsersTable1714185600002],
  subscribers: [],
  migrationsRun: true,
});

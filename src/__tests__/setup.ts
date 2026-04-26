import { DataSource } from 'typeorm';
import { Project } from '../database/entities/Project';
import { Estimation } from '../database/entities/Estimation';
import { Snapshot } from '../database/entities/Snapshot';

export const createTestDataSource = async (): Promise<DataSource> => {
  const testDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'estimator_test',
    synchronize: true,
    dropSchema: true,
    entities: [Project, Estimation, Snapshot],
    logging: false,
  });

  await testDataSource.initialize();
  return testDataSource;
};

export const closeTestDataSource = async (dataSource: DataSource): Promise<void> => {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
};

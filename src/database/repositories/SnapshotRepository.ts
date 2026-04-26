import { Repository, DataSource } from 'typeorm';
import { Snapshot } from '../entities/Snapshot';

export class SnapshotRepository {
  private repository: Repository<Snapshot>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Snapshot);
  }

  async create(estimationId: string, actualHours: number, actualCost: number): Promise<Snapshot> {
    const snapshot = this.repository.create({
      estimationId,
      actualHours,
      actualCost,
    });
    return this.repository.save(snapshot);
  }

  async findById(id: string): Promise<Snapshot | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['estimation'],
    });
  }

  async findByEstimationId(estimationId: string): Promise<Snapshot[]> {
    return this.repository.find({
      where: { estimationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Snapshot[]> {
    return this.repository.find({
      relations: ['estimation'],
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }
}

import { Repository, DataSource } from 'typeorm';
import { Estimation } from '../entities/Estimation';
import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';

export class EstimationRepository {
  private repository: Repository<Estimation>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Estimation);
  }

  async create(
    projectId: string,
    backlogJson: BacklogItem[],
    configJson: EstimationConfig,
    resultJson: EstimationResult,
  ): Promise<Estimation> {
    const estimation = this.repository.create({
      projectId,
      backlogJson,
      configJson,
      resultJson,
    });
    return this.repository.save(estimation);
  }

  async findById(id: string): Promise<Estimation | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['project', 'snapshots'],
    });
  }

  async findByProjectId(projectId: string): Promise<Estimation[]> {
    return this.repository.find({
      where: { projectId },
      relations: ['snapshots'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Estimation[]> {
    return this.repository.find({
      relations: ['project', 'snapshots'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    backlogJson?: BacklogItem[],
    configJson?: EstimationConfig,
    resultJson?: EstimationResult,
  ): Promise<Estimation | null> {
    const updateData: any = {};
    if (backlogJson) updateData.backlogJson = backlogJson;
    if (configJson) updateData.configJson = configJson;
    if (resultJson) updateData.resultJson = resultJson;

    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }

  async findLatestByProjectId(projectId: string): Promise<Estimation | null> {
    return this.repository.findOne({
      where: { projectId },
      relations: ['snapshots'],
      order: { createdAt: 'DESC' },
    });
  }
}

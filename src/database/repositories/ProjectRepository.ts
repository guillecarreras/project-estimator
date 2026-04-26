import { Repository, DataSource } from 'typeorm';
import { Project } from '../entities/Project';

export class ProjectRepository {
  private repository: Repository<Project>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Project);
  }

  async create(name: string): Promise<Project> {
    const project = this.repository.create({ name });
    return this.repository.save(project);
  }

  async findById(id: string): Promise<Project | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['estimations'],
    });
  }

  async findAll(): Promise<Project[]> {
    return this.repository.find({
      relations: ['estimations'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, name: string): Promise<Project | null> {
    await this.repository.update(id, { name });
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }
}

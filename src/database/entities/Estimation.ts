import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Project } from './Project';
import { Snapshot } from './Snapshot';
import { BacklogItem, EstimationConfig, EstimationResult } from '../../types';

@Entity('estimations')
@Index(['projectId'])
export class Estimation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  projectId!: string;

  @Column('jsonb')
  backlogJson!: BacklogItem[];

  @Column('jsonb')
  configJson!: EstimationConfig;

  @Column('jsonb')
  resultJson!: EstimationResult;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Project, (project) => project.estimations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @OneToMany(() => Snapshot, (snapshot) => snapshot.estimation, { cascade: true })
  snapshots!: Snapshot[];
}

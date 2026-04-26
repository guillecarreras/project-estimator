import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Estimation } from './Estimation';

@Entity('snapshots')
@Index(['estimationId'])
export class Snapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  estimationId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  actualHours!: number;

  @Column('decimal', { precision: 15, scale: 2 })
  actualCost!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Estimation, (estimation) => estimation.snapshots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'estimationId' })
  estimation!: Estimation;
}

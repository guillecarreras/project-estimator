import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type UserRole = 'admin' | 'user';

@Entity('users')
@Index(['username'], { unique: true })
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255, unique: true })
  username!: string;

  @Column('varchar', { length: 255, unique: true })
  email!: string;

  @Column('varchar', { length: 255 })
  passwordHash!: string;

  @Column('varchar', { length: 50, default: 'user' })
  role!: UserRole;

  @Column('boolean', { default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // For tracking invalidated tokens (simple approach)
  @Column('bigint', { default: 0 })
  tokenInvalidatedAt!: number;
}

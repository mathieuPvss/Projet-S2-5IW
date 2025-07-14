import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Report } from '../../reports/entities/report.entity';

export enum Role {
  'USER' = 'user',
  'ADMIN' = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @Column({ nullable: true })
  passwordExpiresAt?: Date;

  @OneToMany(() => Report, (report) => report.user)
  @JoinColumn({ name: 'report_id' })
  reports: Report[];
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}

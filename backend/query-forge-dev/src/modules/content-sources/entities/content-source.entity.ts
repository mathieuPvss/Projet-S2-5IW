import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ContentSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  enabled: boolean;
}

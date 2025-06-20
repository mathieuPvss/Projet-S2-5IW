import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from '../../questions/entities/question.entity';
import { ContentSource } from '../../content-sources/entities/content-source.entity';
import { QuestionUsageStatus } from '../enums/question-usage-status.enum';

@Entity()
export class QuestionUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question_id: string;

  @Column()
  content_source_id: string;

  @Column({ nullable: true })
  used_at: Date;

  @Column({
    type: 'enum',
    enum: QuestionUsageStatus,
    default: QuestionUsageStatus.PENDING,
  })
  status: QuestionUsageStatus;

  @Column()
  response_size: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => ContentSource)
  @JoinColumn({ name: 'content_source_id' })
  contentSource: ContentSource;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../modules/users/entities/user.entity';
import { Question } from '../modules/questions/entities/question.entity';
import { ContentSource } from '../modules/content-sources/entities/content-source.entity';
import { QuestionUsage } from '../modules/question-usages/entities/question-usage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Question, ContentSource, QuestionUsage]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}

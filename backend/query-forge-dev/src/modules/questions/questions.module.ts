import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { QuestionsRepository } from './questions.repository';
import { Question } from './entities/question.entity';
import { MetricsModule } from '../metrics/metrics.module';
import { ContentSourcesModule } from '../content-sources/content-sources.module';
import { QuestionUsagesModule } from '../question-usages/question-usages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question]),
    MetricsModule,
    ContentSourcesModule,
    QuestionUsagesModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsRepository],
  exports: [QuestionsService, QuestionsRepository],
})
export class QuestionsModule {}

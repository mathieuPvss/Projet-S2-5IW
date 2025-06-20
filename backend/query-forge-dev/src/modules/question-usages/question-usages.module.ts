import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionUsagesService } from './question-usages.service';
import { QuestionUsagesController } from './question-usages.controller';
import { QuestionUsagesRepository } from './question-usages.repository';
import { QuestionUsage } from './entities/question-usage.entity';
import { QuestionsModule } from '../questions/questions.module';
import { ContentSourcesModule } from '../content-sources/content-sources.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionUsage]),
    QuestionsModule,
    ContentSourcesModule,
  ],
  controllers: [QuestionUsagesController],
  providers: [QuestionUsagesService, QuestionUsagesRepository],
})
export class QuestionUsagesModule {}

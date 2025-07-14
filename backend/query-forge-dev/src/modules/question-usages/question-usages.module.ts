import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionUsagesService } from './question-usages.service';
import { QuestionUsagesController } from './question-usages.controller';
import { QuestionUsagesRepository } from './question-usages.repository';
import { QuestionUsage } from './entities/question-usage.entity';
import { ContentSourcesModule } from '../content-sources/content-sources.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionUsage]),
    ContentSourcesModule,
    MetricsModule,
  ],
  controllers: [QuestionUsagesController],
  providers: [QuestionUsagesService, QuestionUsagesRepository],
  exports: [QuestionUsagesService, QuestionUsagesRepository],
})
export class QuestionUsagesModule {}

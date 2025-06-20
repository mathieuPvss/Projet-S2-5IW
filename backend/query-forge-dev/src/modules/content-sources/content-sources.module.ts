import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentSourcesService } from './content-sources.service';
import { ContentSourcesController } from './content-sources.controller';
import { ContentSourcesRepository } from './content-sources.repository';
import { ContentSource } from './entities/content-source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentSource])],
  controllers: [ContentSourcesController],
  providers: [ContentSourcesService, ContentSourcesRepository],
})
export class ContentSourcesModule {}

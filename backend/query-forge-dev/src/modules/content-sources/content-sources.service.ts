import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentSourcesRepository } from './content-sources.repository';
import { CreateContentSourceDto } from './dto/create-content-source.dto';
import { UpdateContentSourceDto } from './dto/update-content-source.dto';
import { ContentSource } from './entities/content-source.entity';

@Injectable()
export class ContentSourcesService {
  constructor(
    private readonly contentSourcesRepository: ContentSourcesRepository,
  ) {}

  async create(
    createContentSourceDto: CreateContentSourceDto,
  ): Promise<ContentSource> {
    return await this.contentSourcesRepository.createContentSource(
      createContentSourceDto,
    );
  }

  async findAll(): Promise<ContentSource[]> {
    return await this.contentSourcesRepository.findAllContentSources();
  }

  async findOne(id: string): Promise<ContentSource> {
    const contentSource =
      await this.contentSourcesRepository.findOneContentSource(id);
    if (!contentSource) {
      throw new NotFoundException(
        `Source de contenu avec l'ID "${id}" non trouvée`,
      );
    }
    return contentSource;
  }

  async update(
    id: string,
    updateContentSourceDto: UpdateContentSourceDto,
  ): Promise<ContentSource> {
    const contentSource =
      await this.contentSourcesRepository.findOneContentSource(id);
    if (!contentSource) {
      throw new NotFoundException(
        `Source de contenu avec l'ID "${id}" non trouvée`,
      );
    }
    return await this.contentSourcesRepository.updateContentSource(
      id,
      updateContentSourceDto,
    );
  }

  async remove(id: string): Promise<void> {
    const contentSource =
      await this.contentSourcesRepository.findOneContentSource(id);
    if (!contentSource) {
      throw new NotFoundException(
        `Source de contenu avec l'ID "${id}" non trouvée`,
      );
    }
    await this.contentSourcesRepository.deleteContentSource(id);
  }

  async getStats(): Promise<{
    total: number;
    api: number;
    scraper: number;
    enabled: number;
    disabled: number;
  }> {
    return await this.contentSourcesRepository.getContentSourcesStats();
  }
}

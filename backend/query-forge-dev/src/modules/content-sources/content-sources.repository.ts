import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ContentSource } from './entities/content-source.entity';
import { CreateContentSourceDto } from './dto/create-content-source.dto';
import { UpdateContentSourceDto } from './dto/update-content-source.dto';

@Injectable()
export class ContentSourcesRepository extends Repository<ContentSource> {
  constructor(private dataSource: DataSource) {
    super(ContentSource, dataSource.createEntityManager());
  }

  async createContentSource(
    createContentSourceDto: CreateContentSourceDto,
  ): Promise<ContentSource> {
    const contentSource = this.create(createContentSourceDto);
    return await this.save(contentSource);
  }

  async findAllContentSources(): Promise<ContentSource[]> {
    return await this.find();
  }

  async findOneContentSource(id: string): Promise<ContentSource> {
    return await this.findOne({ where: { id } });
  }

  async updateContentSource(
    id: string,
    updateContentSourceDto: UpdateContentSourceDto,
  ): Promise<ContentSource> {
    await this.update(id, updateContentSourceDto);
    return await this.findOne({ where: { id } });
  }

  async deleteContentSource(id: string): Promise<void> {
    await this.delete(id);
  }
}

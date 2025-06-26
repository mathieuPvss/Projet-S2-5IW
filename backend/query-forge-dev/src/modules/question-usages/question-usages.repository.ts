import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuestionUsage } from './entities/question-usage.entity';
import { CreateQuestionUsageDto } from './dto/create-question-usage.dto';
import { UpdateQuestionUsageDto } from './dto/update-question-usage.dto';

@Injectable()
export class QuestionUsagesRepository extends Repository<QuestionUsage> {
  constructor(private dataSource: DataSource) {
    super(QuestionUsage, dataSource.createEntityManager());
  }

  async createQuestionUsage(
    createQuestionUsageDto: CreateQuestionUsageDto,
  ): Promise<QuestionUsage> {
    const questionUsage = this.create(createQuestionUsageDto);
    return await this.save(questionUsage);
  }

  async findAllQuestionUsages(): Promise<QuestionUsage[]> {
    return await this.find({
      relations: ['question', 'contentSource'],
    });
  }

  async findOneQuestionUsage(id: string): Promise<QuestionUsage> {
    return await this.findOne({
      where: { id },
      relations: ['question', 'contentSource'],
    });
  }

  async updateQuestionUsage(
    id: string,
    updateQuestionUsageDto: UpdateQuestionUsageDto,
  ): Promise<QuestionUsage> {
    await this.update(id, updateQuestionUsageDto);
    return await this.findOne({
      where: { id },
      relations: ['question', 'contentSource'],
    });
  }

  async deleteQuestionUsage(id: string): Promise<void> {
    await this.delete(id);
  }
}

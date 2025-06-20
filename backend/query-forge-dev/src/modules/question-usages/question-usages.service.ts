import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionUsagesRepository } from './question-usages.repository';
import { CreateQuestionUsageDto } from './dto/create-question-usage.dto';
import { UpdateQuestionUsageDto } from './dto/update-question-usage.dto';
import { QuestionUsage } from './entities/question-usage.entity';

@Injectable()
export class QuestionUsagesService {
  constructor(
    private readonly questionUsagesRepository: QuestionUsagesRepository,
  ) {}

  async create(
    createQuestionUsageDto: CreateQuestionUsageDto,
  ): Promise<QuestionUsage> {
    return await this.questionUsagesRepository.createQuestionUsage(
      createQuestionUsageDto,
    );
  }

  async findAll(): Promise<QuestionUsage[]> {
    return await this.questionUsagesRepository.findAllQuestionUsages();
  }

  async findOne(id: string): Promise<QuestionUsage> {
    const questionUsage =
      await this.questionUsagesRepository.findOneQuestionUsage(id);
    if (!questionUsage) {
      throw new NotFoundException(
        `Utilisation de question avec l'ID "${id}" non trouvée`,
      );
    }
    return questionUsage;
  }

  async update(
    id: string,
    updateQuestionUsageDto: UpdateQuestionUsageDto,
  ): Promise<QuestionUsage> {
    const questionUsage =
      await this.questionUsagesRepository.findOneQuestionUsage(id);
    if (!questionUsage) {
      throw new NotFoundException(
        `Utilisation de question avec l'ID "${id}" non trouvée`,
      );
    }
    return await this.questionUsagesRepository.updateQuestionUsage(
      id,
      updateQuestionUsageDto,
    );
  }

  async remove(id: string): Promise<void> {
    const questionUsage =
      await this.questionUsagesRepository.findOneQuestionUsage(id);
    if (!questionUsage) {
      throw new NotFoundException(
        `Utilisation de question avec l'ID "${id}" non trouvée`,
      );
    }
    await this.questionUsagesRepository.deleteQuestionUsage(id);
  }
}

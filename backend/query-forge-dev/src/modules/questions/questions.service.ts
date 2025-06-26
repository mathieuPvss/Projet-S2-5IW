import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionsRepository } from './questions.repository';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    return await this.questionsRepository.createQuestion(createQuestionDto);
  }

  async findAll(): Promise<Question[]> {
    return await this.questionsRepository.findAllQuestions();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionsRepository.findOneQuestion(id);
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.questionsRepository.findOneQuestion(id);
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    return await this.questionsRepository.updateQuestion(id, updateQuestionDto);
  }

  async remove(id: string): Promise<void> {
    const question = await this.questionsRepository.findOneQuestion(id);
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    await this.questionsRepository.deleteQuestion(id);
  }
}

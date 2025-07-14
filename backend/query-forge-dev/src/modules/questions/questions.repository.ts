import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsRepository extends Repository<Question> {
  constructor(private dataSource: DataSource) {
    super(Question, dataSource.createEntityManager());
  }

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    const question = this.create(createQuestionDto);
    return await this.save(question);
  }

  async findAllQuestions(): Promise<Question[]> {
    return await this.find();
  }

  async findOneQuestion(id: string): Promise<Question> {
    return await this.findOne({ where: { id } });
  }

  async updateQuestion(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    await this.update(id, updateQuestionDto);
    return await this.findOne({ where: { id } });
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.delete(id);
  }

  async countQuestions(): Promise<number> {
    return await this.count();
  }
}

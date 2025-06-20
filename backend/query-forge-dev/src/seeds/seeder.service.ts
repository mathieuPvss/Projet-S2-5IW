import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { seedUsers } from './user.seed';
import { seedQuestions } from './questions.seed';
import { seedContentSources } from './content-sources.seed';
import { seedQuestionUsages } from './question-usages.seed';

@Injectable()
export class SeederService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    try {
      // Seed Users
      await seedUsers(this.dataSource);

      // Seed Questions
      await seedQuestions(this.dataSource);

      // Seed Content Sources
      await seedContentSources(this.dataSource);

      // Seed Question Usages
      await seedQuestionUsages(this.dataSource);
    } catch (error) {
      throw error;
    }
  }
}

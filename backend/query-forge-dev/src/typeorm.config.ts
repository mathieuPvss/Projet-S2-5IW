import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { User } from './modules/users/entities/user.entity';
import { ContentSource } from './modules/content-sources/entities/content-source.entity';
import { Question } from './modules/questions/entities/question.entity';
import { QuestionUsage } from './modules/question-usages/entities/question-usage.entity';
import { Report } from './modules/reports/entities/report.entity';

export const typeOrmConfig: TypeOrmModuleOptions & DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, ContentSource, Question, QuestionUsage, Report],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  migrationsRun: false,
  dropSchema: false,
};

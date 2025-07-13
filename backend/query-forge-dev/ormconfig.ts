import { DataSource } from 'typeorm';
import { User } from './src/modules/users/entities/user.entity';
import { ContentSource } from './src/modules/content-sources/entities/content-source.entity';
import { Question } from './src/modules/questions/entities/question.entity';
import { QuestionUsage } from './src/modules/question-usages/entities/question-usage.entity';
import { Report } from './src/modules/reports/entities/report.entity';

export default new DataSource({
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
}); 
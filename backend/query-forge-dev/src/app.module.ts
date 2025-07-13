import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SeederModule } from './seeds/seeder.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ContentSourcesModule } from './modules/content-sources/content-sources.module';
import { QuestionUsagesModule } from './modules/question-usages/question-usages.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { LoginGuard } from './common/guard/login.guard';
import { RoleGuard } from './common/guard/role.guard';
import { ReportsModule } from './modules/reports/reports.module';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { AppController } from './app.controller';
import { User } from './modules/users/entities/user.entity';
import { ContentSource } from './modules/content-sources/entities/content-source.entity';
import { Question } from './modules/questions/entities/question.entity';
import { QuestionUsage } from './modules/question-usages/entities/question-usage.entity';
import { Report } from './modules/reports/entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, ContentSource, Question, QuestionUsage, Report],
      // migrations:
      //   process.env.NODE_ENV === 'production'
      //     ? ['dist/migrations/*.js']
      //     : ['src/migrations/*.ts'],
      migrationsTableName: 'migrations',
      synchronize: false,
      logging: true,
      migrationsRun: false,
      dropSchema: false,
    }),
    UsersModule,
    QuestionsModule,
    ContentSourcesModule,
    QuestionUsagesModule,
    SeederModule,
    ReportsModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}

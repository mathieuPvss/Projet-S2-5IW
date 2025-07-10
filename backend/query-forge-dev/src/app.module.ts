import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { User } from './modules/users/entities/user.entity';
import { ContentSource } from './modules/content-sources/entities/content-source.entity';
import { Question } from './modules/questions/entities/question.entity';
import { QuestionUsage } from './modules/question-usages/entities/question-usage.entity';
import { SeederModule } from './seeds/seeder.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ContentSourcesModule } from './modules/content-sources/content-sources.module';
import { QuestionUsagesModule } from './modules/question-usages/question-usages.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { LoginGuard } from './common/guard/login.guard';
import { RoleGuard } from './common/guard/role.guard';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'postgres',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, ContentSource, QuestionUsage, Question],
      synchronize: true,
    }),
    UsersModule,
    QuestionsModule,
    ContentSourcesModule,
    QuestionUsagesModule,
    SeederModule,
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

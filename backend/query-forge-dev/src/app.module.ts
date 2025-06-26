import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { User } from './modules/users/entities/user.entity';
import { ContentSource } from './modules/content-sources/entities/content-source.entity';
import { Question } from './modules/questions/entities/question.entity';
import { QuestionUsage } from './modules/question-usages/entities/question-usage.entity';
import { SeederModule } from './seeds/seeder.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { ContentSourcesModule } from './modules/content-sources/content-sources.module';
import { QuestionUsagesModule } from './modules/question-usages/question-usages.module';

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
    AuthModule,
    SeederModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

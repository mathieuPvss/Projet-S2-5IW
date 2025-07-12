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
import { typeOrmConfig } from './typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
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

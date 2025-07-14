import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { EmailService } from './services/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MetricsModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, EmailService],
  exports: [UsersService],
})
export class UsersModule {}

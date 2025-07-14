import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto, UpdateReportDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { ReportStatus } from './enums/report-status.enum';

@Injectable()
export class ReportsRepository {
  constructor(
    @InjectRepository(Report)
    private readonly repo: Repository<Report>,
    private readonly userService: UsersService,
  ) {}

  async createReport(createReportDto: CreateReportDto): Promise<Report> {
    const User = await this.userService.findOne(createReportDto.user_id);
    if (!User) {
      throw new NotFoundException(
        `User with ID "${createReportDto.user_id}" not found`,
      );
    }
    const report = this.repo.create(createReportDto);
    report.user = User;
    return await this.repo.save(report);
  }

  async findAllReports(): Promise<Report[]> {
    return await this.repo.find({
      relations: ['user'],
    });
  }

  async findOneReport(id: string): Promise<Report> {
    return await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByIds(ids: string[]): Promise<Report[]> {
    return await this.repo.findBy({ id: In(ids) });
  }

  async updateReport(
    id: string,
    updateReportDto: UpdateReportDto,
  ): Promise<Report> {
    await this.repo.update(id, updateReportDto);
    return await this.repo.findOne({ where: { id } });
  }

  async updateReportsStatus(
    status: ReportStatus,
    report_ids: string[],
  ): Promise<Report[]> {
    await this.repo
      .createQueryBuilder()
      .update(Report)
      .set({ status })
      .whereInIds(report_ids)
      .execute();
    return this.repo.findBy({ id: In(report_ids) });
  }

  async deleteReport(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

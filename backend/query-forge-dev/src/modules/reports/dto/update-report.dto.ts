import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { ReportStatus } from '../enums/report-status.enum';

export class UpdateReportDto {
  @ApiProperty({
    description: 'Statut du signalement',
    enum: ReportStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiProperty({
    description: 'Description mise à jour du signalement',
    required: false,
  })
  @IsOptional()
  description?: string;
}

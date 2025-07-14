import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';
import { ReportStatus } from '../enums/report-status.enum';

export class UpdateReportsDto {
  @ApiProperty({
    description: 'Statut du signalement',
    enum: ReportStatus,
  })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiProperty({
    description: 'Ids des signalements à mettre à jour',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  report_ids: string[];
}

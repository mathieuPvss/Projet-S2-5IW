import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ReportStatus } from '../enums/report-status.enum';

export class CreateReportDto {
  @ApiProperty({
    description: "ID de l'utilisateur qui signale",
  })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'ID de la source de contenu',
  })
  @IsNotEmpty()
  document_id: string;

  @ApiProperty({
    description: 'Description du signalement',
    example: 'Contenu inapproprié ou erroné trouvé dans la source.',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Statut du signalement',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}

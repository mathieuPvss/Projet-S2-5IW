import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber } from 'class-validator';
import { QuestionUsageStatus } from '../enums/question-usage-status.enum';

export class UpdateQuestionUsageDto {
  @ApiProperty({
    description: "Statut de l'utilisation",
    enum: QuestionUsageStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(QuestionUsageStatus)
  status?: QuestionUsageStatus;

  @ApiProperty({
    description: 'Taille de la réponse',
    example: 1024,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  response_size?: number;
}

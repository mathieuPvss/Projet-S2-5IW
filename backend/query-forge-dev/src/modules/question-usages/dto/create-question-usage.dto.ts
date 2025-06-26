import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { QuestionUsageStatus } from '../enums/question-usage-status.enum';

export class CreateQuestionUsageDto {
  @ApiProperty({
    description: 'ID de la question',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty()
  @IsUUID()
  question_id: string;

  @ApiProperty({
    description: 'ID de la source de contenu',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsNotEmpty()
  @IsUUID()
  content_source_id: string;

  @ApiProperty({
    description: "Statut de l'utilisation",
    enum: QuestionUsageStatus,
    default: QuestionUsageStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(QuestionUsageStatus)
  status?: QuestionUsageStatus;

  @ApiProperty({
    description: 'Taille de la réponse',
    example: 1024,
  })
  @IsNotEmpty()
  @IsNumber()
  response_size: number;
}

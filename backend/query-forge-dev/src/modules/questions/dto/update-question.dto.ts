import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateQuestionDto {
  @ApiProperty({
    description: 'Technologie associée à la question',
    example: 'JavaScript',
    required: false,
  })
  @IsOptional()
  @IsString()
  technologie?: string;

  @ApiProperty({
    description: 'Catégorie de la question',
    example: 'Frontend',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Contenu de la question',
    example: 'Quelle est la différence entre let et var en JavaScript ?',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}

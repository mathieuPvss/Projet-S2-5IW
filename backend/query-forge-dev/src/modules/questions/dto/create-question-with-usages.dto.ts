import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateQuestionWithUsagesDto {
  @ApiProperty({
    description: 'Technologie associée à la question',
    example: 'JavaScript',
  })
  @IsNotEmpty()
  @IsString()
  technologie: string;

  @ApiProperty({
    description: 'Catégorie de la question',
    example: 'Frontend',
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Contenu de la question',
    example: 'Quelle est la différence entre let et var en JavaScript ?',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description:
      'Créer automatiquement les question_usage pour les content sources de type API',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  createUsages?: boolean = true;
}

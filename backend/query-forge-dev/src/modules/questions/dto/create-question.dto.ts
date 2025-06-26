import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
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
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class ImportQuestionsCsvDto {
  @ApiProperty({
    description: 'Liste des questions à importer depuis le CSV',
    type: [CreateQuestionDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}

export class CsvQuestionRow {
  technologie: string;
  category: string;
  content: string;
}

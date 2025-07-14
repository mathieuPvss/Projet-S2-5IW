import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsObject } from 'class-validator';
import { ScrapeConfig } from '../entities/content-source.entity';

export class CreateContentSourceDto {
  @ApiProperty({
    description: 'Nom de la source de contenu',
    example: 'Documentation React',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "État d'activation de la source",
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Type de la source',
    example: 'scraper',
  })
  @IsNotEmpty()
  @IsString()
  type: 'scraper' | 'api';

  @ApiProperty({
    description: 'Configuration de la source',
    example: {
      startUrl: 'https://exemple.com/questions',
      scrapeFields: {
        titre: 'h1.fs-headline1 a.question-hyperlink',
      },
    },
  })
  @IsNotEmpty()
  @IsObject()
  config: ScrapeConfig;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';
import { ScrapeConfig } from '../entities/content-source.entity';

export class UpdateContentSourceDto {
  @ApiProperty({
    description: 'Nom de la source de contenu',
    example: 'Documentation React',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "État d'activation de la source",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    description: 'Type de la source',
    example: 'scraper',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: 'scraper' | 'api';

  @ApiProperty({
    description: 'Configuration de la source',
    example: {
      startUrl: 'https://exemple.com/questions',
    },
  })
  @IsOptional()
  @IsObject()
  config?: ScrapeConfig;
}

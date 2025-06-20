import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

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
}

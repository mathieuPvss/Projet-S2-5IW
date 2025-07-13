import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'nouveauMotDePasse123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

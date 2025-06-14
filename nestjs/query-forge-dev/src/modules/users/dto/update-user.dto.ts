import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: "email d'utilisateur",
    example: 'john_do_update@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  @Length(3, 20, {
    message: "Le nom d'utilisateur doit contenir entre 3 et 20 caractères.",
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Ancien mot de passe',
    example: 'oldPassword123',
  })
  @IsOptional()
  @IsString()
  oldPassword?: string;

  @ApiPropertyOptional({
    description: 'Nouveau mot de passe',
    example: 'newPassword456',
  })
  @IsOptional()
  @IsString()
  @Length(3, 20, {
    message: 'Le mot de passe doit contenir entre 3 et 20 caractères.',
  })
  newPassword?: string;
}

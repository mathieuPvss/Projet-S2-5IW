import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../entities/user.entity';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({
    description: "Nouveau mot de passe pour l'utilisateur",
    example: 'newPassword123',
  })
  @IsOptional()
  @IsString()
  @Length(4, 20, {
    message: 'Le mot de passe doit contenir entre 4 et 20 caractères.',
  })
  password?: string;

  @ApiPropertyOptional({
    description: "Rôle de l'utilisateur",
    example: 'user',
    enum: ['user', 'admin'],
  })
  @IsOptional()
  @IsEnum(Role, {
    message: "Le rôle doit être 'user' ou 'admin'.",
  })
  role?: Role;

  @ApiPropertyOptional({
    description: "Statut de vérification de l'utilisateur",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

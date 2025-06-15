import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: "Nom d'utilisateur unique",
    example: 'john_doe@gmail.com',
  })
  @IsEmail()
  @Length(3, 20, {
    message: "Le nom d'utilisateur doit contenir entre 3 et 20 caractères.",
  })
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'password123',
  })
  @IsString()
  @Length(4, 20, {
    message: 'Le mot de passe doit contenir entre 4 et 20 caractères.',
  })
  password: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    example: 'user',
    enum: ['user', 'admin'],
  })
  @IsEnum(Role, {
    message: "Le rôle doit être 'user' ou 'admin'.",
  })
  role: Role;
}

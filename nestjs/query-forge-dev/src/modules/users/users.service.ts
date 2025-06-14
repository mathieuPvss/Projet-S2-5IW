import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('a user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userRepository.createUser(
      createUserDto.email,
      hashedPassword,
      createUserDto.role,
    );
    return user;
  }

  findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} introuvable.`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const updateUserData: Partial<User> = {};
    if (updateUserDto.oldPassword && updateUserDto.newPassword) {
      const isPasswordValid = await bcrypt.compare(
        updateUserDto.oldPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new ForbiddenException('Mot de passe incorrect');
      }
      updateUserDto.newPassword = await bcrypt.hash(
        updateUserDto.newPassword,
        10,
      );
      updateUserData.password = updateUserDto.newPassword;
    }

    if (updateUserDto.email) {
      updateUserData.email = updateUserDto.email;
    }

    return this.userRepository.updateUser(user.id, updateUserData);
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'email ${email} introuvable.`,
      );
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.deleteUser(user.id);
  }
}

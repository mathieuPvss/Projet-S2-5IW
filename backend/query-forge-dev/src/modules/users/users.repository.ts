import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role, User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async createUser(email: string, password: string, role: Role): Promise<User> {
    const user = this.repo.create({ email, password, role });
    return this.repo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async updateUser(id: string, partialData: Partial<User>): Promise<User> {
    await this.repo.update(id, partialData);
    return this.findById(id);
  }

  async deleteUser(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }
}

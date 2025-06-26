import { Role, User } from '../modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const users: Partial<User>[] = [
  {
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: Role.ADMIN,
  },
  {
    email: 'user@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: Role.USER,
  },
  {
    email: 'jean.dupont@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: Role.USER,
  },
  {
    email: 'marie.curie@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: Role.USER,
  },
  {
    email: 'pierre.durand@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: Role.USER,
  },
];

export const seedUsers = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  await Promise.all(
    users.map(async (userData) => {
      const user = userRepository.create(userData);
      return userRepository.save(user);
    }),
  );

  console.log(`${users.length} utilisateurs ont été créés avec succès.`);
};

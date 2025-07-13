import { Role, User } from '../modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const users: Partial<User>[] = [
  {
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: Role.ADMIN,
    verified: true,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    passwordExpiresAt: null,
  },
  {
    email: 'user@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: Role.USER,
    verified: true,
    resetPasswordToken: null,
    resetPasswordExpires: new Date(Date.now() - 1000 * 60 * 60 * 24),
    passwordExpiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    email: 'jean.dupont@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: Role.USER,
    verified: true,
    resetPasswordToken: null,
    resetPasswordExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    passwordExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
  },
  {
    email: 'marie.curie@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: Role.USER,
    verified: true,
    resetPasswordToken: null,
    resetPasswordExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    passwordExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
  },
  {
    email: 'pierre.durand@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: Role.USER,
    verified: true,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    passwordExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
  },
];

export const seedUsers = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  let usersCreated = 0;
  let usersSkipped = 0;

  for (const userData of users) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      usersCreated++;
      console.log(`Utilisateur ${userData.email} créé avec succès.`);
    } else {
      usersSkipped++;
      console.log(`Utilisateur ${userData.email} existe déjà.`);
    }
  }

  console.log(
    `${usersCreated} nouveaux utilisateurs ont été créés avec succès.`,
  );
  console.log(`${usersSkipped} utilisateurs existants ont été ignorés.`);
};

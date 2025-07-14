import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, Role } from './entities/user.entity';
import { EmailService } from './services/email.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}
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

    // Définir une date d'expiration par défaut pour le nouveau mot de passe
    await this.setPasswordExpiry(user.id);

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

    // Interdire la modification des utilisateurs admin
    if (user.role === Role.ADMIN) {
      throw new ForbiddenException(
        'Impossible de modifier un utilisateur administrateur',
      );
    }

    // Interdire la modification des emails
    if (updateUserDto.email) {
      throw new ForbiddenException(
        "La modification de l'email n'est pas autorisée",
      );
    }

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

      // Définir une nouvelle date d'expiration pour le mot de passe
      const passwordExpiresAt = new Date();
      passwordExpiresAt.setDate(passwordExpiresAt.getDate() + 90);
      updateUserData.passwordExpiresAt = passwordExpiresAt;
    }

    return this.userRepository.updateUser(user.id, updateUserData);
  }

  async adminUpdate(
    id: string,
    adminUpdateUserDto: AdminUpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(id);

    // Interdire la modification des utilisateurs admin
    if (user.role === Role.ADMIN) {
      throw new ForbiddenException(
        'Impossible de modifier un utilisateur administrateur',
      );
    }

    const updateUserData: Partial<User> = {};

    if (adminUpdateUserDto.password) {
      updateUserData.password = await bcrypt.hash(
        adminUpdateUserDto.password,
        10,
      );

      // Définir une nouvelle date d'expiration pour le mot de passe
      const passwordExpiresAt = new Date();
      passwordExpiresAt.setDate(passwordExpiresAt.getDate() + 90);
      updateUserData.passwordExpiresAt = passwordExpiresAt;
    }

    if (adminUpdateUserDto.role !== undefined) {
      updateUserData.role = adminUpdateUserDto.role;
    }

    if (adminUpdateUserDto.verified !== undefined) {
      updateUserData.verified = adminUpdateUserDto.verified;
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

    // Interdire la suppression des utilisateurs admin
    if (user.role === Role.ADMIN) {
      throw new ForbiddenException(
        'Impossible de supprimer un utilisateur administrateur',
      );
    }

    await this.userRepository.deleteUser(user.id);
  }

  async requestPasswordReset(
    resetPasswordRequestDto: ResetPasswordRequestDto,
  ): Promise<void> {
    const user = await this.userRepository.findByEmail(
      resetPasswordRequestDto.email,
    );
    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return;
    }

    // Générer un token de réinitialisation
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
    );

    // Sauvegarder le token et sa date d'expiration
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 heure
    await this.userRepository.updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetPasswordExpires,
    });

    // Envoyer l'email de réinitialisation
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(
        resetPasswordDto.token,
        process.env.JWT_SECRET!,
      ) as {
        userId: string;
        email: string;
      };

      // Trouver l'utilisateur
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new BadRequestException('Token invalide ou expiré');
      }

      // Vérifier que le token correspond et n'est pas expiré
      if (
        user.resetPasswordToken !== resetPasswordDto.token ||
        !user.resetPasswordExpires ||
        user.resetPasswordExpires < new Date()
      ) {
        throw new BadRequestException('Token invalide ou expiré');
      }

      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(
        resetPasswordDto.newPassword,
        10,
      );

      // Calculer la nouvelle date d'expiration (90 jours)
      const passwordExpiresAt = new Date();
      passwordExpiresAt.setDate(passwordExpiresAt.getDate() + 90);

      // Mettre à jour le mot de passe et supprimer le token
      await this.userRepository.updateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        passwordExpiresAt: passwordExpiresAt,
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('Token invalide ou expiré');
      }
      throw error;
    }
  }

  async checkPasswordExpiry(
    email: string,
  ): Promise<{ expired: boolean; user?: User }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { expired: false };
    }

    // Si pas de date d'expiration définie, considérer comme expiré pour forcer la définition
    if (!user.passwordExpiresAt) {
      return { expired: true, user };
    }

    const isExpired = user.passwordExpiresAt < new Date();
    return { expired: isExpired, user };
  }

  async setPasswordExpiry(userId: string): Promise<void> {
    const passwordExpiresAt = new Date();
    passwordExpiresAt.setDate(passwordExpiresAt.getDate() + 90); // 90 jours

    await this.userRepository.updateUser(userId, {
      passwordExpiresAt: passwordExpiresAt,
    });
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role, User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { MetricsService } from '../metrics/metrics.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly metricsService: MetricsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès.',
    type: User,
  })
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto);
    this.metricsService.incrementDbOperations('create', 'user', 'success');
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs.',
    type: [User],
  })
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  async findAll() {
    const result = await this.usersService.findAll();
    this.metricsService.incrementDbOperations('read', 'user', 'success');
    return result;
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé.', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  @ApiBearerAuth('access-token')
  async findOne(@Param('id') id: string) {
    const result = await this.usersService.findOne(id);
    this.metricsService.incrementDbOperations('read', 'user', 'success');
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  @ApiBearerAuth('access-token')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.usersService.update(id, updateUserDto);
    this.metricsService.incrementDbOperations('update', 'user', 'success');
    return result;
  }

  @Patch('admin/:id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour par un admin.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  @ApiResponse({ status: 403, description: 'Impossible de modifier un admin.' })
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  async adminUpdate(
    @Param('id') id: string,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
  ) {
    const result = await this.usersService.adminUpdate(id, adminUpdateUserDto);
    this.metricsService.incrementDbOperations('update', 'user', 'success');
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(id);
    this.metricsService.incrementDbOperations('delete', 'user', 'success');
    return result;
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Demander une réinitialisation de mot de passe' })
  @ApiResponse({
    status: 200,
    description: 'Email de réinitialisation envoyé.',
  })
  @Public()
  async requestPasswordReset(
    @Body() resetPasswordRequestDto: ResetPasswordRequestDto,
  ) {
    await this.usersService.requestPasswordReset(resetPasswordRequestDto);
    this.metricsService.incrementDbOperations('update', 'user', 'success');
    return {
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec un token' })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe réinitialisé avec succès.',
  })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré.' })
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.usersService.resetPassword(resetPasswordDto);
    this.metricsService.incrementDbOperations('update', 'user', 'success');
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }
}

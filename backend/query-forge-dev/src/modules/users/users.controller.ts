import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
  @Public()
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
}

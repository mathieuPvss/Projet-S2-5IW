import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContentSourcesService } from './content-sources.service';
import { CreateContentSourceDto } from './dto/create-content-source.dto';
import { UpdateContentSourceDto } from './dto/update-content-source.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContentSource } from './entities/content-source.entity';

@ApiTags('content-sources')
@Controller('content-sources')
export class ContentSourcesController {
  constructor(private readonly contentSourcesService: ContentSourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle source de contenu' })
  @ApiResponse({
    status: 201,
    description: 'La source de contenu a été créée avec succès.',
    type: ContentSource,
  })
  create(@Body() createContentSourceDto: CreateContentSourceDto) {
    return this.contentSourcesService.create(createContentSourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les sources de contenu' })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les sources de contenu.',
    type: [ContentSource],
  })
  findAll() {
    return this.contentSourcesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une source de contenu par son ID' })
  @ApiResponse({
    status: 200,
    description: 'La source de contenu a été trouvée.',
    type: ContentSource,
  })
  @ApiResponse({
    status: 404,
    description: 'Source de contenu non trouvée.',
  })
  findOne(@Param('id') id: string) {
    return this.contentSourcesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une source de contenu' })
  @ApiResponse({
    status: 200,
    description: 'La source de contenu a été mise à jour.',
    type: ContentSource,
  })
  @ApiResponse({
    status: 404,
    description: 'Source de contenu non trouvée.',
  })
  update(
    @Param('id') id: string,
    @Body() updateContentSourceDto: UpdateContentSourceDto,
  ) {
    return this.contentSourcesService.update(id, updateContentSourceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une source de contenu' })
  @ApiResponse({
    status: 204,
    description: 'La source de contenu a été supprimée.',
  })
  @ApiResponse({
    status: 404,
    description: 'Source de contenu non trouvée.',
  })
  remove(@Param('id') id: string) {
    return this.contentSourcesService.remove(id);
  }
}

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
import { MetricsService } from '../metrics/metrics.service';

@ApiTags('content-sources')
@Controller('content-sources')
export class ContentSourcesController {
  constructor(
    private readonly contentSourcesService: ContentSourcesService,
    private readonly metricsService: MetricsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle source de contenu' })
  @ApiResponse({
    status: 201,
    description: 'La source de contenu a été créée avec succès.',
    type: ContentSource,
  })
  async create(@Body() createContentSourceDto: CreateContentSourceDto) {
    const result = await this.contentSourcesService.create(
      createContentSourceDto,
    );
    this.metricsService.incrementContentSources('create');
    return result;
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Récupérer les statistiques des sources de contenu',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des sources de contenu.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        api: { type: 'number' },
        scraper: { type: 'number' },
        enabled: { type: 'number' },
        disabled: { type: 'number' },
      },
    },
  })
  async getStats() {
    const result = await this.contentSourcesService.getStats();
    this.metricsService.incrementContentSources('stats');
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les sources de contenu' })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les sources de contenu.',
    type: [ContentSource],
  })
  async findAll() {
    const result = await this.contentSourcesService.findAll();
    this.metricsService.incrementContentSources('findAll');
    return result;
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
  async findOne(@Param('id') id: string) {
    const result = await this.contentSourcesService.findOne(id);
    this.metricsService.incrementContentSources('findOne');
    return result;
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
  async update(
    @Param('id') id: string,
    @Body() updateContentSourceDto: UpdateContentSourceDto,
  ) {
    const result = await this.contentSourcesService.update(
      id,
      updateContentSourceDto,
    );
    this.metricsService.incrementContentSources('update');
    return result;
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
  async remove(@Param('id') id: string) {
    const result = await this.contentSourcesService.remove(id);
    this.metricsService.incrementContentSources('remove');
    return result;
  }
}

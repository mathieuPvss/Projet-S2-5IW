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
import { QuestionUsagesService } from './question-usages.service';
import { CreateQuestionUsageDto } from './dto/create-question-usage.dto';
import { UpdateQuestionUsageDto } from './dto/update-question-usage.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestionUsage } from './entities/question-usage.entity';
import { MetricsService } from '../metrics/metrics.service';

@ApiTags('question-usages')
@Controller('question-usages')
export class QuestionUsagesController {
  constructor(
    private readonly questionUsagesService: QuestionUsagesService,
    private readonly metricsService: MetricsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle utilisation de question' })
  @ApiResponse({
    status: 201,
    description: "L'utilisation de question a été créée avec succès.",
    type: QuestionUsage,
  })
  async create(@Body() createQuestionUsageDto: CreateQuestionUsageDto) {
    const result = await this.questionUsagesService.create(
      createQuestionUsageDto,
    );
    this.metricsService.incrementQuestionUsages('create');
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les utilisations de questions' })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les utilisations de questions.',
    type: [QuestionUsage],
  })
  async findAll() {
    const result = await this.questionUsagesService.findAll();
    this.metricsService.incrementQuestionUsages('findAll');
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une utilisation de question par son ID' })
  @ApiResponse({
    status: 200,
    description: "L'utilisation de question a été trouvée.",
    type: QuestionUsage,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisation de question non trouvée.',
  })
  async findOne(@Param('id') id: string) {
    const result = await this.questionUsagesService.findOne(id);
    this.metricsService.incrementQuestionUsages('findOne');
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une utilisation de question' })
  @ApiResponse({
    status: 200,
    description: "L'utilisation de question a été mise à jour.",
    type: QuestionUsage,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisation de question non trouvée.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateQuestionUsageDto: UpdateQuestionUsageDto,
  ) {
    const result = await this.questionUsagesService.update(
      id,
      updateQuestionUsageDto,
    );
    this.metricsService.incrementQuestionUsages('update');
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une utilisation de question' })
  @ApiResponse({
    status: 204,
    description: "L'utilisation de question a été supprimée.",
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisation de question non trouvée.',
  })
  async remove(@Param('id') id: string) {
    const result = await this.questionUsagesService.remove(id);
    this.metricsService.incrementQuestionUsages('remove');
    return result;
  }
}

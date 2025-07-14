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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuestionWithUsagesDto } from './dto/create-question-with-usages.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { Question } from './entities/question.entity';
import { MetricsService } from '../metrics/metrics.service';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly metricsService: MetricsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle question' })
  @ApiResponse({
    status: 201,
    description: 'La question a été créée avec succès.',
    type: Question,
  })
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    const result = await this.questionsService.create(createQuestionDto);
    this.metricsService.incrementQuestions('create');
    return result;
  }

  @Post('with-usages')
  @ApiOperation({
    summary:
      'Créer une nouvelle question avec création automatique des usages pour les sources API',
  })
  @ApiResponse({
    status: 201,
    description: 'La question et ses usages ont été créés avec succès.',
    schema: {
      type: 'object',
      properties: {
        question: { $ref: '#/components/schemas/Question' },
        usagesCreated: { type: 'number' },
      },
    },
  })
  async createWithUsages(
    @Body() createQuestionDto: CreateQuestionWithUsagesDto,
  ) {
    const result =
      await this.questionsService.createQuestionWithUsages(createQuestionDto);
    this.metricsService.incrementQuestions('createWithUsages');
    return result;
  }

  @Post('import-csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importer des questions depuis un fichier CSV' })
  @ApiResponse({
    status: 201,
    description: 'Les questions ont été importées avec succès.',
    schema: {
      type: 'object',
      properties: {
        questionsCreated: { type: 'number' },
        usagesCreated: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur de validation du fichier CSV.',
  })
  async importFromCSV(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Le fichier doit être au format CSV');
    }

    const csvContent = file.buffer.toString('utf-8');
    const result =
      await this.questionsService.importQuestionsFromCSV(csvContent);
    this.metricsService.incrementQuestions('importCSV');
    return result;
  }

  @Get('count')
  @ApiOperation({ summary: 'Récupérer le nombre total de questions' })
  @ApiResponse({
    status: 200,
    description: 'Nombre total de questions.',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
    },
  })
  async count() {
    const count = await this.questionsService.count();
    this.metricsService.incrementQuestions('count');
    return { count };
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les questions' })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les questions.',
    type: [Question],
  })
  async findAll() {
    const result = await this.questionsService.findAll();
    this.metricsService.incrementQuestions('findAll');
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une question par son ID' })
  @ApiResponse({
    status: 200,
    description: 'La question a été trouvée.',
    type: Question,
  })
  @ApiResponse({
    status: 404,
    description: 'Question non trouvée.',
  })
  async findOne(@Param('id') id: string) {
    const result = await this.questionsService.findOne(id);
    this.metricsService.incrementQuestions('findOne');
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une question' })
  @ApiResponse({
    status: 200,
    description: 'La question a été mise à jour.',
    type: Question,
  })
  @ApiResponse({
    status: 404,
    description: 'Question non trouvée.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    const result = await this.questionsService.update(id, updateQuestionDto);
    this.metricsService.incrementQuestions('update');
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une question' })
  @ApiResponse({
    status: 204,
    description: 'La question a été supprimée.',
  })
  @ApiResponse({
    status: 404,
    description: 'Question non trouvée.',
  })
  async remove(@Param('id') id: string) {
    const result = await this.questionsService.remove(id);
    this.metricsService.incrementQuestions('remove');
    return result;
  }
}

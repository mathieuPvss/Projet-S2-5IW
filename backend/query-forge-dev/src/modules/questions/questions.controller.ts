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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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

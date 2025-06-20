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

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle question' })
  @ApiResponse({
    status: 201,
    description: 'La question a été créée avec succès.',
    type: Question,
  })
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les questions' })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les questions.',
    type: [Question],
  })
  findAll() {
    return this.questionsService.findAll();
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
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
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
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, updateQuestionDto);
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
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}

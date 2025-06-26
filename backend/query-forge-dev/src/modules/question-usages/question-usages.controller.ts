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

@ApiTags('question-usages')
@Controller('question-usages')
export class QuestionUsagesController {
  constructor(private readonly questionUsagesService: QuestionUsagesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle utilisation de question' })
  @ApiResponse({
    status: 201,
    description: "L'utilisation de question a été créée avec succès.",
    type: QuestionUsage,
  })
  create(@Body() createQuestionUsageDto: CreateQuestionUsageDto) {
    return this.questionUsagesService.create(createQuestionUsageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les utilisations de questions' })
  @ApiResponse({
    status: 200,
    description: 'Liste de toutes les utilisations de questions.',
    type: [QuestionUsage],
  })
  findAll() {
    return this.questionUsagesService.findAll();
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
  findOne(@Param('id') id: string) {
    return this.questionUsagesService.findOne(id);
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
  update(
    @Param('id') id: string,
    @Body() updateQuestionUsageDto: UpdateQuestionUsageDto,
  ) {
    return this.questionUsagesService.update(id, updateQuestionUsageDto);
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
  remove(@Param('id') id: string) {
    return this.questionUsagesService.remove(id);
  }
}

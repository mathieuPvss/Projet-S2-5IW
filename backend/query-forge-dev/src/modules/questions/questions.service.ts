import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { QuestionsRepository } from './questions.repository';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateQuestionWithUsagesDto } from './dto/create-question-with-usages.dto';
import { CsvQuestionRow } from './dto/import-questions-csv.dto';
import { Question } from './entities/question.entity';
import { ContentSourcesService } from '../content-sources/content-sources.service';
import { QuestionUsagesService } from '../question-usages/question-usages.service';
import { CreateQuestionUsageDto } from '../question-usages/dto/create-question-usage.dto';
import { QuestionUsageStatus } from '../question-usages/enums/question-usage-status.enum';
import * as csv from 'csv-parse/sync';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private readonly contentSourcesService: ContentSourcesService,
    private readonly questionUsagesService: QuestionUsagesService,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    return await this.questionsRepository.createQuestion(createQuestionDto);
  }

  async findAll(): Promise<Question[]> {
    return await this.questionsRepository.findAllQuestions();
  }

  async count(): Promise<number> {
    return await this.questionsRepository.countQuestions();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionsRepository.findOneQuestion(id);
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.questionsRepository.findOneQuestion(id);
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    return await this.questionsRepository.updateQuestion(id, updateQuestionDto);
  }

  async remove(id: string): Promise<void> {
    const question = await this.questionsRepository.findOneQuestion(id);
    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }
    await this.questionsRepository.deleteQuestion(id);
  }

  async createQuestionWithUsages(
    createQuestionDto: CreateQuestionWithUsagesDto,
  ): Promise<{ question: Question; usagesCreated: number }> {
    // Créer la question
    const question = await this.questionsRepository.createQuestion({
      technologie: createQuestionDto.technologie,
      category: createQuestionDto.category,
      content: createQuestionDto.content,
    });

    let usagesCreated = 0;

    // Créer les question_usage pour les content sources de type 'api' si demandé
    if (createQuestionDto.createUsages !== false) {
      const contentSources = await this.contentSourcesService.findAll();
      const apiSources = contentSources.filter(
        (source) => source.type === 'api',
      );

      for (const source of apiSources) {
        const createUsageDto: CreateQuestionUsageDto = {
          question_id: question.id,
          content_source_id: source.id,
          status: QuestionUsageStatus.PENDING,
          response_size: 0,
        };

        await this.questionUsagesService.create(createUsageDto);
        usagesCreated++;
      }
    }

    return { question, usagesCreated };
  }

  async importQuestionsFromCSV(csvContent: string): Promise<{
    questionsCreated: number;
    usagesCreated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let questionsCreated = 0;
    let usagesCreated = 0;

    try {
      // Parser le CSV
      const records = csv.parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ',',
      });

      // Vérifier que le CSV a les bonnes colonnes
      if (records.length === 0) {
        throw new BadRequestException('Le fichier CSV est vide');
      }

      const firstRecord = records[0];
      const expectedColumns = ['technologie', 'category', 'content'];
      const actualColumns = Object.keys(firstRecord);

      // Vérifier que toutes les colonnes obligatoires sont présentes
      const missingColumns = expectedColumns.filter(
        (col) => !actualColumns.includes(col),
      );
      if (missingColumns.length > 0) {
        throw new BadRequestException(
          `Colonnes manquantes dans le CSV: ${missingColumns.join(', ')}. Colonnes attendues: ${expectedColumns.join(', ')}`,
        );
      }

      // Vérifier qu'il n'y a pas de colonnes supplémentaires
      const extraColumns = actualColumns.filter(
        (col) => !expectedColumns.includes(col),
      );
      if (extraColumns.length > 0) {
        throw new BadRequestException(
          `Colonnes supplémentaires détectées dans le CSV: ${extraColumns.join(', ')}. Seules les colonnes suivantes sont acceptées: ${expectedColumns.join(', ')}`,
        );
      }

      // Récupérer les content sources de type 'api' une seule fois
      const contentSources = await this.contentSourcesService.findAll();
      const apiSources = contentSources.filter(
        (source) => source.type === 'api',
      );

      // Traiter chaque ligne du CSV
      for (let i = 0; i < records.length; i++) {
        const record = records[i] as CsvQuestionRow;

        try {
          // Valider les données de la ligne
          if (!record.technologie || !record.category || !record.content) {
            errors.push(
              `Ligne ${i + 1}: Tous les champs (technologie, category, content) sont obligatoires`,
            );
            continue;
          }

          // Créer la question
          const question = await this.questionsRepository.createQuestion({
            technologie: record.technologie.trim(),
            category: record.category.trim(),
            content: record.content.trim(),
          });

          questionsCreated++;

          // Créer les question_usage pour les content sources de type 'api'
          for (const source of apiSources) {
            const createUsageDto: CreateQuestionUsageDto = {
              question_id: question.id,
              content_source_id: source.id,
              status: QuestionUsageStatus.PENDING,
              response_size: 0,
            };

            await this.questionUsagesService.create(createUsageDto);
            usagesCreated++;
          }
        } catch (error) {
          errors.push(`Ligne ${i + 1}: ${error.message}`);
        }
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Erreur lors du traitement du CSV: ${error.message}`,
      );
    }

    return { questionsCreated, usagesCreated, errors };
  }
}

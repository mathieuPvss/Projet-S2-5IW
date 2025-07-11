import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { CreateReportDto, UpdateReportDto } from './dto';
import { Client } from '@elastic/elasticsearch';
import { ReportStatus } from './enums/report-status.enum';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  private readonly elasticsearchClient: Client;
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly dataSource: DataSource,
  ) {
    this.elasticsearchClient = new Client({
      node: process.env.ELASTICSEARCH_HOSTS || 'http://elasticsearch:9200',
    });
  }

  async create(createReportDto: CreateReportDto) {
    return await this.reportsRepository.createReport(createReportDto);
  }

  async findAll() {
    return await this.reportsRepository.findAllReports();
  }

  async findOne(id: string) {
    const report = await this.reportsRepository.findOneReport(id);
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }
    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    const report = await this.reportsRepository.findOneReport(id);
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }
    return await this.reportsRepository.updateReport(id, updateReportDto);
  }

  /**
   * Mets à jour le statut de plusieurs rapports et supprime les documents associés sur Elasticsearch.
   * @param report_ids - Array of report IDs to update.
   * @param status - New status to set for the reports.
   * @returns Updated reports.
   * @throws NotFoundException if any report ID is not found.
   * @throws InternalServerErrorException if the operation fails.
   */
  async updateBatchStatus(report_ids: string[], status: ReportStatus) {
    if (!report_ids || report_ids.length === 0) {
      throw new NotFoundException(
        'Aucun ID de rapport fourni pour la mise à jour.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Vérification des IDs de rapports
      const reports = await this.reportsRepository.findByIds(report_ids);
      if (!reports || reports.length < report_ids.length) {
        throw new NotFoundException(
          `Plusieurs signalements non trouvés "${report_ids.join(', ')}"`,
        );
      }

      // Récupération des IDs de documents distincts
      const distinctDocumentIds = [
        ...new Set(reports.map((report) => report.document_id)),
      ];
      const updatedReports = await this.reportsRepository.updateReportsStatus(
        status,
        report_ids,
      );

      if (distinctDocumentIds.length > 0 && status === ReportStatus.APPROVED) {
        await this.deleteDocumentsFromElasticsearch(distinctDocumentIds);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      return updatedReports;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour des rapports ou de la suppression des documents associés.',
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  private async deleteDocumentsFromElasticsearch(
    documentIds: string[],
  ): Promise<void> {
    try {
      const deletePromises = documentIds.map(async (documentId) => {
        try {
          return await this.elasticsearchClient.delete({
            index: 'contents',
            id: documentId,
          });
        } catch (error) {
          return null;
        }
      });

      await Promise.all(deletePromises);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException(
          'Impossible de se connecter à Elasticsearch pour supprimer les documents.',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    const report = await this.reportsRepository.findOneReport(id);
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }
    return await this.reportsRepository.deleteReport(id);
  }

  async getReportSource(sourceId: string) {
    try {
      console.log(
        `🔍 Connecting to Elasticsearch at: ${process.env.ELASTICSEARCH_HOSTS || 'http://elasticsearch:9200'}`,
      );

      const result = await this.elasticsearchClient.search({
        index: 'contents',
        query: {
          term: {
            _id: sourceId,
          },
        },
      });

      console.log(
        `📊 Résultat de la recherche pour la source ${sourceId} :`,
        result,
      );

      if (result.hits?.hits?.length > 0) {
        return result.hits.hits[0]._source;
      }

      throw new NotFoundException(`Source with ID "${sourceId}" not found`);
    } catch (error) {
      console.error('❌ Elasticsearch connection error:', error);
      if (error.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException(
          'Impossible de se connecter à Elasticsearch.',
        );
      }
      throw error;
    }
  }
}

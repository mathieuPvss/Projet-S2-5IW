import { DataSource } from 'typeorm';
import { QuestionUsage } from '../modules/question-usages/entities/question-usage.entity';
import { Question } from '../modules/questions/entities/question.entity';
import { ContentSource } from '../modules/content-sources/entities/content-source.entity';
import { QuestionUsageStatus } from '../modules/question-usages/enums/question-usage-status.enum';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'csv-parse/sync';

export const seedQuestionUsages = async (dataSource: DataSource) => {
  const questionUsageRepository = dataSource.getRepository(QuestionUsage);

  const csvFilePath = path.join(process.cwd(), 'question_usage.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const records = csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  let usagesCreated = 0;
  let usagesSkipped = 0;

  for (const record of records) {
    // Vérifier si l'usage existe déjà
    const existingUsage = await questionUsageRepository.findOne({
      where: { id: record.id },
    });

    if (!existingUsage) {
      const usage = new QuestionUsage();
      usage.id = record.id;
      usage.question_id = record.question_id;
      usage.content_source_id = record.content_source_id;
      usage.used_at = record.used_at ? new Date(record.used_at) : null;
      usage.status = record.status as QuestionUsageStatus;
      usage.response_size = parseInt(record.response_size);
      await questionUsageRepository.save(usage);
      usagesCreated++;
    } else {
      usagesSkipped++;
    }
  }

  console.log(
    `${usagesCreated} nouveaux usages de questions ont été importés avec succès.`,
  );
  console.log(`${usagesSkipped} usages de questions existants ont été ignorés.`);
};

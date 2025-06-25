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
  const questionRepository = dataSource.getRepository(Question);
  const contentSourceRepository = dataSource.getRepository(ContentSource);

  const csvFilePath = path.join(process.cwd(), 'tags_tiktok.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const tiktokTags = csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const questions = await questionRepository.find();
  const youtube = await contentSourceRepository.findOne({
    where: { name: 'youtube' },
  });
  const tiktok = await contentSourceRepository.findOne({
    where: { name: 'tiktok' },
  });

  if (!youtube) {
    throw new Error("La source YouTube n'a pas été trouvée");
  }

  if (!tiktok) {
    throw new Error("La source TikTok n'a pas été trouvée");
  }

  // Traitement pour YouTube
  let youtubeUsagesCreated = 0;
  for (const question of questions) {
    const existingUsage = await questionUsageRepository.findOne({
      where: {
        question_id: question.id,
        content_source_id: youtube.id,
      },
    });

    if (!existingUsage) {
      const usage = new QuestionUsage();
      usage.question_id = question.id;
      usage.content_source_id = youtube.id;
      usage.used_at = null;
      usage.status = QuestionUsageStatus.PENDING;
      usage.response_size = 0;
      await questionUsageRepository.save(usage);
      youtubeUsagesCreated++;
    }
  }

  // Traitement pour TikTok
  let tiktokUsagesCreated = 0;
  for (const record of tiktokTags) {
    const matchingQuestions = questions.filter(
      (question) =>
        question.technologie.toLowerCase() === record.tag.toLowerCase(),
    );

    for (const question of matchingQuestions) {
      const existingUsage = await questionUsageRepository.findOne({
        where: {
          question_id: question.id,
          content_source_id: tiktok.id,
        },
      });

      if (!existingUsage) {
        const usage = new QuestionUsage();
        usage.question_id = question.id;
        usage.content_source_id = tiktok.id;
        usage.used_at = null;
        usage.status = QuestionUsageStatus.PENDING;
        usage.response_size = 0;
        await questionUsageRepository.save(usage);
        tiktokUsagesCreated++;
      }
    }
  }

  console.log(
    `${youtubeUsagesCreated} question usages YouTube ont été créés avec succès.`,
  );
  console.log(
    `${tiktokUsagesCreated} question usages TikTok ont été créés avec succès.`,
  );
};

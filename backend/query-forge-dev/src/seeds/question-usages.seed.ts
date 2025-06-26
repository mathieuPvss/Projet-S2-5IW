import { DataSource } from 'typeorm';
import { QuestionUsage } from '../modules/question-usages/entities/question-usage.entity';
import { Question } from '../modules/questions/entities/question.entity';
import { ContentSource } from '../modules/content-sources/entities/content-source.entity';
import { QuestionUsageStatus } from '../modules/question-usages/enums/question-usage-status.enum';

export const seedQuestionUsages = async (dataSource: DataSource) => {
  const questionUsageRepository = dataSource.getRepository(QuestionUsage);
  const questionRepository = dataSource.getRepository(Question);
  const contentSourceRepository = dataSource.getRepository(ContentSource);

  const questions = await questionRepository.find();
  const youtube = await contentSourceRepository.findOne({
    where: { name: 'youtube' },
  });

  if (!youtube) {
    throw new Error("La source YouTube n'a pas été trouvée");
  }

  const questionUsages = questions.map((question) => {
    const usage = new QuestionUsage();
    usage.question_id = question.id;
    usage.content_source_id = youtube.id;
    usage.used_at = null;
    usage.status = QuestionUsageStatus.PENDING;
    usage.response_size = 0;
    return usage;
  });

  await questionUsageRepository.save(questionUsages);

  console.log(
    `${questionUsages.length} question usages ont été créés avec succès.`,
  );
};

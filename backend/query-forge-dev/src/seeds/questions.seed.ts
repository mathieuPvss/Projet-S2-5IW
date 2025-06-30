import { DataSource } from 'typeorm';
import { Question } from '../modules/questions/entities/question.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse/sync';

export const seedQuestions = async (dataSource: DataSource) => {
  const questionRepository = dataSource.getRepository(Question);

  const csvFilePath = path.join(process.cwd(), 'questions_programming.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const records = csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  let questionsCreated = 0;
  let questionsSkipped = 0;

  for (const record of records) {
    // Vérifier si la question existe déjà
    const existingQuestion = await questionRepository.findOne({
      where: {
        technologie: record.technologie,
        category: record.type,
        content: record.question,
      },
    });

    if (!existingQuestion) {
      const question = new Question();
      question.technologie = record.technologie;
      question.category = record.type;
      question.content = record.question;
      await questionRepository.save(question);
      questionsCreated++;
    } else {
      questionsSkipped++;
    }
  }

  console.log(
    `${questionsCreated} nouvelles questions ont été importées avec succès.`,
  );
  console.log(`${questionsSkipped} questions existantes ont été ignorées.`);
};

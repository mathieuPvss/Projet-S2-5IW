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

  const questions = records.map((record: any) => {
    const question = new Question();
    question.technologie = record.technologie;
    question.category = record.type;
    question.content = record.question;
    return question;
  });

  await questionRepository.save(questions);

  console.log(`${questions.length} questions ont été importées avec succès.`);
};

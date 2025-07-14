import { DataSource } from 'typeorm';
import {
  ContentSource,
  ScrapeConfig,
} from '../modules/content-sources/entities/content-source.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse/sync';

export const seedContentSources = async (dataSource: DataSource) => {
  const contentSourceRepository = dataSource.getRepository(ContentSource);

  // Lire le fichier CSV des content sources
  const csvFilePath = path.join(process.cwd(), 'content_source.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const records = csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  let sourcesCreated = 0;
  let sourcesSkipped = 0;

  for (const record of records) {
    // Vérifier si la source existe déjà
    const existingSource = await contentSourceRepository.findOne({
      where: { id: record.id },
    });

    if (!existingSource) {
      const contentSource = new ContentSource();
      contentSource.id = record.id;
      contentSource.name = record.name;
      contentSource.enabled = record.enabled === 'true';
      contentSource.type = record.type as 'scraper' | 'api';
      contentSource.config = record.config === 'null' ? null : JSON.parse(record.config);
      await contentSourceRepository.save(contentSource);
      sourcesCreated++;
    } else {
      sourcesSkipped++;
    }
  }

  // Ajouter StackOverflow avec sa configuration si pas déjà présent
  const stackOverflowExists = await contentSourceRepository.findOne({
    where: { name: 'stackoverflow' },
  });

  if (!stackOverflowExists) {
    const config: ScrapeConfig = {
      startUrl: 'https://stackoverflow.com/questions',
      followLinks: {
        selector: 'a.s-link[href*="/questions/"]',
        limit: 15,
      },
      scrapeFields: {
        title: 'h1.fs-headline1 a.question-hyperlink',
        description: '.js-post-body',
        tags: 'ul.js-post-tag-list-wrapper a.s-tag',
        publishDate: "time[itemprop='dateCreated']@datetime",
      },
      nextPageSelector: "a.s-pagination--item[rel='next']",
      maxPages: 10,
    };
    
    const stackoverflow = new ContentSource();
    stackoverflow.name = 'stackoverflow';
    stackoverflow.enabled = true;
    stackoverflow.type = 'scraper';
    stackoverflow.config = config;
    await contentSourceRepository.save(stackoverflow);
    console.log('Content source StackOverflow a été créée avec succès.');
    sourcesCreated++;
  } else {
    console.log('Content source StackOverflow existe déjà.');
    sourcesSkipped++;
  }

  console.log(`${sourcesCreated} nouvelles sources de contenu ont été importées avec succès.`);
  console.log(`${sourcesSkipped} sources de contenu existantes ont été ignorées.`);

  return;
};

import { DataSource } from 'typeorm';
import {
  ContentSource,
  ScrapeConfig,
} from '../modules/content-sources/entities/content-source.entity';

export const seedContentSources = async (dataSource: DataSource) => {
  const contentSourceRepository = dataSource.getRepository(ContentSource);

  // Vérifier et créer YouTube
  let youtube = await contentSourceRepository.findOne({
    where: { name: 'youtube' },
  });
  if (!youtube) {
    youtube = new ContentSource();
    youtube.name = 'youtube';
    youtube.enabled = true;
    youtube.type = 'api';
    youtube.config = null;
    await contentSourceRepository.save(youtube);
    console.log('Content source YouTube a été créée avec succès.');
  } else {
    console.log('Content source YouTube existe déjà.');
  }

  // Vérifier et créer TikTok
  let tiktok = await contentSourceRepository.findOne({
    where: { name: 'tiktok' },
  });
  if (!tiktok) {
    tiktok = new ContentSource();
    tiktok.name = 'tiktok';
    tiktok.enabled = true;
    tiktok.type = 'api';
    tiktok.config = null;
    await contentSourceRepository.save(tiktok);
    console.log('Content source TikTok a été créée avec succès.');
  } else {
    console.log('Content source TikTok existe déjà.');
  }

  // Vérifier et créer stackoverflow scraper
  let stackoverflow = await contentSourceRepository.findOne({
    where: { name: 'stackoverflow' },
  });
  if (!stackoverflow) {
    const config: ScrapeConfig = {
      startUrl: 'https://stackoverflow.com/questions',
      followLinks: {
        selector: 'a.s-link[href*="/questions/"]',
        limit: 15,
      },
      scrapeFields: {
        titre: 'h1.fs-headline1 a.question-hyperlink',
        description: '.js-post-body',
        tags: 'ul.js-post-tag-list-wrapper a.s-tag',
        publishDate: "time[itemprop='dateCreated']@datetime",
      },
      nextPageSelector: 'text:Next',
      maxPages: 250,
    };
    // avec cette config va prendre environ 3H pour avoir 3818 questions de stackoverflow :(
    stackoverflow = new ContentSource();
    stackoverflow.name = 'stackoverflow';
    stackoverflow.enabled = true;
    stackoverflow.type = 'scraper';
    stackoverflow.config = config;
    await contentSourceRepository.save(stackoverflow);
    console.log('Content source StackOverflow a été créée avec succès.');
  } else {
    console.log('Content source StackOverflow existe déjà.');
  }

  return;
};

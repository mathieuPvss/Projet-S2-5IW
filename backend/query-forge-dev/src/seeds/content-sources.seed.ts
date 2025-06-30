import { DataSource } from 'typeorm';
import { ContentSource } from '../modules/content-sources/entities/content-source.entity';

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
    await contentSourceRepository.save(tiktok);
    console.log('Content source TikTok a été créée avec succès.');
  } else {
    console.log('Content source TikTok existe déjà.');
  }

  return youtube;
};

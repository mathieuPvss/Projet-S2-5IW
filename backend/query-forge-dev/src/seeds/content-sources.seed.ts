import { DataSource } from 'typeorm';
import { ContentSource } from '../modules/content-sources/entities/content-source.entity';

export const seedContentSources = async (dataSource: DataSource) => {
  const contentSourceRepository = dataSource.getRepository(ContentSource);

  const youtube = new ContentSource();
  youtube.name = 'youtube';
  youtube.enabled = true;

  await contentSourceRepository.save(youtube);

  console.log('Content source YouTube a été créée avec succès.');

  return youtube;
};

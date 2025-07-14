import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export interface ScrapeConfig {
  startUrl: string;

  followLinks?: {
    selector: string;
    limit?: number;
  };

  scrapeFields: {
    [fieldName: string]: string;
  };

  nextPageSelector?: string;

  maxPages?: number;
}

@Entity()
export class ContentSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  enabled: boolean;

  @Column()
  type: 'scraper' | 'api';

  @Column({ type: 'jsonb', nullable: true })
  config: ScrapeConfig | null;
}

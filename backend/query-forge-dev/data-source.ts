import { DataSource } from 'typeorm';
import { typeOrmConfig } from './src/typeorm.config';

export const AppDataSource = new DataSource(typeOrmConfig);

// Ajout pour TypeORM CLI
export default AppDataSource;

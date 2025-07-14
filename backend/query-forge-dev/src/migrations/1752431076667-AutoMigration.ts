import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1752431076667 implements MigrationInterface {
  name = 'AutoMigration1752431076667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "passwordExpiresAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "passwordExpiresAt"`,
    );
  }
}

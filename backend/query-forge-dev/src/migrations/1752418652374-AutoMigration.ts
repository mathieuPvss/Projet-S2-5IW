import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1752418652374 implements MigrationInterface {
  name = 'AutoMigration1752418652374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "verified" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verified"`);
  }
}

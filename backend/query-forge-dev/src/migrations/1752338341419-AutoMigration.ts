import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1752338341419 implements MigrationInterface {
    name = 'AutoMigration1752338341419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document_id" character varying NOT NULL, "description" text NOT NULL, "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "user_id" uuid, CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "content_source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "enabled" boolean NOT NULL, "type" character varying NOT NULL, "config" jsonb, CONSTRAINT "PK_79d3b67c9082d4da24a607ce387" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "technologie" character varying NOT NULL, "category" character varying NOT NULL, "content" character varying NOT NULL, CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."question_usage_status_enum" AS ENUM('pending', 'success', 'error')`);
        await queryRunner.query(`CREATE TABLE "question_usage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "content_source_id" uuid NOT NULL, "used_at" TIMESTAMP, "status" "public"."question_usage_status_enum" NOT NULL DEFAULT 'pending', "response_size" integer NOT NULL, CONSTRAINT "PK_6e5b946e2e19392b8d7dfbc4325" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_ca7a21eb95ca4625bd5eaef7e0c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_usage" ADD CONSTRAINT "FK_9a12a3e9806d2589ea0a9a992f0" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_usage" ADD CONSTRAINT "FK_ef185440d3b671e19877da2df98" FOREIGN KEY ("content_source_id") REFERENCES "content_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_usage" DROP CONSTRAINT "FK_ef185440d3b671e19877da2df98"`);
        await queryRunner.query(`ALTER TABLE "question_usage" DROP CONSTRAINT "FK_9a12a3e9806d2589ea0a9a992f0"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_ca7a21eb95ca4625bd5eaef7e0c"`);
        await queryRunner.query(`DROP TABLE "question_usage"`);
        await queryRunner.query(`DROP TYPE "public"."question_usage_status_enum"`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`DROP TABLE "content_source"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "reports"`);
    }

}

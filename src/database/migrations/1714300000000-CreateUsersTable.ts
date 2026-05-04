import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1714300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('buyer', 'admin', 'superadmin')
    `);

    await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM ('pending', 'active', 'blocked', 'rejected')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"         UUID                NOT NULL DEFAULT uuid_generate_v4(),
        "email"      VARCHAR             NOT NULL,
        "password"   VARCHAR             NOT NULL,
        "role"       "user_role_enum"    NOT NULL,
        "status"     "user_status_enum"  NOT NULL DEFAULT 'pending',
        "cid"        VARCHAR                      DEFAULT NULL,
        "created_at" TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_users_id"    PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_cid"   UNIQUE ("cid")
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role"   ON "users" ("role")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_users_status"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}

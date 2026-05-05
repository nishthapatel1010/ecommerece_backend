import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockToProducts1777999999999 implements MigrationInterface {
  name = 'AddStockToProducts1777999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock" integer NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
  }
}

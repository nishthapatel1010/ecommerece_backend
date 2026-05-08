import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixProductSchema1778052600000 implements MigrationInterface {
  name = 'FixProductSchema1778052600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add image_public_id column
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "image_public_id" character varying`);

    // 2. Make sku UNIQUE
    // First, check if there's already a unique constraint or index on sku
    // To be safe, we'll try to add it and catch if it exists, or use a specific name
    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "UQ_products_sku" UNIQUE ("sku")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "UQ_products_sku"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "image_public_id"`);
  }
}

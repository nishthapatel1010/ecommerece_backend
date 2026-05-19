import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDefaultStockTen1778233474618 implements MigrationInterface {
  name = 'SetDefaultStockTen1778233474618';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set stock to 10 for all existing products in the table
    await queryRunner.query(`UPDATE "products" SET "stock" = 10`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the stock back to 0 if rolled back
    await queryRunner.query(`UPDATE "products" SET "stock" = 0`);
  }
}

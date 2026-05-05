import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingProductPerformanceIndexes1777620361519 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    // AVAILABLE / STOCK FILTER INDEX
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_available ON products(available)
    `);

    //  COMPOSITE INDEX (SEARCH + FILTER PERFORMANCE)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_name 
      ON products(name)
    `);

    // UPC INDEX (external lookup / scraping matching)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_upc ON products(upc)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_available`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_name`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_upc`);
  }
}
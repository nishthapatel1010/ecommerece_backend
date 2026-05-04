import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingProductPerformanceIndexes1777620361519 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    // BRAND FILTER INDEX
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)
    `);

    // AVAILABLE / STOCK FILTER INDEX
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_available ON products(available)
    `);

    //  COMPOSITE INDEX (SEARCH + FILTER PERFORMANCE)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_name_brand 
      ON products(name, brand)
    `);

    // UPC INDEX (external lookup / scraping matching)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_products_upc ON products(upc)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_brand`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_available`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_name_brand`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_upc`);
  }
}
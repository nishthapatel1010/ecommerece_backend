import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1777611442382 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_number VARCHAR UNIQUE,
        sku VARCHAR,
        upc VARCHAR,
        name VARCHAR,
        image_url TEXT,
        size VARCHAR,
        case_unit INT,
        unit VARCHAR,
        base_price DECIMAL(10,2),
        break_qty INT,
        break_price DECIMAL(10,2),
        min_qty INT,
        available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_products_item_number ON products(item_number)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_item_number`);
    await queryRunner.query(`DROP TABLE IF EXISTS products`);
  }
}
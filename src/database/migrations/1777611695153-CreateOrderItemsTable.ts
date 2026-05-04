import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderItemsTable1777611695153 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        order_id UUID,
        product_id UUID,

        name VARCHAR,
        sku VARCHAR,
        price DECIMAL(10,2),

        qty INT,
        unit_price DECIMAL(10,2),
        total_price DECIMAL(10,2)
      )
    `);

    await queryRunner.query(`
      ALTER TABLE order_items
      ADD CONSTRAINT fk_order_items_order
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE order_items
      ADD CONSTRAINT fk_order_items_product
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    `);

    await queryRunner.query(`CREATE INDEX idx_order_items_order_id ON order_items(order_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_order_items_order_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS order_items`);
  }
}
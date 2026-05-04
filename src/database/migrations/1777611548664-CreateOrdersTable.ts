import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1777611548664 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id UUID NOT NULL,
        group_no VARCHAR,
        session_id VARCHAR UNIQUE,

        item_count INT,
        total_amount DECIMAL(10,2),

        bill_company VARCHAR,
        bill_address1 VARCHAR,
        bill_city VARCHAR,
        bill_state VARCHAR,
        bill_postalcode VARCHAR,
        bill_email VARCHAR,
        phone_number VARCHAR,

        ship_company VARCHAR,
        ship_address1 VARCHAR,
        ship_city VARCHAR,
        ship_state VARCHAR,
        ship_postalcode VARCHAR,

        shipping_method VARCHAR,
        session_note TEXT,

        status VARCHAR DEFAULT 'pending',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      ALTER TABLE orders
      ADD CONSTRAINT fk_orders_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`CREATE INDEX idx_orders_user_id ON orders(user_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_user_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders`);
  }
}
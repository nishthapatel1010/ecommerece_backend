import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1777611803038 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        //  PRODUCTS INDEXES
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_products_upc ON products(upc)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)
        `);


        //  ORDERS INDEXES
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_group_no ON orders(group_no)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id)
        `);


        //  ORDER ITEMS INDEXES
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP INDEX IF EXISTS idx_products_sku`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_products_upc`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_products_name`);

        await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_user_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_group_no`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_session_id`);

        await queryRunner.query(`DROP INDEX IF EXISTS idx_order_items_order_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_order_items_product_id`);
    }
}
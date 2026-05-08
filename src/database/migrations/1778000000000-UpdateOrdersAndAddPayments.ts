import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrdersAndAddPayments1778000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Update Orders Table
        await queryRunner.query(`
            ALTER TABLE "orders" 
            ADD COLUMN IF NOT EXISTS "payment_status" VARCHAR DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS "payment_method" VARCHAR DEFAULT 'COD',
            ADD COLUMN IF NOT EXISTS "tracking_number" VARCHAR,
            ADD COLUMN IF NOT EXISTS "courier_name" VARCHAR
        `);

        // 2. Create Payments Table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "payments" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "order_id" UUID NOT NULL UNIQUE,
                "amount" DECIMAL(10,2) NOT NULL,
                "method" VARCHAR NOT NULL DEFAULT 'COD',
                "status" VARCHAR NOT NULL DEFAULT 'pending',
                "reference" TEXT,
                "paid_at" TIMESTAMP,
                "collected_by" UUID,
                "transaction_id" VARCHAR,
                "gateway_name" VARCHAR,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "fk_payment_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
            )
        `);

        // 3. Create Order Timelines Table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "order_timelines" (
                "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "order_id" UUID NOT NULL,
                "status" VARCHAR NOT NULL,
                "note" TEXT,
                "performed_by" UUID,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "fk_timeline_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "order_timelines"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
        await queryRunner.query(`
            ALTER TABLE "orders" 
            DROP COLUMN IF EXISTS "payment_status",
            DROP COLUMN IF EXISTS "payment_method",
            DROP COLUMN IF EXISTS "tracking_number",
            DROP COLUMN IF EXISTS "courier_name"
        `);
    }
}

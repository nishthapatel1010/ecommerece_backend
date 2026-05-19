import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStockHistoryTable1683785400000 implements MigrationInterface {
    name = 'CreateStockHistoryTable1683785400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the enum type first
        await queryRunner.query(`CREATE TYPE "stock_history_type_enum" AS ENUM('SALE', 'RETURN', 'ADJUSTMENT', 'RESTOCK')`);
        
        // Create the stock_history table
        await queryRunner.query(`
            CREATE TABLE "stock_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "product_id" character varying NOT NULL, 
                "order_id" character varying, 
                "change" integer NOT NULL, 
                "resulting_stock" integer NOT NULL, 
                "type" "stock_history_type_enum" NOT NULL DEFAULT 'SALE', 
                "performed_by" character varying, 
                "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_stock_history_id" PRIMARY KEY ("id")
            )
        `);

        // Create index for fast lookups
        await queryRunner.query(`CREATE INDEX "idx_stock_history_product_id" ON "stock_history" ("product_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_stock_history_product_id"`);
        await queryRunner.query(`DROP TABLE "stock_history"`);
        await queryRunner.query(`DROP TYPE "stock_history_type_enum"`);
    }
}

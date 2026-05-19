import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFuzzySearchCapabilities1778233474617 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Enable the fuzzy matching extension (Crucial for "Ant" -> "Aunt")
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

        // 2. Add a GIN Index to the product name
        // This makes the 'similarity' and 'ILIKE' searches lightning fast
        // NOTE: If your table name is "products", change "product" to "products" below
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_product_name_trgm" 
            ON "products" 
            USING gin ("name" gin_trgm_ops);
        `);

        // 3. Set the global similarity threshold
        // 0.15 is the "Sweet Spot": 
        // Lower than 0.3 means it is more forgiving of typos (like "Ant")
        await queryRunner.query(`SET pg_trgm.similarity_threshold = 0.15;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Cleanup indexes if we roll back
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_name_trgm";`);
        // We keep the extension enabled as it doesn't hurt anything
    }
}
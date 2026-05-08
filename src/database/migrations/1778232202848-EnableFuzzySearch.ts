import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableFuzzySearch1778232202848 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Enable the fuzzy matching extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

        // 2. Optimize English text search to ignore casing and handle word stems
        await queryRunner.query(`
            ALTER TEXT SEARCH CONFIGURATION english 
            ALTER MAPPING FOR word, asciiword 
            WITH simple, english_stem;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // We generally don't drop extensions in 'down' migrations 
        // to avoid breaking other features, but you can if needed:
        // await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm;`);
    }
}
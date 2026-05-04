import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthTokensTable1777455721300 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE auth_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                refresh_token TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await queryRunner.query(`
            ALTER TABLE auth_tokens
            ADD CONSTRAINT fk_auth_tokens_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);

        await queryRunner.query(`CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id)`);
        await queryRunner.query(`CREATE INDEX idx_auth_tokens_refresh_token ON auth_tokens(refresh_token)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_auth_tokens_refresh_token`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_auth_tokens_user_id`);
        await queryRunner.query(`DROP TABLE IF EXISTS auth_tokens`);
    }

}

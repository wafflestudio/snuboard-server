import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueConstraints1727682376978 implements MigrationInterface {
    name = 'addUniqueConstraints1727682376978';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Create a temporary table with the IDs of rows to keep (min_id for each name)
        await queryRunner.query(`
            CREATE TEMPORARY TABLE tmp_to_keep AS
            SELECT MIN(id) AS min_id, name
            FROM department
            GROUP BY name;
        `);

        // Step 2: Update foreign key references in related tables
        // Assuming there are tables named 'foreign_table_1', 'foreign_table_2' that reference 'department'

        // Update notice
        await queryRunner.query(`
            UPDATE notice f
            JOIN department d ON f.departmentId = d.id
            JOIN tmp_to_keep t ON d.name = t.name
            SET f.departmentId = t.min_id
            WHERE f.departmentId != t.min_id;
        `);

        // Step 3: Delete duplicate rows from department, keeping only the row with the lowest id for each name
        await queryRunner.query(`
            DELETE d
            FROM department d
            LEFT JOIN tmp_to_keep t ON d.id = t.min_id
            WHERE t.min_id IS NULL;
        `);

        // Step 4: Drop the temporary table
        await queryRunner.query(`
            DROP TEMPORARY TABLE IF EXISTS tmp_to_keep;
        `);

        await queryRunner.query(
            `ALTER TABLE \`department\` ADD UNIQUE INDEX \`IDX_471da4b90e96c1ebe0af221e07\` (\`name\`)`,
        );

        // Step 1: Create a temporary table with the IDs of rows to keep (min_id for each (name, departmentId))
        await queryRunner.query(`
            CREATE TEMPORARY TABLE tmp_tags_to_keep AS
            SELECT MIN(id) AS min_id, name, departmentId
            FROM tag
            GROUP BY name, departmentId;
        `);
        // Step 2: Update foreign key references in related tables
        // Assuming there are tables named 'foreign_table_1', 'foreign_table_2' that reference 'tag'

        // Example update for 'foreign_table_1'
        await queryRunner.query(`
            UPDATE notice_tag f
            JOIN tag t ON f.tagId = t.id
            JOIN tmp_tags_to_keep tmp ON t.name = tmp.name AND t.departmentId = tmp.departmentId
            SET f.tagId = tmp.min_id
            WHERE f.tagId != tmp.min_id;
        `);

        await queryRunner.query(`
            UPDATE user_tag f
            JOIN tag t ON f.tagId = t.id
            JOIN tmp_tags_to_keep tmp ON t.name = tmp.name AND t.departmentId = tmp.departmentId
            SET f.tagId = tmp.min_id
            WHERE f.tagId != tmp.min_id;
        `);

        // Step 3: Delete duplicate rows from 'tag', keeping only the row with the lowest id for each (name, departmentId)
        await queryRunner.query(`
            DELETE t
            FROM tag t
            LEFT JOIN tmp_tags_to_keep tmp ON t.id = tmp.min_id
            WHERE tmp.min_id IS NULL;
        `);

        // Step 4: Drop the temporary table
        await queryRunner.query(`
            DROP TEMPORARY TABLE IF EXISTS tmp_tags_to_keep;
        `);

        await queryRunner.query(`CREATE UNIQUE INDEX \`name_dept_idx\` ON \`tag\` (\`name\`, \`departmentId\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`name_dept_idx\` ON \`tag\``);

        await queryRunner.query(`ALTER TABLE \`department\` DROP INDEX \`IDX_471da4b90e96c1ebe0af221e07\``);

        // Note: The 'down' migration cannot easily restore deleted rows without a backup, as it is a destructive operation.
    }
}

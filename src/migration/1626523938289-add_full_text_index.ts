import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFullTextIndex1626523938289 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table notice add fulltext (contentText, title);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table notice drop INDEX contentText;');
  }
}

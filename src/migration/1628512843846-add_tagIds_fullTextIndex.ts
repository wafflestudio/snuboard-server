import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTagIdsFullTextIndex1628512843846 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table notice add fulltext (tagIds);');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table notice drop index tagIds;');
  }
}

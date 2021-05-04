import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLinkIndex1620136253006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table notice add index `notice_link_idx` (link(255))',
    );
    await queryRunner.query(
      'alter table file add index `file_link_idx` (link(255))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table notice drop index `notice_link_idx`');
    await queryRunner.query('alter table file drop index `file_link_idx`');
  }
}

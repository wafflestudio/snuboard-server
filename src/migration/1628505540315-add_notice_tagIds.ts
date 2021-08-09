import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNoticeTagIds1628505540315 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table notice add tagIds varchar(255) not null default ''",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table notice drop tagIds');
  }
}

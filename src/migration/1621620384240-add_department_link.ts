import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDepartmentLink1621620384240 implements MigrationInterface {
  name = 'addDepartmentLink1621620384240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table department add link varchar(255) not null default ''",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table department drop link');
  }
}

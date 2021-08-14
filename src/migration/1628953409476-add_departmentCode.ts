import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDepartmentCode1628953409476 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table department add code varchar(63) default '' not null;",
    );
    await queryRunner.query(
      "update department  set code = replace(replace( replace (to_base64(name),'+','Xx'), '=', 'Yy'),'/','Zz');",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table department drop code;');
  }
}

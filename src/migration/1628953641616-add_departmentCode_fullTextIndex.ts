import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDepartmentCodeFullTextIndex1628953641616
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table notice drop INDEX contentText;');
    await queryRunner.query(
      "alter table notice add departmentCode varchar(63) default '' not null;",
    );
    await queryRunner.query(
      'update notice, department set departmentCode = department.code where notice.departmentId = department.id;',
    );
    await queryRunner.query(
      'alter table notice add fulltext (contentText, title, departmentCode);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table notice drop INDEX contentText;');
    await queryRunner.query('alter table notice drop departmentCode;');
    await queryRunner.query(
      'alter table notice add fulltext (contentText, title);',
    );
  }
}

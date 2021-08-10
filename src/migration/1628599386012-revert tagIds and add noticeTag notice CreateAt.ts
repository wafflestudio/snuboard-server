import { MigrationInterface, QueryRunner } from 'typeorm';

export class revertTagIdsAndAddNoticeTagNoticeCreateAt1628599386012
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table notice drop index tagIds;');
    await queryRunner.query('alter table notice drop tagIds');

    await queryRunner.query(
      "alter table notice_tag add `noticeCreatedAt` timestamp NOT NULL default '1970-01-01 09:00:01'",
    );
    await queryRunner.query(
      'update notice_tag, notice set notice_tag.noticeCreatedAt = notice.createdAt where notice_tag.noticeId = notice.id;',
    );
    await queryRunner.query(
      'alter table notice_tag add index `notice_cursor` (`noticeCreatedAt`, `noticeId`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "alter table notice add tagIds varchar(255) not null default ''",
    );
    await queryRunner.query('alter table notice add fulltext (tagIds);');

    await queryRunner.query('alter table notice_tag drop `noticeCreatedAt`');
    // cannot remove index with FK
    // await queryRunner.query(
    //   'alter table notice_tag drop index `notice_cursor`',
    // );
  }
}

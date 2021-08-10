import { Notice } from '../src/notice/notice.entity';
import { NoticeTag, Tag } from '../src/department/department.entity';
import {
  Between,
  createConnection,
  getConnection,
  LessThan,
  MoreThanOrEqual,
} from 'typeorm';
import * as ormConfig from '../src/ormconfig';

async function add_notice_tag_createdAt() {
  console.log('add notice Tag createdAt start');

  const connection = await createConnection(ormConfig);
  const start = +(process.env.CREATED_AT_ADDER_START ?? 1);
  const end =
    +(process.env.CREATED_AT_ADDER_START ?? 1) +
    +(process.env.CREATED_AT_ADDER_OFFSET ?? 1);
  const noticeTags = await getConnection()
    .getRepository(NoticeTag)
    .find({
      where: {
        id: Between(start, end),
      },
      relations: ['notice'],
    });

  console.log(`noticeTags count : ${noticeTags.length}`);

  for (let i = 0; i < noticeTags.length; i++) {
    const noticeTag = noticeTags[i];

    noticeTag.noticeCreatedAt = noticeTag.notice.createdAt;
    await getConnection().getRepository(NoticeTag).save(noticeTag);
  }

  console.log('add noticeTag createdAt finished');
}

add_notice_tag_createdAt();

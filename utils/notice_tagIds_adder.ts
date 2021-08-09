import { Notice } from '../src/notice/notice.entity';
import { NoticeTag, Tag } from '../src/department/department.entity';
import { createConnection, getConnection } from 'typeorm';
import * as ormConfig from '../src/ormconfig';

async function add_notice_tagIds() {
  const connection = await createConnection(ormConfig);
  const notices = await getConnection().getRepository(Notice).find({});

  console.log('add notice tagIds start');
  console.log(`notices count : ${notices.length}`);
  for (let i = 0; i < notices.length; i++) {
    const notice = notices[i];

    const noticeTags = await getConnection()
      .getRepository(NoticeTag)
      .find({
        where: [{ notice }],
        relations: ['tag', 'notice'],
      });

    const tags = noticeTags.map((noticeTag) => {
      return `${noticeTag.tag.id}x`;
    });

    notice.tagIds = `${parseTagsToStringWithSeparator(tags, ' ')} `;
    await getConnection().getRepository(Notice).save(notice);
  }
  console.log('add notice tagIds finished');
}

export function parseTagsToStringWithSeparator(
  tags: string[],
  separator: string,
) {
  return tags.reduce((acc, cur, idx) => {
    if (idx === tags.length - 1) separator = '';
    return `${acc}${cur}${separator}`;
  }, '');
}

add_notice_tagIds();

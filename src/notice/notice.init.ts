import { Department, NoticeTag, Tag } from '../department/department.entity';
import { NOTICES, FILES } from './constansts';
import { Notice, File } from './notice.entity';
export const noticeInit = async (): Promise<void> => {
  for (const noticeData of NOTICES) {
    const {
      id,
      title,
      preview,
      content,
      createdAt,
      isPinned,
      link,
      cursor,
      department,
      noticeTags,
    } = noticeData;

    let notice: Notice | undefined = await Notice.findOne(id);
    if (!notice) {
      const departmentObj = await Department.findOne(department);
      //const tags = await Promise.all(noticeTags.map((tagName)=> Tag.findOne({name:tagName,department:departmentObj})));
      if (departmentObj) {
        notice = Notice.create({
          id,
          title,
          preview,
          content,
          isPinned,
          link,
          cursor: cursor,
        });
        notice.createdAt = new Date(createdAt);
        notice.department = departmentObj;
        await Notice.save(notice);
      }
      noticeTags.map(async (tagName) => {
        const tag = await Tag.findOne({
          name: tagName,
          department: departmentObj,
        });
        NoticeTag.save(NoticeTag.create({ notice: notice, tag: tag }));
      });
    }
  }

  for (const fileData of FILES) {
    const { name, link, noticeId } = fileData;
    const notice = await Notice.findOne(noticeId);
    const file = await File.findOne({ name: name, notice: notice });
    if (!file) {
      File.save(File.create({ name: name, link: link, notice: notice }));
    }
  }
};

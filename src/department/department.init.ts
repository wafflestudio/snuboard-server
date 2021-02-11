import { DEPARTMENTS } from './constants';
import { Department, Tag } from './department.entity';

export const departmentInit = async (): Promise<void> => {
  for (const departmentData of DEPARTMENTS) {
    const { name, tags } = departmentData;

    let department: Department = await Department.findOne({ name });
    if (!department) {
      department = Department.create({ name });
      await Department.save(department);
    }

    for (const tagName of tags) {
      let tag: Tag = await Tag.findOne({ name: tagName, department });
      if (!tag) {
        tag = Tag.create({ name: tagName, department });
        await Tag.save(tag);
      }
    }
  }
};

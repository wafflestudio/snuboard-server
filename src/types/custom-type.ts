import { Request } from 'express';
import { User } from '../user/user.entity';
import { Department, Tag, UserTag } from '../department/department.entity';

export class Payload {
  username!: string;
  id!: number;
}

export interface UserRequest extends Request {
  user?: User;
}

export interface PreFollow {
  department: Department;
  tag: Tag;
  user: User;
  userTag: UserTag;
}
